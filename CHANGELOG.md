# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-21

### Fixed

- **Tech Tree Editor** — Now available for all mod bases (Vanilla, Kaiserreich, TNO, Road to 56). Previously only available for Millennium Dawn.
- **Tech Tree badge** — Now displays the selected mod base name instead of "Universal".
- **Lint errors** — Fixed unused variables and missing dependencies in GUIEditor.
- **Ollama connection** — Improved error handling when connection fails.

### Added

- **GUI Editor** — New visual editor for creating mod GUIs (windows, buttons, progress bars, etc.).
- **Translations** — Added GUI Editor translations for English and Spanish.

### Changed

- Updated build configuration for better chunking.

---

## [1.0.0] - 2026-04-21

### Added

- **Initial release** of HOI4 Mod Studio — a full-featured browser-based IDE for creating Hearts of Iron IV mods.

#### Editors

- **Focus Tree Editor** — Visual node-based editor for creating and editing national focus trees using React Flow.
- **Events Editor** — Full-screen events editor with localization support.
- **Leaders Editor** — Manages national leaders, ministers, and military high command.
- **Economy Editor** — Industrial and resource management interface.
- **Decisions Editor** — Decision tree builder with conditional logic.
- **Ideas Editor** — National spirit and idea builder with effects.
- **On Actions Editor** — Event triggers and scripted guis.

#### Core Features

- **Command Palette** — Quick-access command palette (Ctrl+K) for navigating all editors and actions.
- **Project Management** — Create, save, and manage multiple mod projects.
- **Cloud Sync** — Firebase-backed cloud save with local persistence fallback.
- **Settings System** — Per-project settings for mod metadata and Paradox version targeting.
- **Dark Theme** — Native-feeling dark UI with accent color theming.
- **AI Agent** — Integrated AI agent for writing Paradox script code, editing focus trees, events, and more.
- **Agent Team** — Multi-agent system where specialized agents collaborate on mod creation tasks.
- **Community Hub** — Browse and share mod templates, learn from examples.
- **Playwright Testing** — Visual regression testing via Playwright MCP integration.

#### Technical

- TypeScript with strict type checking (0 lint errors).
- Vite + React 19 build system.
- Firebase Hosting deployment at `https://hoi4-mod-studio.web.app`.
- Component architecture: CommandPalette, AppTopBar, WorkspaceRouter, SettingsModal, AgentSettingsModal.
- Zustand state management with persistence.

### Fixed

- All TypeScript `no-explicit-any` lint errors resolved.
- All React hook lint violations resolved.
- Build pipeline passes with zero errors.