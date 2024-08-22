#!/usr/bin/env node
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

function copyFolderContents(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyFolderContents(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

const getMenuList = (list) => {
  const menuList = []
  const dirList = []
  const textList = []
  list.forEach((item, index) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    item.id = id
    if (item.group) {
      const menu = dirList.find((dir) => dir.group === item.group)
      if (menu) {
        menu.children.push(item)
      } else {
        const id =
          Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
        item.id = id
        dirList.push({
          group: item.group,
          groupName: item.groupName,
          groupParent: item.groupParent,
          isDir: true,
          children: [item],
          id,
        })
      }
    } else {
      textList.push(item)
    }
  })
  textList.forEach((item) => {
    const menu = dirList.find((dir) => dir.group === item.groupParent)
    if (menu) {
      menu.children.push(item)
    } else {
      menuList.push(item)
    }
  })
  const newList = []
  const newChildren = []
  dirList.forEach((item) => {
    if (!item) return
    if (item.groupParent) {
      newChildren.push(item)
    } else {
      newList.push(item)
    }
  })
  function _findChildren(list, children, navList) {
    let menuList = []
    if (!navList) {
      menuList = list
    } else {
      menuList = navList
    }
    const newList = []
    const newChildren = []
    children.forEach((item) => {
      const menu = menuList.find((dir) => dir.group === item.groupParent)
      if (menu) {
        menu.children.push(item)
        newList.push(item)
      } else {
        newChildren.push(item)
      }
    })
    if (newChildren.length) {
      _findChildren(newList, newChildren, menuList)
    }
    return menuList
  }
  const navList = _findChildren(newList, newChildren)
  console.log([...menuList, ...navList])
  return [...menuList, ...navList]
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
          apiUrl: '',
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
            console.log(require)
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
    const textPath = path.join(__dirname, './template/data.json')
    const menuList = getMenuList(objList)
    fs.writeFileSync(textPath, JSON.stringify(menuList))
    // 将template目录下的文件复制到output目录下
    const templatePath = path.join(__dirname, './template')
    copyFolderContents(templatePath, outputPath)
  })
}
