import { vi } from "vitest";
import type * as loadConfigModule from "../../shared/loadConfig";
import { makeAssistConfig } from "../mothers/makeAssistConfig";

export function loadConfigMock(): typeof loadConfigModule {
	return {
		getProjectRoot: vi.fn(() => "/project"),
		loadConfig: vi.fn(() => makeAssistConfig()),
		loadProjectConfig: vi.fn(() => ({})),
		loadGlobalConfigRaw: vi.fn(() => ({})),
		saveGlobalConfig: vi.fn(),
		saveConfig: vi.fn(),
		getTranscriptConfig: vi.fn(),
	};
}
