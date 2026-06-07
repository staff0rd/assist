import { repoPrefix } from "./repoPrefix";
import { spawnClaude } from "./spawnClaude";
import { spawnRun } from "./spawnRun";

type SessionStatus = "running" | "waiting" | "done";
type CommandType = "claude" | "run" | "assist";

type Session = {
	id: string;
	name: string;
	commandType: CommandType;
	status: SessionStatus;
	startedAt: number;
	pty: ReturnType<typeof spawnClaude> | null;
	scrollback: string;
	idleTimer: ReturnType<typeof setTimeout> | null;
	lastResizeAt: number;
	runName?: string;
	runArgs?: string[];
	assistArgs?: string[];
	cwd?: string;
	claudeSessionId?: string;
	restored?: boolean;
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
	restored?: boolean;
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
