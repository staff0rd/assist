let apiBase = "";

export function setApiBase(url: string): void {
	apiBase = url.replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
	return `${apiBase}${path}`;
}

export function apiWsUrl(path: string): string {
	const url = new URL(apiUrl(path), location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	return url.toString();
}
