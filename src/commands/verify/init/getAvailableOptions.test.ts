import { describe, expect, it, vi } from "vitest";

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => ({ run: mockRunEntries }),
}));

let mockRunEntries: { name: string; command: string }[] = [];

import { detectExistingSetup } from "./detectExistingSetup";
import { getAvailableOptions } from "./getAvailableOptions";

function auditOption() {
	return getAvailableOptions(detectExistingSetup({})).find(
		(o) => o.value === "audit",
	);
}

describe("getAvailableOptions audit", () => {
	it("offers audit when verify:audit is not configured", () => {
		mockRunEntries = [];
		expect(auditOption()).toMatchObject({
			name: "audit",
			value: "audit",
			description: "Dependency security advisories via pnpm/npm audit",
		});
	});

	it("does not offer audit when assist.yml has a verify:audit entry", () => {
		mockRunEntries = [{ name: "verify:audit", command: "assist verify audit" }];
		expect(auditOption()).toBeUndefined();
	});
});
