import { describe, expect, it } from "vitest";
import type { ReleaseStream } from "../../../../shared/types";
import { repoEnvironments } from "./repoEnvironments";

function stream(repo: string, environments: string[]): ReleaseStream {
	return {
		name: repo,
		repo,
		workflow: "release.yml",
		nodes: [
			{ id: "build", kind: "build" },
			...environments.map((environment) => ({ id: environment, environment })),
		],
		edges: [],
	};
}

describe("repoEnvironments", () => {
	it("unions the environments of every stream in a repo, sorted", () => {
		const environments = repoEnvironments([
			stream("owner/web", ["prod", "dev"]),
			stream("owner/web", ["app-dev", "dev"]),
			stream("owner/api", ["staging"]),
		]);

		expect(environments.get("owner/web")).toEqual(["app-dev", "dev", "prod"]);
		expect(environments.get("owner/api")).toEqual(["staging"]);
	});
});
