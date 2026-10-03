import type * as fs from "node:fs";
import { vi } from "vitest";
import { mockFunctions } from "./mockFunctions";

export async function fsMock() {
	return mockFunctions(await vi.importActual<typeof fs>("node:fs"));
}
