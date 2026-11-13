import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

export function registerNew(program: Command): void {
	const newCommand = program
		.command("new")
		.description("Scaffold a new project");

	newCommand
		.command("vite")
		.description("Initialize a new Vite React TypeScript project")
		.action(lazyAction(() => import("./registerNew/newProject"), "newProject"));

	newCommand
		.command("cli")
		.description("Initialize a new tsup CLI project")
		.action(lazyAction(() => import("./registerNew/newCli"), "newCli"));
}
