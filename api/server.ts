/**
 * local server entry file, for local development
 * Updated to fix wallet type conversion issues
 */
import app from './app.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log('Wallet type conversion fixes applied - Port 3005');
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;