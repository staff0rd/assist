import AppIntents
import Foundation

struct RepoEntity: AppEntity, Decodable {
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Repo"
    static let defaultQuery = RepoQuery()

    let name: String
    let cwd: String

    var id: String { cwd }

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

struct RepoQuery: EntityStringQuery {
    func entities(for identifiers: [String]) async throws -> [RepoEntity] {
        try await Self.fetchRepos().filter { identifiers.contains($0.id) }
    }

    func entities(matching string: String) async throws -> [RepoEntity] {
        let spoken = Self.normalize(string)
        let repos = try await Self.fetchRepos()
        let exact = repos.filter { Self.normalize($0.name) == spoken }
        if !exact.isEmpty {
            return exact
        }
        return Array(repos.filter { Self.normalize($0.name).contains(spoken) }.prefix(Self.maxMatches))
    }

    // Siri reads every suggestion aloud, so offer none and let it ask for a spoken name.
    func suggestedEntities() async throws -> [RepoEntity] {
        []
    }

    private static let maxMatches = 4

    // Spoken names arrive as words ("planner assistant") while repo names are slugs ("planner-assistant").
    private static func normalize(_ text: String) -> String {
        text.lowercased().filter { $0.isLetter || $0.isNumber }
    }

    static func fetchRepos() async throws -> [RepoEntity] {
        let request = URLRequest(url: try HomeNode.url("api/note-repos"), timeoutInterval: HomeNode.timeout)
        let data = try await HomeNode.send(request, expecting: 200)
        guard let listed = try? JSONDecoder().decode(RepoList.self, from: data) else {
            throw HomeNodeError.rejected
        }
        return listed.repos
    }
}

private struct RepoList: Decodable {
    let repos: [RepoEntity]
}
