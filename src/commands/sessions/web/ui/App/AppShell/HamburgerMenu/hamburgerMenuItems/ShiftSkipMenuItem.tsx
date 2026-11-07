import type { ReactNode } from "react";
import { useShiftSkipMenuItem } from "../../../../useShiftSkipMenuItem";
import { IconMenuItem } from "./IconMenuItem";

export type ShiftSkipMenuAction = { open: () => void; skip: () => void };

export function ShiftSkipMenuItem({
	icon,
	label,
	action,
}: {
	icon: ReactNode;
	label: string;
	action: ShiftSkipMenuAction;
}) {
	const handlers = useShiftSkipMenuItem(action.skip, action.open, label);
	return <IconMenuItem icon={icon} label={label} {...handlers} />;
}
