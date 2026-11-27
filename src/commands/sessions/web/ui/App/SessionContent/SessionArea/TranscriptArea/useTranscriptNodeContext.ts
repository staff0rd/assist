import { createContext, useContext } from "react";

export const TranscriptNodeContext = createContext<string | undefined>(
	undefined,
);

export function useTranscriptNodeContext(): string | undefined {
	return useContext(TranscriptNodeContext);
}
