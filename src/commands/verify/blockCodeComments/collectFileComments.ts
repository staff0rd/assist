import fs from "node:fs";
import type { Project } from "ts-morph";
import {
	isDockerfile,
	isEnvFile,
	isShellFile,
} from "../../../shared/isHashCommentFile";
import { isBicepFile } from "../../../shared/isBicepFile";
import { isCsharpFile } from "../../../shared/isCsharpFile";
import { isGeneratedCsharpFile } from "../../../shared/isGeneratedCsharpFile";
import { isRazorFile } from "../../../shared/isRazorFile";
import { extractRazorComments } from "../../../shared/extractRazorComments";
import { extractRustComments } from "../../../shared/extractRustComments";
import { isRustFile } from "../../../shared/isRustFile";
import { isYamlFile } from "../../../shared/isYamlFile";
import type { CommentFinding } from "./types";
import { collectBicepComments } from "./collectBicepComments";
import { collectCsharpComments } from "./collectCsharpComments";
import { collectHashComments } from "./collectHashComments";
import { collectSourceFindings } from "./collectSourceFindings";
import { collectYamlComments } from "./collectYamlComments";
import { toFindings } from "./toFindings";

export type { CommentFinding } from "./types";

export function collectFileComments(
	file: string,
	lines: Set<number>,
	project: Project,
): CommentFinding[] {
	const read = () => fs.readFileSync(file, "utf8");

	if (isYamlFile(file))
		return toFindings(file, lines, collectYamlComments(read()), false);

	if (isDockerfile(file) || isEnvFile(file) || isShellFile(file))
		return toFindings(
			file,
			lines,
			collectHashComments(read(), { skipHeader: isShellFile(file) }),
			true,
		);

	if (isBicepFile(file))
		return toFindings(file, lines, collectBicepComments(read()), true);

	if (isCsharpFile(file)) {
		const content = read();
		if (isGeneratedCsharpFile(file, content)) return [];
		return toFindings(file, lines, collectCsharpComments(content), true);
	}

	if (isRazorFile(file))
		return toFindings(file, lines, extractRazorComments(read()), true);

	if (isRustFile(file))
		return toFindings(file, lines, extractRustComments(read()), true);

	return collectSourceFindings(file, lines, project);
}
