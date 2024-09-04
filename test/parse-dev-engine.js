const t = require('tap')
const { parseDevEngines, checkDevEnginesDep } = require('../lib/dev-engines')
const { devEngines } = require('../lib/env')

t.test('unrecognized property', async t => {
  const wanted = { name: `alpha`, version: '1' }
  const current = { name: `alpha` }
  t.throws(
    () => parseDevEngines({ unrecognized: wanted }, { os: current }),
    new Error('Invalid property "unrecognized"')
  )
})

t.test('empty devEngines', async t => {
  t.same(parseDevEngines({ }, { os: { name: `darwin` } }), [])
})

t.test('invalid name', async t => {
  const wanted = { name: `alpha`, onFail: 'download' }
  const current = { name: `beta` }
  t.same(parseDevEngines({ os: wanted }, { os: current }), [
    Object.assign(new Error(`Invalid engine "os"`), {
      errors: [
        new Error(`Invalid name "alpha" does not match "beta" for "os"`),
      ],
      engine: 'os',
      isWarn: false,
      isError: true,
      current,
      required: wanted,
    }),
  ])
})

t.test('no arguments', async t => {
  t.throws(() => checkDevEnginesDep())
  t.same(parseDevEngines(), [])
})

t.test('default options', async t => {
  t.same(parseDevEngines({}, devEngines()), [])
})

t.test('tests all the right fields', async t => {
  for (const nonString of [1, true, false, null, undefined, {}, []]) {
    t.test('invalid name value', async t => {
      t.throws(
        () => parseDevEngines({
          runtime: {
            name: nonString,
            version: '14',
          },
        }, {
          runtime: {
            name: 'nondescript',
            version: '14',
          },
        }),
        new Error(`Invalid non-string value for "name" within "runtime"`)
      )
    })
    t.test('invalid version value', async t => {
      t.throws(
        () => parseDevEngines({
          runtime: {
            name: 'nondescript',
            version: nonString,
          },
        }, {
          runtime: {
            name: 'nondescript',
            version: '14',
          },
        }),
        new Error(`Invalid non-string value for "version" within "runtime"`)
      )
    })
    t.test('invalid onFail value', async t => {
      t.throws(
        () => parseDevEngines({
          runtime: {
            name: 'nondescript',
            version: '14',
            onFail: nonString,
          },
        }, {
          runtime: {
            name: 'nondescript',
            version: '14',
          },
        }),
        new Error(`Invalid non-string value for "onFail" within "runtime"`)
      )
    })
  }
})

