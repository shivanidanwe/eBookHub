import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`  eBookHub Server Running`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  API Health: http://localhost:${config.port}/api/health`);
  console.log(`  Swagger Docs: http://localhost:${config.port}/api/docs`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    process.exit(0);
  });
});
