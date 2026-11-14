import { useCallback, useState } from "react";
import { useLocation, useNavigationType } from "react-router";
import { type NavStackState, nextNavStack } from "./nextNavStack";

export function useNavStack() {
	const location = useLocation();
	const type = useNavigationType();
	const [state, setState] = useState<NavStackState>(() => ({
		stack: [location],
		seq: 0,
	}));
	let current = state;
	if (state.stack.at(-1)?.key !== location.key) {
		current = nextNavStack(state, location, type);
		setState(current);
	}
	const settle = useCallback(
		(id: number) =>
			setState((s) =>
				s.transition?.id === id
					? { ...s, leaving: undefined, transition: undefined }
					: s,
			),
		[],
	);
	const setGesture = useCallback(
		(gesture: NavStackState["gesture"]) => setState((s) => ({ ...s, gesture })),
		[],
	);
	return { state: current, settle, setGesture };
}
