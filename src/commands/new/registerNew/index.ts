import type { Command } from "commander";
import { newCli } from "./newCli";
import { newProject } from "./newProject";

export function registerNew(program: Command): void {
	const newCommand = program
		.command("new")
		.description("Scaffold a new project");

	newCommand
		.command("vite")
		.description("Initialize a new Vite React TypeScript project")
		.action(newProject);

	newCommand
		.command("cli")
		.description("Initialize a new tsup CLI project")
		.action(newCli);
}
