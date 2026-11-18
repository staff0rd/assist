export function outerWidth(item: Element): number {
	const style = getComputedStyle(item);
	return (
		item.getBoundingClientRect().width +
		(Number.parseFloat(style.marginLeft) || 0) +
		(Number.parseFloat(style.marginRight) || 0)
	);
}
