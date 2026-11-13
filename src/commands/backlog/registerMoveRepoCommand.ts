import type { Command } from "commander";

export function registerMoveRepoCommand(cmd: Command): void {
	cmd
		.command("move-repo <old-origin> [new-origin]")
		.description(
			"Retag all items from one origin to another after a repo rename (new origin defaults to the current repo's remote)",
		)
		.option("-y, --yes", "Skip the confirmation prompt")
		.action(
			async (
				oldOrigin: string,
				newOrigin: string | undefined,
				options: { yes?: boolean },
			) => (await import("./moveRepo")).moveRepo(oldOrigin, newOrigin, options),
		);
}
