import { activityPermalink } from "./activityPermalink";
import { activityUrnDate } from "./activityUrnDate";
import { asObject, type Mention } from "./buildMentionMap";
import type { LinkedInPost } from "./buildPost";
import { collectVoyagerAttributes } from "./collectVoyagerAttributes";
import { linkifyMentions } from "./linkifyMentions";
import { resolveVoyagerAuthor } from "./resolveVoyagerAuthor";

type Json = Record<string, unknown>;

function commentaryText(update: Json): string | undefined {
	const body = asObject(asObject(update.commentary)?.text)?.text;
	return typeof body === "string" && body.trim() ? body.trim() : undefined;
}

function activityUrnOf(update: Json): string | undefined {
	const urn = asObject(update.metadata)?.backendUrn;
	return typeof urn === "string" ? urn : undefined;
}

/**
 * Build a finished post from a single voyager feed Update, or undefined when it
 * carries no commentary text (e.g. a bare reshare). `profiles` maps a profile
 * urn to its mention so opaque mention urns resolve to a vanity slug and name.
 */
export function buildVoyagerPost(
	update: Json,
	profiles: Map<string, Mention>,
): LinkedInPost | undefined {
	const text = commentaryText(update);
	if (!text) return undefined;
	const author = resolveVoyagerAuthor(update);
	const { mentions, hashtags, links } = collectVoyagerAttributes(
		update,
		profiles,
		author?.slug,
	);
	const activityUrn = activityUrnOf(update);
	return {
		text,
		markdown: linkifyMentions(text, mentions),
		mentions,
		hashtags,
		links,
		relatedPosts: activityUrn ? [activityUrn] : [],
		activityUrn,
		permalink: activityPermalink(activityUrn),
		postedAt: activityUrnDate(activityUrn),
		author,
	};
}