t.test('tests all the right fields', async t => {
  for (const env of ['packageManager', 'runtime', 'cpu', 'libc', 'os']) {
    t.test(`field - ${env}`, async t => {
      t.test('current name does not match, wanted has extra attribute', async t => {
        const wanted = { name: `test-${env}-wanted`, extra: `test-${env}-extra` }
        const current = { name: `test-${env}-current` }
        t.throws(
          () => parseDevEngines({ [env]: wanted }, { [env]: current }),
          new Error(`Invalid property "extra" for "${env}"`)
        )
      })
      t.test('current is not given', async t => {
        const wanted = { name: `test-${env}-wanted` }
        t.throws(
          () => parseDevEngines({ [env]: wanted }),
          new Error(`Unable to determine "name" for "${env}"`)
        )
      })
      t.test('name only', async t => {
        const wanted = { name: 'test-name' }
        const current = { name: 'test-name' }
        t.same(parseDevEngines({ [env]: wanted }, { [env]: current }), [])
      })
      t.test('non-semver version is not the same', async t => {
        const wanted = { name: `test-name`, version: 'test-version-wanted' }
        const current = { name: `test-name`, version: 'test-version-current' }
        t.same(parseDevEngines({ [env]: wanted }, { [env]: current }), [
          Object.assign(new Error(`Invalid engine "${env}"`), {
            errors: [
              // eslint-disable-next-line max-len
              new Error(`Invalid version "test-version-wanted" does not match "test-version-current" for "${env}"`),
            ],
            engine: env,
            isWarn: false,
            isError: true,
            current: { name: `test-name`, version: 'test-version-current' },
            required: { name: `test-name`, version: 'test-version-wanted' },
          }),
        ])
      })
      t.test('non-semver version is the same', async t => {
        const wanted = { name: `test-name`, version: 'test-version' }
        const current = { name: `test-name`, version: 'test-version' }
        t.same(parseDevEngines({ [env]: wanted }, { [env]: current }), [])
      })
      t.test('semver version is not in range', async t => {
        const wanted = { name: `test-name`, version: '^1.0.0' }
        const current = { name: `test-name`, version: '2.0.0' }
        t.same(parseDevEngines({ [env]: wanted }, { [env]: current }), [
          Object.assign(new Error(`Invalid engine "${env}"`), {
            errors: [
              // eslint-disable-next-line max-len
              new Error(`Invalid semver version "^1.0.0" does not match "2.0.0" for "${env}"`),
            ],
            engine: env,
            isWarn: false,
            isError: true,
            current: { name: `test-name`, version: '2.0.0' },
            required: { name: `test-name`, version: '^1.0.0' },
          }),
        ])
      })
      t.test('semver version is in range', async t => {
        const wanted = { name: `test-name`, version: '^1.0.0' }
        const current = { name: `test-name`, version: '1.0.0' }
        t.same(parseDevEngines({ [env]: wanted }, { [env]: current }), [])
      })
      t.test('returns the last failure', async t => {
        const wanted = [
          { name: `test-name`, version: 'test-version-one' },
          { name: `test-name`, version: 'test-version-two' },
        ]
        const current = { name: `test-name`, version: 'test-version-three' }
        t.same(parseDevEngines({ [env]: wanted }, { [env]: current }), [
          Object.assign(new Error(`Invalid engine "${env}"`), {
            errors: [
              // eslint-disable-next-line max-len
              new Error(`Invalid version "test-version-one" does not match "test-version-three" for "${env}"`),
              // eslint-disable-next-line max-len
              new Error(`Invalid version "test-version-two" does not match "test-version-three" for "${env}"`),
            ],
            engine: env,
            isWarn: false,
            isError: true,
            current: { name: `test-name`, version: 'test-version-three' },
            required: [
              { name: `test-name`, version: 'test-version-one' },
              { name: `test-name`, version: 'test-version-two' },
            ],
          }),
        ])
      })
      t.test('unrecognized onFail', async t => {
        const wanted = { name: `test-name`, version: '^1.0.0', onFail: 'unrecognized' }
        const current = { name: `test-name`, version: '1.0.0' }
        t.throws(
          () => parseDevEngines({ [env]: wanted }, { [env]: current }),
          new Error(`Invalid onFail value "unrecognized" for "${env}"`)
        )
      })
      t.test('missing name', async t => {
        const wanted = { version: '^1.0.0' }
        const current = { name: `test-name`, version: '1.0.0' }
        t.throws(
          () => parseDevEngines({ [env]: wanted }, { [env]: current }),
          new Error(`Missing "name" property for "${env}"`)
        )
      })
      t.test('invalid name', async t => {
        const wanted = { name: `alpha` }
        const current = { name: `beta` }
        t.same(parseDevEngines({ [env]: wanted }, { [env]: current }), [
          Object.assign(new Error(`Invalid engine "${env}"`), {
            errors: [
              new Error(`Invalid name "alpha" does not match "beta" for "${env}"`),
            ],
            engine: env,
            isWarn: false,
            isError: true,
            current,
            required: wanted,
          }),
        ])
      })
      t.test('missing version', async t => {
        const wanted = { name: `alpha`, version: '1' }
        const current = { name: `alpha` }
        t.throws(
          () => parseDevEngines({ [env]: wanted }, { [env]: current }),
          new Error(`Unable to determine "version" for "${env}" "alpha"`)
        )
      })
    })
  }
})
