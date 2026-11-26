import { flattenTestCases } from "./flattenTestCases";
import type { HighLevelTestFile } from "./types";

const TEST_RULES = [
	"Regroup every changed test listed below, within its own file, as a reading aid for the reviewer. The test code is never changed.",
	"Key `tests` by file path. Each file holds `{describe, children}` groups and `{id, it}` tests, nested as deep as needed.",
	"Keep a file's outer describes (usually the unit under test), then group its tests under `when …` describes naming the condition each test sets up.",
	"Give each test an `it` name stating only the claim it checks, without the condition already in its `when` group.",
	"Tests already in when/it shape keep their describes and names as written.",
	"Refer to each test by its id. A changed test you leave out is shown under Ungrouped with its name as written.",
];

export function formatChangedTests(tests: HighLevelTestFile[]): string[] {
	const cases = tests.flatMap((file) => flattenTestCases(file.tests));
	return [
		"",
		"Test regrouping rules:",
		...TEST_RULES.map((rule) => `- ${rule}`),
		"",
		`Changed tests (${cases.length}):`,
		...cases.map(({ test, suites }) =>
			[`- ${test.id}`, ...suites.map((suite) => suite.name), test.name].join(
				" › ",
			),
		),
	];
}
