import { createContext, useContext } from "react";

export type DequeueMessage = (
	sessionId: string,
	index: number,
	text: string,
) => Promise<boolean>;

export const DequeueMessageContext = createContext<DequeueMessage | undefined>(
	undefined,
);

export function useDequeueMessage(): DequeueMessage | undefined {
	return useContext(DequeueMessageContext);
}
