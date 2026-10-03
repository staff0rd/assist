import type * as childProcess from "node:child_process";
import { vi } from "vitest";
import { mockFunctions } from "./mockFunctions";

export async function childProcessMock() {
	return mockFunctions(
		await vi.importActual<typeof childProcess>("node:child_process"),
	);
}
