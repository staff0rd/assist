import { describe, expect, it } from "vitest";
import { runConfigSchema } from "./runConfigSchema";

const base = { name: "api", command: "dotnet", server: true, port: 5001 };

describe("runConfigSchema protocol", () => {
	it.each(["http", "https"])("accepts %s", (protocol) => {
		expect(runConfigSchema.safeParse({ ...base, protocol }).success).toBe(true);
	});

	it("rejects any other protocol", () => {
		expect(
			runConfigSchema.safeParse({ ...base, protocol: "ftp" }).success,
		).toBe(false);
	});
});
