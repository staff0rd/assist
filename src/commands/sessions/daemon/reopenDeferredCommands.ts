import { daemonLog } from "./daemonLog";
import { deferredCommandLabel } from "./deferredCommandLabel";
import { deliverDeferredResult } from "./deliverDeferredResult";
import { reopenedCommandEnv } from "./reopenedCommandEnv";
import { runDeferredCommand } from "./runDeferredCommand";
import { workflowQueryEnv } from "./sdk/workflowQueryEnv";
import type { DeferredDeliveryHost } from "./DeferredDeliveryHost";
import type { Session } from "./types";

export function reopenDeferredCommands(
	sessions: Iterable<Session>,
	m: DeferredDeliveryHost,
): void {
	for (const session of sessions) {
		const pending = session.deferredCommands ?? [];
		if (pending.length === 0) continue;
		if (!session.pty) {
			session.deferredCommands = undefined;
			daemonLog(
				`defer-command ${pending.map((c) => deferredCommandLabel(c.argv)).join(", ")} dropped on restore: session ${session.id} is not live`,
			);
			continue;
		}
		for (const command of pending) reopen(session.id, command, m);
	}
}

function reopen(
	id: string,
	command: NonNullable<Session["deferredCommands"]>[number],
	m: DeferredDeliveryHost,
): void {
	const pid = runDeferredCommand(
		{
			...command,
			env: reopenedCommandEnv(
				workflowQueryEnv(process.env, id, undefined, command.cwd),
				command.env,
			),
		},
		(result) => deliverDeferredResult(m, id, command, result),
	);
	daemonLog(
		`defer-command ${deferredCommandLabel(command.argv)} reopened after daemon restart: session ${id} pid ${pid ?? "none"}`,
	);
}
