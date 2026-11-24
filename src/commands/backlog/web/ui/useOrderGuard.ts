import { useRef } from "react";
import { createOrderGuard, type OrderGuard } from "./createOrderGuard";

export function useOrderGuard(): OrderGuard {
	const ref = useRef<OrderGuard | null>(null);
	ref.current ??= createOrderGuard();
	return ref.current;
}
