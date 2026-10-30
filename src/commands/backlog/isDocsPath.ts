import { relative, resolve } from "node:path";
import { getProjectRoot } from "../../shared/loadConfig";

export const DOCS_LOCK_REASON =
	"Docs under 'docs/' are locked during development: they are updated by the Refresh docs backlog item after stories ship, not during development. Leave docs untouched and carry on with the phase.";

const RELATIVE_DOCS = /(?:^|[\s'"=(<>|;&:])(?:\.[/\\])?docs[/\\]/;

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

export function isDocsPath(
	filePath: string,
	root: string = getProjectRoot(),
): boolean {
	const rel = relative(root, resolve(root, filePath)).replace(/\\/g, "/");
	return rel.startsWith("docs/");
}

export function mentionsDocsPath(
	command: string,
	root: string = getProjectRoot(),
): boolean {
	if (RELATIVE_DOCS.test(command)) return true;
	const absolute = `${root.replace(/\\/g, "/")}/docs/`;
	return new RegExp(escapeRegExp(absolute)).test(command.replace(/\\/g, "/"));
}
