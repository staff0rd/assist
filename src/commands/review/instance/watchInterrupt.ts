const signals = ["SIGINT", "SIGTERM"] as const;

type Interrupt = {
	readonly interrupted: boolean;
	untilInterrupted(): Promise<void>;
	dispose(): void;
};

export function watchInterrupt(): Interrupt {
	let interrupted = false;
	let wake: (() => void) | undefined;
	const onSignal = () => {
		interrupted = true;
		wake?.();
	};
	for (const signal of signals) process.on(signal, onSignal);
	return {
		get interrupted() {
			return interrupted;
		},
		untilInterrupted() {
			if (interrupted) return Promise.resolve();
			const keepAlive = setInterval(() => {}, 1 << 30);
			return new Promise<void>((resolve) => {
				wake = () => {
					clearInterval(keepAlive);
					resolve();
				};
			});
		},
		dispose() {
			for (const signal of signals) process.off(signal, onSignal);
		},
	};
}
