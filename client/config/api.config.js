const isPro = Object.is(process.env.NODE_ENV,'production')

module.exports = {
    baseUrl:isPro?'http://minzai.itnote.cn/api/':'api/'
}