import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveSelection } from "./ActiveSelection";
import {
	loadActiveSelection,
	saveActiveSelection,
} from "./loadActiveSelection";

vi.mock("./loadActiveSelection", () => ({
	loadActiveSelection: vi.fn(() => ({})),
	saveActiveSelection: vi.fn(),
}));

const loadMock = loadActiveSelection as unknown as ReturnType<typeof vi.fn>;
const saveMock = saveActiveSelection as unknown as ReturnType<typeof vi.fn>;

describe("ActiveSelection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("set", () => {
		it("persists the updated map", () => {
			new ActiveSelection(() => {}).set("/repo", "2");
			expect(saveMock).toHaveBeenCalledWith({ "/repo": "2" });
		});

		it("notifies on change", () => {
			const onChange = vi.fn();
			new ActiveSelection(onChange).set("/repo", "2");
			expect(onChange).toHaveBeenCalledOnce();
		});

		it("moves the most recently selected repo to last", () => {
			const selection = new ActiveSelection(() => {});
			selection.set("/a", "1");
			selection.set("/b", "2");
			selection.set("/a", "3");
			expect(Object.keys(selection.toJSON())).toEqual(["/b", "/a"]);
		});

		describe("when the cwd is empty", () => {
			it("does not persist", () => {
				new ActiveSelection(() => {}).set("", "2");
				expect(saveMock).not.toHaveBeenCalled();
			});
		});
	});

	describe("restore", () => {
		it("loads persisted selections whose session is still live", () => {
			loadMock.mockReturnValue({ "/repo": "2", "/other": "5" });
			const selection = new ActiveSelection(() => {});

			selection.restore((id) => id === "2");

			expect(selection.toJSON()).toEqual({ "/repo": "2" });
		});

		describe("when no persisted session resolves", () => {
			it("restores nothing", () => {
				loadMock.mockReturnValue({ "/repo": "9" });
				const selection = new ActiveSelection(() => {});

				selection.restore(() => false);

				expect(selection.toJSON()).toEqual({});
			});
		});
	});
});
