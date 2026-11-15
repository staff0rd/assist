import { harnessKinds } from "./harnessKinds";
import type { HarnessKind } from "./harnesses";

export function isHarnessKind(value: unknown): value is HarnessKind {
	return (harnessKinds as readonly unknown[]).includes(value);
}
