export function prefersReducedMotion(): boolean {
	return (
		globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
	);
}
