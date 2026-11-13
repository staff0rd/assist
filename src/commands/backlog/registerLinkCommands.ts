import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

export function registerLinkCommands(cmd: Command): void {
	cmd
		.command("link <from> <to>")
		.description("Link two backlog items")
		.option(
			"--type <type>",
			"Link type (relates-to or depends-on)",
			"relates-to",
		)
		.action(lazyAction(() => import("./link"), "link"));

	cmd
		.command("unlink <from> <to>")
		.description("Remove a link between two backlog items")
		.action(lazyAction(() => import("./unlink"), "unlink"));
}
