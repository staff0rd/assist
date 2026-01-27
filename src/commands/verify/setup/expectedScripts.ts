export const expectedScripts: Record<string, string> = {
	"verify:knip": "knip --no-progress --treat-config-hints-as-errors",
	"verify:lint": "biome check --write .",
	"verify:duplicate-code":
		"jscpd --format 'typescript,tsx' --exitCode 1 --ignore '**/*.test.*' -r consoleFull src",
	"verify:test": "vitest run --reporter=dot --silent",
	"verify:hardcoded-colors": "assist verify hardcoded-colors",
};
