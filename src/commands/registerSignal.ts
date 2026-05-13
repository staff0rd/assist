import type { Command } from "commander";
import { writeSignal } from "./backlog/writeSignal";

export function registerSignal(program: Command): void {
	const signalCommand = program
		.command("signal")
		.description("Write an assist signal file");

	signalCommand
		.command("next")
		.argument("[id]", "Backlog item ID to run directly")
		.description("Write a next signal to chain into assist next")
		.action((id?: string) => {
			writeSignal("next", id ? { id } : undefined);
			console.log("Signal written.");
		});
}
