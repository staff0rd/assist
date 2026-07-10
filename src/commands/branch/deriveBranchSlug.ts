const MAX_SLUG_WORDS = 5;

export function deriveBranchSlug(name: string): string {
	const words = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.split("-")
		.filter((word) => word.length > 0)
		.filter((word) => !/^\d+$/.test(word));
	const slug = words.slice(0, MAX_SLUG_WORDS).join("-");
	return slug || "story";
}

export function isConciseSlug(slug: string): boolean {
	return slug.split("-").filter(Boolean).length <= MAX_SLUG_WORDS;
}
