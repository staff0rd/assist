import type { Command } from "commander";
import { auth } from "./auth";

export function registerRoam(program: Command): void {
	const roamCommand = program
		.command("roam")
		.description("Roam Research utilities");

	roamCommand
		.command("auth")
		.description("Configure Roam API credentials")
		.action(auth);
}
