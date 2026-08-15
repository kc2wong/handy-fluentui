# Changelog

## [1.0.1] - 2026-08-15

### Fixed

- `FuiMenuBarRadioItem` / `FuiMenuBarCheckboxItem` didn't render their selection indicator. They now use Fluent's real `MenuItemRadio` / `MenuItemCheckbox` internally; the public API is unchanged.

## [1.0.0] - 2026-08-14

### 1. Naming convention standardized

Every component file now lives under a consistent `fui-*` prefix, and every exported Props type is consistently prefixed `Fui*` (previously some — `InputDateProps`, `InputTextProps`, `TabProps`, `ColumnProps`, ...— were not). On top of the renames, every input component's props were converted from an implicit `Omit<SomeFluentUiComponentProps, ...>` passthrough to a fully independent, explicit interface, so no FluentUI prop types leak into the public API anymore.

| Old export (old file) | New export (new file) | New / changed props |
|---|---|---|
| `FuiInputCheckbox` (`InputCheckboxProps`) — `input-checkbox.tsx` | `FuiCheckbox` (`FuiCheckboxProps`) — `fui-checkbox.tsx` | `checked`, `label`, `disabled` are now explicit props instead of an implicit Fluent `CheckboxProps` passthrough; `onChange` is now required |
| `FuiInputSwitch` (`InputSwitchProps`) — `input-switch.tsx` | `FuiSwitch` (`FuiSwitchProps`) — `fui-switch.tsx` | `checked`, `defaultChecked`, `label`, `disabled` are now explicit props |
| `FuiInputRadio` (`InputRadioProps`) — `input-radio.tsx` | `FuiRadioGroup` + `FuiRadio` (`FuiRadioGroupProps` + `FuiRadioProps`) — `fui-radio.tsx` | Split into a group component and an item component. Children are now `<FuiRadio value label disabled? id? />` instead of raw Fluent `<Radio>` elements |
| `FuiInputDate` (`InputDateProps`) — `input-date.tsx` | `FuiInputDate` (`FuiInputDateProps`) — `fui-input-date.tsx` | New explicit `placeholder`, `disabled`; `onChange` signature tightened from `(date: Date \| null \| undefined) => void` to `(date: Date \| null) => void`; mobile drawer close button restyled |
| `FuiInputDropdown` (`InputDropdownProps` / `InputDropdownOption`) — `input-dropdown.tsx` | `FuiInputDropdown` (`FuiInputDropdownProps` / `FuiInputDropdownOption`) — `fui-input-dropdown.tsx` | New explicit `multiselect`, `placeholder`, `disabled`, `className`, `style`, `listbox`, `positioning` |
| `FuiInputMultiLangText` (`InputMultiLangTextProps`) — `input-multi-lang.tsx` | `FuiInputMultiLangText` (`FuiInputMultiLangTextProps`) — `fui-input-multi-lang.tsx` | `textComponent` is now typed against `FuiInputTextProps` (was `InputTextProps`) |
| `FuiInputNumber` (`InputNumberProps`) — `input-number.tsx` | `FuiInputNumber` (`FuiInputNumberProps`) — `fui-input-number.tsx` | New `appearance` (`InputNumberAppearance`: `'outline' \| 'underline' \| 'filled-darker' \| 'filled-lighter' \| 'filled-darker-shadow' \| 'filled-lighter-shadow'`), explicit `size` |
| `FuiInputText` (`InputTextProps`) — `input-text.tsx` | `FuiInputText` (`FuiInputTextProps`) — `fui-input-text.tsx` | New `contentBefore`, `contentAfter` |
| `FuiInputTextArea` (`InputTextAreaProps`) — `input-textarea.tsx` | `FuiInputTextArea` (`FuiInputTextAreaProps`) — `fui-input-textarea.tsx` | `readOnly` is now the plain native HTML attribute (previously intercepted to silently swallow `onChange`); explicit `rows` (default `4`) and `maxLength` handling |
| `FuiInputGroup` (`InputGroupProps`) — `input-group.tsx` | `FuiInputGroup` (`FuiInputGroupProps`) — `fui-input-group.tsx` | No prop changes |
| `FuiButtonPanel` (`ButtonPanelProps`) | `FuiButtonPanel` (`FuiButtonPanelProps`) | No prop changes |
| `FuiTabList` / `FuiTab` (`TabListProps` / `TabProps`) | `FuiTabList` / `FuiTab` (`FuiTabListProps` / `FuiTabProps`) | `FuiTab` gains explicit `icon`, `disabled`; `FuiTabList` gains explicit `className`, `style` |
| `FuiTable` / `FuiColumn` (`TableProps` / `ColumnProps`) | `FuiTable` / `FuiColumn` (`FuiTableProps` / `FuiColumnProps`) | No prop changes |
| `FuiImageCarousel` (`ImageCarouselProps`) — `fui-image-carousell.tsx` (typo) | `FuiImageCarousel` (`FuiImageCarouselProps`) — `fui-image-carousel.tsx` | No prop changes |

### 2. New components

- **`FuiAccordion`** / **`FuiAccordionItem`** — collapsible panel group, single- or multi-expand
- **`FuiBreadcrumb`** — collapsible first > … > last trail, driven by `useBreadcrumb()`
- **`FuiButton`** / **`FuiIconButton`** — button with appearance/size/icon, plus a square icon-only variant
- **`FuiCard`** / **`FuiCardHeader`** / **`FuiCardPreview`** / **`FuiCardFooter`** — content-display container
- **`FuiDivider`** — horizontal rule with an optional centered label
- **`FuiDrawer`** / **`FuiDrawerHeader`** / **`FuiDrawerBody`** — overlay or inline side panel, forced to a bottom sheet on mobile
- **`FuiMenuBar`** family (**`FuiMenuBarMenu`**, **`FuiMenuBarItem`**, **`FuiMenuBarCheckboxItem`**, **`FuiMenuBarRadioGroup`**, **`FuiMenuBarRadioItem`**, **`FuiMenuBarSeparator`**, **`FuiMenuBarLabel`**, **`FuiMenuBarSub`**) — horizontal dropdown-menu bar, e.g. a desktop-app-style File/Edit/View menu
- **`FuiText`** and its fixed-type variants (**`FuiLabel`**, **`FuiTitle1`**, **`FuiTitle2`**, **`FuiSubTitle1`**, **`FuiSubTitle2`**, **`FuiBody1`**, **`FuiBody2`**, **`FuiCaption1`**, **`FuiCaption2`**) — typography primitives
- **`FuiToggle`** — pressable toggle button
- **`FuiTooltip`** — hover- or click-triggered message, with configurable position and auto-dismiss

### Other changes

- Package version bumped to `1.0.0`
- `src/utils` renamed to `src/lib` (repoints the `@util` alias)
- `build:lib` now bundles a single `dist/index.d.ts` via API Extractor instead of one declaration file per component
- Mobile drawer polish (title-left/close-right header, wider horizontal padding) retrofitted across `FuiInputDate`, `FuiInputDropdown`, `FuiInputMultiLangText`
