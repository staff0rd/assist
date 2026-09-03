import type { FSWatcher } from "node:fs";
import type { Activity } from "../../../shared/emitActivity";
import type { HarnessKind } from "../../../shared/harnesses";
import type {
	CommandType,
	PrPreview,
	SessionInfoBase,
} from "../shared/SessionInfoBase";
import type { SessionInterruption } from "./SessionInterruption";
import type { spawnClaude } from "./spawnClaude";
import type { StateWatcher } from "./worktree/watchGitState";

export type SessionStatus =
	| "running"
	| "waiting"
	| "done"
	| "error"
	| "stopped";

export type OnStatusChange = (
	session: Session,
	status: SessionStatus,
	exitCode?: number,
) => void;

export type SpawnContext = { launchedFrom?: string };

export type SpawnSession = (
	create: (id: string) => Session,
	context?: SpawnContext,
) => string;

export type Session = {
	id: string;
	name: string;
	title?: string;
	generatedTitle?: string;
	titleGenerationStarted?: boolean;
	subtitle?: string;
	commandType: CommandType;
	harness?: HarnessKind;
	status: SessionStatus;
	startedAt: number;
	runningMs: number;
	runningSince: number | null;
	waitingSince: number | null;
	pty: ReturnType<typeof spawnClaude> | null;
	scrollback: string;
	runName?: string;
	runArgs?: string[];
	assistArgs?: string[];
	server?: boolean;
	serverPort?: number;
	serverOrigin?: string;
	stopping?: boolean;
	closing?: boolean;
	cwd?: string;
	launchedFrom?: string;
	claudeSessionId?: string;
	harnessSessionId?: string;
	initialPrompt?: string;
	restored?: boolean;
	interrupted?: SessionInterruption;
	error?: string;
	activity?: Activity;
	activityWatcher?: FSWatcher;
	transcriptWatcher?: FSWatcher;
	gitWatcher?: StateWatcher;
	watchedTranscriptId?: string;
	worktree?: { path: string; clone: string };
	undurable?: { reason: string; removesTree?: boolean };
	transcriptPath?: string;
	transcriptFingerprint?: string;
	lastUserMessage?: string;
	permissionActive?: boolean;
	autoRun?: boolean;
	autoAdvance?: boolean;
	starred?: boolean;
	watcher?: boolean;
	design?: boolean;
	auto?: boolean;
	verifying?: boolean;
	reviewStarted?: boolean;
	usageSeeded?: boolean;
	pendingPrPreview?: PrPreview;
	pendingRestart?: () => void;
	pendingDismiss?: () => void;
	pendingStart?: () => Session["pty"];
	cols?: number;
	rows?: number;
	usedPct?: number;
	activeMsFlushedForStretch?: { since: number; ms: number };
	activeMsFlushChain?: Promise<void>;
};

export type SessionInfo = SessionInfoBase & {
	status: string;
	runningMs: number;
	runningSince: number | null;
	waitingSince: number | null;
	runArgs?: string[];
};
