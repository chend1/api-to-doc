export const changeTemplate = (item, apiObj) => {
  let template = ''
  if (item.isDir) {
    template = `
      <div class="dir" id="dir${item.id}">
        <div class="title">
          <div class="icon">
            <img src="./assest/images/dir.png" alt="" />
          </div>
          <div class="name">${item.groupName || item.group}</div>
        </div>
      </div>
    `
    if (item.children && item.children.length) {
      const textChild = item.children.filter((child) => !child.isDir)
      const dirChild = item.children.filter((child) => child.isDir)
      if (textChild.length) {
        template += `<div class="text">`
        textChild.forEach((child) => {
          const params = child
          apiObj['nav' + child.id] = params
          template += `
        <div class="title" id="nav${child.id}">
          <div class="icon">
            <img src="./assest/images/text.png" alt="" />
          </div>
          <div class="name">${child.title || child.info.title || '未命名'}</div>
        </div>
        `
        })
        template += `</div>`
      }
      dirChild.forEach((child) => {
        template += `
        <div class="item" id="dir${child.id}">
          ${changeTemplate(child, apiObj)}
        </div>
        `
      })
    }
  } else {
    const params = item
    apiObj['nav' + item.id] = params
    template = `
    <div class="title" id="nav${item.id}">
      <div class="icon">
        <img src="./assest/images/text.png" alt="" />
      </div>
      <div class="name">${item.title || item.info.title || '未命名'}</div>
    </div>
    `
  }
  return template
}

export const findText = (list) => {
  let apiInfo = {}
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item.isDir) {
      if (item.children && item.children.length) {
        apiInfo = findText(item.children)
      }
    } else {
      apiInfo = item
      return apiInfo
    }
  }
  return apiInfo
}

export const readJson = async (url) => {
  const response = await fetch(url)
  const data = await response.json()
  return data
}
