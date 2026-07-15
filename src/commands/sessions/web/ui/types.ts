import type { HarnessKind } from "../../../../shared/harnesses";
import type { SessionType } from "../../shared/deriveHistoryFields";
import type { SessionOrigin } from "../../shared/parseSessionFile";
import type { SessionInfoBase } from "../../shared/SessionInfoBase";

export type SessionStatus = "running" | "waiting" | "done" | "error";

export type SessionInfo = SessionInfoBase & {
	status: SessionStatus;
	runningMs?: number;
	runningSince?: number | null;
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
	harness?: HarnessKind;
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
