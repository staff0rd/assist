import { annotateDiffWithLineNumbers } from "./annotateDiffWithLineNumbers";
import type { ExistingComment } from "./fetchExistingComments";
import { formatPriorComments } from "./formatPriorComments";
import type { ReviewContext } from "./gatherContext";

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

Each added or context line is prefixed with a left gutter showing its line number in the new file. When citing a finding as \`file:line\`, use that gutter number — do **not** count lines in this document. Removed lines (\`-\`) and headers have a blank gutter and cannot be commented on.

\`\`\`diff
${annotateDiffWithLineNumbers(context.diff.trimEnd())}
\`\`\`
`;
}
