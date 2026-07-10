import type { FSWatcher } from "node:fs";
import type { Activity } from "../../../shared/emitActivity";
import type { spawnClaude } from "./spawnClaude";

export type SessionStatus = "running" | "waiting" | "done" | "error";
type CommandType = "claude" | "run" | "assist";

export type OnStatusChange = (
	session: Session,
	status: SessionStatus,
	exitCode?: number,
) => void;

export type Session = {
	id: string;
	name: string;
	title?: string;
	subtitle?: string;
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
	initialPrompt?: string;
	restored?: boolean;
	error?: string;
	activity?: Activity;
	activityWatcher?: FSWatcher;
	autoRun?: boolean;
	autoAdvance?: boolean;
	starred?: boolean;
	escInterruptTimer?: ReturnType<typeof setTimeout>;
	reviewStarted?: boolean;
	usageSeeded?: boolean;
	pendingRestart?: () => void;
	totalIn?: number;
	totalOut?: number;
};

export type SessionInfo = {
	id: string;
	name: string;
	title?: string;
	subtitle?: string;
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
<<<<<<< Updated upstream
	totalIn?: number;
	totalOut?: number;
=======
	starred?: boolean;
>>>>>>> Stashed changes
};
