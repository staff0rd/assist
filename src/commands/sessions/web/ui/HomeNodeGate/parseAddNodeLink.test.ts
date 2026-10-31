import { describe, expect, it } from "vitest";
import { addNodeLink } from "../addNodeLink";
import { parseAddNodeLink } from "./parseAddNodeLink";

describe("parseAddNodeLink", () => {
	it("round-trips a link built by addNodeLink", () => {
		const link = addNodeLink("https://pc.tail1234.ts.net:4100", "pc-wsl");
		expect(parseAddNodeLink(link)).toEqual({
			ok: true,
			node: { name: "pc-wsl", url: "https://pc.tail1234.ts.net:4100" },
		});
	});

	it("normalises the node URL to its origin", () => {
		const result = parseAddNodeLink(
			"assist://add-node?url=https%3A%2F%2Fpc.ts.net%3A4100%2Fsessions%2F&name=pc",
		);
		expect(result).toEqual({
			ok: true,
			node: { name: "pc", url: "https://pc.ts.net:4100" },
		});
	});

	it("defaults the name from the host when missing or blank", () => {
		for (const name of ["", "&name=%20%20"]) {
			const result = parseAddNodeLink(
				`assist://add-node?url=https%3A%2F%2Fpc.tail1234.ts.net${name}`,
			);
			expect(result).toEqual({
				ok: true,
				node: { name: "pc", url: "https://pc.tail1234.ts.net" },
			});
		}
	});

	it.each([
		["not a URL", "not a link"],
		["another scheme", "https://add-node?url=https%3A%2F%2Fpc.ts.net"],
		["another action", "assist://remove-node?url=https%3A%2F%2Fpc.ts.net"],
		["an extra path", "assist://add-node/x?url=https%3A%2F%2Fpc.ts.net"],
		["no url", "assist://add-node?name=pc"],
		["a non-http url", "assist://add-node?url=ftp%3A%2F%2Fpc.ts.net"],
		["an unparseable url", "assist://add-node?url=https%3A%2F%2F%5B"],
	])("rejects %s", (_, link) => {
		expect(parseAddNodeLink(link)).toMatchObject({ ok: false });
	});
});
