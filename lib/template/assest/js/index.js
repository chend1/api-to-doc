import { changeTemplate, findText } from './util.js'
const apiObj = {}
const toggleList = (id) => {
  const navItem = document.getElementById(id)
  const className = navItem.classList.contains('active') ? 'active' : ''
  const { height } = navItem.getBoundingClientRect()
  navItem.classList.toggle('active')
  navItem.style.transition = 'all .3s'
  if (className !== 'active') {
    navItem.style.height = 'auto'
    const { height } = navItem.getBoundingClientRect()
    navItem.style.height = '32px'
    navItem.getBoundingClientRect()
    navItem.style.height = height + 'px'
    setTimeout(() => {
      navItem.style.height = 'auto'
    }, 300)
  } else {
    navItem.style.height = height + 'px'
    navItem.getBoundingClientRect()
    navItem.style.height = '32px'
  }
}

const menuClick = (item) => {
  randerContent(item)
}
let localMenuList = []
// 渲染结构
export const rander = (menuList) => {
  const appTemplate = `
  <div class="left">
    <div class="search">
      <input type="text" id="search" placeholder="请输入内容" />
      <div class="btn" id="btn">搜索</div>
    </div>
    <div class="nav-list">
    </div>
  </div>
  <div class="right">
  </div>
  `
  document.querySelector('#app').innerHTML = appTemplate
  setTimeout(() => {
    randerMenu(menuList)
  })
}

// 渲染菜单
export const randerMenu = (menuList, isSearch) => {
  if (!isSearch) {
    localMenuList = menuList
  }
  let menuTemplate = ''
  const textList = menuList.filter((item) => !item.isDir)
  const dirList = menuList.filter((item) => item.isDir)
  if (textList.length) {
    menuTemplate += `<div class="text">`
    textList.forEach((item) => {
      menuTemplate += changeTemplate(item, apiObj)
    })
    menuTemplate += `</div>`
  }
  dirList.forEach((item) => {
    menuTemplate += `
      <div class="item" id="dir${item.id}">
        ${changeTemplate(item, apiObj)}
      </div>
      `
  })
  document.querySelector('.box .left .nav-list').innerHTML = menuTemplate
  setTimeout(() => {
    addEvent()
  })
  if (!isSearch) {
    const apiInfo = findText(menuList)
    randerContent(apiInfo)
  }
}

// 渲染内容
export const randerContent = (content) => {
  let contentTemplate = ''
  contentTemplate += `
  <div class="api-title">${
    content.title || content.info.title || '未命名'
  }</div>
  `
  contentTemplate += `<div class="content">`
  contentTemplate += `
    <div class="api-option">
      <div class="label">简要描述：</div>
      <ul>
        <li>${content.info.desc}</li>
      </ul>
    </div>
  `
  if (content.info.apiUrl) {
    let copy = ''
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      copy = `<li class="copy" url="${content.info.apiUrl}">复制</li>`
    }
    contentTemplate += `
      <div class="api-option">
        <div class="label">接口地址：</div>
        <ul>
          <li class="url" id="url">${content.info.apiUrl}</li>
          ${copy}
        </ul>
      </div>
    `
  }
  if (content.info.url) {
    let copy = ''
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      copy = `<li class="copy" url="${content.info.url}">复制</li>`
    }
    contentTemplate += `
      <div class="api-option">
        <div class="label">请求URL：</div>
        <ul>
          <li class="url" id="url">${content.info.url}</li>
          ${copy}
        </ul>
      </div>
      <div class="api-option">
        <div class="label">请求方式：</div>
        <ul>
          <li>${content.info.method}</li>
        </ul>
      </div>
    `
  }
  if (content.headerParsms && content.headerParsms.length) {
    contentTemplate += `<div class="api-option">
    <div class="label">请求头参数：</div>
      <div class="table">
        <table>
          <tr>
            <th>参数名称</th>
            <th>参数类型</th>
            <th>说明</th>
            <th>必填</th>
            <th>默认值</th>
            <th>可选值</th>
          </tr>
          ${getTableTemplate(content.headerParsms)}
        </table>
      </div>
    </div>`
  }
  if (content.params && content.params.length) {
    contentTemplate += `<div class="api-option">
    <div class="label">请求参数：</div>
      <div class="table">
        <table>
          <tr>
            <th>参数名称</th>
            <th>参数类型</th>
            <th>说明</th>
            <th>必填</th>
            <th>默认值</th>
            <th>可选值</th>
          </tr>
          ${getTableTemplate(content.params)}
        </table>
      </div>
    </div>`
  }
  contentTemplate += `<div class="api-option">
    <div class="label">返回示例：</div>
      <div class="example">
        <div class="code">
          ${content.successExample}
        </div>
      </div>
    </div>`
  contentTemplate += `<div class="api-option">
    <div class="label">返回参数说明：</div>
      <div class="table">
        <table>
          <tr>
            <th>参数名称</th>
            <th>参数类型</th>
            <th>说明</th>
          </tr>
          ${getTableTemplate(content.returnParams, 'return')}
        </table>
      </div>
    </div>`
  if (content.codeList && content.codeList.length) {
    contentTemplate += `<div class="api-option">
    <div class="label">错误代码code 类型说明：</div>
      <div class="table">
        <table>
          <tr>
            <th>code值</th>
            <th>说明</th>
          </tr>
          ${getTableTemplate(content.returnParams, 'code')}
        </table>
      </div>
    </div>`
  }
  if (content.remark) {
    contentTemplate += `
      <div class="api-option">
        <div class="label">备注：</div>
        <ul>
          <li>${content.remark}</li>
        </ul>
      </div>
    `
  }

  contentTemplate += `</div>`
  document.querySelector('.box .right').innerHTML = contentTemplate
  setTimeout(() => {
    addCopyEvent()
  })
}

