const t = require('tap')
const { checkDev } = require('..')

t.test('empty params', async t => {
  t.equal(checkDev(), null)
})

t.test('tests all the right fields', async t => {
  for (const env of ['packageManager', 'runtime', 'cpu', 'libc', 'os']) {
    t.test(`field - ${env}`, async t => {
      t.test('current name does not match, wanted has extra attribute', async t => {
        const wanted = { name: `test-${env}-wanted`, extra: `test-${env}-extra` }
        const current = { name: `test-${env}-current` }
        t.same(checkDev({ [env]: wanted }, { [env]: current }), { [env]: wanted })
      })
      t.test('current is not given', async t => {
        const wanted = { name: `test-${env}-wanted` }
        t.same(checkDev({ [env]: wanted }), { [env]: wanted })
      })
      t.test('name only', async t => {
        const wanted = { name: 'test-name' }
        const current = { name: 'test-name' }
        t.same(checkDev({ [env]: wanted }, { [env]: current}), null)
      })
      t.test('non-semver version is not the same', async t => {
        const wanted = { name: `test-name`, version: 'test-version-wanted' }
        const current = { name: `test-name`, version: 'test-version-current' }
        t.same(checkDev({ [env]: wanted }, { [env]: current }), { [env]: wanted })
      })
      t.test('non-semver version is the same', async t => {
        const wanted = { name: `test-name`, version: 'test-version' }
        const current = { name: `test-name`, version: 'test-version' }
        t.same(checkDev({ [env]: wanted }, { [env]: current }), null)
      })
      t.test('semver version is not in range', async t => {
        const wanted = { name: `test-name`, version: '^1.0.0' }
        const current = { name: `test-name`, version: '2.0.0' }
        t.same(checkDev({ [env]: wanted }, { [env]: current }), { [env]: wanted })
      })
      t.test('semver version is in range', async t => {
        const wanted = { name: `test-name`, version: '^1.0.0' }
        const current = { name: `test-name`, version: '1.0.0' }
        t.same(checkDev({ [env]: wanted }, { [env]: current }), null)
      })
      t.test('returns the last failure', async t => {
        const wanted = [
          { name: `test-name`, version: 'test-version-one' },
          { name: `test-name`, version: 'test-version-two' },
        ]
        const current = { name: `test-name`, version: 'test-version-three' }
        t.same(checkDev({ [env]: wanted }, { [env]: current }), { [env]: wanted[1] })
      })
    })
  }
})
