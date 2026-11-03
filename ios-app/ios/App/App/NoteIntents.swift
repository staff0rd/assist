import AppIntents

struct DraftNoteIntent: AppIntent {
    static let title: LocalizedStringResource = "Assist draft"
    static let description = IntentDescription("Starts a /draft session for a dictated note in a repo on your home node.")
    static let openAppWhenRun = false

    @Parameter(title: "Repo", requestValueDialog: "Which repo?")
    var repo: RepoEntity

    @Parameter(title: "Note", requestValueDialog: "What's the idea?")
    var text: String

    @Parameter(title: "Confirmed", default: false)
    var confirmed: Bool

    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await NoteSession.confirmAndStart(mode: "draft", action: "Start a draft", repo: repo, text: $text, confirmed: $confirmed)
    }
}

struct BugNoteIntent: AppIntent {
    static let title: LocalizedStringResource = "Assist bug"
    static let description = IntentDescription("Starts a /bug session for a dictated bug in a repo on your home node.")
    static let openAppWhenRun = false

    @Parameter(title: "Repo", requestValueDialog: "Which repo?")
    var repo: RepoEntity

    @Parameter(title: "Bug", requestValueDialog: "What's the bug?")
    var text: String

    @Parameter(title: "Confirmed", default: false)
    var confirmed: Bool

    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await NoteSession.confirmAndStart(mode: "bug", action: "File the bug", repo: repo, text: $text, confirmed: $confirmed)
    }
}

struct PromptNoteIntent: AppIntent {
    static let title: LocalizedStringResource = "Assist prompt"
    static let description = IntentDescription("Starts a Claude session with a dictated prompt in a repo on your home node.")
    static let openAppWhenRun = false

    @Parameter(title: "Repo", requestValueDialog: "Which repo?")
    var repo: RepoEntity

    @Parameter(title: "Prompt", requestValueDialog: "What's the prompt?")
    var text: String

    @Parameter(title: "Confirmed", default: false)
    var confirmed: Bool

    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await NoteSession.confirmAndStart(mode: "prompt", action: "Start a session", repo: repo, text: $text, confirmed: $confirmed)
    }
}
