let mongoose = require('mongoose');
//连接MongoDB数据库,本地默认端口27017，数据库叫shop
mongoose.connect('mongodb://127.0.0.1:27017/shop');
//连接成功事件
mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success.")
});
//连接失败事件
mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail.")
});
//断开连接事件
mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected.")
});

module.exports = mongoose;
