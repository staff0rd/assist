import type { Command } from "commander";
import { link } from "./link";
import { unlink } from "./unlink";

export function registerLinkCommands(cmd: Command): void {
	cmd
		.command("link <from> <to>")
		.description("Link two backlog items")
		.option(
			"--type <type>",
			"Link type (relates-to or depends-on)",
			"relates-to",
		)
		.action(link);

	cmd
		.command("unlink <from> <to>")
		.description("Remove a link between two backlog items")
		.action(unlink);
}
