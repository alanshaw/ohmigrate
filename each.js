module.exports = function (arr, iterator, cb) {
  var completed = 0
  function iterate () {
    iterator(arr[completed], function (err) {
      if (err) {
        cb(err)
        cb = function () {}
        return
      }
      ++completed
      if (completed >= arr.length) return cb()
      setImmediate(iterate)
    })
  }
  iterate()
}
