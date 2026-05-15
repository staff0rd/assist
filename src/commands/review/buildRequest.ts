import type { ExistingComment } from "./fetchExistingComments";
import { formatPriorComments } from "./formatPriorComments";
import type { ReviewContext } from "./gatherContext";
import type { ShaContext } from "./gatherShaContext";

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

export function buildShaRequest(context: ShaContext): string {
	return `# Code review request

- Commit: \`${context.sha}\`
- Parent: \`${context.parentSha}\`

## Changed files

${formatFiles(context.changedFiles)}

## Diff (commit ${context.sha}: ${context.parentSha}..${context.sha})

\`\`\`diff
${context.diff.trimEnd()}
\`\`\`
`;
}
