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

export function createSession(
	id: string,
	prompt?: string,
	cwd?: string,
): Session {
	const startedAt = Date.now();
	return {
		id,
		name: prompt?.slice(0, 40) || `Session ${id}`,
		commandType: "claude",
		status: "running",
		startedAt,
		runningMs: 0,
		runningSince: startedAt,
		pty: spawnClaude({ prompt, cwd, sessionId: id }),
		scrollback: "",
		cwd,
	};
}

export function createRunSession(
	id: string,
	runName: string,
	runArgs: string[],
	cwd?: string,
): Session {
	const startedAt = Date.now();
	return {
		id,
		name: `run: ${runName}`,
		commandType: "run",
		status: "running",
		startedAt,
		runningMs: 0,
		runningSince: startedAt,
		pty: spawnRun({ name: runName, args: runArgs, cwd }),
		scrollback: "",
		runName,
		runArgs,
		cwd,
	};
}
