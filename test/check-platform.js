const t = require('tap')
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
  let noCacheChckPtfm
  let PLATFORM = 'linux'
  let REPORT = {}
  let readFileSync
  let noCache = true

  function withCache (cb) {
    noCache = false
    cb()
    noCache = true
    withoutLibcCache()
  }

  function withoutLibcCache () {
    readFileSync = () => {
      throw new Error('File not found')
    }
    const original = t.mock('..', {
      '../lib/current-env': t.mock('../lib/current-env', {
        'node:fs': {
          readFileSync: () => {
            return readFileSync()
          },
        },
        'node:process': Object.defineProperty({
          report: {
            getReport: () => REPORT,
          },
        }, 'platform', {
          enumerable: true,
          get: () => PLATFORM,
        }),
      }),
    }).checkPlatform
    noCacheChckPtfm = (...args) => {
      try {
        original(...args)
      } finally {
        if (noCache) {
          withoutLibcCache()
        }
      }
    }
  }

  withoutLibcCache()

  t.test('fails when not in linux', (t) => {
    PLATFORM = 'darwin'

    t.throws(() => noCacheChckPtfm({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'fails for glibc when not in linux')
    t.throws(() => noCacheChckPtfm({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails for musl when not in linux')
    t.end()
  })

  t.test('glibc', (t) => {
    PLATFORM = 'linux'

    withCache(() => {
      readFileSync = () => 'this ldd file contains GNU C Library'
      t.doesNotThrow(() => noCacheChckPtfm({ libc: 'glibc' }),
        'allows glibc on glibc from ldd file')

      readFileSync = () => {
        throw new Error('File not found')
      }
      t.doesNotThrow(() => noCacheChckPtfm({ libc: 'glibc' }), 'allows glibc from ldd file cache')
    })

    REPORT = {}
    t.throws(() => noCacheChckPtfm({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'fails when report is missing header property')

    REPORT = { header: {} }
    t.throws(() => noCacheChckPtfm({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'fails when header is missing glibcVersionRuntime property')

    withCache(() => {
      REPORT = { header: { glibcVersionRuntime: '1' } }
      t.doesNotThrow(() => noCacheChckPtfm({ libc: 'glibc' }), 'allows glibc on glibc')

      REPORT = {}
      t.doesNotThrow(() => noCacheChckPtfm({ libc: 'glibc' }), 'allows glibc from report cache')
    })

    readFileSync = () => 'this ldd file is unsupported'
    t.throws(() => noCacheChckPtfm({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'fails when ldd file exists but is not something known')

    t.throws(() => noCacheChckPtfm({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'does not allow musl on glibc')

    t.end()
  })

  t.test('musl', (t) => {
    PLATFORM = 'linux'

    readFileSync = () => 'this ldd file contains musl'
    t.doesNotThrow(() => noCacheChckPtfm({ libc: 'musl' }), 'allows musl on musl from ldd file')

    REPORT = {}
    t.throws(() => noCacheChckPtfm({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails when report is missing sharedObjects property')

    REPORT = { sharedObjects: {} }
    t.throws(() => noCacheChckPtfm({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails when sharedObjects property is not an array')

    REPORT = { sharedObjects: [] }
    t.throws(() => noCacheChckPtfm({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails when sharedObjects does not contain musl')

    REPORT = { sharedObjects: ['ld-musl-foo'] }
    t.doesNotThrow(() => noCacheChckPtfm({ libc: 'musl' }), 'allows musl on musl as ld-musl-')

    REPORT = { sharedObjects: ['libc.musl-'] }
    t.doesNotThrow(() => noCacheChckPtfm({ libc: 'musl' }), 'allows musl on musl as libc.musl-')

    t.throws(() => noCacheChckPtfm({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'does not allow glibc on musl')

    t.end()
  })

  t.end()
})
