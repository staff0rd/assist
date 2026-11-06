import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { addTester } from "./addTester";
import type { TestflightConfig } from "./readTestflightConfig";

const pem = generateKeyPairSync("ec", { namedCurve: "prime256v1" })
	.privateKey.export({ type: "pkcs8", format: "pem" })
	.toString();

const config: TestflightConfig = {
	keyId: "KEY",
	issuerId: "ISSUER",
	keyRef: "op://vault/item/key",
	bundleId: "com.example.app",
	externalGroup: "Friends",
};

type Route = { method: string; match: string; status?: number; body: unknown };

function mockFetch(routes: Route[]) {
	return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
		const method = init?.method ?? "GET";
		const decoded = decodeURIComponent(String(url));
		const route = routes.find(
			(r) => r.method === method && decoded.includes(r.match),
		);
		if (!route) throw new Error(`Unexpected ${method} ${decoded}`);
		return Response.json(route.body, { status: route.status ?? 200 });
	});
}

const appAndGroups: Route[] = [
	{
		method: "GET",
		match: "/v1/apps?",
		body: {
			data: [
				{
					type: "apps",
					id: "app1",
					attributes: { bundleId: "com.example.app" },
				},
			],
		},
	},
	{
		method: "GET",
		match: "/v1/apps/app1/betaGroups",
		body: {
			data: [
				{
					type: "betaGroups",
					id: "g-internal",
					attributes: { name: "Team", isInternalGroup: true },
				},
				{
					type: "betaGroups",
					id: "g-ext",
					attributes: { name: "Friends", isInternalGroup: false },
				},
			],
		},
	},
];

const readKey = () => pem;

function postBodies(fetchFn: ReturnType<typeof mockFetch>) {
	return fetchFn.mock.calls
		.filter(([, init]) => init?.method === "POST")
		.map(([url, init]) => ({
			url: String(url),
			body: JSON.parse(String(init?.body)),
		}));
}

describe("addTester", () => {
	it("reports an existing group member as already in the group", async () => {
		const fetchFn = mockFetch([
			...appAndGroups,
			{
				method: "GET",
				match: "filter[betaGroups]=g-ext",
				body: { data: [{ type: "betaTesters", id: "t1" }] },
			},
		]);

		const result = await addTester(config, "a@b.com", { readKey, fetchFn });

		expect(result).toBe("already-in-group");
		expect(postBodies(fetchFn)).toEqual([]);
	});

	it("adds an existing tester to the resolved group", async () => {
		const fetchFn = mockFetch([
			...appAndGroups,
			{ method: "GET", match: "filter[betaGroups]", body: { data: [] } },
			{
				method: "GET",
				match: "/v1/betaTesters?",
				body: { data: [{ type: "betaTesters", id: "t1" }] },
			},
			{ method: "POST", match: "/relationships/betaTesters", body: {} },
		]);

		const result = await addTester(config, "a@b.com", { readKey, fetchFn });

		expect(result).toBe("added");
		expect(postBodies(fetchFn)).toEqual([
			{
				url: "https://api.appstoreconnect.apple.com/v1/betaGroups/g-ext/relationships/betaTesters",
				body: { data: [{ type: "betaTesters", id: "t1" }] },
			},
		]);
	});

	it("creates a new tester in the external group", async () => {
		const fetchFn = mockFetch([
			...appAndGroups,
			{ method: "GET", match: "/v1/betaTesters?", body: { data: [] } },
			{ method: "POST", match: "/v1/betaTesters", status: 201, body: {} },
		]);

		const result = await addTester(config, "a@b.com", { readKey, fetchFn });

		expect(result).toBe("created");
		expect(postBodies(fetchFn)[0].body.data).toEqual({
			type: "betaTesters",
			attributes: { email: "a@b.com" },
			relationships: {
				betaGroups: { data: [{ type: "betaGroups", id: "g-ext" }] },
			},
		});
	});

	it("names the available groups when the configured one is unknown", async () => {
		const fetchFn = mockFetch(appAndGroups);

		await expect(
			addTester({ ...config, externalGroup: "Missing" }, "a@b.com", {
				readKey,
				fetchFn,
			}),
		).rejects.toThrow(
			'No beta group named "Missing" (testflight.externalGroup). Available groups: Team, Friends',
		);
	});

	it("rejects an internal group configured as the external group", async () => {
		const fetchFn = mockFetch(appAndGroups);

		await expect(
			addTester({ ...config, externalGroup: "Team" }, "a@b.com", {
				readKey,
				fetchFn,
			}),
		).rejects.toThrow(
			'Beta group "Team" (testflight.externalGroup) must be an external group',
		);
	});

	it("surfaces Apple's error with a role hint on 403", async () => {
		const fetchFn = mockFetch([
			{
				method: "GET",
				match: "/v1/apps?",
				status: 403,
				body: {
					errors: [{ title: "Forbidden", detail: "Not allowed" }],
				},
			},
		]);

		await expect(
			addTester(config, "a@b.com", { readKey, fetchFn }),
		).rejects.toThrow(
			/GET \/v1\/apps failed \(403\)\n {2}Forbidden: Not allowed\n.*Admin/,
		);
	});
});

