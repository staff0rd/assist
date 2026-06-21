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

function textLinksFrom(details: Json[]): string[] {
	return details
		.map((detail) => asObject(detail.textLink)?.url)
		.filter((url): url is string => typeof url === "string");
}

// why: an attached article preview card carries its outbound url on the article component's navigation context, not in the commentary text attributes
function articleCardLinksFrom(update: Json): string[] {
	const article = asObject(asObject(update.content)?.articleComponent);
	const url = asObject(article?.navigationContext)?.actionTarget;
	return typeof url === "string" ? [url] : [];
}

function linksFrom(update: Json, details: Json[]): string[] {
	return dedupeLinks([
		...textLinksFrom(details),
		...articleCardLinksFrom(update),
	]);
}

/**
 * Pull the mentions, hashtags, and links out of a voyager update's commentary
 * text attributes. A profile-mention attribute carries an opaque profile urn,
 * resolved to a vanity slug and name via `profiles`; a hashtag attribute names
 * its tag inside its urn; a text-link attribute carries the outbound url. An
 * attached article preview card contributes its url too, taken from the update's
 * article component rather than the commentary text attributes.
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
		links: linksFrom(update, details),
	};
}
