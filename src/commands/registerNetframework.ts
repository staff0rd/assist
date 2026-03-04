import type { Command } from "commander";
import { deps } from "./netframework/deps";
import { inSln } from "./netframework/inSln";

export function registerNetframework(program: Command): void {
	const cmd = program
		.command("netframework")
		.description(".NET Framework project utilities");

	cmd
		.command("deps")
		.description("Show .csproj project dependency tree and solution membership")
		.argument("<csproj>", "Path to a .csproj file")
		.option("--json", "Output as JSON")
		.action(deps);

	cmd
		.command("in-sln")
		.description("Check whether a .csproj is referenced by any .sln file")
		.argument("<csproj>", "Path to a .csproj file")
		.action(inSln);
}
