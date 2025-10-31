#!/bin/sh
# Simple healthcheck script for Docker container

node -e "
const http = require('http');
http.get('http://localhost:3000/health', (res) => {
  res.resume(); // Consume response data to free up memory
  process.exit(res.statusCode === 200 ? 0 : 1);
}).on('error', () => {
  process.exit(1);
});
"
