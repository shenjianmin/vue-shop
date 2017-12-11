let express = require('express');
let router = express.Router();
let User = require('./../models/user');
//引入一个能表示时间的模块
let sd = require('silly-datetime');

//1.登录接口
router.post("/login", (req, res, next) => {
  let param = {
    userName: req.body.userName,            //获取用户名
    userPwd: req.body.userPwd               //获取密码
  }
  console.log(param);
  //查找用户
  User.findOne(param, (err, doc) => {
    if (err) {
      return res.json({
        status: "1",
        msg: err.message
      });
    }
    if (!doc) {
      return res.json({
        status: "1",
        msg: "用户名或密码错误"
      });
    }
    //给客户端设置cookie,userId值为用户的ID，cookie的作用域是/,过期时间是1个小时
    res.cookie("userId", doc.userId, {
      maxAge: 1000 * 60 * 60
    });
    //给客户端设置cookie，userName值为用户的名称，cookie的作用域是/，过期时间为1小时
    res.cookie("userName", doc.userName, {
      maxAge: 1000 * 60 * 60
    });
    //req.session.user = doc;
    return res.json({
      status: '0',
      msg: '',
      result: {
        userName: doc.userName
      }
    });
  });
});

//2.登出接口
router.post("/logout", (req, res, next) => {
  //清空cookie的用户ID,设置过期时间为上一秒
  res.cookie("userId", "", {
    maxAge: -1
  });
  return res.json({
    status: "0",
    msg: '',
    result: ''
  });
});
//3 注册接口
router.post("/register",(req,res,next) => {
  let userName = req.body.regName
  let userPwd = req.body.regPwd
  let userPwd_re = req.body.regPwd_r
  let userId = (new Date()).getTime() + parseInt(Math.random()*9999)
  if(userPwd != userPwd_re){
    return res.json({
      status:'1',
      msg:'',
      result:''
    })
  }
  User.findOne({userName},(err,user)=>{
    if(err){
      return res.json({
        status:'1',
        msg:'',
        result:''
      })
    }
    if (user) {
      return res.json({
        status:'1',
        msg:'',
        result:''
      })
    }
    User.create({userName,userPwd,userId},(err,user)=>{
      if(err){
        return res.json({
          status:'1',
          msg:'',
          result:''
        })
      }
      return res.json({
        status: '0',
        msg: '',
        result: {
          
        }
      })
    })
  })
})
//4 检查用户是否已经登录
router.get("/checkLogin", (req, res, next) => {
  if (req.cookies.userId) {
    return res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName || ''
    });
  }
  return res.json({
    status: '1',
    msg: '未登录',
    result: ''
  });
});
//5 获取购物车数量
router.get("/getCartCount", (req, res, next) => {
  if (!(req.cookies && req.cookies.userId)) {
    res.json({
      status: "0",
      msg: "当前用户不存在"
    });
  }
  console.log("userId:" + req.cookies.userId);
  let userId = req.cookies.userId;//得到用户ID
  User.findOne({ userId }, (err, doc) => {
    if (err) {
      return res.json({
        status: "0",
        msg: err.message
      });
    }
    let cartList = doc.cartList;
    let cartCount = 0;
    cartList.map((item) => {
      cartCount += parseFloat(item.productNum);
    });
    return res.json({
      status: "0",
      msg: "",
      result: cartCount
    });
  });
});

//6 查询当前用户的购物车数据
router.get("/cartList", (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({ userId }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }
    res.json({
      status: '0',
      msg: '',
      result: doc.cartList
    });
  });
});

//7 购物车删除
router.post("/cartDel", (req, res, next) => {
  let userId = req.cookies.userId, productId = req.body.productId;
  User.update({
    userId: userId
  }, {
      $pull: {
  //更新购物车数据库,删除productId对应的商品数据,update方法更新多余的数据需要$符号
        'cartList': {
          productId
        }
      }
    }, (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      }
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      });
    });
});

//8 修改商品数量
router.post("/cartEdit", (req, res, next) => {
  let userId = req.cookies.userId,                  //用户ID
    productId = req.body.productId,                 //产品ID
    productNum = req.body.productNum,               //产品数量
    checked = req.body.checked;                     //是否选中
  User.update({ userId, "cartList.productId": productId }, {
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked,
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }
    return res.json({
      status: '0',
      msg: '',
      result: 'suc'
    });
  })
});
//9 选中所有
router.post("/editCheckAll", (req, res, next) => {
  let userId = req.cookies.userId,                    //用户ID
    checkAll = req.body.checkAll ? '1' : '0';         //选中为1未选中为0
  User.findOne({ userId }, (err, user) => {
    if (err) {
      return res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }
    if (user) {
      user.cartList.forEach((item) => {
        item.checked = checkAll;
      })
      user.save((err1, doc) => {
        if (err1) {
          res.json({
            status: '1',
            msg: err1, message,
            result: ''
          });
        }
        res.json({
          status: '0',
          msg: '',
          result: 'suc'
        });
      })
    }
  });
});
//10 查询用户地址接口
router.get("/addressList", (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({ userId }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }
    res.json({
      status: '0',
      msg: '',
      result: doc.addressList
    });
  })
});
//11 设置默认地址接口
router.post("/setDefault", (req, res, next) => {
  let userId = req.cookies.userId,
    addressId = req.body.addressId;
  if (!addressId) {
    return res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    });
  }
  User.findOne({ userId }, (err, doc) => {
    if (err) {
      return res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }
    let addressList = doc.addressList;
    addressList.forEach((item) => {
      if (item.addressId == addressId) {
        item.isDefault = true;
      } else {
        item.isDefault = false;
      }
    });

    doc.save((err1, doc1) => {
      if (err) {
        return res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      }
      return res.json({
        status: '0',
        msg: '',
        result: ''
      });
    })
  });
});

