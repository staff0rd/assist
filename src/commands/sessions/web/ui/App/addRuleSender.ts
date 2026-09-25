import {
	type AddRuleRequest,
	formatAddRuleCommand,
} from "./formatAddRuleCommand";
import { pasteAndSubmit } from "./pasteAndSubmit";
import type { SessionInfo } from "../types";

export function addRuleSender(
	session: SessionInfo,
	sendInput: (sessionId: string, data: string) => void,
	onSent: () => void,
): (request: AddRuleRequest) => void {
	return (request) => {
		pasteAndSubmit(sendInput, session.id, formatAddRuleCommand(request));
		onSent();
	};
}
