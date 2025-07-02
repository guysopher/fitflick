import { NextRequest, NextResponse } from 'next/server';
import { db, users, NewUser, User } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET /api/users - Get current user data
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create or update user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body;

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    let user: User;

    if (existingUser) {
      // Update existing user
      const updatedUsers = await db
        .update(users)
        .set({
          name: name || existingUser.name,
          image: image || existingUser.image,
          updatedAt: new Date(),
        })
        .where(eq(users.email, session.user.email))
        .returning();
      
      user = updatedUsers[0];
    } else {
      // Create new user
      const newUser: NewUser = {
        id: session.user.id || crypto.randomUUID(),
        name: name || session.user.name,
        email: session.user.email,
        image: image || session.user.image,
      };

      const createdUsers = await db.insert(users).values(newUser).returning();
      user = createdUsers[0];
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users - Update user progress (coins, level, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      level, 
      coins, 
      streak, 
      totalWorkouts, 
      badges, 
      waterCups, 
      unlockedCostumes, 
      currentCostume 
    } = body;

    const updatedUsers = await db
      .update(users)
      .set({
        level,
        coins,
        streak,
        totalWorkouts,
        badges,
        waterCups,
        unlockedCostumes,
        currentCostume,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email))
      .returning();

    if (updatedUsers.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUsers[0] });
  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 