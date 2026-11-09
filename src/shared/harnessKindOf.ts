import { type HarnessKind, harnesses } from "./harnesses";

export function harnessKindOf(value: unknown): HarnessKind | undefined {
	return typeof value === "string" && Object.hasOwn(harnesses, value)
		? (value as HarnessKind)
		: undefined;
}
