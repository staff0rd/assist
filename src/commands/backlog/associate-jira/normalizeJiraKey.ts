const KEY_PATTERN = /^[A-Z]+-\d+$/;
const URL_PATTERN = /^https?:\/\/[^/\s]+\/browse\/([A-Za-z]+-\d+)(?:[/?#].*)?$/;

export function normalizeJiraKey(input: string): string | null {
	const trimmed = input.trim();
	if (KEY_PATTERN.test(trimmed)) return trimmed;
	const match = URL_PATTERN.exec(trimmed);
	if (match) return match[1].toUpperCase();
	return null;
}
