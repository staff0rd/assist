import { describe, expect, it } from "vitest";
import { describeConfigNode } from "./describeConfigNode";
import { findConfigNode } from "./findConfigNode";
import { SECRET_MASK } from "./maskConfigSecrets";
import { parseConfigPath } from "./parseConfigPath";
import { scrubConfigSecrets } from "./scrubConfigSecrets";
import { assistConfigSchema } from "./types";

const schemaNode = describeConfigNode(assistConfigSchema);

function nodeAt(key: string) {
	const path = parseConfigPath(key);
	if (!path) throw new Error(`bad path ${key}`);
	return findConfigNode(schemaNode, path);
}

describe("scrubConfigSecrets", () => {
	it("masks a secret nested inside an array of objects", () => {
		const value = [{ name: "local", user: "sa", password: "hunter2" }];

		const scrubbed = scrubConfigSecrets(
			["sql.connections[0]: hunter2 is not a valid password"],
			value,
			nodeAt("sql.connections"),
		);

		expect(scrubbed).toEqual([
			`sql.connections[0]: ${SECRET_MASK} is not a valid password`,
		]);
	});

	it("masks a secret addressed directly by its node", () => {
		const scrubbed = scrubConfigSecrets(
			["database.url: postgres://u:pw@host/db is malformed"],
			"postgres://u:pw@host/db",
			nodeAt("database.url"),
		);

		expect(scrubbed).toEqual([`database.url: ${SECRET_MASK} is malformed`]);
	});

	it("masks the JSON-encoded form of a secret", () => {
		const secret = 'he said "hunter2"';

		const scrubbed = scrubConfigSecrets(
			[`database.url: got ${JSON.stringify(secret)}`],
			secret,
			nodeAt("database.url"),
		);

		expect(scrubbed).toEqual([`database.url: got "${SECRET_MASK}"`]);
	});

	it("leaves messages alone when the value carries no secret", () => {
		const messages = ["sessions.maxLive: expected a number"];

		expect(scrubConfigSecrets(messages, "soon", nodeAt("commit.push"))).toEqual(
			messages,
		);
	});

	it("leaves non-secret siblings visible", () => {
		const value = [{ name: "local", user: "sa", password: "hunter2" }];

		const scrubbed = scrubConfigSecrets(
			["sql.connections[0].user: sa is not allowed"],
			value,
			nodeAt("sql.connections"),
		);

		expect(scrubbed).toEqual(["sql.connections[0].user: sa is not allowed"]);
	});
});
