import type { Command } from "commander";
import { cliHook } from "./cliHook";

export function registerCliHook(program: Command): void {
	program
		.command("cli-hook")
		.description("PreToolUse hook for auto-approving read-only CLI commands")
		.action(() => {
			cliHook();
		});
}
