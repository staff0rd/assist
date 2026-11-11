import { describe, expect, it } from "vitest";
import { linkStatusQuery } from "./linkStatusQuery";

describe("linkStatusQuery", () => {
	it("aliases one issueOrPullRequest lookup per ref", () => {
		const { query, variables } = linkStatusQuery([
			{ owner: "a", repo: "b", number: 1 },
			{ owner: "c", repo: "d", number: 2 },
		]);
		expect(query).toContain("i0: repository(owner: $o0, name: $r0)");
		expect(query).toContain("i1: repository(owner: $o1, name: $r1)");
		expect(query.match(/issueOrPullRequest/g)).toHaveLength(2);
		expect(variables).toEqual({
			o0: "a",
			r0: "b",
			n0: 1,
			o1: "c",
			r1: "d",
			n1: 2,
		});
	});
});
