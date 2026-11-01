import { useState } from "react";
import type { SessionInfo } from "../../types";

export function useLastSession(
	session: SessionInfo | undefined,
): SessionInfo | undefined {
	const [last, setLast] = useState(session);
	if (session && session !== last) setLast(session);
	return session ?? last;
}
