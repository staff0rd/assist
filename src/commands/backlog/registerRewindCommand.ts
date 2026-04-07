import type { Command } from "commander";
import { rewindPhase } from "./rewindPhase";

export function registerRewindCommand(cmd: Command): void {
	cmd
		.command("rewind <id> <phase>")
		.description("Rewind a backlog item to an earlier phase")
		.requiredOption("--reason <reason>", "Reason for rewinding")
		.action(rewindPhase);
}
