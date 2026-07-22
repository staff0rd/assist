export type PersistedComment = {
	quote: string;
	note: string;
	start: number;
	end: number;
};

const PREFIX = "assist:pr-preview-comments:";
const TTL_MS = 24 * 60 * 60 * 1000;

const key = (requestId: string) => `${PREFIX}${requestId}`;

export function loadPersistedComments(requestId: string): PersistedComment[] {
	try {
		const raw = localStorage.getItem(key(requestId));
		if (!raw) return [];
		const parsed = JSON.parse(raw) as { items?: PersistedComment[] };
		return Array.isArray(parsed.items) ? parsed.items : [];
	} catch {
		return [];
	}
}

export function savePersistedComments(
	requestId: string,
	items: PersistedComment[],
): void {
	try {
		if (items.length === 0) {
			localStorage.removeItem(key(requestId));
			return;
		}
		localStorage.setItem(
			key(requestId),
			JSON.stringify({ savedAt: Date.now(), items }),
		);
	} catch {}
}

export function clearPersistedComments(requestId: string): void {
	try {
		localStorage.removeItem(key(requestId));
	} catch {}
}

export function prunePersistedComments(): void {
	try {
		const now = Date.now();
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const k = localStorage.key(i);
			if (!k?.startsWith(PREFIX)) continue;
			const raw = localStorage.getItem(k);
			const savedAt = raw
				? (JSON.parse(raw) as { savedAt?: number }).savedAt
				: 0;
			if (!savedAt || now - savedAt > TTL_MS) localStorage.removeItem(k);
		}
	} catch {}
}
