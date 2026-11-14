const WITH_SUBCOMMAND = new Set([
	"assist",
	"cargo",
	"docker",
	"dotnet",
	"gh",
	"git",
	"go",
	"npm",
	"npx",
	"pnpm",
	"yarn",
]);
const QUOTED = /'[^']*'|"(?:\\.|[^"\\])*"/g;
const SEPARATOR = /&&|\|\||[;|()`]|\$\(/;
const ASSIGNMENT = /^\w+=/;

function segmentProgram(segment: string): string | null {
	const words = segment
		.trim()
		.split(/\s+/)
		.filter((w) => w && !ASSIGNMENT.test(w));
	const [first, second] = words;
	if (!first || first === "cd" || first.startsWith("-")) return null;
	const program = first.split("/").pop() || first;
	return WITH_SUBCOMMAND.has(program) && second && !second.startsWith("-")
		? `${program} ${second}`
		: program;
}

export function commandPrograms(command: string): string {
	const firstLine = command.split("\n")[0].replace(QUOTED, "''");
	const programs = firstLine
		.split(SEPARATOR)
		.map(segmentProgram)
		.filter((p): p is string => p !== null);
	return [...new Set(programs)].join(", ");
}
