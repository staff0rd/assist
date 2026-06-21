import type { Mention } from "./buildMentionMap";

type Json = Record<string, unknown>;

const PROFILE_TYPE = "com.linkedin.voyager.dash.identity.profile.Profile";

const profileUrl = (slug: string): string =>
	`https://www.linkedin.com/in/${slug}/`;

function profileName(o: Json): string {
	return [o.firstName, o.lastName]
		.filter((s): s is string => typeof s === "string" && s.length > 0)
		.join(" ");
}

/**
 * Map each profile urn in a voyager response's `included` graph to its mention,
 * so an opaque mention urn (`urn:li:fsd_profile:ACoAA…`) resolves to a vanity
 * slug and display name.
 */
export function voyagerProfileMentions(included: Json[]): Map<string, Mention> {
	const map = new Map<string, Mention>();
	for (const o of included) {
		const urn = o.entityUrn;
		const slug = o.publicIdentifier;
		if (o.$type !== PROFILE_TYPE) continue;
		if (typeof urn !== "string" || typeof slug !== "string") continue;
		const name = profileName(o);
		const url = profileUrl(slug);
		map.set(urn, name ? { slug, name, url } : { slug, url });
	}
	return map;
}
