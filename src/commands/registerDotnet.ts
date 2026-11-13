import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { dotnetConfigHelp } from "./dotnet/dotnetConfigHelp";
import { scopeHelpText } from "./dotnet/scopeHelpText";
import { lazyAction } from "../shared/lazyAction";

export function registerDotnet(program: Command): void {
	const cmd = program.command("dotnet").description(".NET project utilities");

	cmd
		.command("inspect")
		.description(
			"Run JetBrains inspections on changed .cs files to find dead code",
		)
		.argument("[sln]", "Path to a .sln file (auto-detected if omitted)")
		.option(
			"--scope <mode>",
			`File scope: ${scopeHelpText} (default: working copy diff)`,
		)
		.option("--all", "Show all issues, not just dead code")
		.option("--only <ids...>", "Show only the specified issue type IDs")
		.option("--suppress <ids...>", "Suppress specific issue type IDs")
		.option("--swea", "Enable solution-wide error analysis")
		.option("--roslyn", "Use Roslyn analyzers via msbuild instead of JetBrains")
		.action(lazyAction(() => import("./dotnet/inspect"), "inspect"));

	cmd
		.command("check-locks")
		.description("Check if build output files are locked by a debugger")
		.action(
			lazyAction(
				() => import("./dotnet/checkBuildLocks"),
				"checkBuildLocksCommand",
			),
		);

	cmd
		.command("deps")
		.description("Show .csproj project dependency tree and solution membership")
		.argument("<csproj>", "Path to a .csproj file")
		.option("--json", "Output as JSON")
		.action(lazyAction(() => import("./dotnet/deps"), "deps"));

	cmd
		.command("in-sln")
		.description("Check whether a .csproj is referenced by any .sln file")
		.argument("<csproj>", "Path to a .csproj file")
		.action(lazyAction(() => import("./dotnet/inSln"), "inSln"));

	configHelp(cmd, dotnetConfigHelp);
}
