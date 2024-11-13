const t = require('tap')
const rewiremock = require('rewiremock/node')
rewiremock.overrideEntryPoint(module)

const { checkPlatform } = require('..')

t.test('target cpu wrong', async t =>
  t.throws(() => checkPlatform({
    cpu: 'enten-cpu',
    os: 'any',
  }), { code: 'EBADPLATFORM' }))

t.test('os wrong', async t =>
  t.throws(() => checkPlatform({
    cpu: 'any',
    os: 'enten-os',
  }), { code: 'EBADPLATFORM' }))

t.test('nothing wrong', async () =>
  checkPlatform({ cpu: 'any', os: 'any' }))

t.test('force', async () =>
  checkPlatform({ cpu: 'enten-cpu', os: 'any' }, true))

t.test('no opinions', async () =>
  checkPlatform({}))

t.test('only target cpu wrong', async t =>
  t.throws(() => checkPlatform({ cpu: 'enten-cpu' }), { code: 'EBADPLATFORM' }))

t.test('only os wrong', async t =>
  t.throws(() => checkPlatform({ os: 'enten-os' }), { code: 'EBADPLATFORM' }))

t.test('everything wrong w/arrays', async t =>
  t.throws(() => checkPlatform({
    cpu: ['enten-cpu'],
    os: ['enten-os'],
  }), { code: 'EBADPLATFORM' }))

t.test('os wrong (negation)', async t =>
  t.throws(() => checkPlatform({
    cpu: 'any',
    os: '!' + process.platform,
  }), { code: 'EBADPLATFORM' }))

t.test('nothing wrong (negation)', async () =>
  checkPlatform({ cpu: '!enten-cpu', os: '!enten-os' }))

t.test('nothing wrong with overridden os', async () =>
  checkPlatform({
    cpu: 'any',
    os: 'enten-os',
  }, false, {
    os: 'enten-os',
  }))

t.test('nothing wrong with overridden cpu', async () =>
  checkPlatform({
    cpu: 'enten-cpu',
    os: 'any',
  }, false, {
    cpu: 'enten-cpu',
  }))

t.test('nothing wrong with overridden libc', async () =>
  checkPlatform({
    cpu: 'enten-cpu',
    libc: 'enten-libc',
  }, false, {
    cpu: 'enten-cpu',
    libc: 'enten-libc',
  }))

t.test('wrong os with overridden os', async t =>
  t.throws(() => checkPlatform({
    cpu: 'any',
    os: 'enten-os',
  }, false, {
    os: 'another-os',
  }), { code: 'EBADPLATFORM' }))

t.test('wrong cpu with overridden cpu', async t =>
  t.throws(() => checkPlatform({
    cpu: 'enten-cpu',
    os: 'any',
  }, false, {
    cpu: 'another-cpu',
  }), { code: 'EBADPLATFORM' }))

t.test('wrong libc with overridden libc', async t =>
  t.throws(() => checkPlatform({
    cpu: 'enten-cpu',
    os: 'any',
    libc: 'enten-libc',
  }, false, {
    libc: 'another-libc',
  }), { code: 'EBADPLATFORM' }))

t.test('libc', (t) => {
  t.test('fails when not in linux', (t) => {
    const checkPlatformProxy = rewiremock.proxy(() => require('../'), {
      'detect-libc': {
        familySync: () => undefined,
      },
      'node:process': {
        platform: 'darwin',
      },
    })

    t.throws(() => checkPlatformProxy.checkPlatform({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'fails for glibc when not in linux')
    t.throws(() => checkPlatformProxy.checkPlatform({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails for musl when not in linux')
    t.end()
  })

  t.test('glibc', (t) => {
    const checkPlatformProxy = rewiremock.proxy(() => require('../'), {
      'detect-libc': {
        familySync: () => 'glibc',
      },
      'node:process': {
        platform: 'linux',
      },
    })

    t.doesNotThrow(
      () => checkPlatformProxy.checkPlatform({ libc: 'glibc' }),
      'allows glibc on glibc'
    )
    t.throws(() => checkPlatformProxy.checkPlatform({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'does not allow musl on glibc')

    t.end()
  })

  t.test('musl', (t) => {
    const checkPlatformProxy = rewiremock.proxy(() => require('../'), {
      'detect-libc': {
        familySync: () => 'musl',
      },
      'node:process': {
        platform: 'linux',
      },
    })

    t.doesNotThrow(() => checkPlatformProxy.checkPlatform({ libc: 'musl' }), 'allows musl on musl')
    t.throws(() => checkPlatformProxy.checkPlatform({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'does not allow glibc on musl')

    t.end()
  })

  t.end()
})
