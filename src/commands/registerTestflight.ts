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
		.description(
			"Add a tester to the external beta group, or with --internal invite them to the team and add them to the internal group",
		)
		.option(
			"--internal",
			"Invite to the App Store Connect team; re-run after they accept to add them to the internal group",
		)
		.action((email: string, options: { internal?: boolean }) =>
			testflightAdd(email, options),
		);

	configHelp(addCommand, testflightConfigHelp);
}
