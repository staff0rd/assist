export type SwipeLayers = {
	moving: HTMLElement;
	under?: HTMLElement;
	dim?: HTMLElement | null;
};

export function swipeFrame(progress: number, parallax: number) {
	return {
		moving: { transform: `translateX(${progress * 100}%)` },
		under: { transform: `translateX(${(progress - 1) * parallax * 100}%)` },
		dim: { opacity: String(1 - progress) },
	};
}

export function applySwipeFrame(
	{ moving, under, dim }: SwipeLayers,
	progress: number,
	parallax: number,
) {
	const frame = swipeFrame(progress, parallax);
	moving.style.transform = frame.moving.transform;
	if (under) under.style.transform = frame.under.transform;
	if (dim) dim.style.opacity = frame.dim.opacity;
}

export function clearSwipeFrame({ moving, under, dim }: SwipeLayers) {
	moving.style.transform = "";
	if (under) under.style.transform = "";
	if (dim) dim.style.opacity = "";
}
