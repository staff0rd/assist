const issuePrompt = /^Issue ([^\s#]+\/[^\s#]+)#(\d+):/;

export function promptIssueRef(prompt: string | undefined): string | undefined {
	const match = prompt ? issuePrompt.exec(prompt) : null;
	return match ? `${match[1]}#${match[2]}` : undefined;
}
