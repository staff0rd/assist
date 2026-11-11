import { connectBrowserLink } from "../browserLink/connectBrowserLink";
import { storeConsoleEntries } from "../consoleCapture/storeConsoleEntries";
import { isDocsFeedbackMessage } from "../docsFeedback/isDocsFeedbackMessage";
import { postDocsFeedback } from "../docsFeedback/postDocsFeedback";
import { fetchLinkStatus } from "../linkStatus/fetchLinkStatus";
import { isLinkStatusMessage } from "../linkStatus/isLinkStatusMessage";
import { assistServerUrl } from "./assistServerUrl";
import { fetchAssistClones } from "./fetchAssistClones";
import { fetchAssistHarness } from "./fetchAssistHarness";
import { isAssistClonesMessage } from "./isAssistClonesMessage";
import { isAssistHarnessMessage } from "./isAssistHarnessMessage";
import { isAssistSendMessage } from "./isAssistSendMessage";
import { extensionAction } from "./extensionAction";
import { extensionRuntime } from "./extensionRuntime";
import { postToAssist } from "./postToAssist";

export function assistBackground(): void {
	extensionRuntime()?.onMessage.addListener((message) => {
		if (isAssistSendMessage(message))
			return assistServerUrl().then((server) => postToAssist(server, message));
		if (isAssistClonesMessage(message))
			return assistServerUrl().then(fetchAssistClones);
		if (isAssistHarnessMessage(message))
			return assistServerUrl().then(fetchAssistHarness);
		if (isDocsFeedbackMessage(message))
			return assistServerUrl().then((server) =>
				postDocsFeedback(server, message),
			);
		if (isLinkStatusMessage(message))
			return assistServerUrl().then((server) =>
				fetchLinkStatus(server, message),
			);
		return undefined;
	});
	extensionAction()?.onClicked.addListener(() => {
		void extensionRuntime()?.openOptionsPage?.();
	});
}

assistBackground();
connectBrowserLink();
storeConsoleEntries();
