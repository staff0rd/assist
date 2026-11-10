---
id: sessions-keyboard
title: Keyboard shortcuts
group: Sessions
order: 6
covers:
  - config:sessions.hotkeys.navTab
  - config:sessions.hotkeys.focusSidebar
  - config:sessions.hotkeys.focusTerminal
  - config:sessions.hotkeys.toggleDiff
  - config:sessions.hotkeys.focusRepoPicker
  - config:sessions.hotkeys.openUpdates
  - config:sessions.hotkeys.openConfig
  - config:sessions.hotkeys.openMenu
  - config:sessions.hotkeys.focusAddAgent
  - config:sessions.hotkeys.focusVsCode
  - config:sessions.hotkeys.focusDone
  - config:sessions.hotkeys.nextWaiting
  - config:sessions.hotkeys.newSession
  - config:sessions.hotkeys.quickOpen
  - config:sessions.hotkeys.save
  - config:sessions.hotkeys.shortcutsSheet
screenshots:
  - file: sessions-shortcuts.png
    alt: The keyboard shortcuts sheet
    route: /sessions
    scene: dashboard
    waitFor: text=Pricing page copy
    actions:
      - press: ControlOrMeta+/
---

## The layout

The dashboard can be driven without the mouse. Most shortcuts are :kbd[Alt] plus a left-hand key, one keyboard row per screen region, and they work while the terminal has focus.

| Keys                                    | Action                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| :kbd[Alt+1] … :kbd[Alt+6]               | Select the Nth top-level tab                                                       |
| :kbd[Alt+Q]                             | Open the Updates page (the version badge)                                          |
| :kbd[Alt+W]                             | Open the config page                                                               |
| :kbd[Alt+E]                             | Open the menu, focused on its first item                                           |
| :kbd[Alt+R]                             | Focus the repo picker; :kbd[Tab] and :kbd[Shift+Tab] then move along the toolbar   |
| :kbd[Alt+A]                             | Focus the active session's card, expanding the sidebar and switching to **Active** |
| :kbd[Alt+S]                             | Focus the active session's terminal                                                |
| :kbd[Alt+D]                             | Open and focus the diff panel, or close it back to the terminal                    |
| :kbd[Tab] / :kbd[Shift+Tab]             | Move to the next or previous sidebar card                                          |
| :kbd[Alt+Z] / :kbd[Alt+X] / :kbd[Alt+C] | Focus the top bar's **Add agent**, **VS Code** and **Done** buttons                |
| :kbd[Mod+.]                             | Jump to the next session waiting on input                                          |
| :kbd[Mod+N] or :kbd[Alt+N]              | Open the new-session dialog                                                        |
| :kbd[Mod+P]                             | Quick-open a file                                                                  |
| :kbd[Mod+S]                             | Save the open file                                                                 |
| :kbd[Mod+/]                             | Show the keyboard shortcuts sheet                                                  |

A shortcut whose target is on the Sessions tab switches there first, and a key whose button isn't shown does nothing. While a session's preview pane is open, :kbd[Alt+D] focuses the pane's primary decision button instead of the diff, and pressing it again returns to the terminal.

Hold :kbd[Shift] as you click a button or menu item, or press :kbd[Shift+Enter] on it, to skip its confirmation, such as on **Restart**, **Revert**, closing a group or deleting a backlog item.

The tabs, toolbar buttons and top-bar buttons show their shortcut in their tooltip. The menu's **Keyboard shortcuts** item opens the same sheet as :kbd[Mod+/].

::screenshot{file="sessions-shortcuts.png"}

## Changing a shortcut

Each action's chord is the config key `sessions.hotkeys.<action>`:

```bash
assist config set sessions.hotkeys.focusTerminal Ctrl+Alt+J
```

Restart the web server and reload the page to apply it. A chord is modifiers plus one key joined by `+`, such as `Alt+S`, `Ctrl+Shift+K` or `Mod+/`. The modifiers are `Ctrl`, `Alt` (`Option`), `Shift`, `Meta` (`Cmd`) and `Mod` (Cmd on macOS, Ctrl elsewhere), and at least one must be something other than Shift. The key is a letter, digit, punctuation, `F1`–`F12` or a named key such as `Enter` or `ArrowUp`. Option chords work on macOS.

An override replaces all of that action's default chords, and `assist config set` rejects an invalid one. `navTab` takes modifiers only (for example `Ctrl+Alt`); the tab digits stay 1–6. Tab card-cycling can't be changed.

The actions are `navTab`, `focusSidebar`, `focusTerminal`, `toggleDiff`, `focusRepoPicker`, `openUpdates`, `openConfig`, `openMenu`, `focusAddAgent`, `focusVsCode`, `focusDone`, `nextWaiting`, `newSession`, `quickOpen`, `save` and `shortcutsSheet`. `assist sessions web --help` lists each with its default.
