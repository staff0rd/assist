import type { HarnessKind } from "../../../../shared/harnesses";
import type { NodesMessage } from "../../daemon/links/LinkStatus";
import type { SessionType } from "../../shared/deriveHistoryFields";
import type { HistorySnippet } from "../../shared/HistorySnippet";
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
	onRetry?: (replace?: boolean) => void;
	onRestart?: () => void;
	onDismiss: () => void;
	childDismiss?: ChildDismiss;
};

export type ChildDismiss = {
	childCount: number;
	onDismissAll: () => void;
};

export type SidebarProps = {
	sessions: SessionInfo[];
	pendingLaunches: PendingLaunch[];
	history: HistoricalSession[];
	activeId: string | null;
	viewingId: string | null;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	onSelect: (id: string) => void;
	onDismissPending: (id: string) => void;
	onView: (session: HistoricalSession, searchTerm?: string) => void;
	onResume: (session: HistoricalSession) => void;
	initialized: Set<string>;
	collapsed?: boolean;
} & SessionListHandlers;

export type DismissOptions = { closeServerRuns?: boolean };

export type SessionLifecycleHandlers = {
	onRetry: (id: string, replace?: boolean) => void;
	onRestart: (id: string) => void;
	onDismiss: (id: string, opts?: DismissOptions) => void;
};

export type SessionListHandlers = SessionLifecycleHandlers & {
	onSetAutoApprove: (id: string, enabled: boolean) => void;
	onSetAutoAdvance: (id: string, enabled: boolean) => void;
};

export type SessionControlHandlers = {
	onRetry?: (replace?: boolean) => void;
	onRestart?: () => void;
	onDismiss: (opts?: DismissOptions) => void;
	childDismiss?: ChildDismiss;
	onSetAutoApprove: (enabled: boolean) => void;
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
	title?: string;
	harness?: HarnessKind;
	node?: string;
	snippet?: HistorySnippet;
};

export type NodesState = Pick<NodesMessage, "local" | "links">;

export type HistoryCardHandlers = {
	onView: (session: HistoricalSession, searchTerm?: string) => void;
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
