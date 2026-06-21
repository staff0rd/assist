import { asObject } from "./buildMentionMap";
import { buildVoyagerPost } from "./buildVoyagerPost";
import type { LinkedInPost } from "./buildPost";
import { voyagerProfileMentions } from "./voyagerProfileMentions";

type Json = Record<string, unknown>;

function includedObjects(root: Json): Json[] {
	const included = root.included;
	if (!Array.isArray(included)) return [];
	return included
		.map((item) => asObject(item))
		.filter((o): o is Json => o !== undefined);
}

// The scroll page wraps its updates under a feed key (e.g.
// feedDashProfileUpdatesByMemberShareFeed); take the first value that carries
// the *elements list of update urns so a future query-name change still works.
function elementUrns(root: Json): string[] {
	const data = asObject(asObject(root.data)?.data);
	if (!data) return [];
	for (const value of Object.values(data)) {
		const elements = asObject(value)?.["*elements"];
		if (Array.isArray(elements))
			return elements.filter((e): e is string => typeof e === "string");
	}
	return [];
}

/**
 * Extract posts from a single voyager GraphQL profile-updates response. This is
 * the JSON the all-activity page loads on scroll — a Rest.li decoration graph,
 * distinct from the SDUI rsc-action flight — so it has its own walk.
 */
export function extractVoyagerPosts(body: string): LinkedInPost[] {
	let root: unknown;
	try {
		root = JSON.parse(body);
	} catch {
		return [];
	}
	const rootObj = asObject(root);
	if (!rootObj) return [];
	const included = includedObjects(rootObj);
	const byUrn = new Map<string, Json>();
	for (const o of included) {
		if (typeof o.entityUrn === "string") byUrn.set(o.entityUrn, o);
	}
	const profiles = voyagerProfileMentions(included);
	const posts: LinkedInPost[] = [];
	for (const ref of elementUrns(rootObj)) {
		const update = byUrn.get(ref);
		if (!update) continue;
		const post = buildVoyagerPost(update, profiles);
		if (post) posts.push(post);
	}
	return posts;
}
