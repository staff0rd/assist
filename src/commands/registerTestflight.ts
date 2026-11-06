import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { testflightAdd } from "./testflight/testflightAdd";
import { testflightConfigHelp } from "./testflight/testflightConfigHelp";

export function registerTestflight(program: Command): void {
	const cmd = program
		.command("testflight")
		.description("Manage TestFlight testers via the App Store Connect API");

	const addCommand = cmd
		.command("add <email>")
		.description("Add an external tester to the configured beta group")
		.action((email: string) => testflightAdd(email));

	configHelp(addCommand, testflightConfigHelp);
}
