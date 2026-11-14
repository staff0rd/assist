import { basename } from "node:path";

const MAX_LENGTH = 60;
const INTERPRETERS = new Set([
	"node",
	"python",
	"python3",
	"bash",
	"sh",
	"bun",
	"deno",
]);

export function trimProcessCommand(argv: readonly string[]): string {
	const args = argv.filter(Boolean);
	if (args.length === 0) return "";
	const [first, ...rest] = args;
	const program = basename(first);
	const script = rest[0];
	const words =
		INTERPRETERS.has(program) &&
		script?.includes("/") &&
		!script.startsWith("-")
			? [basename(script), ...rest.slice(1)]
			: [program, ...rest];
	const text = words.join(" ");
	return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH - 1)}…` : text;
}
