const STORAGE_KEY = "assist:group-collapse";

type GroupCollapseChoice = { collapsedAt: number } | { openedAt: number };

type GroupCollapseChoices = Record<string, GroupCollapseChoice>;

const listeners = new Set<() => void>();

function readRaw(): string {
	try {
		return localStorage.getItem(STORAGE_KEY) ?? "";
	} catch {
		return "";
	}
}

function parseChoices(raw: string): GroupCollapseChoices {
	if (!raw) return {};
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return {};
		return Object.fromEntries(
			Object.entries(parsed).filter(
				([, choice]) => choice && typeof choice === "object",
			),
		);
	} catch {
		return {};
	}
}

function writeChoices(next: GroupCollapseChoices): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {}
	for (const listener of listeners) listener();
}

function setChoice(key: string, choice: GroupCollapseChoice): void {
	writeChoices({ ...parseChoices(readRaw()), [key]: choice });
}

function removeChoices(keys: string[]): void {
	const choices = parseChoices(readRaw());
	const remaining = Object.fromEntries(
		Object.entries(choices).filter(([key]) => !keys.includes(key)),
	);
	if (Object.keys(remaining).length === Object.keys(choices).length) return;
	writeChoices(remaining);
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export const groupCollapseStore = {
	getRaw: readRaw,
	parse: parseChoices,
	setChoice,
	removeChoices,
	subscribe,
};
