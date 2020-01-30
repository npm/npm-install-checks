const t = require('tap')
const {checkPlatform} = require('../index.js')

t.test('target cpu wrong', async t =>
  t.throws(() => checkPlatform({
    cpu: 'enten-cpu',
    os: 'any'
  }), { code: 'EBADPLATFORM' }))

t.test('os wrong', async t =>
  t.throws(() => checkPlatform({
    cpu: 'any',
    os: 'enten-os'
  }), { code: 'EBADPLATFORM' }))

t.test('nothing wrong', async t =>
  checkPlatform({cpu: 'any', os: 'any'}))

t.test('force', async t =>
  checkPlatform({ cpu: 'enten-cpu', os: 'any' }, true))

t.test('no opinions', async t =>
  checkPlatform({}))

t.test('only target cpu wrong', async t =>
  t.throws(() => checkPlatform({ cpu: 'enten-cpu' }), { code: 'EBADPLATFORM' }))

t.test('only os wrong', async t =>
  t.throws(() => checkPlatform({ os: 'enten-os' }), { code: 'EBADPLATFORM' }))

t.test('everything wrong w/arrays', async t =>
  t.throws(() => checkPlatform({
    cpu: ['enten-cpu'],
    os: ['enten-os']
  }), { code: 'EBADPLATFORM' }))

t.test('os wrong (negation)', async t =>
  t.throws(() => checkPlatform({
    cpu: 'any',
    os: '!' + process.platform
  }), { code: 'EBADPLATFORM' }))

t.test('nothing wrong (negation)', async t =>
  checkPlatform({ cpu: '!enten-cpu', os: '!enten-os' }))
