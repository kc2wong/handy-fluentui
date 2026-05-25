# Handy FluentUI

Opinionated React components built on top of [FluentUI v9](https://react.fluentui.dev/) with responsive, form-friendly behaviours out of the box.

- Consistent label / hint / error / info layout via the `withInputField` HOC
- Automatic mobile adaptation (breakpoint-driven theme switching, bottom-sheet drawers, stacking layouts)
- Imperative `useToast`, `useSpinner`, `useDialog` APIs
- i18n-ready label overrides through the provider

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
        fuiTable: {
          label: {
            pageSize: 'Rows:',
            noData: 'No data found',
            pageRange: '{{from}}–{{to}} of {{total}}',
            paginationBar: { next: 'Next', nextN: 'Next {{n}}', previous: 'Prev', previousN: 'Prev {{n}}' },
          },
        },
        toast: { dismissTimeout: 3000, label: { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' } },
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
| `component` | `Component` | — | Label overrides for built-in component strings |
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
| `useToast()` | `{ success, error, info, warning }` | Show toast notifications |
| `useSpinner()` | `{ show, hide }` | Show/hide the global overlay spinner |
| `useDialog()` | `{ openDialog }` | Show an imperative confirmation dialog |
| `useLogger()` | `(message, level?) => void` | Log via the configured logger |
| `useTimeZone()` | `{ timeZone, setTimeZone, datePartsInTimeZone }` | Read, update, and decompose dates in the active time zone |

All hooks throw if called outside `HandyFluentUiProvider`.

### `useTimeZone`

The provider initialises `timeZone` from `Intl.DateTimeFormat().resolvedOptions().timeZone` (the browser's local time zone). `useTimeZone` lets you read or override it and decompose a `Date` object into its constituent parts within that zone.

```tsx
const { timeZone, setTimeZone, datePartsInTimeZone } = useTimeZone();

// Read the active time zone
console.log(timeZone); // e.g. 'Asia/Tokyo'

// Switch to a different time zone (validated; invalid values are ignored with a warning)
setTimeZone('America/New_York');

// Extract date parts in the active time zone
const parts = datePartsInTimeZone(new Date());
// { year, month, day, hour, minute, second }

// Extract date parts in an explicit time zone (overrides the active one for this call)
const tokyoParts = datePartsInTimeZone(new Date(), 'Asia/Tokyo');
```

**`ZonedDateParts`**

```ts
type ZonedDateParts = {
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
| `datePartsInTimeZone` | `(date: Date, tz?: string) => ZonedDateParts` | Decompose a `Date` into year/month/day/hour/minute/second in the active (or an explicitly supplied) time zone. Falls back to local time and logs a warning if `tz` is invalid. |

---

## Common field props (`FieldLayoutProps`)

Every `input-*` component inherits these props from the `withInputField` HOC:

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
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Label position: above or to the left of the input |
| `labelWidth` | `'small' \| 'medium' \| 'large' \| 'none'` | — | Fixed label width when `direction='horizontal'` |

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
| `onChange` | `(date: Date \| null \| undefined) => void` | Yes | Change callback |
| `formatter` | `(date: Date \| null) => string` | No | Custom date format function. Defaults to `toLocaleDateString()`. |
| `readOnly` | `boolean` | No | Suppresses the calendar popup/drawer. Desktop renders a plain read-only `Input`; mobile hides the calendar icon and ignores clicks. |

---

### `FuiInputTime`

Time picker with up/down arrow buttons. Clicking an arrow increments or decrements the time segment under the cursor. On mobile the arrows are laid out in a horizontal row with larger icons.

```tsx
import { FuiInputTime, FuiTime } from './components/input-time';

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
| `options` | `InputDropdownOption[]` | Yes | Option list |
| `multiselect` | `boolean` | No | Enable multi-select mode |
| `readOnly` | `boolean` | No | Silently ignores selection changes |
| `listbox` | `ListboxProps` | No | Props forwarded to the inner `Listbox`. Use `style.maxHeight` to constrain dropdown height. Must pass `positioning={{ autoSize: false }}` alongside this, otherwise Floating UI overrides inline `max-height`. |

**`InputDropdownOption`**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Option value |
| `text` | `string` | Yes | Display text (used for search/filtering) |
| `group` | `string` | No | Group label |
| `render` | `() => ReactNode` | No | Custom option content renderer |

---

### `FuiInputRadio`

Radio group with a shared label.

```tsx
<FuiInputRadio
  label="Gender"
  value={gender}
  onChange={(data) => setGender(data.value)}
  direction="horizontal"
>
  <Radio label="Male" value="male" />
  <Radio label="Female" value="female" />
  <Radio label="Other" value="other" />
</FuiInputRadio>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onChange` | `(data: RadioGroupOnChangeData) => void` | No | Change callback |
| `layout` | `'vertical' \| 'horizontal'` | No | Radio button layout direction |

`horizontal-stacked` layout is not supported.

---

### `FuiInputCheckbox`

Checkbox with optional read-only mode.

```tsx
<FuiInputCheckbox
  label="I agree to the terms"
  labelPosition="after"
  checked={agreed}
  onChange={(data) => setAgreed(!!data.checked)}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onChange` | `(data: CheckboxOnChangeData) => void` | No | Change callback |
| `readOnly` | `boolean` | No | Visually interactive but ignores changes |

---

### `FuiInputSwitch`

Toggle switch. `onChange` delivers a `boolean` directly.

```tsx
<FuiInputSwitch
  label="Receive notifications"
  checked={notifications}
  onChange={setNotifications}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onChange` | `(value: boolean) => void` | Yes | Change callback — receives `boolean` directly |
| `readOnly` | `boolean` | No | Silently ignores changes |

---

### `FuiInputMultiLangText`

Text input for multi-language values. A translate icon opens a drawer with one field per configured language (up to 3). Language names are set via the `inputMultiLang.label.languages` provider config.

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
| `languages` | `string[]` | No | Names of each language slot shown in the drawer (up to 3). When fewer than 2 are provided, the translate icon is hidden. |
| `textComponent` | `ComponentType<InputTextProps>` | No | Overrides the inner text component. Defaults to `FuiInputText`. |

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

Circular image carousel with autoplay and navigation controls. Tooltip labels are read from `component.imageCarousell.label` in the provider config.

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
