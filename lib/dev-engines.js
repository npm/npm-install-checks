const satisfies = require('semver/functions/satisfies')
const validRange = require('semver/ranges/valid')

const recognizedOnFail = [
  'ignore',
  'warn',
  'error',
  'download',
]

const recognizedProperties = [
  'name',
  'version',
  'onFail',
]

const recognizedEngines = [
  'packageManager',
  'runtime',
  'cpu',
  'libc',
  'os',
]

function checkDevEnginesDep (wanted = {}, current = {}, opts = {}) {
  const { engine } = opts

  const properties = Object.keys(wanted)
  for (const prop of properties) {
    if (!recognizedProperties.includes(prop)) {
      throw new Error(`Invalid property "${prop}" for "${engine}"`)
    }
  }

  if (wanted.onFail && !recognizedOnFail.includes(wanted.onFail)) {
    throw new Error(`Invalid onFail value "${wanted.onFail}" for "${engine}"`)
  }

  if (!wanted.name) {
    throw new Error(`Missing "name" property for "${engine}"`)
  }

  if (!current.name) {
    throw new Error(`Unable to determine "name" for "${engine}"`)
  }

  if (wanted.name !== current.name) {
    return new Error(
      `Invalid name "${wanted.name}" does not match "${current.name}" for "${engine}"`
    )
  }

  if (wanted.version) {
    if (!current.version) {
      throw new Error(`Unable to determine "version" for "${engine}" "${wanted.name}"`)
    }
    if (validRange(wanted.version)) {
      if (!satisfies(current.version, wanted.version, opts.semver)) {
        return new Error(
          // eslint-disable-next-line max-len
          `Invalid semver version "${wanted.version}" does not match "${current.version}" for "${engine}"`
        )
      }
    } else if (wanted.version !== current.version) {
      return new Error(
        `Invalid version "${wanted.version}" does not match "${current.version}" for "${engine}"`
      )
    }
  }

  return true
}

function parseDevEngines (wanted = {}, current = {}, opts = {}) {
  return Object.keys(wanted).map(engine => {
    if (!recognizedEngines.includes(engine)) {
      throw new Error(`Invalid property "${engine}"`)
    }
    const dependencyAsAuthored = wanted[engine]
    const dependencies = [dependencyAsAuthored].flat()
    const lastDependency = dependencies[dependencies.length - 1]
    let onFail = lastDependency.onFail || 'error'
    if (onFail === 'download') {
      onFail = 'error'
    }
    const currentEngine = current[engine] || {}
    const depErrors = dependencies.map(dep => {
      return checkDevEnginesDep(dep, currentEngine, { ...opts, engine })
    })
    if (!depErrors.includes(true)) {
      return Object.assign(new Error(`Invalid engine "${engine}"`), {
        errors: depErrors.filter(v => v !== true),
        engine,
        isWarn: onFail === 'warn',
        isError: onFail === 'error',
        current: currentEngine,
        required: dependencyAsAuthored,
      })
    }
    return true
  }).filter(v => v !== true)
}

module.exports = {
  checkDevEnginesDep,
  parseDevEngines,
}
