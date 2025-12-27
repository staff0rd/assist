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
- `assist vscode init` - Initialize VS Code settings (Biome formatter, Vite debug config)
- `assist sync` - Copy command files to `~/.claude/commands`
- `assist commit <message>` - Create a git commit with validation
- `assist update` - Update claude-code to the latest version
- `assist verify` - Run all verify:* scripts from package.json in parallel
- `assist verify init` - Initialize verify scripts in package.json based on project dependencies
- `assist lint` - Run lint checks for conventions not enforced by biomejs
- `assist refactor check [pattern]` - Check for files that exceed 100 lines
- `assist refactor ignore <file> --reason <reason>` - Add a file to the refactor ignore list
- `assist devlog diff` - Show git commits grouped by date with devlog status
- `assist devlog next` - Show commits for the next unversioned day
- `assist devlog skip <date>` - Add a date to the skip list
- `assist devlog version` - Show current and next version info

