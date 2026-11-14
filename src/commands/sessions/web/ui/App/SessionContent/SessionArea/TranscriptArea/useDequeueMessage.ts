import { createContext, useContext } from "react";

type DequeueMessage = (sessionId: string, index: number, text: string) => void;

export const DequeueMessageContext = createContext<DequeueMessage | undefined>(
	undefined,
);

export function useDequeueMessage(): DequeueMessage | undefined {
	return useContext(DequeueMessageContext);
}
