# Implementation Plan

- [x] 1. Add CSS variable foundation to globals.css

  - Define CSS variables for all theme colors (primary, secondary, accent, background, surface, text, text_muted)
  - Define CSS variables for all font families (heading, body, code)
  - Set default values matching the current dark theme
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create theme CSS files

  - [x] 2.1 Create dark theme file at /src/styles/themes/dark.css
    - Define dark color scheme CSS variables
    - Use dark backgrounds (#0a0a0f, #16213e) and light text (#e8e6e3)
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Create light theme file at /src/styles/themes/light.css
    - Define light color scheme CSS variables
    - Use light backgrounds (#ffffff, #f3f4f6) and dark text (#1f2937)
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Create demo theme files

  - [x] 3.1 Create Arcana theme at /themes/arcana.css
    - Define purple/black mystical color scheme
    - Use Cinzel font for headings
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 3.2 Create Codex theme at /themes/codex.css
    - Define blue/gray professional color scheme
    - Use clean sans-serif fonts
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Update Layout.tsx for theme loading

  - [x] 4.1 Implement preset theme loading logic
    - Load appropriate CSS file based on config.theme.preset
    - Handle dark, light, arcana, codex presets
    - Add fallback to dark theme for invalid presets
    - _Requirements: 2.1, 3.1, 5.1, 6.1, 10.1_
  - [x] 4.2 Implement system preference detection
    - Detect OS color scheme using matchMedia API
    - Add listener for preference changes
    - Apply dark/light theme based on system preference
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 4.3 Implement config color and font overrides
    - Apply config.theme.colors as inline CSS variables
    - Apply config.theme.fonts as inline CSS variables
    - Ensure overrides apply after preset theme
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 10.2, 10.3_
  - [x] 4.4 Implement custom CSS loading
    - Load custom_css file when specified in config
    - Inject via link tag after preset theme
    - Log warning if file cannot be loaded
    - _Requirements: 9.1, 9.2, 9.3, 10.4_

- [x] 5. Write tests for theme system
  - [x] 5.1 Write unit tests for CSS variable application
    - Test color variables are set on document root
    - Test font variables are set on document root
    - Test override values take precedence
    - _Requirements: 1.1, 1.2, 7.1, 8.1_
  - [x] 5.2 Write unit tests for system preference detection
    - Mock matchMedia for dark preference
    - Mock matchMedia for light preference
    - Test preference change triggers theme update
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
