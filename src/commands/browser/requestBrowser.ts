import {
	type BrowserOp,
	type BrowserRelayReply,
	type BrowserRequest,
	RUN_APPROVAL_TIMEOUT_MS,
} from "../extension/browserLink/types";

const CLI_TIMEOUT_MS = 50_000;
const RUN_CLI_TIMEOUT_MS = RUN_APPROVAL_TIMEOUT_MS + 75_000;

export async function requestBrowser<O extends BrowserOp>(
	server: string,
	request: BrowserRequest & { op: O },
): Promise<BrowserRelayReply<O>> {
	let response: Response;
	try {
		response = await fetch(`${server}/api/browser`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(request),
			signal: AbortSignal.timeout(
				request.op === "run" ? RUN_CLI_TIMEOUT_MS : CLI_TIMEOUT_MS,
			),
		});
	} catch (error) {
		if (error instanceof Error && error.name === "TimeoutError")
			throw new Error(`the assist web server at ${server} did not answer`);
		throw new Error(
			`assist web server unreachable at ${server}; start it with \`assist sessions web\``,
		);
	}
	const data = (await response.json().catch(() => ({}))) as
		| BrowserRelayReply
		| { error?: string };
	if (!response.ok)
		throw new Error(
			`${"error" in data && data.error ? data.error : `assist web server returned ${response.status}`} (${server})`,
		);
	return data as BrowserRelayReply<O>;
}
