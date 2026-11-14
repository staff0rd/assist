export function startSerialInterval(
	run: () => Promise<void>,
	intervalMs: number,
): () => void {
	let busy = false;
	const fire = () => {
		if (busy) return;
		busy = true;
		void run().finally(() => {
			busy = false;
		});
	};
	const timer = setInterval(fire, intervalMs);
	fire();
	return () => clearInterval(timer);
}
