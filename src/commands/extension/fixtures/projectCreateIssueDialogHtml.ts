import { readFileSync } from "node:fs";
import { join } from "node:path";

/** The create-issue dialog from a github.com project board, captured live. */
export const projectCreateIssueDialogHtml = readFileSync(
	join(import.meta.dirname, "projectCreateIssueDialog.html"),
	"utf8",
);
