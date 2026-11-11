import type { ButtonProps } from "@mui/material/Button";
import { useNavigate } from "react-router";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import { startLabel } from "./startLabel";
import type { PhoneStart } from "./usePhoneStart";

export function useImplementButton(
	item: BacklogItem,
	start: PhoneStart,
): ButtonProps | undefined {
	const navigate = useNavigate();
	const { inFlight, cwd, launched } = start;
	if (inFlight)
		return {
			children: "Open session",
			onClick: () => navigate(`/session/${inFlight.id}`),
		};
	if (!start.playable) return undefined;
	return {
		children: launched ? "Starting…" : startLabel(item),
		disabled: !cwd || launched,
		onClick: start.start,
	};
}
