import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { writeSignal } from "./backlog/writeSignal";

export function registerSignal(program: Command): void {
	const signalCommand = program
		.command("signal")
		.description("Write an assist signal file");

	internalCommand(
		signalCommand
			.command("next")
			.argument("[id]", "Backlog item ID to run directly")
			.description("Write a next signal to chain into assist next")
			.action((id?: string) => {
				writeSignal("next", id ? { id } : undefined);
				console.log("Signal written.");
			}),
		"/next",
	);

	internalCommand(
		signalCommand
			.command("done")
			.argument("[ids...]", "Backlog item IDs created by the session")
			.description(
				"Write a done signal to end a --once launch session, once every item it set out to create exists",
			)
			.action((ids: string[]) => {
				writeSignal("done", ids.length > 0 ? { ids } : undefined);
				console.log("Signal written.");
			}),
		"/draft, /bug, /refine",
	);
}
