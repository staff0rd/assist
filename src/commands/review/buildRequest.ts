import { execSync } from "node:child_process";
import type { ExistingComment } from "./fetchExistingComments";
import {
	fetchPrChangedFiles,
	fetchPrDiff,
	fetchPrDiffInfo,
} from "./fetchPrDiffInfo";
import { formatPriorComments } from "./formatPriorComments";

type ReviewContext = {
	branch: string;
	sha: string;
	shortSha: string;
	prNumber: number;
	baseRef: string;
	baseSha: string;
	headRef: string;
	headSha: string;
	changedFiles: string[];
	diff: string;
};

export function gatherContext(): ReviewContext {
	const branch = execSync("git rev-parse --abbrev-ref HEAD", {
		encoding: "utf-8",
	}).trim();
	const sha = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
	const shortSha = execSync("git rev-parse --short=7 HEAD", {
		encoding: "utf-8",
	}).trim();
	const prInfo = fetchPrDiffInfo();
	const changedFiles = fetchPrChangedFiles(prInfo.prNumber);
	const diff = fetchPrDiff(prInfo.prNumber);
	return {
		branch,
		sha,
		shortSha,
		prNumber: prInfo.prNumber,
		baseRef: prInfo.baseRef,
		baseSha: prInfo.baseSha,
		headRef: prInfo.headRef,
		headSha: prInfo.headSha,
		changedFiles,
		diff,
	};
}

function formatFiles(files: string[]): string {
	if (files.length === 0) return "(none)";
	return files.map((file) => `- ${file}`).join("\n");
}

export function buildRequest(
	context: ReviewContext,
	priorComments: ExistingComment[] | null = null,
): string {
	const priorSection = priorComments ? formatPriorComments(priorComments) : "";
	const priorBlock = priorSection ? `\n${priorSection}\n` : "";
	return `# Code review request

- PR: #${context.prNumber}
- Branch: \`${context.branch}\` (head ref: \`${context.headRef}\`)
- Base ref: \`${context.baseRef}\`
- Base SHA: \`${context.baseSha}\`
- Head SHA: \`${context.headSha}\`

## Changed files

${formatFiles(context.changedFiles)}
${priorBlock}
## Diff (PR #${context.prNumber}: ${context.baseSha}..${context.headSha})

\`\`\`diff
${context.diff.trimEnd()}
\`\`\`
`;
}
