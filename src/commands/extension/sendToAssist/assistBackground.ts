import { connectBrowserLink } from "../browserLink/connectBrowserLink";
import { storeConsoleEntries } from "../consoleCapture/storeConsoleEntries";
import { isDocsFeedbackMessage } from "../docsFeedback/isDocsFeedbackMessage";
import { postDocsFeedback } from "../docsFeedback/postDocsFeedback";
import { assistServerUrl } from "./assistServerUrl";
import { fetchAssistClones } from "./fetchAssistClones";
import { isAssistClonesMessage } from "./isAssistClonesMessage";
import { isAssistSendMessage } from "./isAssistSendMessage";
import { extensionRuntime } from "./extensionRuntime";
import { postToAssist } from "./postToAssist";

export function assistBackground(): void {
	extensionRuntime()?.onMessage.addListener((message) => {
		if (isAssistSendMessage(message))
			return assistServerUrl().then((server) => postToAssist(server, message));
		if (isAssistClonesMessage(message))
			return assistServerUrl().then(fetchAssistClones);
		if (isDocsFeedbackMessage(message))
			return assistServerUrl().then((server) =>
				postDocsFeedback(server, message),
			);
		return undefined;
	});
}

assistBackground();
connectBrowserLink();
storeConsoleEntries();
