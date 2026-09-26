export type SshTarget = { alias: string; port: number; localPort: number };

export type LinkSpec = { name: string; url: string; ssh?: SshTarget };

export type LinkState =
	| "connecting"
	| "connected"
	| "disconnected"
	| "version-blocked";

export type LinkStatus = {
	name: string;
	url: string;
	ssh?: SshTarget;
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
