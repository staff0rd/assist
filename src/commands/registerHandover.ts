import type { Command } from "commander";
import { archive, load, summarise } from "./handover";

type ArchiveCliOptions = {
	suffix?: string;
};

export function registerHandover(program: Command): void {
	const cmd = program
		.command("handover")
		.description("Session handover utilities");

	cmd
		.command("archive")
		.description(
			"Archive the current .assist/HANDOVER.md to .assist/handovers/archive/",
		)
		.option(
			"--suffix <suffix>",
			"Optional suffix appended to the archive filename",
		)
		.action((options: ArchiveCliOptions) => {
			const dest = archive({ suffix: options.suffix });
			if (dest) console.log(dest);
		});

	cmd
		.command("summarise")
		.description(
			"Print a one-line summary of a session JSONL via claude -p --model haiku",
		)
		.argument("<jsonl>", "Path to a session JSONL file")
		.action((jsonl: string) => {
			const line = summarise(jsonl);
			if (line) console.log(line);
		});

	cmd
		.command("load")
		.description(
			"SessionStart hook: archive prior handover and emit additionalContext (or fall back to prior-session summary)",
		)
		.action(async () => {
			await load();
		});
}
