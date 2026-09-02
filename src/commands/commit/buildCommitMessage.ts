export function buildCommitMessage(subject: string, refs: string[]): string {
	if (refs.length === 0) return subject;
	return [subject, "", ...refs.map((ref) => `Ref: ${ref}`)].join("\n");
}
