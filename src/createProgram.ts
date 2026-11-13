import { Command } from "commander";
import packageJson from "../package.json";
import { registerRootAction } from "./commands/registerRootAction";
import { programRegistrars } from "./programRegistrars";

export function createProgram(): Command {
	const program = new Command();

	program
		.name("assist")
		.description("CLI application")
		.version(packageJson.version);
	registerRootAction(program);

	for (const register of programRegistrars) register(program);

	return program;
}
