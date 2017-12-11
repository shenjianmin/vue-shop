//此设置用来区分生产环境和开发环境
const isPro = Object.is(process.env.NODE_ENV,'production')

module.exports = {
    baseUrl:isPro ? 'http://minzaicode.itnote.cn/api/':'api/'
}