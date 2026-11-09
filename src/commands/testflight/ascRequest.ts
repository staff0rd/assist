import { formatAscError } from "./formatAscError";
import { TestflightError } from "./TestflightError";

function baseUrl(): string {
	return (
		process.env.ASSIST_ASC_BASE_URL ?? "https://api.appstoreconnect.apple.com"
	);
}

async function send(
	fetchFn: typeof fetch,
	token: string,
	method: string,
	path: string,
	body?: unknown,
): Promise<Response> {
	try {
		return await fetchFn(`${baseUrl()}${path}`, {
			method,
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/json",
				...(body === undefined ? {} : { "Content-Type": "application/json" }),
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new TestflightError(`Failed to reach App Store Connect: ${reason}`);
	}
}

export async function ascRequest<T>(
	fetchFn: typeof fetch,
	token: string,
	method: string,
	path: string,
	body?: unknown,
): Promise<T> {
	const response = await send(fetchFn, token, method, path, body);
	const text = await response.text();
	if (!response.ok) {
		throw new TestflightError(
			formatAscError(method, path.split("?")[0], response.status, text),
		);
	}
	return (text ? JSON.parse(text) : undefined) as T;
}
