const satisfies = require('semver/functions/satisfies')
const validRange = require('semver/ranges/valid')

const ON_FAIL_IGNORE = 'ignore'
const ON_FAIL_WARN = 'warn'
const ON_FAIL_ERROR = 'error'
const ON_FAIL_DOWNLOAD = 'download'
const recognizedOnFail = [
  ON_FAIL_IGNORE,
  ON_FAIL_WARN,
  ON_FAIL_ERROR,
  ON_FAIL_DOWNLOAD,
]

const PROP_NAME = 'name'
const PROP_VERSION = 'version'
const PROP_ONFAIL = 'onFail'
const recognizedProperties = [
  PROP_NAME,
  PROP_VERSION,
  PROP_ONFAIL,
]

const ENGINE_PACKAGE_MANAGER = 'packageManager'
const ENGINE_RUNTIME = 'runtime'
const ENGINE_CPU = 'cpu'
const ENGINE_LIBC = 'libc'
const ENGINE_OS = 'os'
const recognizedEngines = [
  ENGINE_PACKAGE_MANAGER,
  ENGINE_RUNTIME,
  ENGINE_CPU,
  ENGINE_LIBC,
  ENGINE_OS,
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
    let onFail = lastDependency.onFail || ON_FAIL_ERROR
    if (onFail === ON_FAIL_DOWNLOAD) {
      onFail = ON_FAIL_ERROR
    }
    const currentEngine = current[engine] || {}
    const depErrors = dependencies.map(dep => {
      return checkDevEnginesDep(dep, currentEngine, { ...opts, engine })
    })
    if (!depErrors.includes(true)) {
      return Object.assign(new Error(`Invalid engine "${engine}"`), {
        errors: depErrors.filter(v => v !== true),
        engine,
        isWarn: onFail === ON_FAIL_WARN,
        isError: onFail === ON_FAIL_ERROR,
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
