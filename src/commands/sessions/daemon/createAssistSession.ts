import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { spawnAssistProcess } from "./spawnAssistProcess";
import { assistArgsHarness } from "./assistArgsHarness";
import { startOrHoldPty } from "./startOrHoldPty";
import { startsDriven } from "./startsDriven";

export type AssistSessionMeta = {
	title?: string;
	subtitle?: string;
	inPlace?: boolean;
	autoApprove?: boolean;
	/** Ref a freshly allocated worktree branches from, instead of the mainline. */
	startPoint?: string;
};

function drivenOrUnresolved(assistArgs: string[], cwd?: string): boolean {
	try {
		return startsDriven(assistArgsHarness(assistArgs, cwd));
	} catch {
		return false;
	}
}

function startOrRefuse(
	id: string,
	assistArgs: string[],
	cwd: string | undefined,
	holdPty: boolean | undefined,
): Pick<Session, "pty" | "pendingStart" | "drivenStart"> &
	Partial<Pick<Session, "status" | "error">> {
	try {
		return startOrHoldPty(
			() => spawnAssistProcess(["assist", ...assistArgs], cwd, id),
			holdPty,
			() => drivenOrUnresolved(assistArgs, cwd),
		);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		daemonLog(
			`session ${id} ("assist ${assistArgs.join(" ")}") not started: ${reason}`,
		);
		return { pty: null, status: "error", error: reason };
	}
}

export function createAssistSession(
	id: string,
	assistArgs: string[],
	cwd?: string,
	meta?: AssistSessionMeta,
	holdPty?: boolean,
): Session {
	const startedAt = Date.now();
	const started = startOrRefuse(id, assistArgs, cwd, holdPty);
	return {
		id,
		name: `assist ${assistArgs.join(" ")}`,
		title: meta?.title,
		subtitle: meta?.subtitle,
		commandType: "assist",
		status: "running",
		startedAt,
		runningMs: 0,
		runningSince: started.error ? null : startedAt,
		waitingSince: null,
		...started,
		scrollback: started.error
			? `\r\n\x1b[31mCannot start this session: ${started.error}\x1b[0m\r\n`
			: "",
		assistArgs,
		cwd,
		...(meta?.autoApprove && { autoApprove: true }),
	};
}
