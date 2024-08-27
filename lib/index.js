#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createDoc;
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var path = require('path');
var fs = require('fs');
var fileList = [];
var _findFile = function findFile(filePath, callback) {
  var isContinue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var files = fs.readdirSync(filePath);
  files.forEach(function (file) {
    var stats = fs.statSync(path.join(filePath, file));
    if (stats.isFile()) {
      fileList.push(path.join(filePath, file));
    } else if (stats.isDirectory()) {
      _findFile(path.join(filePath, file), callback, true);
    }
  });
  if (isContinue) return;
  callback();
};
function copyFolderContents(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  fs.readdirSync(src).forEach(function (file) {
    var srcPath = path.join(src, file);
    var destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyFolderContents(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
var getMenuList = function getMenuList(list) {
  var menuList = [];
  var dirList = [];
  var textList = [];
  var parentList = list.filter(function (item) {
    return item.groupParent && item.groupParent !== item.group;
  });
  parentList.forEach(function (item) {
    var dirInfo = list.find(function (dir) {
      return dir.group === item.groupParent;
    });
    if (!dirInfo) {
      var id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      item.id = id;
      dirList.push({
        group: item.groupParent,
        groupName: item.groupParentName || item.groupParent,
        groupParent: item.groupParent,
        isDir: true,
        children: [],
        id: id
      });
    }
  });
  list.forEach(function (item, index) {
    if (item.group === item.groupParent) {
      item.groupParent = null;
    }
    var id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    item.id = id;
    if (item.group) {
      var menu = dirList.find(function (dir) {
        return dir.group === item.group;
      });
      if (menu) {
        menu.children.push(item);
      } else {
        var _id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        item.id = _id;
        dirList.push({
          group: item.group,
          groupName: item.groupName,
          groupParent: item.groupParent,
          isDir: true,
          children: [item],
          id: _id
        });
      }
    } else {
      textList.push(item);
    }
  });
  textList.forEach(function (item) {
    var menu = dirList.find(function (dir) {
      return dir.group === item.groupParent;
    });
    if (menu) {
      menu.children.push(item);
    } else {
      menuList.push(item);
    }
  });
  var newList = [];
  var newChildren = [];
  dirList.forEach(function (item) {
    if (!item) return;
    if (item.groupParent) {
      newChildren.push(item);
    } else {
      newList.push(item);
    }
  });
  function _findChildren(list, children, navList) {
    var menuList = [];
    if (!navList) {
      menuList = list;
    } else {
      menuList = navList;
    }
    var newList = [];
    var newChildren = [];
    children.forEach(function (item) {
      var menu = menuList.find(function (dir) {
        return dir.group === item.groupParent;
      });
      if (menu) {
        menu.children.push(item);
        newList.push(item);
      } else {
        newChildren.push(item);
      }
    });
    if (newChildren.length) {
      _findChildren(newList, newChildren, menuList);
    }
    return menuList;
  }
  var navList = _findChildren(newList, newChildren);
  // console.log([...menuList, ...navList])
  return [].concat(menuList, _toConsumableArray(navList));
};
function createDoc(filePath, outputPath, apiBaseInfo) {
  _findFile(filePath, function () {
    var contentList = [];
    fileList.forEach(function (file) {
      var data = fs.readFileSync(file, 'utf-8');
      // 使用正则表达式匹配多行注释
      var commentRegex = /\/\*[\s\S]*?\*\//g;
      var comments = data.match(commentRegex);
      if (Array.isArray(comments)) {
        contentList.push.apply(contentList, _toConsumableArray(comments));
      }
    });
    var objList = [];
    contentList.forEach(function (content) {
      var obj = {
        group: '',
        groupName: '',
        groupParent: '',
        groupParentName: '',
        info: {
          title: '',
          desc: '',
          url: '',
          method: '',
          apiUrl: ''
        },
        params: [],
        returnParams: [],
        headerParsms: [],
        successExample: '',
        failExample: '',
        codeList: [],
        api_key: '',
        remark: '',
        title: ''
      };
      var reg = /@api[^@]*(?=@|\*\/)/g;
      var list = content.match(reg);
      list.forEach(function (option) {
        var item = option.replaceAll('*', '').replace(/\s+/g, ' ');
        var itemList = item.split(' ');
        var type = itemList[0];
        switch (type) {
          case '@api':
            obj.info.title = itemList[3];
            obj.info.url = itemList[2];
            obj.info.method = itemList[1];
            break;
          case '@apiTitle':
            obj.title = itemList[1];
            break;
          case '@apiKey':
            obj.api_key = itemList[1] || '';
            break;
          case '@apiDescription':
            obj.info.desc = itemList[1] || '';
            break;
          case '@apiGroup':
            obj.group = itemList[1] || '';
            obj.groupName = itemList[2] || '';
            break;
          case '@apiGroupParent':
            obj.groupParent = itemList[1] || '';
            obj.groupParentName = itemList[2] || '';
            break;
          case '@apiHeaderParam':
            {
              var _require = /^\[.*\]$/.test(itemList[2]);
              var _params = {
                field: itemList[2].replace(/[\[\]]/g, ''),
                type: itemList[1].replace(/[\{\}]/g, ''),
                desc: itemList[3],
                require: _require,
                values: itemList[4] || '',
                "default": itemList[5] || ''
              };
              obj.headerParsms.push(_params);
            }
            break;
          case '@apiParam':
            var _require2 = /^\[.*\]$/.test(itemList[2]);
            var params = {
              field: itemList[2].replace(/[\[\]]/g, ''),
              type: itemList[1].replace(/[\{\}]/g, ''),
              desc: itemList[3],
              require: _require2,
              values: itemList[4] || '',
              "default": itemList[5] || ''
            };
            obj.params.push(params);
            break;
          case '@apiReturnParam':
            {
              var _params2 = {
                type: itemList[1].replace(/[\{\}]/g, ''),
                filed: itemList[2].replace(/[\[\]]/g, ''),
                desc: itemList[3] || '',
                sort: itemList[4]
              };
              obj.returnParams.push(_params2);
            }
            break;
          case '@apiSuccessExample':
            {
              var example = item.split('Success-Response:');
              obj.info.successExample = example[1];
            }
            break;
          case '@apiFailExample':
            {
              var _example = item.split('Fail-Response:');
              obj.info.failExample = _example[1];
            }
            break;
          case '@apiCode':
            {
              var _params3 = {
                code: itemList[1],
                desc: itemList[2]
              };
              obj.codeList.push(_params3);
            }
            break;
          case '@apiRemark':
            {
              obj.remark = itemList[1] || '';
            }
            break;
          default:
            break;
        }
      });
      objList.push(obj);
    });
    var textPath = path.join(__dirname, './template/data.json');
    if (apiBaseInfo.order && apiBaseInfo.order.length) {
      objList.sort(function (a, b) {
        var order = apiBaseInfo.order.indexOf(a.api_key);
        var order2 = apiBaseInfo.order.indexOf(b.api_key);
        if (order !== -1 && order2 === -1) return -1;
        if (order === -1 && order2 !== -1) return 1;
        return order - order2;
      });
    }
    var menuList = getMenuList(objList);
    if (apiBaseInfo.url) {
      var apiInfo = {
        info: {
          title: apiBaseInfo.title,
          desc: apiBaseInfo.description,
          apiUrl: apiBaseInfo.url
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
        remark: ''
      };
      menuList.unshift(apiInfo);
    }
    fs.writeFileSync(textPath, JSON.stringify(menuList));
    // 将template目录下的文件复制到output目录下
    var templatePath = path.join(__dirname, './template');
    copyFolderContents(templatePath, outputPath);
    console.log('api文档生成成功');
  });
}