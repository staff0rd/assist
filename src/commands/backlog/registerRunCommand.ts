import type { Command } from "commander";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { run as backlogRun } from "./run";

export function registerRunCommand(cmd: Command): void {
	cmd
		.command("run <id>")
		.description("Run a backlog item's plan phase-by-phase with Claude")
		.option("-w, --write", "Run Claude with auto permission mode (default)")
		.option("--no-write", "Run Claude without auto permission mode")
		.option(
			"--resume-session <id>",
			"Resume an interrupted Claude session for the current phase (used by the sessions daemon on restart)",
		)
		.action(
			async (id: string, opts: { write?: boolean; resumeSession?: string }) => {
				/* why: a daemon restore relaunches with --resume-session to resume an
				 * interrupted phase; pulling would move the working tree out from
				 * under that in-flight conversation, and a pull failure would abort
				 * the restore entirely. Only pull on a fresh run. */
				if (!opts.resumeSession) pullIfConfigured();
				await backlogRun(id, {
					allowEdits: opts.write !== false,
					resumeSessionId: opts.resumeSession,
				});
			},
		);
}
