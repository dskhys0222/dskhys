#!/bin/sh
# Simple healthcheck script for Docker container

node -e "
const http = require('http');
http.get('http://localhost:3000/health', (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
}).on('error', () => {
  process.exit(1);
});
"
