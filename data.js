
const menuList = [
  {
    info: {
      title: '用户信息',
      desc: '获取用户信息',
      url: '/account/info',
      method: '{get}',
      successExample:
        '\r\n      HTTP/1.1 200 OK\r\n      {\r\n        "companyInfo": {\r\n          "id": 1,\r\n          "name": "测试公司",\r\n          "account": "",\r\n          "company_id": "",\r\n          "avatar": "",\r\n          "phone": "",\r\n          "role_id": "",\r\n          "role_level": "",\r\n          "show_company_id": "",\r\n         },\r\n        "info": {},\r\n        "menu": [],\r\n      }\r\n \r\n \r\n ',
    },
    params: [],
    returnParams: [],
    successExample: '',
    failExample: '',
  },
  {
    id: 1,
    group: 'base',
    groupName: '基础数据',
    groupParent: 0,
    isDir: 1,
    children: [
      {
        info: {
          title: '',
          desc: '获取用户信息',
          url: '/account/info',
          method: '{get}',
          successExample:
            '\r\n      HTTP/1.1 200 OK\r\n      {\r\n        "companyInfo": {\r\n          "id": 1,\r\n          "name": "测试公司",\r\n          "account": "",\r\n          "company_id": "",\r\n          "avatar": "",\r\n          "phone": "",\r\n          "role_id": "",\r\n          "role_level": "",\r\n          "show_company_id": "",\r\n         },\r\n        "info": {},\r\n        "menu": [],\r\n      }\r\n \r\n \r\n ',
        },
        params: [],
        returnParams: [],
        successExample: '',
        failExample: '',
        id: 2,
      },
      {
        id: 3,
        group: 'base',
        groupName: '数据',
        groupParent: 0,
        isDir: 1,
        children: [
          {
            id: 10,
            group: 'base',
            groupName: '基础数据',
            groupParent: 0,
            isDir: 1,
            children: [
              {
                info: {
                  title: '',
                  desc: '获取用户信息',
                  url: '/account/info',
                  method: '{get}',
                  successExample:
                    '\r\n      HTTP/1.1 200 OK\r\n      {\r\n        "companyInfo": {\r\n          "id": 1,\r\n          "name": "测试公司",\r\n          "account": "",\r\n          "company_id": "",\r\n          "avatar": "",\r\n          "phone": "",\r\n          "role_id": "",\r\n          "role_level": "",\r\n          "show_company_id": "",\r\n         },\r\n        "info": {},\r\n        "menu": [],\r\n      }\r\n \r\n \r\n ',
                },
                params: [],
                returnParams: [],
                successExample: '',
                failExample: '',
                id: 2,
              },
              {
                info: {
                  title: '登录',
                  desc: '用户登录',
                  url: '/login',
                  method: '{post}',
                  successExample:
                    '\r\n      HTTP/1.1 200 OK\r\n      {\r\n        "token": "",\r\n      }\r\n \r\n ',
                },
                params: [
                  {
                    field: '[account]',
                    type: '{String}',
                    desc: '账号\r\n',
                    require: false,
                    values: '',
                    default: '',
                  },
                  {
                    field: 'password',
                    type: '{String}',
                    desc: '密码\r\n',
                    require: false,
                    values: '',
                    default: '',
                  },
                ],
                returnParams: [
                  {
                    type: '{Object}',
                    filed: 'status',
                    desc: '状态，1:成功，0:失败',
                    level: '1',
                  },
                ],
                successExample: '',
                failExample: '',
                id: 3,
              },
              {
                info: {
                  title: '用户注册',
                  desc: '用户注册',
                  url: '/register',
                  method: '{post}',
                },
                params: [
                  {
                    field: 'account',
                    type: '{String}',
                    desc: '账号\r\n',
                    require: false,
                    values: '',
                    default: '',
                  },
                  {
                    field: 'password',
                    type: '{String}',
                    desc: '密码\r\n',
                    require: false,
                    values: '',
                    default: '',
                  },
                  {
                    field: 'name',
                    type: '{String}',
                    desc: '用户名\r\n',
                    require: false,
                    values: '',
                    default: '',
                  },
                  {
                    field: '[email]',
                    type: '{String}',
                    desc: '邮箱\r\n',
                    require: true,
                    values: '',
                    default: '',
                  },
                  {
                    field: '[phone]',
                    type: '{String}',
                    desc: '手机号\r\n',
                    require: true,
                    values: '',
                    default: '',
                  },
                  {
                    field: '[avatar]',
                    type: '{String}',
                    desc: '头像\r\n',
                    require: true,
                    values: '\r\n',
                    default: '',
                  },
                ],
                returnParams: [],
                successExample: '',
                failExample: '',
                id: 4,
              },
            ],
          },
        ]
      }
    ],
  },
]