import { awaitHarness } from "../../shared/awaitHarness";
import { emitActivity } from "../../shared/emitActivity";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { preassignedId } from "../../shared/harnessAdapters/preassignedId";
import type { HarnessKind } from "../../shared/harnesses";
import { checkoutPr } from "./checkoutPr";

type CheckoutSession = {
	harness?: HarnessKind;
	skill?: { name: string; args: string };
};

export async function checkoutPrSession(
	number: string,
	{ harness, skill }: CheckoutSession = {},
): Promise<void> {
	await checkoutPr(number);
	const adapter = harnessAdapter(harness);
	const conversationId = preassignedId(adapter);
	emitActivity({
		kind: "command",
		name: "review",
		...adapter.activityIdentity(conversationId),
	});
	const options = { conversationId, cwd: process.cwd(), allowEdits: true };
	const { done } = skill
		? adapter.launchSkill(skill.name, skill.args, options)
		: adapter.launchPrompt("", options);
	await awaitHarness(done, `PR #${number}`, adapter.label);
}
