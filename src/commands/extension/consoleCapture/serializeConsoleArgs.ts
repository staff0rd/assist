import { truncateConsoleText } from "./truncateConsoleText";

function serializeArg(arg: unknown): string {
	if (typeof arg === "string") return arg;
	if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
	if (typeof Element !== "undefined" && arg instanceof Element)
		return `<${arg.tagName.toLowerCase()}>`;
	if (typeof arg !== "object" || arg === null) return String(arg);
	try {
		return JSON.stringify(arg) ?? String(arg);
	} catch {
		return String(arg);
	}
}

export function serializeConsoleArgs(args: unknown[]): string {
	return truncateConsoleText(args.map(serializeArg).join(" "));
}
