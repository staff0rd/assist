## [0.231.1](https://github.com/staff0rd/assist/compare/v0.231.0...v0.231.1) (2026-06-04)


### Bug Fixes

* use theme contrast for backlog chips ([8489663](https://github.com/staff0rd/assist/commit/84896633a64e0127c0642e93197cec87035958ab))

# [0.231.0](https://github.com/staff0rd/assist/compare/v0.230.1...v0.231.0) (2026-06-04)


### Features

* backlog run/next default to auto mode ([dc56bff](https://github.com/staff0rd/assist/commit/dc56bffbd2ff6071600adf107b9e17062277740b))

## [0.230.1](https://github.com/staff0rd/assist/compare/v0.230.0...v0.230.1) (2026-06-04)


### Performance Improvements

* targeted per-item backlog writes ([e576d02](https://github.com/staff0rd/assist/commit/e576d0274d844b030a4ca07a873de6e2ad974cea))

# [0.230.0](https://github.com/staff0rd/assist/compare/v0.229.0...v0.230.0) (2026-06-04)


### Features

* more claude.md ([8b2ce6b](https://github.com/staff0rd/assist/commit/8b2ce6b5036e388867f3a389ad900dbab62fa86b))

# [0.229.0](https://github.com/staff0rd/assist/compare/v0.228.0...v0.229.0) (2026-06-03)


### Features

* smaller list labels ([3a603eb](https://github.com/staff0rd/assist/commit/3a603ebfdc04bd83cb80fccde6f1aaa02e6496f1))

# [0.228.0](https://github.com/staff0rd/assist/compare/v0.227.0...v0.228.0) (2026-06-03)


### Features

* batch backlog queries via Drizzle ([7c5a00e](https://github.com/staff0rd/assist/commit/7c5a00e69c05a3867c6608c34c60c5cedc93a0a7))

# [0.227.0](https://github.com/staff0rd/assist/compare/v0.226.1...v0.227.0) (2026-06-03)


### Features

* backlog export/import via COPY ([ccb6165](https://github.com/staff0rd/assist/commit/ccb6165f70ed4d85f46c101cc3fe8c296f98a3dd))
* run phases in auto mode ([c393f1a](https://github.com/staff0rd/assist/commit/c393f1a04f5ab694e466876983fd93cccfd4b6e1))

## [0.226.1](https://github.com/staff0rd/assist/compare/v0.226.0...v0.226.1) (2026-06-02)


### Bug Fixes

* run phases added mid-run ([8bb4d6c](https://github.com/staff0rd/assist/commit/8bb4d6c96280fab7ba054b2518935295a6ba9b60))

# [0.226.0](https://github.com/staff0rd/assist/compare/v0.225.0...v0.226.0) (2026-06-02)


### Features

* deny piped assist complexity reads ([cd9c5a9](https://github.com/staff0rd/assist/commit/cd9c5a957cd6d2db4b4cf7ed64cfd49522b01a1d))

# [0.225.0](https://github.com/staff0rd/assist/compare/v0.224.1...v0.225.0) (2026-06-02)


### Features

* granular backlog list edits ([3d24e06](https://github.com/staff0rd/assist/commit/3d24e060891b45e7d995bcc69ae050a41017672e))

## [0.224.1](https://github.com/staff0rd/assist/compare/v0.224.0...v0.224.1) (2026-06-01)


### Bug Fixes

* drain pg pool so backlog cmds exit ([22db58f](https://github.com/staff0rd/assist/commit/22db58f56356e5c8ad02cb6d105a2f10075e883f))

# [0.224.0](https://github.com/staff0rd/assist/compare/v0.223.1...v0.224.0) (2026-06-01)


### Features

* auto-migrate local backlog into Postgres ([774abfe](https://github.com/staff0rd/assist/commit/774abfe87e2ecfeaca4468f7c14e8acaa6aefd7c))

## [0.223.1](https://github.com/staff0rd/assist/compare/v0.223.0...v0.223.1) (2026-06-01)


### Bug Fixes

* behaviour-focused /pr descriptions ([2957495](https://github.com/staff0rd/assist/commit/295749524f801efe6d43b59b512ed507bf195650))

# [0.223.0](https://github.com/staff0rd/assist/compare/v0.222.0...v0.223.0) (2026-05-27)


### Features

* gate handover + backlog on HANDOVER.md ([619684c](https://github.com/staff0rd/assist/commit/619684c499565dbaaa4b06603d95f313883a77f9))

# [0.222.0](https://github.com/staff0rd/assist/compare/v0.221.0...v0.222.0) (2026-05-26)


### Features

* allow assist handover writes ([ab574a5](https://github.com/staff0rd/assist/commit/ab574a55588e513febd83910b4525c0af052fce5))

# [0.221.0](https://github.com/staff0rd/assist/compare/v0.220.2...v0.221.0) (2026-05-25)


### Features

* handover and recall commands ([51731fd](https://github.com/staff0rd/assist/commit/51731fdd63ad4b579deedc83f90790fd75b7effb))

## [0.220.2](https://github.com/staff0rd/assist/compare/v0.220.1...v0.220.2) (2026-05-19)


### Bug Fixes

* surface reviewer failure details ([e18c61e](https://github.com/staff0rd/assist/commit/e18c61e2bff0bf47711159f588e811ceaa387cea))

## [0.220.1](https://github.com/staff0rd/assist/compare/v0.220.0...v0.220.1) (2026-05-18)


### Bug Fixes

* handle missing codex CLI in review ([1f4c14d](https://github.com/staff0rd/assist/commit/1f4c14d9dbb6724b654287da432e53aa6be28a54))

# [0.220.0](https://github.com/staff0rd/assist/compare/v0.219.0...v0.220.0) (2026-05-15)


### Features

* add sha mode to assist review ([9ec6d45](https://github.com/staff0rd/assist/commit/9ec6d456eec6aa69ccb847ff2a035b2e54290168))

# [0.219.0](https://github.com/staff0rd/assist/compare/v0.218.0...v0.219.0) (2026-05-15)


### Features

* merge codex guidelines into review prompt ([7cb3c34](https://github.com/staff0rd/assist/commit/7cb3c34ae0b14dd0eb8997b34aa0a4d3e63d3bc2))

# [0.218.0](https://github.com/staff0rd/assist/compare/v0.217.0...v0.218.0) (2026-05-13)


### Features

* add backlog stop command ([e853e05](https://github.com/staff0rd/assist/commit/e853e0552fbf8aec66e5e0a53067702678e82037))

# [0.217.0](https://github.com/staff0rd/assist/compare/v0.216.1...v0.217.0) (2026-05-13)


### Features

* /next [id] shortcut ([d45b12a](https://github.com/staff0rd/assist/commit/d45b12a3e15a45e2e5f66c69c03c138bc89d828e))

## [0.216.1](https://github.com/staff0rd/assist/compare/v0.216.0...v0.216.1) (2026-05-13)


### Bug Fixes

* /draft defers codebase reads ([07c0141](https://github.com/staff0rd/assist/commit/07c0141517a58c66a02a1fcf25d025cd394739e0))

# [0.216.0](https://github.com/staff0rd/assist/compare/v0.215.1...v0.216.0) (2026-05-13)


### Features

* replace madge with skott ([23bc487](https://github.com/staff0rd/assist/commit/23bc48758b6d4f4b7336cc3ef6ee3ea76667be90))

## [0.215.1](https://github.com/staff0rd/assist/compare/v0.215.0...v0.215.1) (2026-05-13)


### Bug Fixes

* rename symbol in monorepos ([e00ceca](https://github.com/staff0rd/assist/commit/e00ceca1d0828c3857f68de23d001d69e2614c9f))

# [0.215.0](https://github.com/staff0rd/assist/compare/v0.214.1...v0.215.0) (2026-05-12)


### Features

* assist review --apply flag ([87b0d2a](https://github.com/staff0rd/assist/commit/87b0d2ac01fa2c712865be674617258e8b4bbb74))

## [0.214.1](https://github.com/staff0rd/assist/compare/v0.214.0...v0.214.1) (2026-05-12)


### Bug Fixes

* severity rubric in review prompts ([258cfb8](https://github.com/staff0rd/assist/commit/258cfb8600ba49e7629c13eba74d6e2c64cf3bd3))

# [0.214.0](https://github.com/staff0rd/assist/compare/v0.213.0...v0.214.0) (2026-05-12)


### Bug Fixes

* review uses gh PR diff for input ([5146f6b](https://github.com/staff0rd/assist/commit/5146f6bdc271e210134a423eb027dcf5781046c7))


### Features

* add --refine flag to review ([24c7ab7](https://github.com/staff0rd/assist/commit/24c7ab7c414f8c17536698508ef30d2c309f1063))
* stacked spinners for review ([4d79a96](https://github.com/staff0rd/assist/commit/4d79a96a1dfaef1b153e6eb08dbd90f56dc9c0e8))

# [0.213.0](https://github.com/staff0rd/assist/compare/v0.212.0...v0.213.0) (2026-05-12)


### Features

* review reads prior PR comments ([abd483e](https://github.com/staff0rd/assist/commit/abd483e5ed7c0bbd51e48b9a251fca8926dedaf8))

# [0.212.0](https://github.com/staff0rd/assist/compare/v0.211.0...v0.212.0) (2026-05-12)


### Features

* add assist review command ([dd2ce0a](https://github.com/staff0rd/assist/commit/dd2ce0abb759f95b591fa39d1538bd7e1869711d))

# [0.211.0](https://github.com/staff0rd/assist/compare/v0.210.1...v0.211.0) (2026-05-07)


### Features

* add /verify-new slash command ([86980de](https://github.com/staff0rd/assist/commit/86980de736c70ba3e44e14e071134ddba45e6efc))

## [0.210.1](https://github.com/staff0rd/assist/compare/v0.210.0...v0.210.1) (2026-05-06)


### Bug Fixes

* prs gh calls prefer origin over upstream ([08eba1c](https://github.com/staff0rd/assist/commit/08eba1c3dbf7e3a3b35e5a41c8c694755a686529))

# [0.210.0](https://github.com/staff0rd/assist/compare/v0.209.1...v0.210.0) (2026-05-06)


### Features

* add /forward-comments command ([08e2792](https://github.com/staff0rd/assist/commit/08e2792b7a83452b63b6b549cecebc8e784a3706))

## [0.209.1](https://github.com/staff0rd/assist/compare/v0.209.0...v0.209.1) (2026-05-06)


### Bug Fixes

* backlog finds project root from subdirs ([4dd7ab4](https://github.com/staff0rd/assist/commit/4dd7ab46ee8d1efa671d9b41cebd7cfd6ad4c72e))

# [0.209.0](https://github.com/staff0rd/assist/compare/v0.208.0...v0.209.0) (2026-05-04)


### Features

* implement assist sql mutate ([8c7f22d](https://github.com/staff0rd/assist/commit/8c7f22db7459ee2f1b6b4b2cddb6ce6e4c689363))

# [0.208.0](https://github.com/staff0rd/assist/compare/v0.207.1...v0.208.0) (2026-05-04)


### Features

* add sql command for MSSQL queries ([b7c4da2](https://github.com/staff0rd/assist/commit/b7c4da2152901dc6982dc7b21f283e6d34819586))

## [0.207.1](https://github.com/staff0rd/assist/compare/v0.207.0...v0.207.1) (2026-05-04)


### Bug Fixes

* skip slash gen for verify: runs ([aa19dd9](https://github.com/staff0rd/assist/commit/aa19dd9fa1b7d1009aef0f23bad1483e5e62543b))

# [0.207.0](https://github.com/staff0rd/assist/compare/v0.206.2...v0.207.0) (2026-05-01)


### Features

* add mermaid export command ([dd6e127](https://github.com/staff0rd/assist/commit/dd6e127090a73564b2c17a03478fd331acd01bb8))

## [0.206.2](https://github.com/staff0rd/assist/compare/v0.206.1...v0.206.2) (2026-04-29)


### Bug Fixes

* resolve roam port file by channel ([84290b7](https://github.com/staff0rd/assist/commit/84290b734fa5d6f6da53e053fc010581f71cf4f1))

## [0.206.1](https://github.com/staff0rd/assist/compare/v0.206.0...v0.206.1) (2026-04-23)


### Bug Fixes

* support redirects to tmpdir ([fe691ea](https://github.com/staff0rd/assist/commit/fe691ea1c6788fd7abf3a9fd64a10477b23c7881))

# [0.206.0](https://github.com/staff0rd/assist/compare/v0.205.1...v0.206.0) (2026-04-22)


### Features

* verify init writes to assist.yml ([d0c426a](https://github.com/staff0rd/assist/commit/d0c426a55ae56508a88f485a3372c062942aa72e))

## [0.205.1](https://github.com/staff0rd/assist/compare/v0.205.0...v0.205.1) (2026-04-21)


### Bug Fixes

* run git log without shell ([b5a750e](https://github.com/staff0rd/assist/commit/b5a750e6363af2beeb7d4f62d2b2717deb05b551))

# [0.205.0](https://github.com/staff0rd/assist/compare/v0.204.0...v0.205.0) (2026-04-16)


### Features

* always show prompt input in sessions ([8bab208](https://github.com/staff0rd/assist/commit/8bab208bb08803714748d13fa0882bdffc13ff0f))

# [0.204.0](https://github.com/staff0rd/assist/compare/v0.203.0...v0.204.0) (2026-04-16)


### Features

* merge web UIs into single MUI app ([425984b](https://github.com/staff0rd/assist/commit/425984b04800766713c3ffddb6a36678f630360d))

# [0.203.0](https://github.com/staff0rd/assist/compare/v0.202.0...v0.203.0) (2026-04-16)


### Features

* global deny config support ([ac282e5](https://github.com/staff0rd/assist/commit/ac282e5b63959fe4bda388a757a65d9346cd0a3b))

# [0.202.0](https://github.com/staff0rd/assist/compare/v0.201.0...v0.202.0) (2026-04-16)


### Features

* assist mode buttons in web UI ([cb59e0d](https://github.com/staff0rd/assist/commit/cb59e0d7e794f0911647832ddc79be0bb31c694f))

# [0.201.0](https://github.com/staff0rd/assist/compare/v0.200.0...v0.201.0) (2026-04-16)


### Features

* roam activity commands for codex ([765ffc5](https://github.com/staff0rd/assist/commit/765ffc5cb698c93f02a14a8c88cf330c2a400eab))

# [0.200.0](https://github.com/staff0rd/assist/compare/v0.199.1...v0.200.0) (2026-04-15)


### Features

* card button hover states ([dade055](https://github.com/staff0rd/assist/commit/dade05578db932e9c40e8ac73589eb8d2f0a8244))

## [0.199.1](https://github.com/staff0rd/assist/compare/v0.199.0...v0.199.1) (2026-04-15)


### Bug Fixes

* cross-platform browser open ([bf2d693](https://github.com/staff0rd/assist/commit/bf2d6933f11577b5c0afd9ef5ed0b454416d0b16))

# [0.199.0](https://github.com/staff0rd/assist/compare/v0.198.0...v0.199.0) (2026-04-15)


### Features

* default to sessions when no command ([1165939](https://github.com/staff0rd/assist/commit/1165939930c3da10c22666df920002c54a76386a))

# [0.198.0](https://github.com/staff0rd/assist/compare/v0.197.0...v0.198.0) (2026-04-15)


### Features

* run session retry button ([e1350e9](https://github.com/staff0rd/assist/commit/e1350e9a84f42b9a2e41241e9578d79f7b4f55b0))
* web UI run command execution ([f1b7ea9](https://github.com/staff0rd/assist/commit/f1b7ea92424a763265ae6ebbfc7680114a9351b9))

# [0.197.0](https://github.com/staff0rd/assist/compare/v0.196.1...v0.197.0) (2026-04-15)


### Features

* session summarise command ([f81f3c9](https://github.com/staff0rd/assist/commit/f81f3c95d304389832ab356a5f5c95eb17fbe646))

## [0.196.1](https://github.com/staff0rd/assist/compare/v0.196.0...v0.196.1) (2026-04-15)


### Bug Fixes

* suffix matching for assist run ([23d3159](https://github.com/staff0rd/assist/commit/23d31599cb5b4e5b3cb0815582cba3777e66c0b6))

# [0.196.0](https://github.com/staff0rd/assist/compare/v0.195.3...v0.196.0) (2026-04-15)


### Features

* prompt frequency analyzer ([809cf99](https://github.com/staff0rd/assist/commit/809cf99b20c45f4075d8e033cb06529791b63f79))

## [0.195.3](https://github.com/staff0rd/assist/compare/v0.195.2...v0.195.3) (2026-04-15)


### Bug Fixes

* parse PowerShell $null redirects ([6d033ee](https://github.com/staff0rd/assist/commit/6d033eedd7ec089242f30c6e2b5829461417a729))

## [0.195.2](https://github.com/staff0rd/assist/compare/v0.195.1...v0.195.2) (2026-04-15)


### Bug Fixes

* remove caveman skill prefix ([a5b2d91](https://github.com/staff0rd/assist/commit/a5b2d910ba54a6f0f9037fb7c6064a7f0703722a))

## [0.195.1](https://github.com/staff0rd/assist/compare/v0.195.0...v0.195.1) (2026-04-15)


### Bug Fixes

* seq timestamp filter guard + relative time ([5bbbc39](https://github.com/staff0rd/assist/commit/5bbbc39b925167e7653552fd8a171a59d8eb489e))

# [0.195.0](https://github.com/staff0rd/assist/compare/v0.194.0...v0.195.0) (2026-04-15)


### Features

* backlog web view phase rewind ([b7f7927](https://github.com/staff0rd/assist/commit/b7f7927aa4ec7d4ea13f75f26530e8b2b079631d))

# [0.194.0](https://github.com/staff0rd/assist/compare/v0.193.1...v0.194.0) (2026-04-14)


### Features

* repo selector on new session form ([c5f3ef7](https://github.com/staff0rd/assist/commit/c5f3ef7dc5c136a1c48e03bb8ceb8d60b05c9c8f))

## [0.193.1](https://github.com/staff0rd/assist/compare/v0.193.0...v0.193.1) (2026-04-14)


### Bug Fixes

* soften backlog help discovery hint ([6dcfc2e](https://github.com/staff0rd/assist/commit/6dcfc2eba88387dfce24125a1d1cdc7404f593d9))

# [0.193.0](https://github.com/staff0rd/assist/compare/v0.192.0...v0.193.0) (2026-04-13)


### Features

* add session history and resume ([0d5d8c4](https://github.com/staff0rd/assist/commit/0d5d8c482a71398aaa989fc285a6c632419d65cb))

# [0.192.0](https://github.com/staff0rd/assist/compare/v0.191.3...v0.192.0) (2026-04-13)


### Features

* add sessions web dashboard ([de166d6](https://github.com/staff0rd/assist/commit/de166d609de5a5dd34f58ade90718ed630b334fa))

## [0.191.3](https://github.com/staff0rd/assist/compare/v0.191.2...v0.191.3) (2026-04-13)


### Bug Fixes

* use fully qualified caveman skill name ([c1893db](https://github.com/staff0rd/assist/commit/c1893dbd4953675bf8ab15d3724013d0d676825f))

## [0.191.2](https://github.com/staff0rd/assist/compare/v0.191.1...v0.191.2) (2026-04-10)


### Bug Fixes

* approve shell builtins true/false ([8c4a28b](https://github.com/staff0rd/assist/commit/8c4a28bc588c3749598e0f15894f32397f3421af))

## [0.191.1](https://github.com/staff0rd/assist/compare/v0.191.0...v0.191.1) (2026-04-10)


### Bug Fixes

* convert literal \n to newlines in --desc ([f19e3be](https://github.com/staff0rd/assist/commit/f19e3bebec6c1cfdc910d5807c36dcc56a1897f5))

# [0.191.0](https://github.com/staff0rd/assist/compare/v0.190.0...v0.191.0) (2026-04-10)


### Features

* caveman config to prefix spawn prompts ([e575268](https://github.com/staff0rd/assist/commit/e5752684502bbb2028545d1808e580bdcca63a90))

# [0.190.0](https://github.com/staff0rd/assist/compare/v0.189.3...v0.190.0) (2026-04-10)


### Features

* approve cd to Read-allowed dirs ([39d59f4](https://github.com/staff0rd/assist/commit/39d59f4655df3f1c8b54e8cff00c08d63b49607e))

## [0.189.3](https://github.com/staff0rd/assist/compare/v0.189.2...v0.189.3) (2026-04-10)


### Bug Fixes

* defer FK checks in reindexPhases ([68dc147](https://github.com/staff0rd/assist/commit/68dc147a8f46ec7cd674fd938aafc94c5ced37bf))

## [0.189.2](https://github.com/staff0rd/assist/compare/v0.189.1...v0.189.2) (2026-04-10)


### Bug Fixes

* handle CRLF in ensureGitignore ([3090059](https://github.com/staff0rd/assist/commit/309005951b6c8b6acf5e1548fc7306aa4d29cd0a))

## [0.189.1](https://github.com/staff0rd/assist/compare/v0.189.0...v0.189.1) (2026-04-09)


### Bug Fixes

* resolve bash and run prefix on Windows ([2567711](https://github.com/staff0rd/assist/commit/256771111d7d7120e6283bae5df5100caa093e4f))

# [0.189.0](https://github.com/staff0rd/assist/compare/v0.188.0...v0.189.0) (2026-04-09)


### Features

* linked run configs from external projects ([d605302](https://github.com/staff0rd/assist/commit/d6053024dcdaecc2f0f84af2728d9a3b4372bc09))

# [0.188.0](https://github.com/staff0rd/assist/compare/v0.187.0...v0.188.0) (2026-04-09)


### Features

* simplify .gitignore entries ([cc594ef](https://github.com/staff0rd/assist/commit/cc594efdb52dd4078e8242f9d6eafac2df55db83))

# [0.187.0](https://github.com/staff0rd/assist/compare/v0.186.1...v0.187.0) (2026-04-08)


### Features

* add --position to add-phase command ([35588ad](https://github.com/staff0rd/assist/commit/35588adcfa895df83ca5ca245b55fe304546979c))

## [0.186.1](https://github.com/staff0rd/assist/compare/v0.186.0...v0.186.1) (2026-04-07)


### Bug Fixes

* make phase numbering 1-based e2e ([0464061](https://github.com/staff0rd/assist/commit/0464061d558c46b8a62edbe963f2b40f203e387c))

# [0.186.0](https://github.com/staff0rd/assist/compare/v0.185.0...v0.186.0) (2026-04-07)


### Features

* add /add-command slash command ([5b58938](https://github.com/staff0rd/assist/commit/5b5893887eeb6b5db646124b04c9648ff99b0b98))

# [0.185.0](https://github.com/staff0rd/assist/compare/v0.184.1...v0.185.0) (2026-04-07)


### Features

* add run remove subcommand ([d1ca6b6](https://github.com/staff0rd/assist/commit/d1ca6b64b574ba4c80274709dc7be540ac7af3cc))

## [0.184.1](https://github.com/staff0rd/assist/compare/v0.184.0...v0.184.1) (2026-04-07)


### Bug Fixes

* check deny rules on unparseable commands ([f8e5025](https://github.com/staff0rd/assist/commit/f8e5025630d37801f0e5ae519f3cc4204f308aad))

# [0.184.0](https://github.com/staff0rd/assist/compare/v0.183.0...v0.184.0) (2026-04-07)


### Features

* add backlog rewind-phase command ([c617f92](https://github.com/staff0rd/assist/commit/c617f929ba5424d32cc080e23b49d620bb7dabe7))

# [0.183.0](https://github.com/staff0rd/assist/compare/v0.182.0...v0.183.0) (2026-04-07)


### Features

* add delete-comment command ([f7c1fd5](https://github.com/staff0rd/assist/commit/f7c1fd5af989d8cbc3b6c0cc37631f39498fba15))

# [0.182.0](https://github.com/staff0rd/assist/compare/v0.181.0...v0.182.0) (2026-04-07)


### Bug Fixes

* widen signal file gitignore pattern ([f89bb99](https://github.com/staff0rd/assist/commit/f89bb99c4608aeb15a9912a3a048027b5b3dbf6d))


### Features

* add --cwd option to run add ([dc766a9](https://github.com/staff0rd/assist/commit/dc766a9f38dcfae58650d9cceafe853d775d690e))

# [0.181.0](https://github.com/staff0rd/assist/compare/v0.180.1...v0.181.0) (2026-04-07)


### Features

* show date range in activity chart ([7c43bc4](https://github.com/staff0rd/assist/commit/7c43bc4c75d79976515eaa048ca543bff457ff1f))

## [0.180.1](https://github.com/staff0rd/assist/compare/v0.180.0...v0.180.1) (2026-04-07)


### Bug Fixes

* chart label says per day not week ([eaec9ca](https://github.com/staff0rd/assist/commit/eaec9ca839080c488496321654d7556bdb5933b3))

# [0.180.0](https://github.com/staff0rd/assist/compare/v0.179.0...v0.180.0) (2026-04-07)


### Features

* activity command with weekly chart ([84fd270](https://github.com/staff0rd/assist/commit/84fd270437aff577ad8869d48c77faa0f1ad9b51))

# [0.179.0](https://github.com/staff0rd/assist/compare/v0.178.0...v0.179.0) (2026-04-07)


### Features

* backtick formatting in PR body ([b3c3fd4](https://github.com/staff0rd/assist/commit/b3c3fd47fe3e440e736c877243cd6372745f751f))

# [0.178.0](https://github.com/staff0rd/assist/compare/v0.177.1...v0.178.0) (2026-04-07)


### Features

* show configured commands in run help ([797c211](https://github.com/staff0rd/assist/commit/797c2114de79385961510ad25ffdd8022b20e632))

## [0.177.1](https://github.com/staff0rd/assist/compare/v0.177.0...v0.177.1) (2026-04-07)


### Bug Fixes

* scope signal file per session ([f89dc96](https://github.com/staff0rd/assist/commit/f89dc961e07f59e2b16d4eacfa5dcf5d7cb28263))

# [0.177.0](https://github.com/staff0rd/assist/compare/v0.176.0...v0.177.0) (2026-04-07)


### Features

* backlog auto-commit config toggle ([cf30629](https://github.com/staff0rd/assist/commit/cf306294668fc8cc73134cc6d084bc28846a74d5))

# [0.176.0](https://github.com/staff0rd/assist/compare/v0.175.0...v0.176.0) (2026-04-07)


### Features

* add backlog refine command ([d9c334e](https://github.com/staff0rd/assist/commit/d9c334e7a1977903150db791df31dfe45c13f41b))

# [0.175.0](https://github.com/staff0rd/assist/compare/v0.174.2...v0.175.0) (2026-04-06)


### Features

* auto-pick single backlog item on first /next ([fc684d8](https://github.com/staff0rd/assist/commit/fc684d84a27fc41648f7c20516f460538f45bab8))

## [0.174.2](https://github.com/staff0rd/assist/compare/v0.174.1...v0.174.2) (2026-04-05)


### Bug Fixes

* strip fd redirects in allow-list matching ([d8e0396](https://github.com/staff0rd/assist/commit/d8e0396baf35632ae4b55b5c0b86c8d44f647f90))

## [0.174.1](https://github.com/staff0rd/assist/compare/v0.174.0...v0.174.1) (2026-04-05)


### Bug Fixes

* update .gitignore on backlog db creation ([57804ff](https://github.com/staff0rd/assist/commit/57804fff24c73b892f0ccc9d7bd857cae2c9c55d))

# [0.174.0](https://github.com/staff0rd/assist/compare/v0.173.1...v0.174.0) (2026-04-05)


### Features

* add backlog search across item fields ([0b0aa0a](https://github.com/staff0rd/assist/commit/0b0aa0aefd2de8b824cd84bb6d5b9922969a0a53))

## [0.173.1](https://github.com/staff0rd/assist/compare/v0.173.0...v0.173.1) (2026-04-05)


### Bug Fixes

* strip unknown keys in planTaskSchema ([e7e2d15](https://github.com/staff0rd/assist/commit/e7e2d1587286d0ecd7dc91be724453782b30ebf6))

# [0.173.0](https://github.com/staff0rd/assist/compare/v0.172.4...v0.173.0) (2026-04-05)


### Features

* add browser routing to backlog UI ([372c90c](https://github.com/staff0rd/assist/commit/372c90c114368eff4ea6969a50c1c21a0c444594))

## [0.172.4](https://github.com/staff0rd/assist/compare/v0.172.3...v0.172.4) (2026-04-05)


### Bug Fixes

* allow literal backticks in quoted args ([bd881a6](https://github.com/staff0rd/assist/commit/bd881a68835b15f10d20a3ae924b7f7d90cdfd60))

## [0.172.3](https://github.com/staff0rd/assist/compare/v0.172.2...v0.172.3) (2026-04-05)


### Bug Fixes

* prompt before starting single item ([40f3a3a](https://github.com/staff0rd/assist/commit/40f3a3aee837044ce510f3aa9d4847d05047be09))

## [0.172.2](https://github.com/staff0rd/assist/compare/v0.172.1...v0.172.2) (2026-04-05)


### Bug Fixes

* detect SQLite DB in backlog gates ([7a43a79](https://github.com/staff0rd/assist/commit/7a43a7957ba24540964010dc631d6deba7f0576d))

## [0.172.1](https://github.com/staff0rd/assist/compare/v0.172.0...v0.172.1) (2026-04-05)


### Bug Fixes

* skip phase prompt for terminal items ([73fdbba](https://github.com/staff0rd/assist/commit/73fdbba5378728cc55eb6751f026f761f1a89818))

# [0.172.0](https://github.com/staff0rd/assist/compare/v0.171.1...v0.172.0) (2026-04-05)


### Features

* add wontdo status to backlog ([9c7956e](https://github.com/staff0rd/assist/commit/9c7956ea25a9d623bd76c6e326dec5bde9e808eb))

## [0.171.1](https://github.com/staff0rd/assist/compare/v0.171.0...v0.171.1) (2026-04-05)


### Bug Fixes

* handle null comment phase in JSONL ([64faeaf](https://github.com/staff0rd/assist/commit/64faeaff55ac4b7d8d800fb8af36012d3d2fb3c4))

# [0.171.0](https://github.com/staff0rd/assist/compare/v0.170.3...v0.171.0) (2026-04-05)


### Bug Fixes

* use last version of day in devlog ([ed879ec](https://github.com/staff0rd/assist/commit/ed879ec7fcbff67caa6e288ba7fb72df42212426))


### Features

* switch backlog storage to SQLite ([dd6cb68](https://github.com/staff0rd/assist/commit/dd6cb689a22fa0cea0925499635a44db0fa6a28a))

## [0.170.3](https://github.com/staff0rd/assist/compare/v0.170.2...v0.170.3) (2026-04-05)


### Bug Fixes

* preserve shared helpers during extract ([e5d6b6f](https://github.com/staff0rd/assist/commit/e5d6b6fb8d649593b05f1060491d5dcd39c36ae8))

## [0.170.2](https://github.com/staff0rd/assist/compare/v0.170.1...v0.170.2) (2026-04-05)


### Bug Fixes

* restore backlog and surface parse errors ([52fa203](https://github.com/staff0rd/assist/commit/52fa203d049f05660d1384027d6459ee367e1afb))

## [0.170.1](https://github.com/staff0rd/assist/compare/v0.170.0...v0.170.1) (2026-04-01)


### Bug Fixes

* bundle cli-reads/writes into dist ([6371463](https://github.com/staff0rd/assist/commit/6371463becf4ba7b638469d29cc80aea60d89fda))

# [0.170.0](https://github.com/staff0rd/assist/compare/v0.169.0...v0.170.0) (2026-04-01)


### Features

* add feat alias for draft ([706275f](https://github.com/staff0rd/assist/commit/706275f18ed611d5f43964b841c593b4af2dc1bd))

# [0.169.0](https://github.com/staff0rd/assist/compare/v0.168.0...v0.169.0) (2026-03-31)


### Features

* enable edit mode for draft/bug ([a54d637](https://github.com/staff0rd/assist/commit/a54d637ffd0397290116d3ed4247de24a4ddb5f4))

# [0.168.0](https://github.com/staff0rd/assist/compare/v0.167.0...v0.168.0) (2026-03-31)


### Features

* backlog item linking ([9267321](https://github.com/staff0rd/assist/commit/92673216ab875a3544c17433a68eae300ce0032f))

# [0.167.0](https://github.com/staff0rd/assist/compare/v0.166.1...v0.167.0) (2026-03-31)


### Features

* split cli-reads into reads/writes ([aab7958](https://github.com/staff0rd/assist/commit/aab79587cc55ef4c2ec6a808755121a7fe137f66))

## [0.166.1](https://github.com/staff0rd/assist/compare/v0.166.0...v0.166.1) (2026-03-31)


### Bug Fixes

* normalize ./ prefix in allow matcher ([e549694](https://github.com/staff0rd/assist/commit/e5496948f65b7fea734d7fd5cf8794f5ae6b315b))

# [0.166.0](https://github.com/staff0rd/assist/compare/v0.165.1...v0.166.0) (2026-03-31)


### Features

* use /api/data for historical seq queries ([6b9036f](https://github.com/staff0rd/assist/commit/6b9036fbf522314873589d0162ce4fee318bab72))

## [0.165.1](https://github.com/staff0rd/assist/compare/v0.165.0...v0.165.1) (2026-03-31)


### Bug Fixes

* move assist perms to cli-reads ([22931d5](https://github.com/staff0rd/assist/commit/22931d5de40209e58cf94d4c7baf3d2c735b85c4))

# [0.165.0](https://github.com/staff0rd/assist/compare/v0.164.1...v0.165.0) (2026-03-31)


### Features

* replace --json stdin with --file flag ([b968e1a](https://github.com/staff0rd/assist/commit/b968e1a2a926164c2248de5f6efcc5b40509b220))

## [0.164.1](https://github.com/staff0rd/assist/compare/v0.164.0...v0.164.1) (2026-03-31)


### Bug Fixes

* support allow entries without :* suffix ([21e2cc8](https://github.com/staff0rd/assist/commit/21e2cc8f2807c44abedcfe42d78cea130ab396fd))

# [0.164.0](https://github.com/staff0rd/assist/compare/v0.163.0...v0.164.0) (2026-03-31)


### Features

* add --dir option to backlog commands ([9c80a01](https://github.com/staff0rd/assist/commit/9c80a01716bcef31f816e17736aa6b315ca29941))

# [0.163.0](https://github.com/staff0rd/assist/compare/v0.162.0...v0.163.0) (2026-03-31)


### Features

* add deny rules with cli-hook deny commands ([29589ea](https://github.com/staff0rd/assist/commit/29589ea53c328e901f3830eed131f03c809cd720))

# [0.162.0](https://github.com/staff0rd/assist/compare/v0.161.0...v0.162.0) (2026-03-31)


### Features

* add --from option to seq query ([aefbd7c](https://github.com/staff0rd/assist/commit/aefbd7cb7b3d034f6d1ed03f63088505e43f27a7))

# [0.161.0](https://github.com/staff0rd/assist/compare/v0.160.0...v0.161.0) (2026-03-31)


### Features

* inline backlog comments in prompts ([3f602c4](https://github.com/staff0rd/assist/commit/3f602c4c34f141a69b67b0caa15b4ab2090b524e))

# [0.160.0](https://github.com/staff0rd/assist/compare/v0.159.0...v0.160.0) (2026-03-31)


### Features

* global config for sync auto-confirm ([c7a5d98](https://github.com/staff0rd/assist/commit/c7a5d98853836a19a8f121bc3b271cccb65efcd2))

# [0.159.0](https://github.com/staff0rd/assist/compare/v0.158.2...v0.159.0) (2026-03-31)


### Features

* merge shell allow/deny rules across tools ([e1d8d02](https://github.com/staff0rd/assist/commit/e1d8d020897f2366fba4d11dce64117036ff808e))

## [0.158.2](https://github.com/staff0rd/assist/compare/v0.158.1...v0.158.2) (2026-03-31)


### Bug Fixes

* lock backlog items during execution ([bf17935](https://github.com/staff0rd/assist/commit/bf17935d6d51455db73513e27c34915f58b0da89))

## [0.158.1](https://github.com/staff0rd/assist/compare/v0.158.0...v0.158.1) (2026-03-30)


### Bug Fixes

* graceful exit on Ctrl-C in prompts ([d337912](https://github.com/staff0rd/assist/commit/d337912b308afd7e1b13d72c09fb8afeed6d8051))

# [0.158.0](https://github.com/staff0rd/assist/compare/v0.157.0...v0.158.0) (2026-03-30)


### Features

* loop backlog next when items remain ([3749a7e](https://github.com/staff0rd/assist/commit/3749a7e7edf02c0ee91bff1207fa449ab0038617))

# [0.157.0](https://github.com/staff0rd/assist/compare/v0.156.0...v0.157.0) (2026-03-30)


### Features

* add ls alias for backlog list ([2838b7b](https://github.com/staff0rd/assist/commit/2838b7bc4ad038a0bf1b17306cf8cf5bc2d462c4))

# [0.156.0](https://github.com/staff0rd/assist/compare/v0.155.1...v0.156.0) (2026-03-30)


### Features

* draft/bug modes with /next chaining ([5a8a3a3](https://github.com/staff0rd/assist/commit/5a8a3a3930d15d2488315846e352994befb0741e))

## [0.155.1](https://github.com/staff0rd/assist/compare/v0.155.0...v0.155.1) (2026-03-30)


### Bug Fixes

* save summary on done, not phase-done ([2ea5166](https://github.com/staff0rd/assist/commit/2ea51663d7c924f48356550755a9a590523d62c2))

# [0.155.0](https://github.com/staff0rd/assist/compare/v0.154.2...v0.155.0) (2026-03-30)


### Features

* add 'a' as CLI alias ([231b41d](https://github.com/staff0rd/assist/commit/231b41d642f26765d1a095965e98c168664ea878))

## [0.154.2](https://github.com/staff0rd/assist/compare/v0.154.1...v0.154.2) (2026-03-30)


### Bug Fixes

* update syncs without prompting ([4c56148](https://github.com/staff0rd/assist/commit/4c56148f52c99ec7d158bf66b4dc0c4ab89f1c1a))

## [0.154.1](https://github.com/staff0rd/assist/compare/v0.154.0...v0.154.1) (2026-03-30)


### Bug Fixes

* save summary and ensure done safely ([c64c9d5](https://github.com/staff0rd/assist/commit/c64c9d5641f1a236b991bead8b34c70a9cc3901f))

# [0.154.0](https://github.com/staff0rd/assist/compare/v0.153.0...v0.154.0) (2026-03-30)


### Features

* backlog comments and summaries ([15d1f1f](https://github.com/staff0rd/assist/commit/15d1f1f48191d3fe20d0a80137ad7c9e9bcdb6c3))

# [0.153.0](https://github.com/staff0rd/assist/compare/v0.152.0...v0.153.0) (2026-03-30)


### Features

* backlog comments and summaries ([52c0601](https://github.com/staff0rd/assist/commit/52c060101a3cb60b599442966bbea830f7c88cfa))

# [0.152.0](https://github.com/staff0rd/assist/compare/v0.151.1...v0.152.0) (2026-03-30)


### Features

* auto-commit backlog after add ([32beb82](https://github.com/staff0rd/assist/commit/32beb82582afdab53e4e75beafd44eb6af588f7f))

## [0.151.1](https://github.com/staff0rd/assist/compare/v0.151.0...v0.151.1) (2026-03-30)


### Bug Fixes

* split inline command args at save time ([85895ed](https://github.com/staff0rd/assist/commit/85895ed576e0d36bd6de6670618dbce635e4060d))

# [0.151.0](https://github.com/staff0rd/assist/compare/v0.150.0...v0.151.0) (2026-03-30)


### Features

* add backlog show command ([a0fb6f8](https://github.com/staff0rd/assist/commit/a0fb6f8a9e2fbbd3d550280c389138368145cce5))

# [0.150.0](https://github.com/staff0rd/assist/compare/v0.149.5...v0.150.0) (2026-03-29)


### Features

* add next as alias for backlog next -w ([92035af](https://github.com/staff0rd/assist/commit/92035afd473f7e71c5d0966f06ed4ba6fa33f1ba))

## [0.149.5](https://github.com/staff0rd/assist/compare/v0.149.4...v0.149.5) (2026-03-29)


### Bug Fixes

* skip phase advance for done items ([1242e24](https://github.com/staff0rd/assist/commit/1242e244325032673894edd2369cc1e08876e993))

## [0.149.4](https://github.com/staff0rd/assist/compare/v0.149.3...v0.149.4) (2026-03-29)


### Bug Fixes

* handle glob tokens in splitCompound ([27e5313](https://github.com/staff0rd/assist/commit/27e531394b0344ea5ba0922fd3ee1e15ee4129a9))

## [0.149.3](https://github.com/staff0rd/assist/compare/v0.149.2...v0.149.3) (2026-03-29)


### Bug Fixes

* skip backlog run for done items ([51064d1](https://github.com/staff0rd/assist/commit/51064d17f5f4b153b65ec719c5240fa1767ce11d))

## [0.149.2](https://github.com/staff0rd/assist/compare/v0.149.1...v0.149.2) (2026-03-29)


### Bug Fixes

* rewrite import paths in extract dest ([c0aebd1](https://github.com/staff0rd/assist/commit/c0aebd1a13e3ba7a47aafd9a557a05f9a47fd37a))

## [0.149.1](https://github.com/staff0rd/assist/compare/v0.149.0...v0.149.1) (2026-03-29)


### Bug Fixes

* rename --allow-edits to -w/--write ([43bcdb6](https://github.com/staff0rd/assist/commit/43bcdb6499d56854997f54320a32e3b9fc30aae2))

# [0.149.0](https://github.com/staff0rd/assist/compare/v0.148.0...v0.149.0) (2026-03-29)


### Features

* --allow-edits for backlog run/next ([b80c91f](https://github.com/staff0rd/assist/commit/b80c91f07b0ccfa03148ef907895583601b1c9e5))

# [0.148.0](https://github.com/staff0rd/assist/compare/v0.147.4...v0.148.0) (2026-03-29)


### Features

* add coverage command ([2aaab80](https://github.com/staff0rd/assist/commit/2aaab80683ad879c798f3f7c40663dd5083eba2e))

## [0.147.4](https://github.com/staff0rd/assist/compare/v0.147.3...v0.147.4) (2026-03-29)


### Bug Fixes

* auto-select sole backlog item ([3400bd8](https://github.com/staff0rd/assist/commit/3400bd83e8b64b63f73a91628dfb2d60d61c7ea8))

## [0.147.3](https://github.com/staff0rd/assist/compare/v0.147.2...v0.147.3) (2026-03-29)


### Bug Fixes

* remove inter-phase verify from backlog ([95a5597](https://github.com/staff0rd/assist/commit/95a55974881a5c9454d67d7d897c9a3ff30f526a))

## [0.147.2](https://github.com/staff0rd/assist/compare/v0.147.1...v0.147.2) (2026-03-29)


### Bug Fixes

* pass --yes flag through to MD sync ([09b10b3](https://github.com/staff0rd/assist/commit/09b10b3d96ebb26945769304a8fe3784ded2f132))

## [0.147.1](https://github.com/staff0rd/assist/compare/v0.147.0...v0.147.1) (2026-03-29)


### Bug Fixes

* skip barrel export for non-public fns ([0932328](https://github.com/staff0rd/assist/commit/09323286659bde16e88a44528080f11c3bedd724))

# [0.147.0](https://github.com/staff0rd/assist/compare/v0.146.0...v0.147.0) (2026-03-29)


### Features

* skip verify on review phase ([eba4381](https://github.com/staff0rd/assist/commit/eba438144aee2728fa1d42e85caf5b88391194e2))

# [0.146.0](https://github.com/staff0rd/assist/compare/v0.145.1...v0.146.0) (2026-03-29)


### Features

* add remove alias for backlog delete ([577aa1b](https://github.com/staff0rd/assist/commit/577aa1b0625a2b59452e188855fe2fd8025763fc))

## [0.145.1](https://github.com/staff0rd/assist/compare/v0.145.0...v0.145.1) (2026-03-29)


### Bug Fixes

* sanitise control chars in --json stdin ([8de0379](https://github.com/staff0rd/assist/commit/8de037912518e048f26be4eee5e39dcfe9b557b8))

# [0.145.0](https://github.com/staff0rd/assist/compare/v0.144.1...v0.145.0) (2026-03-29)


### Features

* show type in backlog next list ([32d1a03](https://github.com/staff0rd/assist/commit/32d1a03ae7f1f47d4c275bf702ef686783b2c395))

## [0.144.1](https://github.com/staff0rd/assist/compare/v0.144.0...v0.144.1) (2026-03-29)


### Bug Fixes

* remove stale imports after extract ([39211b6](https://github.com/staff0rd/assist/commit/39211b6e1d3c6fe90db3aff52e56fd738bf0d233))

# [0.144.0](https://github.com/staff0rd/assist/compare/v0.143.0...v0.144.0) (2026-03-29)


### Features

* number acceptance criteria ([0a71ec2](https://github.com/staff0rd/assist/commit/0a71ec2c2c0b14ce841b931c957b5b3cc49c960d))

# [0.143.0](https://github.com/staff0rd/assist/compare/v0.142.0...v0.143.0) (2026-03-29)


### Features

* auto-generate review phase for backlog ([2607e63](https://github.com/staff0rd/assist/commit/2607e6329eedc38ba792cefc8273f0373b8bf800))

# [0.142.0](https://github.com/staff0rd/assist/compare/v0.141.1...v0.142.0) (2026-03-29)


### Features

* add /bug command for filing bugs ([a2988e2](https://github.com/staff0rd/assist/commit/a2988e2bdd1f6071182df9f30c71ff302bb8f2b5))

## [0.141.1](https://github.com/staff0rd/assist/compare/v0.141.0...v0.141.1) (2026-03-29)


### Bug Fixes

* mark item done on plan completion ([4cc2d0d](https://github.com/staff0rd/assist/commit/4cc2d0d48889916e54f526171581924c600542e3))

# [0.141.0](https://github.com/staff0rd/assist/compare/v0.140.1...v0.141.0) (2026-03-29)


### Features

* display plan progress in backlog web view ([93d13f1](https://github.com/staff0rd/assist/commit/93d13f1c3c166da35cd50f078642639bb676a054))

## [0.140.1](https://github.com/staff0rd/assist/compare/v0.140.0...v0.140.1) (2026-03-29)


### Bug Fixes

* prevent resume loop on completed item ([42bb091](https://github.com/staff0rd/assist/commit/42bb09125969015a1fb72dbe40993dd730aa6820))

# [0.140.0](https://github.com/staff0rd/assist/compare/v0.139.0...v0.140.0) (2026-03-29)


### Features

* add test-cover and test-review commands ([b8d76ef](https://github.com/staff0rd/assist/commit/b8d76ef30a75d5693380816e1950a1ae33509ff0))

# [0.139.0](https://github.com/staff0rd/assist/compare/v0.138.0...v0.139.0) (2026-03-29)


### Features

* add refactor extract command ([bc18adb](https://github.com/staff0rd/assist/commit/bc18adb22283a3fa77b8a37606033741c83021ca))

# [0.138.0](https://github.com/staff0rd/assist/compare/v0.137.0...v0.138.0) (2026-03-29)


### Features

* add numbered AC backlog item ([39261d4](https://github.com/staff0rd/assist/commit/39261d4d4e461f866c88c0f970b7c7ac222575cc))

# [0.137.0](https://github.com/staff0rd/assist/compare/v0.136.2...v0.137.0) (2026-03-29)


### Features

* add manual checks to backlog phases ([d9372f2](https://github.com/staff0rd/assist/commit/d9372f22a5455a8338294dad527460c6e68bbea9))

## [0.136.2](https://github.com/staff0rd/assist/compare/v0.136.1...v0.136.2) (2026-03-29)


### Bug Fixes

* auto-kill session on phase-done ([f8e862e](https://github.com/staff0rd/assist/commit/f8e862e96cc309f6d7cd5bbe29417fdd3e7a962d))

## [0.136.1](https://github.com/staff0rd/assist/compare/v0.136.0...v0.136.1) (2026-03-29)


### Bug Fixes

* shell splitting prompt in spawn ([7c2fdd1](https://github.com/staff0rd/assist/commit/7c2fdd1efb069393710eba7b54725597de2d4774))

# [0.136.0](https://github.com/staff0rd/assist/compare/v0.135.0...v0.136.0) (2026-03-29)


### Features

* track phase progress on backlog items ([2803dc2](https://github.com/staff0rd/assist/commit/2803dc2816bf2cab293dc3e94f362f1f25df0f3f))

# [0.135.0](https://github.com/staff0rd/assist/compare/v0.134.1...v0.135.0) (2026-03-29)


### Features

* add backlog orchestration and /draft ([dbce31c](https://github.com/staff0rd/assist/commit/dbce31cda66ade82f5d59b0ea6ff0e98eddaa06c))

## [0.134.1](https://github.com/staff0rd/assist/compare/v0.134.0...v0.134.1) (2026-03-28)


### Bug Fixes

* split inline command args in run ([48428df](https://github.com/staff0rd/assist/commit/48428df2f62a98be64bee263c5b58134b13b0cf5))

# [0.134.0](https://github.com/staff0rd/assist/compare/v0.133.0...v0.134.0) (2026-03-28)


### Features

* add screenshot command ([deacd78](https://github.com/staff0rd/assist/commit/deacd780af6ccd646a67529761473da383a39b1a))

# [0.133.0](https://github.com/staff0rd/assist/compare/v0.132.0...v0.133.0) (2026-03-26)


### Features

* add inspect --only filter ([d773da7](https://github.com/staff0rd/assist/commit/d773da76054402f6f7790a48487e046f2d780e9f))

# [0.132.0](https://github.com/staff0rd/assist/compare/v0.131.0...v0.132.0) (2026-03-26)


### Features

* unify inspect --scope, add --suppress ([7f4eba6](https://github.com/staff0rd/assist/commit/7f4eba6c62f85283cd05bbe66592cd6f6ca69235))

# [0.131.0](https://github.com/staff0rd/assist/compare/v0.130.0...v0.131.0) (2026-03-26)


### Features

* add roam show icon command ([f3e5bc9](https://github.com/staff0rd/assist/commit/f3e5bc903df6acedb03e2be557a78dac589279c9))

# [0.130.0](https://github.com/staff0rd/assist/compare/v0.129.0...v0.130.0) (2026-03-26)


### Features

* seq default 1000, warn on limit ([26f6ea5](https://github.com/staff0rd/assist/commit/26f6ea506513273accf6fa3aa92309dc944eea17))

# [0.129.0](https://github.com/staff0rd/assist/compare/v0.128.0...v0.129.0) (2026-03-26)


### Features

* add /raven slash command ([8029948](https://github.com/staff0rd/assist/commit/8029948a73a358dae6b79d3a1169b40e73c0d905))

# [0.128.0](https://github.com/staff0rd/assist/compare/v0.127.0...v0.128.0) (2026-03-26)


### Features

* move shell read commands to cli-reads ([8b4118b](https://github.com/staff0rd/assist/commit/8b4118bab30ff8fd1b078cedd314d41dc3f143b4))

# [0.127.0](https://github.com/staff0rd/assist/compare/v0.126.0...v0.127.0) (2026-03-25)


### Features

* add /inspect slash command ([54e18f5](https://github.com/staff0rd/assist/commit/54e18f58399ae16c3f70b65619b28a359a864078))

# [0.126.0](https://github.com/staff0rd/assist/compare/v0.125.0...v0.126.0) (2026-03-25)


### Features

* add seq query commands ([ad61612](https://github.com/staff0rd/assist/commit/ad61612d820b6db04373bdd5f6958fcfe5f6deaa))

# [0.125.0](https://github.com/staff0rd/assist/compare/v0.124.0...v0.125.0) (2026-03-25)


### Features

* add --roslyn flag to dotnet inspect ([5c888ce](https://github.com/staff0rd/assist/commit/5c888cefe8ead7cf0119b4b911409cd0f7240b41))

# [0.124.0](https://github.com/staff0rd/assist/compare/v0.123.0...v0.124.0) (2026-03-24)


### Features

* project rate-limit color by pace ([20e4771](https://github.com/staff0rd/assist/commit/20e4771d0664b91431fd44b3d7bef392a7525e11))

# [0.123.0](https://github.com/staff0rd/assist/compare/v0.122.0...v0.123.0) (2026-03-24)


### Features

* add --base flag to dotnet inspect ([3f819a9](https://github.com/staff0rd/assist/commit/3f819a911c5cd5ba1922d51b28300564e6a1e359))

# [0.122.0](https://github.com/staff0rd/assist/compare/v0.121.0...v0.122.0) (2026-03-24)


### Features

* suppress unreliable .Global inspect rules ([83a504f](https://github.com/staff0rd/assist/commit/83a504f6d1b30d9fd981c7981f1783ce6123c2b4))

# [0.121.0](https://github.com/staff0rd/assist/compare/v0.120.1...v0.121.0) (2026-03-24)


### Features

* make --swea opt-in, add timing ([34505ba](https://github.com/staff0rd/assist/commit/34505babc1f7f89d96d77a8f141c1d637f85768f))

## [0.120.1](https://github.com/staff0rd/assist/compare/v0.120.0...v0.120.1) (2026-03-23)


### Bug Fixes

* find config from subdirectories ([9974fd9](https://github.com/staff0rd/assist/commit/9974fd94aee4500e0df0e3d9f6c0f721ca32370c))

# [0.120.0](https://github.com/staff0rd/assist/compare/v0.119.0...v0.120.0) (2026-03-22)


### Features

* group review comments by thread ([0aaf2db](https://github.com/staff0rd/assist/commit/0aaf2dbccf6b871e9504236ce6a9aa9d3f3b8acb))

# [0.119.0](https://github.com/staff0rd/assist/compare/v0.118.0...v0.119.0) (2026-03-22)


### Features

* add jb inspect backlog item ([0a4c4d1](https://github.com/staff0rd/assist/commit/0a4c4d11adca55559291ad2dadb242f822d00656))
* group review comments by thread ([2b6bd48](https://github.com/staff0rd/assist/commit/2b6bd481ec17cdca6256b9dcfbaf9a315d74e4a1))

# [0.118.0](https://github.com/staff0rd/assist/compare/v0.117.0...v0.118.0) (2026-03-20)


### Features

* show time-to-reset in limits ([fe49bcb](https://github.com/staff0rd/assist/commit/fe49bcbef18f4ad22f4a10664e93f5796a2c2f20))

# [0.117.0](https://github.com/staff0rd/assist/compare/v0.116.0...v0.117.0) (2026-03-20)


### Features

* add rate limits to status line ([f18d904](https://github.com/staff0rd/assist/commit/f18d904de0a1077f539c554bac297fa2e7f422b6))

# [0.116.0](https://github.com/staff0rd/assist/compare/v0.115.0...v0.116.0) (2026-03-19)


### Features

* add status dropdown to backlog web ([3e5513d](https://github.com/staff0rd/assist/commit/3e5513d5617dc378d805e0072f992cfe8440f66f))

# [0.115.0](https://github.com/staff0rd/assist/compare/v0.114.0...v0.115.0) (2026-03-18)


### Features

* add jira view command ([8ca6e87](https://github.com/staff0rd/assist/commit/8ca6e87fa794d69163755ae10227f78c567777c7))

# [0.114.0](https://github.com/staff0rd/assist/compare/v0.113.0...v0.114.0) (2026-03-18)


### Features

* narrowed cli-hook add discovery ([182a234](https://github.com/staff0rd/assist/commit/182a23444de7b11587bba4ef710c04651a4e678c))

# [0.113.0](https://github.com/staff0rd/assist/compare/v0.112.0...v0.113.0) (2026-03-17)


### Features

* add ravendb query commands ([07bb433](https://github.com/staff0rd/assist/commit/07bb433857d2bf09ddb855140ad18f34ec416d12))

# [0.112.0](https://github.com/staff0rd/assist/compare/v0.111.0...v0.112.0) (2026-03-13)


### Bug Fixes

* resolve circular dependencies ([bf8e10b](https://github.com/staff0rd/assist/commit/bf8e10be5d577ed3af4defd7873171fa87c9aaba))
* verify init detects assist.yml scripts ([177fff8](https://github.com/staff0rd/assist/commit/177fff869bdd420b1d08d59f96331149ff17225d))


### Features

* add madge circular dep check ([f4a7b64](https://github.com/staff0rd/assist/commit/f4a7b64f008e02f339d450570b9b43dc559c95a1))

# [0.111.0](https://github.com/staff0rd/assist/compare/v0.110.0...v0.111.0) (2026-03-13)


### Features

* add /jira command ([d1577fc](https://github.com/staff0rd/assist/commit/d1577fc62166d6b7b03a81528bc002cbec212324))

# [0.110.0](https://github.com/staff0rd/assist/compare/v0.109.0...v0.110.0) (2026-03-12)


### Features

* add refactor rename commands ([db60a2f](https://github.com/staff0rd/assist/commit/db60a2f4d60b61e5f6309c658741837613204b3e))

# [0.109.0](https://github.com/staff0rd/assist/compare/v0.108.2...v0.109.0) (2026-03-12)


### Features

* add madge circular dep check to verify init ([2647806](https://github.com/staff0rd/assist/commit/2647806990b92d95247c566eb829803d46d723e7))

## [0.108.2](https://github.com/staff0rd/assist/compare/v0.108.1...v0.108.2) (2026-03-12)


### Bug Fixes

* skip MSYS path test on non-Windows ([d447151](https://github.com/staff0rd/assist/commit/d44715194b8bccbb4fb8552bd29f304d8b2a3296))

## [0.108.1](https://github.com/staff0rd/assist/compare/v0.108.0...v0.108.1) (2026-03-11)


### Bug Fixes

* push commit before resolving thread ([c151440](https://github.com/staff0rd/assist/commit/c1514406fd57be187c1072b2219fe4a8e476b3b6))

# [0.108.0](https://github.com/staff0rd/assist/compare/v0.107.0...v0.108.0) (2026-03-11)


### Features

* add news command with RSS feeds ([22a3fd0](https://github.com/staff0rd/assist/commit/22a3fd08d864f0c17097721c36670d2a5b94b8c6))

# [0.107.0](https://github.com/staff0rd/assist/compare/v0.106.1...v0.107.0) (2026-03-10)


### Features

* add jira auth and ac commands ([937f718](https://github.com/staff0rd/assist/commit/937f718bc8f01965bb9203b636f76ea7e6d6af62))

## [0.106.1](https://github.com/staff0rd/assist/compare/v0.106.0...v0.106.1) (2026-03-10)


### Bug Fixes

* suppress gh api json output ([5583b6e](https://github.com/staff0rd/assist/commit/5583b6e5a05bd2def032b3edf0220e86fcde5795))

# [0.106.0](https://github.com/staff0rd/assist/compare/v0.105.0...v0.106.0) (2026-03-08)


### Features

* move devlog skip days to blog repo ([b7e7d29](https://github.com/staff0rd/assist/commit/b7e7d29b1ade79269cdd85d2ca0fcf788b2ca3c2))

# [0.105.0](https://github.com/staff0rd/assist/compare/v0.104.0...v0.105.0) (2026-03-08)


### Features

* add devlog repos command ([f62c97a](https://github.com/staff0rd/assist/commit/f62c97a6d58077eb60ac4f7dcab04d42aa658425))

# [0.104.0](https://github.com/staff0rd/assist/compare/v0.103.0...v0.104.0) (2026-03-06)


### Features

* parse >/dev/null; add verify:test ([a4ce5aa](https://github.com/staff0rd/assist/commit/a4ce5aa0be7ae09fe0305fac1837349212a10e4e))

# [0.103.0](https://github.com/staff0rd/assist/compare/v0.102.1...v0.103.0) (2026-03-05)


### Features

* show summary and save path in list-comments ([27a4049](https://github.com/staff0rd/assist/commit/27a40499e5706df1c0dbcfbc53d664de5bac336a))

## [0.102.1](https://github.com/staff0rd/assist/compare/v0.102.0...v0.102.1) (2026-03-04)


### Bug Fixes

* detect npm install via fnm/nvm ([f5b38c0](https://github.com/staff0rd/assist/commit/f5b38c01bd6bb5c119abf04406e2d5e1dc98b929))

# [0.102.0](https://github.com/staff0rd/assist/compare/v0.101.0...v0.102.0) (2026-03-04)


### Features

* add netframework parent command ([5ec5846](https://github.com/staff0rd/assist/commit/5ec58464e99e91c26b790bf59daa333e7e88f023))

# [0.101.0](https://github.com/staff0rd/assist/compare/v0.100.1...v0.101.0) (2026-03-04)


### Features

* print elapsed time after run ([5663fa1](https://github.com/staff0rd/assist/commit/5663fa1388f2af4a2e36d0e36280133d9e769d78))

## [0.100.1](https://github.com/staff0rd/assist/compare/v0.100.0...v0.100.1) (2026-03-04)


### Bug Fixes

* document run add params in help ([4fb753d](https://github.com/staff0rd/assist/commit/4fb753d26b27fb993ec53fe470049864416cfedc))

# [0.100.0](https://github.com/staff0rd/assist/compare/v0.99.0...v0.100.0) (2026-03-04)


### Features

* add positional params to run ([a6a0aa8](https://github.com/staff0rd/assist/commit/a6a0aa826823914a95ac85db11647f69f9748e30))

# [0.99.0](https://github.com/staff0rd/assist/compare/v0.98.0...v0.99.0) (2026-03-04)


### Features

* add deps command ([524cc53](https://github.com/staff0rd/assist/commit/524cc5351ac97b202929ffcf57dbe404359591b4))

# [0.98.0](https://github.com/staff0rd/assist/compare/v0.97.1...v0.98.0) (2026-03-03)


### Features

* run npm i after pull in update ([a019bbc](https://github.com/staff0rd/assist/commit/a019bbc7db2d96dc35c8392b4ddb921b981ba10a))

## [0.97.1](https://github.com/staff0rd/assist/compare/v0.97.0...v0.97.1) (2026-03-03)


### Bug Fixes

* use pure JS for cli-reads lookup ([51f32be](https://github.com/staff0rd/assist/commit/51f32be0691960bd7649d73a336f73b3858c2c77))

# [0.97.0](https://github.com/staff0rd/assist/compare/v0.96.0...v0.97.0) (2026-03-03)


### Features

* compound command support in cli-hook ([9354270](https://github.com/staff0rd/assist/commit/93542700823423ba9ebb2482103b623e67954615))

# [0.96.0](https://github.com/staff0rd/assist/compare/v0.95.0...v0.96.0) (2026-02-27)


### Features

* auto-approve read-only gh api calls ([bcc7959](https://github.com/staff0rd/assist/commit/bcc7959e97466f8a96d29306f8211c7f0f74c1d2))

# [0.95.0](https://github.com/staff0rd/assist/compare/v0.94.1...v0.95.0) (2026-02-27)


### Features

* add cli-discover and cli-hook ([2ae0989](https://github.com/staff0rd/assist/commit/2ae09899242c1532774fc99a6fdacf596d2d48fa))

## [0.94.1](https://github.com/staff0rd/assist/compare/v0.94.0...v0.94.1) (2026-02-27)


### Bug Fixes

* allow assist sync permission ([a79c53c](https://github.com/staff0rd/assist/commit/a79c53c9fe6c236cf4420c022319fb033add539f))

# [0.94.0](https://github.com/staff0rd/assist/compare/v0.93.4...v0.94.0) (2026-02-27)


### Features

* add /sync slash command ([d75ebaf](https://github.com/staff0rd/assist/commit/d75ebaf2d15c0caaf1dc9156f60df84561eb252a))

## [0.93.4](https://github.com/staff0rd/assist/compare/v0.93.3...v0.93.4) (2026-02-27)


### Bug Fixes

* message-first arg order ([7a62367](https://github.com/staff0rd/assist/commit/7a623677e767c7d9a0ba41845850c77e8ddfa39a))

## [0.93.3](https://github.com/staff0rd/assist/compare/v0.93.2...v0.93.3) (2026-02-26)


### Bug Fixes

* revert commit -m flag ([6cb21d0](https://github.com/staff0rd/assist/commit/6cb21d02f04e011a4f08770f6b4b055636aa8a6b))

## [0.93.2](https://github.com/staff0rd/assist/compare/v0.93.1...v0.93.2) (2026-02-26)


### Bug Fixes

* win32 shell quoting ([09f3bc9](https://github.com/staff0rd/assist/commit/09f3bc9c09d03d75c03534f894616ebfcd59e5ba))

## [0.93.1](https://github.com/staff0rd/assist/compare/v0.93.0...v0.93.1) (2026-02-25)


### Bug Fixes

* check exact git root in isGitRepo ([57f11a0](https://github.com/staff0rd/assist/commit/57f11a02198d4ff9d05f263037bb8e3a758eedf2))

# [0.93.0](https://github.com/staff0rd/assist/compare/v0.92.5...v0.93.0) (2026-02-25)


### Features

* allow commit with message only ([30a0a4a](https://github.com/staff0rd/assist/commit/30a0a4a87d24ad29ba7dbdb336f6908a7e6fbb99))

## [0.92.5](https://github.com/staff0rd/assist/compare/v0.92.4...v0.92.5) (2026-02-25)


### Bug Fixes

* sync package-lock with ast alias ([2418cfc](https://github.com/staff0rd/assist/commit/2418cfc93acb02b9578d859e175bc69d7e887437))

## [0.92.4](https://github.com/staff0rd/assist/compare/v0.92.3...v0.92.4) (2026-02-25)


### Bug Fixes

* commit lock file on release ([2009fe3](https://github.com/staff0rd/assist/commit/2009fe36d4d10b5bf0c02c60b4c00e3f9a0658d5))

## [0.92.3](https://github.com/staff0rd/assist/compare/v0.92.2...v0.92.3) (2026-02-25)


### Bug Fixes

* shell-escape args, add --verbose ([e5c459b](https://github.com/staff0rd/assist/commit/e5c459b77612076ee3d38c07dec2cc96d2966ca5))

## [0.92.2](https://github.com/staff0rd/assist/compare/v0.92.1...v0.92.2) (2026-02-25)


### Bug Fixes

* make voice runtime deps optional ([017f4f8](https://github.com/staff0rd/assist/commit/017f4f8dd1e4f1b55b017874786fcb750849e804))

## [0.92.1](https://github.com/staff0rd/assist/compare/v0.92.0...v0.92.1) (2026-02-25)


### Bug Fixes

* use short default sound for WSL notify ([551b912](https://github.com/staff0rd/assist/commit/551b912c639e9f3ec4b440e950b77f97aa547b23))

# [0.92.0](https://github.com/staff0rd/assist/compare/v0.91.0...v0.92.0) (2026-02-25)


### Features

* new vite adds vscode config auto ([9c7b274](https://github.com/staff0rd/assist/commit/9c7b2748f027f9ad440b3dc6f6575349ab650239))

# [0.91.0](https://github.com/staff0rd/assist/compare/v0.90.0...v0.91.0) (2026-02-24)


### Features

* commit takes files and status ([24f04fc](https://github.com/staff0rd/assist/commit/24f04fcba9603a7f6b171f55fbaf25a7e86409ab))

# [0.90.0](https://github.com/staff0rd/assist/compare/v0.89.2...v0.90.0) (2026-02-24)


### Features

* color context % in status line ([22dcf4c](https://github.com/staff0rd/assist/commit/22dcf4cd619b9f7c0ebb500e189c7c028a4ad274))

## [0.89.2](https://github.com/staff0rd/assist/compare/v0.89.1...v0.89.2) (2026-02-24)


### Bug Fixes

* hide done items in backlog list ([e25dba6](https://github.com/staff0rd/assist/commit/e25dba60b52c445d916ee853cc3669994d08caef))

## [0.89.1](https://github.com/staff0rd/assist/compare/v0.89.0...v0.89.1) (2026-02-24)


### Bug Fixes

* paginate gh api in list-comments ([74e68f1](https://github.com/staff0rd/assist/commit/74e68f1a2589fdd17ea9823cd9d29228fbc23ede))

# [0.89.0](https://github.com/staff0rd/assist/compare/v0.88.1...v0.89.0) (2026-02-24)


### Features

* add radon MI file-level check ([aa6f9b2](https://github.com/staff0rd/assist/commit/aa6f9b2a51298c6ae0d1ce50e422b9c525bf63b7))

## [0.88.1](https://github.com/staff0rd/assist/compare/v0.88.0...v0.88.1) (2026-02-24)


### Bug Fixes

* /verify all ([f4610a4](https://github.com/staff0rd/assist/commit/f4610a49f5f35ac5dc8dd3069c2a510cba6d6eea))

# [0.88.0](https://github.com/staff0rd/assist/compare/v0.87.0...v0.88.0) (2026-02-24)


### Features

* add radon complexity check ([ebcb715](https://github.com/staff0rd/assist/commit/ebcb715c5dc2e20115c2d47bc74c5111c9e29dbb))

# [0.87.0](https://github.com/staff0rd/assist/compare/v0.86.1...v0.87.0) (2026-02-24)


### Features

* add ast alias for assist ([5a5afad](https://github.com/staff0rd/assist/commit/5a5afada3f75892f7c92005eed74860553d8cee2))

## [0.86.1](https://github.com/staff0rd/assist/compare/v0.86.0...v0.86.1) (2026-02-24)


### Bug Fixes

* reset silence after smart turn check ([0dc1fea](https://github.com/staff0rd/assist/commit/0dc1fea7b21e63337b03a89fd68e5c444f6ce4f9))

# [0.86.0](https://github.com/staff0rd/assist/compare/v0.85.1...v0.86.0) (2026-02-24)


### Features

* GPU inference for STT ([1ff58ac](https://github.com/staff0rd/assist/commit/1ff58ac2321b5575c60a25ef7582e9800d25bea9))

## [0.85.1](https://github.com/staff0rd/assist/compare/v0.85.0...v0.85.1) (2026-02-23)


### Bug Fixes

* word-level diff for voice typing ([f31eac8](https://github.com/staff0rd/assist/commit/f31eac86d49a5670aa20316e72187cdfc9270374))

# [0.85.0](https://github.com/staff0rd/assist/compare/v0.84.0...v0.85.0) (2026-02-23)


### Features

* add verify no-venv check ([add385a](https://github.com/staff0rd/assist/commit/add385af6914dadf7b5bc5326d2b44a6e285e7b3))

# [0.84.0](https://github.com/staff0rd/assist/compare/v0.83.1...v0.84.0) (2026-02-23)


### Features

* run env support & voice refactor ([acb3d92](https://github.com/staff0rd/assist/commit/acb3d9257b42df13d22a8d8ad665863b180e9a94))

## [0.83.1](https://github.com/staff0rd/assist/compare/v0.83.0...v0.83.1) (2026-02-23)


### Bug Fixes

* use uv sync instead of pip install ([3e5580f](https://github.com/staff0rd/assist/commit/3e5580f8a0fd7170485b0a8ddc953cb90ada7b40))

# [0.83.0](https://github.com/staff0rd/assist/compare/v0.82.0...v0.83.0) (2026-02-23)


### Bug Fixes

* add check:types script for CI ([8467852](https://github.com/staff0rd/assist/commit/84678523b435d73134c66d4dd7067e9a29e32b10))
* deduplicate voice daemon code ([c1f2a96](https://github.com/staff0rd/assist/commit/c1f2a969e05e63a33a9e5b9504f8324723ae8880))
* exclude dist from verify checks ([e38723f](https://github.com/staff0rd/assist/commit/e38723fe0a3dbe9390eb28748e33fd8213488977))
* write debug output to voice console window ([a5844a8](https://github.com/staff0rd/assist/commit/a5844a8530d86b99b513236c2f2f80ae12e35fcc))


### Features

* add filter to verify run config ([b7688f5](https://github.com/staff0rd/assist/commit/b7688f55e7b984304eca2f083ef855d0570dc2da))
* add verify all and diff filters ([04a1f07](https://github.com/staff0rd/assist/commit/04a1f074ea44478bf67987f63c700dee2a0b6b91))
* change default wake word ([0f254f7](https://github.com/staff0rd/assist/commit/0f254f7913b5681d92d089e7036a696fda352188))
* default submit word to go ([39e98c9](https://github.com/staff0rd/assist/commit/39e98c9206a6ce6965dc4cec2ba679615429ab1c))

# [0.82.0](https://github.com/staff0rd/assist/compare/v0.81.0...v0.82.0) (2026-02-23)


### Features

* add voice submit word ([599002b](https://github.com/staff0rd/assist/commit/599002b88fb0bf795f22b6925197f933e730281d))

# [0.81.0](https://github.com/staff0rd/assist/compare/v0.80.0...v0.81.0) (2026-02-23)


### Features

* set voice wake word ([177a94b](https://github.com/staff0rd/assist/commit/177a94b09d1042666c994a700c82dd9f3fb0d044))

# [0.80.0](https://github.com/staff0rd/assist/compare/v0.79.0...v0.80.0) (2026-02-23)


### Features

* add voice interaction daemon ([51b1714](https://github.com/staff0rd/assist/commit/51b17147c73aa106968d2652872b43c45dac8e25))

# [0.79.0](https://github.com/staff0rd/assist/compare/v0.78.0...v0.79.0) (2026-02-23)


### Features

* add prs comment command ([ae200ce](https://github.com/staff0rd/assist/commit/ae200cef01ab88ae4df8cea3a14b0c41d4f9591d))

# [0.78.0](https://github.com/staff0rd/assist/compare/v0.77.0...v0.78.0) (2026-02-22)


### Features

* add type (story/bug) to backlog ([c0d5344](https://github.com/staff0rd/assist/commit/c0d5344e55cc9af0b6dece648a8df8d279aaa251))

# [0.77.0](https://github.com/staff0rd/assist/compare/v0.76.0...v0.77.0) (2026-02-22)


### Features

* add hardcoded-colors ignore config ([4707135](https://github.com/staff0rd/assist/commit/470713533f111623bd01b036cdd84a23e8032bad))

# [0.76.0](https://github.com/staff0rd/assist/compare/v0.75.0...v0.76.0) (2026-02-22)


### Features

* add backlog delete command ([6028a97](https://github.com/staff0rd/assist/commit/6028a9708fbe8ade2596f059525e177c9b9b03ca))

# [0.75.0](https://github.com/staff0rd/assist/compare/v0.74.0...v0.75.0) (2026-02-22)


### Features

* default backlog to web UI ([d0a34b3](https://github.com/staff0rd/assist/commit/d0a34b37b0b2e04a7e438fa9aaae29526ca79d82))

# [0.74.0](https://github.com/staff0rd/assist/compare/v0.73.0...v0.74.0) (2026-02-22)


### Features

* add completed items toggle ([79d034f](https://github.com/staff0rd/assist/commit/79d034f2941e11ceec777cc4fa03820d0179b434))

# [0.73.0](https://github.com/staff0rd/assist/compare/v0.72.0...v0.73.0) (2026-02-22)


### Features

* migrate backlog web to tailwind ([62dc968](https://github.com/staff0rd/assist/commit/62dc9684a6fbe3eb3e4eb918387a4627ba2fb53a))

# [0.72.0](https://github.com/staff0rd/assist/compare/v0.71.0...v0.72.0) (2026-02-22)


### Features

* migrate backlog forms to base-ui ([40c0f53](https://github.com/staff0rd/assist/commit/40c0f531ac191a66e7f8f94d45aa94904cc17d0f))

# [0.71.0](https://github.com/staff0rd/assist/compare/v0.70.0...v0.71.0) (2026-02-22)


### Features

* open browser on backlog web ([f33782e](https://github.com/staff0rd/assist/commit/f33782ef318aef3b0c1bdfa66b81e8e25c87f806))

# [0.70.0](https://github.com/staff0rd/assist/compare/v0.69.0...v0.70.0) (2026-02-22)


### Features

* move run list to subcommand ([c03e301](https://github.com/staff0rd/assist/commit/c03e30192bcdcb65ee1ea008d0f416be8b933729))

# [0.69.0](https://github.com/staff0rd/assist/compare/v0.68.0...v0.69.0) (2026-02-22)


### Features

* add verify list command ([6668376](https://github.com/staff0rd/assist/commit/6668376d27a873a48ec810835acbe49638a4ea5f))

# [0.68.0](https://github.com/staff0rd/assist/compare/v0.67.0...v0.68.0) (2026-02-22)


### Features

* list run configs with no args ([81be6b0](https://github.com/staff0rd/assist/commit/81be6b08fc347bfc2faca2b6b1e5efec2cd630cf))

# [0.67.0](https://github.com/staff0rd/assist/compare/v0.66.1...v0.67.0) (2026-02-21)


### Features

* react frontend for backlog web ([8f019a0](https://github.com/staff0rd/assist/commit/8f019a0bb778f6527fe1b4376d951f672e17b3a4))

## [0.66.1](https://github.com/staff0rd/assist/compare/v0.66.0...v0.66.1) (2026-02-21)


### Bug Fixes

* preserve unknown config keys on save ([39c898c](https://github.com/staff0rd/assist/commit/39c898c397376270f9d73a9de39c3b079cbf2c94))

# [0.66.0](https://github.com/staff0rd/assist/compare/v0.65.0...v0.66.0) (2026-02-19)


### Features

* verify from run configs and scripts ([1171997](https://github.com/staff0rd/assist/commit/1171997eeaf4208f6882dad669a200556427e1a4))

# [0.65.0](https://github.com/staff0rd/assist/compare/v0.64.2...v0.65.0) (2026-02-19)


### Features

* generate command file on run add ([ad1b095](https://github.com/staff0rd/assist/commit/ad1b09528a01dac27d77c0da39f967d52ff9baf3))

## [0.64.2](https://github.com/staff0rd/assist/compare/v0.64.1...v0.64.2) (2026-02-18)


### Bug Fixes

* normalize path compare in update ([d7ea054](https://github.com/staff0rd/assist/commit/d7ea0545309cca1c76b838d7d1479cb3fe337738))

## [0.64.1](https://github.com/staff0rd/assist/compare/v0.64.0...v0.64.1) (2026-02-17)


### Bug Fixes

* add defaults to commit config ([22d2a5a](https://github.com/staff0rd/assist/commit/22d2a5adb7b44a901949e2178f67a91a6b232ab4))

# [0.64.0](https://github.com/staff0rd/assist/compare/v0.63.0...v0.64.0) (2026-02-17)


### Features

* add journal and standup commands ([73d7e76](https://github.com/staff0rd/assist/commit/73d7e76f85ec5c0c76f3ff82634b4b1c1f9d9df3))

# [0.63.0](https://github.com/staff0rd/assist/compare/v0.62.0...v0.63.0) (2026-02-15)


### Features

* roam OAuth authorization flow ([14b9db0](https://github.com/staff0rd/assist/commit/14b9db03241c87441695cb2983195438b16aa0aa))

# [0.62.0](https://github.com/staff0rd/assist/compare/v0.61.0...v0.62.0) (2026-02-15)


### Features

* allow git log permission ([c115888](https://github.com/staff0rd/assist/commit/c1158886ff7895273c6d9bc72ade506a4d6c23c7))

# [0.61.0](https://github.com/staff0rd/assist/compare/v0.60.0...v0.61.0) (2026-02-15)


### Features

* allow git grep permission ([2634eee](https://github.com/staff0rd/assist/commit/2634eeeccdf4e68cec972395db124e4a4b35ccbd))

# [0.60.0](https://github.com/staff0rd/assist/compare/v0.59.0...v0.60.0) (2026-02-15)


### Features

* allow git status permission ([78d35e2](https://github.com/staff0rd/assist/commit/78d35e22a445c6867ade1a4b71023dae8626985a))

# [0.59.0](https://github.com/staff0rd/assist/compare/v0.58.2...v0.59.0) (2026-02-15)


### Features

* add roam auth command ([ed27dd7](https://github.com/staff0rd/assist/commit/ed27dd73269333436597631650bfd44b4a21e068))

## [0.58.2](https://github.com/staff0rd/assist/compare/v0.58.1...v0.58.2) (2026-02-14)


### Bug Fixes

* clarify one-at-a-time guidance ([92fb9a4](https://github.com/staff0rd/assist/commit/92fb9a48ae592b2c06aa0999258d38c8e5bb04ee))

## [0.58.1](https://github.com/staff0rd/assist/compare/v0.58.0...v0.58.1) (2026-02-14)


### Bug Fixes

* bold one-file-at-a-time advice ([c2171a8](https://github.com/staff0rd/assist/commit/c2171a86092d665fde7a18f332a679d1e0cc78df))

# [0.58.0](https://github.com/staff0rd/assist/compare/v0.57.0...v0.58.0) (2026-02-13)


### Features

* add update command ([c2fcb01](https://github.com/staff0rd/assist/commit/c2fcb011f8e4f6e78c4a9f7504b9ee22856c0490))

# [0.57.0](https://github.com/staff0rd/assist/compare/v0.56.2...v0.57.0) (2026-02-13)


### Features

* add skip option to review-comments ([4365541](https://github.com/staff0rd/assist/commit/4365541cb491ba8334d1a952d490f3d697161120))

## [0.56.2](https://github.com/staff0rd/assist/compare/v0.56.1...v0.56.2) (2026-02-13)


### Bug Fixes

* allow complexity commands ([f070bc8](https://github.com/staff0rd/assist/commit/f070bc897840002dd4d2217e9d8ec416e51042ad))

## [0.56.1](https://github.com/staff0rd/assist/compare/v0.56.0...v0.56.1) (2026-02-12)


### Bug Fixes

* remove update command ([450c933](https://github.com/staff0rd/assist/commit/450c933ec1014ca3f7c445bb48dd8c55eba2f714))

# [0.56.0](https://github.com/staff0rd/assist/compare/v0.55.0...v0.56.0) (2026-02-11)


### Features

* add editor support for backlog descriptions ([9026570](https://github.com/staff0rd/assist/commit/9026570054956aa9ca91a6962fe2b9f9210d0b02))

# [0.55.0](https://github.com/staff0rd/assist/compare/v0.54.0...v0.55.0) (2026-02-11)


### Features

* add next-backlog-item command ([c4b42c8](https://github.com/staff0rd/assist/commit/c4b42c8302431b455fc0e98d9c2703d9ad42216c))

# [0.54.0](https://github.com/staff0rd/assist/compare/v0.53.0...v0.54.0) (2026-02-11)


### Features

* add verbose flag to backlog list ([0c8902c](https://github.com/staff0rd/assist/commit/0c8902c1618245c3416457ae1f1968c3a52d01c7))

# [0.53.0](https://github.com/staff0rd/assist/compare/v0.52.0...v0.53.0) (2026-02-11)


### Features

* add backlog command ([fd6cdd5](https://github.com/staff0rd/assist/commit/fd6cdd569831e52716c5f77d3a54eeed9ddceedc))

# [0.52.0](https://github.com/staff0rd/assist/compare/v0.51.0...v0.52.0) (2026-02-11)


### Features

* add git init to new commands ([1c087a2](https://github.com/staff0rd/assist/commit/1c087a2deb9b6208dcef3b7ef3c989fcae1f3515))

# [0.51.0](https://github.com/staff0rd/assist/compare/v0.50.0...v0.51.0) (2026-02-11)


### Features

* add tsup support to vscode init ([9d7ffde](https://github.com/staff0rd/assist/commit/9d7ffdeee78f6a487abb80d5a923b648529f17d0))

# [0.50.0](https://github.com/staff0rd/assist/compare/v0.49.0...v0.50.0) (2026-02-11)


### Features

* add maintainability to verify init ([cf03af1](https://github.com/staff0rd/assist/commit/cf03af13e307e256a9fbd3fd9a0a1ecdfdf2f323))

# [0.49.0](https://github.com/staff0rd/assist/compare/v0.48.0...v0.49.0) (2026-02-11)


### Features

* add new cli command ([a60b40a](https://github.com/staff0rd/assist/commit/a60b40a5952ffde1fd94b6bb9b578a456479bb0b))

# [0.48.0](https://github.com/staff0rd/assist/compare/v0.47.1...v0.48.0) (2026-02-10)


### Features

* validate sha in prs fixed ([49f5575](https://github.com/staff0rd/assist/commit/49f557567d7b8bf303ce13a24e49511ff715969c))

## [0.47.1](https://github.com/staff0rd/assist/compare/v0.47.0...v0.47.1) (2026-02-10)


### Bug Fixes

* improve maintainability error message ([5692835](https://github.com/staff0rd/assist/commit/569283546f2617f17482097b3ebea04f870e57e3))

# [0.47.0](https://github.com/staff0rd/assist/compare/v0.46.0...v0.47.0) (2026-02-10)


### Features

* add complexity default action ([9874797](https://github.com/staff0rd/assist/commit/987479717995c1d728588c5999c7e7eb2268c1e8))

# [0.46.0](https://github.com/staff0rd/assist/compare/v0.45.0...v0.46.0) (2026-02-09)


### Features

* allow gh pr view and diff ([583dc30](https://github.com/staff0rd/assist/commit/583dc30b2e1af1f327597d6a500f6956440e7d6f))

# [0.45.0](https://github.com/staff0rd/assist/compare/v0.44.0...v0.45.0) (2026-02-09)


### Features

* add restructure command ([5551478](https://github.com/staff0rd/assist/commit/5551478ee738cfefe290069543ad8f24a63c7561))

# [0.44.0](https://github.com/staff0rd/assist/compare/v0.43.1...v0.44.0) (2026-02-09)


### Features

* add readme check command ([e3fc508](https://github.com/staff0rd/assist/commit/e3fc508daff3efccf55ecaaf323137a8bf5a0cc9))

## [0.43.1](https://github.com/staff0rd/assist/compare/v0.43.0...v0.43.1) (2026-02-09)


### Bug Fixes

* update cli message ([71f09ac](https://github.com/staff0rd/assist/commit/71f09ac0d4d0ffd5b356f0cd7bc75c8a2253b2b8))

# [0.43.0](https://github.com/staff0rd/assist/compare/v0.42.2...v0.43.0) (2026-02-09)


### Features

* add refactor restructure command ([b8e3a71](https://github.com/staff0rd/assist/commit/b8e3a710ddf4df1ec29124bd58b381e53f14a797))

## [0.42.2](https://github.com/staff0rd/assist/compare/v0.42.1...v0.42.2) (2026-02-09)


### Bug Fixes

* tweak maintainability failure message ([cc807f0](https://github.com/staff0rd/assist/commit/cc807f0b277cf7500649fbbfe062506a2bd945d2))

## [0.42.1](https://github.com/staff0rd/assist/compare/v0.42.0...v0.42.1) (2026-02-09)


### Bug Fixes

* cap wontfix reason to 15 words ([c6cde93](https://github.com/staff0rd/assist/commit/c6cde9345dd17068c9d41abf2daeababc3b1d2b4))

# [0.42.0](https://github.com/staff0rd/assist/compare/v0.41.0...v0.42.0) (2026-02-08)


### Features

* add complexity.ignore config ([c1eb3b0](https://github.com/staff0rd/assist/commit/c1eb3b000c6b6edb2ca36b321ff4893508ee50a0))

# [0.41.0](https://github.com/staff0rd/assist/compare/v0.40.0...v0.41.0) (2026-02-08)


### Features

* add MI explanation on failure ([32e7e6c](https://github.com/staff0rd/assist/commit/32e7e6cef237f03ba9f4b17ddd5384f78517fb44))

# [0.40.0](https://github.com/staff0rd/assist/compare/v0.39.0...v0.40.0) (2026-02-08)


### Features

* add custom lint verify script ([e93085b](https://github.com/staff0rd/assist/commit/e93085be1166aa207faabc9f4eaa83a0f5eae48b))

# [0.39.0](https://github.com/staff0rd/assist/compare/v0.38.0...v0.39.0) (2026-02-08)


### Features

* add maintainability verify ([77256fc](https://github.com/staff0rd/assist/commit/77256fc714f8abe0072e291f9efa735cbf21484c))

# [0.38.0](https://github.com/staff0rd/assist/compare/v0.37.0...v0.38.0) (2026-02-08)


### Features

* filter maintainability output by threshold ([47aeb3d](https://github.com/staff0rd/assist/commit/47aeb3d3962b6273c5a25b71bead8b3f5f1160d5))

# [0.37.0](https://github.com/staff0rd/assist/compare/v0.36.1...v0.37.0) (2026-02-06)


### Features

* sync user instructions to home ([a30e687](https://github.com/staff0rd/assist/commit/a30e687b12a50523b9d40a4623681eed93ae9d1c))

## [0.36.1](https://github.com/staff0rd/assist/compare/v0.36.0...v0.36.1) (2026-02-06)


### Bug Fixes

* build with correct version in CI ([b3c99d9](https://github.com/staff0rd/assist/commit/b3c99d9cf6240446b49913db94e18ffe5c4fa9b5))

# [0.36.0](https://github.com/staff0rd/assist/compare/v0.35.0...v0.36.0) (2026-02-06)


### Features

* apply schema defaults in config list ([2705bf6](https://github.com/staff0rd/assist/commit/2705bf61c105ce81f0e15105ce857b103af0e727))

# [0.35.0](https://github.com/staff0rd/assist/compare/v0.34.0...v0.35.0) (2026-02-06)


### Features

* add notify config, default enabled ([075c89e](https://github.com/staff0rd/assist/commit/075c89eae14c0b8d9ad25edd3dede8bb4baadf83))

# [0.34.0](https://github.com/staff0rd/assist/compare/v0.33.1...v0.34.0) (2026-02-06)


### Features

* add config command with Zod validation ([175e611](https://github.com/staff0rd/assist/commit/175e6118d5f63bbdc14f97ff6c8a203fe64eaf6c))

## [0.33.1](https://github.com/staff0rd/assist/compare/v0.33.0...v0.33.1) (2026-02-06)


### Bug Fixes

* include commands in package ([9d28cd7](https://github.com/staff0rd/assist/commit/9d28cd7009a8e18a9f0cc52b71df6b6397bd4209))
* include commands in package ([1911605](https://github.com/staff0rd/assist/commit/191160552539be8f27d2d79fe4bfb5488cf268e5))

# [0.33.0](https://github.com/staff0rd/assist/compare/v0.32.6...v0.33.0) (2026-02-04)


### Features

* include resolved comments ([5c639ec](https://github.com/staff0rd/assist/commit/5c639ec7c1b846f444d29f2db4c60dccfd36d068))

## [0.32.6](https://github.com/staff0rd/assist/compare/v0.32.5...v0.32.6) (2026-02-04)


### Bug Fixes

* validate commit SHAs in wontfix ([88174d2](https://github.com/staff0rd/assist/commit/88174d2999b86340e1f0289238925b107ef5928c))

## [0.32.5](https://github.com/staff0rd/assist/compare/v0.32.4...v0.32.5) (2026-02-04)


### Bug Fixes

* strip Transcription from filename ([b693e5c](https://github.com/staff0rd/assist/commit/b693e5cb1324bf70923a4cc2df1da92a0f760d3a))

## [0.32.4](https://github.com/staff0rd/assist/compare/v0.32.3...v0.32.4) (2026-02-04)


### Bug Fixes

* url encode transcript link ([0004720](https://github.com/staff0rd/assist/commit/00047203e1a65204645c230c6e2142b828e18465))

## [0.32.3](https://github.com/staff0rd/assist/compare/v0.32.2...v0.32.3) (2026-02-04)


### Bug Fixes

* use relative path in transcript link ([e256108](https://github.com/staff0rd/assist/commit/e256108af1b60020c522d6fb7d4502a76394be8c))

## [0.32.2](https://github.com/staff0rd/assist/compare/v0.32.1...v0.32.2) (2026-02-04)


### Bug Fixes

* simplify summarise instructions ([428c3fb](https://github.com/staff0rd/assist/commit/428c3fb561bed3b087c342994caad94c5376be7c))

## [0.32.1](https://github.com/staff0rd/assist/compare/v0.32.0...v0.32.1) (2026-02-04)


### Bug Fixes

* simplify summarise instructions ([45116af](https://github.com/staff0rd/assist/commit/45116af970a37cfb14fabca95afb8badecbb37b9))

# [0.32.0](https://github.com/staff0rd/assist/compare/v0.31.1...v0.32.0) (2026-02-04)


### Features

* staged summary workflow ([089cfbb](https://github.com/staff0rd/assist/commit/089cfbbea8f7bab7e43ca99125dd30e6d8a548ed))

## [0.31.1](https://github.com/staff0rd/assist/compare/v0.31.0...v0.31.1) (2026-02-04)


### Bug Fixes

* output summaryDir path in summarise ([d3d0beb](https://github.com/staff0rd/assist/commit/d3d0bebd79b7ac4bf2a9aba66409f54c23d9d192))

# [0.31.0](https://github.com/staff0rd/assist/compare/v0.30.0...v0.31.0) (2026-02-04)


### Features

* add transcript commands ([596bcd5](https://github.com/staff0rd/assist/commit/596bcd58fd11b7fd969f8d9675be91523bc1f06c))

# [0.30.0](https://github.com/staff0rd/assist/compare/v0.29.0...v0.30.0) (2026-02-03)


### Features

* print message when no line comments ([51a9112](https://github.com/staff0rd/assist/commit/51a91120672aea9e499b34bf1b66765cd2de7783))

# [0.29.0](https://github.com/staff0rd/assist/compare/v0.28.0...v0.29.0) (2026-02-03)


### Features

* drop cache when no line comments ([031b12c](https://github.com/staff0rd/assist/commit/031b12cc32cf0af06d16ddfd5cabbc45ee68021c))

# [0.28.0](https://github.com/staff0rd/assist/compare/v0.27.0...v0.28.0) (2026-02-03)


### Features

* add prs fixed/wontfix commands ([7785189](https://github.com/staff0rd/assist/commit/7785189c019f42655b3d6ec0a7a25cb87c3d4923))

# [0.27.0](https://github.com/staff0rd/assist/compare/v0.26.0...v0.27.0) (2026-02-02)


### Features

* add readme check command ([dc4838a](https://github.com/staff0rd/assist/commit/dc4838ab2f883e9d91baaab4f2b75f996526cd0d))

# [0.26.0](https://github.com/staff0rd/assist/compare/v0.25.1...v0.26.0) (2026-02-02)


### Features

* filter out resolved PR threads ([961bdc9](https://github.com/staff0rd/assist/commit/961bdc9d3e0a6fd2ecf030f36e4fcb68a9a9c958))

## [0.25.1](https://github.com/staff0rd/assist/compare/v0.25.0...v0.25.1) (2026-02-02)


### Bug Fixes

* use 7-char SHA in commit output ([8057eb9](https://github.com/staff0rd/assist/commit/8057eb9718ba0c8bf5a7dc67e2eda17f86c5a04c))

# [0.25.0](https://github.com/staff0rd/assist/compare/v0.24.0...v0.25.0) (2026-02-02)


### Features

* add prs reply and resolve commands ([b884263](https://github.com/staff0rd/assist/commit/b88426326238806d5fd41688231753fd3ec196c6))

# [0.24.0](https://github.com/staff0rd/assist/compare/v0.23.0...v0.24.0) (2026-01-30)


### Features

* add gh run view permission ([310f5c6](https://github.com/staff0rd/assist/commit/310f5c606413efeb9dce8707450b4246f45a81af))

# [0.23.0](https://github.com/staff0rd/assist/compare/v0.22.1...v0.23.0) (2026-01-29)


### Features

* add gh pr checks permission ([784b530](https://github.com/staff0rd/assist/commit/784b5307bbe0affaf86565ddaef4360bbd08d41c))

## [0.22.1](https://github.com/staff0rd/assist/compare/v0.22.0...v0.22.1) (2026-01-28)


### Bug Fixes

* remove enable-ralph, update readme ([9043a2a](https://github.com/staff0rd/assist/commit/9043a2afd18a95fce77a0f7e05740d856f45df3d))

# [0.22.0](https://github.com/staff0rd/assist/compare/v0.21.2...v0.22.0) (2026-01-28)


### Features

* human-readable prs comments output ([12eb62a](https://github.com/staff0rd/assist/commit/12eb62aeeeabc335b2b1fd7d18d1de8cbae288b4))

## [0.21.2](https://github.com/staff0rd/assist/compare/v0.21.1...v0.21.2) (2026-01-28)


### Bug Fixes

* handle 404 in prs comments ([28984fc](https://github.com/staff0rd/assist/commit/28984fce82f483d7a927b11101abd9082bdf1e8f))

## [0.21.1](https://github.com/staff0rd/assist/compare/v0.21.0...v0.21.1) (2026-01-28)


### Bug Fixes

* windows compat for prs comments ([27df831](https://github.com/staff0rd/assist/commit/27df831b33f75d786609c1175c82bf698259ddfe))

# [0.21.0](https://github.com/staff0rd/assist/compare/v0.20.0...v0.21.0) (2026-01-28)


### Features

* add prs comments command ([7b96ae9](https://github.com/staff0rd/assist/commit/7b96ae929af13e2f71eb921ec72743b868b2b7ce))

# [0.20.0](https://github.com/staff0rd/assist/compare/v0.19.0...v0.20.0) (2026-01-27)


### Features

* add complexity command ([b081237](https://github.com/staff0rd/assist/commit/b0812379b40206aedb3bf3be2a3f6317e503a2f5))

# [0.19.0](https://github.com/staff0rd/assist/compare/v0.18.2...v0.19.0) (2026-01-27)


### Features

* add /review command for PR comments ([a6fc46c](https://github.com/staff0rd/assist/commit/a6fc46c577c1cc33741759a972a19b4ecaa35190))

## [0.18.2](https://github.com/staff0rd/assist/compare/v0.18.1...v0.18.2) (2026-01-27)


### Bug Fixes

* fail verify on knip config hints ([772b819](https://github.com/staff0rd/assist/commit/772b81957d4a80fa520a04371d468bb7d4c59fe9))

## [0.18.1](https://github.com/staff0rd/assist/compare/v0.18.0...v0.18.1) (2026-01-27)


### Bug Fixes

* biome filename convention rules ([73003af](https://github.com/staff0rd/assist/commit/73003af89ea64f26aad751e7f648106d8029bc3f))

# [0.18.0](https://github.com/staff0rd/assist/compare/v0.17.0...v0.18.0) (2026-01-27)


### Bug Fixes

* remove .js import extensions ([b724424](https://github.com/staff0rd/assist/commit/b7244240e1fba51aa1895f9ce622a7518c03a20c))


### Features

* lint rule for import extensions ([d84de0d](https://github.com/staff0rd/assist/commit/d84de0d4b735daabcc35c8081da4e06c7b4d8f3c))

# [0.17.0](https://github.com/staff0rd/assist/compare/v0.16.1...v0.17.0) (2026-01-27)


### Features

* devlog reads version from package.json ([93ec3a6](https://github.com/staff0rd/assist/commit/93ec3a65408db2ccd5ca7a3ba967325e3f8cbd28))

## [0.16.1](https://github.com/staff0rd/assist/compare/v0.16.0...v0.16.1) (2026-01-27)


### Bug Fixes

* macos notifications now popup ([900c000](https://github.com/staff0rd/assist/commit/900c000af39eb7f47e19c65889e561eec55d6019))

# [0.16.0](https://github.com/staff0rd/assist/compare/v0.15.0...v0.16.0) (2026-01-27)


### Features

* add notify command for WSL ([e4e7e45](https://github.com/staff0rd/assist/commit/e4e7e459c2d741317af37dec8836e3a5b25de337))

# [0.15.0](https://github.com/staff0rd/assist/compare/v0.14.0...v0.15.0) (2026-01-18)


### Features

* add organize imports on save ([8d64c00](https://github.com/staff0rd/assist/commit/8d64c00a63f81e06aec73ea70fdc667ee566c8f7))

# [0.14.0](https://github.com/staff0rd/assist/compare/v0.13.3...v0.14.0) (2026-01-18)


### Features

* add deploy redirect command ([7dd6e80](https://github.com/staff0rd/assist/commit/7dd6e80167761e047ba22986e82bdc1eb79d4b58))

## [0.13.3](https://github.com/staff0rd/assist/compare/v0.13.2...v0.13.3) (2026-01-18)


### Bug Fixes

* add repository url for npm ([009903e](https://github.com/staff0rd/assist/commit/009903ea9adc455ab35bff7b0d67486f8e206224))

## [0.13.2](https://github.com/staff0rd/assist/compare/v0.13.1...v0.13.2) (2026-01-18)


### Bug Fixes

* remove model prefix from status ([1a88a5a](https://github.com/staff0rd/assist/commit/1a88a5a74ccbb680d965965ae6556e225e0710cd))

## [0.13.1](https://github.com/staff0rd/assist/compare/v0.13.0...v0.13.1) (2026-01-18)


### Bug Fixes

* log after push completes ([9180e5d](https://github.com/staff0rd/assist/commit/9180e5de9543f46f974d01d5b6348a1f4601b696))

# [0.13.0](https://github.com/staff0rd/assist/compare/v0.12.0...v0.13.0) (2026-01-18)


### Features

* add commit pull/push config ([8d31beb](https://github.com/staff0rd/assist/commit/8d31bebff1d26adfbbaae8c8a18d413f304862df))

# [0.12.0](https://github.com/staff0rd/assist/compare/v0.11.0...v0.12.0) (2026-01-18)


### Features

* pull before commit ([df75336](https://github.com/staff0rd/assist/commit/df75336c158c3caaf43edb7f7592d71a5f2882d8))

# [0.11.0](https://github.com/staff0rd/assist/compare/v0.10.1...v0.11.0) (2026-01-18)


### Bug Fixes

* npm publish and add knip config ([54e7219](https://github.com/staff0rd/assist/commit/54e721919693347197a4c00a9292b6a1b4dc9bc6))
* use [x]/[ ] for WSL compat ([709971e](https://github.com/staff0rd/assist/commit/709971ee508b8daa9de3ffa7bf937acc9180efd5))


### Features

* add conventional commit validation ([4cb641a](https://github.com/staff0rd/assist/commit/4cb641abcca2fbc2342ffe4f6f09841cc8edc2fc))
* add status-line command ([e7b23cb](https://github.com/staff0rd/assist/commit/e7b23cbad18b0f2a357f12a1dbe507da33070532))
* extract removeEslint to shared ([f6c9b82](https://github.com/staff0rd/assist/commit/f6c9b82fc6b1b200d6cf795be1091ae8371b2fea))
* prompt to install netlify-cli ([84967e3](https://github.com/staff0rd/assist/commit/84967e34e9c498fe7d281c9b0ea01f5b31b85d51))

# 1.0.0 (2026-01-18)


### Bug Fixes

* run add handles special args ([d48c43b](https://github.com/staff0rd/assist/commit/d48c43b2dcb1eef00e8afc2c06ba9a934a8cb27b))
* use [x]/[ ] for WSL compat ([709971e](https://github.com/staff0rd/assist/commit/709971ee508b8daa9de3ffa7bf937acc9180efd5))


### Features

* add conventional commit validation ([4cb641a](https://github.com/staff0rd/assist/commit/4cb641abcca2fbc2342ffe4f6f09841cc8edc2fc))
* add prs command to list PRs ([6207875](https://github.com/staff0rd/assist/commit/62078752e1662e651a4a4fe84ff62f187656edbb))
* add run command ([30a9944](https://github.com/staff0rd/assist/commit/30a9944e8c241faa4eade287f9ea9f1c994958d1))
* extract removeEslint to shared ([f6c9b82](https://github.com/staff0rd/assist/commit/f6c9b82fc6b1b200d6cf795be1091ae8371b2fea))
* npm publish via semantic-release ([a265e2b](https://github.com/staff0rd/assist/commit/a265e2b8f05a32aa5cc2a2bd89e260e1c8a2aa6d))
* prompt to install netlify-cli ([84967e3](https://github.com/staff0rd/assist/commit/84967e34e9c498fe7d281c9b0ea01f5b31b85d51))
* support alternate config location ([f921ab6](https://github.com/staff0rd/assist/commit/f921ab6a3385a3ad390687f1dbe4634bab759118))
