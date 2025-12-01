# assist

A CLI tool for development workflow automation.

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

- `assist sync` - Copy command files to `~/.claude/commands`
- `assist commit <message>` - Create a git commit with validation
- `assist verify` - Run all verify:* scripts from package.json in parallel
- `assist lint` - Run lint checks for conventions not enforced by biomejs
- `assist refactor check [pattern]` - Check for files that exceed 100 lines
- `assist refactor ignore <file> --reason <reason>` - Add a file to the refactor ignore list

