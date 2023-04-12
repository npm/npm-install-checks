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

t.test('nothing wrong', async t =>
  checkPlatform({ cpu: 'any', os: 'any' }))

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
    os: ['enten-os'],
  }), { code: 'EBADPLATFORM' }))

t.test('os wrong (negation)', async t =>
  t.throws(() => checkPlatform({
    cpu: 'any',
    os: '!' + process.platform,
  }), { code: 'EBADPLATFORM' }))

t.test('nothing wrong (negation)', async t =>
  checkPlatform({ cpu: '!enten-cpu', os: '!enten-os' }))

t.test('libc', (t) => {
  let PLATFORM = ''

  const _processPlatform = Object.getOwnPropertyDescriptor(process, 'platform')
  Object.defineProperty(process, 'platform', {
    enumerable: true,
    configurable: true,
    get: () => PLATFORM,
  })

  let REPORT = {}
  const _processReport = process.report.getReport
  process.report.getReport = () => REPORT

  t.teardown(() => {
    Object.defineProperty(process, 'platform', _processPlatform)
    process.report.getReport = _processReport
  })

  t.test('fails when not in linux', (t) => {
    PLATFORM = 'darwin'

    t.throws(() => checkPlatform({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'fails for glibc when not in linux')
    t.throws(() => checkPlatform({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails for musl when not in linux')
    t.end()
  })

  t.test('glibc', (t) => {
    PLATFORM = 'linux'

    REPORT = {}
    t.throws(() => checkPlatform({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'fails when report is missing header property')

    REPORT = { header: {} }
    t.throws(() => checkPlatform({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'fails when header is missing glibcVersionRuntime property')

    REPORT = { header: { glibcVersionRuntime: '1' } }
    t.doesNotThrow(() => checkPlatform({ libc: 'glibc' }), 'allows glibc on glibc')
    t.throws(() => checkPlatform({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'does not allow musl on glibc')

    t.end()
  })

  t.test('musl', (t) => {
    PLATFORM = 'linux'

    REPORT = {}
    t.throws(() => checkPlatform({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails when report is missing sharedObjects property')

    REPORT = { sharedObjects: {} }
    t.throws(() => checkPlatform({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails when sharedObjects property is not an array')

    REPORT = { sharedObjects: [] }
    t.throws(() => checkPlatform({ libc: 'musl' }), { code: 'EBADPLATFORM' },
      'fails when sharedObjects does not contain musl')

    REPORT = { sharedObjects: ['ld-musl-foo'] }
    t.doesNotThrow(() => checkPlatform({ libc: 'musl' }), 'allows musl on musl as ld-musl-')

    REPORT = { sharedObjects: ['libc.musl-'] }
    t.doesNotThrow(() => checkPlatform({ libc: 'musl' }), 'allows musl on musl as libc.musl-')

    t.throws(() => checkPlatform({ libc: 'glibc' }), { code: 'EBADPLATFORM' },
      'does not allow glibc on musl')

    t.end()
  })

  t.end()
})
