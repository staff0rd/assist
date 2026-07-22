import type { RateLimits } from "../../../../shared/RateLimits";
import type { HistoricalSession, SessionInfo, Transcript } from "./types";
import type { ServerConflict, SuccessNotice } from "./useNotices";

type OutputHandler = (data: string) => void;

export type WsDispatch = {
	setSessions: (s: SessionInfo[]) => void;
	setHistory: (h: HistoricalSession[]) => void;
	setActiveId: (id: string) => void;
	setDaemonActiveId: (id: string | null) => void;
	setDaemonVersion: (version: string) => void;
	setTranscript: (t: Transcript | null) => void;
	setViewingTranscriptSessionId: (id: string | null) => void;
	setCurrentCwd: (cwd: string) => void;
	setError: (message: string) => void;
	setSuccess: (notice: SuccessNotice) => void;
	setServerConflict: (conflict: ServerConflict) => void;
	resolvePendingLaunch: () => void;
	failPendingLaunch: (message: string) => void;
	setRateLimits: (limits: RateLimits) => void;
	markInitialized: (id: string) => void;
	buffers: React.RefObject<Map<string, string>>;
	handlers: React.RefObject<Map<string, OutputHandler>>;
};
