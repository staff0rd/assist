import type { IncomingMessage } from "node:http";
import { isAppOrigin } from "./isAppOrigin";

function originHost(origin: string): string | undefined {
	try {
		return new URL(origin).host;
	} catch {
		return undefined;
	}
}

export function isAllowedSocketOrigin(req: IncomingMessage): boolean {
	const origin = req.headers.origin;
	const isNonBrowserClient = !origin;
	if (isNonBrowserClient || isAppOrigin(origin)) return true;
	const host = originHost(origin);
	const forwardedHost = req.headers["x-forwarded-host"];
	return (
		!!host &&
		(host === req.headers.host ||
			(typeof forwardedHost === "string" && host === forwardedHost))
	);
}
