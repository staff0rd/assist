import { describe, expect, it } from "vitest";
import { extractVoyagerPosts } from "./extractVoyagerPosts";

const ACTIVITY = "urn:li:activity:123";
const UPDATE_URN = "urn:li:fsd_update:(urn:li:activity:123,MEMBER_SHARES)";
const MENTION_URN = "urn:li:fsd_profile:ACoAAmention";

function update(commentaryText: unknown) {
	return {
		entityUrn: UPDATE_URN,
		metadata: { backendUrn: ACTIVITY },
		actor: {
			name: { text: "John Smith" },
			navigationContext: {
				actionTarget:
					"https://www.linkedin.com/in/john-smith?miniProfileUrn=urn%3Ali%3Afsd_profile%3AACoAAjohn",
			},
		},
		commentary: commentaryText,
	};
}

const commentary = {
	text: {
		text: "Hello world #ai see https://lnkd.in/abc with Jane Doe",
		attributesV2: [
			{ detailData: { "*profileMention": MENTION_URN } },
			{
				detailData: {
					"*hashtag": "urn:li:fsd_hashtag:(ai,urn:li:activity:123)",
				},
			},
			{ detailData: { textLink: { url: "https://lnkd.in/abc" } } },
		],
	},
};

const profile = {
	$type: "com.linkedin.voyager.dash.identity.profile.Profile",
	entityUrn: MENTION_URN,
	publicIdentifier: "jane-doe",
	firstName: "Jane",
	lastName: "Doe",
};

function body(updates: unknown[], included: unknown[]): string {
	return JSON.stringify({
		data: {
			data: {
				feedDashProfileUpdatesByMemberShareFeed: {
					"*elements": updates.map(
						(u) => (u as { entityUrn: string }).entityUrn,
					),
				},
			},
		},
		included: [...updates, ...included],
	});
}

describe("extractVoyagerPosts", () => {
	const [post] = extractVoyagerPosts(body([update(commentary)], [profile]));

	it("should take the post text from the commentary", () => {
		expect(post.text).toBe(
			"Hello world #ai see https://lnkd.in/abc with Jane Doe",
		);
	});

	it("should read the activity urn from the update metadata", () => {
		expect(post.activityUrn).toBe(ACTIVITY);
	});

	it("should expose a permalink to the post", () => {
		expect(post.permalink).toBe(
			"https://www.linkedin.com/feed/update/urn:li:activity:123/",
		);
	});

	it("should derive the posted date from the activity urn", () => {
		expect(post.postedAt).toBe(new Date(0).toISOString());
	});

	it("should attribute the post to the actor", () => {
		expect(post.author).toEqual({
			slug: "john-smith",
			name: "John Smith",
			url: "https://www.linkedin.com/in/john-smith/",
		});
	});

	it("should resolve a profile-mention urn to its vanity slug and name", () => {
		expect(post.mentions).toEqual([
			{
				slug: "jane-doe",
				name: "Jane Doe",
				url: "https://www.linkedin.com/in/jane-doe/",
			},
		]);
	});

	it("should read the hashtag from its urn and the link from the text attribute", () => {
		expect(post.hashtags).toEqual(["#ai"]);
		expect(post.links).toEqual(["https://lnkd.in/abc"]);
	});

	describe("when the outbound link is an attached article card", () => {
		const cardCommentary = {
			text: { text: "I blogged about static web apps" },
		};
		const withCard = {
			...update(cardCommentary),
			content: {
				articleComponent: {
					navigationContext: {
						actionTarget:
							"https://staffordwilliams.com/blog/2024/10/14/netlify-azure-static-webapps/",
					},
				},
			},
		};

		it("should include the card url in links", () => {
			const [p] = extractVoyagerPosts(body([withCard], []));
			expect(p.links).toEqual([
				"https://staffordwilliams.com/blog/2024/10/14/netlify-azure-static-webapps/",
			]);
		});
	});

	describe("when a post has both an inline link and an article card", () => {
		const withBoth = {
			...update(commentary),
			content: {
				articleComponent: {
					navigationContext: {
						actionTarget: "https://staffordwilliams.com/blog/post/",
					},
				},
			},
		};

		it("should include both urls in links", () => {
			const [p] = extractVoyagerPosts(body([withBoth], [profile]));
			expect(p.links).toEqual([
				"https://lnkd.in/abc",
				"https://staffordwilliams.com/blog/post/",
			]);
		});
	});

	describe("when the update carries no commentary", () => {
		it("should skip it", () => {
			expect(extractVoyagerPosts(body([update(null)], []))).toHaveLength(0);
		});
	});

	describe("when the body is not valid json", () => {
		it("should return no posts", () => {
			expect(extractVoyagerPosts("not json")).toEqual([]);
		});
	});

	describe("when a mention is the author's own profile", () => {
		it("should not list the author as a mention", () => {
			const ownUrn = "urn:li:fsd_profile:ACoAAjohn";
			const own = {
				$type: "com.linkedin.voyager.dash.identity.profile.Profile",
				entityUrn: ownUrn,
				publicIdentifier: "john-smith",
				firstName: "John",
				lastName: "Smith",
			};
			const selfMention = {
				text: {
					text: "talking to myself",
					attributesV2: [{ detailData: { "*profileMention": ownUrn } }],
				},
			};
			const [p] = extractVoyagerPosts(body([update(selfMention)], [own]));
			expect(p.mentions).toEqual([]);
		});
	});
});
