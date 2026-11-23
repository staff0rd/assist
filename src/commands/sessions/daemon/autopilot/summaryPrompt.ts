export function summaryPrompt(): string {
	return 'Before this autopilot run ends, record what it did for the Autopilot page: run `assist autopilot summary --checked "<what you looked at>" --decided "<what you decided, and why>" --started "<items you started, or none>" --next "<what the next run should do>"`. Each value is one short plain-English line for the user: no tables, commit hashes, file or function names.';
}
