import {
  Badge,
  Button,
  Divider,
  Radio,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { useState } from 'react';

import { useDialog } from '@hook/use-dialog';
import { useSpinner } from '@hook/use-spinner';
import { useTheme } from '@hook/use-theme';
import { useToast } from '@hook/use-toast';

import { FuiButtonPanel } from './components/fui-button-panel';
import { FuiImageCarousel } from './components/fui-image-carousell';
import { FuiTab, FuiTabList } from './components/fui-tab';
import { FuiColumn, FuiTable } from './components/fui-table';
import { FuiInputCheckbox } from './components/input-checkbox';
import { FuiInputDate } from './components/input-date';
import { FuiInputDropdown, InputDropdownOption } from './components/input-dropdown';
import { FuiInputGroup } from './components/input-group';
import { FuiInputMultiLangText, MultiLangText } from './components/input-multi-lang';
import { FuiInputNumber } from './components/input-number';
import { FuiInputRadio } from './components/input-radio';
import { FuiInputSwitch } from './components/input-switch';
import { FuiInputText } from './components/input-text';
import { FuiInputTextArea } from './components/input-textarea';
import { FuiInputTime, FuiTime } from './components/input-time';
import { ThemeType } from './contexts/handy-fluent-ui-context';
import { type Lang, useMobileSim } from './main';

// ─── Translations ─────────────────────────────────────────────────────────────

const LABELS = {
  en: {
    pageTitle: 'Employee Profile',
    // Settings
    theme: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    kidsTheme: 'Kids',
    mobileView: 'Mobile View',
    // Tabs
    personal: 'Personal',
    employment: 'Employment',
    workRecords: 'Work Records',
    // Personal
    fullName: 'Full Name',
    fullNameHint: 'Enter your legal name as it appears on your ID.',
    jobTitle: 'Job Title',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    birthDate: 'Date of Birth',
    age: 'Age',
    email: 'Email Address',
    emailHint: 'We\'ll never share your email.',
    password: 'Password',
    streetAddress: 'Street Address',
    addressLine1: 'Line 1',
    addressLine2: 'Line 2 (Optional)',
    cityZip: 'City / Zip',
    city: 'City',
    zipCode: 'Zip Code',
    country: 'Country',
    biography: 'Biography',
    biographyHint: 'Tell us a bit about yourself (max 300 characters).',
    // Employment
    employeeId: 'Employee ID',
    department: 'Department',
    currentSalary: 'Current Salary',
    expectedSalary: 'Expected Salary',
    salaryFrom: 'From',
    salaryTo: 'To',
    joinDate: 'Join Date',
    shift: 'Shift',
    shiftStart: 'Start Time',
    shiftEnd: 'End Time',
    agreeTerms: 'I agree to the terms and conditions',
    receiveNotifications: 'Receive notifications',
    // Work records table headers
    recordId: 'ID',
    project: 'Project',
    role: 'Role',
    period: 'Period',
    status: 'Status',
    // Table pagination
    tablePageSize: 'Rows:',
    tableNoData: 'No data found',
    tablePageRange: '{{from}}–{{to}} of {{total}}',
    tableNext: 'Next',
    tableNextN: 'Next {{n}}',
    tablePrev: 'Prev',
    tablePrevN: 'Prev {{n}}',
    // Carousel
    carouselAutoplay: 'Autoplay',
    carouselNext: 'Next',
    carouselPrev: 'Previous',
    // Multi-lang field language names
    languages: ['English', '繁體中文'] as string[],
    // Buttons
    cancel: 'Cancel',
    save: 'Save',
    confirmCancelTitle: 'Confirm Cancel',
    confirmCancelMsg: 'Are you sure you want to discard your changes?',
    yes: 'Yes',
  },
  'zh-TW': {
    pageTitle: '員工個人資料',
    // Settings
    theme: '主題',
    lightTheme: '淺色',
    darkTheme: '深色',
    kidsTheme: '兒童',
    mobileView: '手機視圖',
    // Tabs
    personal: '個人資料',
    employment: '職業資訊',
    interests: '興趣愛好',
    workRecords: '工作記錄',
    // Personal
    fullName: '全名',
    fullNameHint: '請輸入與身份證一致的全名。',
    jobTitle: '職位',
    gender: '性別',
    male: '男',
    female: '女',
    other: '其他',
    birthDate: '出生日期',
    age: '年齡',
    email: '電子郵件',
    emailHint: '我們不會分享您的電子郵件。',
    password: '密碼',
    streetAddress: '街道地址',
    addressLine1: '地址一',
    addressLine2: '地址二（選填）',
    cityZip: '城市 / 郵遞區號',
    city: '城市',
    zipCode: '郵遞區號',
    country: '國家',
    biography: '個人簡介',
    biographyHint: '簡單介紹一下自己（最多 300 字）。',
    // Employment
    employeeId: '員工編號',
    department: '部門',
    currentSalary: '目前薪資',
    expectedSalary: '期望薪資',
    salaryFrom: '最低',
    salaryTo: '最高',
    joinDate: '入職日期',
    shift: '班次',
    shiftStart: '開始時間',
    shiftEnd: '結束時間',
    agreeTerms: '我同意條款及細則',
    receiveNotifications: '接收通知',
    // Work records table headers
    recordId: '編號',
    project: '項目',
    role: '角色',
    period: '時間',
    status: '狀態',
    // Table pagination
    tablePageSize: '每頁行數：',
    tableNoData: '沒有資料',
    tablePageRange: '第 {{from}}–{{to}} 筆，共 {{total}} 筆',
    tableNext: '下一頁',
    tableNextN: '後 {{n}} 頁',
    tablePrev: '上一頁',
    tablePrevN: '前 {{n}} 頁',
    // Carousel
    carouselAutoplay: '自動播放',
    carouselNext: '下一張',
    carouselPrev: '上一張',
    // Multi-lang field language names
    languages: ['English', '繁體中文'] as string[],
    // Buttons
    cancel: '取消',
    save: '儲存',
    confirmCancelTitle: '確認取消',
    confirmCancelMsg: '您確定要捨棄所做的更改嗎？',
    yes: '確定',
  },
} as const;

// ─── Static data ──────────────────────────────────────────────────────────────

type WorkRecord = {
  id: string;
  project: string;
  role: string;
  period: string;
  status: string;
};

const workRecords: WorkRecord[] = [
  {
    id: 'WR-001',
    project: 'Core Platform',
    role: 'Engineer',
    period: '2021 Q1 – Q4',
    status: 'completed',
  },
  {
    id: 'WR-002',
    project: 'Mobile App v2',
    role: 'Lead Engineer',
    period: '2022 Q1 – Q2',
    status: 'completed',
  },
  {
    id: 'WR-003',
    project: 'Data Pipeline',
    role: 'Tech Lead',
    period: '2022 Q3 – 2023 Q1',
    status: 'completed',
  },
  {
    id: 'WR-004',
    project: 'AI Dashboard',
    role: 'Principal Eng.',
    period: '2023 Q2 – Q4',
    status: 'completed',
  },
  {
    id: 'WR-005',
    project: 'Cloud Migration',
    role: 'Architect',
    period: '2024 Q1 – present',
    status: 'active',
  },
];

const profileImages = [
  'https://picsum.photos/seed/profile-hk1/800/320',
  'https://picsum.photos/seed/profile-hk2/800/320',
  'https://picsum.photos/seed/profile-hk3/800/320',
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  page: {
    maxWidth: '760px',
    margin: '0 auto',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  pageMobile: {
    maxWidth: '100%',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
  },
  pageTitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  settingsBar: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalL,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
});

// ─── App ──────────────────────────────────────────────────────────────────────

type AppProps = {
  lang: Lang;
  onToggleLang: () => void;
};

const App = ({ lang, onToggleLang }: AppProps) => {
  const { forceMobile, toggleMobile } = useMobileSim();
  const styles = useStyles();
  const theme = useTheme();
  const spinner = useSpinner();
  const dialog = useDialog();
  const toast = useToast();

  const t = LABELS[lang];

  const [selectedTab, setSelectedTab] = useState('personal');

  const [formData, setFormData] = useState({
    fullName: null as string | null,
    jobTitle: {
      valueInLangOne: 'Software Engineer',
      valueInLangTwo: '軟體工程師',
      valueInLangThree: null,
    } as MultiLangText | null,
    gender: 'other',
    birthDate: null as Date | null,
    age: null as number | null,
    email: null as string | null,
    password: null as string | null,
    addrLine1: null as string | null,
    addrLine2: null as string | null,
    city: null as string | null,
    zipCode: null as string | null,
    country: null as string | null,
    biography: null as string | null,
    employeeId: 'EMP-20240001',
    department: null as string | null,
    currentSalary: null as number | null,
    salaryFrom: null as number | null,
    salaryTo: null as number | null,
    joinDate: null as Date | null,
    shiftStart: null as FuiTime | null,
    shiftEnd: null as FuiTime | null,
    agreeTerms: false,
    receiveNotifications: true,
  });

  const set =
    <K extends keyof typeof formData>(key: K) =>
    (value: (typeof formData)[K]) =>
      setFormData((prev) => ({ ...prev, [key]: value }));

  // ─── Options ──────────────────────────────────────────────────────────────

  const countryOptions: InputDropdownOption[] = [
    { group: 'Asia', text: 'China', value: 'cn' },
    { group: 'Asia', text: 'Hong Kong', value: 'hk' },
    { group: 'Asia', text: 'Japan', value: 'jp' },
    { group: 'Asia', text: 'Singapore', value: 'sg' },
    { group: 'Asia', text: 'South Korea', value: 'kr' },
    { group: 'Asia', text: 'Taiwan', value: 'tw' },
    { group: 'Europe', text: 'France', value: 'fr' },
    { disabled: true, group: 'Europe', text: 'Germany', value: 'de' },
    { group: 'Europe', text: 'United Kingdom', value: 'gb' },
    { group: 'North America', text: 'Canada', value: 'ca' },
    { group: 'North America', text: 'United States', value: 'us' },
    { group: 'Oceania', text: 'Australia', value: 'au' },
  ];

  const departmentOptions: InputDropdownOption[] = [
    { text: 'Design', value: 'design' },
    { text: 'Engineering', value: 'engineering' },
    { text: 'Finance', value: 'finance' },
    { text: 'Human Resources', value: 'hr' },
    { text: 'Legal', value: 'legal' },
    { text: 'Marketing', value: 'marketing' },
    { text: 'Operations', value: 'operations' },
    { text: 'Product', value: 'product' },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={mergeClasses(styles.page, forceMobile && styles.pageMobile)}>
      <h2 className={styles.pageTitle}>{t.pageTitle}</h2>

      {/* Settings bar */}
      <div className={styles.settingsBar}>
        <FuiInputRadio
          label={t.theme}
          noMessage
          onChange={(data) => theme.switchTheme(data.value as ThemeType)}
          value={theme.currentTheme}
        >
          <Radio label={t.lightTheme} value="light" />
          <Radio label={t.darkTheme} value="dark" />
          <Radio label={t.kidsTheme} value="custom" />
        </FuiInputRadio>

        <div style={{ display: 'flex' }}>
          <FuiInputSwitch checked={lang === 'zh-TW'} label="EN / 繁中" onChange={onToggleLang} />

          <FuiInputSwitch checked={forceMobile} label={t.mobileView} onChange={toggleMobile} />
        </div>
      </div>

      <Divider />

      {/* Tabbed content */}
      <FuiTabList<string>
        onTabSelect={(data) => setSelectedTab(data.value)}
        selectedValue={selectedTab}
      >
        {/* ── Personal ── */}
        <FuiTab name={t.personal} value="personal">
          <div className={styles.section}>
            <FuiImageCarousel
              images={profileImages}
              langLabel={{ autoplay: t.carouselAutoplay, next: t.carouselNext, previous: t.carouselPrev }}
            />

            <FuiInputText
              hint={t.fullNameHint}
              label={t.fullName}
              onChange={set('fullName')}
              placeholder={t.fullName}
              required
              value={formData.fullName}
            />

            <FuiInputMultiLangText
              label={t.jobTitle}
              langLabel={{ languages: t.languages }}
              onChange={set('jobTitle')}
              placeholder={t.jobTitle}
              value={formData.jobTitle}
            />

            <FuiInputRadio
              direction="horizontal"
              label={t.gender}
              labelWidth="medium"
              onChange={(data) => setFormData((prev) => ({ ...prev, gender: data.value }))}
              required
              value={formData.gender}
            >
              <Radio label={t.male} value="male" />
              <Radio label={t.female} value="female" />
              <Radio label={t.other} value="other" />
            </FuiInputRadio>

            <FuiInputGroup
              items={[
                {
                  element: (
                    <FuiInputDate
                      label={t.birthDate}
                      onChange={(d) => setFormData((prev) => ({ ...prev, birthDate: d ?? null }))}
                      placeholder={t.birthDate}
                      value={formData.birthDate}
                    />
                  ),
                  weight: 2,
                },
                {
                  element: (
                    <FuiInputNumber
                      allowNegative={false}
                      label={t.age}
                      max={120}
                      min={16}
                      onChange={set('age')}
                      placeholder={t.age}
                      precision={0}
                      value={formData.age}
                    />
                  ),
                  weight: 1,
                },
              ]}
              label={`${t.birthDate} / ${t.age}`}
            />

            <FuiInputText
              hint={t.emailHint}
              label={t.email}
              onChange={set('email')}
              placeholder="name@company.com"
              type="email"
              value={formData.email}
            />

            <FuiInputText
              label={t.password}
              onChange={set('password')}
              placeholder="••••••••"
              type="password"
              value={formData.password}
            />

            <FuiInputGroup
              items={[
                {
                  element: (
                    <FuiInputText
                      onChange={set('addrLine1')}
                      placeholder={t.addressLine1}
                      value={formData.addrLine1}
                    />
                  ),
                  weight: 1,
                },
                {
                  element: (
                    <FuiInputText
                      onChange={set('addrLine2')}
                      placeholder={t.addressLine2}
                      value={formData.addrLine2}
                    />
                  ),
                  weight: 1,
                },
              ]}
              label={t.streetAddress}
            />

            <FuiInputGroup
              items={[
                {
                  element: (
                    <FuiInputText
                      onChange={set('city')}
                      placeholder={t.city}
                      value={formData.city}
                    />
                  ),
                  weight: 2,
                },
                {
                  element: (
                    <FuiInputText
                      onChange={set('zipCode')}
                      placeholder={t.zipCode}
                      value={formData.zipCode}
                    />
                  ),
                  weight: 1,
                },
              ]}
              label={t.cityZip}
            />

            <FuiInputDropdown
              label={t.country}
              listbox={{ style: { maxHeight: '200px', overflowY: 'auto' } }}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, country: val as string | null }))
              }
              options={countryOptions}
              placeholder={t.country}
              positioning={{ autoSize: false }}
              value={formData.country}
            />

            <FuiInputTextArea
              hint={t.biographyHint}
              label={t.biography}
              maxLength={300}
              onChange={set('biography')}
              value={formData.biography}
            />
          </div>
        </FuiTab>

        {/* ── Employment ── */}
        <FuiTab name={t.employment} value="employment">
          <div className={styles.section}>
            <FuiInputText
              label={t.employeeId}
              onChange={() => {}}
              readOnly
              value={formData.employeeId}
            />

            <FuiInputDropdown
              label={t.department}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, department: val as string | null }))
              }
              options={departmentOptions}
              placeholder={t.department}
              value={formData.department}
            />

            <FuiInputNumber
              allowNegative={false}
              formatter={(v) => `$ ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
              label={t.currentSalary}
              min={0}
              onChange={set('currentSalary')}
              placeholder={t.currentSalary}
              precision={0}
              step={1000}
              value={formData.currentSalary}
            />

            <FuiInputGroup
              hint="Annual salary expectation"
              items={[
                {
                  element: (
                    <FuiInputNumber
                      allowNegative={false}
                      onChange={set('salaryFrom')}
                      placeholder={t.salaryFrom}
                      precision={0}
                      value={formData.salaryFrom}
                    />
                  ),
                },
                {
                  element: (
                    <FuiInputNumber
                      allowNegative={false}
                      onChange={set('salaryTo')}
                      placeholder={t.salaryTo}
                      precision={0}
                      value={formData.salaryTo}
                    />
                  ),
                },
              ]}
              label={t.expectedSalary}
            />

            <FuiInputDate
              label={t.joinDate}
              onChange={(d) => setFormData((prev) => ({ ...prev, joinDate: d ?? null }))}
              placeholder={t.joinDate}
              required
              value={formData.joinDate}
            />

            <FuiInputGroup
              items={[
                {
                  element: (
                    <FuiInputTime
                      in24HourFormat={false}
                      onChange={(v) => setFormData((prev) => ({ ...prev, shiftStart: v }))}
                      placeholder={t.shiftStart}
                      value={formData.shiftStart}
                      withSeconds
                    />
                  ),
                },
                {
                  element: (
                    <FuiInputTime
                      onChange={(v) => setFormData((prev) => ({ ...prev, shiftEnd: v }))}
                      placeholder={t.shiftEnd}
                      value={formData.shiftEnd}
                    />
                  ),
                },
              ]}
              label={t.shift}
            />

            <FuiInputCheckbox
              checked={formData.agreeTerms}
              label={t.agreeTerms}
              labelPosition="after"
              onChange={(data) => setFormData((prev) => ({ ...prev, agreeTerms: !!data.checked }))}
            />

            <FuiInputSwitch
              checked={formData.receiveNotifications}
              label={t.receiveNotifications}
              onChange={set('receiveNotifications')}
            />
          </div>
        </FuiTab>

        {/* ── Work Records ── */}
        <FuiTab name={t.workRecords} value="workRecords">
          <FuiTable
            data={workRecords}
            langLabel={{
              noData: t.tableNoData,
              pageRange: t.tablePageRange,
              pageSize: t.tablePageSize,
              paginationBar: {
                next: t.tableNext,
                nextN: t.tableNextN,
                previous: t.tablePrev,
                previousN: t.tablePrevN,
              },
            }}
            pagination={{
              offset: 0,
              pageSize: 10,
              pageSizeOption: [5, 10, 20],
              position: 'bottom',
              totalRecord: workRecords.length,
            }}
            width={{ minWidth: '900px' }}
          >
            <FuiColumn field="id" header={t.recordId} style={{ width: '10%' }} />
            <FuiColumn field="project" header={t.project} sortable style={{ width: '40%' }} />
            <FuiColumn field="role" header={t.role} style={{ width: '20%' }} />
            <FuiColumn field="period" header={t.period} style={{ width: '20%' }} />
            <FuiColumn
              builder={(value) => (
                <Badge color={value === 'active' ? 'success' : 'informative'}>
                  {String(value)}
                </Badge>
              )}
              field="status"
              header={t.status}
              style={{ width: '10%' }}
            />
          </FuiTable>
        </FuiTab>
      </FuiTabList>

      <Divider />

      {/* Action buttons */}
      <FuiButtonPanel alignItems="right">
        <Button
          appearance="secondary"
          onClick={() =>
            dialog.openDialog({
              content: t.confirmCancelMsg,
              primaryButton: { action: () => {}, label: t.yes },
              title: t.confirmCancelTitle,
            })
          }
        >
          {t.cancel}
        </Button>
        <Button
          appearance="primary"
          onClick={() => {
            spinner.show();
            setTimeout(() => {
              spinner.hide();
              toast.success(lang === 'en' ? 'Profile saved successfully!' : '個人資料已成功儲存！');
            }, 1500);
          }}
        >
          {t.save}
        </Button>
      </FuiButtonPanel>
    </div>
  );
};

export default App;
