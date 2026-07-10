import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./launchMode", () => ({
	launchMode: vi.fn(),
}));

vi.mock("./loadItem", () => ({
	loadItem: vi.fn(),
}));

vi.mock("./shared", () => ({
	getReady: vi.fn().mockResolvedValue({ orm: {} }),
}));

vi.mock("./loadBacklogSummaries", () => ({
	loadBacklogSummaries: vi.fn(),
}));

import { launchMode } from "./launchMode";
import { loadItem } from "./loadItem";
import { refine } from "./refine";

const mockLaunchMode = launchMode as unknown as MockInstance;
const mockLoadItem = loadItem as unknown as MockInstance;

describe("refine", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("emits the item id and name on the launched activity", async () => {
		mockLoadItem.mockResolvedValue({ id: 254, name: "Add refine mode button" });

		await refine("a254", { once: true });

		expect(mockLoadItem).toHaveBeenCalledWith({}, 254);
		expect(mockLaunchMode).toHaveBeenCalledWith("refine a254", {
			once: true,
			itemId: 254,
			itemName: "Add refine mode button",
		});
	});

	it("launches without an item id when the item cannot be loaded", async () => {
		mockLoadItem.mockResolvedValue(undefined);

		await refine("a999");

		expect(mockLaunchMode).toHaveBeenCalledWith("refine a999", {
			itemId: undefined,
			itemName: undefined,
		});
	});
});
