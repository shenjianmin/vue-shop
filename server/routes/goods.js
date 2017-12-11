let express = require('express')
let router = express.Router()
let Goods = require('../models/goods')
let User = require('../models/user')

//1 查询商品列表的数据
router.get("/list", (req, res, next) => {
    let page = parseInt(req.param('page', 1))               //获取当前页码
    let pageSize = parseInt(req.param('pageSize', 8))       //获取页的大小
    let priceLevel = req.param("priceLevel", "all")         //值为all,0,1,2,3 all就是价格不筛选，0表示0-100，1表示100-500，2表示500-1000，3表示1000-5000
    let sort = req.param("sort", 1)                         //排序，1表示升序，-1表示降序
    let skip = (page - 1) * pageSize                        //计算需要跳过多少条
    let params = {}                                         //过滤参数
    let priceLevelLimit = ['all', '0', '1', '2', '3']
    if (!priceLevelLimit.includes(priceLevel)) {              //如果不在价格筛选的范围内，默认all，即价格不筛选
        priceLevel = 'all'
    }
    if (priceLevel !== 'all') {
        let priceItem = [[0, 100], [100, 500], [500, 1000], [1000, 5000]]
        params = {
            //通过salePrice参数，过滤出我们想要的价格
            salePrice: {
                $gt: priceItem[priceLevel][0],
                $lte: priceItem[priceLevel][1]
            }
        }
    }
    //查找商品，跳过skip条，限制一页查pageSize条
    Goods.find(params)
        .sort({ 'salePrice': sort })
        .skip(skip)
        .limit(pageSize)
        .exec((err, doc) => {
            if (err) {
                return res.json({
                    status: '1',
                    msg: err.message
                })
            }
            return res.json({
                status: '0',
                msg: '',
                result: {
                    count: doc.length,
                    list: doc
                }
            })
        })
})

//2 加入到购物车
router.post("/addCart", (req, res, next) => {
    let userId = req.cookies.userId, productId = req.body.productId
    if (!productId) {
        return res.json({
            status:"3",
            msg:"请求参数productId没提供"
        })
    }
    User.findOne({userId},(err,userDoc)=>{
        if(err){
            return res.json({
                status:"1",
                msg:err.message
            })
        }
    //购物项,如果和购物车中的某项一样，则购物车中的数量+1
        let goodsItem = ''
        userDoc.cartList.forEach((item)=>{
            if(item.productId === productId){
                goodsItem = item
                item.productNum++
            }
        })
    //如果购买的东西在购物车中已经有则直接保存
        if(goodsItem){
            userDoc.save((err2,doc2)=>{
                if(err2){
                    return res.json({
                        status:"1",
                        msg:err2.message
                    })
                }
                return res.json({
                    status:'0',
                    msg:'',
                    result:'suc'
                })
            })
        }else{
            //如果购买的东西之前未购买过
            //查找商品
            Goods.findOne({productId},(err1,doc)=>{
                if(err1){
                    return res.json({
                        status:'1',
                        msg:err1.message
                    })
                }
                doc.productNum = 1              //设置购买的商品是一个
                doc.checked = 1                 //设置已经选中
                userDoc.cartList.push(doc)      //将这个商品添加到购物清单中
                userDoc.save((err2,doc2)=>{     //保存用户文档
                    if(err2){
                        return res.json({
                            status:"1",
                            msg:err2.message
                        })
                    }
                    return res.json({
                        status:'0',
                        msg:'',
                        result:'suc'
                    })
                })
            })
        }
    })
})
module.exports = router