// 查询菜单
const searchMenu = (menuList, keyword) => {
  if (!keyword) {
    return menuList
  }
  const _findText = (list) => {
    let result = []
    list.forEach((item) => {
      if (item.isDir) {
        let option = []
        if (
          item.groupName.indexOf(keyword) > -1 ||
          item.group.indexOf(keyword) > -1
        ) {
          option = [item]
        } else {
          if (item.children && item.children.length) {
            option = _findText(item.children)
          }
        }
        if (Array.isArray(option) && option.length) {
          result.push(...option)
        }
      } else {
        if (item.info.title.indexOf(keyword) > -1) {
          result.push(item)
        }
      }
    })
    return result
  }
  return _findText(menuList)
}
const searchMenuClick = () => {
  const keyword = document.querySelector('#search').value
  const menuList = searchMenu(localMenuList, keyword)
  // console.log('menuList', menuList)
  randerMenu(menuList, true)
}

const getTableTemplate = (params, type) => {
  let template = ''
  switch (type) {
    case 'code':
      {
        params.forEach((item) => {
          template += `
            <tr>
              <td>${item.code}</td>
              <td>${item.desc}</td>
            </tr>
          `
        })
      }
      break
    case 'return':
      {
        params.forEach((item) => {
          const level = parseInt(item.level)
          let unit = ''
          for (let i = 0; i < level; i++) {
            unit += '+'
          }
          template += `
            <tr>
              <td>${unit}${item.filed}</td>
              <td>${item.type}</td>
              <td>${item.desc}</td>
            </tr>
          `
        })
      }
      break
    default:
      {
        params.forEach((item) => {
          template += `
          <tr>
            <td>${item.field}</td>
            <td>${item.type}</td>
            <td>${item.desc}</td>
            <td>${item.require ? '是' : '否'}</td>
            <td>${item.values}</td>
            <td>${item.default}</td>
          </tr>
        `
        })
      }
      break
  }
  return template
}

const addEvent = function () {
  const btnEl = document.querySelector('#btn')
  btnEl.removeEventListener('click', searchMenuClick)
  btnEl.addEventListener('click', searchMenuClick)
  const textList = document.querySelectorAll('.nav-list .text>.title')
  textList.forEach((item) => {
    const fn = () => {
      const menu = apiObj[item.id]
      textList.forEach((item) => {
        item.classList.remove('active')
      })
      item.classList.add('active')
      menuClick(menu)
    }
    item.removeEventListener('click', fn)
    item.addEventListener('click', fn)
  })
  const dirList = document.querySelectorAll('.nav-list .dir')
  dirList.forEach((item) => {
    const fn = () => {
      toggleList(item.id)
    }
    item.removeEventListener('click', fn)
    item.addEventListener('click', fn)
  })
}

const addCopyEvent = function () {
  const copyList = document.querySelectorAll('.copy')
  copyList &&
    copyList.forEach((item) => {
      const fn = () => {
        const url = item.getAttribute('url')
        navigator.clipboard.writeText(url)
        const div = document.createElement('div')
        const span = document.createElement('span')
        span.innerText = '复制成功'
        div.classList.add('copy-box')
        div.appendChild(span)
        document.body.appendChild(div)
        setTimeout(() => {
          document.body.removeChild(div)
        }, 1500)
      }
      item.removeEventListener('click', fn)
      item.addEventListener('click', fn)
    })
}
