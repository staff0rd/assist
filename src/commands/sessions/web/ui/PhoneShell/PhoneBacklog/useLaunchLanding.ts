import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { SessionInfo } from "../../types";

const LAUNCH_LATCH_MS = 20_000;

export function useLaunchLanding(inFlight: SessionInfo | undefined) {
	const navigate = useNavigate();
	const [launched, setLaunched] = useState(false);

	useEffect(() => {
		if (launched && inFlight) navigate(`/session/${inFlight.id}`);
	}, [launched, inFlight, navigate]);

	useEffect(() => {
		if (!launched) return;
		const timer = setTimeout(() => setLaunched(false), LAUNCH_LATCH_MS);
		return () => clearTimeout(timer);
	}, [launched]);

	return { launched, latch: () => setLaunched(true) };
}
