import { describe, expect, it } from "vitest";
import { criterionDropPlan } from "../useCriterionDrag/criterionDropPlan";
import { criterionKeyAction } from "./criterionKeyAction";
import { dropCriterion } from "../useCriterionDrag/dropCriterion";
import type { AcceptanceCriterion } from "../../splitAcceptanceCriteria";

const outline = (...spec: [number, string][]): AcceptanceCriterion[] =>
	spec.map(([depth, text]) => ({ depth, text }));

const shape = (items: AcceptanceCriterion[]) =>
	items.map((item) => `${item.depth}:${item.text}`);

const press = (
	items: AcceptanceCriterion[],
	index: number,
	key: string,
	extra: Partial<{ shift: boolean; alt: boolean; caret: number }> = {},
) =>
	criterionKeyAction(items, index, {
		key,
		shift: extra.shift ?? false,
		alt: extra.alt ?? false,
		caret: extra.caret ?? 0,
		text: items[index].text,
	});

const edited = (action: ReturnType<typeof criterionKeyAction>) => {
	if (action?.kind !== "edit") throw new Error("expected an edit");
	return action;
};

describe("criterionKeyAction", () => {
	it("Enter splits the row at the caret and lands on the new sibling", () => {
		const action = edited(
			press(outline([0, "first second"]), 0, "Enter", { caret: 5 }),
		);

		expect(shape(action.edit.items)).toEqual(["0:first", "0: second"]);
		expect(action.edit.index).toBe(1);
		expect(action.caret).toBe("start");
	});

	it("Tab indents a row and carries its children", () => {
		const items = outline([0, "a"], [0, "b"], [1, "b1"], [0, "c"]);
		const action = edited(press(items, 1, "Tab"));

		expect(shape(action.edit.items)).toEqual(["0:a", "1:b", "2:b1", "0:c"]);
		expect(action.edit.index).toBe(1);
	});

	it("refuses to indent a row with no sibling above it", () => {
		expect(press(outline([0, "a"], [1, "a1"]), 1, "Tab")).toBeNull();
		expect(press(outline([0, "a"]), 0, "Tab")).toBeNull();
	});

	it("Shift+Tab outdents a row and carries its children", () => {
		const items = outline([0, "a"], [1, "a1"], [2, "a1a"]);
		const action = edited(press(items, 1, "Tab", { shift: true }));

		expect(shape(action.edit.items)).toEqual(["0:a", "0:a1", "1:a1a"]);
	});

	it("refuses to outdent a top-level row", () => {
		expect(press(outline([0, "a"]), 0, "Tab", { shift: true })).toBeNull();
	});

	it("Alt+Up swaps a row with the sibling above it, children included", () => {
		const items = outline([0, "a"], [1, "a1"], [0, "b"], [1, "b1"]);
		const action = edited(press(items, 2, "ArrowUp", { alt: true }));

		expect(shape(action.edit.items)).toEqual(["0:b", "1:b1", "0:a", "1:a1"]);
		expect(action.edit.index).toBe(0);
	});

	it("Alt+Down moves a row past the whole subtree of the next sibling", () => {
		const items = outline([0, "a"], [0, "b"], [1, "b1"], [2, "b1a"]);
		const action = edited(press(items, 0, "ArrowDown", { alt: true }));

		expect(shape(action.edit.items)).toEqual(["0:b", "1:b1", "2:b1a", "0:a"]);
		expect(action.edit.index).toBe(3);
	});

	it("does not move a row that has no sibling in that direction", () => {
		const items = outline([0, "a"], [1, "a1"]);

		expect(press(items, 0, "ArrowUp", { alt: true })).toBeNull();
		expect(press(items, 1, "ArrowDown", { alt: true })).toBeNull();
	});

	it("Backspace on an empty row removes it and promotes its children", () => {
		const items = outline([0, "a"], [1, ""], [2, "a1a"]);
		const action = edited(press(items, 1, "Backspace"));

		expect(shape(action.edit.items)).toEqual(["0:a", "1:a1a"]);
		expect(action.edit.index).toBe(0);
	});

	it("leaves a row with text alone on Backspace", () => {
		expect(press(outline([0, "a"]), 0, "Backspace")).toBeNull();
	});

	it("walks focus between rows with the plain arrows", () => {
		const items = outline([0, "a"], [0, "b"]);

		expect(press(items, 1, "ArrowUp")).toEqual({ kind: "focus", index: 0 });
		expect(press(items, 0, "ArrowDown", { caret: 1 })).toEqual({
			kind: "focus",
			index: 1,
		});
		expect(press(items, 0, "ArrowUp")).toBeNull();
	});
});

