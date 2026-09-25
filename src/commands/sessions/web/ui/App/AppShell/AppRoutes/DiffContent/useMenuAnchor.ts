import { type MouseEvent, useState } from "react";

export function useMenuAnchor(): {
	anchorEl: HTMLElement | null;
	isOpen: boolean;
	open: (event: MouseEvent<HTMLElement>) => void;
	close: () => void;
} {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	return {
		anchorEl,
		isOpen: anchorEl !== null,
		open: (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
		close: () => setAnchorEl(null),
	};
}
