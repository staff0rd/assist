import { homedir } from "node:os";
import { describe, expect, it } from "vitest";
import { parseIdentityAgent } from "./probeSshAgent";

describe("parseIdentityAgent", () => {
	it("expands ~ in the alias's IdentityAgent", () => {
		const config =
			"hostname 10.0.0.2\nidentityagent ~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock\n";
		expect(parseIdentityAgent(config)).toBe(
			`${homedir()}/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock`,
		);
	});

	it("resolves SSH_AUTH_SOCK and treats none as unset", () => {
		expect(
			parseIdentityAgent("identityagent SSH_AUTH_SOCK", {
				SSH_AUTH_SOCK: "/tmp/agent",
			}),
		).toBe("/tmp/agent");
		expect(parseIdentityAgent("identityagent none")).toBeUndefined();
		expect(parseIdentityAgent("hostname pc")).toBeUndefined();
	});
});