//12 删除地址接口
router.post("/delAddress", (req, res, next) => {
  let userId = req.cookies.userId, addressId = req.body.addressId;
  User.update({ userId }, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }
    res.json({
      status: '0',
      msg: '',
      result: ''
    });
  });
});
//13 添加地址
router.post("/addAddress", (req, res) => {
  let userId = req.cookies.userId
  let userName = req.body.userName
  let streetName = req.body.streetName
  let postCode = req.body.postCode
  let tel = req.body.tel
  let isDefault = req.body.isDefault
   //通时间戳加随机数设置新的地址ID
  let addressId = (new Date()).getTime() + parseInt(Math.random()*9999)
  User.findOne({ userId }, (err, doc) => {
    console.log(doc)
    if (err) {
      return res.json({
        status: "1",
        msg: err.message
      })
    }
    doc.addressList.push({
      addressId,
      userName,
      streetName,
      postCode,
      tel,
      isDefault
    })
    doc.save((err,doc)=>{
      if(err){
        return res.json({
            status:'1',
            msg:err.message
        })
      }
      res.json({
        status:'0',
        msg:'添加收货地址成功'
      })
    })
  })
});
//14 查看订单列表
router.get('/orders',(req,res)=>{
  let userId = req.cookies.userId
  User.findOne({userId},(err,doc)=>{
    if(err){
      return res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }
    res.json({
      status:'0',
      result:doc.orderList
    })
  })
})
//15 支付
router.post("/payMent", (req, res, next) => {
  let userId = req.cookies.userId,//用户ID
    addressId = req.body.addressId,//地址ID
    orderTotal = req.body.orderTotal;//订单总价
  User.findOne({ userId }, (err, doc) => {
    if (err) {
      return res.json({
        status: "1",
        msg: err.message,
        result: ''
      });
    }
    let address = '', goodsList = [];
    //获取当前用户的地址信息
    doc.addressList.forEach((item) => {
      if (addressId === item.addressId) {
        address = item;
      }
    })
    //获取用户购物车的购买商品
    doc.cartList.filter((item) => {
      if (item.checked == '1') {
        goodsList.push(item);
      }
    });

    let platform = '622';
    let r1 = Math.floor(Math.random() * 10);
    let r2 = Math.floor(Math.random() * 10);
    let sysDate = sd.format(new Date(), 'yyyyMMddhhmmss');
    let createDate = sd.format(new Date(), 'yyyy-MM-dd hh:mm:ss');
    //通过随机数设置新的orderId
    let orderId = platform + r1 + sysDate + r2;
    let order = {
      orderId,
      orderTotal,
      addressInfo: address,
      goodsList,
      orderStatus: '1',
      createDate
    };

    doc.orderList.push(order);

    doc.save((err1, doc1) => {
      if (err1) {
        res.json({
          status: "1",
          msg: err.message,
          result: ''
        });
      }
      res.json({
        status: "0",
        msg: '',
        result: {
          orderId: order.orderId,
          orderTotal: order.orderTotal
        }
      });
    });
  });
});
//16 取消订单
router.post('/cancelOrder',(req,res)=>{
  let userId = req.cookies.userId
  let orderId = req.body.orderId
  User.update({userId,"orderList.orderId":orderId},{
    "orderList.$.orderStatus":"0"
  },(err,doc)=>{
    if(err){
      return res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }
    return res.json({
      status:'0',
      msg:'',
      result:'suc'
    })
  })
})
//17 根据订单Id查询订单信息
router.get("/orderDetail", (req, res, next) => {
  let userId = req.cookies.userId, orderId = req.param("orderId");
  User.findOne({ userId }, (err, userInfo) => {
    if (err) {
      return res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }
    let orderList = userInfo.orderList;
    if (orderList.length <= 0) {
      return res.json({
        status: '120001',
        msg: '当前用户未创建订单',
        result: ''
      });
    }
    let orderTotal = 0;
    orderList.forEach((item) => {
      if (item.orderId == orderId) {
        orderTotal = item.orderTotal;
      }
    });
    if (orderTotal <= 0) {
      return res.json({
        status: '120002',
        msg: '无此订单',
        result: ''
      });
    }
    return res.json({
      status: '0',
      msg: '',
      result: {
        orderId,
        orderTotal
      }
    })
  })
});

module.exports = router;
