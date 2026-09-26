import type { LinkSpec } from "./LinkStatus";

export type LinkTunnel = {
	ready(): Promise<void>;
	dispose(): void;
};

export type TunnelFactory = (spec: LinkSpec) => LinkTunnel | undefined;
