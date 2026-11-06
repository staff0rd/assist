type AscErrorBody = {
	errors?: {
		status?: string;
		code?: string;
		title?: string;
		detail?: string;
	}[];
};

const statusHints: Record<number, string> = {
	401: "Check testflight.keyId, testflight.issuerId and that testflight.keyRef points at the matching .p8.",
	403: "The App Store Connect API key may lack the role this action needs (team invitations need Admin).",
};

function parseErrors(body: string): string[] {
	try {
		const parsed = JSON.parse(body) as AscErrorBody;
		return (parsed.errors ?? []).map((error) =>
			[error.title, error.detail].filter(Boolean).join(": "),
		);
	} catch {
		return body ? [body] : [];
	}
}

export function formatAscError(
	method: string,
	path: string,
	status: number,
	body: string,
): string {
	const lines = [
		`App Store Connect ${method} ${path} failed (${status})`,
		...parseErrors(body).map((line) => `  ${line}`),
	];
	const hint = statusHints[status];
	if (hint) lines.push(hint);
	return lines.join("\n");
}
