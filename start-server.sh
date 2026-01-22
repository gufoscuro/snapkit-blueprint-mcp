#!/bin/bash
cd "$(dirname "$0")"
exec node dist/src/index.js 2>/dev/null
