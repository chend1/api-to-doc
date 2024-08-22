#!/usr/bin/env node
"use strict";

var _index = _interopRequireDefault(require("./index.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var path = require('path');
var args = process.argv.slice(2);
var rootDir = process.cwd();
var filePath = path.join(rootDir, args[1]);
var outputPath = path.join(rootDir, args[3]);
console.log(filePath, outputPath, rootDir);
(0, _index["default"])(filePath, outputPath);