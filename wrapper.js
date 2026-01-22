#!/usr/bin/env node

// Silence stderr from dotenv and other libraries
const originalStderrWrite = process.stderr.write;
process.stderr.write = function(chunk, encoding, callback) {
  // Silently ignore stderr during initialization
  if (typeof callback === 'function') callback();
  return true;
};

// Import and run the actual server
import('./dist/src/index.js').then(() => {
  // Re-enable stderr after server starts
  setTimeout(() => {
    process.stderr.write = originalStderrWrite;
  }, 1000);
});
