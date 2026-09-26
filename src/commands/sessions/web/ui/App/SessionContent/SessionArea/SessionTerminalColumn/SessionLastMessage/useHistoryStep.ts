import { type WheelEvent, useState } from "react";
import { useWheelGesture } from "./useWheelGesture";

function withLatest(history: string[], latest: string): string[] {
	return history.at(-1) === latest ? history : [...history, latest];
}

export function useHistoryStep(
	message: string,
	history: string[],
	enabled: boolean,
) {
	const [step, setStep] = useState({ message, offset: 0 });
	const messages = withLatest(history, message);
	const offset = step.message === message ? step.offset : 0;
	const clamped = Math.min(offset, messages.length - 1);

	const onGesture = useWheelGesture((direction) => {
		const next = Math.max(
			0,
			Math.min(clamped + direction, messages.length - 1),
		);
		setStep({ message, offset: next });
	});

	const onWheel = (e: WheelEvent) => {
		if (enabled && e.deltaY !== 0) onGesture(e);
	};

	const reset = () => setStep({ message, offset: 0 });

	return {
		shown: messages[messages.length - 1 - clamped],
		position:
			clamped > 0
				? `${messages.length - clamped} / ${messages.length}`
				: undefined,
		onWheel,
		reset,
	};
}
