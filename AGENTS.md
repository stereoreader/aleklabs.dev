<c:\www\agent-config\agents\AGENTS.md

## Translations
If I dont' provide any translation directory issue an error and don't translate anything.
Use `lang.md` file closest to the translation directory (up the directory path) for the list of languages to be translated to.
If the file is not found, issue an error and don't translate anything.
if the translation directory contains `lang` folder - place the translated files there with subfolders name after the languages.
Clear the `lang` folder before filling it.
The subfolders should be translated too (if exist) except of course the `lang` directory to avoid a recursive endless loop.
By default translate only markdown *.md files unless stated otherwise.