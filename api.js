var HB = HB || {}
;(function(){
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global
  var root = freeGlobal || Function('return this')()
  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports
  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module

  if (typeof axios != 'function' && typeof $ != 'function') {
    throw new Error("Error! axios or jQuery haven't loaded yet")
  }

  HB.api = {}

  var instance //ajax对象
  /**
   * [init 初始化 传入ticketName ticket]
   * @param  {String} ticketName
   * @param  {String} ticket
   */
  HB.api.init = function(ticketName, ticket) {
    if (typeof axios == 'function') {
      headers = {}
      headers[ticketName] = ticket

      instance = axios.create({
        baseURL: 'https://api.huoban.com/v2',
        timeout: 30000,
        headers: headers
      })

      instance._request = function(options, succeed, failed) {
        instance.request(options).then(succeed).catch(failed)
      }

      instance.interceptors.response.use(function (response) {
        return response.data
      });
    } else {
      instance = {
        _request: function(options, succeed, failed) {
          options.headers = {}
          options.headers[ticketName] = ticket
          options.url = 'https://api.huoban.com/v2' + options.url
          options.timeout = 30000
          options.dataType = 'text json'

          if (options.params) {//jQury.ajax不接收params属性
            options.data = options.params
            delete options.params
          }

          if (options.data && options.data.toLocaleString() == '[object FormData]') {
            options.processData = false
            options.contentType = false
          } else if (options.method != 'get'){
            options.data = JSON.stringify(options.data)//除method：get外jQury.ajax处理data属性结果不正确
          }

          $.ajax(options).done(succeed).fail(function(response) {
            //后台返回的数据不符合json的格式，导致转换错误，被fail接收，可是注掉options.dataType也不管用，怀疑是后台返回的Content-Type:application/json导致
            if (response.status == 200) {
              succeed(response.responseText)
            } else {
              failed(response)
            }
          })
        }
      }
    }
  }

  function extend(sourceObjArray, targetObj) {
    sourceObjArray.forEach(function(sourceObj) {
      for (var propName in sourceObj) {
        targetObj[propName] = sourceObj[propName]
      }
    })
  }

  /**
   * [item数据 关于item相关操作的api对象]
   * @type {Object}
   */
  var item = {
    /**
     * [getItem 获取单个item]
     * @param  {Object}   options
     *                           item_id
     * @param  {Function} succeed  [请求成功之后的回调函数]
     * @param  {Function} failed     [请求失败之后的回调函数]
     */
    getItem: function (options, succeed, failed) {
      instance._request({
        url: '/item/' + options.item_id,
        method: 'get',
      }, succeed, failed)
    },
    /**
     * [bulkDeleteItems 根据筛选条件批量删除数据]
     * @param  {Object} options  [筛选参数] 形如
     * {
     *   table_id :表格id
     *   item_ids : [41072443, 41072445], 指定的item列表
     *   where: {
                  "and": [
                    {
                      "field": 2003,
                      "query": {
                        "eq": 200
                      }
                    }
                  ]
          }筛选条件
     * }
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求之后的回调]
     * 注：item_ids与where至少传一个,优先使用item_ids，且二者删除成功之后的返回值不相同
     */
    bulkDeleteItems: function(options, succeed, failed) {
      var tableId = options.table_id
      delete options.table_id
      instance._request({
        url: '/item/table/' + tableId + '/delete',
        method: 'post',
        data: options
      }, succeed, failed)
    },
    /**
     * [createItem ]
     * @param  {Object} options 其中fileds与table_id属性必填
     *  table_id  表格id
     *  fields    每一个字段的具体值，不同类型，提交的值不一样
        text类型     字段id      原始字符串
        user类型     字段id      用户id数组
        number类型   字段id      原始数字
        calculation类型 计算字段不可以提交
        date类型     字段id      原始日期
        category类型 字段id      选中的选项id数组
        image类型    字段id      提交的file_id数组
        relation类型 字段id      选中的数据item_id数组
      {
        "fields": {
          "1000000": 100,
          "1000001": "今天是个好日子",
          "1000002": [
            590001,
            590002
          ],
          "1000003": [
            311189,
            311192
          ]
        }
      }
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求之后的回调]
     */
    createItem: function(options, succeed, failed) {
      var tableId = options.table_id
      delete options.table_id
      instance._request({
        url: '/item/table/' + tableId,
        method: 'post',
        data: options
      }, succeed, failed)
    },
    /**
     * [deleteItem 删除单个Item]
     * @param  {Object}  options
     *                           item_id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    deleteItem: function(options, succeed, failed) {
      instance._request({
        url: '/item/' + options.item_id,
        method: 'delete',
      }, succeed, failed)
    },
    /**
     * [findItems 通过条件查询数据，返回数据集合]
     * @param  {Object} options
     *                            table_id
     *                            where      筛选器对象，用于限定统计结果的范围，参考筛选器结构
                                  order_by   结果排序对象
                                             order_by.field    排序字段id
                                             order_by.sort   排序顺序:desc降序,asc升序
                                  offset     限定统计结果返回的偏移量
                                  limit      限定统计结果返回的数量
        注：以上属性都为可选项，若想获取所有数据，传入{}即可
     * @param  {[type]} succeed   [请求成功之后的回调]
        返回结果：                  total 根据查询条件查到的数据总条数
                                    filtered  根据查询条件查到的数据总条数中当前用户可以看到的条数
                                    items 每一个item的详情
     * @param  {[type]} failed      [请求失败之后的回调]
     */
    findItems: function(options, succeed, failed) {
      var tableId = options.table_id
      delete options.table_id
      instance._request({
        url: '/item/table/' + tableId + '/find',
        method: 'post',
        data: options
      }, succeed, failed)
    },
    /**
     * [statItems 通过统计条件计算指定表格统计结果]
     * @param  {Object} options
     *                            table_id  必选  表格ID
                                  select  必选  需要返回的字段集合，可以使用指定的聚合函数以及格式化方法
                                  where 可选 筛选器对象，用于限定统计结果的范围
                                  group_by  可选 统计分组的字段，可以指定格式化方法
                                  order_by  可选 分组后对统计结果排序，只能使用select，group_by中设定的字段，并且指定的是as中的别名
                                  offset  可选 限定统计结果返回的偏移量
                                  limit 可选 限定统计结果返回的数量
     * @param  {[type]} succeed   [请求成功之后的回调]
     * @param  {[type]} failed      [请求失败之后的回调]
     */
    statItems: function(options, succeed, failed) {
      var tableId = options.table_id
      delete options.table_id
      instance._request({
        url: '/item/table/' + tableId + '/stats',
        method: 'post',
        data: options
      }, succeed, failed)
    },
    /**
     * [updateItem ]
     * @param  {Object} options 其中item_id及fileds属性必填
     *  item_id
     *  fields    每一个字段的具体值，不同类型，提交的值不一样
        text类型     字段id      原始字符串
        user类型     字段id      用户id数组
        number类型   字段id      原始数字
        calculation类型 计算字段不可以提交
        date类型     字段id      原始日期
        category类型 字段id      选中的选项id数组
        image类型    字段id      提交的file_id数组
        relation类型 字段id      选中的数据item_id数组
      {
        "fields": {
          "1000000": 100,
          "1000001": "今天是个好日子",
          "1000002": [
            590001,
            590002
          ],
          "1000003": [
            311189,
            311192
          ]
        }
      }
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    updateItem: function(options, succeed, failed) {
      var itemId = options.item_id
      delete options.item_id
      instance._request({
        url: '/item/' + itemId,
        method: 'put',
        data: options
      }, succeed, failed)
    }
  }

  /**
   * [follow关注 关于follow相关操作的api对象]
   * @type {Object}
   */
  var follow = {
    /**
     * [followItem 关注一个item]
     * @param  {Object} options
     *                         item_id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    followItem: function(options, succeed, failed) {
      instance._request({
        url: '/follow/item/' + options.item_id,
        method: 'post',
      }, succeed, failed)
    },
    /**
     * [unFollowItem 取消关注]
     * @param  {Object} options
     *                         item_id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    unFollowItem: function(options, succeed, failed) {
      instance._request({
        url: '/follow/item/' + options.item_id,
        method: 'delete',
      }, succeed, failed)
    },
    /**
     * [getItemFollower 获取item的关注者]
     * @param  {Object} options
     *                         item_id
     *                          offset   可选  结果返回的偏移量
                                limit    可选  结果返回的数量
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getItemFollower: function(options, succeed, failed) {
      var itemId = options.item_id
      delete options.item_id
      instance._request({
        url: '/follow/item/' + itemId + '/find',
        method: 'post',
        data: options
      }, succeed, failed)
    }
  }

  /**
   * [app应用 关于app相关操作的api对象]
   * @type {Object}
   */
  var app = {
    /**
     * [getApp 获取app相关信息]
     * @param  {Object} options
     *                         app_id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getApp: function(options, succeed, failed) {
      instance._request({
        url: '/app/' + options.app_id,
        method: 'get'
      }, succeed, failed)
    },
    /**
     * [deleteApp 卸载app]
     * @param {Number} options
     *                        app_id 必选
     *                        keep_permissions Boolean 是否保留权限 可选
     *                        keep_fileds  Boolean 是否保留字段 可选
     * @param  {Function} succeed  [请求成功之后的回调]
     * @param  {Function}  failed    [请求失败之后的回调]
     */
    deleteApp: function(options, succeed, failed) {
      var appId = options.app_id
      delete options.app_id
      instance._request({
        url: '/app/' + appId,
        method: 'delete',
        data: options
      }, succeed, failed)
    },
    /**
     * [getApps 根据指定条件获取已安装的应用信息集合]
     * @param  {Object}    options  [筛选条件]
     *     属性列表                table_id [表格ID]
     *                             或
     *                             space_id [工作区id]
     *                             app_id   [应用id]
     *     即要么传table_id, 要么传space_id,app_id
     * @param  {Function}  succeed [请求成功之后的回调]
     * @param  {Function}  failed    [请求失败之后的回调]
     */
    getApps: function(options, succeed, failed) {
      instance._request({
        url: '/apps',
        method: 'get',
        params: options
      }, succeed, failed)
    },
    /**
     * [updateApp 更新应用状态]
     * @param  {Object} options
     *                          app_Id 必选
                                status ["disable" or "enable"] 可选
     * @param  {Function}  succeed [请求成功之后的回调]
     * @param  {Function}  failed    [请求失败之后的回调]
     */
    updateApp: function(options, succeed, failed) {
      var appId = options.app_id
      instance._request({
        url: '/app/' + appId,
        method: 'get',
        data: options
      }, succeed, failed)
    }
  }
  /**
   * [comment评论 关于comment相关操作的api对象]
   * @type {Object}
   */

  var comment = {
    /**
     * [createComment 创建一条评论]
     * @param  {Object} options
     *         属性列表：
     *                  item_id     必选       数据ID
                        content     可选      评论内容, 支持@ , 格式为 <a href=“###” hb_type=“user” user_id=“12345”>@小明</a>
                        parent_comment_id  回复评论id 可选
                        file_ids           附件文件数组 可选
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     * @return {[type]}            [description]
     */
    createComment: function(options, succeed, failed) {
      var itemId = options.item_id
      delete options.item_id
      instance._request({
        url: '/comment/item/' + itemId,
        method: 'post',
        data: options
      }, succeed, failed)
    },
    /**
     * [deleteComment 删除评论]
     * @param  {Number} options
     *                         comment_id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    deleteComment: function(options, succeed, failed) {
      instance._request({
        url: '/comment/' + options.comment_id,
        method: 'delete'
      }, succeed, failed)
    },
    /**
     * [getItemComments 获取一条item的评论]
     * @param  {Object} options  参数对象
     *          参数列表        item_id  必选  数据ID
                                offset   可选  结果返回的偏移量
                                limit    可选  结果返回的数量
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     * @return {[type]}          [description]
     */
    getItemComments: function(options, succeed, failed) {
      var itemId = options.item_id
      delete options.item_id
      instance._request({
        url: '/comments/item/' + itemId,
        method: 'get',
        data: options
      }, succeed, failed)
    }
  }
  /**
   * [file附件 关于file相关操作的api对象]
   * @type {Object}
   */
  var file = {
    /**
     * [uploadFile 上传文件]
     * @param  {[type]} options
                   name 必选  文件名称
                   file 浏览器环境必选  file
                   filePath node环境必选
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     * 注：@todo 暂不支持node
     */
    uploadFile: function(options, succeed, failed) {
      if (freeGlobal) {
        var _FormData = require('form-data')

        var stream = fs.createReadStream(options.filePath)

        var formData = new _FormData()
        formData.append('type','attachment')
        formData.append('source', stream)
        formData.append('name', options.name)

        // axios未根据stream设置header的content-length与content-type:multipart/form-data
        var getLength = function(formData) {
          return new Promise(function(resolve, reject) {
            //form-data提供的getLength为异步操作
            formData.getLength(function(err,length) {
              if (err) {
                reject(err)
              }
              var headers = Object.assign({'content-length': length}, formData.getHeaders())
              resolve(headers)
            })
          })
        }

        getLength(formData).then(function(headers) {
          return instance.request({
            url: '/file',
            method: 'post',
            data: formData,
            headers: headers
          })
        }).then(succeed).catch(failed)
      } else {

        var formData = new FormData()

        formData.append('source', options.file)
        formData.append('name', options.name)
        formData.append('type','attachment')

        instance._request({
            url: '/file',
            method: 'post',
            data: formData
          }, succeed, failed)
        }
      }
  }

  /**
   * [notificationGroup通知群组 关于notificationGroup相关操作的api对象]
   * @type {Object}
   */
  var notificationGroup = {
    /**
     * [getAllNG 获取所有通知分组列表]
     * @param  {Object} options
     *         types   数组，获取的通知类型数组（非必填） 可选
               limit   获取条数 可选
               mts_updated_on   时间分页 可选
               offset   获取offset 可选
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getAllNG: function(options ,succeed, failed) {
      instance._request({
        url: '/notification_groups',
        method: 'get',
        data: options
      }, succeed, failed)
    },
    /**
     * [getAllReadNG 获取已读通知分组列表]
     * @param  {Object} options
     *                         mts_updated_on 可选 最后一条通知的更新时间（微秒），如果没有传将从新的通知开始获取
                               limit 可选 获取条数 默认返回20条，最高200条
    * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     * @return {[type]}         [description]
     */
    getAllReadNG: function(options, succeed, failed) {
      instance._request({
        url: '/notification_groups/read',
        method: 'get',
        data: options
      }, succeed, failed)
    },
     /**
     * [getAllUnreadNG 获取未读通知分组列表]
     * @param  {Object} options
     *                         mts_updated_on 可选 最后一条通知的更新时间（微秒），如果没有传将从新的通知开始获取
                               limit 可选 获取条数 默认返回20条，最高200条
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     * @return {[type]}         [description]
     */
    getAllUnreadNG: function(options, succeed, failed) {
      instance._request({
        url: '/notification_groups/unread',
        method: 'get',
        data: options
      }, succeed, failed)
    },
    /**
     * [setNGRead 将该组所有未读通知标记为已读]
     * @param {Object} options
     *                        notification_group_id 必选  通知组id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    setNGRead: function(options, succeed, failed) {
      instance._request({
        url: '/notification_group/read',
        method: 'post',
        data: options
      }, succeed, failed)
    }
  }

   /**
   * [notification通知 关于notification相关操作的api对象]
   * @type {Object}
   */
  var notification = {
    /**
     * [countAllUnreadNum 获取当前用户所有未读通知数]
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     * @return {[type]}         [description]
     */
    countAllUnreadNum: function(succeed,failed) {
      instance._request({
        url: '/notification/count',
        method: 'get'
      }, succeed, failed)
    },
    /**
     * [createNotification 添加一个通知]
     * @param  {Object} options
     *                属性列表 receiver_id  必选  通知接收人ID
                               push_message  必选  推送到移动端的通知内容
                               title 必选  展示在云表格中的通知标题
                               content 必选  展示在云表格中的通知内容
                               open_url  必选 通知点击跳转地址
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     * @return {[type]}         [description]
     */
    createNotification: function(options, succeed, failed) {
      instance._request({
        url: '/notification',
        method: 'post',
        data: options
      }, succeed, failed)
    },
    /**
     * [getReadInGroup description]
     * @param  {Object} options
     *                  属性列表  notification_group_id  必选  通知组id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getReadNotificationInGroup: function(options, succeed, failed) {
      instance._request({
        url: '/notifications/group/' + options.notification_group_id + '/read',
        method: 'get'
      }, succeed, failed)
    },
    /**
     * [getUnreadNotificationInGroup description]
     * @param  {Object} options
     *                  属性列表  notification_group_id  必选  通知组id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getUnreadNotificationInGroup: function(options, succeed, failed) {
      instance._request({
        url: '/notifications/group/' + options.notification_group_id + '/unread',
        method: 'get'
      }, succeed, failed)
    },
    /**
     * [setAllNotificationRead 将所有未读通知标记为已读]
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     * @param {[type]} options
     *                        mts_marked_on false 标记为已读的时间
     */
    setAllNotificationRead: function(succeed, failed, options) {
      instance._request({
        url: '/notification/read_all',
        method: 'post'
      }, succeed, failed)
    }
  }

  /**
   * [share分享 关于share相关操作的api对象]
   * @type {Object}
   */
  var share = {
    /**
     * [createShare 在指定对象上创建分享对象，通过该分享对象可以访问指定对象的数据]
     * @param  {Object} options
     *                          ref_type  必选  来源类型，可为空，暂时仅支持：table(表格)
                                ref_id  必选  来源ID(table_id)
                                expired 可选 分享的过期时间，不传则永不过期
                                scope 必选  分享数据范围 http://apidoc.dev.huoban.com/#create-a-share-for-a-object
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    createShare: function(options, succeed, failed) {
      var refType = options.ref_type
      var refId = options.ref_id
      delete options.refType
      delete options.refId
      instance._request({
        url: '/share/' + refType + '/' + refId,
        method: 'post',
        data: options
      }, succeed, failed)
    },
    /**
     * [getShares 获取指定对象上的分享实例，如果是指定应用登录请求，则返回该应用下的分享，非管理员用户无法获取其他成员的分享信息，返回share实例集合]
     * @param  {Object} options
     *                          ref_type  必选  来源类型，可为空，暂时仅支持：table(表格)
                                ref_id  必选  来源ID(table_id)
                                bound_user_id 可选 绑定指定用户ID
                                limit 可选 返回数量限制，默认值为20
                                offset  可选 返回起始偏移量，默认值为0
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getShares: function(options, succeed, failed) {
      var refType = options.ref_type
      var refId = options.ref_id
      delete options.refType
      delete options.refId
      instance._request({
        url: '/share/' + refType + '/' + refId,
        method: 'get',
        data: options
      }, succeed, failed)
    }
  }

  /**
   * [space工作区 关于space相关操作的api对象]
   * @type {Object}
   */
  var space = {
    /**
     * [getSpaceAllMembers 获取所有成员]
     * @param  {Object} options
                                space_id  必选  工作区ID
                                limit 可选 返回数量限制，默认值为20
                                offset  可选 返回起始偏移量，默认值为0
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getSpaceAllMembers: function(options, succeed, failed) {
      var spaceId = options.space_id
      delete options.space_id
      instance._request({
        url: '/space/' + spaceId + '/members',
        method: 'get',
        data: options
      }, succeed, failed)
    }
  }

  /**
   * [stream动态 关于stream相关操作的api对象]
   * @type {Object}
   */
  var stream = {
    /**
     * [getStreams 获取指定数据的动态信息]
     * @param  {Object} options
     *                  属性列表：
     *                           item_id  必选  数据ID
                                 limit 可选 限定统计结果返回的数量
                                 last_stream_id 初次获取动态该参数可选，其他次数必选   上一次得到列表的最后一个stream_id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getStreams: function(options, succeed, failed) {
      var itemId = options.item_id
      delete options.item_id
      instance._request({
        url: '/streams/item/' + itemId,
        method: 'get',
        data: options
      }, succeed, failed)
    }
  }

  /**
   * [table表格 关于table相关操作的api对象]
   * @type {Object}
   */
  var table = {
    /**
     * [createTable 在指定工作区下创建表格]
     * @param  {Object} options
     *                  属性列表：
     *                           space_id  必选  工作区ID
                                 其他见http://apidoc.huoban.com/#create
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    createTable: function(options, succeed, failed) {
      var spaceId = options.space_id
      delete options.space_id
      instance._request({
        url: '/table/space/' + spaceId,
        method: 'post',
        data: options
      }, succeed, failed)
    },
    /**
     * [getTable 获取表格]
     * @param  {Object} options
     *                         table_id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getTable: function(options, succeed, failed) {
      instance._request({
        url: '/table/' + options.table_id,
        method: 'get'
      }, succeed, failed)
    },
    /**
     * [getAllTableInSpace 获取工作区里的所有表格]
     * @param  {Object} options
     *                         space_id
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    getAllTableInSpace: function(options, succeed, failed) {
      instance._request({
        url: '/tables/space/' + options.space_id,
        method: 'get'
      }, succeed, failed)
    },
    /**
     * [updateTable 在指定工作区下创建表格]
     * @param  {Object} options
     *                  属性列表：
     *                           table_id  必选  工作区ID
                                 其他见http://apidoc.huoban.com/#update
     * @param  {Function} succeed [请求成功之后的回调]
     * @param  {Function} failed    [请求失败之后的回调]
     */
    updateTable: function(options, succeed, failed) {
      var tableId = options.table_id
      delete options.tableId
      instance._request({
        url: '/table/'+tableId,
        method: 'put',
        data: options
      }, succeed, failed)
    }
  }

  extend([item, follow, app, comment, file, notificationGroup, notification, share, space, stream, table], HB.api)

  if (freeModule) {
    // Export for Node.js.
    (freeModule.exports = HB).HB = HB;
    // Export for CommonJS support.
    freeExports.HB = HB;
  }
  else {
    // Export to the global object.
    root.HB = HB;
  }
}).call(this)