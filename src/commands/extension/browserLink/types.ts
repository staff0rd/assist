import type { ConsoleEntry } from "../consoleCapture/types";

export type InspectQuery = { selector: string } | { text: string };

export type ConsoleRequest = {
	op: "console";
	url?: string;
	all?: boolean;
	sinceMs?: number;
	grep?: string;
	limit?: number;
};

export type BrowserRequest =
	| { op: "status"; url?: string }
	| { op: "snapshot"; url?: string }
	| ({ op: "inspect"; url?: string } & InspectQuery)
	| { op: "run"; url?: string; code: string }
	| ConsoleRequest
	| { op: "update" };

export type BrowserOp = BrowserRequest["op"];

export type TabOp = Exclude<BrowserOp, "update">;

export type UpdateCheckStatus = "throttled" | "no_update" | "update_available";

type UpdateResult = { status: UpdateCheckStatus; available?: string };

export type InspectMatch = {
	chain: string[];
	text: string;
	width: number;
	height: number;
};

export type InspectResult = { matches: InspectMatch[]; total: number };

export type ProbeResults = {
	status: { contentScript: boolean };
	snapshot: { html: string };
	inspect: InspectResult;
	run: RunOutcome;
	console: ConsoleResult;
	update: UpdateResult;
};

type ReplyResult<O extends BrowserOp> = O extends TabOp
	? { tabUrl: string } & ProbeResults[O]
	: ProbeResults[O];

export type ConsoleResult = { recording: boolean; entries: ConsoleEntry[] };

export type RunOutcome =
	| { outcome: "ran"; value: string }
	| { outcome: "error"; error: string }
	| { outcome: "declined" }
	| { outcome: "timeout" };

export type RunDecision = "run" | "declined" | "timeout";

export type BrowserReply<O extends BrowserOp = BrowserOp> =
	| { ok: true; result: ReplyResult<O> }
	| { ok: false; error: string; tabUrl?: string };

export type ProbeAnswer = {
	running: true;
	error?: string;
	result?: ProbeResults["snapshot"] | InspectResult | { decision: RunDecision };
};

export type BrowserRelayRequest = BrowserRequest & {
	type: "request";
	id: string;
};

export type BrowserLinkMessage =
	| { type: "hello"; version: string }
	| (BrowserReply & { type: "response"; id: string });

export type BrowserRelayReply<O extends BrowserOp = BrowserOp> =
	BrowserReply<O> & { version: string };

export const BROWSER_PROBE_TYPE = "assist-browser-probe";

export const BROWSER_KEEPALIVE_TYPE = "assist-browser-keepalive";

export const RUN_APPROVAL_TIMEOUT_MS = 120_000;

export const BROWSER_LINK_PATH = "/ws/browser";

export const BROWSER_LINK_ALARM = "assist-browser-link";
