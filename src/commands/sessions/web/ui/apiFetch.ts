import { apiUrl } from "./apiUrl";

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
	return fetch(apiUrl(path), init);
}
