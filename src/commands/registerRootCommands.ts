import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
import { rootConfigHelp } from "./rootConfigHelp";
import { registerStatusLine } from "./registerStatusLine";
import { lazyAction } from "../shared/lazyAction";

function registerLint(program: Command): void {
	const lintCommand = program
		.command("lint")
		.description("Run lint checks for conventions not enforced by oxlint")
		.option("-f, --fix", "Auto-fix violations where possible")
		.action(lazyAction(() => import("./lint/lint"), "lint"));

	lintCommand
		.command("init")
		.description("Initialize oxlint with baseline linter config")
		.action(lazyAction(() => import("./lint/init"), "init"));
}

function registerVscode(program: Command): void {
	program
		.command("vscode")
		.description("VS Code configuration utilities")
		.command("init")
		.description("Add VS Code configuration files")
		.action(lazyAction(() => import("./vscode/init"), "init"));
}

function registerNotify(program: Command): void {
	const notifyCommand = program
		.command("notify")
		.description(
			"Show notification from Claude Code hook (reads JSON from stdin)",
		)
		.action(lazyAction(() => import("./notify"), "notify"));

	internalCommand(notifyCommand, "the Notification hook");
	configHelp(notifyCommand, rootConfigHelp.notify);
}

function registerScreenshot(program: Command): void {
	const screenshotCommand = program
		.command("screenshot")
		.description("Capture a screenshot of a running application window")
		.argument("<process>", "Name of the running process (e.g. notepad, code)")
		.action(lazyAction(() => import("./screenshot"), "screenshot"));

	configHelp(screenshotCommand, rootConfigHelp.screenshot);
}

export function registerRootCommands(program: Command): void {
	program
		.command("init")
		.description("Initialize VS Code and verify configurations")
		.action(lazyAction(() => import("./init"), "init"));

	registerLint(program);
	registerVscode(program);

	registerStatusLine(program);

	registerNotify(program);

	program
		.command("update")
		.description("Update assist to the latest version and sync commands")
		.action(lazyAction(() => import("./update"), "update"));

	program
		.command("coverage")
		.description("Print global statement coverage percentage")
		.action(lazyAction(() => import("./coverage"), "coverage"));

	registerScreenshot(program);
}
