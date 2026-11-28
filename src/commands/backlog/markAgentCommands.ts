import type { Command } from "commander";
import {
	type InternalCommand,
	internalCommand,
} from "../../shared/internalCommand";

const AGENTS = "agents working on backlog items";

const agentCommands: Record<string, string> = {
	add: AGENTS,
	"add-phase": AGENTS,
	"update-phase": AGENTS,
	"remove-phase": AGENTS,
	"move-phase": AGENTS,
	start: AGENTS,
	stop: AGENTS,
	wontdo: AGENTS,
	"set-status": AGENTS,
	star: AGENTS,
	unstar: AGENTS,
	delete: AGENTS,
	"delete-comment": AGENTS,
	link: AGENTS,
	unlink: AGENTS,
	"associate-jira": "/draft, /bug and /refine",
	"associate-github": "/draft, /bug and /refine",
	run: "the dashboard's Build and assist next",
	refine: AGENTS,
	rewind: "the review phase of a backlog run",
	delivered: "the review phase of a backlog run",
	result: AGENTS,
};

export function markAgentCommands(cmd: Command): void {
	for (const [name, calledBy] of Object.entries(agentCommands)) {
		const command = cmd.commands.find((c) => c.name() === name);
		if (!command) throw new Error(`No backlog command named ${name}`);
		if (!(command as InternalCommand).internalCalledBy)
			internalCommand(command, calledBy);
	}
}
