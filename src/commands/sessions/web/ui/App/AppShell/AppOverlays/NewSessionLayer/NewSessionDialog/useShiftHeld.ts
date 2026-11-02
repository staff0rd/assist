import { useEffect, useState } from "react";

export function useShiftHeld(): boolean {
	const [held, setHeld] = useState(false);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => setHeld(e.shiftKey);
		const release = () => setHeld(false);
		globalThis.addEventListener("keydown", onKey);
		globalThis.addEventListener("keyup", onKey);
		globalThis.addEventListener("blur", release);
		return () => {
			globalThis.removeEventListener("keydown", onKey);
			globalThis.removeEventListener("keyup", onKey);
			globalThis.removeEventListener("blur", release);
		};
	}, []);

	return held;
}
