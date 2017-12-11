//引入一些必要的模块
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//引入第三方模块
var goods = require('./routes/goods');
var users = require('./routes/users');
require('./db')
var app = express();
//对于客户请求的内容使用JSON编码处理
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//拦截不符合要求的路由
app.use(function(req,res,next){
//如果已经登录或者是登录接口或者是首页商品列表接口或者是注册用户接口则放行,否则返回当前未登录状态
    if(req.cookies.userId || req.originalUrl === '/users/login'||req.originalUrl === '/users/register'||req.originalUrl.indexOf('/goods/list')>-1){
      next()
    }else{
      return res.json({
        status:'10001',
        msg:'当前未登录',
        result:''
      })
    }
})
app.use('/goods', goods);
app.use('/users', users);
module.exports = app;
