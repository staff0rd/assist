import type { DoneStore } from "./doneStore";
import type { ChangedPage } from "./markChangedPages";

export type ChangeLoop = ReturnType<typeof changeLoop>;

export function changeLoop(
	pages: ChangedPage[],
	index: number,
	store: DoneStore,
) {
	const others = [...pages.slice(index + 1), ...pages.slice(0, index)];
	return {
		page: pages[index],
		previous: others.at(-1)?.href,
		nextPending: () => others.find((page) => store.leftOn(page) !== 0)?.href,
		elsewhere() {
			let changes = 0;
			let unknown = false;
			let pagesLeft = 0;
			for (const page of others) {
				const left = store.leftOn(page);
				if (left === 0) continue;
				pagesLeft++;
				unknown ||= left === undefined;
				changes += left ?? 1;
			}
			return { changes, unknown, pages: pagesLeft };
		},
	};
}
