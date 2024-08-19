const changeTemplate = (item) => {
  let template = ''
  if (item.isDir) {
    template = `
      <div class="dir" onclick="toggleList('item' + ${item.id})">
        <div class="title">
          <div class="icon">
            <img src="./assest/images/dir.png" alt="" />
          </div>
          <div class="name">${item.groupName}</div>
        </div>
      </div>
    `
    if (item.children && item.children.length) {
      const textChild = item.children.filter((child) => !child.isDir)
      const dirChild = item.children.filter((child) => child.isDir)
      template += `<div class="text">`
      textChild.forEach((child) => {
        const params = JSON.stringify(child)
        template += `
        <div class="title" onclick='menuClick(${params})'>
          <div class="icon">
            <img src="./assest/images/text.png" alt="" />
          </div>
          <div class="name">${child.info.title || '未命名'}</div>
        </div>
        `
      })
      template += `</div>`
      dirChild.forEach((child) => {
        template += `
        <div class="item" id="item${child.id}">
          ${changeTemplate(child)}
        </div>
        `
      })
    }
  } else {
    const params = JSON.stringify(item)
    template = `
    <div class="title" onclick='menuClick(${params})'>
      <div class="icon">
        <img src="./assest/images/text.png" alt="" />
      </div>
      <div class="name">${item.info.title || '未命名'}</div>
    </div>
    `
  }
  return template
}

const findText = (list) => {
  let apiInfo = {}
  for (let i = 0; i < list.length; i++) {
    console.log(123456)
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

const copyText = async (id) => {
  let text = document.getElementById(id).innerHTML
  try {
    await navigator.clipboard.writeText(text)
    console.log('Content copied to clipboard')
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}
