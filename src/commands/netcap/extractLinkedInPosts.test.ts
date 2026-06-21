import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractLinkedInPosts, findAuthorSlug } from "./extractLinkedInPosts";
import { extractPostsFromCapture } from "./extractPostsFromCapture";

const NAV = "proto.sdui.actions.core.NavigateToUrl";

function mention(slug: string, name: string) {
	return {
		action: {
			actions: [
				{
					value: {
						content: {
							url: { $type: NAV, url: `https://www.linkedin.com/in/${slug}/` },
						},
					},
				},
			],
		},
		children: [["$", "strong", "k", { children: [name] }]],
	};
}

function commentaryRow(extra: unknown[] = []) {
	return {
		componentkey: "feed-commentary_abc",
		viewTrackingSpecs: { viewName: "feed-commentary" },
		children: [
			"Hello world this is a post.",
			"$3",
			mention("jane-doe", "Jane Doe"),
			"#ai",
			{ $type: NAV, url: "https://example.com/blog" },
			{
				$type: "proto.sdui.actions.requests.RequestedArguments",
				activityUrn: "urn:li:activity:123",
			},
			...extra,
		],
	};
}

function flightWith(row1: unknown): string {
	return [
		`1:${JSON.stringify(row1)}`,
		`2:${JSON.stringify(["profile-activity-load-john-smith"])}`,
		`3:${JSON.stringify("Referenced text here.")}`,
	].join("\n");
}

describe("findAuthorSlug", () => {
	it("should read the slug from the profile-activity-load state key", () => {
		expect(findAuthorSlug("x:profile-activity-load-john-smith}")).toBe(
			"john-smith",
		);
	});

	describe("when no such state key is present", () => {
		it("should return undefined", () => {
			expect(findAuthorSlug("nothing here")).toBeUndefined();
		});
	});
});

describe("extractLinkedInPosts", () => {
	const [post] = extractLinkedInPosts(flightWith(commentaryRow()));

	it("should reconstruct the post text including the referenced run", () => {
		expect(post.text).toBe(
			"Hello world this is a post. Referenced text here. Jane Doe",
		);
	});

	it("should attribute the post to the page author", () => {
		expect(post.author).toEqual({
			slug: "john-smith",
			url: "https://www.linkedin.com/in/john-smith/",
		});
	});

	it("should pair an in-text mention with its name and profile url", () => {
		expect(post.mentions).toEqual([
			{
				slug: "jane-doe",
				name: "Jane Doe",
				url: "https://www.linkedin.com/in/jane-doe/",
			},
		]);
	});

	it("should link the mention name in the markdown", () => {
		expect(post.markdown).toContain(
			"[Jane Doe](https://www.linkedin.com/in/jane-doe/)",
		);
	});

	it("should collect hashtags, external links, and the activity urn", () => {
		expect(post.hashtags).toEqual(["#ai"]);
		expect(post.links).toEqual(["https://example.com/blog"]);
		expect(post.activityUrn).toBe("urn:li:activity:123");
	});

	it("should derive the posted date from the activity urn", () => {
		expect(post.postedAt).toBe(new Date(0).toISOString());
	});

	describe("when a profile link is the author's own", () => {
		it("should not list the author as a mention", () => {
			const withAuthorLink = commentaryRow([
				mention("john-smith", "John Smith"),
			]);
			const [p] = extractLinkedInPosts(flightWith(withAuthorLink));
			expect(p.mentions.map((m) => m.slug)).toEqual(["jane-doe"]);
		});
	});

	describe("when an external link is wrapped in a safety redirect", () => {
		it("should decode the real destination", () => {
			const safety = {
				$type: NAV,
				url: "https://www.linkedin.com/safety/go/?url=https%3A%2F%2Fblog.test%2Fx&urlhash=ab",
			};
			const [p] = extractLinkedInPosts(flightWith(commentaryRow([safety])));
			expect(p.links).toContain("https://blog.test/x");
		});
	});
});

describe("extractPostsFromCapture", () => {
	function writeCapture(entries: object[]): string {
		const dir = mkdtempSync(join(tmpdir(), "netcap-extract-"));
		const file = join(dir, "capture.jsonl");
		writeFileSync(file, entries.map((e) => JSON.stringify(e)).join("\n"));
		return file;
	}

	function voyagerBody(activityUrn: string, text: string): string {
		const updateUrn = `urn:li:fsd_update:(${activityUrn})`;
		return JSON.stringify({
			data: {
				data: {
					feedDashProfileUpdatesByMemberShareFeed: {
						"*elements": [updateUrn],
					},
				},
			},
			included: [
				{
					entityUrn: updateUrn,
					metadata: { backendUrn: activityUrn },
					actor: {
						name: { text: "John Smith" },
						navigationContext: {
							actionTarget: "https://www.linkedin.com/in/john-smith",
						},
					},
					commentary: { text: { text, attributesV2: [] } },
				},
			],
		});
	}

	it("should extract posts only from rsc-action responses", () => {
		const file = writeCapture([
			{ url: "https://x/li/track", responseBody: "noise" },
			{
				url: "https://x/rsc-action/actions/component",
				responseBody: flightWith(commentaryRow()),
			},
		]);
		const posts = extractPostsFromCapture(file);
		expect(posts).toHaveLength(1);
		expect(posts[0].mentions[0].name).toBe("Jane Doe");
	});

	describe("when the capture holds scroll-loaded voyager responses", () => {
		it("should extract their posts alongside the rsc-action posts", () => {
			const file = writeCapture([
				{
					url: "https://x/rsc-action/actions/component",
					responseBody: flightWith(commentaryRow()),
				},
				{
					url: "https://www.linkedin.com/voyager/api/graphql?queryId=voyagerFeedDashProfileUpdates.abc",
					responseBody: voyagerBody("urn:li:activity:999", "Scrolled post."),
				},
			]);
			const posts = extractPostsFromCapture(file);
			expect(posts.map((p) => p.activityUrn).sort()).toEqual([
				"urn:li:activity:123",
				"urn:li:activity:999",
			]);
		});

		describe("when the same activity is in both an rsc and a voyager response", () => {
			it("should keep one entry, preferring the longer text", () => {
				const file = writeCapture([
					{
						url: "https://x/rsc-action/a",
						responseBody: flightWith(commentaryRow()),
					},
					{
						url: "https://www.linkedin.com/voyager/api/graphql?queryId=voyagerFeedDashProfileUpdates.abc",
						responseBody: voyagerBody("urn:li:activity:123", "short"),
					},
				]);
				const posts = extractPostsFromCapture(file);
				expect(posts).toHaveLength(1);
				expect(posts[0].text).toContain("Hello world");
			});
		});
	});

	describe("when the same activity appears twice", () => {
		it("should keep the entry with the longer text", () => {
			const short = {
				componentkey: "feed-commentary_abc",
				viewTrackingSpecs: { viewName: "feed-commentary" },
				children: [
					"Short.",
					{
						$type: "proto.sdui.actions.requests.RequestedArguments",
						activityUrn: "urn:li:activity:123",
					},
				],
			};
			const file = writeCapture([
				{ url: "https://x/rsc-action/a", responseBody: flightWith(short) },
				{
					url: "https://x/rsc-action/b",
					responseBody: flightWith(commentaryRow()),
				},
			]);
			const posts = extractPostsFromCapture(file);
			expect(posts).toHaveLength(1);
			expect(posts[0].text).toContain("Hello world");
		});
	});
});
