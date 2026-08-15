# Handy FluentUI

Opinionated React components built on top of [FluentUI v9](https://react.fluentui.dev/) with responsive, form-friendly behaviours out of the box.

- Consistent label / hint / error / info layout via the `withInputField` HOC
- Automatic mobile adaptation (breakpoint-driven theme switching, bottom-sheet drawers, stacking layouts)
- Imperative `useToast`, `useSpinner`, `useDialog` APIs
- i18n-ready label overrides through the provider

An equivalent library built on [shadcn/ui](https://ui.shadcn.com/) instead of FluentUI, mirroring the same component API surface under a `Hui*` prefix, is available at [kc2wong/handy-shadcnui](https://github.com/kc2wong/handy-shadcnui).

---

## Commands

```bash
yarn dev        # Start dev server (Vite)
yarn build      # Production build
yarn test       # Run tests in watch mode (Vitest)
yarn test:run   # Run tests once
yarn lint       # ESLint
```

---

## Setup

Wrap your application in `HandyFluentUiProvider` once at the root. All components and hooks must be descendants of this provider.

```tsx
import { webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { HandyFluentUiProvider } from './providers/handy-fluent-ui-provider';

function App() {
  return (
    <HandyFluentUiProvider
      mobileBreakpoint={600}
      supportedTheme={{
        web: { light: webLightTheme, dark: webDarkTheme },
        default: 'light',
      }}
      component={{
        toast: { dismissTimeout: 3000 },
      }}
    >
      {/* your app */}
    </HandyFluentUiProvider>
  );
}
```

### Provider props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mobileBreakpoint` | `number` | `600` | Viewport width (px) at which mobile layout and theme activate |
| `supportedTheme` | `SupportedTheme` | built-in themes | Theme objects for web/mobile platforms |
| `component` | `Component` | — | Spinner and toast configuration |
| `loggerConfig` | `{ logMessage? }` | `console.log` | Custom logger |
| `children` | `ReactNode` | — | Required |

### `supportedTheme`

```ts
type SupportedTheme = {
  web?:    { light?: Theme; dark?: Theme; custom?: Theme };
  mobile?: { light?: Theme; dark?: Theme; custom?: Theme };
  default?: 'light' | 'dark' | 'custom'; // defaults to system preference
};
```

A `custom` theme object must be supplied to make `'custom'` selectable via `useTheme().switchTheme('custom')`. A single custom theme passed under either `web` or `mobile` is automatically shared with the other platform.

### `component` config

```ts
type Component = {
  spinner?: SpinnerContextConfig;
  toast?: ToastContextConfig;
};
```

Component-specific labels (`FuiTable` pagination text, `FuiImageCarousel` tooltips, `FuiInputMultiLangText` language names) are passed directly as props on each component — see each component's section below.

---

## Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useTheme()` | `{ currentTheme, switchTheme }` | Read and change the active theme |
| `useIsMobile()` | `boolean` | True when viewport ≤ `mobileBreakpoint` |
| `useBreadcrumb()` | `{ items, isCollapsed, toggleCollapsed, start, append, peek, popTill }` | Read and update the trail rendered by `FuiBreadcrumb` |
| `useToast()` | `{ success, error, info, warning }` | Show toast notifications |
| `useSpinner()` | `{ show, hide }` | Show/hide the global overlay spinner |
| `useDialog()` | `{ openDialog }` | Show an imperative confirmation dialog |
| `useLogger()` | `(message, level?) => void` | Log via the configured logger |
| `useTimeZone()` | `{ timeZone, setTimeZone, zonedDate2LocalDate }` | Read, update, and decompose dates in the active time zone |

All hooks throw if called outside `HandyFluentUiProvider`.

### `useTimeZone`

The provider initialises `timeZone` from `Intl.DateTimeFormat().resolvedOptions().timeZone` (the browser's local time zone). `useTimeZone` lets you read or override it and decompose a `Date` object into its constituent parts within that zone.

```tsx
const { timeZone, setTimeZone, zonedDate2LocalDate } = useTimeZone();

// Read the active time zone
console.log(timeZone); // e.g. 'Asia/Tokyo'

// Switch to a different time zone (validated; invalid values are ignored with a warning)
setTimeZone('America/New_York');

// Extract date parts in the active time zone
const parts = zonedDate2LocalDate(new Date());
// { year, month, day, hour, minute, second }

// Extract date parts in an explicit time zone (overrides the active one for this call)
const tokyoParts = zonedDate2LocalDate(new Date(), 'Asia/Tokyo');
```

**`LocalDate`**

```ts
type LocalDate = {
  year: number;
  month: number;   // 1–12
  day: number;     // 1–31
  hour: number;    // 0–23
  minute: number;  // 0–59
  second: number;  // 0–59
};
```

| Return value | Type | Description |
|---|---|---|
| `timeZone` | `string` | Currently active IANA time zone identifier |
| `setTimeZone` | `(tz: string) => void` | Update the active time zone. Invalid identifiers are ignored and logged as a warning. |
| `zonedDate2LocalDate` | `(date: Date, tz?: string) => LocalDate` | Decompose a `Date` into year/month/day/hour/minute/second in the active (or an explicitly supplied) time zone. Falls back to local time and logs a warning if `tz` is invalid. |

---

## Common field props (`FieldLayoutProps`)

Every form input component (`FuiInputText`, `FuiInputDate`, `FuiRadioGroup`, ...) inherits these props from the `withInputField` HOC:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string \| null` | — | Field label. `null` suppresses the label container entirely |
| `required` | `boolean` | `false` | Shows a red asterisk next to the label |
| `hint` | `string` | — | Supplemental info shown in a popover (info icon appears) |
| `errorMessage` | `string` | — | Error text shown in red below the input |
| `infoMessage` | `string` | — | Grey helper text below the input (hidden when `errorMessage` is present) |
| `noMessage` | `boolean` | `false` | Suppresses the message area and its reserved space |
| `additionalMessage` | `ReactNode` | — | Extra content on the right of the message row |
| `clearable` | `boolean` | `true` | Shows an eraser icon that clears the value |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Label position: above or to the left of the input |
| `labelWidth` | `'quarter' \| 'third' \| 'half' \| 'auto'` | — | Fixed label width when `layout='horizontal'` |

Horizontal layout automatically collapses to vertical on mobile.

---

## Components

### `FuiInputText`

Text input with optional show/hide toggle for passwords.

```tsx
<FuiInputText
  label="Full Name"
  value={name}
  onChange={setName}
  required
  hint="Enter your legal name."
/>

<FuiInputText
  label="Password"
  value={password}
  onChange={setPassword}
  type="password"
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string \| null` | Yes | Current value |
| `onChange` | `(value: string \| null) => void` | Yes | Change callback |
| `type` | `'text' \| 'email' \| 'password'` | No | Defaults to `'text'`. Password adds show/hide toggle; email blocks duplicate `@`. |
| `contentBefore` | `ReactElement` | No | Content rendered inside the input, left-aligned (e.g. an icon) |
| `contentAfter` | `ReactElement` | No | Content rendered inside the input, right-aligned (e.g. an icon button). Ignored when `type` is `'password'`. |

---

### `FuiInputTextArea`

Multi-line text area with optional character counter.

```tsx
<FuiInputTextArea
  label="Biography"
  value={bio}
  onChange={setBio}
  maxLength={300}
  hint="Max 300 characters."
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string \| null` | Yes | Current value |
| `onChange` | `(value: string \| null) => void` | Yes | Change callback |
| `maxLength` | `number` | No | Automatically appends a counter (`n / max`) unless `additionalMessage` is set |
| `rows` | `number` | No | Number of visible text lines. Defaults to `4`. |
| `readOnly` | `boolean` | No | Native HTML read-only attribute, forwarded as-is to the `<textarea>` |

---

### `FuiInputNumber`

Number input with keystroke filtering and optional SpinButton mode.

```tsx
{/* Plain number input */}
<FuiInputNumber
  label="Age"
  value={age}
  onChange={setAge}
  min={0}
  max={120}
  precision={0}
  allowNegative={false}
/>

{/* SpinButton mode (set step) */}
<FuiInputNumber
  label="Salary"
  value={salary}
  onChange={setSalary}
  step={1000}
  min={0}
  formatter={(v) => `$${v.toLocaleString()}`}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `number \| null` | Yes | Current value |
| `onChange` | `(value: number \| null) => void` | Yes | Change callback |
| `step` | `number` | No | Enables SpinButton mode; direct typing is disabled. On mobile, renders a plain `Input` with horizontally-arranged up/down arrow buttons instead of the native SpinButton. |
| `precision` | `number` | No | Decimal places allowed. Defaults to `0`. Fixed at `0` in SpinButton mode. |
| `min` | `number` | No | Minimum value |
| `max` | `number` | No | Maximum value |
| `allowNegative` | `boolean` | No | When `false`, blocks the minus key. Defaults to `true`. |
| `formatter` | `(value: number) => string` | No | Formats the display value when the field is unfocused |
| `appearance` | `'outline' \| 'underline' \| 'filled-darker' \| 'filled-lighter' \| 'filled-darker-shadow' \| 'filled-lighter-shadow'` | No | Visual appearance of the underlying `Input`/`SpinButton` |
| `size` | `'small' \| 'medium' \| 'large'` | No | Input size |

---

### `FuiInputDate`

Date picker. Renders a FluentUI `DatePicker` on desktop and a bottom-sheet calendar drawer on mobile.

```tsx
<FuiInputDate
  label="Date of Birth"
  value={date}
  onChange={(d) => setDate(d ?? null)}
  required
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `Date \| null` | Yes | Selected date |
| `onChange` | `(date: Date \| null) => void` | Yes | Change callback |
| `formatter` | `(date: Date \| null) => string` | No | Custom date format function. Defaults to `toLocaleDateString()`. |
| `placeholder` | `string` | No | Placeholder text shown when empty |
| `disabled` | `boolean` | No | Disables interaction |
| `readOnly` | `boolean` | No | Suppresses the calendar popup/drawer. Desktop renders a plain read-only `Input`; mobile hides the calendar icon and ignores clicks. |

---

### `FuiInputTime`

Time picker with up/down arrow buttons. Clicking an arrow increments or decrements the time segment under the cursor. On mobile the arrows are laid out in a horizontal row with larger icons.

```tsx
import { FuiInputTime, FuiTime } from './components/fui-input-time';

const [shiftStart, setShiftStart] = useState<FuiTime | null>(null);

{/* 12-hour format with seconds */}
<FuiInputTime
  label="Shift Start"
  value={shiftStart}
  onChange={setShiftStart}
  in24HourFormat={false}
  withSeconds
/>

{/* 24-hour format, cascade carry enabled */}
<FuiInputTime
  label="Shift End"
  value={shiftEnd}
  onChange={setShiftEnd}
  cascadeCarry
/>
```

**`FuiTime`** type:

```ts
type FuiTime = {
  hour: number;    // 0–23
  minute: number;  // 0–59
  second: number;  // 0–59
};
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `FuiTime \| null` | Yes | Current time value |
| `onChange` | `(time: FuiTime \| null) => void` | Yes | Change callback |
| `in24HourFormat` | `boolean` | No | When `false`, display uses 12-hour clock and shows an AM/PM toggle. Defaults to `true`. |
| `withSeconds` | `boolean` | No | When `true`, shows the seconds segment. Defaults to `false`. |
| `cascadeCarry` | `boolean` | No | When `true`, incrementing past a segment boundary (e.g. 59m → 0m) also advances the next segment. Defaults to `false`. |
| `readOnly` | `boolean` | No | Hides the up/down arrows; the input becomes non-interactive. |

---

### `FuiInputDropdown`

Dropdown with single or multi-select. Renders a bottom-sheet drawer on mobile with the field label (or `placeholder`) as the drawer title.

```tsx
const options = [
  { value: 'hk', text: 'Hong Kong', group: 'Asia' },
  { value: 'gb', text: 'United Kingdom', group: 'Europe' },
];

{/* Single select */}
<FuiInputDropdown
  label="Country"
  value={country}
  onChange={(val) => setCountry(val as string | null)}
  options={options}
/>

{/* Multi-select */}
<FuiInputDropdown
  label="Tags"
  value={tags}
  onChange={(val) => setTags(val as string[])}
  options={options}
  multiselect
/>

{/* Constrain dropdown height on desktop */}
<FuiInputDropdown
  label="Country"
  value={country}
  onChange={(val) => setCountry(val as string | null)}
  options={options}
  listbox={{ style: { maxHeight: '200px', overflowY: 'auto' } }}
  positioning={{ autoSize: false }}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string \| string[] \| null` | Yes | Selected value(s) |
| `onChange` | `(value: string \| string[] \| null) => void` | Yes | Change callback |
| `options` | `FuiInputDropdownOption[]` | Yes | Option list |
| `multiselect` | `boolean` | No | Enable multi-select mode. Defaults to `false`. |
| `placeholder` | `string` | No | Placeholder text shown when empty |
| `disabled` | `boolean` | No | Disables interaction |
| `readOnly` | `boolean` | No | Silently ignores selection changes |
| `className` | `string` | No | Custom CSS class for the dropdown root |
| `style` | `CSSProperties` | No | Custom CSS styles for the dropdown root |
| `listbox` | `{ style?: CSSProperties }` | No | Style passthrough for the inner `Listbox`. Use `style.maxHeight` to constrain dropdown height. Must pass `positioning={{ autoSize: false }}` alongside this, otherwise Floating UI overrides inline `max-height`. |
| `positioning` | `{ autoSize?: boolean }` | No | Positioning passthrough for the dropdown popup |

**`FuiInputDropdownOption`**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Option value |
| `text` | `string` | Yes | Display text (used for search/filtering) |
| `group` | `string` | No | Group label |
| `render` | `() => ReactNode` | No | Custom option content renderer |

---

### `FuiRadioGroup` / `FuiRadio`

Radio group with a shared label. `FuiRadio` items are independent components (not raw Fluent `<Radio>` elements).

```tsx
<FuiRadioGroup
  label="Gender"
  value={gender}
  onChange={setGender}
  layout="horizontal"
>
  <FuiRadio label="Male" value="male" />
  <FuiRadio label="Female" value="female" />
  <FuiRadio label="Other" value="other" />
</FuiRadioGroup>
```

**`FuiRadioGroup` props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | No | Controlled selected value |
| `defaultValue` | `string` | No | Uncontrolled initial value |
| `name` | `string` | No | Shared name for the underlying radio inputs on form submission |
| `onChange` | `(value: string) => void` | No | Change callback |
| `disabled` | `boolean` | No | Disables the entire group |
| `required` | `boolean` | No | Marks the group mandatory |
| `readOnly` | `boolean` | No | Silently ignores changes |
| `layout` | `'vertical' \| 'horizontal'` | No | Radio button layout direction. `horizontal-stacked` is not supported. |

**`FuiRadio` props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Value submitted when this option is selected |
| `label` | `string` | Yes | Label rendered next to the radio button |
| `disabled` | `boolean` | No | Disables interaction |
| `id` | `string` | No | Optional id override; auto-generated when omitted |

---

### `FuiCheckbox`

Checkbox with optional read-only mode.

```tsx
<FuiCheckbox
  label="I agree to the terms"
  checked={agreed}
  onChange={setAgreed}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Text label rendered next to the checkbox |
| `checked` | `boolean` | No | Checked state. Defaults to `false`. |
| `onChange` | `(checked: boolean) => void` | Yes | Change callback — receives `boolean` directly |
| `disabled` | `boolean` | No | Disables interaction |
| `readOnly` | `boolean` | No | Visually interactive but ignores changes |

---

### `FuiSwitch`

Toggle switch. `onChange` delivers a `boolean` directly.

```tsx
<FuiSwitch
  label="Receive notifications"
  checked={notifications}
  onChange={setNotifications}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Text displayed next to the switch |
| `checked` | `boolean` | No | Checked state. Defaults to `false`. |
| `defaultChecked` | `boolean` | No | Initial value for uncontrolled usage |
| `onChange` | `(value: boolean) => void` | Yes | Change callback — receives `boolean` directly |
| `disabled` | `boolean` | No | Disables interaction |
| `readOnly` | `boolean` | No | Silently ignores changes |

---

### `FuiInputMultiLangText`

Text input for multi-language values. A translate icon opens a drawer with one field per configured language (up to 3).

```tsx
<FuiInputMultiLangText
  label="Job Title"
  value={jobTitle}
  onChange={setJobTitle}
/>
```

`value` / `onChange` use `MultiLangText`:

```ts
type MultiLangText = {
  valueInLangOne: string | null;
  valueInLangTwo: string | null;
  valueInLangThree: string | null;
};
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `MultiLangText \| null` | Yes | Multi-language text value |
| `onChange` | `(value: MultiLangText \| null) => void` | Yes | Change callback |
| `label` | `string` | Yes | Field label — also used as the drawer title |
| `langLabel` | `{ languages: string[] }` | No | Names of each language slot shown in the drawer (up to 3). When fewer than 2 are provided, the translate icon is hidden. |
| `textComponent` | `ComponentType<FuiInputTextProps>` | No | Overrides the inner text component. Defaults to `FuiInputText`. |

---

### `FuiInputGroup`

Groups multiple inputs under one shared label with weighted distribution. Items stack vertically on mobile.

```tsx
<FuiInputGroup
  label="City / Zip"
  items={[
    { element: <FuiInputText value={city} onChange={setCity} placeholder="City" />, weight: 2 },
    { element: <FuiInputText value={zip} onChange={setZip} placeholder="Zip" />, weight: 1 },
  ]}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Shared label for the group |
| `items` | `{ element: ReactElement; weight?: number }[]` | Yes | Inputs with optional flex-grow weights (default `1`) |

Each item's own `label` is hidden; use the group-level `label` instead.

---

### `FuiTable` / `FuiColumn`

Data table driven by `FuiColumn` children. Supports sorting and pagination with horizontal scroll.

```tsx
<FuiTable
  data={records}
  pagination={{
    offset: 0,
    pageSize: 10,
    pageSizeOption: [5, 10, 20],
    totalRecord: records.length,
    position: 'bottom',
  }}
  width={{ minWidth: '560px' }}
>
  <FuiColumn field="id" header="ID" style={{ width: '10%' }} />
  <FuiColumn field="name" header="Name" sortable style={{ width: '40%' }} />
  <FuiColumn
    field="status"
    header="Status"
    builder={(value) => <Badge>{String(value)}</Badge>}
    style={{ width: '20%' }}
  />
</FuiTable>
```

**`FuiTable` props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | Yes | Array of row objects |
| `pagination` | `PaginationProps` | No | Pagination configuration |
| `onPageOrSort` | `(page?, sort?) => void` | No | Called on page change or sort click. Omit to use local sort state. |
| `width` | `Pick<CSSProperties, 'width' \| 'minWidth' \| 'maxWidth'>` | No | Width constraints on the inner DataGrid. Set `minWidth` to enable horizontal scroll on mobile. |
| `label` | `FuiTableLabel` | No | Pagination text overrides. `pageRange` and `paginationBar.nextN` / `previousN` support template tokens (`{{from}}`, `{{to}}`, `{{total}}`, `{{n}}`). |

**`FuiColumn` props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `field` | `string` | Yes | Dot-notation path into the row object (e.g. `"address.city"`) |
| `header` | `string` | Yes | Column header text |
| `sortable` | `boolean` | No | Makes the column header clickable for sorting |
| `align` | `'left' \| 'center' \| 'right'` | No | Cell text alignment |
| `formatter` | `(value, row) => string` | No | Format function for plain text cells |
| `builder` | `(value, row) => ReactNode` | No | Render function for rich content (mutually exclusive with `formatter`) |
| `style` | `CSSProperties` | No | Cell styles (use to set column width) |
| `headerStyle` | `CSSProperties` | No | Header-cell-specific styles |
| `headerEllipsis` | `boolean` | No | Truncate long header text with ellipsis |

**`PaginationProps`**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `offset` | `number` | Yes | Zero-based row offset of the current page |
| `pageSize` | `number` | Yes | Rows per page |
| `totalRecord` | `number` | Yes | Total number of records |
| `pageSizeOption` | `number[]` | Yes | Available page size choices |
| `position` | `'top' \| 'bottom'` | No | Defaults to `'bottom'` |
| `fastForwardPage` | `number` | No | Pages to jump on `<<` / `>>`. Defaults to `5`. |

---

### `FuiTabList` / `FuiTab`

Tabbed panel. On mobile the tab bar becomes horizontally scrollable. Vertical layout is forced horizontal on mobile.

```tsx
<FuiTabList<string>
  selectedValue={tab}
  onTabSelect={(data) => setTab(data.value)}
>
  <FuiTab name="Personal" value="personal">
    <PersonalForm />
  </FuiTab>
  <FuiTab name="Employment" value="employment">
    <EmploymentForm />
  </FuiTab>
</FuiTabList>
```

| Prop (`FuiTabList`) | Type | Required | Description |
|---------------------|------|----------|-------------|
| `selectedValue` | `T` | No | Currently active tab value |
| `onTabSelect` | `(data: { value: T }) => void` | No | Selection change callback |
| `vertical` | `boolean` | No | Side-by-side layout (collapsed on mobile) |

| Prop (`FuiTab`) | Type | Required | Description |
|-----------------|------|----------|-------------|
| `name` | `string` | Yes | Tab button label |
| `value` | `T` | No | Tab identifier — defaults to `name` |
| `children` | `ReactNode` | No | Content panel |
| `icon` | `ReactNode` | No | Icon shown in the tab button |

---

### `FuiImageCarousel`

Circular image carousel with autoplay and navigation controls.

```tsx
<FuiImageCarousel
  images={[
    'https://example.com/photo1.jpg',
    'https://example.com/photo2.jpg',
  ]}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `images` | `string[]` | Yes | Image URLs |
| `label` | `{ autoplay?: string; next?: string; previous?: string }` | No | Tooltip label overrides for the navigation buttons |

---

### `FuiButtonPanel`

Flex row of action buttons. Collapses to full-width stacked column on mobile.

```tsx
<FuiButtonPanel alignItems="right">
  <Button appearance="secondary" onClick={onCancel}>Cancel</Button>
  <Button appearance="primary" onClick={onSave}>Save</Button>
</FuiButtonPanel>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `alignItems` | `'left' \| 'right'` | No | Horizontal alignment. Defaults to `'right'`. |
| `children` | `ReactNode` | Yes | Button elements |

---

### `FuiButton` / `FuiIconButton`

Button with appearance/size/icon. `FuiIconButton` is a thin wrapper that always renders icon-only (no children) and defaults to a `subtle` appearance, for toolbar/close-button usage.

```tsx
<FuiButton appearance="primary" onClick={onSave}>Save</FuiButton>

<FuiIconButton aria-label="Close" icon={<DismissRegular />} onClick={onClose} />
```

**`FuiButton` props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `appearance` | `'primary' \| 'outline' \| 'subtle' \| 'transparent' \| 'secondary'` | No | Defaults to `'secondary'` |
| `size` | `'small' \| 'medium' \| 'large'` | No | Defaults to `'medium'` |
| `icon` | `ReactElement` | No | Icon rendered alongside the label |
| `iconPosition` | `'before' \| 'after'` | No | Side of the label the icon is rendered on. Defaults to `'before'`. |
| `children` | `ReactNode` | No | Button label |

`FuiIconButton` takes the same props minus `children`/`iconPosition`, with `icon` and `aria-label` required.

---

### `FuiToggle`

Pressable toggle button (`ToggleButton`).

```tsx
<FuiToggle checked={bold} icon={<TextBoldRegular />} onClick={() => setBold((v) => !v)} />
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `checked` | `boolean` | No | Controlled pressed state |
| `defaultChecked` | `boolean` | No | Initial pressed state for uncontrolled usage. Defaults to `false`. |
| `appearance` | `'primary' \| 'outline' \| 'subtle' \| 'transparent' \| 'secondary'` | No | Defaults to `'secondary'` |
| `size` | `'small' \| 'medium' \| 'large'` | No | Defaults to `'medium'` |
| `icon` | `ReactElement` | No | Icon rendered alongside the label |
| `iconPosition` | `'before' \| 'after'` | No | Defaults to `'before'` |

---

### `FuiDivider`

Thin horizontal rule used to separate page sections, with an optional centered label.

```tsx
<FuiDivider>Section Title</FuiDivider>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | No | Optional label rendered centered on the divider line |

---

### `FuiText` and typography variants

Typography element covering FluentUI's Label/Title1/Title2/Subtitle1/Subtitle2/Body1/Body2/Caption1/Caption2. `FuiLabel`, `FuiTitle1`, `FuiTitle2`, `FuiSubTitle1`, `FuiSubTitle2`, `FuiBody1`, `FuiBody2`, `FuiCaption1`, `FuiCaption2` are `FuiText` fixed to the matching `type`.

```tsx
<FuiTitle1>Page heading</FuiTitle1>
<FuiText type="body2" text="Body copy" />
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `text` | `string` | Yes | Text content to display |
| `type` | `'label' \| 'title1' \| 'title2' \| 'subTitle1' \| 'subTitle2' \| 'body1' \| 'body2' \| 'caption1' \| 'caption2'` | No | Defaults to `'label'`. Ignored on the fixed-type variants. |
| `italic` | `boolean` | No | Defaults to `false` |
| `bold` | `boolean` | No | Overrides the type's default weight. Defaults to `false`. |
| `block` | `boolean` | No | Renders as a block-level element instead of inline. Defaults to `false`. |

---

### `FuiTooltip`

Wraps arbitrary content with a small message shown on hover (a `Tooltip`) or on click (a `Popover`, since Fluent's `Tooltip` has no click-triggered mode). If the wrapped element is itself disabled (`disabled` or `aria-disabled`), no affordance is added and the message never shows.

```tsx
<FuiTooltip text="Delete this record">
  <FuiIconButton aria-label="Delete" icon={<DeleteRegular />} onClick={onDelete} />
</FuiTooltip>

<FuiTooltip showOn="click" text="Copied!" position="top">
  <FuiButton onClick={copyToClipboard}>Copy</FuiButton>
</FuiTooltip>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `text` | `string` | Yes | Text shown in the tooltip/popover |
| `children` | `ReactElement` | Yes | A single element to wrap |
| `showOn` | `'hover' \| 'click'` | No | Defaults to `'hover'` |
| `dismissMs` | `number` | No | When `showOn` is `'click'`, ms of inactivity before auto-dismiss. Defaults to `2000`. |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | No | Defaults to the underlying component's own placement |

---

### `FuiAccordion` / `FuiAccordionItem`

Groups collapsible `FuiAccordionItem` panels, controlling which are expanded — single- or multi-expand.

```tsx
<FuiAccordion value={openItem} onChange={setOpenItem} collapsible>
  <FuiAccordionItem header="Details" value="details">
    <DetailsForm />
  </FuiAccordionItem>
  <FuiAccordionItem header="Preferences" value="preferences">
    <PreferencesForm />
  </FuiAccordionItem>
</FuiAccordion>
```

**`FuiAccordion` props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` / `onChange` | `string` / `(value: string) => void` | Yes | Controlled expanded value (single mode, default) |
| `value` / `onChange` (when `multiple`) | `string[]` / `(value: string[]) => void` | Yes | Controlled expanded values (multi mode) |
| `multiple` | `boolean` | No | Allow more than one panel open at once. Defaults to `false`. |
| `collapsible` | `boolean` | No | When the open panel can be collapsed to leave none open. Not applicable when `multiple`. Defaults to `false`. |
| `expandIcon` | `ReactElement` | No | Overrides the default expand/collapse icon for every item |
| `expandIconPosition` | `'start' \| 'end'` | No | Defaults to `'start'` |
| `withDivider` | `boolean` | No | Renders a divider between panels. Defaults to `true`. |

**`FuiAccordionItem` props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Unique identifier for this panel |
| `header` | `ReactNode` | Yes | Clickable header content |
| `disabled` | `boolean` | No | Disables toggling this item |
| `expandIcon` | `ReactElement` | No | Per-item icon override, falls back to the parent's `expandIcon` |

---

### `FuiCard` / `FuiCardHeader` / `FuiCardPreview` / `FuiCardFooter`

Content-display container for a single topic's header, preview and footer.

```tsx
<FuiCard>
  <FuiCardHeader header="Quarterly Report" description="Q2 2026" />
  <FuiCardPreview>
    <img alt="" src="/report-preview.png" />
  </FuiCardPreview>
  <FuiCardFooter>
    <FuiButton onClick={onView}>View</FuiButton>
  </FuiCardFooter>
</FuiCard>
```

| Prop (`FuiCard`) | Type | Required | Description |
|-------------------|------|----------|-------------|
| `appearance` | `'filled' \| 'filled-alternative' \| 'outline' \| 'subtle'` | No | Defaults to `'filled'` |
| `orientation` | `'horizontal' \| 'vertical'` | No | Defaults to `'vertical'` |
| `size` | `'small' \| 'medium' \| 'large'` | No | Controls border radius and inner spacing. Defaults to `'medium'`. |

| Prop (`FuiCardHeader`) | Type | Description |
|-------------------------|------|-------------|
| `image` | `ReactElement \| string \| number` | Image or avatar related to the card |
| `header` | `ReactElement \| string \| number` | Main header title |
| `description` | `ReactElement \| string \| number` | Short description related to the title |
| `action` | `ReactElement \| string \| number` | Content at the far end, e.g. an overflow menu button |

| Prop (`FuiCardPreview`) | Type | Description |
|---------------------------|------|-------------|
| `logo` | `ReactElement \| string \| number` | Small badge overlaid on the preview content |
| `children` | `ReactNode` | The preview image or content itself |

| Prop (`FuiCardFooter`) | Type | Description |
|--------------------------|------|-------------|
| `action` | `ReactElement \| string \| number` | Content at the far end, e.g. a single icon button |
| `children` | `ReactNode` | Main footer content, e.g. action buttons |

---

### `FuiDrawer` / `FuiDrawerHeader` / `FuiDrawerBody`

Panel that hosts supplementary content or a management experience, dismissible ('overlay') or stacked with the page ('inline'). Forced to a bottom position on mobile regardless of `position`.

```tsx
<FuiDrawer open={open} onOpenChange={setOpen} position="end">
  <FuiDrawerHeader
    title="Filters"
    action={<FuiIconButton aria-label="Close" icon={<DismissRegular />} onClick={() => setOpen(false)} />}
  />
  <FuiDrawerBody>
    <FiltersForm />
  </FuiDrawerBody>
</FuiDrawer>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | Yes | Fires on Escape, backdrop click, etc. |
| `position` | `'start' \| 'end' \| 'bottom'` | No | Defaults to `'start'`. Ignored (always `'bottom'`) on mobile. |
| `size` | `'small' \| 'medium' \| 'large' \| 'full'` | No | Defaults to `'small'` |
| `type` | `'overlay' \| 'inline'` | No | Defaults to `'overlay'` |
| `modalType` | `'modal' \| 'non-modal' \| 'alert'` | No | Overlay-only. Defaults to `'modal'`. |
| `separator` | `boolean` | No | Inline-only. Defaults to `false`. |

`FuiDrawerHeader` takes `title`/`action`; `FuiDrawerBody` renders scrollable main content.

---

### `FuiMenuBar`

A horizontal bar of dropdown menus, e.g. a desktop-app-style File/Edit/View menu.

```tsx
<FuiMenuBar>
  <FuiMenuBarMenu label="File">
    <FuiMenuBarItem icon={<DocumentAddRegular />} shortcut="Ctrl+N" onClick={onNew}>
      New
    </FuiMenuBarItem>
    <FuiMenuBarSeparator />
    <FuiMenuBarCheckboxItem checked={autosave} onCheckedChange={setAutosave}>
      Autosave
    </FuiMenuBarCheckboxItem>
    <FuiMenuBarSub label="Export as">
      <FuiMenuBarRadioGroup value={format} onValueChange={setFormat}>
        <FuiMenuBarRadioItem value="pdf">PDF</FuiMenuBarRadioItem>
        <FuiMenuBarRadioItem value="csv">CSV</FuiMenuBarRadioItem>
      </FuiMenuBarRadioGroup>
    </FuiMenuBarSub>
  </FuiMenuBarMenu>
</FuiMenuBar>
```

| Component | Key props |
|---|---|
| `FuiMenuBar` | `children`: one or more `FuiMenuBarMenu` |
| `FuiMenuBarMenu` | `label`, `disabled` |
| `FuiMenuBarItem` | `icon`, `shortcut`, `disabled`, `onClick` |
| `FuiMenuBarCheckboxItem` | `checked`, `onCheckedChange`, `disabled`, `shortcut` |
| `FuiMenuBarRadioGroup` | `value`, `onValueChange` — wraps `FuiMenuBarRadioItem` children |
| `FuiMenuBarRadioItem` | `value`, `disabled` |
| `FuiMenuBarSeparator` | `className` |
| `FuiMenuBarLabel` | Non-interactive group heading |
| `FuiMenuBarSub` | `label`, `disabled` — nested dropdown, triggered from within a parent menu |

---

### `FuiBreadcrumb`

Renders the current trail from `useBreadcrumb()`. The last item is shown as the current page; earlier items without an action are non-interactive labels. Once there are at least 3 items, clicking the last item toggles a collapsed first > … > last view.

```tsx
const breadcrumb = useBreadcrumb();

breadcrumb.start({ label: () => 'Home', action: () => navigate('/') });
breadcrumb.append({ label: () => 'Settings', action: () => navigate('/settings') });

<FuiBreadcrumb />
```

`FuiBreadcrumb` takes no props — it's entirely driven by `useBreadcrumb()`.

---

## Toast notifications

Use the `useToast()` hook to show non-blocking feedback.

```tsx
const toast = useToast();

toast.success('Saved!');
toast.error('Something went wrong.');
toast.info('Processing…');
toast.warning('Check your input.');
```

Error toasts do not auto-dismiss. All other intents dismiss automatically after `toast.dismissTimeout` ms (configurable in the provider `component.toast` config). A dismiss button appears on error toasts after the timeout.

---

## Spinner

Use `useSpinner()` to show a full-screen overlay spinner during async operations.

```tsx
const spinner = useSpinner();

spinner.show();
await saveData();
spinner.hide();
```

---

## Confirmation dialog

Use `useDialog()` for imperative confirmation dialogs.

```tsx
const dialog = useDialog();

dialog.openDialog({
  title: 'Confirm Delete',
  content: 'Are you sure?',
  primaryButton: { label: 'Yes', action: handleDelete },
});
```
