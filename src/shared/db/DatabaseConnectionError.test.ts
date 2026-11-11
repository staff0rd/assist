import { afterEach, describe, expect, it, vi } from "vitest";
import {
	DatabaseConnectionError,
	toDatabaseConnectionError,
} from "./DatabaseConnectionError";

function coded(message: string, code: string): Error {
	return Object.assign(new Error(message), { code });
}

describe("toDatabaseConnectionError", () => {
	afterEach(() => vi.unstubAllEnvs());

	it("names the setting and its source for an unresolvable host", () => {
		vi.stubEnv("ASSIST_DATABASE_URL", "postgresql://u:p@host/x");

		const error = toDatabaseConnectionError(
			coded("getaddrinfo ENOTFOUND host", "ENOTFOUND"),
		);

		expect(error).toBeInstanceOf(DatabaseConnectionError);
		expect((error as Error).message).toBe(
			"Could not connect to the assist database: getaddrinfo ENOTFOUND host\nThe connection string comes from ASSIST_DATABASE_URL (environment variable).",
		);
	});

	it("reads the cause of an AggregateError ECONNREFUSED", () => {
		vi.stubEnv("ASSIST_DATABASE_URL", "postgresql://u:p@localhost:1/x");
		const aggregate = Object.assign(
			new AggregateError(
				[
					coded("connect ECONNREFUSED ::1:1", "ECONNREFUSED"),
					coded("connect ECONNREFUSED 127.0.0.1:1", "ECONNREFUSED"),
				],
				"All attempts to connect failed",
			),
			{ code: "ECONNREFUSED" },
		);

		const error = toDatabaseConnectionError(aggregate) as Error;

		expect(error).toBeInstanceOf(DatabaseConnectionError);
		expect(error.message).toContain("connect ECONNREFUSED ::1:1");
		expect(error.message).toContain("ASSIST_DATABASE_URL");
	});

	it("leaves other errors untouched", () => {
		const original = new Error('relation "items" does not exist');

		expect(toDatabaseConnectionError(original)).toBe(original);
	});
});
