module.exports = {
  apps: [{
    name: 'fitness-backend',
    script: './dist/server/server.js',
    cwd: '/var/www/Fitboard/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3011 
    }
  }]
};
