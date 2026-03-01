#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require('child_process');

const NOISE_TOKEN = '[baseline-browser-mapping]';

function pipeFiltered(stream, target) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.includes(NOISE_TOKEN)) {
        target.write(line + '\n');
      }
    }
  });
  stream.on('end', () => {
    if (buffer && !buffer.includes(NOISE_TOKEN)) {
      target.write(buffer + '\n');
    }
  });
}

const child = spawn('next', ['build'], {
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
  env: {
    ...process.env,
    BROWSERSLIST_IGNORE_OLD_DATA: '1',
    BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: '1',
  },
});

pipeFiltered(child.stdout, process.stdout);
pipeFiltered(child.stderr, process.stderr);

child.on('close', (code) => {
  process.exit(code ?? 1);
});
