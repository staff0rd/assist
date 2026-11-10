import type { GapDirection } from "../gapAt";

export type GapError = {
	index: number;
	direction: GapDirection;
	message: string;
};

export function gapError(
	error: unknown,
	index: number,
	direction: GapDirection,
): GapError {
	return {
		index,
		direction,
		message: error instanceof Error ? error.message : String(error),
	};
}
