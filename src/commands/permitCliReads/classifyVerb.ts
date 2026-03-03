const READ_VERBS = new Set([
	"list",
	"show",
	"view",
	"export",
	"get",
	"diff",
	"status",
	"search",
	"checks",
	"describe",
	"inspect",
	"logs",
	"cat",
	"top",
	"explain",
	"exists",
	"browse",
	"watch",
]);

const WRITE_VERBS = new Set([
	"create",
	"delete",
	"import",
	"set",
	"update",
	"merge",
	"close",
	"reopen",
	"edit",
	"apply",
	"patch",
	"drain",
	"cordon",
	"taint",
	"push",
	"deploy",
	"add",
	"remove",
	"assign",
	"unassign",
	"lock",
	"unlock",
	"start",
	"stop",
	"restart",
	"enable",
	"disable",
	"revoke",
	"rotate",
]);

export function classifyVerb(verbOrPath: string | string[]): "r" | "w" | "?" {
	const segments = Array.isArray(verbOrPath) ? verbOrPath : [verbOrPath];
	let hasRead = false;
	for (const s of segments) {
		if (WRITE_VERBS.has(s)) return "w";
		if (READ_VERBS.has(s)) hasRead = true;
	}
	return hasRead ? "r" : "?";
}
