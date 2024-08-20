const path = require('path')
const fs = require('fs')

const fileList = []
const findFile = (filePath, callback, isContinue = false) => {
  const files = fs.readdirSync(filePath)
  files.forEach((file) => {
    const stats = fs.statSync(path.join(filePath, file))
    if (stats.isFile()) {
      fileList.push(path.join(filePath, file))
    } else if (stats.isDirectory()) {
      findFile(path.join(filePath, file), callback, true)
    }
  })
  if (isContinue) return
  callback()
}

export default function createDoc(filePath, outputPath) {
  findFile(filePath, () => {
    const contentList = []
    fileList.forEach((file) => {
      const data = fs.readFileSync(file, 'utf-8')
      // 使用正则表达式匹配多行注释
      const commentRegex = /\/\*[\s\S]*?\*\//g
      const comments = data.match(commentRegex)
      if (Array.isArray(comments)) {
        contentList.push(...comments)
      }
    })
    const objList = []
    contentList.forEach((content) => {
      const obj = {
        group: '',
        groupName: '',
        groupParent: '',
        info: {
          title: '',
          desc: '',
          url: '',
          method: '',
        },
        params: [],
        returnParams: [],
        successExample: '',
        failExample: '',
      }
      const reg = /@api[^@]*(?=@|\*\/)/g
      const list = content.match(reg)
      list.forEach((option) => {
        const item = option.replaceAll('*', '')
        const itemList = item.split(' ')
        const type = itemList[0].trim()
        switch (type) {
          case '@api':
            obj.info.title = itemList[3].trim()
            obj.info.url = itemList[2].trim()
            obj.info.method = itemList[1].trim()
            break
          case '@apiDescription':
            obj.info.desc = itemList[1].trim()
            break
          case '@apiGroup':
            obj.group = itemList[1].trim()
            obj.groupName = itemList[2].trim()
            break
          case '@apiGroupParent':
            obj.groupParent = itemList[1].trim()
            break
          case '@apiParam':
            const require = /^\[.*\]$/.test(itemList[2])
            const params = {
              field: itemList[2],
              type: itemList[1],
              desc: itemList[3],
              require,
              values: itemList[4],
              default: itemList[5],
            }
            obj.params.push(params)
            break
          case '@apiReturnParam':
            obj.returnParams.push({
              type: itemList[1].trim(),
              filed: itemList[2].trim(),
              desc: itemList[3].trim(),
              sort: itemList[4].trim(),
            })
            break
          case '@apiSuccessExample':
            {
              const example = item.split('Success-Response:')
              obj.info.successExample = example[1]
            }
            break
          case '@apiFailExample':
            {
              const example = item.split('Fail-Response:')
              obj.info.failExample = example[1]
            }
            break
          default:
            break
        }
      })
      objList.push(obj)
    })
    console.log(objList, outputPath)
    // fs.writeFileSync('./comments.json', JSON.stringify(objList))
  })
}
