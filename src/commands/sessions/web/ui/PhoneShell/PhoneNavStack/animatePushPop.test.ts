// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import { animatePushPop } from "./animatePushPop";

const { motion } = createDesignTheme("dark", "touch").tokens;

function page() {
	const el = document.createElement("div");
	const animate = vi.fn(() => ({}) as Animation);
	el.animate = animate as unknown as HTMLElement["animate"];
	return { el, animate };
}

describe("animatePushPop", () => {
	it("slides the pushed page over a parallaxed, dimmed page", () => {
		const moving = page();
		const under = page();
		const dim = page();
		const animations = animatePushPop(
			"push",
			{ moving: moving.el, under: under.el, dim: dim.el },
			motion,
			{ reduced: false, from: new Map() },
		);
		expect(animations).toHaveLength(3);
		expect(moving.animate).toHaveBeenCalledWith(
			[{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
			expect.objectContaining({ duration: motion.push.duration }),
		);
		expect(under.animate).toHaveBeenCalledWith(
			[{ transform: "translateX(0)" }, { transform: "translateX(-30%)" }],
			expect.anything(),
		);
	});

	it("crossfades only the moving page under reduced motion", () => {
		const moving = page();
		const under = page();
		animatePushPop("pop", { moving: moving.el, under: under.el }, motion, {
			reduced: true,
			from: new Map(),
		});
		expect(moving.animate).toHaveBeenCalledWith(
			[{ opacity: 1 }, { opacity: 0 }],
			expect.objectContaining({ duration: motion.crossfade.duration }),
		);
		expect(under.animate).not.toHaveBeenCalled();
	});

	it("starts an interrupting transition from the page's current frame", () => {
		const moving = page();
		animatePushPop("pop", { moving: moving.el }, motion, {
			reduced: false,
			from: new Map([
				[moving.el, { transform: "translateX(40px)", opacity: "1" }],
			]),
		});
		expect(moving.animate).toHaveBeenCalledWith(
			[{ transform: "translateX(40px)" }, { transform: "translateX(100%)" }],
			expect.anything(),
		);
	});
});
