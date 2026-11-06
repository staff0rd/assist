import { describe, expect, it } from "vitest";
import { ascFixtures } from "./ascFixtures";
import { listTesters } from "./listTesters";

const { config, appAndGroups, mockFetch, readKey } = ascFixtures;

const visible = { visibleApps: { data: [{ type: "apps", id: "app1" }] } };
const hidden = { visibleApps: { data: [{ type: "apps", id: "other" }] } };

const routes = [
	...appAndGroups,
	{
		method: "GET",
		match: "/v1/users?",
		body: {
			data: [
				{
					type: "users",
					id: "u1",
					attributes: { username: "sam@x.com" },
					relationships: visible,
				},
				{
					type: "users",
					id: "u2",
					attributes: { username: "owner@x.com", allAppsVisible: true },
					relationships: hidden,
				},
				{
					type: "users",
					id: "u3",
					attributes: { username: "elsewhere@x.com" },
					relationships: hidden,
				},
			],
		},
	},
	{
		method: "GET",
		match: "/v1/userInvitations?",
		body: {
			data: [
				{
					type: "userInvitations",
					id: "i1",
					attributes: { email: "alex@x.com" },
					relationships: visible,
				},
			],
		},
	},
	{
		method: "GET",
		match: "filter[betaGroups]=g-internal",
		body: {
			data: [
				{
					type: "betaTesters",
					id: "t1",
					attributes: { email: "sam@x.com", state: "INSTALLED" },
				},
			],
		},
	},
	{
		method: "GET",
		match: "filter[betaGroups]=g-ext",
		body: {
			data: [
				{
					type: "betaTesters",
					id: "t2",
					attributes: { email: "riley@y.com", state: "ACCEPTED" },
				},
				{
					type: "betaTesters",
					id: "t3",
					attributes: { email: "casey@y.com", state: "INVITED" },
				},
			],
		},
	},
];

describe("listTesters", () => {
	it("lists internal people seeing the app and external group testers", async () => {
		const fetchFn = mockFetch(routes);
		const result = await listTesters(
			{ ...config, internalGroup: "Team" },
			{ readKey, fetchFn },
		);
		expect(result).toEqual({
			bundleId: "com.example.app",
			internal: [
				{ email: "alex@x.com", team: "pending", testflight: "not-in-group" },
				{ email: "owner@x.com", team: "joined", testflight: "not-in-group" },
				{ email: "sam@x.com", team: "joined", testflight: "installed" },
			],
			external: [
				{ email: "casey@y.com", testflight: "invited" },
				{ email: "riley@y.com", testflight: "accepted" },
			],
		});
	});

	it("skips the internal section when no internal group is configured", async () => {
		const fetchFn = mockFetch(routes);
		const result = await listTesters(config, { readKey, fetchFn });
		expect(result.internal).toEqual([]);
		expect(result.external).toHaveLength(2);
	});

	it("surfaces an API error", async () => {
		const fetchFn = mockFetch([
			{
				method: "GET",
				match: "/v1/apps?",
				status: 403,
				body: { errors: [{ title: "Forbidden" }] },
			},
		]);
		await expect(listTesters(config, { readKey, fetchFn })).rejects.toThrow(
			/failed \(403\)/,
		);
	});
});
