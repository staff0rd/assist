import path from "node:path";

const TEST_SUFFIX = /\.test\.tsx?$/;

export function isTestFile(file: string): boolean {
	return TEST_SUFFIX.test(file);
}

export function testStem(file: string): string {
	return path.basename(file).replace(TEST_SUFFIX, "");
}