describe("addTester --internal", () => {
	const internalConfig = { ...config, internalGroup: "Team" };
	const noUser: Route = {
		method: "GET",
		match: "/v1/users?",
		body: { data: [] },
	};

	it("invites an unknown email to the team scoped to the app", async () => {
		const fetchFn = mockFetch([
			...appAndGroups,
			noUser,
			{ method: "GET", match: "/v1/userInvitations?", body: { data: [] } },
			{ method: "POST", match: "/v1/userInvitations", status: 201, body: {} },
		]);

		const result = await addTester(internalConfig, "jane.doe@b.com", {
			internal: true,
			readKey,
			fetchFn,
		});

		expect(result).toBe("invited");
		expect(postBodies(fetchFn)).toEqual([
			{
				url: "https://api.appstoreconnect.apple.com/v1/userInvitations",
				body: {
					data: {
						type: "userInvitations",
						attributes: {
							email: "jane.doe@b.com",
							firstName: "Jane",
							lastName: "Doe",
							roles: ["DEVELOPER"],
							allAppsVisible: false,
							provisioningAllowed: false,
						},
						relationships: {
							visibleApps: { data: [{ type: "apps", id: "app1" }] },
						},
					},
				},
			},
		]);
	});

	it("reports a pending invitation without posting", async () => {
		const fetchFn = mockFetch([
			...appAndGroups,
			noUser,
			{
				method: "GET",
				match: "/v1/userInvitations?",
				body: {
					data: [
						{
							type: "userInvitations",
							id: "i1",
							attributes: { email: "A@b.com" },
						},
					],
				},
			},
		]);

		const result = await addTester(internalConfig, "a@b.com", {
			internal: true,
			readKey,
			fetchFn,
		});

		expect(result).toBe("invite-pending");
		expect(postBodies(fetchFn)).toEqual([]);
	});

	it("adds a joined team member to the internal group", async () => {
		const fetchFn = mockFetch([
			...appAndGroups,
			{
				method: "GET",
				match: "/v1/users?",
				body: {
					data: [
						{ type: "users", id: "u1", attributes: { username: "a@b.com" } },
					],
				},
			},
			{ method: "GET", match: "/v1/betaTesters?", body: { data: [] } },
			{ method: "POST", match: "/v1/betaTesters", status: 201, body: {} },
		]);

		const result = await addTester(internalConfig, "a@b.com", {
			internal: true,
			readKey,
			fetchFn,
		});

		expect(result).toBe("created");
		expect(
			postBodies(fetchFn)[0].body.data.relationships.betaGroups.data,
		).toEqual([{ type: "betaGroups", id: "g-internal" }]);
	});

	it("requires testflight.internalGroup", async () => {
		await expect(
			addTester(config, "a@b.com", { internal: true, readKey }),
		).rejects.toThrow(/testflight\.internalGroup is not set/);
	});
});
