import { findConfigUp, loadConfigFrom } from "../../shared/loadConfigFrom";
import type { AdviceContext } from "./adviceConditions";

export function adviceContextFor(cwd: string): AdviceContext {
	return {
		config: loadConfigFrom(cwd),
		rootDir: findConfigUp(cwd)?.rootDir ?? cwd,
	};
}
