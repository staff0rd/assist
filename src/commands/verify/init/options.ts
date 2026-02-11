import type { ExistingSetup } from "./detectExistingSetup";

export type OptionDef = {
	toolKey: keyof {
		[K in keyof ExistingSetup as ExistingSetup[K] extends { hasScript: boolean }
			? K
			: never]: true;
	};
	value: string;
	label: string;
	description: string | ((setup: ExistingSetup) => string);
	extraCondition?: (setup: ExistingSetup) => boolean;
};

function getBuildDescription(setup: ExistingSetup): string {
	if (setup.hasVite && setup.hasTypescript)
		return "TypeScript + Vite build verification";
	if (setup.hasVite) return "Vite build verification";
	return "Build verification";
}

export const options: OptionDef[] = [
	{
		toolKey: "knip",
		value: "knip",
		label: "knip",
		description: "Dead code and unused dependency detection",
	},
	{
		toolKey: "biome",
		value: "lint",
		label: "lint",
		description: "Code linting and formatting with Biome",
	},
	{
		toolKey: "jscpd",
		value: "duplicate-code",
		label: "duplicate-code",
		description: "Duplicate code detection with jscpd",
	},
	{
		toolKey: "hardcodedColors",
		value: "hardcoded-colors",
		label: "hardcoded-colors",
		description: "Detect hardcoded hex colors (use open-color instead)",
	},
	{
		toolKey: "test",
		value: "test",
		label: "test",
		description: "Run tests with vitest",
		extraCondition: (s) => s.test.hasPackage,
	},
	{
		toolKey: "build",
		value: "build",
		label: "build",
		description: getBuildDescription,
		extraCondition: (s) => s.hasTypescript || s.hasVite,
	},
	{
		toolKey: "typecheck",
		value: "typecheck",
		label: "typecheck",
		description: "TypeScript type checking",
		extraCondition: (s) => s.hasTypescript && !s.hasVite,
	},
	{
		toolKey: "maintainability",
		value: "maintainability",
		label: "maintainability",
		description: "Maintainability index threshold check",
	},
];
