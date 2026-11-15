export const proposeHelpText = `The payload is strict JSON: { name, type, description?, acceptanceCriteria?, phases? }.
Each phase is { name, tasks, manualChecks?, dependsOn? } and needs at least one task.

dependsOn lists the earlier phase numbers a phase needs, e.g. [2]. Leave it out
and the phase waits for the previous one. Give it when a phase only needs an
earlier phase, not the one right before it, so independent phases can run side
by side; [] means it needs no earlier phase. Only mark phases independent when
they touch different code and neither needs the other's changes. Entries must
name earlier phases: forward or self references are rejected.

The Review phase is owned by the runner and appended to every plan automatically,
so it must not be authored: a phase named "Review" is rejected. Do not add a final
phase for verifying acceptance criteria, confirming manual checks, committing or
marking the item done — that is what the appended Review phase does.`;
