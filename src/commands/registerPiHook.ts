import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";

export function registerPiHook(program: Command): void {
	internalCommand(
		program
			.command("pi-hook")
			.description(
				"pi tool-call permission gate: reads pi's tool-call JSON from stdin and emits an allow/deny/gate decision, auto-approving read-only CLI commands via the shared cli-hook allowlist",
			)
			.action(async () => {
				const { piHook } = await import("./piHook");
				piHook();
			}),
		"assist's pi permission-gate extension",
	);
}
