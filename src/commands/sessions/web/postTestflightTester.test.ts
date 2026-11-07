import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();
const mockAddTesterOutcome = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));
vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => ({
		testflight: {
			keyId: "KEY",
			issuerId: "ISSUER",
			keyRef: "op://vault/item/key",
			bundleId: "com.example.app",
			externalGroup: "External",
		},
	}),
}));
vi.mock("../../testflight/addTesterOutcome", () => ({
	addTesterOutcome: (...args: unknown[]) => mockAddTesterOutcome(...args),
}));

import { postTestflightTester } from "./postTestflightTester";

async function post(body: string) {
	const req = Readable.from([Buffer.from(body)]) as unknown as IncomingMessage;
	await postTestflightTester(req, {} as ServerResponse);
}

describe("postTestflightTester", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each([
		["invalid JSON", "{", "Invalid JSON body"],
		["a missing email", "{}", "email must be a valid email address"],
		[
			"a malformed email",
			JSON.stringify({ email: "not-an-email" }),
			"email must be a valid email address",
		],
		[
			"a non-boolean internal",
			JSON.stringify({ email: "a@b.com", internal: "yes" }),
			"internal must be a boolean",
		],
	])("rejects %s with 400", async (_name, body, error) => {
		await post(body);

		expect(mockAddTesterOutcome).not.toHaveBeenCalled();
		expect(mockRespondJson).toHaveBeenCalledWith(expect.anything(), 400, {
			error,
		});
	});

	it("adds the trimmed email and returns the outcome", async () => {
		const outcome = {
			result: "invited",
			message: "Sent a@b.com an App Store Connect team invite.",
			waiting: false,
		};
		mockAddTesterOutcome.mockResolvedValue(outcome);

		await post(JSON.stringify({ email: " a@b.com ", internal: true }));

		expect(mockAddTesterOutcome).toHaveBeenCalledWith(
			expect.objectContaining({ bundleId: "com.example.app" }),
			"a@b.com",
			{ internal: true },
		);
		expect(mockRespondJson).toHaveBeenCalledWith(
			expect.anything(),
			200,
			outcome,
		);
	});

	it("defaults internal to false", async () => {
		mockAddTesterOutcome.mockResolvedValue({});

		await post(JSON.stringify({ email: "a@b.com" }));

		expect(mockAddTesterOutcome).toHaveBeenCalledWith(
			expect.anything(),
			"a@b.com",
			{ internal: false },
		);
	});

	it("returns the add error as a 500", async () => {
		mockAddTesterOutcome.mockRejectedValue(
			new Error("App Store Connect API key lacks the Admin role"),
		);

		await post(JSON.stringify({ email: "a@b.com", internal: true }));

		expect(mockRespondJson).toHaveBeenCalledWith(expect.anything(), 500, {
			error: "App Store Connect API key lacks the Admin role",
		});
	});
});
