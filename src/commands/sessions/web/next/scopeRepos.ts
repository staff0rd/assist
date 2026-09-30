export function scopeRepos(
	configured: string[] | null,
	selfRepo: string | null,
): string[] {
	if (configured) return configured;
	return selfRepo ? [selfRepo] : [];
}
