import { readFileSync } from "node:fs";
import type { LinkedInPost } from "./buildPost";
import { extractLinkedInPosts, findAuthorSlug } from "./extractLinkedInPosts";
import { extractVoyagerPosts } from "./extractVoyagerPosts";

type CaptureEntry = { url: string; responseBody: string };

function captureEntries(captureFile: string): CaptureEntry[] {
	const lines = readFileSync(captureFile, "utf8").split("\n").filter(Boolean);
	const entries: CaptureEntry[] = [];
	for (const line of lines) {
		let entry: { url?: unknown; responseBody?: unknown };
		try {
			entry = JSON.parse(line);
		} catch {
			continue;
		}
		if (typeof entry.url !== "string" || typeof entry.responseBody !== "string")
			continue;
		entries.push({ url: entry.url, responseBody: entry.responseBody });
	}
	return entries;
}

function dedupeByActivity(posts: LinkedInPost[]): LinkedInPost[] {
	const byUrn = new Map<string, LinkedInPost>();
	const noUrn: LinkedInPost[] = [];
	for (const post of posts) {
		if (!post.activityUrn) {
			noUrn.push(post);
			continue;
		}
		const existing = byUrn.get(post.activityUrn);
		if (!existing || post.text.length > existing.text.length)
			byUrn.set(post.activityUrn, post);
	}
	return [...byUrn.values(), ...noUrn];
}

/**
 * Extract posts from a netcap capture file. Reads both the LinkedIn SDUI
 * (rsc-action) responses rendered on first paint and the voyager GraphQL
 * profile-updates responses loaded on scroll, keeping the richest copy of each
 * activity when the same post is captured more than once.
 */
export function extractPostsFromCapture(captureFile: string): LinkedInPost[] {
	const entries = captureEntries(captureFile);
	const rscBodies = entries
		.filter((e) => /rsc-action/.test(e.url))
		.map((e) => e.responseBody);
	const voyagerBodies = entries
		.filter((e) => /voyagerFeedDashProfileUpdates/.test(e.url))
		.map((e) => e.responseBody);
	const author = rscBodies.map(findAuthorSlug).find(Boolean);
	const all = [
		...rscBodies.flatMap((body) => extractLinkedInPosts(body, author)),
		...voyagerBodies.flatMap(extractVoyagerPosts),
	];
	return dedupeByActivity(all);
}
