# Alek Labs Keyboard Layer

**Ergonomic keyboard commands for more productive Windows programming sessions.**

Alek Labs Keyboard Layer is an AutoHotkey-based keyboard command layer for Windows. It keeps the standard QWERTY layout intact, but changes how common editing, navigation, deletion, and clipboard operations are triggered. The primary target audience is programmers, because programming involves constant micro-editing: moving through identifiers, jumping across lines, selecting fragments, deleting words, copying snippets, pasting code, undoing changes, and refining text inside editors, terminals, browsers, documentation, and issue trackers.

The project started from a practical programming problem: during long coding sessions, a significant amount of time and attention is spent not on typing new characters, but on navigating and modifying existing text. `Enter` is on the right edge of the keyboard and is normally pressed by extending the right hand or right pinky. Arrow keys require leaving the main typing area. `Home`, `End`, `Delete`, and `Backspace` are also positioned away from the main typing zone. Standard shortcuts such as `Ctrl + C`, `Ctrl + V`, `Ctrl + X`, `Ctrl + Z`, and `Ctrl + A` require repeated left-hand stretching. These movements are small individually, but they accumulate heavily during programming, where precise text manipulation happens continuously.

Alek Labs Keyboard Layer addresses this by turning underused and accessible keys into editing infrastructure. `CapsLock` becomes `Enter`, which gives the left hand direct access to one of the most common action keys. `Left Alt` becomes the main command-layer modifier, pressed naturally by the left thumb. While `Left Alt` is held, selected keys around the home position become navigation, selection, deletion, and clipboard commands.

This is not a modal editor in the Vim sense. There is no separate navigation mode that must be entered and exited. Instead, the command layer is transient: hold `Left Alt`, press the command key, release it, and continue typing. This preserves the directness of normal Windows editing while adding a compact navigation and command system that works across ordinary applications. For programmers, this matters because the same muscle memory can be used not only inside a code editor, but also in commit messages, search fields, browser text boxes, chat tools, documentation pages, terminals, and configuration files.

Navigation is handled mostly by the right hand while the left thumb holds `Alt`. `Alt + H` and `Alt + ;` move one character left and right. `Alt + I` and `Alt + K` move up and down. `Alt + J` and `Alt + L` move by words. `Alt + U` and `Alt + O` move to the beginning and end of the line. These commands keep cursor movement close to the home position instead of sending the right hand to the arrow cluster, `Home`, or `End`. In programming, this is especially useful for moving through identifiers, arguments, operators, indentation, short statements, and dense code lines without breaking hand position.

Selection follows the same spatial model. Adding `Shift` to the same navigation commands turns movement into selection, matching the standard Windows convention where `Shift` modifies navigation into selection. `Alt + Shift + H` selects one character to the left, `Alt + Shift + L` selects one word to the right, and `Alt + Shift + U` or `Alt + Shift + O` selects to the beginning or end of the line. This makes it faster to select variables, function arguments, property chains, string fragments, expressions, and partial lines without reaching for the arrow cluster.

Deletion is built on the same directional structure. `CapsLock` normally acts as `Enter`, but when combined with the `Alt` command layer it becomes a deletion modifier. `Alt + CapsLock + H` deletes one character to the left, `Alt + CapsLock + ;` deletes one character to the right, `Alt + CapsLock + J` and `Alt + CapsLock + L` delete words, and `Alt + CapsLock + U` or `Alt + CapsLock + O` delete to the beginning or end of the line. In practical use, `Alt` activates the layer first, and `CapsLock` modifies the active command into a destructive editing action. This keeps deletion consistent with navigation: the same directional keys operate on the same text direction, while the modifier changes the operation type. For code editing, this makes common operations such as removing an identifier, deleting an argument, clearing the rest of a line, or backing out part of an expression faster and more regular.

Clipboard and editing commands are placed near the left hand because they are not directional navigation actions. `Alt + Q` copies, `Alt + W` pastes, `Alt + S` cuts, `Alt + D` undoes, `Alt + E` redoes, and `Alt + A` selects all. These mappings reduce dependence on `Ctrl` chords and make common editing operations available without repeated left-pinky stretching. During programming sessions, this directly affects repeated actions such as copying a symbol, moving a line fragment, pasting a path, undoing an edit, replacing selected code, or selecting all text in a field.

The intended result is a keyboard workflow where the hands stay close to the home position while programming. The right hand no longer has to travel to the arrow cluster for routine navigation. The left hand no longer has to rely as heavily on `Ctrl`-based shortcut chords. `Enter`, cursor movement, selection, deletion, copy, paste, cut, undo, redo, and select-all become part of a compact command layer over standard QWERTY. In my own programming sessions, this made editing noticeably more productive because the mechanical overhead around navigation and text manipulation was reduced.

