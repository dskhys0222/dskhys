#!/bin/sh
# Simple healthcheck script for Docker container

wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
