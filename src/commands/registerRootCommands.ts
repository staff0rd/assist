import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { coverage } from "./coverage";
import { init } from "./init";
import { init as lintInit } from "./lint/init";
import { lint } from "./lint/lint";
import { notify } from "./notify";
import { rootConfigHelp } from "./rootConfigHelp";
import { screenshot } from "./screenshot";
import { statusLine } from "./statusLine";
import { update } from "./update";
import { init as vscodeInit } from "./vscode/init";

function registerLint(program: Command): void {
	const lintCommand = program
		.command("lint")
		.description("Run lint checks for conventions not enforced by oxlint")
		.option("-f, --fix", "Auto-fix violations where possible")
		.action(lint);

	lintCommand
		.command("init")
		.description("Initialize oxlint with baseline linter config")
		.action(lintInit);
}

function registerVscode(program: Command): void {
	program
		.command("vscode")
		.description("VS Code configuration utilities")
		.command("init")
		.description("Add VS Code configuration files")
		.action(vscodeInit);
}

function registerNotify(program: Command): void {
	const notifyCommand = program
		.command("notify")
		.description(
			"Show notification from Claude Code hook (reads JSON from stdin)",
		)
		.action(notify);

	configHelp(notifyCommand, rootConfigHelp.notify);
}

function registerScreenshot(program: Command): void {
	const screenshotCommand = program
		.command("screenshot")
		.description("Capture a screenshot of a running application window")
		.argument("<process>", "Name of the running process (e.g. notepad, code)")
		.action(screenshot);

	configHelp(screenshotCommand, rootConfigHelp.screenshot);
}

export function registerRootCommands(program: Command): void {
	program
		.command("init")
		.description("Initialize VS Code and verify configurations")
		.action(init);

	registerLint(program);
	registerVscode(program);

	program
		.command("status-line")
		.description("Format Claude Code status line from JSON stdin")
		.action(statusLine);

	registerNotify(program);

	program
		.command("update")
		.description("Update assist to the latest version and sync commands")
		.action(update);

	program
		.command("coverage")
		.description("Print global statement coverage percentage")
		.action(coverage);

	registerScreenshot(program);
}
