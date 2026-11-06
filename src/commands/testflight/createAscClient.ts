import { ascRequest } from "./ascRequest";

type AscResource = {
	type: string;
	id: string;
	attributes?: Record<string, unknown>;
};

type AscListResponse = { data: AscResource[] };

export type AscClient = {
	get: (
		path: string,
		params?: Record<string, string>,
	) => Promise<AscListResponse>;
	post: (path: string, body: unknown) => Promise<unknown>;
};

export function createAscClient(
	token: string,
	fetchFn: typeof fetch = fetch,
): AscClient {
	return {
		get: (path, params) => {
			const query = params ? `?${new URLSearchParams(params)}` : "";
			return ascRequest(fetchFn, token, "GET", `${path}${query}`);
		},
		post: (path, body) => ascRequest(fetchFn, token, "POST", path, body),
	};
}
