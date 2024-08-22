# api 文档生成

api-to-doc 根据源代码中的 API 描述创建文档

## 安装

```bash
# npm 安装
npm install api-to-doc -D

# yarn 安装
yarn add api-to-doc -D
```

## 使用

在指定目录下的 js 文件中任意位置添加注释

```javascript
// 示例：
/**
 * @api {post}  /register  用户注册
 * @apiKey handlerRegister
 * @apiGroup base 基本信息
 * @apiGroupParent
 * @apiDescription 用户注册
 * @apiHeaderParam {String} [toekn] token
 * @apiParam {String} account 账号
 * @apiParam {String} password 密码
 * @apiParam {String} name 用户名
 * @apiParam {String} [email] 邮箱
 * @apiParam {String} [phone] 手机号
 * @apiParam {String} [avatar] 头像
 * @apiReturnParam {Object} data
 * @apiCode 400 请求错误
 * @apiCode 1005 登录过期
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "",
 *     }

```

在 package.jons 中添加下方 scripts，然后执行命令生成文档

```bash
apitodoc -i routers/ -o apidoc/
```

```javascript
// routers/ 为需要生成文档的目标地址
// apidoc/ 为文档输出地址
```

## 注释内容说明

### @api

- 接口基本信息
- 接收 3 个参数，以空格分隔开

```javascript
/**
 * @api {type}  url title
 */
```

| 参数   | 说明     |
| ------ | -------- |
| {type} | 请求方式 |
| url    | 请求地址 |
| title  | 请求标题 |

### @apiTitle

- 接口标题
- 接收 1 个参数，以空格分隔开

```javascript
/**
 * @apiKey title
 */
```

| 参数  | 说明                  |
| ----- | --------------------- |
| title | 比@api title 优先级高 |

### @apiKey

- 用于接口排序的 key
- 接收 1 个参数，以空格分隔开

```javascript
/**
 * @apiKey key
 */
```

| 参数 | 说明                      |
| ---- | ------------------------- |
| key  | 用于配置文件中 order 排序 |

### @apiDescription

- 接口描述
- 接收 1 个参数，以空格分隔开

```javascript
/**
 * @apiDescription description
 */
```

| 参数        | 说明     |
| ----------- | -------- |
| description | 文档描述 |

### @apiGroup

- 分组信息
- 接收 2 个参数，以空格分隔开

```javascript
/**
 * @apiGroup group groupName
 */
```

| 参数      | 说明                    |
| --------- | ----------------------- |
| group     | 根据 group 进行接口分组 |
| groupName | 分组名称                |

### @apiGroupParent

- 上级分组对应 @apiGroup group
- 接收 1 个参数，以空格分隔开

```javascript
/**
 * @apiGroupParent groupParent
 */
```

| 参数        | 说明                                  |
| ----------- | ------------------------------------- |
| groupParent | 根据 groupParent 判断是哪个分组的子集 |

### @apiHeaderParam

- 请求头参数
- 接收 5 个参数，以空格分隔开

```javascript
/**
 * @apiHeaderParam type [field] desc values default
 */
```

| 参数    | 说明               |
| ------- | ------------------ |
| type    | 参数类型           |
| field   | 字段，加[]表示必填 |
| desc    | 说明               |
| values  | 可选值             |
| default | 默认值             |

### @apiParam

- 接口参数
- 接收 5 个参数，以空格分隔开

```javascript
/**
 * @apiParam type [field] desc values default
 */
```

| 参数    | 说明               |
| ------- | ------------------ |
| type    | 参数类型           |
| field   | 字段，加[]表示必填 |
| desc    | 说明               |
| values  | 可选值             |
| default | 默认值             |

### @apiReturnParam

- 返回参数
- 接收 4 个参数，以空格分隔开

```javascript
/**
 * @apiReturnParam type field desc sort
 */
```

| 参数  | 说明                             |
| ----- | -------------------------------- |
| type  | 参数类型                         |
| field | 字段                             |
| desc  | 说明                             |
| sort  | 返回字段层级，1: '+'，2: '++'... |

### @apiSuccessExample

- 接口请求成功示例
- 以 Success-Response:分隔开

```javascript
/**
 * @apiSuccessExample Success-Response:
 *       HTTP/1.1 200 OK
 *     {
 *       "token": "",
 *     }
 */
```

### @apiFailExample

- 接口请求失败示例
- 以 Fail-Response:分隔开

```javascript
/**
 * @apiFailExample Success-Response:
 *       HTTP/1.1 200 OK
 *     {
 *       "status": false,
 *       "code": 400
 *     }
 */
```

### @apiCode

- 返回参数
- 接收 2 个参数，以空格分隔开

```javascript
/**
 * @apiCode code desc
 */
```

| 参数 | 说明    |
| ---- | ------- |
| code | code 值 |
| desc | 说明    |

### @apiRemark

- 接口请求失败示例
- 接收 1 个参数，以空格分隔开

```javascript
/**
 * @apiRemark remark
 */
```

| 参数   | 说明         |
| ------ | ------------ |
| remark | 接口备注信息 |
