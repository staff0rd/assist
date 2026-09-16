import { describe, expect, it } from "vitest";
import { assistConfigSchema } from "../../shared/types";
import type { AdviceContext } from "./AdviceContext";
import type { AdviceFragment } from "./parseAdviceFragment";
import { renderAdviceBody } from "./renderAdviceBody";

function contextWith(raw: Record<string, unknown>): AdviceContext {
	return { config: assistConfigSchema.parse(raw), rootDir: "/repo" };
}

function fragment(name: string, body: string): AdviceFragment {
	return { name, title: name, when: "always", body };
}

describe("renderAdviceBody", () => {
	it("interpolates the repo's verify run commands", () => {
		const body = renderAdviceBody(
			fragment("verify", "Runs {{verifyCommands}} in parallel."),
			contextWith({
				run: [
					{ name: "verify:lint", command: "oxlint" },
					{ name: "verify:test", command: "vitest" },
					{ name: "dev", command: "vite" },
				],
			}),
		);

		expect(body).toBe("Runs `verify:lint`, `verify:test` in parallel.");
	});

	it("leaves a body with no placeholders untouched", () => {
		expect(
			renderAdviceBody(
				fragment("markdown", "Do not hard-wrap."),
				contextWith({}),
			),
		).toBe("Do not hard-wrap.");
	});

	it("rejects a placeholder naming an unregistered variable", () => {
		expect(() =>
			renderAdviceBody(fragment("odd", "{{nonsense}}"), contextWith({})),
		).toThrow('unknown variable "nonsense"');
	});

	it("replaces the verify body with advice.verify when it is set", () => {
		const body = renderAdviceBody(
			fragment("verify", "Runs {{verifyCommands}}."),
			contextWith({ advice: { verify: "Run `make check`.\n" } }),
		);

		expect(body).toBe("Run `make check`.");
	});
});
