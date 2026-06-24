/**
 * PM2 Ecosystem File for Hostinger Deployment
 * Prevents multiple processes and manages single instance efficiently
 */
module.exports = {
  apps: [{
    name: 'luxtronics-server',
    script: './server.js',
    instances: 1, // CRITICAL: Only 1 instance to avoid process limit
    exec_mode: 'fork', // Fork mode, not cluster
    max_memory_restart: '256M', // Restart if exceeds 256MB
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    // Avoid spawning too many restarts
    restart_delay: 4000,
    // Kill timeout
    kill_timeout: 3000,
    // Listen for ready signal
    wait_ready: false,
    // Resource limits
    node_args: '--max-old-space-size=256'
  }]
};
