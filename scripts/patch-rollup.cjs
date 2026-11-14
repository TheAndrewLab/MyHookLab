const fs = require('fs');
const path = require('path');

const nativeJsPath = path.resolve(__dirname, '../node_modules/rollup/dist/native.js');

if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  if (content.includes("require('@rollup/wasm-node');")) {
    content = content.replace("require('@rollup/wasm-node');", "require('@rollup/wasm-node/dist/native.js');");
    fs.writeFileSync(nativeJsPath, content, 'utf8');
    console.log('[patch-rollup] Patched rollup native fallback to @rollup/wasm-node/dist/native.js');
  }
}

