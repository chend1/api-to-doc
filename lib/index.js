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
var getMenuList = function getMenuList(list) {
  var menuList = [];
  var dirList = [];
  var textList = [];
  list.forEach(function (item, index) {
    var id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    item.id = id;
    if (item.group) {
      var menu = dirList.find(function (dir) {
        return dir.group === item.group;
      });
      if (menu) {
        menu.children.push(item);
      } else {
        var _id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
  console.log([].concat(menuList, _toConsumableArray(navList)));
  return [].concat(menuList, _toConsumableArray(navList));
};
function createDoc(filePath, outputPath) {
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
        info: {
          title: '',
          desc: '',
          url: '',
          method: '',
          apiUrl: ''
        },
        params: [],
        returnParams: [],
        successExample: '',
        failExample: ''
      };
      var reg = /@api[^@]*(?=@|\*\/)/g;
      var list = content.match(reg);
      list.forEach(function (option) {
        var item = option.replaceAll('*', '');
        var itemList = item.split(' ');
        var type = itemList[0].trim();
        switch (type) {
          case '@api':
            obj.info.title = itemList[3].trim();
            obj.info.url = itemList[2].trim();
            obj.info.method = itemList[1].trim();
            break;
          case '@apiDescription':
            obj.info.desc = itemList[1].trim();
            break;
          case '@apiGroup':
            obj.group = itemList[1].trim();
            obj.groupName = itemList[2].trim();
            break;
          case '@apiGroupParent':
            obj.groupParent = itemList[1].trim();
            break;
          case '@apiParam':
            var _require = /^\[.*\]$/.test(itemList[2]);
            console.log(_require);
            var params = {
              field: itemList[2],
              type: itemList[1],
              desc: itemList[3],
              require: _require,
              values: itemList[4],
              "default": itemList[5]
            };
            obj.params.push(params);
            break;
          case '@apiReturnParam':
            obj.returnParams.push({
              type: itemList[1].trim(),
              filed: itemList[2].trim(),
              desc: itemList[3].trim(),
              sort: itemList[4].trim()
            });
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
          default:
            break;
        }
      });
      objList.push(obj);
    });
    // console.log(objList, outputPath)
    var textPath = path.join(__dirname, './template/data.json');
    var menuList = getMenuList(objList);
    fs.writeFileSync(textPath, JSON.stringify(menuList));
  });
}