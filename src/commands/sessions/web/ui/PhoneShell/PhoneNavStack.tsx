import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { navStackLayers } from "./PhoneNavStack/navStackLayers";
import { useNavStack } from "./PhoneNavStack/useNavStack";
import { usePushPopAnimation } from "./PhoneNavStack/usePushPopAnimation";
import type { PhoneRoutesProps } from "./PhoneRoutes";
import { PhoneStackLayer } from "./PhoneStackLayer";
import { usePhoneTabMemory } from "./PhoneTabBar/usePhoneTabMemory";

const stackSx = { position: "relative", flex: 1, minHeight: 0 } as const;

const dimSx = {
	position: "absolute",
	inset: 0,
	zIndex: 2,
	opacity: 0,
	pointerEvents: "none",
	bgcolor: (t: Theme) => t.tokens.color.pushDim,
} as const;

export function PhoneNavStack(props: PhoneRoutesProps) {
	const restore = usePhoneTabMemory();
	const { state, settle } = useNavStack();
	const { layers, moving, under } = navStackLayers(state);
	const { register, dim } = usePushPopAnimation(
		state.transition,
		moving,
		under,
		settle,
	);

	return (
		<Box sx={stackSx}>
			{layers.map((layer) => (
				<PhoneStackLayer
					key={layer.location.key}
					{...layer}
					pageRef={register(layer.location.key)}
					routes={props}
					restore={restore}
				/>
			))}
			<Box ref={dim} sx={dimSx} />
		</Box>
	);
}
