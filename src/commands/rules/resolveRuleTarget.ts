import path from "node:path";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { nextRuleCode } from "./nextRuleCode";
import { resolveRuleScope } from "./resolveRuleScope";

type RuleTarget = { target: string; root: string; code: string };

export function resolveRuleTarget(scope: string | undefined): RuleTarget {
	const target = resolveRuleScope(scope ?? process.cwd());
	const targetDir = path.dirname(target);
	const root = findRepoRoot(targetDir) ?? targetDir;
	return { target, root, code: nextRuleCode(root) };
}