The learning curve is intentionally small. Alek Labs Keyboard Layer does not ask the user to relearn letter positions, abandon QWERTY, or switch to a full modal editing environment. The main habit is learning that `Left Alt` opens a temporary command layer, while `Shift` and `CapsLock` modify that layer into selection and deletion. After several focused evenings of use, the mappings become mechanical: navigation, selection, deletion, and clipboard operations become available without reaching for distant keys.

Alek Labs Keyboard Layer can be useful for general writing, documentation, translation, and note-taking, but its strongest use case is programming. Code editing produces a high frequency of cursor movement, word-level navigation, line-level operations, selection, deletion, copy/paste, undo, and redo. That is exactly the operation profile this command layer is designed to optimize.

## Source code
[https://github.com/aleklabs/keyboard-layer](https://github.com/aleklabs/keyboard-layer)

## Installation

Alek Labs Keyboard Layer requires [AutoHotkey](https://www.autohotkey.com/) on Windows.

### Recommended installation

1. Install [AutoHotkey](https://www.autohotkey.com/).
2. Download the latest release: [aleklabs-keyboard-layer.zip](https://github.com/AlekLabs/keyboard-layer/releases/latest/download/aleklabs-keyboard-layer.zip).
3. Extract the ZIP file.
4. Run `aleklabs-keyboard-layer.ahk`.

The release package includes the script, tray icon, README, and MIT license.

### Start automatically with Windows

To start the script after login:

1. Press `Win + R`.
2. Enter `shell:startup`.
3. Create a shortcut to `aleklabs-keyboard-layer.ahk` in the opened Startup folder.

## Hotkeys

| Hotkey | Action | Problem solved |
|---|---|---|
| `CapsLock` | `Enter` | Moves `Enter` to a large, accessible left-side key and reduces right-pinky extension toward the keyboard edge. |
| `Alt + I` | Move cursor up | Keeps vertical navigation near the home position instead of using the arrow-key cluster. |
| `Alt + K` | Move cursor down | Keeps vertical navigation near the home position instead of using the arrow-key cluster. |
| `Alt + H` | Move cursor one character left | Keeps character-level navigation inside the main typing area. |
| `Alt + ;` | Move cursor one character right | Keeps character-level navigation inside the main typing area. |
| `Alt + J` | Move cursor one word left | Replaces `Ctrl + Left` with a home-position command-layer chord. |
| `Alt + L` | Move cursor one word right | Replaces `Ctrl + Right` with a home-position command-layer chord. |
| `Alt + U` | Move to beginning of line | Avoids reaching for `Home`. |
| `Alt + O` | Move to end of line | Avoids reaching for `End`. |
| `Alt + Shift + I` | Select upward | Replaces `Shift + Up` without using the arrow-key cluster. |
| `Alt + Shift + K` | Select downward | Replaces `Shift + Down` without using the arrow-key cluster. |
| `Alt + Shift + H` | Select one character left | Keeps character selection near the home position. |
| `Alt + Shift + ;` | Select one character right | Keeps character selection near the home position. |
| `Alt + Shift + J` | Select one word left | Replaces `Ctrl + Shift + Left` with a home-position command-layer chord. |
| `Alt + Shift + L` | Select one word right | Replaces `Ctrl + Shift + Right` with a home-position command-layer chord. |
| `Alt + Shift + U` | Select to beginning of line | Avoids reaching for `Shift + Home`. |
| `Alt + Shift + O` | Select to end of line | Avoids reaching for `Shift + End`. |
| `Alt + CapsLock + H` | Delete character left / `Backspace` | Deletes leftward without reaching for `Backspace`. |
| `Alt + CapsLock + ;` | Delete character right | Deletes rightward without reaching for `Delete`. |
| `Alt + CapsLock + J` | Delete word left | Replaces `Ctrl + Backspace` with a directional deletion chord. |
| `Alt + CapsLock + L` | Delete word right | Replaces `Ctrl + Delete` with a directional deletion chord. |
| `Alt + CapsLock + U` | Delete to beginning of line | Provides line-head deletion without manual selection followed by `Delete` or `Backspace`. |
| `Alt + CapsLock + O` | Delete to end of line | Provides line-tail deletion without manual selection followed by `Delete` or `Backspace`. |
| `Alt + Q` | Copy | Replaces `Ctrl + C` and reduces repeated left-pinky `Ctrl` usage. |
| `Alt + W` | Paste | Replaces `Ctrl + V` and reduces repeated left-pinky `Ctrl` usage. |
| `Alt + S` | Cut | Replaces `Ctrl + X` and reduces repeated left-pinky `Ctrl` usage. |
| `Alt + D` | Undo | Replaces `Ctrl + Z` and reduces repeated left-pinky `Ctrl` usage. |
| `Alt + E` | Redo | Replaces `Ctrl + Y` and reduces repeated left-pinky `Ctrl` usage. |
| `Alt + A` | Select all | Replaces `Ctrl + A` and reduces repeated left-pinky `Ctrl` usage. |
| `Alt + Backspace` | Delete previous word | Provides direct word deletion without using the standard `Ctrl + Backspace` chord. |