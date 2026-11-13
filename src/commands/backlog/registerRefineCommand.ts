import type { Command } from "commander";

export function registerRefineCommand(cmd: Command): void {
	cmd
		.command("refine")
		.argument("[id]", "Backlog item ID")
		.description("Alias for refine")
		.option("--once", "Exit when the initial task completes")
		.option(
			"--harness <kind>",
			"Coding harness to launch (claude|codex|pi); defaults to the configured harness.engine. Exits with the reasons, without launching, when Refine is unavailable on it",
		)
		.action(
			async (
				id: string | undefined,
				opts: { once?: boolean; harness?: string },
			) => {
				const { refine: backlogRefine } = await import("./refine");
				const { resolveHarness } = await import("./resolveHarness");
				return backlogRefine(id, {
					once: opts.once,
					harness: resolveHarness(opts.harness),
				});
			},
		);
}
