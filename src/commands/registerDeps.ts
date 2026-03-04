import type { Command } from "commander";
import { deps } from "./deps";

export function registerDeps(program: Command): void {
	program
		.command("deps")
		.description("Show .csproj project dependency tree and solution membership")
		.argument("<csproj>", "Path to a .csproj file")
		.option("--json", "Output as JSON")
		.action(deps);
}
