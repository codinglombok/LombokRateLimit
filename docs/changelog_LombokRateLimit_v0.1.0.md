# Changelog LombokRateLimit

Newest entry first. The full file is `CHANGELOG.md` in the repository root.

## [0.1.0] - 2026-10-07

### Added
- Initial release: TypeScript reference and Python port.
- Shared vectors (2239 cases) and a runner in both ports.
- The 12 standard documents (initial content).

### Security
- Input outside the allowed ranges is rejected with an error (RangeError/ValueError); see the SPEC.
