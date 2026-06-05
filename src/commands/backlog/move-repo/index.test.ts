import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type * as confirmMoveModule from "./confirmMove";

vi.mock("../shared", () => ({
	getOrigin: vi.fn(),
	getReady: vi.fn(),
}));

vi.mock("./confirmMove", async () => ({
	...(await vi.importActual<typeof confirmMoveModule>("./confirmMove")),
	confirmMove: vi.fn(),
}));

import type { BacklogOrm } from "../BacklogOrm";
import { items } from "../backlogSchema";
import { createTestDb } from "../createTestDb";
import { getOrigin, getReady } from "../shared";
import { confirmMove } from "./confirmMove";
import { moveRepo } from "./index";

const mockGetReady = getReady as unknown as MockInstance;
const mockGetOrigin = getOrigin as unknown as MockInstance;
const mockConfirmMove = confirmMove as unknown as MockInstance;

let orm: BacklogOrm;
let close: () => Promise<void>;

const OLD = "github.com/acme/space-glob-factory";
const NEW = "github.com/acme/asteroid-logistics";

async function originsById(): Promise<Record<number, string>> {
	const rows = await orm
		.select({ id: items.id, origin: items.origin })
		.from(items);
	return Object.fromEntries(rows.map((r) => [r.id, r.origin]));
}

describe("moveRepo", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		process.exitCode = undefined;
		({ orm, close } = await createTestDb());
		mockGetReady.mockResolvedValue({ orm });
		await orm.insert(items).values([
			{ id: 1, origin: OLD, name: "A", status: "todo" },
			{ id: 2, origin: OLD, name: "B", status: "done" },
			{ id: 3, origin: "github.com/acme/other", name: "C", status: "todo" },
		]);
	});

	afterEach(async () => {
		process.exitCode = undefined;
		await close();
	});

	it("retags exactly the items under the old origin", async () => {
		await moveRepo(OLD, NEW, { yes: true });

		expect(await originsById()).toEqual({
			1: NEW,
			2: NEW,
			3: "github.com/acme/other",
		});
		expect(process.exitCode).toBeUndefined();
	});

	it("normalizes both arguments so URL and git@ forms are accepted", async () => {
		await moveRepo(
			"https://GitHub.com/acme/space-glob-factory.git",
			"git@github.com:acme/asteroid-logistics.git",
			{ yes: true },
		);

		expect((await originsById())[1]).toBe(NEW);
	});

	it("infers the destination from the current repo when new-origin is omitted", async () => {
		mockGetOrigin.mockReturnValue(NEW);

		await moveRepo(OLD, undefined, { yes: true });

		expect(mockGetOrigin).toHaveBeenCalled();
		expect((await originsById())[1]).toBe(NEW);
	});

	it("resolves a bare repo name when it matches exactly one origin", async () => {
		await moveRepo("Space-Glob-Factory", NEW, { yes: true });

		expect(await originsById()).toEqual({
			1: NEW,
			2: NEW,
			3: "github.com/acme/other",
		});
		expect(process.exitCode).toBeUndefined();
	});

	it("errors when a bare repo name matches multiple origins", async () => {
		await orm.insert(items).values([
			{
				id: 4,
				origin: `gitlab.com/acme/${OLD.split("/").pop()}`,
				name: "D",
				status: "todo",
			},
		]);
		const consoleSpy = vi.spyOn(console, "log");

		await moveRepo("space-glob-factory", NEW, { yes: true });

		expect(process.exitCode).toBe(1);
		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain('Multiple origins match "space-glob-factory"');
		expect(output).toContain(OLD);
		expect(output).toContain("gitlab.com/acme/space-glob-factory");
		expect((await originsById())[1]).toBe(OLD);
		consoleSpy.mockRestore();
	});

	it("errors when no items exist under the old origin", async () => {
		const consoleSpy = vi.spyOn(console, "log");

		await moveRepo("github.com/acme/missing", NEW, { yes: true });

		expect(process.exitCode).toBe(1);
		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain(
			'No backlog items found under origin "github.com/acme/missing"',
		);
		consoleSpy.mockRestore();
	});

	it("rejects when a bare repo name resolves to the destination origin", async () => {
		const consoleSpy = vi.spyOn(console, "log");

		await moveRepo("space-glob-factory", `https://${OLD}.git`, { yes: true });

		expect(process.exitCode).toBe(1);
		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain(`both resolve to "${OLD}"`);
		expect((await originsById())[1]).toBe(OLD);
		consoleSpy.mockRestore();
	});

	it("rejects when old and new resolve to the same origin", async () => {
		const consoleSpy = vi.spyOn(console, "log");

		await moveRepo(
			`https://${OLD}.git`,
			`git@github.com:acme/space-glob-factory`,
		);

		expect(process.exitCode).toBe(1);
		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain(`both resolve to "${OLD}"`);
		expect((await originsById())[1]).toBe(OLD);
		consoleSpy.mockRestore();
	});

	it("prompts for confirmation and makes no changes when declined", async () => {
		mockConfirmMove.mockResolvedValue(false);

		await moveRepo(OLD, NEW);

		expect(mockConfirmMove).toHaveBeenCalledWith(2, OLD, NEW);
		expect((await originsById())[1]).toBe(OLD);
		expect(process.exitCode).toBeUndefined();
	});

	it("proceeds when the prompt is confirmed", async () => {
		mockConfirmMove.mockResolvedValue(true);

		await moveRepo(OLD, NEW);

		expect((await originsById())[1]).toBe(NEW);
	});

	it("skips the prompt with --yes", async () => {
		await moveRepo(OLD, NEW, { yes: true });

		expect(mockConfirmMove).not.toHaveBeenCalled();
	});
});
