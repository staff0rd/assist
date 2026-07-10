import type { FSWatcher } from "node:fs";
import type { Activity } from "../../../shared/emitActivity";
import type { CommandType, SessionInfoBase } from "../shared/SessionInfoBase";
import type { spawnClaude } from "./spawnClaude";

export type SessionStatus = "running" | "waiting" | "done" | "error";

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

export type SessionInfo = SessionInfoBase & {
	status: string;
	runningMs: number;
	runningSince: number | null;
	runArgs?: string[];
};
