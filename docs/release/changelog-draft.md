# Changelog Draft (Sprint B Closure)

## [Unreleased] - 2026-05-08

### Added
- **CCNL 23.02.2026 Support**:
    - Automatic calculation of 0.14% increase (Stable) on Monte Salari 2021.
    - Support for 0.22% optional increase (Variable) for 2026 and future years.
    - One-time arrears 2024-2025 calculation (0.28% Monte Salari 2021).
    - Conglobation logic for "Indennità di Comparto" with Table C reference.
- **D.L. 25/2025 Compliance**:
    - New field `st_incrementoDL25_2025` for fund increase.
    - Calculation of 48% limit based on 2023 salary data.
    - Unified alias logic for legacy `st_incrementoDecretoPA`.
- **Contextual Normative Guide**:
    - Popovers with functional and normative descriptions on every fund item.
    - Full centralization of metadata in `src/logic/fundFieldDefinitions.ts`.
    - Transparency notes for complex items (Judgement expenses, ISTAT, Casinò).
- **Elevated Qualifications (EQ)**:
    - Dedicated metadata and guide for EQ resources in distribution page.
    - Proportional splitting logic for new CCNL increases.

### Fixed
- **Anti-Double Counting**: Resolved risk of double counting when both DL 25/2025 and Decreto PA keys were present in annual data.
- **UI Consistency**: Removed all hardcoded normative texts from React pages.
- **Tabella 15**: Updated column mapping for 2026 specific items.

### Changed
- **Refactoring**: Consolidated calculation logic into `src/logic/calculation/` subfolder.
- **UI Layout**: Improved transparency and readability of the fund constitution wizard.
- **Reporting**: Enhanced PDF report to include new CCNL and DL 25/2025 details.

### Security
- Verified absence of sensitive data (Supabase tokens, API keys) in source files.
- Hardened .gitignore for environment and temporary files.
