import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConsume = vi.fn();

vi.mock("../dbMigration/consumeMigrationApproval", () => ({
	consumeMigrationApproval: (...args: unknown[]) => mockConsume(...args),
}));

import { decideMigrationGuard } from "./decideMigrationGuard";

function writeInput(filePath: string) {
	return {
		tool_name: "Write",
		tool_input: { file_path: filePath, content: "export const x = 1;\n" },
	};
}

describe("decideMigrationGuard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockConsume.mockReturnValue(false);
	});

	it("denies a Write creating a new numbered migration module", () => {
		const reason = decideMigrationGuard(
			writeInput("src/shared/db/migrations/migration0008Foo.ts"),
			undefined,
		);
		expect(reason).toContain("db-migration unlock");
		expect(reason).toContain("migration 8");
		expect(mockConsume).toHaveBeenCalledWith(8);
	});

	it("denies for an absolute migration path", () => {
		const reason = decideMigrationGuard(
			writeInput("/home/me/repo/src/shared/db/migrations/migration0012Bar.ts"),
			undefined,
		);
		expect(reason).toContain("migration 12");
	});

	it("allows and consumes the approval when one exists", () => {
		mockConsume.mockReturnValue(true);
		const reason = decideMigrationGuard(
			writeInput("src/shared/db/migrations/migration0008Foo.ts"),
			undefined,
		);
		expect(reason).toBeUndefined();
		expect(mockConsume).toHaveBeenCalledWith(8);
	});

	it("ignores an edit to an existing migration (existing content present)", () => {
		const reason = decideMigrationGuard(
			writeInput("src/shared/db/migrations/migration0007GithubIssue.ts"),
			"export const migration0007GithubIssue = {};\n",
		);
		expect(reason).toBeUndefined();
		expect(mockConsume).not.toHaveBeenCalled();
	});

	it("ignores the migrations index.ts", () => {
		const reason = decideMigrationGuard(
			writeInput("src/shared/db/migrations/index.ts"),
			undefined,
		);
		expect(reason).toBeUndefined();
		expect(mockConsume).not.toHaveBeenCalled();
	});

	it("ignores files outside the migrations directory", () => {
		const reason = decideMigrationGuard(
			writeInput("src/shared/db/migration0008Elsewhere.ts"),
			undefined,
		);
		expect(reason).toBeUndefined();
		expect(mockConsume).not.toHaveBeenCalled();
	});

	it("ignores an Edit tool call", () => {
		const reason = decideMigrationGuard(
			{
				tool_name: "Edit",
				tool_input: {
					file_path: "src/shared/db/migrations/migration0008Foo.ts",
					old_string: "a",
					new_string: "b",
				},
			},
			undefined,
		);
		expect(reason).toBeUndefined();
		expect(mockConsume).not.toHaveBeenCalled();
	});
});
