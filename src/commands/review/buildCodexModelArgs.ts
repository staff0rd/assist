import { loadConfig } from "../../shared/loadConfig";
import {
	buildLitellmCodexArgs,
	type CodexModelOverride,
} from "../litellm/buildLitellmCodexArgs";

export function buildCodexModelArgs(): CodexModelOverride {
	return buildLitellmCodexArgs(loadConfig().review?.codexModel);
}
