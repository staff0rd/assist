export type InboxScanEvent = {
	at: string;
	kind: "tool" | "text" | "result" | "error";
	label: string;
	detail: string;
};

export type InboxScanRun = {
	status: "scanning" | "finished" | "failed";
	startedAt: string;
	finishedAt: string | null;
	events: InboxScanEvent[];
};
