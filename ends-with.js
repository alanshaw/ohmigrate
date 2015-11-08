module.exports = function (str, ends) {
  var position = str.length - ends.length
  return position >= 0 && str.indexOf(ends, position) === position
}
