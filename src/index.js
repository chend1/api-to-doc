#!/usr/bin/env node
const path = require('path')
const fs = require('fs')

const fileList = []
// 查找文件
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

// 拷贝文件
function copyFolderContents(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest)
  }

  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)

    if (fs.statSync(srcPath).isDirectory()) {
      copyFolderContents(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  })
}

// 获取文档列表
const getMenuList = (list) => {
  // 完成菜单机构改造的部分菜单列表
  const menuList = []
  // 获取所有父级菜单
  const dirList = []
  // 获取所有文本菜单
  const textList = []
  const parentList = list.filter(
    (item) => item.groupParent && item.groupParent !== item.group
  )
  parentList.forEach((item) => {
    const dirInfo = list.find((dir) => dir.group === item.groupParent)
    if (!dirInfo) {
      const isDir = dirList.find((dir) => dir.group === item.groupParent)
      if (isDir) return
      const id =
        Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
      item.id = id
      dirList.push({
        group: item.groupParent,
        groupName: item.groupParentName || item.groupParent,
        groupParent: item.groupParent,
        isDir: true,
        children: [],
        id,
      })
    }
  })
  list.forEach((item, index) => {
    if (item.group === item.groupParent) {
      item.groupParent = null
    }
    const id =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    item.id = id
    if (item.group) {
      const menu = dirList.find((dir) => dir.group === item.group)
      if (menu) {
        menu.children.push(item)
      } else {
        const id =
          Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
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
    if (item.groupParent && item.groupParent !== item.group) {
      newChildren.push(item)
    } else {
      newList.push(item)
    }
  })
  // 查询各个文件夹之间的从属关系，并返回最终的菜单列表
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
  return [...menuList, ...navList]
}

// 转换code
const convertCode = (code, label, type) => {
  try {
    const obj = JSON.parse(code)
    const length = Object.keys(obj).length
    let htmlStr = ''
    if (length === 0) {
      htmlStr = `<div class="start">${
        label ? '<span class="label">"' + label + '":</span>' : ''
      }${type === 'array' ? '[ ],' : '{ },'}</div>`
      return htmlStr
    }
    htmlStr = `<div class="start">${
      label ? '<span class="label">"' + label + '":</span>' : ''
    }${type === 'array' ? '[' : '{'}</div>`

    let currentIndex = 0
    let unit = ','
    Object.keys(obj).forEach((key) => {
      currentIndex++
      if (currentIndex === length) {
        unit = ''
      }
      if (typeof obj[key] === 'object') {
        htmlStr += `<div class="child">`
        const type = Array.isArray(obj[key]) ? 'array' : 'object'
        htmlStr += convertCode(JSON.stringify(obj[key]), key, type)
        htmlStr += `</div>`
      } else {
        htmlStr += `
        <div class="option">
          <div class="label">"${key}": </div>
          <div class="value ${typeof obj[key]}">${
          typeof obj[key] !== 'string' ? obj[key] : JSON.stringify(obj[key])
        }${unit}</div>
        </div>
      `
      }
    })
    htmlStr += `<div class="end">${type === 'array' ? '],' : '},'}</div>`
    return htmlStr
  } catch (err) {
    return code
  }
}

// 创建文档
export default function createDoc(filePath, outputPath, apiBaseInfo) {
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
    let objList = []
    contentList.forEach((content) => {
      const obj = {
        group: '',
        groupName: '',
        groupParent: '',
        groupParentName: '',
        info: {
          title: '',
          desc: '',
          url: '',
          method: '',
          apiUrl: '',
        },
        params: [],
        returnParams: [],
        headerParsms: [],
        successExample: '',
        failExample: '',
        codeList: [],
        api_key: '',
        remark: '',
        title: '',
      }
      const reg = /@api[^@]*(?=@|\*\/)/g
      const list = content.match(reg)
      list.forEach((option) => {
        const item = option.replaceAll('*', '').replace(/\s+/g, ' ')
        const itemList = item.split(' ')
        const type = itemList[0]
        switch (type) {
          case '@api':
            obj.info.title = itemList[3]
            obj.info.url = itemList[2]
            obj.info.method = itemList[1].replace(/[\{\}]/g, '').toUpperCase()
            break
          case '@apiTitle':
            obj.title = itemList[1]
            break
          case '@apiKey':
            obj.api_key = itemList[1] || ''
            break
          case '@apiDescription':
            obj.info.desc = itemList[1] || ''
            break
          case '@apiGroup':
            obj.group = itemList[1] || ''
            obj.groupName = itemList[2] || ''
            break
          case '@apiGroupParent':
            obj.groupParent = itemList[1] || ''
            obj.groupParentName = itemList[2] || ''
            break
          case '@apiHeaderParam':
            {
              const require = /^\[.*\]$/.test(itemList[2])
              const params = {
                field: itemList[2].replace(/[\[\]]/g, ''),
                type: itemList[1].replace(/[\{\}]/g, ''),
                desc: itemList[3],
                require,
                values: itemList[4] || '',
                default: itemList[5] || '',
              }
              obj.headerParsms.push(params)
            }
            break
          case '@apiParam':
            const require = /^\[.*\]$/.test(itemList[2])
            const params = {
              field: itemList[2].replace(/[\[\]]/g, ''),
              type: itemList[1].replace(/[\{\}]/g, ''),
              desc: itemList[3],
              require,
              values: itemList[4] || '',
              default: itemList[5] || '',
            }
            obj.params.push(params)
            break
          case '@apiReturnParam':
            {
              const params = {
                type: itemList[1].replace(/[\{\}]/g, ''),
                filed: itemList[2].replace(/[\[\]]/g, ''),
                desc: itemList[3] || '',
                sort: itemList[4],
              }
              obj.returnParams.push(params)
            }
            break
          case '@apiSuccessExample':
            {
              const example = item.split('Success-Response:')
              let codeStr = convertCode(example[1])
              const idx1 = codeStr.lastIndexOf(',')
              codeStr = codeStr.slice(0, idx1) + codeStr.slice(idx1 + 1)
              const idx2 = codeStr.lastIndexOf(',')
              codeStr = codeStr.slice(0, idx2) + codeStr.slice(idx2 + 1)
              obj.successExample = codeStr
            }
            break
          case '@apiFailExample':
            {
              const example = item.split('Fail-Response:')
              let codeStr = convertCode(example[1])
              const idx1 = codeStr.lastIndexOf(',')
              codeStr = codeStr.slice(0, idx1) + codeStr.slice(idx1 + 1)
              const idx2 = codeStr.lastIndexOf(',')
              codeStr = codeStr.slice(0, idx2) + codeStr.slice(idx2 + 1)
              obj.failExample = codeStr
            }
            break
          case '@apiCode':
            {
              const params = {
                code: itemList[1],
                desc: itemList[2],
              }
              obj.codeList.push(params)
            }
            break
          case '@apiRemark':
            {
              obj.remark = itemList[1] || ''
            }
            break
          default:
            break
        }
      })
      objList.push(obj)
    })
    const textPath = path.join(__dirname, './template/data.json')
    let orderList = []
    if (apiBaseInfo.order && Array.isArray(apiBaseInfo.order)) {
      orderList = apiBaseInfo.order.filter((item) => item)
    }
    if (orderList.length) {
      objList.sort((a, b) => {
        const keya = a.api_key || a.group
        const keyb = b.api_key || b.group
        const order = orderList.indexOf(keya)
        const order2 = orderList.indexOf(keyb)
        if (order !== -1 && order2 === -1) return -1
        if (order === -1 && order2 !== -1) return 1
        return order - order2
      })
    }
    const menuList = getMenuList(objList)
    let sortList = menuList
    if (orderList.length) {
      sortList = []
      const list = []
      menuList.forEach((item) => {
        const key = item.api_key || item.group
        const order = orderList.indexOf(key)
        if (order !== -1) {
          sortList[order] = item
        } else {
          list.push(item)
        }
      })
      sortList = sortList.concat(list).filter((item) => item)
    }
    if (apiBaseInfo.url) {
      const apiInfo = {
        info: {
          title: apiBaseInfo.title,
          desc: apiBaseInfo.description,
          apiUrl: apiBaseInfo.url,
        },
        group: '',
        groupName: '',
        groupParent: '',
        params: [],
        returnParams: [],
        headerParsms: [],
        successExample: '',
        failExample: '',
        codeList: [],
        api_key: '',
        remark: '',
      }
      const id =
        Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
      apiInfo.id = id
      sortList.unshift(apiInfo)
    }
    fs.writeFileSync(textPath, JSON.stringify(sortList))
    // 将template目录下的文件复制到output目录下
    const templatePath = path.join(__dirname, './template')
    copyFolderContents(templatePath, outputPath)
    console.log('api文档生成成功')
  })
}
