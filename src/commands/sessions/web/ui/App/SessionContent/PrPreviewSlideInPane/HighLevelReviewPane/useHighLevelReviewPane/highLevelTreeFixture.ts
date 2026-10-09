import type {
	HighLevelTreeFile,
	HighLevelTreeNode,
} from "../../../../../../../../review/highLevel/types";

function highLevelTreeFile(path: string): HighLevelTreeFile {
	return {
		kind: "file",
		name: path.split("/").at(-1) ?? path,
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://github.com/o/r/pull/1/files#${path}`,
		patch: `@@ -1 +1 @@\n-const was = "${path}";\n+const now = "${path}";`,
	};
}

export const highLevelTreeFixture: HighLevelTreeNode[] = [
	{
		kind: "dir",
		name: "src",
		path: "src",
		additions: 2,
		deletions: 2,
		children: [
			{
				kind: "dir",
				name: "lib",
				path: "src/lib",
				additions: 1,
				deletions: 1,
				children: [highLevelTreeFile("src/lib/util.ts")],
			},
			highLevelTreeFile("src/app.ts"),
		],
	},
	highLevelTreeFile("README.md"),
];
