<template>
    <div>
      <nav-bread>
        <span>人气商品</span>
      </nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">排序:</span>
            <a href="javascript:void(0)" class="default cur">默认</a>
            <a href="javascript:void(0)" class="price" v-bind:class="{'sort-up':sortFlag}" @click="sortGoods()">价格 <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
            <a href="javascript:void(0)" class="filterby stopPop" @click.stop="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
              <dl class="filter-price">
                <dt>价格:</dt>
                <dd><a href="javascript:void(0)" @click="setPriceFilter('all')" v-bind:class="{'cur':priceChecked=='all'}">All</a></dd>
                <dd v-for="(item,index) in priceFilter">
                  <a href="javascript:void(0)" @click="setPriceFilter(index)" v-bind:class="{'cur':priceChecked==index}">{{item.startPrice}} - {{item.endPrice}}</a>
                </dd>
              </dl>
            </div>

            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="item in goodsList">
                    <div class="pic">
                      <a href="#"><img v-lazy="'static/'+item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice | currency('￥')}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="view-more-normal"
                   v-infinite-scroll="loadMore"
                   infinite-scroll-disabled="busy"
                   infinite-scroll-distance="20">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
      <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
          <p slot="message">
             请先登录,否则无法加入到购物车中!
          </p>
          <div slot="btnGroup">
              <a class="btn btn--m" href="javascript:;" @click="mdShow = false">关闭</a>
          </div>
      </modal>
      <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
        <p slot="message">
          <svg class="icon-status-ok">
            <use xmlns:xlink="http://www.w3.org/1999/xlink 
" xlink:href="#icon-status-ok"></use>
          </svg>
          <span>加入购物车成!</span>
        </p>
        <div slot="btnGroup">
          <a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
          <router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
        </div>
      </modal>
    </div>
</template>
<script>
import Public from '../Public'
import Modal from '../components/Modal'
export default {
  mixins: [Public],
  components: {
    Modal
  },
  data () {
    return {
      goodsList: [],
      sortFlag: true, // 调整商品排列方式为升序
      page: 1, // 页码
      pageSize: 8, // 页的大小
      busy: false, // busy的布尔值来控制v-infinite-scroll是否触发
      loading: false, // 控制懒加载的图片是否显示
      mdShow: false, // 控制模态框是否显示
      mdShowCart: false, // 提示是否成功添加到购物车
      priceFilter: [
        {
          startPrice: '￥0.00',
          endPrice: '100.00'
        },
        {
          startPrice: '￥100.00',
          endPrice: '500.00'
        },
        {
          startPrice: '￥500.00',
          endPrice: '1000.00'
        },
        {
          startPrice: '￥1000.00',
          endPrice: '5000.00'
        }
      ],
      priceChecked: 'all', // 选中的价格过滤值
      filterBy: false // 货币过滤
    }
  },
  mounted () {
    this.getGoodList()
  },
  methods: {
    // 添加商品到购物车
    addCart (proId) {
      this.$http.post('/goods/addcart', {productId: proId}).then(res => {
        res = res.data
        if (res.status === '0') {
          this.mdShowCart = true
          this.$store.commit('updateCartCount', 1)
        } else {
          this.mdShow = true
        }
      })
    },
    // 改变商品的排列顺序为升序或降序
    sortGoods () {
      this.sortFlag = !this.sortFlag
      this.page = 1
      this.getGoodList()
    },
    // 改变价格的过滤值
    setPriceFilter (index) {
      this.priceChecked = index
      this.page = 1
      this.getGoodList()
    },
    // get请求商品列表的api，并传入相关参数
    getGoodList (loadmoreFlag) {
      var params = {
        page: this.page,
        pageSize: this.pageSize,
        sort: this.sortFlag ? 1 : -1,
        priceLevel: this.priceChecked
      }
      this.$http.get('/goods/list', { params }).then(res => {
        res = res.data
        this.loading = false
        if (res.status === '0') {
          if (loadmoreFlag) {
            this.goodsList = this.goodsList.concat(res.result.list)
            this.busy = res.result.count < this.pageSize
          } else {
            this.goodsList = res.result.list
            this.busy = false
          }
        }
      })
    },
    // 当滚到底部加载更多的商品数据
    loadMore () {
      this.busy = true
      this.page++
      this.getGoodList(true)
    },
    // 关闭相关的模态框
    closeModal () {
      this.mdShow = false
      this.mdShowCart = false
    }
  }
}
</script>
