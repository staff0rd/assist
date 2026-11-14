import { changeHash } from "./changeSteps";

export function startAtHash(
	hash: string,
	count: number,
	steps: { next: () => void },
	cursor: { show: (index: number) => void },
) {
	if (hash === changeHash.first) steps.next();
	if (count && hash === changeHash.last) cursor.show(count - 1);
}
