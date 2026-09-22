const CONFIGURE_RE = /^assist\s+releases\s+configure\b/;

export function configuresReleases(command: string): boolean {
	return CONFIGURE_RE.test(command);
}
