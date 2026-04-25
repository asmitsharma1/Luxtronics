/**
 * Express Server Setup with MongoDB
 * Main server file that integrates all services
 */

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeMongoDB, disconnectMongoDB } from './db/mongodb';
import { createProductRoutes } from './routes/products';

// Load environment variables
dotenv.config();

interface ServerConfig {
  port?: number;
  corsOrigin?: string | string[];
}

export async function setupServer(config: ServerConfig = {}): Promise<Express> {
  const port = config.port || parseInt(process.env.PORT || '3001');
  const corsOrigin = config.corsOrigin || process.env.CORS_ORIGIN || 'http://localhost:5173';

  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Initialize MongoDB
  try {
    console.log('🔄 Initializing MongoDB...');
    const db = await initializeMongoDB();
    console.log('✅ MongoDB initialized successfully!');

    // Register API routes
    const productRoutes = createProductRoutes(db);
    app.use('/api', productRoutes);
  } catch (error) {
    console.error('❌ Failed to initialize MongoDB:', error);
    throw error;
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  });

  // Start server
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(async () => {
      await disconnectMongoDB();
      console.log('✅ Server shut down');
      process.exit(0);
    });
  });

  return app;
}

// Start server if this file is run directly
if (process.argv[1].endsWith("index.ts")) {
  setupServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default setupServer;
