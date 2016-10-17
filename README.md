## 伙伴云表格接口SDK js版
>### 注意事项：
>1. 请先调用HB.api.init传入ticketName 及 ticket初始化获得权限，再调用其他接口
>2. api.js 兼容浏览器端与nodejs
>3. 浏览器端script引用，nodejs require即可 两种方式都将暴露HB.api接口
>4. HB.api提供关于item, follow, app, comment, file, notificationGroup, notification, share, space, stream, table相关的增删改查ajax请求方法
>5. 相关方法具体传参，请查看注释
>6. api.js依赖[axios](https://github.com/mzabriskie/axios) 或 jQuery,(nodejs下请使用axios)因此api必须在axios或jQuery之后引入
>7. 除countAllUnreadNum，setAllNotificationRead 外所有的传入参数统一为(options对象, succeed回调, fail回调)
>8. 打开demo.html，点击链接，可在console查看返回值
>9. delete方法报错是因为传入了一个不存在的id
>10. node下的uploadFile依赖form-data, 且传参与浏览器端不相同