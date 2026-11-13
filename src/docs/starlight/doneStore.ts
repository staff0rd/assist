const storageKey = "assist-docs-done";

type VersionedPage = { id: string; version: string };
type PageState = { version: string; left: number };
type DoneState = { changes: string[]; pages: Record<string, PageState> };

function read(storage: Storage | undefined): DoneState {
	try {
		const state = JSON.parse(storage?.getItem(storageKey) ?? "null");
		if (state && Array.isArray(state.changes) && state.pages) return state;
	} catch {}
	return { changes: [], pages: {} };
}

export type DoneStore = ReturnType<typeof doneStore>;

export function doneStore(storage: Storage | undefined) {
	const state = read(storage);
	const done = new Set(state.changes);
	const save = () => {
		try {
			storage?.setItem(
				storageKey,
				JSON.stringify({ changes: [...done], pages: state.pages }),
			);
		} catch {}
	};
	return {
		isDone: (key: string) => done.has(key),
		setDone(key: string, value: boolean) {
			if (value) done.add(key);
			else done.delete(key);
			save();
		},
		setLeft(page: VersionedPage, left: number) {
			state.pages[page.id] = { version: page.version, left };
			save();
		},
		leftOn(page: VersionedPage): number | undefined {
			const known = state.pages[page.id];
			return known && known.version === page.version ? known.left : undefined;
		},
	};
}
