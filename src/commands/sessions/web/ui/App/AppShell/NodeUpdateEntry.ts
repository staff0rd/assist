import type { AutoUpdateReply } from "../../../../shared/AutoUpdateLoopState";
import type { NodeUpdateStatus } from "../../../../shared/NodeUpdateStatus";

export type NodeUpdateEntry = {
	name: string;
	local: boolean;
	status?: NodeUpdateStatus;
	error?: string;
	webFailing?: WebFailure;
	loading?: boolean;
};

export type WebFailure = { httpStatus: number; daemon?: AutoUpdateReply };

export type NodeUpdates = {
	entries: NodeUpdateEntry[];
	loading: boolean;
	refresh: () => void;
};
