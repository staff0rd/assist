import { useEffect, useState } from "react";
import type { InboxScanRun } from "../types";

export function useAutoOpen(
	run: InboxScanRun,
): [boolean, (open: boolean) => void] {
	const [open, setOpen] = useState(run.status === "scanning");
	const scanningRun = run.status === "scanning" ? run.startedAt : undefined;
	useEffect(() => {
		if (scanningRun) setOpen(true);
	}, [scanningRun]);
	return [open, setOpen];
}
