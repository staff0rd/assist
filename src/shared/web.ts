import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import chalk from "chalk";
import { openBrowser } from "./openBrowser";

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

export function createHtmlHandler(getHtml: () => string): Handler {
	return (_req, res) => {
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(getHtml());
	};
}

export function parseRoute(req: IncomingMessage, port: number) {
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

function buildUrl(port: number, initialPath?: string): string {
	const base = `http://localhost:${port}`;
	return initialPath ? `${base}${initialPath}` : base;
}

export function startWebServer(
	label: string,
	port: number,
	handler: (
		req: IncomingMessage,
		res: ServerResponse,
		port: number,
	) => Promise<void>,
	initialPath?: string,
): ReturnType<typeof createServer> {
	const url = buildUrl(port, initialPath);
	const server = createServer((req, res) => {
		handler(req, res, port);
	});
	server.listen(port, () => {
		console.log(chalk.green(`${label}: ${url}`));
		console.log(chalk.dim("Press Ctrl+C to stop"));
		openBrowser(url);
	});
	return server;
}