describe("criterionDropPlan", () => {
	const boxes = [0, 1, 2, 3].map((i) => ({ top: i * 20, height: 20 }));

	it("targets the row whose top half the pointer is over", () => {
		const items = outline([0, "a"], [0, "b"], [0, "c"], [0, "d"]);

		expect(criterionDropPlan(boxes, items, 0, 0, 45).target).toBe(2);
		expect(criterionDropPlan(boxes, items, 0, 0, 500).target).toBe(4);
	});

	it("keeps a row put while the pointer is inside its own subtree", () => {
		const items = outline([0, "a"], [1, "a1"], [2, "a1a"], [0, "b"]);

		expect(criterionDropPlan(boxes, items, 0, 0, 25).target).toBe(0);
	});

	it("reads horizontal travel as depth, capped one below the row above", () => {
		const items = outline([0, "a"], [0, "b"], [0, "c"], [0, "d"]);

		expect(criterionDropPlan(boxes, items, 2, 22, 45).depth).toBe(1);
		expect(criterionDropPlan(boxes, items, 2, 220, 45).depth).toBe(1);
		expect(criterionDropPlan(boxes, items, 2, -220, 45).depth).toBe(0);
	});

	it("pins a row dropped at the top of the list to depth zero", () => {
		const items = outline([0, "a"], [1, "a1"], [0, "b"]);

		expect(criterionDropPlan(boxes, items, 1, 220, 0).depth).toBe(0);
	});

	it("puts the drop line at the target row's top edge", () => {
		const items = outline([0, "a"], [0, "b"], [0, "c"], [0, "d"]);

		expect(criterionDropPlan(boxes, items, 0, 0, 45).top).toBe(40);
		expect(criterionDropPlan(boxes, items, 0, 0, 500).top).toBe(80);
	});
});

describe("dropCriterion", () => {
	it("moves the row and its children to the target depth", () => {
		const items = outline([0, "a"], [0, "b"], [1, "b1"]);
		const edit = dropCriterion(items, 1, 0, 0);

		expect(shape(edit.items)).toEqual(["0:b", "1:b1", "0:a"]);
		expect(edit.index).toBe(0);
	});

	it("accounts for the removed block when dropping further down", () => {
		const items = outline([0, "a"], [1, "a1"], [0, "b"], [0, "c"]);
		const edit = dropCriterion(items, 0, 3, 0);

		expect(shape(edit.items)).toEqual(["0:b", "0:a", "1:a1", "0:c"]);
		expect(edit.index).toBe(1);
	});

	it("re-nests the whole block by the depth the drop asked for", () => {
		const items = outline([0, "a"], [0, "b"], [1, "b1"]);
		const edit = dropCriterion(items, 1, 1, 1);

		expect(shape(edit.items)).toEqual(["0:a", "1:b", "2:b1"]);
	});

	it("clamps a block dropped more than one level below the row above", () => {
		const items = outline([0, "a"], [0, "b"], [1, "b1"]);
		const edit = dropCriterion(items, 1, 1, 3);

		expect(shape(edit.items)).toEqual(["0:a", "1:b", "2:b1"]);
	});
});
