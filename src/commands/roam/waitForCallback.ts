import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";

function respondHtml(res: ServerResponse, status: number, title: string): void {
	res.writeHead(status, { "Content-Type": "text/html" });
	res.end(
		`<html><body><h1>${title}</h1><p>You can close this tab.</p></body></html>`,
	);
}

function extractCode(url: URL, expectedState: string): string {
	const error = url.searchParams.get("error");
	if (error) throw new Error(`Authorization denied: ${error}`);

	const state = url.searchParams.get("state");
	if (state !== expectedState)
		throw new Error("State mismatch — possible CSRF attack");

	const code = url.searchParams.get("code");
	if (!code) throw new Error("No authorization code received");

	return code;
}

export function waitForCallback(
	port: number,
	expectedState: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			server.close();
			reject(new Error("Authorization timed out after 120 seconds"));
		}, 120_000);

		const server = createServer((req: IncomingMessage, res: ServerResponse) => {
			const url = new URL(req.url ?? "/", `http://localhost:${port}`);

			if (url.pathname !== "/callback") {
				res.writeHead(404);
				res.end();
				return;
			}

			clearTimeout(timeout);

			try {
				const code = extractCode(url, expectedState);
				respondHtml(res, 200, "Authorization successful!");
				server.close();
				resolve(code);
			} catch (err) {
				respondHtml(res, 400, (err as Error).message);
				server.close();
				reject(err);
			}
		});

		server.listen(port);
	});
}
