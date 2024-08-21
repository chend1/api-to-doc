const path = require('path')
import createDoc from "./index.js";

const args = process.argv.slice(2)

const currentDir = __dirname
const rootDir = path.resolve(currentDir, '..')
const filePath = path.join(rootDir, args[1])
const outputPath = path.join(rootDir, args[3])
console.log(filePath, outputPath, rootDir)
createDoc(filePath, outputPath)
