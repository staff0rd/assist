import path from "node:path";
import { getDb } from "../../shared/db/getDb";
import { globalConfigFileLabel } from "../config/globalConfigFileLabel";
import { resolveSharedRepoBlock } from "../config/resolveSharedRepoBlock";
import { resolveRuleTarget } from "./resolveRuleTarget";
import type { UserRuleOptions } from "./userRuleOptionsError";

export async function describeRuleTarget(
	options: UserRuleOptions,
	globalConfigPath: string,
	cwd: string,
): Promise<string> {
	if (options.user) return "`advice.rules` in user (db)";
	if (options.node)
		return `\`advice.rules\` in user (node) (\`${globalConfigFileLabel(globalConfigPath)}\`)`;
	if (options.repo !== undefined) {
		const repoName =
			typeof options.repo === "string" ? options.repo : undefined;
		const { label } = await resolveSharedRepoBlock(
			await getDb(),
			repoName,
			cwd,
		);
		return `\`advice.rules\` in repo (db): \`${label}\``;
	}
	const { target, code } = resolveRuleTarget(options.scope);
	return `\`${path.relative(cwd, target) || target}\` as **${code}**`;
}
