import type { CallExpression } from "ts-morph";
import type { HighLevelTestCase } from "./types";
import { dedentedSource } from "./dedentedSource";
import { testName } from "./testName";

export function visitCase(
	call: CallExpression,
	path: string,
): HighLevelTestCase {
	const line = call.getStartLineNumber();
	return {
		kind: "it",
		id: `${path}:${line}`,
		name: testName(call),
		line,
		source: dedentedSource(call),
	};
}
