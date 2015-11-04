# ohmigrate

Minimal framework for migrating databases or whatever from one version to the next.

## Getting started

```js
var omg = require('ohmigrate')

omg({
  should: function (name, cb) {
    // Should I run migration called `name`?
    // Callback `cb` with true/false to begin
    cb(null, true)
  },

  did: function (name, cb) {
    // Migration called `name` ran successfully
    // Next migration doesn't start until you call `cb`
    cb()
  },

  done: function (err) {
    // All migrations ran successfully, or an error occurred
    if (err) throw err
  }
})
```

Your migrations go in `process.cwd() + '/migrations'` and **must** be prefixed with a [semver](http://semver.org/) version number. Migrations are run sequentially in semver version order.

e.g.

```
.
└── migrations
    ├── 0.0.0-create-admin.js
    ├── 0.0.1-add-fields.js
    ├── 1.0.0-replace-missing.js
    ├── 1.1.0-dodge-viper.js
    ├── 2.0.0-new-schema.js
    ├── 2.0.1-more-schema.js
    └── 2.0.2-too-much-schema.js
```

Migrations look like this:

```js
module.exports = function (db, api, cb) {
  // Do some stuff, then...in some future...
  cb()
}
```

## Options

### `should`

Function that determines if a migration needs to be run. It is passed the name of the migration (the filename without '.js') and a callback that should be called with `true`/`false` depending on whether the migration should be run.

### `did`

Function called after a migration completes _successfully_. It is passed the name of the migration and a callback that should be called to begin the next migration.

### `done`

Function called _once_ when all migrations complete successfully, or when an error occurs during a migration. If an error occurs, it is passed the error object.

### `dir`

String path to the directory where migrations can be found. It defaults to `process.cwd() + '/migrations'`.