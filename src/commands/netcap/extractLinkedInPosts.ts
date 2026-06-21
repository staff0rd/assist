import { buildMentionMap } from "./buildMentionMap";
import { buildPost, type LinkedInPost } from "./buildPost";
import { makeRscResolver, parseRscRows, type RscRows } from "./parseRscRows";
import { type PostRaw, walkPostRow } from "./walkPostRow";

// The scraped page names its owner in a state key like
// "profile-activity-load-<slug>"; that owner authors every post on the page.
export function findAuthorSlug(flight: string): string | undefined {
	return flight.match(/profile-activity-load-([A-Za-z0-9-]+)/)?.[1];
}

function findCommentaryRows(rows: RscRows): string[] {
	return Object.keys(rows).filter((id) =>
		/"componentkey":"feed-commentary_/.test(JSON.stringify(rows[id])),
	);
}

/** Extract every post from a single RSC flight response. */
export function extractLinkedInPosts(
	flight: string,
	author = findAuthorSlug(flight),
): LinkedInPost[] {
	const rows = parseRscRows(flight);
	const resolve = makeRscResolver(rows);
	const mentionMap = buildMentionMap(rows, resolve);
	const posts: LinkedInPost[] = [];
	for (const id of findCommentaryRows(rows)) {
		const raw: PostRaw = {
			text: [],
			hashtags: [],
			profileUrls: [],
			links: [],
			related: [],
		};
		walkPostRow(rows[id], resolve, raw);
		const post = buildPost(raw, mentionMap, author);
		if (post) posts.push(post);
	}
	return posts;
}
