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
				{ type: "betaGroups", id: "g-internal", attributes: { name: "Team" } },
				{ type: "betaGroups", id: "g-ext", attributes: { name: "Friends" } },
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
