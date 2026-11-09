const properties: [key: string, flag: string, note: string][] = [
	["name", "<name>", "what you type after assist run"],
	["command", "<command>", "executable to spawn"],
	["args", "[args...]", "static args appended to the command"],
	["cwd", "--cwd <dir>", "working directory, relative to the config file"],
	[
		"env",
		"--env KEY=VALUE",
		"environment variable for the command (repeatable)",
	],
	["server", "--server [group]", "singleton dev server, optionally grouped"],
	["port", "--port <port>", "display-only port on the serving card"],
	[
		"protocol",
		"--protocol <http|https>",
		"protocol of the serving card's port link (default: http)",
	],
	[
		"pre",
		"--pre <command>",
		"shell command run before this one (repeatable, runs in order)",
	],
	[
		"filter",
		"--filter <glob>",
		"verify: entries only run when a changed file matches this glob",
	],
	["quiet", "--quiet", "suppress the command's output unless it fails"],
	[
		"params",
		"--param <spec>",
		"positional param filled from assist run args (repeatable, see below)",
	],
];

const width = Math.max(...properties.map(([key]) => key.length));
const flagWidth = Math.max(...properties.map(([, flag]) => flag.length));

export const runAddHelpText = [
	"",
	"Run entry properties:",
	...properties.map(
		([key, flag, note]) =>
			`  ${key.padEnd(width)}  ${flag.padEnd(flagWidth)}  ${note}`,
	),
	"",
	'The command is spawned without a shell, so "FOO=bar cmd", "&&", pipes and redirects do not work; use --env for environment variables and --pre for setup steps (--pre commands do run in a shell).',
	"",
	'Options go after <command>. --server and --repo take the next argument as their value unless it starts with "-", so put them last or before another option:',
	"  assist run add dev npm run dev --env PORT=3000 --server --port 3000 --repo",
	"These flags are taken from anywhere after <command>; to pass one to the command itself, quote the whole command:",
	'  assist run add build "pnpm --filter web build"',
	"",
	"--param <spec> appends params in order; each fills the next arg given to assist run:",
	"  <name>            optional, omitted when not given",
	"  <name>!           required, assist run fails when it is missing",
	"  <name>=<default>  used when not given",
	'  assist run add deploy ./deploy.sh --param env! --param tag=latest   # assist run deploy prod → "./deploy.sh prod latest"',
	"A param's description is set in config.",
].join("\n");
