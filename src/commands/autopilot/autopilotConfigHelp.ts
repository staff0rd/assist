import type { ConfigHelpEntry } from "../../shared/configHelp";

export const autopilotConfigHelp: ConfigHelpEntry[] = [
	{
		key: "autopilot.intervalMinutes",
		setter: "assist config set autopilot.intervalMinutes 60 --repo",
		note: "minutes between scheduled autopilot launches in this repo; nothing is scheduled while it, autopilot.prompt or autopilot.node is unset",
	},
	{
		key: "autopilot.prompt",
		setter: "assist config set autopilot.prompt /helm --repo",
		note: "prompt each scheduled autopilot session starts with",
	},
	{
		key: "autopilot.node",
		setter: "assist config set autopilot.node <node name> --repo",
		note: "the one node (sessions.nodeName, else its hostname) whose daemon runs this repo's schedule; unset means no node runs it",
	},
	{
		key: "autopilot.context",
		setter:
			"assist config set autopilot.context CLAUDE.md,docs/strategy.md --repo",
		note: "files /autopilot loads as context at the start of each tick",
	},
	{
		key: "autopilot.statusCommand",
		setter: 'assist config set autopilot.statusCommand "pnpm status" --repo',
		note: "command whose output is the current state /autopilot judges each tick",
	},
];
