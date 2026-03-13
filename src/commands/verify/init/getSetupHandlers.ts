import type { ScriptWriter } from "../installPackage";
import {
	setupBuild,
	setupDuplicateCode,
	setupHardcodedColors,
	setupKnip,
	setupLint,
	setupMadge,
	setupMaintainability,
	setupTest,
	setupTypecheck,
} from "../setup";

export type SetupHandler = (
	packageJsonPath: string,
	writer: ScriptWriter,
	...args: boolean[]
) => Promise<void>;

export function getSetupHandlers(
	hasVite: boolean,
	hasTypescript: boolean,
	hasOpenColor: boolean,
): Record<string, SetupHandler> {
	return {
		knip: (p, w) => setupKnip(p, w),
		lint: (p, w) => setupLint(p, w),
		"duplicate-code": (p, w) => setupDuplicateCode(p, w),
		test: (p, w) => setupTest(p, w),
		build: (p, w) => setupBuild(p, w, hasVite, hasTypescript),
		typecheck: (p, w) => setupTypecheck(p, w),
		"hardcoded-colors": (p, w) => setupHardcodedColors(p, w, hasOpenColor),
		madge: (p, w) => setupMadge(p, w),
		maintainability: (p, w) => setupMaintainability(p, w),
	};
}
