import {
	type ExistingSetup,
	getStatusLabel,
	needsSetup,
} from "./detectExistingSetup";

type VerifyOption = {
	name: string;
	value: string;
	description: string;
};

function getBuildDescription(setup: ExistingSetup): string {
	if (setup.hasVite && setup.hasTypescript)
		return "TypeScript + Vite build verification";
	if (setup.hasVite) return "Vite build verification";
	return "TypeScript type checking";
}

function shouldInclude(setup: ExistingSetup, def: OptionDef): boolean {
	return needsSetup(setup[def.toolKey]) && (def.extraCondition ?? true);
}

function toVerifyOption(setup: ExistingSetup, def: OptionDef): VerifyOption {
	return {
		name: `${def.label}${getStatusLabel(setup[def.toolKey])}`,
		value: def.value,
		description: def.description,
	};
}

type OptionDef = {
	toolKey: "knip" | "biome" | "jscpd" | "test" | "build" | "hardcodedColors";
	value: string;
	label: string;
	description: string;
	extraCondition?: boolean;
};

const STATIC_OPTIONS: OptionDef[] = [
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
];

function getConditionalOptions(setup: ExistingSetup): OptionDef[] {
	return [
		{
			toolKey: "test",
			value: "test",
			label: "test",
			description: "Run tests with vitest",
			extraCondition: setup.test.hasPackage,
		},
		{
			toolKey: "build",
			value: "build",
			label: "build",
			description: getBuildDescription(setup),
			extraCondition: setup.hasTypescript || setup.hasVite,
		},
	];
}

function getAllOptionDefs(setup: ExistingSetup): OptionDef[] {
	return [...STATIC_OPTIONS, ...getConditionalOptions(setup)];
}

export function getAvailableOptions(setup: ExistingSetup): VerifyOption[] {
	return getAllOptionDefs(setup)
		.filter((def) => shouldInclude(setup, def))
		.map((def) => toVerifyOption(setup, def));
}
