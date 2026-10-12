# Lang LombokRateLimit

## 1. i18n level

Level E (error messages and documentation only). The library does not display text to end users.

## 2. Message ID catalog

There is no `locales/` catalog yet. Errors use the language's standard error types (RangeError/ValueError) with the argument name as an English technical message. Canonical message IDs are planned for 0.2.0 if LombokLocale becomes an optional dependency.

## 3. Core-20 and Nusantara coverage

Current coverage: 0 of 20 (there are no user-facing messages to translate). Documentation language: English (default for all Lombok Ecosystem repositories).

## 4. How to add a language

Once a catalog exists: add `locales/<bcp47>/lombokratelimit.json` and update the coverage table.

## 5. LombokLocale dependency

None (optional in the future).
