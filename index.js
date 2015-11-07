var fs = require('fs')
var semver = require('semver')

module.exports = function (opts) {
  opts = opts || {}

  var should = opts.should || function (name, cb) {
    setImmediate(function () { cb(null, true) })
  }
  var did = opts.did || function () {}
  var done = opts.done || function () {}
  var dir = opts.dir || process.cwd() + '/migrations'
  var ctx = opts.ctx || {}

  fs.readdir(dir, function (err, filenames) {
    if (err) return done(err)

    var migrations = filenames.filter(function (filename) {
      return endsWith(filename, '.js')
    }).sort(function (a, b) {
      var verA = a.split(/[^a-zA-A0-9-+.]/i)[0]
      var verB = b.split(/[^a-zA-A0-9-+.]/i)[0]

      if (semver.gt(verA, verB, true)) return 1
      if (semver.lt(verA, verB, true)) return -1
    }).map(function (filename) {
      return {
        name: filename.slice(0, filename.length - 3), // Remove .js
        run: require(dir + '/' + filename)
      }
    })

    each(migrations, function (migration, cb) {
      console.log('Starting migration', migration.name)

      should(migration, function (err, yes) {
        if (err) return cb(err)

        if (!yes) {
          console.log('Skipping completed migration', migration.name)
          return cb()
        }

        console.log('Running migration', migration.name)

        try {
          migration.run.call(ctx, function (err) {
            if (err) return cb(err)

            console.log('Finished running migration', migration.name)

            did(migration.name, function () {
              if (err) return cb(err)
              console.log('Migration completed successfully', migration.name)
              cb()
            })
          })
        } catch (err) {
          cb(err)
        }
      })
    }, done)
  })

  function each (arr, iterator, cb) {
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

  function endsWith (str, ends) {
    var position = str.length - ends.length
    return position >= 0 && str.indexOf(ends, position) === position
  }
}
