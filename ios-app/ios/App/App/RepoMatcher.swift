import Foundation

enum RepoMatcher {
    static let maxMatches = 4

    static func match<Repo>(_ spoken: String, in repos: [Repo], name: (Repo) -> String) -> [Repo] {
        let heard = normalize(spoken)
        guard !heard.isEmpty else {
            return []
        }
        let names = repos.map { normalize(name($0)) }
        let exact = zip(repos, names).filter { $0.1 == heard }.map(\.0)
        if !exact.isEmpty {
            return Array(exact.prefix(maxMatches))
        }
        let contains = zip(repos, names).filter { $0.1.contains(heard) }.map(\.0)
        if !contains.isEmpty {
            return Array(contains.prefix(maxMatches))
        }
        let letters = letterSounds(spoken)
        return Array(zip(repos, names).filter { $0.1 == letters }.map(\.0).prefix(maxMatches))
    }

    // Spoken names arrive as words ("planner assistant") while repo names are slugs ("planner-assistant").
    static func normalize(_ text: String) -> String {
        text.lowercased().filter { $0.isLetter || $0.isNumber }
    }

    // Siri transcribes spelled-out names by sound, e.g. "APM" as "8pm", so map each token back to its letter.
    static func letterSounds(_ text: String) -> String {
        tokens(text.lowercased()).map { soundsLike[$0] ?? $0 }.joined()
    }

    private static func tokens(_ text: String) -> [String] {
        var result: [String] = []
        var current = ""
        var currentIsDigit = false
        for char in text {
            guard char.isLetter || char.isNumber else {
                if !current.isEmpty { result.append(current) }
                current = ""
                continue
            }
            if !current.isEmpty && char.isNumber != currentIsDigit {
                result.append(current)
                current = ""
            }
            current.append(char)
            currentIsDigit = char.isNumber
        }
        if !current.isEmpty { result.append(current) }
        return result
    }

    private static let soundsLike: [String: String] = [
        "00": "",
        "8": "a", "eight": "a", "ay": "a",
        "bee": "b", "be": "b",
        "see": "c", "sea": "c",
        "dee": "d",
        "ee": "e",
        "ef": "f", "eff": "f",
        "gee": "g",
        "aitch": "h",
        "eye": "i", "aye": "i",
        "jay": "j",
        "kay": "k",
        "el": "l", "elle": "l",
        "em": "m",
        "en": "n",
        "oh": "o", "owe": "o", "0": "o",
        "pee": "p", "pea": "p",
        "cue": "q", "queue": "q",
        "are": "r", "ar": "r",
        "es": "s", "ess": "s",
        "tee": "t", "tea": "t",
        "you": "u",
        "vee": "v",
        "ex": "x",
        "why": "y",
        "zed": "z", "zee": "z",
    ]
}
