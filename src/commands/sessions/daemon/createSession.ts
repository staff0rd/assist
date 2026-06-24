import { randomUUID } from "node:crypto";
import type { FSWatcher } from "node:fs";
import type { Activity } from "../../../shared/emitActivity";
import { spawnClaude } from "./spawnClaude";
import { spawnRun } from "./spawnRun";

type SessionStatus = "running" | "waiting" | "done" | "error";
type CommandType = "claude" | "run" | "assist";

type Session = {
	id: string;
	name: string;
	commandType: CommandType;
	status: SessionStatus;
	startedAt: number;
	runningMs: number;
	runningSince: number | null;
	pty: ReturnType<typeof spawnClaude> | null;
	scrollback: string;
	runName?: string;
	runArgs?: string[];
	assistArgs?: string[];
	cwd?: string;
	claudeSessionId?: string;
	restored?: boolean;
	error?: string;
	activity?: Activity;
	activityWatcher?: FSWatcher;
	autoRun?: boolean;
	autoAdvance?: boolean;
	escInterruptTimer?: ReturnType<typeof setTimeout>;
	reviewStarted?: boolean;
};

type SessionInfo = {
	id: string;
	name: string;
	commandType: CommandType;
	status: string;
	startedAt: number;
	runningMs: number;
	runningSince: number | null;
	runName?: string;
	runArgs?: string[];
	assistArgs?: string[];
	cwd?: string;
	restored?: boolean;
	error?: string;
	activity?: Activity;
	autoRun?: boolean;
	autoAdvance?: boolean;
};

export type { Session, SessionInfo, SessionStatus };

function sessionBase(id: string, status: SessionStatus) {
	const startedAt = Date.now();
	return {
		id,
		status,
		startedAt,
		runningMs: 0,
		/* why: runningMs counts only running stretches, so a session that starts
		 * waiting (idle, awaiting first input) has no open stretch to stamp. */
		runningSince: status === "running" ? startedAt : null,
		scrollback: "",
	};
}

export function createSession(
	id: string,
	prompt?: string,
	cwd?: string,
): Session {
	/* why: assign the claude conversation id up front so the card binds to the
	 * transcript this process writes, not the newest unclaimed .jsonl in the cwd
	 * (which races concurrent sessions in the same repo) (#413). */
	const claudeSessionId = randomUUID();
	/* why: a session with no initial prompt opens idle, awaiting the user's first
	 * input — no Claude Code hook fires until they submit, so it must start
	 * waiting rather than the default running, which would otherwise stick until
	 * the first turn's Stop (#449). A prompted session is working immediately. */
	return {
		...sessionBase(id, prompt ? "running" : "waiting"),
		name: prompt?.slice(0, 40) || `Session ${id}`,
		commandType: "claude",
		pty: spawnClaude({ prompt, cwd, sessionId: id, claudeSessionId }),
		cwd,
		claudeSessionId,
	};
}

export function createRunSession(
	id: string,
	runName: string,
	runArgs: string[],
	cwd?: string,
): Session {
	return {
		...sessionBase(id, "running"),
		name: `run: ${runName}`,
		commandType: "run",
		pty: spawnRun({ name: runName, args: runArgs, cwd }),
		runName,
		runArgs,
		cwd,
	};
}
