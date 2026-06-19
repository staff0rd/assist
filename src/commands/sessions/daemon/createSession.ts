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
};

type SessionInfo = {
	id: string;
	name: string;
	commandType: CommandType;
	status: string;
	startedAt: number;
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
	return {
		id,
		name: prompt?.slice(0, 40) || `Session ${id}`,
		commandType: "claude",
		status: "running",
		startedAt: Date.now(),
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
	return {
		id,
		name: `run: ${runName}`,
		commandType: "run",
		status: "running",
		startedAt: Date.now(),
		pty: spawnRun({ name: runName, args: runArgs, cwd }),
		scrollback: "",
		runName,
		runArgs,
		cwd,
	};
}
