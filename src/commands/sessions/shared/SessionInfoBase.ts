import type { Activity } from "../../../shared/emitActivity";
import type { HarnessKind } from "../../../shared/harnesses";

export type CommandType = "claude" | "run" | "assist";

export type PrPreview = {
	requestId: string;
	title: string;
	body: string;
	prNumber: number | null;
};

export type SessionInfoBase = {
	id: string;
	name: string;
	title?: string;
	subtitle?: string;
	commandType: CommandType;
	harness?: HarnessKind;
	startedAt: number;
	runName?: string;
	server?: boolean;
	port?: number;
	remoteOrigin?: string;
	assistArgs?: string[];
	cwd?: string;
	restored?: boolean;
	error?: string;
	activity?: Activity;
	autoRun?: boolean;
	autoAdvance?: boolean;
	starred?: boolean;
	usedPct?: number;
	design?: boolean;
	pendingPrPreview?: PrPreview;
};
