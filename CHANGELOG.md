# Changelog

## [7.1.0](https://github.com/npm/npm-install-checks/compare/v7.0.0...v7.1.0) (2024-09-11)
### Features
* [`ebf9b9f`](https://github.com/npm/npm-install-checks/commit/ebf9b9f4c08035d8e2c41cd9bc3302cd8bdc9184) [#116](https://github.com/npm/npm-install-checks/pull/116) adds checkDevEngines (#116) (@reggi)
### Bug Fixes
* [`ec4066b`](https://github.com/npm/npm-install-checks/commit/ec4066b768075cc84270d9ee7c0a76b011f1555a) [#118](https://github.com/npm/npm-install-checks/pull/118) skip network requests in report.getReport() (#118) (@wraithgar)

## [7.0.0](https://github.com/npm/npm-install-checks/compare/v6.3.0...v7.0.0) (2024-09-03)
### ⚠️ BREAKING CHANGES
* `npm-install-checks` now supports node `^18.17.0 || >=20.5.0`
### Bug Fixes
* [`0ac00b5`](https://github.com/npm/npm-install-checks/commit/0ac00b53862de606e7163d8ca2b8d4dda8476a89) [#114](https://github.com/npm/npm-install-checks/pull/114) align to npm 10 node engine range (@hashtagchris)
### Chores
* [`771bc19`](https://github.com/npm/npm-install-checks/commit/771bc19142bc83639810a157e9dfe9ca83caab77) [#114](https://github.com/npm/npm-install-checks/pull/114) run template-oss-apply (@hashtagchris)
* [`d7cf1dc`](https://github.com/npm/npm-install-checks/commit/d7cf1dcf963aec10a75a8af31894038bd8afba24) [#112](https://github.com/npm/npm-install-checks/pull/112) bump @npmcli/eslint-config from 4.0.5 to 5.0.0 (@dependabot[bot])
* [`98057a0`](https://github.com/npm/npm-install-checks/commit/98057a03bbb985741a512e9161690ea22a1c62e5) [#98](https://github.com/npm/npm-install-checks/pull/98) linting: no-unused-vars (@lukekarrys)
* [`f1670ca`](https://github.com/npm/npm-install-checks/commit/f1670ca26af7823224c8bed36eb321a98206a5d5) [#98](https://github.com/npm/npm-install-checks/pull/98) bump @npmcli/template-oss to 4.22.0 (@lukekarrys)
* [`06fdf5e`](https://github.com/npm/npm-install-checks/commit/06fdf5e89cfabe38af510bb6f929f1756826e706) [#113](https://github.com/npm/npm-install-checks/pull/113) postinstall for dependabot template-oss PR (@hashtagchris)
* [`8b7cd81`](https://github.com/npm/npm-install-checks/commit/8b7cd81b9ad0168a81d294aad501e5c203626782) [#113](https://github.com/npm/npm-install-checks/pull/113) bump @npmcli/template-oss from 4.23.1 to 4.23.3 (@dependabot[bot])

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
