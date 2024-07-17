const process = require('node:process')

function os () {
  return process.platform
}

function cpu () {
  return process.arch
}

function isMusl (file) {
  return file.includes('libc.musl-') || file.includes('ld-musl-')
}

// libc checks only work in linux, environment and os check needs to happen out of band from this function
function libcFamily () {
  let family = null
  const report = process.report.getReport()
  if (report.header?.glibcVersionRuntime) {
    family = 'glibc'
  } else if (Array.isArray(report.sharedObjects) && report.sharedObjects.some(isMusl)) {
    family = 'musl'
  }
  return family
}

module.exports = {
  cpu,
  libcFamily,
  os,
}
