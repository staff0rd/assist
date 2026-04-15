import * as path from "node:path";
import { spawnClaude } from "./spawnClaude";
import { spawnRun } from "./spawnRun";

function repoPrefix(cwd?: string): string {
	if (!cwd) return "";
	return `${path.basename(cwd)}/`;
}

type SessionStatus = "running" | "waiting" | "done";
type CommandType = "claude" | "run";

type Session = {
	id: string;
	name: string;
	commandType: CommandType;
	status: SessionStatus;
	startedAt: number;
	pty: ReturnType<typeof spawnClaude>;
	scrollback: string;
	idleTimer: ReturnType<typeof setTimeout> | null;
	lastResizeAt: number;
	runName?: string;
	runArgs?: string[];
	cwd?: string;
};

type SessionInfo = {
	id: string;
	name: string;
	commandType: CommandType;
	status: string;
	startedAt: number;
	runName?: string;
	runArgs?: string[];
	cwd?: string;
};

export type { Session, SessionInfo, SessionStatus };

export function createSession(
	id: string,
	prompt?: string,
	cwd?: string,
): Session {
	return {
		id,
		name: `${repoPrefix(cwd)}${prompt?.slice(0, 40) || `Session ${id}`}`,
		commandType: "claude",
		status: "running",
		startedAt: Date.now(),
		pty: spawnClaude({ prompt, cwd }),
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
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
		name: `${repoPrefix(cwd)}run: ${runName}`,
		commandType: "run",
		status: "running",
		startedAt: Date.now(),
		pty: spawnRun({ name: runName, args: runArgs, cwd }),
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		runName,
		runArgs,
		cwd,
	};
}

export function resumeSession(
	id: string,
	sessionId: string,
	cwd: string,
	name?: string,
): Session {
	return {
		id,
		name: `${repoPrefix(cwd)}${name ? `${name.slice(0, 36)} (R)` : `Resume ${sessionId.slice(0, 8)}`}`,
		commandType: "claude",
		status: "running",
		startedAt: Date.now(),
		pty: spawnClaude({ resumeSessionId: sessionId, cwd }),
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
	};
}
