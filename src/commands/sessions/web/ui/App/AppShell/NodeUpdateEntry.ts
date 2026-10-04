import type { NodeUpdateStatus } from "../../../../shared/NodeUpdateStatus";

export type NodeUpdateEntry = {
	name: string;
	local: boolean;
	status?: NodeUpdateStatus;
	error?: string;
};

export type NodeUpdates = {
	entries: NodeUpdateEntry[];
	loading: boolean;
	refresh: () => void;
};
