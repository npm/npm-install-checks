const satisfies = require('semver/functions/satisfies')
const validRange = require('semver/ranges/valid')
const currentEnv = require('./current-env.js')

/*

interface DevEngines {
  cpu?: DevEngineDependency | DevEngineDependency[];
  libc?: DevEngineDependency | DevEngineDependency[];
  os?: DevEngineDependency | DevEngineDependency[];
  packageManager?: DevEngineDependency | DevEngineDependency[];
  runtime?: DevEngineDependency | DevEngineDependency[];
}

interface DevEngineDependency {
  name: string;
  version?: string;
  onFail?: 'ignore' | 'warn' | 'error' | 'download';
  download?: {
    url: string;
    algorithm?: string;
    digest?: string;
  }
}

*/

const envNames = ['packageManager', 'runtime', 'cpu', 'libc', 'os']

// Returns an object with the last failing entry of any given wanted entry, null if no failures
function checkDev (wanted = {}, current = {}, opts = {}) {
  const failures = {}
  for (const env of envNames) {
    let wantedEnv = wanted[env]
    if (wantedEnv) {
      const currentEnv = current[env]
      if (!Array.isArray(wantedEnv)) {
        wantedEnv = [wantedEnv]
      }
      // In case of failure we return the last entry to fail so we walk backwards and return the first failure
      for (let i = wantedEnv.length - 1; i > -1; i--) {
        const w = wantedEnv[i]
        if (!currentEnv) {
          failures[env] = w
          break
        }
        if (w.name !== currentEnv.name) {
          failures[env] = w
          break
        }
        if (w.version) {
          if (validRange(w.version)) {
            if (!satisfies(currentEnv.version, w.version, opts.semver)) {
              failures[env] = w
              break
            }
          } else if (currentEnv.version !== w.version) {
            failures[env] = w
            break
          }
        }
      }
    }
  }
  if (Object.keys(failures).length) {
    return failures
  }
  return null
}

function checkEngine (target, npmVer, nodeVer, force = false) {
  const nodev = force ? null : nodeVer
  const eng = target.engines
  const opt = { includePrerelease: true }
  if (!eng) {
    return
  }

  const nodeFail = nodev && eng.node && !satisfies(nodev, eng.node, opt)
  const npmFail = npmVer && eng.npm && !satisfies(npmVer, eng.npm, opt)
  if (nodeFail || npmFail) {
    throw Object.assign(new Error('Unsupported engine'), {
      pkgid: target._id,
      current: { node: nodeVer, npm: npmVer },
      required: eng,
      code: 'EBADENGINE',
    })
  }
}

function checkPlatform (target, force = false, environment = {}) {
  if (force) {
    return
  }

  const platform = environment.os || currentEnv.os()
  const cpu = environment.cpu || currentEnv.cpu()
  const osOk = target.os ? checkList(platform, target.os) : true
  const cpuOk = target.cpu ? checkList(cpu, target.cpu) : true

  let libcOk = true
  let libcFamily = null
  if (target.libc) {
    // libc checks only work in linux, any value is a failure if we aren't
    if (environment.libc) {
      libcOk = checkList(environment.libc, target.libc)
    } else if (platform !== 'linux') {
      libcOk = false
    } else {
      libcFamily = currentEnv.libcFamily()
      libcOk = libcFamily ? checkList(libcFamily, target.libc) : false
    }
  }

  if (!osOk || !cpuOk || !libcOk) {
    throw Object.assign(new Error('Unsupported platform'), {
      pkgid: target._id,
      current: {
        os: platform,
        cpu,
        libc: libcFamily,
      },
      required: {
        os: target.os,
        cpu: target.cpu,
        libc: target.libc,
      },
      code: 'EBADPLATFORM',
    })
  }
}

function checkList (value, list) {
  if (typeof list === 'string') {
    list = [list]
  }
  if (list.length === 1 && list[0] === 'any') {
    return true
  }
  // match none of the negated values, and at least one of the
  // non-negated values, if any are present.
  let negated = 0
  let match = false
  for (const entry of list) {
    const negate = entry.charAt(0) === '!'
    const test = negate ? entry.slice(1) : entry
    if (negate) {
      negated++
      if (value === test) {
        return false
      }
    } else {
      match = match || value === test
    }
  }
  return match || negated === list.length
}

module.exports = {
  // Used by npm-pick-manifest, "npm install -g npm", and arborist build-ideal-tree/reify
  checkEngine,
  // used by arborist build-ideal-tree/reify
  checkPlatform,
  // used by npm install for devEngines
  checkDev,
}
