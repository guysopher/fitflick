import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db, users } from './db'
import { eq } from 'drizzle-orm'
import { logConfigStatus, getConfigSummary } from './config-check'

// Log configuration status on startup
logConfigStatus();

// Get configuration summary
const configSummary = getConfigSummary();
const hasRequiredAuth = !configSummary.requiredMissing.includes('GOOGLE_CLIENT_ID') && 
                       !configSummary.requiredMissing.includes('GOOGLE_CLIENT_SECRET') &&
                       !configSummary.requiredMissing.includes('NEXTAUTH_SECRET');

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Skip database operations if missing required auth config
      if (!hasRequiredAuth) {
        console.warn('Skipping database operations due to missing authentication configuration');
        return true;
      }

      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists in database
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });

          if (!existingUser) {
            // Create new user in database
            await db.insert(users).values({
              id: user.id || crypto.randomUUID(),
              name: user.name,
              email: user.email,
              image: user.image,
            });
            console.log('Created new user:', user.email);
          } else {
            // Update existing user info if needed
            await db
              .update(users)
              .set({
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                updatedAt: new Date(),
              })
              .where(eq(users.email, user.email));
            console.log('Updated existing user:', user.email);
          }
        } catch (error) {
          console.error('Error syncing user with database:', error);
          console.error('Database error details:', error);
          // Don't block sign in if database sync fails
          // In production, you might want to queue this for retry
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Skip database operations if missing required auth config
      if (!hasRequiredAuth) {
        console.warn('Skipping database operations in session callback');
        return session;
      }

      if (session.user?.email) {
        try {
          // Fetch latest user data from database
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email),
          });
          
          if (dbUser) {
            // Add database fields to session
            session.user.id = dbUser.id;
            session.user.level = dbUser.level;
            session.user.coins = dbUser.coins;
            session.user.streak = dbUser.streak;
            session.user.totalWorkouts = dbUser.totalWorkouts;
            session.user.badges = dbUser.badges;
            session.user.waterCups = dbUser.waterCups;
            session.user.unlockedCostumes = dbUser.unlockedCostumes;
            session.user.currentCostume = dbUser.currentCostume;
          } else {
            console.warn('User not found in database:', session.user.email);
          }
        } catch (error) {
          console.error('Error fetching user data from database:', error);
          console.error('Session callback error details:', error);
          // Return session without database fields if there's an error
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
}) 