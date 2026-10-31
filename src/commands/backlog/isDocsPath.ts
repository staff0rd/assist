import { relative, resolve } from "node:path";
import { getProjectRoot } from "../../shared/loadConfig";

const LOCKED_DOCS_DIRS = ["docs/src/content/docs/", "docs/public/screenshots/"];

export const DOCS_LOCK_REASON = `Docs pages and screenshots (${LOCKED_DOCS_DIRS.join(", ")}) are locked during development: they are updated by the Refresh docs backlog item after stories ship, not during development. Leave them untouched and carry on with the phase. If this phase genuinely needs to change docs (e.g. the item is about the docs site itself), first confirm that with the user, then run \`assist docs unlock\` and wait for the user to confirm the PIN with \`assist docs confirm <pin>\` before retrying. The unlock applies to the current phase only.`;

const SEP = String.raw`[/\\]`;
const LOCKED_DIR_PATTERN = String.raw`docs${SEP}(?:src${SEP}content${SEP}docs|public${SEP}screenshots)(?:${SEP}|(?![\w.-]))`;
const RELATIVE_DOCS = new RegExp(
	String.raw`(?:^|[\s'"=(<>|;&:])(?:\.${SEP})?${LOCKED_DIR_PATTERN}`,
);

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

export function isLockedDocsRelativePath(rel: string): boolean {
	const normalized = `${rel.replace(/\\/g, "/")}/`;
	return LOCKED_DOCS_DIRS.some((dir) => normalized.startsWith(dir));
}

export function isDocsPath(
	filePath: string,
	root: string = getProjectRoot(),
): boolean {
	return isLockedDocsRelativePath(relative(root, resolve(root, filePath)));
}

export function mentionsDocsPath(
	command: string,
	root: string = getProjectRoot(),
): boolean {
	if (RELATIVE_DOCS.test(command)) return true;
	const absolute = `${escapeRegExp(root.replace(/\\/g, "/"))}/${LOCKED_DIR_PATTERN}`;
	return new RegExp(absolute).test(command.replace(/\\/g, "/"));
}
