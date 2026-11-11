type AssistJsonReply = { error?: string; cwd?: string; message?: string };

export async function postAssistJson<T extends object = AssistJsonReply>(
	server: string,
	path: string,
	body: unknown,
): Promise<
	{ ok: true; data: T & { error?: string } } | { ok: false; message: string }
> {
	let response: Response;
	try {
		response = await fetch(`${server}${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
	} catch {
		return { ok: false, message: `assist web server unreachable at ${server}` };
	}
	const data = (await response.json().catch(() => ({}))) as T & {
		error?: string;
	};
	if (!response.ok)
		return {
			ok: false,
			message: data.error ?? `assist web server returned ${response.status}`,
		};
	return { ok: true, data };
}
