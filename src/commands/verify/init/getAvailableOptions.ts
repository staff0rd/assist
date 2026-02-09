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

export function getAvailableOptions(setup: ExistingSetup): VerifyOption[] {
	const options: VerifyOption[] = [];

	if (needsSetup(setup.knip)) {
		options.push({
			name: `knip${getStatusLabel(setup.knip)}`,
			value: "knip",
			description: "Dead code and unused dependency detection",
		});
	}

	if (needsSetup(setup.biome)) {
		options.push({
			name: `lint${getStatusLabel(setup.biome)}`,
			value: "lint",
			description: "Code linting and formatting with Biome",
		});
	}

	if (needsSetup(setup.jscpd)) {
		options.push({
			name: `duplicate-code${getStatusLabel(setup.jscpd)}`,
			value: "duplicate-code",
			description: "Duplicate code detection with jscpd",
		});
	}

	if (needsSetup(setup.test) && setup.test.hasPackage) {
		options.push({
			name: `test${getStatusLabel(setup.test)}`,
			value: "test",
			description: "Run tests with vitest",
		});
	}

	if (needsSetup(setup.build) && (setup.hasTypescript || setup.hasVite)) {
		const description = setup.hasVite
			? setup.hasTypescript
				? "TypeScript + Vite build verification"
				: "Vite build verification"
			: "TypeScript type checking";
		options.push({
			name: `build${getStatusLabel(setup.build)}`,
			value: "build",
			description,
		});
	}

	if (needsSetup(setup.hardcodedColors)) {
		options.push({
			name: `hardcoded-colors${getStatusLabel(setup.hardcodedColors)}`,
			value: "hardcoded-colors",
			description: "Detect hardcoded hex colors (use open-color instead)",
		});
	}

	return options;
}
