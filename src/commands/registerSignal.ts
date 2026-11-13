import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";

export function registerSignal(program: Command): void {
	const signalCommand = program
		.command("signal")
		.description("Write an assist signal file");

	internalCommand(
		signalCommand
			.command("next")
			.argument("[id]", "Backlog item ID to run directly")
			.description("Write a next signal to chain into assist next")
			.action(async (id?: string) => {
				const { writeSignal } = await import("./backlog/writeSignal");
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
			.action(async (ids: string[]) => {
				const { writeSignal } = await import("./backlog/writeSignal");
				writeSignal("done", ids.length > 0 ? { ids } : undefined);
				console.log("Signal written.");
			}),
		"/draft, /bug, /refine",
	);
}
