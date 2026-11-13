import type { ChangeLoop } from "./changeLoop";
import type { doneCursor } from "./doneCursor";

export const changeHash = {
	first: "#assist-change-first",
	last: "#assist-change-last",
};

export function changeSteps(
	cursor: ReturnType<typeof doneCursor>,
	count: number,
	loop: ChangeLoop,
	go: (href: string) => void,
) {
	return {
		next() {
			const ahead = cursor.firstPending(cursor.current + 1);
			if (ahead !== -1) return cursor.show(ahead);
			const page = loop.nextPending();
			if (page) return go(page + changeHash.first);
			const wrapped = cursor.firstPending(0);
			if (wrapped !== -1) cursor.show(wrapped);
		},
		previous() {
			if (cursor.current > 0) cursor.show(cursor.current - 1);
			else if (loop.previous) go(loop.previous + changeHash.last);
			else if (count) cursor.show(count - 1);
		},
	};
}
