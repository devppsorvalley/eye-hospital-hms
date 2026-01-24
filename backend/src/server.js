import app from './app.js';
import { testConnection, closePool } from './config/db.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✅ HMS API running on http://localhost:${PORT}`);
      console.log(`📚 Base URL: http://localhost:${PORT}/api/v1\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n🔴 SIGTERM received, closing gracefully...');
      await closePool();
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
