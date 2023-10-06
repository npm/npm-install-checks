# Changelog

## [6.3.0](https://github.com/npm/npm-install-checks/compare/v6.2.0...v6.3.0) (2023-10-06)

### Features

* [`0419751`](https://github.com/npm/npm-install-checks/commit/04197512179c508abb55fa528d293ee669c19b91) [#71](https://github.com/npm/npm-install-checks/pull/71) allow checkPlatform to override execution libc (#71) (@Brooooooklyn)

## [6.2.0](https://github.com/npm/npm-install-checks/compare/v6.1.1...v6.2.0) (2023-08-07)

### Features

* [`7a3f5ed`](https://github.com/npm/npm-install-checks/commit/7a3f5ed9ea21d99915e5d30f9d4eba01ac8af319) [#65](https://github.com/npm/npm-install-checks/pull/65) allow checkPlatform to override execution environment (#65) (@yukukotani)

## [6.1.1](https://github.com/npm/npm-install-checks/compare/v6.1.0...v6.1.1) (2023-04-12)

### Bug Fixes

* [`7a93622`](https://github.com/npm/npm-install-checks/commit/7a936221e4bd9db38b5be2746b514cceff3574f6) [#57](https://github.com/npm/npm-install-checks/pull/57) typo glibcRuntimeVersion glibcVersionRuntime (#57) (@snyamathi)

## [6.1.0](https://github.com/npm/npm-install-checks/compare/v6.0.0...v6.1.0) (2023-03-21)

### Features

* [`1b6f3e4`](https://github.com/npm/npm-install-checks/commit/1b6f3e48e2fa7dda70850a16726cd58be826baf7) [#54](https://github.com/npm/npm-install-checks/pull/54) support libc field checks (#54) (@nlf)

## [6.0.0](https://github.com/npm/npm-install-checks/compare/v5.0.0...v6.0.0) (2022-10-10)

### ⚠️ BREAKING CHANGES

* `npm-install-checks` is now compatible with the following semver range for node: `^14.17.0 || ^16.13.0 || >=18.0.0`

### Features

* [`f7c1276`](https://github.com/npm/npm-install-checks/commit/f7c12765c0d2c4066af38819ada408ef71ed9bd4) [#38](https://github.com/npm/npm-install-checks/pull/38) postinstall for dependabot template-oss PR (@lukekarrys)

## [5.0.0](https://github.com/npm/npm-install-checks/compare/v4.0.0...v5.0.0) (2022-04-05)


### ⚠ BREAKING CHANGES

* this drops support for node 10 and non-LTS versions of node 12 and node 14

### Dependencies

* @npmcli/template-oss@3.2.2 ([45e7fd5](https://github.com/npm/npm-install-checks/commit/45e7fd5dee0c5137825c75acbc62eacc7d0c0d08))

## v4.0

* Remove `checkCycle` and `checkGit`, as they are no longer used in npm v7
* Synchronous throw-or-return API instead of taking a callback needlessly
* Modernize code and drop support for node versions less than 10

## v3 2016-01-12

* Change error messages to be more informative.
* checkEngine, when not in strict mode, now calls back with the error
  object as the second argument instead of warning.
* checkCycle no longer logs when cycle errors are found.

## v2 2015-01-20

* Remove checking of engineStrict in the package.json
