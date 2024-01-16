#!/bin/bash

set -e

npx asc ./examples/$1.ts --outFile ./build/$1.wasm --config ./examples/asconfig.wasi.json
wasmtime ./build/$1.wasm