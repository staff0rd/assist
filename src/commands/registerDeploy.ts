import type { Command } from "commander";
import { init as deployInit } from "./deploy/init";
import { redirect as deployRedirect } from "./deploy/redirect";

export function registerDeploy(program: Command): void {
	const deployCommand = program
		.command("deploy")
		.description("Netlify deployment utilities");

	deployCommand
		.command("init")
		.description("Initialize Netlify project and configure deployment")
		.action(deployInit);

	deployCommand
		.command("redirect")
		.description("Add trailing slash redirect script to index.html")
		.action(deployRedirect);
}
