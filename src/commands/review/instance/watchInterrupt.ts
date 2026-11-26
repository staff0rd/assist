const signals = ["SIGINT", "SIGTERM"] as const;

type Interrupt = {
	readonly interrupted: boolean;
	readonly abort: AbortController;
	dispose(): void;
};

export function watchInterrupt(): Interrupt {
	const abort = new AbortController();
	const onSignal = () => abort.abort();
	for (const signal of signals) process.on(signal, onSignal);
	return {
		get interrupted() {
			return abort.signal.aborted;
		},
		abort,
		dispose() {
			for (const signal of signals) process.off(signal, onSignal);
		},
	};
}
