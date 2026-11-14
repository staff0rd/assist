import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { useRef } from "react";
import { navStackLayers } from "./PhoneNavStack/navStackLayers";
import {
	type SwipeBackTarget,
	SwipeBackTargetContext,
} from "./useEdgeSwipeBack";
import { useNavStack } from "./PhoneNavStack/useNavStack";
import { usePushPopAnimation } from "./PhoneNavStack/usePushPopAnimation";
import { useSwipeBackGesture } from "./PhoneNavStack/useSwipeBackGesture";
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
	const { state, settle, setGesture } = useNavStack();
	const target = useRef<SwipeBackTarget["current"]>(null);
	const { layers, moving, under } = navStackLayers(state);
	const { register, dim, pages } = usePushPopAnimation(
		state.transition,
		moving,
		under,
		settle,
	);
	useSwipeBackGesture({ state, setGesture, pages, dim, target });

	return (
		<SwipeBackTargetContext.Provider value={target}>
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
		</SwipeBackTargetContext.Provider>
	);
}
