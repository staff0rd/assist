export type LinkSocket = {
	send(line: string): boolean;
	close(): void;
};

export type LinkHandlers = {
	onLine(line: string): void;
	onClose(reason: string): void;
};

export type LinkTransport = (
	url: string,
	handlers: LinkHandlers,
) => Promise<LinkSocket>;
