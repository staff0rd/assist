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

export function classifyVerb(verb: string): "r" | "w" | "?" {
	if (READ_VERBS.has(verb)) return "r";
	if (WRITE_VERBS.has(verb)) return "w";
	return "?";
}
