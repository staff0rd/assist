/** Build the public permalink for a LinkedIn activity urn, or undefined when missing. */
export function activityPermalink(urn: string | undefined): string | undefined {
	return urn ? `https://www.linkedin.com/feed/update/${urn}/` : undefined;
}
