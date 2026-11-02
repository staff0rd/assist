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
        try await fetchRepos().filter { identifiers.contains($0.id) }
    }

    func entities(matching string: String) async throws -> [RepoEntity] {
        let spoken = Self.normalize(string)
        let repos = try await fetchRepos()
        let exact = repos.filter { Self.normalize($0.name) == spoken }
        if !exact.isEmpty {
            return exact
        }
        return repos.filter { Self.normalize($0.name).contains(spoken) }
    }

    func suggestedEntities() async throws -> [RepoEntity] {
        try await fetchRepos()
    }

    // Spoken names arrive as words ("planner assistant") while repo names are slugs ("planner-assistant").
    private static func normalize(_ text: String) -> String {
        text.lowercased().filter { $0.isLetter || $0.isNumber }
    }

    private func fetchRepos() async throws -> [RepoEntity] {
        let request = URLRequest(url: try HomeNode.url("api/note-repos"), timeoutInterval: 10)
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
