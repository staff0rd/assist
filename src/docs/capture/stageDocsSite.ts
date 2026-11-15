import { execFileSync } from "node:child_process";
import {
	appendFileSync,
	constants,
	cpSync,
	mkdtempSync,
	readFileSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DocsEdit } from "../docsPageSchema";
import { docsPaths } from "../docsPaths";

const SKIPPED_DOCS_ENTRIES = new Set(["dist", ".astro", "public"]);

function git(cwd: string, args: string[]): void {
	execFileSync(
		"git",
		["-c", "user.name=capture", "-c", "user.email=capture@localhost", ...args],
		{ cwd, stdio: "ignore" },
	);
}

function applyEdit(root: string, page: string, edit: DocsEdit): void {
	const file = join(root, "docs/src/content/docs", `${page}.md`);
	const source = readFileSync(file, "utf8");
	if (!source.includes(edit.find))
		throw new Error(`docsEdit text not found in ${page}.md: ${edit.find}`);
	writeFileSync(file, source.replace(edit.find, edit.replace));
}

export function stageDocsSite(page: string, edits: DocsEdit[]): string {
	const root = mkdtempSync(join(tmpdir(), "assist-docs-site-"));
	const { repoRoot } = docsPaths;
	for (const file of ["package.json", "tsconfig.json"])
		cpSync(join(repoRoot, file), join(root, file));
	cpSync(join(repoRoot, "src"), join(root, "src"), { recursive: true });
	cpSync(join(repoRoot, "docs"), join(root, "docs"), {
		recursive: true,
		filter: (source) =>
			!SKIPPED_DOCS_ENTRIES.has(
				source.slice(join(repoRoot, "docs").length + 1),
			),
		mode: constants.COPYFILE_FICLONE,
	});
	for (const entry of ["node_modules", "agent", "claude", "extension"])
		symlinkSync(join(repoRoot, entry), join(root, entry));
	symlinkSync(join(repoRoot, "docs/public"), join(root, "docs/public"));
	git(root, ["init", "-q"]);
	git(root, ["add", "docs/src/content/docs"]);
	git(root, ["commit", "-q", "-m", "docs"]);
	// Astro's dev toolbar would sit over the change nav in every capture.
	appendFileSync(
		join(root, "docs/src/styles/diff.css"),
		"\nastro-dev-toolbar { display: none !important; }\n",
	);
	for (const edit of edits) applyEdit(root, page, edit);
	return root;
}
