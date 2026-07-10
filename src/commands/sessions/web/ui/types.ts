import type { Activity } from "../../../../shared/emitActivity";
import type { SessionType } from "../../shared/deriveHistoryFields";
import type { SessionOrigin } from "../../shared/parseSessionFile";

export type SessionStatus = "running" | "waiting" | "done" | "error";

type CommandType = "claude" | "run" | "assist";

export type SessionInfo = {
	id: string;
	name: string;
	title?: string;
	subtitle?: string;
	commandType: CommandType;
	status: SessionStatus;
	startedAt: number;
	runningMs?: number;
	runningSince?: number | null;
	runName?: string;
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

export type CardHeaderProps = {
	session: SessionInfo;
	loading: boolean;
	onRetry?: () => void;
	onRestart?: () => void;
	onDismiss: () => void;
};

export type SessionListHandlers = {
	onRetry: (id: string) => void;
	onRestart: (id: string) => void;
	onDismiss: (id: string) => void;
	onSetAutoRun: (id: string, enabled: boolean) => void;
	onSetAutoAdvance: (id: string, enabled: boolean) => void;
};

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
	origin?: SessionOrigin;
	sessionType?: SessionType;
	itemId?: number;
	prompt?: string;
};

export type HistoryCardHandlers = {
	onView: (session: HistoricalSession) => void;
	onResume: (session: HistoricalSession) => void;
};

export type SidebarTab = "active" | "history";

export type TranscriptMessage =
	| { role: "user"; text: string }
	| { role: "assistant"; text: string }
	| { role: "tool"; tool: string; target: string };

export type Transcript = {
	sessionId: string;
	messages: TranscriptMessage[];
};
