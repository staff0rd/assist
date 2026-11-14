import { daemonLog } from "./daemonLog";
import { deferredCommandLabel } from "./deferredCommandLabel";
import { deliverDeferredResult } from "./deliverDeferredResult";
import { runDeferredCommand } from "./runDeferredCommand";
import { workflowQueryEnv } from "./sdk/workflowQueryEnv";
import type { Session } from "./types";

type SessionLookup = { session: (id: string) => Session | undefined };

export function reopenDeferredCommands(
	sessions: Iterable<Session>,
	m: SessionLookup,
): void {
	for (const session of sessions) {
		const pending = session.deferredCommands ?? [];
		if (pending.length === 0) continue;
		if (!session.pty?.sdk) {
			session.deferredCommands = undefined;
			daemonLog(
				`defer-command ${pending.map((c) => deferredCommandLabel(c.argv)).join(", ")} dropped on restore: session ${session.id} is not a Claude (SDK) session`,
			);
			continue;
		}
		for (const command of pending) reopen(session.id, command, m);
	}
}

function reopen(
	id: string,
	command: NonNullable<Session["deferredCommands"]>[number],
	m: SessionLookup,
): void {
	const pid = runDeferredCommand(
		{ ...command, env: workflowQueryEnv(process.env, id, undefined) },
		(result) => deliverDeferredResult(m, id, command, result),
	);
	daemonLog(
		`defer-command ${deferredCommandLabel(command.argv)} reopened after daemon restart: session ${id} pid ${pid ?? "none"}`,
	);
}
