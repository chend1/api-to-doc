#!/usr/bin/env node
"use strict";

var _index = _interopRequireDefault(require("./index.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var path = require('path');
var fs = require('fs');
var args = process.argv.slice(2);
var rootDir = process.cwd();
var filePath = path.join(rootDir, args[1]);
var outputPath = path.join(rootDir, args[3]);
var apitodoc = path.join(rootDir, 'apitodoc.json');
var apiBaseInfo = {};
if (fs.existsSync(apitodoc)) {
  // 读取文件内容
  apiBaseInfo = JSON.parse(fs.readFileSync(apitodoc, 'utf8'));
} else {
  apiBaseInfo = {};
}
(0, _index["default"])(filePath, outputPath, apiBaseInfo);