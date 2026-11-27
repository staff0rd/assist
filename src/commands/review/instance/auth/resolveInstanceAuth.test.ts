import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveInstanceAuth } from "./resolveInstanceAuth";

describe("resolveInstanceAuth", () => {
	it("runs signed out when no strategy is set", () => {
		expect(resolveInstanceAuth(undefined, "/repo")).toBeUndefined();
		expect(
			resolveInstanceAuth({ loginScript: { script: "login.mjs" } }, "/repo"),
		).toBeUndefined();
	});

	it("selects the login-script strategy with its script and credentials", () => {
		expect(
			resolveInstanceAuth(
				{
					strategy: "login-script",
					loginScript: {
						script: "review/login.mjs",
						username: "reviewer",
						password: "s3cret",
					},
				},
				"/repo",
			),
		).toEqual({
			strategy: "login-script",
			script: "/repo/review/login.mjs",
			credentials: { username: "reviewer", password: "s3cret" },
		});
	});

	it("expands a leading ~/ in the script path to the home directory", () => {
		expect(
			resolveInstanceAuth(
				{
					strategy: "login-script",
					loginScript: { script: "~/review/login.cjs", password: "s3cret" },
				},
				"/repo",
			)?.script,
		).toBe(join(homedir(), "review/login.cjs"));
	});

	it("errors when the credentials secret is missing", () => {
		expect(() =>
			resolveInstanceAuth(
				{ strategy: "login-script", loginScript: { script: "login.mjs" } },
				"/repo",
			),
		).toThrow(
			/review\.instance\.auth\.loginScript\.password is not set.*assist config set --node/,
		);
	});

	it("errors when the login script is missing", () => {
		expect(() =>
			resolveInstanceAuth(
				{ strategy: "login-script", loginScript: { password: "s3cret" } },
				"/repo",
			),
		).toThrow(/review\.instance\.auth\.loginScript\.script is not set/);
	});
});
