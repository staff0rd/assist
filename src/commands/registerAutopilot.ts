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

	autopilotCommand
		.command("last-run")
		.description(
			"Print this repo's last finished autopilot run: its summary and the backlog items it started",
		)
		.action(lazyAction(() => import("./autopilot/lastRun"), "lastRun"));

	autopilotCommand
		.command("follow-up")
		.description(
			"From an autopilot session (or a run it started), set the next tick to fire after <duration> (e.g. 30m, 2h) instead of at the interval",
		)
		.argument("<duration>", "delay before the next tick: 30s, 30m or 2h")
		.action(lazyAction(() => import("./autopilot/followUp"), "followUp"));

	autopilotCommand
		.command("summary")
		.description(
			"From an autopilot session (or a run it started), record what this run did for the Autopilot page; each value is one plain-English line",
		)
		.requiredOption("--checked <text>", "what the run looked at")
		.requiredOption("--decided <text>", "what it decided, and why")
		.requiredOption("--started <text>", "the items it started, or none")
		.requiredOption("--next <text>", "what the next run should do")
		.action(lazyAction(() => import("./autopilot/summary"), "summary"));

	configHelp(autopilotCommand, autopilotConfigHelp);
}
