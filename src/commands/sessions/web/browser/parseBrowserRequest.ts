import type {
	BrowserRequest,
	ConsoleRequest,
} from "../../../extension/browserLink/types";

export function parseBrowserRequest(body: unknown): BrowserRequest | undefined {
	const fields = (body ?? {}) as Record<string, unknown>;
	const { op, url, selector, text, code } = fields;
	if (!optionalString(url)) return undefined;
	if (op === "status" || op === "snapshot") return { op, url };
	if (op === "console") return parseConsoleRequest(url, fields);
	if (op === "run")
		return typeof code === "string" && code.trim()
			? { op, url, code }
			: undefined;
	if (op !== "inspect") return undefined;
	if (typeof selector === "string" && selector) return { op, url, selector };
	if (typeof text === "string" && text) return { op, url, text };
	return undefined;
}

function optionalString(value: unknown): value is string | undefined {
	return value === undefined || typeof value === "string";
}

function parseConsoleRequest(
	url: string | undefined,
	fields: Record<string, unknown>,
): ConsoleRequest | undefined {
	const { all, sinceMs, grep, limit } = fields;
	if (all !== undefined && typeof all !== "boolean") return undefined;
	if (!optionalPositive(sinceMs) || !optionalString(grep)) return undefined;
	if (!optionalPositive(limit) || (limit && !Number.isInteger(limit)))
		return undefined;
	return { op: "console", url, all, sinceMs, grep, limit };
}

function optionalPositive(value: unknown): value is number | undefined {
	return value === undefined || (typeof value === "number" && value > 0);
}
