import type { Command } from "commander";
import { checkBuildLocksCommand } from "./dotnet/checkBuildLocks";
import { deps } from "./dotnet/deps";
import { inSln } from "./dotnet/inSln";
import { inspect } from "./dotnet/inspect";

export function registerDotnet(program: Command): void {
	const cmd = program.command("dotnet").description(".NET project utilities");

	cmd
		.command("inspect")
		.description(
			"Run JetBrains inspections on changed .cs files to find dead code",
		)
		.argument("[sln]", "Path to a .sln file (auto-detected if omitted)")
		.option("--ref <ref>", "Git commit to inspect (default: working copy)")
		.option("--all", "Show all issues, not just dead code")
		.action(inspect);

	cmd
		.command("check-locks")
		.description("Check if build output files are locked by a debugger")
		.action(checkBuildLocksCommand);

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
