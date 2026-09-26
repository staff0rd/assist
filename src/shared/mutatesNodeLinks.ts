const MUTATE_RE = /^assist\s+sessions\s+nodes\s+(link|unlink)\b/;

export function mutatesNodeLinks(command: string): boolean {
	return MUTATE_RE.test(command);
}
