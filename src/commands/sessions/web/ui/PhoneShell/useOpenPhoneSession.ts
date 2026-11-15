import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import { sessionTitle } from "../App/sessionTitle";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { useLastSession } from "./PhoneActions/useLastSession";
import { usePhoneActions } from "./PhoneActions/usePhoneActions";
import { usePhoneStackPage } from "./PhoneNavStack/usePhoneStackPage";
import { usePhoneGoBack } from "./usePhoneGoBack";

export function useOpenPhoneSession(
	socket: SessionSocket,
): SessionInfo | undefined {
	const { id } = useParams();
	const session = socket.sessions.find((s) => s.id === id);
	const shown = useLastSession(session);
	const { isCurrent } = usePhoneStackPage();
	const { goBack } = usePhoneGoBack();
	const { announceEnded } = usePhoneActions();
	const left = useRef(false);
	const ended =
		!session && socket.sessionsLoaded && !socket.reconnecting && isCurrent;

	useEffect(() => {
		if (!ended || !id || left.current) return;
		left.current = true;
		goBack();
		announceEnded(id, shown && sessionTitle(shown));
	});

	return shown;
}
