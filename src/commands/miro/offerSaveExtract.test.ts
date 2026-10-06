import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MiroExtractConfig } from "../../shared/types";
import { promptConfirm } from "../../shared/promptConfirm";
import { promptInput } from "../../shared/promptInput";
import { offerSaveExtract } from "./offerSaveExtract";
import { saveMiroExtract } from "./saveMiroExtract";

vi.mock("../../shared/promptConfirm", () => ({ promptConfirm: vi.fn() }));
vi.mock("../../shared/promptInput", () => ({ promptInput: vi.fn() }));
vi.mock("./saveMiroExtract", () => ({ saveMiroExtract: vi.fn() }));

const confirm = vi.mocked(promptConfirm);
const input = vi.mocked(promptInput);
const save = vi.mocked(saveMiroExtract);

const epics: MiroExtractConfig = {
	topLeft: "a",
	bottomRight: "b",
	items: "board-items.json",
};

const originalIsTTY = process.stdin.isTTY;
let logged: string[];

beforeEach(() => {
	logged = [];
	save.mockResolvedValue("/repo/assist.yml");
	vi.spyOn(console, "log").mockImplementation((line: unknown) => {
		logged.push(String(line));
	});
});

afterEach(() => {
	process.stdin.isTTY = originalIsTTY;
	vi.restoreAllMocks();
	vi.clearAllMocks();
});

describe("offerSaveExtract", () => {
	describe("when --save names the extract", () => {
		it("should save without asking and print the file written", async () => {
			process.stdin.isTTY = true;

			await offerSaveExtract(epics, { save: "epics" });

			expect(confirm).not.toHaveBeenCalled();
			expect(save).toHaveBeenCalledWith("epics", epics, { save: "epics" }, {});
			expect(logged.join("\n")).toContain(
				'Saved extract "epics" to /repo/assist.yml',
			);
		});
	});

	describe("when there is no terminal to ask on", () => {
		it("should save nothing", async () => {
			process.stdin.isTTY = false;

			await offerSaveExtract(epics, {});

			expect(confirm).not.toHaveBeenCalled();
			expect(save).not.toHaveBeenCalled();
		});
	});

	describe("when the offer is accepted", () => {
		it("should save under the name given", async () => {
			process.stdin.isTTY = true;
			confirm.mockResolvedValue(true);
			input.mockResolvedValue(" roadmap ");

			await offerSaveExtract(epics, { global: true });

			expect(save).toHaveBeenCalledWith("roadmap", epics, { global: true }, {});
		});
	});

	describe("when the offer is declined", () => {
		it("should not ask for a name", async () => {
			process.stdin.isTTY = true;
			confirm.mockResolvedValue(false);

			await offerSaveExtract(epics, {});

			expect(input).not.toHaveBeenCalled();
			expect(save).not.toHaveBeenCalled();
		});
	});

	describe("when the name is left blank", () => {
		it("should save nothing", async () => {
			process.stdin.isTTY = true;
			confirm.mockResolvedValue(true);
			input.mockResolvedValue("  ");

			await offerSaveExtract(epics, {});

			expect(save).not.toHaveBeenCalled();
		});
	});
});
