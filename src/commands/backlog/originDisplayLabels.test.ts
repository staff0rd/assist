import { describe, expect, it } from "vitest";
import { originDisplayLabels } from "./originDisplayLabels";

describe("originDisplayLabels", () => {
	it("shows the bare repo name when it is unique across remotes", () => {
		const labels = originDisplayLabels([
			"github.com/org/alpha",
			"github.com/org/beta",
		]);
		expect(labels.get("github.com/org/alpha")).toBe("alpha");
		expect(labels.get("github.com/org/beta")).toBe("beta");
	});

	it("falls back to org/repo when two remotes share a repo name", () => {
		const labels = originDisplayLabels([
			"github.com/orgA/shared",
			"github.com/orgB/shared",
			"github.com/orgA/unique",
		]);
		expect(labels.get("github.com/orgA/shared")).toBe("orgA/shared");
		expect(labels.get("github.com/orgB/shared")).toBe("orgB/shared");
		// The non-colliding remote keeps its bare name.
		expect(labels.get("github.com/orgA/unique")).toBe("unique");
	});

	it("decides collisions across the full set, not per item", () => {
		// `shared` collides; both colliding entries must disambiguate even though
		// each appears once in isolation.
		const labels = originDisplayLabels([
			"github.com/orgA/shared",
			"gitlab.com/team/shared",
		]);
		expect(labels.get("github.com/orgA/shared")).toBe("orgA/shared");
		expect(labels.get("gitlab.com/team/shared")).toBe("team/shared");
	});

	it("always shows the bare segment for local origins, even on collision", () => {
		const labels = originDisplayLabels([
			"local:/path/to/assist",
			"github.com/org/assist",
		]);
		// Local stays bare regardless of the remote sharing the same name.
		expect(labels.get("local:/path/to/assist")).toBe("assist");
		// The remote does not collide with a local, so it also stays bare.
		expect(labels.get("github.com/org/assist")).toBe("assist");
	});

	it("does not let local names trigger remote disambiguation", () => {
		const labels = originDisplayLabels([
			"local:/a/repo",
			"local:/b/repo",
			"github.com/org/repo",
		]);
		expect(labels.get("local:/a/repo")).toBe("repo");
		expect(labels.get("local:/b/repo")).toBe("repo");
		expect(labels.get("github.com/org/repo")).toBe("repo");
	});

	it("disambiguates remotes that collide with each other while locals stay bare", () => {
		const labels = originDisplayLabels([
			"github.com/orgA/repo",
			"github.com/orgB/repo",
			"local:/path/repo",
		]);
		expect(labels.get("github.com/orgA/repo")).toBe("orgA/repo");
		expect(labels.get("github.com/orgB/repo")).toBe("orgB/repo");
		expect(labels.get("local:/path/repo")).toBe("repo");
	});
});
