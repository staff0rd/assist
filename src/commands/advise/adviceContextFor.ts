import { sdkAgentEnv } from "../../shared/sdkAgentEnv";
import { findConfigUp, loadConfigFrom } from "../../shared/loadConfigFrom";
import { previewAnswerWaitBlocker } from "../askQuestion/previewAnswerWaitBlocker";
import type { AdviceContext } from "./AdviceContext";

export function adviceContextFor(
	cwd: string,
	env: NodeJS.ProcessEnv = process.env,
): AdviceContext {
	return {
		config: loadConfigFrom(cwd),
		rootDir: findConfigUp(cwd)?.rootDir ?? cwd,
		assistSession: env.ASSIST_SESSION === "1",
		previewAnswerWait: previewAnswerWaitBlocker() === undefined,
		sdkSession: env[sdkAgentEnv] === "1",
	};
}
