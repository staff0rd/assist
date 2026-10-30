import { useEffect } from "react";
import { useHomeNodeContext } from "../HomeNodeGate/useHomeNodeContext";

const RECHECK_MS = 4000;

export function useHealthRecheck(reconnecting: boolean) {
	const recheck = useHomeNodeContext()?.recheck;
	useEffect(() => {
		if (!reconnecting || !recheck) return;
		const timer = setInterval(recheck, RECHECK_MS);
		return () => clearInterval(timer);
	}, [reconnecting, recheck]);
}
