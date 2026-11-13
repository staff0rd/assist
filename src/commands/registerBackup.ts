import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { backupConfigHelp } from "./backup/backupConfigHelp";
import { lazyAction } from "../shared/lazyAction";

export function registerBackup(program: Command): void {
	const backupCommand = program
		.command("backup")
		.description(
			"Write a backlog database dump and record it in the backups table",
		)
		.option(
			"-o, --out <dir>",
			"Directory to write the dump to (overrides the backup.dir config)",
		)
		.action(lazyAction(() => import("./backup/backup"), "backup"));

	const scheduleCommand = backupCommand
		.command("schedule")
		.description("Manage a recurring crontab entry that runs assist backup")
		.option("--every <duration>", "Cadence to run the backup (e.g. 5m, 6h)")
		.action(
			lazyAction(() => import("./backup/scheduleBackup"), "scheduleBackup"),
		);

	scheduleCommand
		.command("status")
		.description("Show the active backup schedule, or report that none is set")
		.action(
			lazyAction(() => import("./backup/scheduleBackup"), "scheduleStatus"),
		);

	scheduleCommand
		.command("remove")
		.description(
			"Remove the marked backup schedule block, leaving other crontab lines intact",
		)
		.action(
			lazyAction(() => import("./backup/scheduleBackup"), "scheduleRemove"),
		);

	configHelp(backupCommand, backupConfigHelp);
}
