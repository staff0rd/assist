const githubPrUrl = /^https?:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/;

function remotePrGuidance(prUrl: string): string {
	return `This is a pull request. Read it remotely with \`gh pr view ${prUrl} --comments\` and \`gh pr diff ${prUrl}\`; do not check out its branch.`;
}

export function linkPrompt(url: string, instructions: unknown): string {
	const extra = typeof instructions === "string" ? instructions.trim() : "";
	const prUrl = url.match(githubPrUrl)?.[0];
	const parts = [url];
	if (prUrl) parts.push(remotePrGuidance(prUrl));
	if (extra) parts.push(extra);
	return parts.join("\n\n");
}
