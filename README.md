# Huoban api SDK for JavaScript

## 概述

Huoban api sdk for JavaScript是伙伴云表格为第三方开发者提供的JavaScript sdk包。开发者可以通过该sdk包进行简单的api调用请求。


## 运行环境
- Node(依赖axios https://github.com/mzabriskie/axios)
- Browser(依赖jQuery/axios)

## 安装方法
- 浏览器端script引用，nodejs require即可

## 快速使用

### 提供接口
- HB.component对象


### HB.component初始化，获得权限
```js
HB.api.init([tickteName], ticket)
//ticketName 您从伙伴获得的应用秘钥名称
//ticket 您从伙伴获得的应用秘钥字符串
```

### 返回结果处理

HB.component提供的接口返回返回数据分为两种：

* Delete类接口，接口返回null，如果没有Error，即可认为操作成功
* Put，Get，Post类接口，接口返回对应的数据，如果没有Error，即可认为操作成功。

### Example
#### 获得item具体信息
1. 初始化
2. 调用接口
```js
HB.api.init('Authorization',"Bearer r38MBx1yTQUC53louD5FlLinml06JakBIGDJnpeY001")
HB.api.getItem({
          item_id: 43998933
        }, log, log)
```
### 注意事项：
1. 除countAllUnreadNum，setAllNotificationRead 外所有的传入参数统一为(options对象, succeed回调, fail回调)
2. 可在demo.html中，点击链接，在console查看返回值
3. node下的uploadFile依赖form-data, 且传参与浏览器端不相同
4. upload-node-test.js 为node下上传的示例
