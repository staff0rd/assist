import type { HarnessKind } from "../../../../shared/harnesses";
import type { NodesMessage } from "../../daemon/links/LinkStatus";
import type { SessionType } from "../../shared/deriveHistoryFields";
import type { SessionOrigin } from "../../shared/parseSessionFile";
import type { RepoGroup } from "../../shared/RepoGroup";
import type { SessionInfoBase } from "../../shared/SessionInfoBase";
import type { PendingLaunch } from "./PendingLaunch";

export type SessionStatus =
	| "running"
	| "waiting"
	| "done"
	| "error"
	| "stopped";

export type SessionInfo = SessionInfoBase & {
	status: SessionStatus;
	runningMs?: number;
	runningSince?: number | null;
	waitingSince?: number | null;
};

export type CardHeaderProps = {
	session: SessionInfo;
	loading: boolean;
	onRetry?: () => void;
	onRestart?: () => void;
	onDismiss: () => void;
};

export type SidebarProps = {
	sessions: SessionInfo[];
	pendingLaunches: PendingLaunch[];
	history: HistoricalSession[];
	activeId: string | null;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	onSelect: (id: string) => void;
	onDismissPending: (id: string) => void;
	onView: (session: HistoricalSession) => void;
	onResume: (session: HistoricalSession) => void;
	initialized: Set<string>;
	isFloatingWaiter?: (session: SessionInfo) => boolean;
	collapsed?: boolean;
} & SessionListHandlers;

export type SessionLifecycleHandlers = {
	onRetry: (id: string) => void;
	onRestart: (id: string) => void;
	onDismiss: (id: string) => void;
};

export type SessionListHandlers = SessionLifecycleHandlers & {
	onSetAutoRun: (id: string, enabled: boolean) => void;
	onSetAutoAdvance: (id: string, enabled: boolean) => void;
};

export type SessionControlHandlers = {
	onRetry?: () => void;
	onRestart?: () => void;
	onDismiss: () => void;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
};

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
	repoGroup?: RepoGroup;
	cwdMissing?: boolean;
	origin?: SessionOrigin;
	sessionType?: SessionType;
	itemId?: number;
	prompt?: string;
	harness?: HarnessKind;
	node?: string;
};

export type NodesState = Pick<NodesMessage, "local" | "links">;

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

export type UserMessages = {
	sessionId: string;
	messages: string[];
};
