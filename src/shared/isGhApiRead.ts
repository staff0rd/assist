import { tokenize } from "./tokenize";
import { extractGhApiMethod } from "./extractGhApiMethod";

const READ_METHODS = new Set(["GET", "HEAD"]);
const BODY_FLAGS = new Set(["-f", "-F", "--field", "--raw-field", "--input"]);
const FIELD_FLAGS = new Set(["-f", "--field", "-F"]);

export function isGhApiRead(command: string): boolean {
	const tokens = tokenize(command);

	if (tokens.length < 2 || tokens[0] !== "gh" || tokens[1] !== "api") {
		return false;
	}

	const args = tokens.slice(2);

	if (args.includes("graphql")) {
		return isGraphqlRead(args);
	}

	const method = extractGhApiMethod(args);
	if (method) return READ_METHODS.has(method.toUpperCase());
	if (args.some((t) => BODY_FLAGS.has(t))) return false;

	return true;
}

function isGraphqlRead(args: string[]): boolean {
	const method = extractGhApiMethod(args);
	if (method) return READ_METHODS.has(method.toUpperCase());

	const queryBody = extractGraphqlQuery(args);
	if (!queryBody) return false;

	const trimmed = queryBody.replace(/^['"]|['"]$/g, "").trimStart();
	if (trimmed.startsWith("mutation")) return false;
	if (trimmed.startsWith("query") || trimmed.startsWith("{")) return true;
	return false;
}

function extractGraphqlQuery(args: string[]): string | undefined {
	for (let i = 0; i < args.length; i++) {
		if (FIELD_FLAGS.has(args[i]) && i + 1 < args.length) {
			const match = args[i + 1].match(/^query=(.*)/s);
			if (match) return match[1];
		}
	}
	return undefined;
}
