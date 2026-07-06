const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH_REF_REGEX = /#\d+/;
const BACKLOG_NUMBER_SEGMENT_REGEX = /(?:^|-)\d{1,4}(?:-|$)/;

export function validateSlug(slug: string): string | null {
	if (!slug) {
		return "Slug is required";
	}

	if (HASH_REF_REGEX.test(slug)) {
		return `Slug "${slug}" contains a backlog reference (#<number>); remove it`;
	}

	if (!KEBAB_CASE_REGEX.test(slug)) {
		return `Slug "${slug}" must be kebab-case (lowercase letters, digits, and hyphens)`;
	}

	if (BACKLOG_NUMBER_SEGMENT_REGEX.test(slug)) {
		return `Slug "${slug}" contains a numeric token that looks like a backlog ID; remove or reword it`;
	}

	return null;
}
