import { useTheme } from "@mui/material/styles";
import { type RefObject, useCallback } from "react";
import { focusRegion } from "../../../focusRegion";
import { shortcutRegistry } from "../../../shortcutRegistry";
import { useCaptureHotkey } from "../../../useCaptureHotkey";

export function useFocusRepoPickerHotkey(
	pickerRef: RefObject<HTMLDivElement | null>,
): void {
	const ringColor = useTheme().palette.primary.main;
	useCaptureHotkey(
		shortcutRegistry.focusRepoPicker.matches,
		useCallback(
			() =>
				focusRegion(
					{
						locate: () =>
							pickerRef.current?.querySelector<HTMLElement>("button") ?? null,
						focus: (trigger) => trigger.focus(),
					},
					ringColor,
				),
			[pickerRef, ringColor],
		),
	);
}
