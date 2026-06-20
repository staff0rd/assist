import type { IncomingMessage } from "node:http";

export type NetcapEntry = {
	url?: string;
	method?: string;
	status?: number;
	requestBody?: unknown;
	responseBody?: unknown;
	timestamp?: number;
};

export type NetcapHandlerOptions = {
	outPath: string;
	onCapture?: (entry: NetcapEntry) => void;
	onPing?: (req: IncomingMessage) => void;
};
