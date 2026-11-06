import { generateKeyPairSync } from "node:crypto";
import { vi } from "vitest";
import type { TestflightConfig } from "./readTestflightConfig";

export type AscRoute = {
	method: string;
	match: string;
	status?: number;
	body: unknown;
};

const pem = generateKeyPairSync("ec", { namedCurve: "prime256v1" })
	.privateKey.export({ type: "pkcs8", format: "pem" })
	.toString();

function mockFetch(routes: AscRoute[]) {
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

const config: TestflightConfig = {
	keyId: "KEY",
	issuerId: "ISSUER",
	keyRef: "op://vault/item/key",
	bundleId: "com.example.app",
	externalGroup: "Friends",
};

const appAndGroups: AscRoute[] = [
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

export const ascFixtures = {
	config,
	appAndGroups,
	mockFetch,
	readKey: () => pem,
};
