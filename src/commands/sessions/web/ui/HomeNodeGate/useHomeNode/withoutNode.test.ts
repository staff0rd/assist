import { describe, expect, it } from "vitest";
import { withoutNode } from "./withoutNode";

const mac = { name: "Mac", url: "https://mac.ts.net:3100" };
const win = { name: "Win", url: "https://win.ts.net:3100" };

describe("withoutNode", () => {
	it("keeps the home node when removing another node", () => {
		expect(
			withoutNode({ nodes: [mac, win], homeUrl: mac.url }, win.url),
		).toEqual({ nodes: [mac], homeUrl: mac.url });
	});

	it("makes another saved node home when removing the home node", () => {
		expect(
			withoutNode({ nodes: [mac, win], homeUrl: mac.url }, mac.url),
		).toEqual({ nodes: [win], homeUrl: win.url });
	});

	it("clears the home node when removing the only saved node", () => {
		expect(withoutNode({ nodes: [mac], homeUrl: mac.url }, mac.url)).toEqual({
			nodes: [],
			homeUrl: undefined,
		});
	});
});
