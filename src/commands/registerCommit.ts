import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { commit } from "./commit";
import { rootConfigHelp } from "./rootConfigHelp";

function collectRef(value: string, previous: string[]): string[] {
	return [...previous, value];
}

export function registerCommit(program: Command): void {
	const commitCommand = program
		.command("commit")
		.description("Create a git commit with validation")
		.argument("<args...>", "status | <message> [files...]")
		.option(
			"--ref <ref>",
			"Add a Ref: trailer carrying free text with a URL (repeatable)",
			collectRef,
			[],
		)
		.action(commit);

	configHelp(commitCommand, rootConfigHelp.commit);
}
