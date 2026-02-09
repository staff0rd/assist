import type { Command } from "commander";
import {
	cyclomatic as complexityCyclomatic,
	halstead as complexityHalstead,
	maintainability as complexityMaintainability,
	sloc as complexitySloc,
} from "./complexity";

export function registerComplexity(program: Command): void {
	const complexityCommand = program
		.command("complexity")
		.description("Analyze TypeScript code complexity metrics");

	complexityCommand
		.command("cyclomatic [pattern]")
		.description("Calculate cyclomatic complexity per function")
		.option("--threshold <number>", "Max complexity threshold", Number.parseInt)
		.action(complexityCyclomatic);

	complexityCommand
		.command("halstead [pattern]")
		.description("Calculate Halstead metrics per function")
		.option("--threshold <number>", "Max volume threshold", Number.parseInt)
		.action(complexityHalstead);

	complexityCommand
		.command("maintainability [pattern]")
		.description("Calculate maintainability index per file")
		.option(
			"--threshold <number>",
			"Min maintainability threshold",
			Number.parseInt,
		)
		.action(complexityMaintainability);

	complexityCommand
		.command("sloc [pattern]")
		.description("Count source lines of code per file")
		.option("--threshold <number>", "Max lines threshold", Number.parseInt)
		.action(complexitySloc);
}
