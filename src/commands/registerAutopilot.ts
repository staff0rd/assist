import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { lazyAction } from "../shared/lazyAction";
import { autopilotConfigHelp } from "./autopilot/autopilotConfigHelp";

export function registerAutopilot(program: Command): void {
	const autopilotCommand = program
		.command("autopilot")
		.description(
			"Scheduled launches of a prompt in a repo, run by the sessions daemon",
		);

	autopilotCommand
		.command("status")
		.description(
			"Print each autopilot repo's schedule: state, interval, next and last tick",
		)
		.action(lazyAction(() => import("./autopilot/status"), "status"));

	configHelp(autopilotCommand, autopilotConfigHelp);
}
