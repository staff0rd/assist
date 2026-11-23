import type { FSWatcher } from "node:fs";
import type { Activity } from "../../../shared/emitActivity";
import type { SessionProcess } from "../../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../../shared/harnesses";
import type {
	CommandType,
	PrPreview,
	SessionInfoBase,
	SessionTransfer,
} from "../shared/SessionInfoBase";
import type { SdkViewState } from "../shared/SdkViewState";
import type { ScreenMirror } from "./createScreenMirror";
import type { PendingDeferredCommand } from "./pendingDeferredCommandSchema";
import type { SessionInterruption } from "./SessionInterruption";
import type { StateWatcher } from "./worktree/watchGitState";

export type SessionStatus =
	| "running"
	| "waiting"
	| "done"
	| "error"
	| "stopped"
	| "parked";

export type OnStatusChange = (
	session: Session,
	status: SessionStatus,
	exitCode?: number,
) => void;

export type SpawnContext = {
	launchedFrom?: string;
	yolo?: boolean;
	/** The autopilot run's root session id, or true for the root itself. */
	autopilot?: string | true;
};

export type SpawnSession = (
	create: (id: string) => Session,
	context?: SpawnContext,
) => string;

export type Session = SdkViewState & {
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
	pty: SessionProcess | null;
	scrollback: string;
	screen?: ScreenMirror;
	runName?: string;
	runArgs?: string[];
	assistArgs?: string[];
	server?: boolean;
	serverPort?: number;
	serverProtocol?: "http" | "https";
	serverPath?: string;
	serverOrigin?: string;
	serverGroup?: string;
	stopping?: boolean;
	closing?: boolean;
	closeGrace?: { cancel: () => void };
	cwd?: string;
	launchedFrom?: string;
	claudeSessionId?: string;
	harnessSessionId?: string;
	initialPrompt?: string;
	restored?: boolean;
	interrupted?: SessionInterruption;
	error?: string;
	discoverOnRestore?: boolean;
	activity?: Activity;
	activityWatcher?: FSWatcher;
	transcriptWatcher?: FSWatcher;
	gitWatcher?: StateWatcher;
	watchedTranscriptId?: string;
	worktree?: { path: string; clone: string };
	releasedFromClone?: string;
	undurable?: { reason: string; removesTree?: boolean };
	transcriptPath?: string;
	transcriptPathKey?: string;
	transcriptFingerprint?: string;
	transcriptRevision?: number;
	lastUserMessage?: string;
	lastAssistantMessage?: string;
	lastEchoAt?: string;
	permissionActive?: boolean;
	pendingSubmit?: { fingerprint?: string; cancel: () => void };
	pendingPrompts?: string[];
	pendingDeferredResults?: string[];
	deferredCommands?: PendingDeferredCommand[];
	autoAdvance?: boolean;
	autoApprove?: boolean;
	yolo?: boolean;
	/** Root session id of the autopilot run this session belongs to. */
	autopilot?: string;
	starred?: boolean;
	divergenceEscalation?: boolean;
	design?: boolean;
	auto?: boolean;
	model?: string;
	verifying?: boolean;
	reviewStarted?: boolean;
	usageSeeded?: boolean;
	pendingPrPreview?: PrPreview;
	pendingPreviewTaskId?: string;
	pendingShow?: PrPreview;
	highLevelReviewHead?: string;
	resumedOverPreview?: string;
	pendingRestart?: () => void;
	pendingDismiss?: () => void;
	pendingStart?: () => Session["pty"];
	/** A held start that will run as a daemon-driven session, so views treat it as one before its process exists. */
	drivenStart?: boolean;
	awaitingSeed?: boolean;
	seeding?: string;
	cols?: number;
	rows?: number;
	activeViewer?: string;
	activeViewerNode?: string;
	usedPct?: number;
	activeMsFlushedForStretch?: { since: number; ms: number };
	activeMsFlushChain?: Promise<void>;
	transfer?: SessionTransfer;
};

export type SessionInfo = SessionInfoBase & {
	status: string;
	runningMs: number;
	runningSince: number | null;
	waitingSince: number | null;
	runArgs?: string[];
};
