export function buildGlobProposalPrompt(tree: string): string {
	return [
		"You are proposing configuration for a high-level PR review checklist in a repository.",
		"",
		"criticalPaths: globs matching files where a wrong line is expensive and an LLM reviewer cannot judge it — schema and API definitions, translation catalogues, database migrations, infrastructure and deployment definitions, dependency and permission manifests. Their full diffs are shown to the human reviewer, so keep the set small.",
		"uiPaths: globs matching the files that render the user interface, so that touching one requires a screenshot or video on the PR. Exclude tests and stories.",
		"",
		"Below is every tracked directory in this repository with the extensions of the files in it. Propose globs that match this repository's own files — never generic guesses at files it does not have.",
		"",
		tree,
		"",
		'Reply with JSON only, no prose and no code fence: {"criticalPaths": ["..."], "uiPaths": ["..."]}. Use an empty array where nothing fits. At most 8 globs each.',
	].join("\n");
}
