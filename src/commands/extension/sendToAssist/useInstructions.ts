import { useState } from "react";

export function useInstructions(
	initial: string,
	onChange?: (instructions: string) => void,
): [string, (value: string) => void] {
	const [instructions, setInstructions] = useState(initial);
	const change = (value: string) => {
		setInstructions(value);
		onChange?.(value);
	};
	return [instructions, change];
}
