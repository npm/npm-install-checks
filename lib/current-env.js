const process = require('node:process')
const nodeOs = require('node:os')
const { familySync } = require('detect-libc')

function os () {
  return process.platform
}

function cpu () {
  return process.arch
}

function libc () {
  return familySync() || undefined
}

function devEngines (env = {}) {
  const osName = env.os || os()
  return {
    cpu: {
      name: env.cpu || cpu(),
    },
    libc: {
      name: env.libc || libc(),
    },
    os: {
      name: osName,
      version: env.osVersion || nodeOs.release(),
    },
    packageManager: {
      name: 'npm',
      version: env.npmVersion,
    },
    runtime: {
      name: 'node',
      version: env.nodeVersion || process.version,
    },
  }
}

module.exports = {
  cpu,
  libc,
  os,
  devEngines,
}
