# assist

A CLI tool for enforcing determinism in LLM development workflow automation.

## Installation
You can install `assist` globally using npm:

```bash
npm install -g @staff0rd/assist
```

## Local Development

```bash
# Clone the repository
git clone git@github.com:staff0rd/assist.git
cd assist

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .
```

After installation, the `assist` command will be available globally.

## Claude Commands

- `/commit` - Commit only relevant files from the session
- `/devlog` - Generate devlog entry for the next unversioned day
- `/refactor` - Run refactoring checks for code quality
- `/restructure` - Analyze and restructure tightly-coupled files
- `/review-comments` - Process PR review comments one by one
- `/verify` - Run all verification commands in parallel
- `/transcript-format` - Format meeting transcripts from VTT files
- `/transcript-summarise` - Summarise transcripts missing summaries

## CLI Commands

- `assist init` - Initialize project with VS Code and verify configurations
- `assist new vite` - Initialize a new Vite React TypeScript project
- `assist new cli` - Initialize a new tsup CLI project
- `assist sync` - Copy command files to `~/.claude/commands`
- `assist commit <message>` - Create a git commit with validation
- `assist prs` - List pull requests for the current repository
- `assist prs list-comments` - List all comments on the current branch's pull request
- `assist prs fixed <comment-id> <sha>` - Reply with commit link and resolve thread
- `assist prs wontfix <comment-id> <reason>` - Reply with reason and resolve thread
- `assist backlog` - List all backlog items (same as `backlog list`)
- `assist backlog init` - Create an empty assist.backlog.yml
- `assist backlog list [--status <type>] [-v]` - List all backlog items with status icons
- `assist backlog add` - Add a new backlog item interactively
- `assist backlog start <id>` - Set a backlog item to in-progress
- `assist backlog done <id>` - Set a backlog item to done
- `assist run <name>` - Run a configured command from assist.yml
- `assist run add` - Add a new run configuration to assist.yml
- `assist config set <key> <value>` - Set a config value (e.g. commit.push true)
- `assist config get <key>` - Get a config value
- `assist config list` - List all config values
- `assist update` - Update claude-code to the latest version
- `assist verify` - Run all verify:* scripts from package.json in parallel
- `assist verify init` - Add verify scripts to a project
- `assist verify hardcoded-colors` - Check for hardcoded hex colors in src/
- `assist lint` - Run lint checks for conventions not enforced by biomejs
- `assist lint init` - Initialize Biome with standard linter config
- `assist refactor check [pattern]` - Check for files that exceed the maximum line count
- `assist refactor ignore <file>` - Add a file to the refactor ignore list
- `assist refactor restructure [pattern]` - Analyze import graph and restructure tightly-coupled files into nested directories
- `assist devlog list` - Group git commits by date
- `assist devlog next` - Show commits for the day after the last versioned entry
- `assist devlog skip <date>` - Add a date to the skip list
- `assist devlog version` - Show current repo name and version info
- `assist vscode init` - Add VS Code configuration files
- `assist deploy init` - Initialize Netlify project and configure deployment
- `assist deploy redirect` - Add trailing slash redirect script to index.html
- `assist notify` - Show desktop notification from JSON stdin (supports macOS, Windows, WSL)
- `assist status-line` - Format Claude Code status line from JSON stdin
- `assist complexity <pattern>` - Analyze a file (all metrics if single match, maintainability if multiple)
- `assist complexity cyclomatic [pattern]` - Calculate cyclomatic complexity per function
- `assist complexity halstead [pattern]` - Calculate Halstead metrics per function
- `assist complexity maintainability [pattern]` - Calculate maintainability index per file
- `assist complexity sloc [pattern]` - Count source lines of code per file
- `assist transcript configure` - Configure transcript directories
- `assist transcript format` - Convert VTT files to formatted markdown transcripts
- `assist transcript summarise` - List transcripts that do not have summaries

