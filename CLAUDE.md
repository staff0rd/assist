When asked to commit, use conventional commits: `fix:` (patch), `feat:` (minor), `feat!:` (major).

When adding, editing, or removing CLI or Claude commands, update README.md to reflect the change.

## Config

Config is stored in `.claude/assist.yml` or `assist.yml`, validated with Zod. To add or change a config key:
1. Update the schema in `src/shared/types.ts` (`assistConfigSchema`)
2. Use `loadConfig()` from `src/shared/loadConfig.ts` to read values where needed