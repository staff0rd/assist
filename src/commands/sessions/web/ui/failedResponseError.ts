const TRACE_HEADER = "x-assist-trace-id";

async function bodyError(res: Response): Promise<string | undefined> {
	try {
		const body: unknown = await res.clone().json();
		if (body && typeof body === "object" && "error" in body) {
			const { error } = body as { error: unknown };
			if (typeof error === "string" && error) return error;
		}
	} catch {}
	return undefined;
}

export async function failedResponseError(
	res: Response,
): Promise<string | undefined> {
	const message = (await bodyError(res)) ?? (res.statusText || undefined);
	const trace = res.headers?.get(TRACE_HEADER);
	if (!trace) return message;
	return message ? `${message} (trace=${trace})` : `trace=${trace}`;
}
