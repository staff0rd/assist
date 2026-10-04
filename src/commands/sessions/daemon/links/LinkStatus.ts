export type LinkSpec = { name: string; url: string };

export type LinkState =
	| "connecting"
	| "connected"
	| "disconnected"
	| "version-blocked";

export type LinkStatus = {
	name: string;
	url: string;
	state: LinkState;
	error?: string;
	errorAt?: string;
	peerVersion?: string;
	peerProtocol?: number;
};

export type NodesMessage = {
	type: "nodes";
	local: string;
	links: LinkStatus[];
};
