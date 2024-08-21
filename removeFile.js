const fs = require('fs')
const path = require('path')

const copyFile = (filePath, targetPath) => {
  fs.copyFile(filePath, targetPath, (err) => {
    // if (err) {
    //   console.error('复制文件失败：', err)
    // } else {
    //   console.log('文件已成功复制到：', targetPath)
    // }
  })
}

const findFile = (filePath) => {
  const files = fs.readdirSync(filePath)
  files.forEach((file) => {
    const stats = fs.statSync(path.join(filePath, file))
    if (stats.isFile()) {
      const fileUrl = path.join(filePath, file)
      const ext = path.extname(fileUrl)
      if (ext !== '.json') {
        const dirPath = filePath.replace('src', 'lib')
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
          // console.log('文件夹已创建：', dirPath)
        } else {
          // console.log('文件夹已存在：', dirPath)
        }
        const targetFilePath = fileUrl.replace('src', 'lib')
        copyFile(fileUrl, targetFilePath)
      }
    } else if (stats.isDirectory()) {
      findFile(path.join(filePath, file))
    }
  })
}
findFile(path.join(__dirname, './src/template'))
