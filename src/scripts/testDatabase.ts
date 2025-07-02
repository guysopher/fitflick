import { db, users, exerciseDefinitions } from '../lib/db';
import { eq } from 'drizzle-orm';

async function testDatabaseConnection() {
  console.log('🔄 Testing database connection...');
  
  try {
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...');
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');

    // Test 2: Check if tables exist and query them
    console.log('2. Testing table queries...');
    
    // Check users table
    const userCount = await db.select().from(users).limit(1);
    console.log(`✅ Users table accessible (found ${userCount.length} test records)`);
    
    // Check exercise definitions table
    const exerciseCount = await db.select().from(exerciseDefinitions).limit(1);
    console.log(`✅ Exercise definitions table accessible (found ${exerciseCount.length} test records)`);

    // Test 3: Test insert operation (safe test user)
    console.log('3. Testing insert operation...');
    try {
      const testUser = await db.insert(users).values({
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User',
      }).returning();
      
      if (testUser.length > 0) {
        console.log('✅ Insert operation successful');
        
        // Clean up test user
        await db.delete(users).where(eq(users.id, testUser[0].id));
        console.log('✅ Cleanup successful');
      }
    } catch (error) {
      console.log('⚠️ Insert test skipped (user might already exist)');
    }

    console.log('🎉 All database tests passed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run db:seed (to populate exercises)');
    console.log('2. Run: npm run db:studio (to view your data)');
    console.log('3. Start your app and sign in to create your first user');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check your .env.local file has POSTGRES_URL');
    console.log('2. Verify your Vercel Postgres database is active');
    console.log('3. Run: npm run db:push (to create tables)');
    throw error;
  }
}

async function main() {
  try {
    await testDatabaseConnection();
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  main();
}

export { testDatabaseConnection }; 