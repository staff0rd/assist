import { randomUUID } from "node:crypto";
import chalk from "chalk";
import { isAgentHarness } from "../../../lib/isAgentHarness";
import { renderMarkdownTerminal } from "../../../shared/renderMarkdownTerminal";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { formatItemId } from "../formatItemId";
import type { ProposedItem } from "./proposedItemSchema";
import { renderProposedItem } from "./renderProposedItem";
import { type StartApproval, toStartApproval } from "./toStartApproval";

export async function reviewProposal(
	item: ProposedItem,
	sessionId: string | undefined,
	confirmed: boolean,
	revises?: number,
): Promise<StartApproval | null> {
	const body = renderProposedItem(item);

	if (sessionId) {
		const decision = await awaitPreviewApproval("Backlog item preview", {
			sessionId,
			requestId: randomUUID(),
			title:
				revises === undefined
					? item.name
					: `Update ${formatItemId(revises)}: ${item.name}`,
			body,
			prNumber: null,
			kind: "backlog-item",
			itemType: item.type,
			canStart: true,
		});
		return toStartApproval(decision);
	}

	if (isAgentHarness() && confirmed) return { autostart: false };

	console.log(chalk.bold(item.name));
	console.log(renderMarkdownTerminal(body));

	if (!isAgentHarness()) return { autostart: false };

	console.log(
		chalk.yellow(
			"Draft only — nothing was written to the backlog. Show this draft in the chat, apply any changes the user asks for, then re-run 'assist backlog propose --json <file|->' with --confirmed to create the item.",
		),
	);
	return null;
}
