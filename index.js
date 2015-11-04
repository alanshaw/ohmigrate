var fs = require('fs')

module.exports = function (opts) {
  opts = opts || {}

  var should = opts.should || function (name, cb) {
    setImmediate(function () { cb(null, true) })
  }
  var did = opts.did || function () {}
  var done = opts.done || function () {}
  var dir = opts.dir || process.cwd() + '/migrations'

  fs.readdir(dir, function (err, filenames) {
    if (err) return done(err)

    var migrations = filenames.filter(function (filename) {
      return endsWith(filename, '.js')
    }).sort(function (a, b) {
      var partsA = a.split('.').map(mapInt)
      var partsB = b.split('.').map(mapInt)

      if (partsA[0] < partsB[0]) {
        return -1
      } else if (partsA[0] > partsB[0]) {
        return 1
      } else {
        if (partsA[1] < partsB[1]) {
          return -1
        } else if (partsA[1] > partsB[1]) {
          return 1
        } else {
          if (partsA[2] < partsB[2]) {
            return -1
          } else if (partsA[2] > partsB[2]) {
            return 1
          } else {
            return 0
          }
        }
      }
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
          migration.run(function (err) {
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

  function mapInt (str) {
    return parseInt(str, 10)
  }
}
