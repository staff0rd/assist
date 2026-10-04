const KEY = "assist-viewer-id";

function tabStorage(): Storage | undefined {
	try {
		return sessionStorage;
	} catch {
		return undefined;
	}
}

function loadViewerId(): string {
	const storage = tabStorage();
	const stored = storage?.getItem(KEY);
	if (stored) return stored;
	const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
	storage?.setItem(KEY, id);
	return id;
}

export const viewerId = loadViewerId();
