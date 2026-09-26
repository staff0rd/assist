const CREATE_TYPES = new Set([
	"create",
	"create-assist",
	"create-run",
	"resume",
]);

const SESSION_REF_KEYS = ["sessionId", "joinSessionId", "launchedFrom"];

export function isLinkCreate(type: unknown): boolean {
	return typeof type === "string" && CREATE_TYPES.has(type);
}

export function sessionRefKeys(type: unknown): string[] {
	return type === "resume" ? [] : SESSION_REF_KEYS;
}
