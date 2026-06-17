import type { Command } from "commander";
import {
	load,
	printPendingHandovers,
	recallAndPrint,
	saveHandoverFromStdin,
} from "./handover";

type SaveCliOptions = {
	summary: string;
};

export function registerHandover(program: Command): void {
	const cmd = program
		.command("handover")
		.description("Session handover utilities");

	cmd
		.command("save")
		.description(
			"Save a session handover note (content read from stdin) to the backlog DB",
		)
		.requiredOption("--summary <summary>", "One-line summary of the handover")
		.action((options: SaveCliOptions) =>
			saveHandoverFromStdin(options.summary),
		);

	cmd
		.command("list")
		.description(
			"List unrecalled handovers for this repo (tab-separated: id, created, summary), most recent first",
		)
		.action(() => printPendingHandovers());

	cmd
		.command("recall")
		.argument("[id]", "Id of a specific handover to recall")
		.description(
			"Print an unrecalled handover for this repo and mark it recalled (most recent by default, or the given id)",
		)
		.action((id: string | undefined) =>
			recallAndPrint(id === undefined ? undefined : Number(id)),
		);

	cmd
		.command("load")
		.description(
			"SessionStart hook: migrate any disk handovers, then advise how many unrecalled handovers exist for this repo",
		)
		.action(async () => {
			await load();
		});
}
