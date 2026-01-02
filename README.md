# assist

A CLI tool for enforcing determinism in LLM development workflow automation.

## Installation

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

## Commands

- `assist init` - Initialize project with VS Code and verify configurations
- `assist new` - Initialize a new Vite React TypeScript project
- `assist sync` - Copy command files to `~/.claude/commands`
- `assist commit <message>` - Create a git commit with validation
- `assist update` - Update claude-code to the latest version
- `assist verify` - Run all verify:* scripts from package.json in parallel
- `assist verify init` - Add verify scripts to a project
- `assist verify hardcoded-colors` - Check for hardcoded hex colors in src/
- `assist lint` - Run lint checks for conventions not enforced by biomejs
- `assist lint init` - Initialize Biome with standard linter config
- `assist refactor check [pattern]` - Check for files that exceed the maximum line count
- `assist refactor ignore <file>` - Add a file to the refactor ignore list
- `assist devlog diff` - Group git commits by date
- `assist devlog next` - Show commits for the day after the last versioned entry
- `assist devlog skip <date>` - Add a date to the skip list
- `assist devlog version` - Show current repo name and version info
- `assist vscode init` - Add VS Code configuration files
- `assist deploy init` - Initialize Netlify project and configure deployment

