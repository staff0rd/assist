import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import type { ReactNode } from "react";

type ConfigEntryActionButton = {
	label: string;
	title?: string;
	disabled: boolean;
	icon: ReactNode;
	onClick?: () => void;
};

export type ConfigEntryActionOptions = {
	label: string;
	disabled: boolean;
	open?: boolean;
	titles?: { moveUp: string; moveDown: string; remove: string };
	canMoveUp?: boolean;
	canMoveDown?: boolean;
	canRemove?: boolean;
	onToggle?: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	onRemove: () => void;
};

function toggleButton(o: ConfigEntryActionOptions): ConfigEntryActionButton {
	return {
		label: o.open ? `Done editing ${o.label}` : `Edit ${o.label}`,
		disabled: o.disabled,
		icon: o.open ? (
			<CheckIcon fontSize="inherit" />
		) : (
			<EditIcon fontSize="inherit" />
		),
		onClick: o.onToggle,
	};
}

function moveUpButton(o: ConfigEntryActionOptions): ConfigEntryActionButton {
	return {
		label: `Move ${o.label} up`,
		title: o.titles?.moveUp,
		disabled: o.disabled || o.canMoveUp === false,
		icon: <ArrowDropUpIcon fontSize="inherit" />,
		onClick: o.onMoveUp,
	};
}

function moveDownButton(o: ConfigEntryActionOptions): ConfigEntryActionButton {
	return {
		label: `Move ${o.label} down`,
		title: o.titles?.moveDown,
		disabled: o.disabled || o.canMoveDown === false,
		icon: <ArrowDropDownIcon fontSize="inherit" />,
		onClick: o.onMoveDown,
	};
}

function removeButton(o: ConfigEntryActionOptions): ConfigEntryActionButton {
	return {
		label: `Remove ${o.label}`,
		title: o.titles?.remove,
		disabled: o.disabled || o.canRemove === false,
		icon: <CloseIcon fontSize="inherit" />,
		onClick: o.onRemove,
	};
}

export function configEntryActionButtons(
	options: ConfigEntryActionOptions,
): ConfigEntryActionButton[] {
	return [
		toggleButton(options),
		moveUpButton(options),
		moveDownButton(options),
		removeButton(options),
	];
}
