import { useEffect, useState } from "react";

type Modifiers = { shiftKey: boolean; ctrlKey: boolean; altKey: boolean };

export function useModifiersHeld(test: (e: Modifiers) => boolean): boolean {
	const [held, setHeld] = useState(false);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => setHeld(test(e));
		const release = () => setHeld(false);
		globalThis.addEventListener("keydown", onKey);
		globalThis.addEventListener("keyup", onKey);
		globalThis.addEventListener("blur", release);
		return () => {
			globalThis.removeEventListener("keydown", onKey);
			globalThis.removeEventListener("keyup", onKey);
			globalThis.removeEventListener("blur", release);
		};
	}, [test]);

	return held;
}
