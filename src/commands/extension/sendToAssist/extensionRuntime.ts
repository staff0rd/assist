type MessageSender = { tab?: { id?: number } };

type ExtensionRuntime = {
	sendMessage: (message: unknown) => Promise<unknown>;
	getURL?: (path: string) => string;
	openOptionsPage?: () => Promise<void>;
	onMessage: {
		addListener: (
			listener: (message: unknown, sender?: MessageSender) => unknown,
		) => void;
	};
};

type ExtensionGlobal = { browser?: { runtime?: ExtensionRuntime } };

export function extensionRuntime(): ExtensionRuntime | undefined {
	return (globalThis as ExtensionGlobal).browser?.runtime;
}
