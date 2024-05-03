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
