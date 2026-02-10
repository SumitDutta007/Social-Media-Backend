// Quick Redis Connection Test
// Run: node test-redis.js

const redis = require('redis');

async function testRedis() {
  console.log('🔍 Testing Redis connection...\n');

  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', (err) => {
    console.error('❌ Redis Error:', err.message);
  });

  try {
    // Connect
    await client.connect();
    console.log('✅ Connected to Redis!\n');

    // Test SET
    await client.set('test_key', 'Hello Redis!', { EX: 60 });
    console.log('✅ SET test_key = "Hello Redis!"');

    // Test GET
    const value = await client.get('test_key');
    console.log('✅ GET test_key =', value);

    // Test TTL
    const ttl = await client.ttl('test_key');
    console.log('✅ TTL test_key =', ttl, 'seconds\n');

    // Test JSON
    const testData = { user: 'John', age: 30 };
    await client.set('test_json', JSON.stringify(testData), { EX: 60 });
    const jsonValue = JSON.parse(await client.get('test_json'));
    console.log('✅ JSON test:', jsonValue);

    // Cleanup
    await client.del('test_key');
    await client.del('test_json');
    console.log('\n✅ Cleanup complete');

    await client.quit();
    console.log('\n🎉 Redis is working perfectly!\n');
    console.log('You can now run: npm start');
    
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Make sure Redis is running: redis-cli ping');
    console.log('2. If using WSL: wsl sudo service redis-server start');
    console.log('3. If using Memurai: Check Windows Services');
    process.exit(1);
  }
}

testRedis();
