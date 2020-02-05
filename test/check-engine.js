const t = require('tap')
const {checkEngine} = require('../index.js')

const e = (npm, node, _id = 'pkg@1.2.3') => {
  const engines = {}
  if (npm)
    engines.npm = npm
  if (node)
    engines.node = node
  return {engines, _id}
}

t.test('no engine', async t =>
  checkEngine({}, '1.3.2', '0.2.1'))

t.test('empty engine object', async t =>
  checkEngine(e(), '1.1.2', '0.2.1'))

t.test('node version too old', async t =>
  t.throws(() => checkEngine(e(null, '0.10.24'), '1.1.2', '0.10.18'), {
    required: { node: '0.10.24' },
    code: 'EBADENGINE'
  }))

t.test('npm version too old', async t =>
  t.throws(() => checkEngine(e('^1.4.6'), '1.3.2', '0.2.1'), {
    required: { npm: '^1.4.6' },
    code: 'EBADENGINE'
  }))

t.test('force node version too old', async t =>
  checkEngine(e(null, '0.1.0', 'test@1.0.0'), '1.3.2', '0.2.1', true))

t.test('cannot force when npm version too old', async t =>
  t.throws(() => checkEngine(e('^1.4.6', null, 'test@1.0.0'), '1.3.2', '0.2.1'), {
    code: 'EBADENGINE'
  }))

t.test('npm prerelease', async t =>
  checkEngine(e('>=1.2.3','>=0.8'), '69.420.0-yolo', '69.420.0-yolo'))

t.test('node prerelease', async t =>
  checkEngine(e('>=1.2.3','>=0.8'), '1.2.3', '69.420.0-yolo'))

t.test('no node version', async t =>
  checkEngine(e('>=1.2.3','>=0.8'), '1.2.3', null))

t.test('no npm version', async t =>
  checkEngine(e('>=1.2.3','>=0.8'), null, '1.2.3'))
