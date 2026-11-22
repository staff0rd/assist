import { useEffect, useState } from "react";

type HeldModifiers = { shift: boolean; ctrl: boolean };

const released: HeldModifiers = { shift: false, ctrl: false };

export function useShiftHeld(): HeldModifiers {
	const [held, setHeld] = useState(released);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) =>
			setHeld({ shift: e.shiftKey, ctrl: e.ctrlKey });
		const release = () => setHeld(released);
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
