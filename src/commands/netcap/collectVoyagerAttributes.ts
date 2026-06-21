import { asObject, type Mention } from "./buildMentionMap";
import { dedupeLinks } from "./dedupeLinks";

type Json = Record<string, unknown>;

function attributeDetails(update: Json): Json[] {
	const attrs = asObject(asObject(update.commentary)?.text)?.attributesV2;
	if (!Array.isArray(attrs)) return [];
	return attrs
		.map((a) => asObject(asObject(a)?.detailData))
		.filter((d): d is Json => d !== undefined);
}

function mentionsFrom(
	details: Json[],
	profiles: Map<string, Mention>,
	authorSlug: string | undefined,
): Mention[] {
	const bySlug = new Map<string, Mention>();
	for (const detail of details) {
		const urn = detail["*profileMention"];
		if (typeof urn !== "string") continue;
		const mention = profiles.get(urn);
		if (mention && mention.slug !== authorSlug)
			bySlug.set(mention.slug, mention);
	}
	return [...bySlug.values()];
}

function hashtagsFrom(details: Json[]): string[] {
	const tags: string[] = [];
	for (const detail of details) {
		const urn = detail["*hashtag"];
		const tag =
			typeof urn === "string" ? urn.match(/\(([^,]+),/)?.[1] : undefined;
		if (tag) tags.push(`#${tag}`);
	}
	return [...new Set(tags)];
}

function linksFrom(details: Json[]): string[] {
	const links = details
		.map((detail) => asObject(detail.textLink)?.url)
		.filter((url): url is string => typeof url === "string");
	return dedupeLinks(links);
}

/**
 * Pull the mentions, hashtags, and links out of a voyager update's commentary
 * text attributes. A profile-mention attribute carries an opaque profile urn,
 * resolved to a vanity slug and name via `profiles`; a hashtag attribute names
 * its tag inside its urn; a text-link attribute carries the outbound url.
 */
export function collectVoyagerAttributes(
	update: Json,
	profiles: Map<string, Mention>,
	authorSlug: string | undefined,
): { mentions: Mention[]; hashtags: string[]; links: string[] } {
	const details = attributeDetails(update);
	return {
		mentions: mentionsFrom(details, profiles, authorSlug),
		hashtags: hashtagsFrom(details),
		links: linksFrom(details),
	};
}
