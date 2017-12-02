// 每三位，并且后面要跟的是数字
const digitsRE = /(\d{3})(?=\d)/g
/**
 * 货币的过滤器函数
 */
export function currency (value, currency, decimals) {
  // 转换成浮点数
  value = parseFloat(value)
  // 无穷大或者不为0的值则返回空字符串
  if (!isFinite(value) || (!value && value !== 0)) return ''
  // 传入的货币类型不为空则使用当前的货币，否则默认使用￥
  currency = currency != null ? currency : '￥'
  // 小数点默认2位
  decimals = decimals != null ? decimals : 2
  // 将数字转为绝对值，并保留几位小数
  var stringified = Math.abs(value).toFixed(decimals)
  // 获取整数部分
  var _int = decimals
    ? stringified.slice(0, -1 - decimals)
    : stringified

  // 看整数的长度模3余几
  var i = _int.length % 3
  // 余数大于0，则取前几个，并且长度大于3个则跟上逗号否则跟上空字符串
  var head = i > 0
    ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
    : ''
  // 浮点数部分

  var _float = decimals
    ? stringified.slice(-1 - decimals)
    : ''

  // 判断正负符号
  var sign = value < 0 ? '-' : ''
  // 返回符号加上货币类型加上整数部分的头部，再加上3位1个逗号再加上小数
  return sign + currency + head +
    _int.slice(i).replace(digitsRE, '$1,') +
    _float
}
