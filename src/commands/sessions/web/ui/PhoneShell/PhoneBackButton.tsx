import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import IconButton from "@mui/material/IconButton";
import { usePhoneStackPage } from "./PhoneNavStack/usePhoneStackPage";
import { useEdgeSwipeBack } from "./useEdgeSwipeBack";
import { usePhoneGoBack } from "./usePhoneGoBack";

const backSx = { color: "primary.main" } as const;

export function PhoneBackButton() {
	const { isCurrent } = usePhoneStackPage();
	const { goBack, label } = usePhoneGoBack();
	useEdgeSwipeBack(goBack, isCurrent);
	return (
		<IconButton aria-label={`Back to ${label}`} sx={backSx} onClick={goBack}>
			<ChevronLeftIcon />
		</IconButton>
	);
}
