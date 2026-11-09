import type { RunUsage } from "../../shared/harnessAdapters/types";

export type InboxScanEvent = {
	at: string;
	kind: "tool" | "text" | "result" | "error";
	label: string;
	detail: string;
	tokens?: number;
};

export type InboxScanUsage = RunUsage;

export type InboxScanRun = {
	status: "scanning" | "finished" | "failed";
	startedAt: string;
	finishedAt: string | null;
	events: InboxScanEvent[];
	usage?: InboxScanUsage;
};

export type InboxScanListener = {
	onEvent?: (event: InboxScanEvent) => void;
	onUsage?: (usage: InboxScanUsage) => void;
	onModel?: (model: string) => void;
};
