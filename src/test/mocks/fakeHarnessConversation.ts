import type { HarnessAdapter } from "../../shared/harnessAdapters/types";
import { fakeConversationReader } from "./fakeConversationReader";

export const fakeHarnessConversation: HarnessAdapter["conversation"] = {
	idName: "fake conversation id",
	findResumable: ({ harnessSessionId }) => harnessSessionId,
	locate: (id) => Promise.resolve(`/fake/${id}.log`),
	current: () => process.env.FAKE_HARNESS_CONVERSATION_ID,
	boundId: ({ harnessSessionId }) => harnessSessionId,
	toRef: (harnessSessionId, cwd) => ({ cwd, harnessSessionId }),
	discover: () =>
		Promise.resolve(process.env.FAKE_HARNESS_CONVERSATION_ID ?? null),
	relocate: () => {},
	reader: fakeConversationReader,
};
