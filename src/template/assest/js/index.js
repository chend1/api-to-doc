import { changeTemplate, findText } from './util.js'
const apiObj = {}
const toggleList = (id) => {
  const navItem = document.getElementById(id)
  const className = navItem.classList.contains('active') ? 'active' : ''
  navItem.classList.toggle('active')
  const children = document.querySelectorAll(`#${id}>.text>.title`)
  navItem.style.setProperty(
    '--text-height',
    className === 'active' ? 0 + 'px' : children.length * 32 + 'px'
  )
}

const menuClick = (item) => {
  randerContent(item)
}

export const randerMenu = (menuList) => {
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
  const apiInfo = findText(menuList)
  console.log(apiInfo);
  randerContent(apiInfo)
  document.querySelector('.box .left .nav-list').innerHTML = menuTemplate
  setTimeout(() => {
    addEvent()
  })
}

export const randerContent = (content) => {
  let contentTemplate = ''
  contentTemplate += `
  <div class="api-title">${content.info.title || '未命名'}</div>
  `
  contentTemplate += `<div class="content">`
  let copy = ''
  if(navigator && navigator.clipboard && navigator.clipboard.writeText){
    copy = `<li class="copy" url="${content.info.url}">复制</li>`
  }
  contentTemplate += `
    <div class="api-option">
      <div class="label">简要描述：</div>
      <ul>
        <li>${content.info.desc}</li>
      </ul>
    </div>
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
  contentTemplate += `<div class="api-option">
    <div class="label">返回示例：</div>
      <div class="example">
        <div class="code">
          <pre>
            ${content.successExample}
          </pre>
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
          ${getTableTemplate(content.returnParams, true)}
        </table>
      </div>
    </div>`
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
  });
}

const getTableTemplate = (params, isReturn) => {
  let template = ''
  if (!isReturn) {
    params.forEach((item) => {
      template += `
        <tr>
          <td>${item.field}</td>
          <td>${item.type}</td>
          <td>${item.desc}</td>
          <td>${item.required ? '是' : '否'}</td>
          <td>${item.values}</td>
          <td>${item.default}</td>
        </tr>
      `
    })
  } else {
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
  return template
}


const addEvent = function () {
  const textList = document.querySelectorAll('.nav-list .text>.title')
  textList.forEach((item) => {
    item.addEventListener('click', () => {
      const menu = apiObj[item.id]
      textList.forEach((item) => {
        item.classList.remove('active')
      })
      item.classList.add('active')
      menuClick(menu)
    })
  })
  const dirList = document.querySelectorAll('.nav-list .dir')
  dirList.forEach((item) => {
    item.addEventListener('click', () => {
      toggleList(item.id)
    })
  })
}

const addCopyEvent = function () {
  const copyList = document.querySelectorAll('.copy')
  copyList && copyList.forEach((item) => {
    item.addEventListener('click', () => {
      const url = item.getAttribute('url')
      navigator.clipboard.writeText(url)
    })
  })
}