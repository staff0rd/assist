import type { Command } from "commander";
import { defaultTypeChain } from "./types";
import { lazyAction } from "../../../../shared/lazyAction";

const chain = defaultTypeChain.join(" > ");
const levels = defaultTypeChain.map((name) => name.toLowerCase()).join("|");

function collect(value: string, previous: string[]): string[] {
	return previous.concat([value]);
}

export function registerFixStructure(issueCommand: Command): void {
	issueCommand
		.command("fix-structure <target>")
		.description("Normalise the issue types across one issue subtree")
		.option(
			"-R, --repo <owner/repo>",
			"Repository a bare issue number belongs to",
		)
		.option(
			"--level <level>",
			"The target's own position in the type chain, when it cannot be inferred from its type",
		)
		.option(
			"--type-chain <names>",
			`Comma-separated issue type chain, parent level first (default: ${defaultTypeChain.join(",")})`,
		)
		.option(
			"--strip-label <label>",
			"Legacy marker label to remove from every issue in the subtree that carries it (repeatable)",
			collect,
			[],
		)
		.option("--apply", "Write the planned changes instead of reporting them")
		.addHelpText(
			"after",
			`\nWalks the subtree reachable from <target> via sub-issues and reports the type each issue should carry: every level below the target is typed to the next level down the chain. Nothing outside the subtree is ever read or written.\nThe chain defaults to ${chain} and --type-chain replaces it, so a backlog on other type names is normalised the same way; every level named must already exist as an issue type on the organisation, or the run fails listing the ones that do.\nThe target's own level is inferred from its issue type, so aiming at a story types its children as subtasks. When the target's type is not in the chain the level cannot be inferred, and --level ${levels} (or whichever levels --type-chain names) asserts it instead — which also plans the target's own type.\nNo label is touched unless --strip-label names it; each one is repeatable, matched case-insensitively, and removed by the label id found on that issue, since label ids differ per repository.\nThe target is owner/repo#number, a github.com issue URL, or a bare number with --repo.\nWithout --apply nothing is written. With --apply each write is announced before it is issued, and the subtree is re-walked afterwards so any residual drift fails the run.\nAnything nested below the leaf level fails the run before a single write, naming the offender and its parent.`,
		)
		.action(lazyAction(() => import("./fixStructure"), "fixStructure"));
}
