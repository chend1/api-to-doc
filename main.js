#!/usr/bin/env node

const path = require('path')
const fs = require('fs');
import createDoc from "./index.js";

const args = process.argv.slice(2)

const rootDir = process.cwd()
const filePath = path.join(rootDir, args[1])
const outputPath = path.join(rootDir, args[3])
const apitodoc = path.join(rootDir, 'apitodoc.json')
let apiBaseInfo = {};
if (fs.existsSync(apitodoc)) {
  // 读取文件内容
  apiBaseInfo = JSON.parse(fs.readFileSync(apitodoc, 'utf8'));
} else {
  apiBaseInfo = {}
}
createDoc(filePath, outputPath, apiBaseInfo)
