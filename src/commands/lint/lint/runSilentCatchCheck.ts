import fs from "node:fs";
import path from "node:path";
import { Project } from "ts-morph";
import { findSourceFiles } from "../../../shared/findSourceFiles";
import { reportViolations } from "../shared";
import { findSilentCatches } from "./findSilentCatches";

const WEB_UI_DIR = "src/commands/sessions/web/ui";
const REPORTER_DIR = path.join(WEB_UI_DIR, "clientFailures");

export function runSilentCatchCheck(): boolean {
	const project = new Project({ useInMemoryFileSystem: true });
	const violations = findSourceFiles(WEB_UI_DIR, { includeTests: false })
		.filter((filePath) => !filePath.startsWith(REPORTER_DIR))
		.flatMap((filePath) =>
			findSilentCatches(
				project.createSourceFile(filePath, fs.readFileSync(filePath, "utf8")),
			),
		)
		.map((violation) => ({
			...violation,
			filePath: path.relative("/", violation.filePath),
		}));
	return reportViolations(
		violations,
		"Silent catch check",
		"Catch blocks in the web UI that drop an async error must call reportCaughtError(error, context) or surface the error.",
		"Silent catch check passed. No dropped async errors in the web UI.",
	);
}
