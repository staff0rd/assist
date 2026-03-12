export const expectedScripts: Record<string, string> = {
	"verify:knip": "knip --no-progress --treat-config-hints-as-errors",
	"verify:lint": "biome check --write --error-on-warnings .",
	"verify:duplicate-code":
		"jscpd --format 'typescript,tsx' --exitCode 1 --ignore '**/*.test.*' -r consoleFull src",
	"verify:test": "vitest run --reporter=dot --silent",
	"verify:hardcoded-colors": "assist verify hardcoded-colors",
	"verify:no-venv": "assist verify no-venv",
	"verify:maintainability":
		"assist complexity maintainability ./src --threshold 60",
	"verify:madge":
		"madge --circular --ts-config ./tsconfig.json --extensions ts,tsx src/",
};
