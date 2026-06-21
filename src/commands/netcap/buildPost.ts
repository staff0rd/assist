import { activityPermalink } from "./activityPermalink";
import { activityUrnDate } from "./activityUrnDate";
import { type Mention, slugFromProfileUrl } from "./buildMentionMap";
import { dedupeLinks } from "./dedupeLinks";
import { linkifyMentions } from "./linkifyMentions";
import type { PostRaw } from "./walkPostRow";

export type LinkedInPost = {
	activityUrn?: string;
	permalink?: string;
	postedAt?: string;
	author?: Mention;
	text: string;
	markdown: string;
	mentions: Mention[];
	hashtags: string[];
	links: string[];
	relatedPosts: string[];
};

const profileUrl = (slug: string): string =>
	`https://www.linkedin.com/in/${slug}/`;

const joinText = (parts: string[]): string =>
	parts
		.join(" ")
		.replace(/\s+/g, " ")
		.replace(/\s+([.,!?])/g, "$1")
		.trim();

function resolveMentions(
	raw: PostRaw,
	mentionMap: Map<string, Mention>,
	author: string | undefined,
): Mention[] {
	const slugs = new Set<string>();
	for (const url of raw.profileUrls) {
		const slug = slugFromProfileUrl(url);
		if (slug && slug !== author) slugs.add(slug);
	}
	return [...slugs].map(
		(slug) => mentionMap.get(slug) ?? { slug, url: profileUrl(slug) },
	);
}

function resolveAuthor(
	mentionMap: Map<string, Mention>,
	author: string | undefined,
): Mention | undefined {
	if (!author) return undefined;
	return mentionMap.get(author) ?? { slug: author, url: profileUrl(author) };
}

/** Assemble a finished post from its raw walk, or undefined when it has no text. */
export function buildPost(
	raw: PostRaw,
	mentionMap: Map<string, Mention>,
	author: string | undefined,
): LinkedInPost | undefined {
	const text = joinText(raw.text);
	if (!text) return undefined;
	const mentions = resolveMentions(raw, mentionMap, author);
	const relatedPosts = [...new Set(raw.related)];
	return {
		text,
		markdown: linkifyMentions(text, mentions),
		mentions,
		hashtags: [...new Set(raw.hashtags)],
		links: dedupeLinks(raw.links),
		relatedPosts,
		activityUrn: relatedPosts[0],
		permalink: activityPermalink(relatedPosts[0]),
		postedAt: activityUrnDate(relatedPosts[0]),
		author: resolveAuthor(mentionMap, author),
	};
}
