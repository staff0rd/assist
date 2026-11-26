const EXAMPLE = {
	slices: [
		{
			title: "Short imperative title",
			summary: "One or two sentences on what the slice changes.",
			hunks: ["path/to/file.ts#0"],
		},
	],
	manualTesting: {
		setup: ["Restart the web server"],
		steps: [
			{
				action: "Open http://localhost:3000/settings",
				expect: "The new toggle shows under Display",
			},
		],
	},
	tests: {
		"path/to/file.test.ts": [
			{
				describe: "unitUnderTest",
				children: [
					{
						describe: "when the input is empty",
						children: [
							{ id: "path/to/file.test.ts:12", it: "returns no rows" },
						],
					},
				],
			},
		],
	},
};

export function slicingRequestExample(withTests: boolean) {
	if (withTests) return EXAMPLE;
	const { tests: _tests, ...rest } = EXAMPLE;
	return rest;
}
