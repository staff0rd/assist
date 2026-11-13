import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { complexityConfigHelp } from "./complexity/complexityConfigHelp";
import { lazyAction } from "../shared/lazyAction";

export function registerComplexity(program: Command): void {
	const complexityCommand = program
		.command("complexity")
		.description("Analyze TypeScript code complexity metrics")
		.argument("[pattern]")
		.action(async (pattern?: string) => {
			const { analyze: complexityAnalyze } =
				await import("./complexity/analyze");
			if (!pattern) {
				complexityCommand.help();
				return;
			}
			return complexityAnalyze(pattern);
		});

	complexityCommand
		.command("cyclomatic [pattern]")
		.description("Calculate cyclomatic complexity per function")
		.option("--threshold <number>", "Max complexity threshold", Number.parseInt)
		.action(lazyAction(() => import("./complexity/cyclomatic"), "cyclomatic"));

	complexityCommand
		.command("halstead [pattern]")
		.description("Calculate Halstead metrics per function")
		.option("--threshold <number>", "Max volume threshold", Number.parseInt)
		.action(lazyAction(() => import("./complexity/halstead"), "halstead"));

	complexityCommand
		.command("maintainability [pattern]")
		.description("Calculate maintainability index per file")
		.option(
			"--threshold <number>",
			"Min maintainability threshold",
			Number.parseInt,
		)
		.option(
			"--ignore <glob>",
			"Glob of files to exclude (repeatable, additive to config)",
			(value: string, previous: string[]) => previous.concat([value]),
			[],
		)
		.action(
			lazyAction(
				() => import("./complexity/maintainability"),
				"maintainability",
			),
		);

	complexityCommand
		.command("sloc [pattern]")
		.description("Count source lines of code per file")
		.option("--threshold <number>", "Max lines threshold", Number.parseInt)
		.action(lazyAction(() => import("./complexity/sloc"), "sloc"));

	configHelp(complexityCommand, complexityConfigHelp);
}
