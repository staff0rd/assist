import { createLogUpdate } from "log-update";
import {
	renderEntries,
	SPINNER_FRAMES,
	type SpinnerEntry,
	type SpinnerState,
} from "./renderEntries";

export type SpinnerHandle = {
	text: string;
	succeed(text?: string): void;
	fail(text?: string): void;
};

const TICK_MS = 80;

export class MultiSpinner {
	private readonly entries: SpinnerEntry[] = [];
	private readonly log = createLogUpdate(process.stdout);
	private timer: ReturnType<typeof setInterval> | undefined;
	private frame = 0;
	private finished = false;

	create(initialText: string): SpinnerHandle {
		return this.add({ state: "running", text: initialText });
	}

	addElapsed(prefix = "elapsed"): SpinnerHandle {
		return this.add({
			state: "running",
			text: `${prefix}: 0s`,
			footer: true,
			elapsedStart: Date.now(),
			elapsedPrefix: prefix,
		});
	}

	failRemaining(text?: string): void {
		for (const entry of this.entries) {
			if (entry.state === "running") this.resolve(entry, "failed", text);
		}
	}

	private add(entry: SpinnerEntry): SpinnerHandle {
		this.entries.push(entry);
		this.ensureTicking();
		return {
			get text() {
				return entry.text;
			},
			set text(value: string) {
				entry.text = value;
			},
			succeed: (text?: string) => this.resolve(entry, "succeeded", text),
			fail: (text?: string) => this.resolve(entry, "failed", text),
		};
	}

	private resolve(
		entry: SpinnerEntry,
		state: Exclude<SpinnerState, "running">,
		text: string | undefined,
	): void {
		if (entry.state !== "running") return;
		entry.state = state;
		if (text !== undefined) entry.text = text;
		entry.elapsedStart = undefined;
		this.render();
		this.maybeFinish();
	}

	private ensureTicking(): void {
		if (this.timer || this.finished) return;
		this.render();
		this.timer = setInterval(() => {
			this.frame = (this.frame + 1) % SPINNER_FRAMES.length;
			this.render();
		}, TICK_MS);
	}

	private render(): void {
		this.log(renderEntries(this.entries, this.frame));
	}

	private maybeFinish(): void {
		if (this.entries.some((e) => e.state === "running")) return;
		if (this.timer) clearInterval(this.timer);
		this.timer = undefined;
		this.finished = true;
		this.render();
		this.log.done();
	}
}
