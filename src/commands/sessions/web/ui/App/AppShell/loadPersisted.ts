const TTL_MS = 24 * 60 * 60 * 1000;

export function loadPersisted<T>(key: string): T[] {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as { items?: T[] };
		return Array.isArray(parsed.items) ? parsed.items : [];
	} catch {
		return [];
	}
}

export function savePersisted<T>(key: string, items: T[]): void {
	try {
		if (items.length === 0) {
			localStorage.removeItem(key);
			return;
		}
		localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), items }));
	} catch {}
}

export function clearPersisted(key: string): void {
	try {
		localStorage.removeItem(key);
	} catch {}
}

export function prunePersisted(prefix: string): void {
	try {
		const now = Date.now();
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const k = localStorage.key(i);
			if (!k?.startsWith(prefix)) continue;
			const raw = localStorage.getItem(k);
			const savedAt = raw
				? (JSON.parse(raw) as { savedAt?: number }).savedAt
				: 0;
			if (!savedAt || now - savedAt > TTL_MS) localStorage.removeItem(k);
		}
	} catch {}
}
