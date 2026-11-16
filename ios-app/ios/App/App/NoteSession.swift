import AppIntents
import Foundation

enum NoteSession {
    private static let maxAttempts = 3

    // Repo and text are optional so Siri doesn't prompt for them before perform() runs:
    // checking the home node first lets an unreachable node fail with a spoken error up front.
    static func confirmAndStart(
        mode: String,
        action: String,
        ask: LocalizedStringResource,
        repo: IntentParameter<RepoEntity?>,
        repoName: IntentParameter<String?>,
        text: IntentParameter<String?>,
        confirmed: IntentParameter<Bool>
    ) async throws -> some IntentResult & ProvidesDialog {
        let repos = try await RepoQuery.fetchRepos()
        var chosen = repo.wrappedValue
        if chosen == nil {
            chosen = try await askForRepo(among: repos, repo: repo, repoName: repoName)
        }
        guard let chosen else {
            return .result(dialog: "Okay, I didn't start anything.")
        }
        var note = text.wrappedValue
        if note == nil {
            note = try await text.requestValue(IntentDialog(ask))
        }
        guard var note else {
            return .result(dialog: "Okay, I didn't start anything.")
        }
        for attempt in 1...maxAttempts {
            if try await confirmed.requestValue("I heard: \(note). \(action) in \(chosen.name)?") {
                try await start(mode: mode, note: note, repo: chosen)
                return .result(dialog: "Started in \(chosen.name).")
            }
            if attempt < maxAttempts {
                note = try await text.requestValue("Okay, what's the note?")
            }
        }
        return .result(dialog: "Okay, I didn't start anything.")
    }

    // Siri drops answers to an entity prompt that it reads as something else (e.g. "APM" heard as the time "8pm"),
    // so ask for plain text and match it here.
    private static func askForRepo(
        among repos: [RepoEntity],
        repo: IntentParameter<RepoEntity?>,
        repoName: IntentParameter<String?>
    ) async throws -> RepoEntity? {
        var prompt: IntentDialog = "Which repo?"
        for _ in 1...maxAttempts {
            let spoken = try await repoName.requestValue(prompt)
            let matches = RepoMatcher.match(spoken, in: repos) { $0.name }
            if matches.count == 1 {
                return matches[0]
            }
            if matches.count > 1 {
                return try await repo.requestDisambiguation(among: matches, dialog: "Which one?")
            }
            prompt = "I couldn't find a repo called \(spoken). Which repo?"
        }
        return nil
    }

    private static func start(mode: String, note: String, repo: RepoEntity) async throws {
        let endpoint = try HomeNode.url("api/note-session", query: [URLQueryItem(name: "cwd", value: repo.cwd)])
        var request = URLRequest(url: endpoint, timeoutInterval: HomeNode.timeout)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["text": note, "mode": mode])
        _ = try await HomeNode.send(request, expecting: 201)
    }
}
