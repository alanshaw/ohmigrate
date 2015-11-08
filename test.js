var fs = require('fs')
var test = require('tape')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var omg = require('./')
var each = require('./each')

test('Should run migrations in the correct order', function (t) {
  t.plan(8)

  clearMigrations(function (err) {
    t.ifError(err, 'No error clearing migrations')

    var migrations = [
      '0.0.0_schema',
      '0.1.0_update',
      '1.0.0-alpha_add-fields',
      '1.0.0_final-schema-changes',
      '2.0.0_two-point-oh'
    ]

    createMigrations(shuffle(migrations.slice()), function (err) {
      t.ifError(err, 'No error creating migrations')

      var i = 0

      omg({
        dir: __dirname + '/tmp',
        did: function (name, cb) {
          t.equal(name, migrations[i], 'Migration name was ' + migrations[i])
          i++
          cb()
        },
        done: function (err) {
          t.ifError(err, 'No error performing migrations')
          t.end()
        }
      })
    })
  })
})

test('Should skip a migration if already done', function (t) {
  t.plan(4)

  clearMigrations(function (err) {
    t.ifError(err, 'No error clearing migrations')

    var migrations = [
      '0.0.0_schema',
      '0.1.0_update',
      '1.0.0-alpha_add-fields',
      '1.0.0_final-schema-changes',
      '2.0.0_two-point-oh'
    ]

    createMigrations(shuffle(migrations.slice()), function (err) {
      t.ifError(err, 'No error creating migrations')

      omg({
        dir: __dirname + '/tmp',
        should: function (name, cb) {
          cb(null, name === '2.0.0_two-point-oh')
        },
        did: function (name, cb) {
          t.equal(name, '2.0.0_two-point-oh', 'Migrated last migration only')
          cb()
        },
        done: function (err) {
          t.ifError(err, 'No error performing migrations')
          t.end()
        }
      })
    })
  })
})

function clearMigrations (cb) {
  rimraf(__dirname + '/tmp', cb)
}

function createMigrations (names, cb) {
  mkdirp(__dirname + '/tmp', function (err) {
    if (err) return cb(err)

    each(names, function (name, cb) {
      var timeout = randomInt(0, 1000)
      var code = 'module.exports = function (cb) { setTimeout(cb, ' + timeout + ') }'
      fs.writeFile(__dirname + '/tmp/' + name + '.js', code, 'utf8', cb)
    }, cb)
  })
}

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function shuffle (array) {
  var m = array.length
  var t, i

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--)

    // And swap it with the current element.
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }

  return array
}
