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

function runningBase(id: string) {
	const startedAt = Date.now();
	return {
		id,
		status: "running" as const,
		startedAt,
		runningMs: 0,
		runningSince: startedAt,
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
	return {
		...runningBase(id),
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
		...runningBase(id),
		name: `run: ${runName}`,
		commandType: "run",
		pty: spawnRun({ name: runName, args: runArgs, cwd }),
		runName,
		runArgs,
		cwd,
	};
}
