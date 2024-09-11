#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createDoc;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var path = require('path');
var fs = require('fs');
var fileList = [];
// 查找文件
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

// 拷贝文件
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

// 获取文档列表
var getMenuList = function getMenuList(list) {
  // 完成菜单机构改造的部分菜单列表
  var menuList = [];
  // 获取所有父级菜单
  var dirList = [];
  // 获取所有文本菜单
  var textList = [];
  var parentList = list.filter(function (item) {
    return item.groupParent && item.groupParent !== item.group;
  });
  parentList.forEach(function (item) {
    var dirInfo = list.find(function (dir) {
      return dir.group === item.groupParent;
    });
    if (!dirInfo) {
      var isDir = dirList.find(function (dir) {
        return dir.group === item.groupParent;
      });
      if (isDir) return;
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
    if (item.groupParent && item.groupParent !== item.group) {
      newChildren.push(item);
    } else {
      newList.push(item);
    }
  });
  // 查询各个文件夹之间的从属关系，并返回最终的菜单列表
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
  return [].concat(menuList, _toConsumableArray(navList));
};

// 转换code
var _convertCode = function convertCode(code, label, type) {
  try {
    var obj = JSON.parse(code);
    var length = Object.keys(obj).length;
    var htmlStr = '';
    if (length === 0) {
      htmlStr = "<div class=\"start\">".concat(label ? '<span class="label">"' + label + '":</span>' : '').concat(type === 'array' ? '[ ],' : '{ },', "</div>");
      return htmlStr;
    }
    htmlStr = "<div class=\"start\">".concat(label ? '<span class="label">"' + label + '":</span>' : '').concat(type === 'array' ? '[' : '{', "</div>");
    var currentIndex = 0;
    var unit = ',';
    Object.keys(obj).forEach(function (key) {
      currentIndex++;
      if (currentIndex === length) {
        unit = '';
      }
      if (_typeof(obj[key]) === 'object') {
        htmlStr += "<div class=\"child\">";
        var _type = Array.isArray(obj[key]) ? 'array' : 'object';
        htmlStr += _convertCode(JSON.stringify(obj[key]), key, _type);
        htmlStr += "</div>";
      } else {
        htmlStr += "\n        <div class=\"option\">\n          <div class=\"label\">\"".concat(key, "\": </div>\n          <div class=\"value ").concat(_typeof(obj[key]), "\">").concat(typeof obj[key] !== 'string' ? obj[key] : JSON.stringify(obj[key])).concat(unit, "</div>\n        </div>\n      ");
      }
    });
    htmlStr += "<div class=\"end\">".concat(type === 'array' ? '],' : '},', "</div>");
    return htmlStr;
  } catch (err) {
    return code;
  }
};

// 创建文档
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
            obj.info.method = itemList[1].replace(/[\{\}]/g, '').toUpperCase();
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
              var codeStr = _convertCode(example[1]);
              var idx1 = codeStr.lastIndexOf(',');
              codeStr = codeStr.slice(0, idx1) + codeStr.slice(idx1 + 1);
              var idx2 = codeStr.lastIndexOf(',');
              codeStr = codeStr.slice(0, idx2) + codeStr.slice(idx2 + 1);
              obj.successExample = codeStr;
            }
            break;
          case '@apiFailExample':
            {
              var _example = item.split('Fail-Response:');
              var _codeStr = _convertCode(_example[1]);
              var _idx = _codeStr.lastIndexOf(',');
              _codeStr = _codeStr.slice(0, _idx) + _codeStr.slice(_idx + 1);
              var _idx2 = _codeStr.lastIndexOf(',');
              _codeStr = _codeStr.slice(0, _idx2) + _codeStr.slice(_idx2 + 1);
              obj.failExample = _codeStr;
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
    var orderList = [];
    if (apiBaseInfo.order && Array.isArray(apiBaseInfo.order)) {
      orderList = apiBaseInfo.order.filter(function (item) {
        return item;
      });
    }
    if (orderList.length) {
      objList.sort(function (a, b) {
        var keya = a.api_key || a.group;
        var keyb = b.api_key || b.group;
        var order = orderList.indexOf(keya);
        var order2 = orderList.indexOf(keyb);
        if (order !== -1 && order2 === -1) return -1;
        if (order === -1 && order2 !== -1) return 1;
        return order - order2;
      });
    }
    var menuList = getMenuList(objList);
    var sortList = menuList;
    if (orderList.length) {
      sortList = [];
      var list = [];
      menuList.forEach(function (item) {
        var key = item.api_key || item.group;
        var order = orderList.indexOf(key);
        if (order !== -1) {
          sortList[order] = item;
        } else {
          list.push(item);
        }
      });
      sortList = sortList.concat(list).filter(function (item) {
        return item;
      });
    }
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
      var id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      apiInfo.id = id;
      sortList.unshift(apiInfo);
    }
    fs.writeFileSync(textPath, JSON.stringify(sortList));
    // 将template目录下的文件复制到output目录下
    var templatePath = path.join(__dirname, './template');
    copyFolderContents(templatePath, outputPath);
    console.log('api文档生成成功');
  });
}