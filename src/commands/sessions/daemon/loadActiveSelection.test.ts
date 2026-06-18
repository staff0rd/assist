import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadJson, saveJson } from "../../../shared/loadJson";
import {
	loadActiveSelection,
	saveActiveSelection,
} from "./loadActiveSelection";

vi.mock("../../../shared/loadJson", () => ({
	loadJson: vi.fn(),
	saveJson: vi.fn(),
}));

const loadJsonMock = loadJson as unknown as ReturnType<typeof vi.fn>;
const saveJsonMock = saveJson as unknown as ReturnType<typeof vi.fn>;

describe("loadActiveSelection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns an empty map when the store file is missing", () => {
		loadJsonMock.mockReturnValue({});
		expect(loadActiveSelection()).toEqual({});
	});

	it("returns the persisted cwd→sessionId map", () => {
		loadJsonMock.mockReturnValue({ "/repo": "2", "/other": "5" });
		expect(loadActiveSelection()).toEqual({ "/repo": "2", "/other": "5" });
	});

	describe("when an entry has a non-string value", () => {
		it("returns an empty map", () => {
			loadJsonMock.mockReturnValue({ "/repo": 2 });
			expect(loadActiveSelection()).toEqual({});
		});
	});
});

describe("saveActiveSelection", () => {
	it("writes to active.json", () => {
		saveActiveSelection({ "/repo": "2" });
		expect(saveJsonMock).toHaveBeenCalledWith("active.json", { "/repo": "2" });
	});
});
