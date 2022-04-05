# Changelog

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
