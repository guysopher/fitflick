import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db, users } from './db'
import { eq } from 'drizzle-orm'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
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
          }
        } catch (error) {
          console.error('Error syncing user with database:', error);
          // Don't block sign in if database sync fails
        }
      }
      return true;
    },
    async session({ session, token }) {
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
          }
        } catch (error) {
          console.error('Error fetching user data from database:', error);
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