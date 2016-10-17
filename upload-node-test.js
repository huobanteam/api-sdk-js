function log(data) {
  console.log(data)
}
global.axios = require('axios')
global.HB = require('./api')
HB.api.init('Authorization',"Bearer r38MBx1yTQUC53louD5FlLinml06JakBIGDJnpeY001")
HB.api.uploadFile({filePath: './318756-130G1222R317.jpg', name: 'test'}, log, log)