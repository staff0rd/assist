const INDENT_PX = 22;

export function criterionIndent(depth: number): number {
	return depth * INDENT_PX;
}

export function depthSteps(dx: number): number {
	return Math.round(dx / INDENT_PX);
}
