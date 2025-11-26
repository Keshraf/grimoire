# Design Document

## Overview

This design outlines the structure and configuration for a React component library package located at `/packages/core`. The library will use Vite in library mode for optimal build performance and will be published as `@nexus/core`. The design focuses on creating a minimal, well-organized foundation that's ready for component development.

## Architecture

### Package Structure

```
packages/core/
├── src/
│   ├── types/
│   │   └── index.ts
│   ├── context/
│   ├── hooks/
│   ├── components/
│   ├── utils/
│   ├── api/
│   ├── styles/
│   │   ├── base.css
│   │   └── animations.css
│   └── index.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore (optional)
```

### Build System

- **Vite Library Mode**: Configured to build the package as a library with proper entry points
- **Output Formats**: ESM (primary) and optionally UMD for broader compatibility
- **TypeScript**: Full type checking and declaration file generation
- **React Plugin**: Fast Refresh during development, optimized JSX transformation for production

## Components and Interfaces

### Configuration Files

#### package.json

```json
{
  "name": "@nexus/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/style.css"
  },
  "files": ["dist"],
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**Design Decisions:**

- React and react-dom as peer dependencies to avoid version conflicts in consuming applications
- ESM as primary format with CJS fallback for compatibility
- Separate style export for CSS imports
- Type declarations included for TypeScript consumers

#### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "NexusCore",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
```

**Design Decisions:**

- Library mode with explicit entry point
- External React dependencies to avoid bundling
- Named exports for UMD builds
- Dual format output (ESM + CJS)

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": false
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Design Decisions:**

- Strict TypeScript settings for code quality
- React JSX transform for modern React
- Declaration files for TypeScript consumers
- Modern ES2020 target for optimal output

#### tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Design Decisions:**

- Separate config for build tooling
- Allows Vite config to use modern TypeScript features

### Directory Structure

#### /src/types

- Purpose: TypeScript type definitions and interfaces
- Initial state: Empty `index.ts` file ready for type exports

#### /src/context

- Purpose: React Context providers and consumers
- Initial state: Empty directory

#### /src/hooks

- Purpose: Custom React hooks
- Initial state: Empty directory

#### /src/components

- Purpose: React components
- Initial state: Empty directory

#### /src/utils

- Purpose: Utility functions and helpers
- Initial state: Empty directory

#### /src/api

- Purpose: API client code and data fetching utilities
- Initial state: Empty directory

#### /src/styles

- Purpose: Global styles and CSS utilities
- Initial state: Empty `base.css` and `animations.css` files

#### /src/index.ts

- Purpose: Main entry point that exports all public APIs
- Initial state: Empty file ready for exports

## Data Models

No data models are required for the initial setup. The structure is prepared to accommodate future data models in the `/src/types` directory.

## Error Handling

Build-time error handling will be managed by:

- TypeScript compiler for type errors
- Vite for build errors
- ESLint (optional future addition) for code quality

## Testing Strategy

Testing infrastructure is not included in the initial setup but the structure supports future addition of:

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests if needed

The package structure allows for a `/tests` or `/__tests__` directory to be added alongside `/src` when testing is implemented.

## Build and Development Workflow

1. **Development**: Run `npm run dev` to start Vite dev server (useful for testing with a demo app)
2. **Build**: Run `npm run build` to compile TypeScript and bundle the library
3. **Output**: Built files will be in `/dist` directory
4. **Publishing**: The `files` field in package.json ensures only `/dist` is published

## Future Considerations

- ESLint and Prettier configuration for code consistency
- Testing setup with Vitest
- Storybook for component documentation
- CI/CD pipeline for automated builds and publishing
- Monorepo tooling if this becomes part of a larger workspace
