import type {
	MouseEvent as ReactMouseEvent,
	ReactNode,
	RefObject,
} from "react";
import type { OverlayRect } from "../../../../../../../../../caretFromPoint";

export type PreviewBodyProps = {
	content: string;
	control?: ReactNode;
	trailing?: string;
	ranges: { start: number; end: number; color: string }[];
	wrapperRef: RefObject<HTMLDivElement | null>;
	contentRef: RefObject<HTMLDivElement | null>;
	dragRects: OverlayRect[] | null;
	dragColor: string;
	onMouseDown: (e: ReactMouseEvent) => void;
	footer?: ReactNode;
};
