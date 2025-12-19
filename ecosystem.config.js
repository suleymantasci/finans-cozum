module.exports = {
  apps: [
    {
      name: 'finans-cozum-server',
      cwd: '/root/finans-cozum/server',
      script: 'node',
      args: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/root/finans-cozum/logs/server-error.log',
      out_file: '/root/finans-cozum/logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'finans-cozum-client',
      cwd: '/root/finans-cozum/client',
      script: 'npm',
      args: 'run start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/root/finans-cozum/logs/client-error.log',
      out_file: '/root/finans-cozum/logs/client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};

