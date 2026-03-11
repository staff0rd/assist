import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

export type Handler = (
	req: IncomingMessage,
	res: ServerResponse,
) => void | Promise<void>;

export function respondJson(
	res: ServerResponse,
	status: number,
	data: unknown,
): void {
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(JSON.stringify(data));
}

export function createBundleHandler(
	importMetaUrl: string,
	bundlePath: string,
): Handler {
	const dir = dirname(fileURLToPath(importMetaUrl));
	let cache: string | undefined;
	return (_req, res) => {
		if (!cache) {
			cache = readFileSync(join(dir, bundlePath), "utf-8");
		}
		res.writeHead(200, { "Content-Type": "application/javascript" });
		res.end(cache);
	};
}

export function createHtmlHandler(getHtml: () => string): Handler {
	return (_req, res) => {
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(getHtml());
	};
}

function parseRoute(req: IncomingMessage, port: number) {
	const url = new URL(req.url ?? "/", `http://localhost:${port}`);
	return { method: req.method ?? "GET", pathname: url.pathname };
}

export function createRouteHandler(
	routes: Record<string, Handler>,
): (req: IncomingMessage, res: ServerResponse, port: number) => Promise<void> {
	return async (req, res, port) => {
		const { method, pathname } = parseRoute(req, port);
		const handler = routes[`${method} ${pathname}`];
		if (handler) {
			await handler(req, res);
			return;
		}
		res.writeHead(404);
		res.end();
	};
}

export function startWebServer(
	label: string,
	port: number,
	handler: (
		req: IncomingMessage,
		res: ServerResponse,
		port: number,
	) => Promise<void>,
): void {
	const url = `http://localhost:${port}`;
	const server = createServer((req, res) => {
		handler(req, res, port);
	});
	server.listen(port, () => {
		console.log(chalk.green(`${label}: ${url}`));
		console.log(chalk.dim("Press Ctrl+C to stop"));
		exec(`open ${url}`);
	});
}
