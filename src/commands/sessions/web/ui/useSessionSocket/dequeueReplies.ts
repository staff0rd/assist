const REPLY_TIMEOUT_MS = 30_000;

const pending = new Map<string, (removed: boolean) => void>();
let counter = 0;

export const dequeueReplies = {
	await: (): { requestId: string; removed: Promise<boolean> } => {
		const requestId = `dequeue-${Date.now()}-${++counter}`;
		const removed = new Promise<boolean>((resolve) => {
			const timer = setTimeout(
				() => dequeueReplies.settle(requestId, false),
				REPLY_TIMEOUT_MS,
			);
			pending.set(requestId, (value) => {
				clearTimeout(timer);
				resolve(value);
			});
		});
		return { requestId, removed };
	},
	settle: (requestId: unknown, removed: boolean): void => {
		if (typeof requestId !== "string") return;
		const resolve = pending.get(requestId);
		pending.delete(requestId);
		resolve?.(removed);
	},
};
