import type { ConversationTarget } from "../../../../shared/sessionConversationTarget";
import { useApiNode } from "../../useApiNode";
import { useDiffPanels } from "../useDiffPanels";

export function useOpenDiffPanel(
	panelSessionId: string,
	cwd: string,
	conversation: ConversationTarget | undefined,
): (scope: string) => void {
	const { togglePanel } = useDiffPanels();
	const node = useApiNode();
	return (scope) =>
		togglePanel(panelSessionId, { cwd, conversation, scope, node });
}
