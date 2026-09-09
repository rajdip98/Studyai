'use strict';
const fs = require('fs');
const path = require('path');

// Tiny JSON-file store. One in-process write queue per file keeps concurrent
// requests from interleaving reads/writes of the same file (this app runs as
// a single Node process, so that's the only concurrency we need to guard).
const queues = new Map();

function enqueue(filePath, task) {
  const prior = queues.get(filePath) || Promise.resolve();
  const next = prior.then(task, task);
  queues.set(filePath, next.catch(() => {}));
  return next;
}

function readJsonSync(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

function writeJsonSync(filePath, data) {
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, filePath);
}

class JsonFileStore {
  constructor(filePath, fallback) {
    this.filePath = filePath;
    this.fallback = fallback;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (!fs.existsSync(filePath)) writeJsonSync(filePath, fallback);
  }

  read() {
    return enqueue(this.filePath, () => readJsonSync(this.filePath, this.fallback));
  }

  // `mutator` receives the current value and returns the new value.
  update(mutator) {
    return enqueue(this.filePath, () => {
      const current = readJsonSync(this.filePath, this.fallback);
      const next = mutator(current);
      writeJsonSync(this.filePath, next);
      return next;
    });
  }
}

module.exports = { JsonFileStore };
