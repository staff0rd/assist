import { useEffect, useRef } from "react";

const LONG_PRESS_MS = 500;

export function useLongPress(onLongPress: () => void) {
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);
	return {
		arm: (onFire: () => void) => {
			clearTimeout(timer.current);
			timer.current = setTimeout(() => {
				onFire();
				onLongPress();
			}, LONG_PRESS_MS);
		},
		cancel: () => clearTimeout(timer.current),
	};
}
