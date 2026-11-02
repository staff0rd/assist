import AppIntents

struct AssistShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddNoteIntent(),
            phrases: [
                "Add an idea to \(.applicationName)",
                "\(.applicationName) idea",
                "Add an \(.applicationName) note",
            ],
            shortTitle: "Add note",
            systemImageName: "note.text.badge.plus"
        )
    }
}
