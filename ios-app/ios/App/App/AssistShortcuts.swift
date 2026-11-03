import AppIntents

struct AssistShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: DraftNoteIntent(),
            phrases: ["\(.applicationName) draft", "\(.applicationName) idea"],
            shortTitle: "Draft",
            systemImageName: "square.and.pencil"
        )
        AppShortcut(
            intent: BugNoteIntent(),
            phrases: ["\(.applicationName) bug"],
            shortTitle: "Bug",
            systemImageName: "ladybug"
        )
        AppShortcut(
            intent: PromptNoteIntent(),
            phrases: ["\(.applicationName) prompt"],
            shortTitle: "Prompt",
            systemImageName: "text.bubble"
        )
    }
}
