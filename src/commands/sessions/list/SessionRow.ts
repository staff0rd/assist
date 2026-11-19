export type SessionRow = {
	id: string;
	kind: "agent" | "run" | "server";
	status: string;
	node: string;
	repo?: string;
	branch?: string;
	title: string;
	agentName?: string;
};
