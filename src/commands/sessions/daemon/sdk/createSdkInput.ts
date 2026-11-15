type SdkInput = {
	messages: AsyncIterable<string>;
	push: (text: string) => void;
	close: () => void;
};

/* why: streaming input keeps the driven query alive between turns, so the
 * session waits for its next message instead of exiting after one result. */
export function createSdkInput(): SdkInput {
	const queue: string[] = [];
	let wake: (() => void) | undefined;
	let closed = false;
	const notify = () => {
		wake?.();
		wake = undefined;
	};
	async function* messages(): AsyncGenerator<string> {
		while (true) {
			const next = queue.shift();
			if (next !== undefined) {
				yield next;
				continue;
			}
			if (closed) return;
			await new Promise<void>((resolve) => {
				wake = resolve;
			});
		}
	}
	return {
		messages: messages(),
		push: (text) => {
			queue.push(text);
			notify();
		},
		close: () => {
			closed = true;
			notify();
		},
	};
}
