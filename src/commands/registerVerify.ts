import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { registerVerifyChecks } from "./registerVerifyChecks";
import { verifyConfigHelp } from "./verify/verifyConfigHelp";
import { lazyAction } from "../shared/lazyAction";

export function registerVerify(program: Command): void {
	const verifyCommand = program
		.command("verify")
		.description("Run all verify:* commands in parallel")
		.argument(
			"[scope]",
			'Use "all" to run all checks, ignoring diff-based filters',
		)
		.option(
			"--measure",
			"Print a summary table of each command's status and duration after the run",
		)
		.option("--verbose", "Show all output (bypass CLAUDECODE suppression)")
		.action(lazyAction(() => import("./verify/runScope"), "runScope"));

	verifyCommand
		.command("list")
		.description("List configured verify commands")
		.action(lazyAction(() => import("./verify/list"), "list"));

	verifyCommand
		.command("init")
		.description("Add verify scripts to a project")
		.option(
			"--package-json",
			"Write scripts to package.json instead of assist.yml",
		)
		.action(lazyAction(() => import("./verify/init"), "init"));

	registerVerifyChecks(verifyCommand);

	configHelp(
		verifyCommand,
		verifyConfigHelp,
		"Following MakerXStudio/verify's convention, a verify:<name> / verify:<name>:fix pair runs once: fix mode runs the :fix variant (or verify:<name> when there is none), check mode runs only verify:<name> and skips a :fix with no base. VERIFY_MODE=check|fix picks the mode; otherwise a truthy CI means check, else fix.",
	);
}
