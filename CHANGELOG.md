# Changelog

## [1.3.0] - 2025-08-06

### Features

- **New Structure**: The project has been completely restructured for better maintainability and scalability.
  - The entire codebase has been migrated from JavaScript to TypeScript, providing improved type safety and developer experience.
  - The code is now organized into modules within the `src` directory, separating concerns such as canvas creation, particle logic, event handling, and configuration.
- **Build System**: Introduced Vite for a modern and efficient build process.
  - Added `vite.config.ts` to manage the build configurations.
  - The library is now bundled into `es` and `umd` formats.
- **Code Quality**: Integrated ESLint and Prettier to enforce a consistent code style and catch potential errors.
  - Added `.eslintrc.js` and `.prettierrc.json` configuration files.
- **Updated Dependencies**: The `package.json` has been updated with new dev dependencies for TypeScript, ESLint, Prettier, and Vite.

### BREAKING CHANGES

- The main entry point of the package has been changed. Please refer to the updated `package.json` for the new file paths.
- The internal API has been refactored to support the new modular structure.

