import { resolveRunConfigs } from "../../shared/resolveRunConfigs";
import type { AdviceContext } from "./AdviceContext";

export function verifyRunCommandNames({
	config,
	rootDir,
}: AdviceContext): string[] {
	return resolveRunConfigs(config.run, rootDir)
		.map((entry) => entry.name)
		.filter((name) => name.startsWith("verify"));
}
