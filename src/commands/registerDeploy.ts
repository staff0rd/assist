import type { Command } from "commander";
import { lazyAction } from "../shared/lazyAction";

export function registerDeploy(program: Command): void {
	const deployCommand = program
		.command("deploy")
		.description("Netlify deployment utilities");

	deployCommand
		.command("init")
		.description("Initialize Netlify project and configure deployment")
		.action(lazyAction(() => import("./deploy/init"), "init"));

	deployCommand
		.command("redirect")
		.description("Add trailing slash redirect script to index.html")
		.action(lazyAction(() => import("./deploy/redirect"), "redirect"));
}
