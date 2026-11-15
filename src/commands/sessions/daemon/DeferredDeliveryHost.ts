import type { Session } from "./types";

export type DeferredDeliveryHost = {
	session: (id: string) => Session | undefined;
	io: { typePrompt: (id: string, text: string) => unknown };
};
