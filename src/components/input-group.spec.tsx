import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { FuiInputGroup } from './input-group';
import { FuiInputText } from './input-text';

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

vi.mock('@fluentui/react-icons', () => ({
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
}));

vi.mock('@fluentui/react-components', () => ({
  Label: ({ children, htmlFor, required, className }: any) => (
    <label className={className} data-testid="label" htmlFor={htmlFor}>
      {children}
      {required && <span data-testid="required-asterisk">*</span>}
    </label>
  ),
  InfoLabel: ({ children, htmlFor, required, className, info }: any) => (
    <label className={className} data-testid="info-label" htmlFor={htmlFor}>
      {children}
      {required && <span data-testid="required-asterisk">*</span>}
      <span data-testid="info-hint">{info}</span>
    </label>
  ),
  Input: ({ id, value, placeholder }: any) => (
    <input
      data-testid="fluent-input"
      id={id}
      placeholder={placeholder}
      readOnly
      value={value ?? ''}
    />
  ),
  Caption1: ({ children, className }: any) => <span className={className}>{children}</span>,
  useId: (prefix: string) => `${prefix}-mock-id`,
  mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
  tokens: {
    spacingHorizontalM: '12px',
    spacingVerticalS: '8px',
    colorPaletteRedForeground1: 'red',
    colorNeutralForeground3: 'grey',
  },
  makeStyles: () => () => ({
    groupRow: 'group-row',
    groupColumn: 'group-column',
    rootVertical: 'root-vertical',
    rootHorizontal: 'root-horizontal',
    labelHorizontal: 'label-horizontal',
    labelSmall: 'label-small',
    labelMedium: 'label-medium',
    labelLarge: 'label-large',
    labelNone: 'label-none',
    labelContainer: 'label-container',
    eraserIcon: 'eraser-icon',
    fieldGroup: 'field-group',
    messageContainer: 'message-container',
    message: 'message-text',
    errorMessage: 'error-text',
    infoMessage: 'info-text',
  }),
  webLightTheme: {},
}));

describe('InputGroup', () => {
  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  describe('row layout and child wrapping', () => {
    it('renders items inside a flex group-row container', () => {
      const { container } = render(
        <FuiInputGroup
          items={[
            { element: <FuiInputText onChange={() => {}} value={null} /> },
            { element: <FuiInputText onChange={() => {}} value={null} /> },
          ]}
          label="Address"
        />,
      );
      expect(container.querySelector('.group-row')).toBeInTheDocument();
    });

    it('wraps each item and applies flex style for distribution', () => {
      const { container } = render(
        <FuiInputGroup
          items={[
            { element: <FuiInputText onChange={() => {}} value={null} />, weight: 1 },
            { element: <FuiInputText onChange={() => {}} value={null} />, weight: 1 },
          ]}
          label="Name"
        />,
      );
      const items = container.querySelectorAll('.group-row > div');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveStyle('flex: 1 1 0px');
      expect(items[1]).toHaveStyle('flex: 1 1 0px');
    });

    it('applies flex weight based on the weight prop', () => {
      const { container } = render(
        <FuiInputGroup
          items={[
            { element: <FuiInputText onChange={() => {}} value={null} />, weight: 2 },
            { element: <FuiInputText onChange={() => {}} value={null} />, weight: 1 },
          ]}
          label="Weighted"
        />,
      );
      const items = container.querySelectorAll('.group-row > div');
      expect(items[0]).toHaveStyle('flex: 2 1 0px');
      expect(items[1]).toHaveStyle('flex: 1 1 0px');
    });
  });

  describe('sub-label suppression', () => {
    it('renders only the group label — child labels are suppressed', () => {
      render(
        <FuiInputGroup
          items={[
            { element: <FuiInputText label="First" onChange={() => {}} value={null} /> },
            { element: <FuiInputText label="Last" onChange={() => {}} value={null} /> },
          ]}
          label="Full Name"
        />,
      );
      const labels = screen.getAllByTestId('label');
      expect(labels).toHaveLength(1);
      expect(labels[0]).toHaveTextContent('Full Name');
    });
  });

  describe('per-child message areas', () => {
    it('each child has its own message container for individual validation feedback', () => {
      const { container } = render(
        <FuiInputGroup
          items={[
            { element: <FuiInputText onChange={() => {}} value={null} /> },
            { element: <FuiInputText onChange={() => {}} value={null} /> },
          ]}
          label="Address"
        />,
      );
      // Group has noMessage=true so the count equals exactly the number of items
      expect(container.querySelectorAll('.message-container')).toHaveLength(2);
    });

    it('shows each child error message inside its item wrapper', () => {
      const { container } = render(
        <FuiInputGroup
          items={[
            { element: <FuiInputText errorMessage="Street required" onChange={() => {}} value={null} /> },
            { element: <FuiInputText errorMessage="City required" onChange={() => {}} value={null} /> },
          ]}
          label="Address"
        />,
      );
      const wrappers = container.querySelectorAll('.group-row > div');
      expect(wrappers[0]).toHaveTextContent('Street required');
      expect(wrappers[1]).toHaveTextContent('City required');
    });
  });

  describe('group label layout', () => {
    it('renders group label above items in vertical layout (default)', () => {
      const { container } = render(
        <FuiInputGroup items={[{ element: <FuiInputText onChange={() => {}} value={null} /> }]} label="Period" />,
      );
      expect(container.firstChild).toHaveClass('root-vertical');
      expect(screen.getByTestId('label')).toHaveTextContent('Period');
    });

    it('renders group label to the left of items in horizontal layout', () => {
      const { container } = render(
        <FuiInputGroup
          direction="horizontal"
          items={[{ element: <FuiInputText onChange={() => {}} value={null} /> }]}
          label="Period"
        />,
      );
      expect(container.firstChild).toHaveClass('root-horizontal');
      expect(screen.getByTestId('label')).toHaveTextContent('Period');
    });

    it('applies label width class to group label in horizontal mode', () => {
      render(
        <FuiInputGroup
          direction="horizontal"
          items={[{ element: <FuiInputText onChange={() => {}} value={null} /> }]}
          label="Period"
          labelWidth="large"
        />,
      );
      const labelContainer = screen.getByTestId('label').parentElement;
      expect(labelContainer).toHaveClass('label-horizontal');
      expect(labelContainer).toHaveClass('label-large');
    });

    it('renders InfoLabel for the group when hint is provided', () => {
      render(
        <FuiInputGroup
          hint="Enter start and end date"
          items={[
            { element: <FuiInputText onChange={() => {}} value={null} /> },
            { element: <FuiInputText onChange={() => {}} value={null} /> },
          ]}
          label="Period"
        />,
      );
      expect(screen.getByTestId('info-label')).toHaveTextContent('Period');
      expect(screen.getByTestId('info-hint')).toHaveTextContent('Enter start and end date');
    });

    it('renders required indicator on the group label', () => {
      render(
        <FuiInputGroup
          items={[{ element: <FuiInputText onChange={() => {}} value={null} /> }]}
          label="Full Name"
          required
        />,
      );
      expect(screen.getByTestId('required-asterisk')).toBeInTheDocument();
    });
  });

  describe('mobile layout', () => {
    it('forces vertical layout on mobile even if direction is horizontal', () => {
      mockIsMobile.mockReturnValue(true);
      const { container } = render(
        <FuiInputGroup
          direction="horizontal"
          items={[{ element: <FuiInputText onChange={() => {}} value={null} /> }]}
          label="Mobile Group"
        />,
      );
      expect(container.firstChild).toHaveClass('root-vertical');
    });

    it('uses groupColumn and vertical flex for items on mobile', () => {
      mockIsMobile.mockReturnValue(true);
      const { container } = render(
        <FuiInputGroup
          items={[{ element: <FuiInputText onChange={() => {}} value={null} /> }]}
          label="Mobile Group"
        />,
      );
      expect(container.querySelector('.group-column')).toBeInTheDocument();
      const item = container.querySelector('.group-column > div');
      expect(item).toHaveStyle('flex: 1 1 auto');
    });
  });

  describe('eraser icon', () => {
    it('renders eraser icon and clears all items when clicked', () => {
      const handleChange1 = vi.fn();
      const handleChange2 = vi.fn();
      render(
        <FuiInputGroup
          items={[
            { element: <FuiInputText onChange={handleChange1} value="Value 1" /> },
            { element: <FuiInputText onChange={handleChange2} value="Value 2" /> },
          ]}
          label="Clearable Group"
        />,
      );

      const eraser = screen.getByTestId('eraser-icon');
      expect(eraser).toBeInTheDocument();

      fireEvent.click(eraser);
      expect(handleChange1).toHaveBeenCalledWith(null);
      expect(handleChange2).toHaveBeenCalledWith(null);
    });
  });

  describe('custom props', () => {
    it('supports className and style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <FuiInputGroup
          className="custom-group-class"
          items={[{ element: <FuiInputText onChange={() => {}} value={null} /> }]}
          label="Custom Props"
          style={customStyle}
        />,
      );
      const groupDiv = container.querySelector('.custom-group-class');
      expect(groupDiv).toHaveClass('custom-group-class');
      expect(groupDiv).toHaveStyle('background-color: rgb(255, 0, 0)');
    });
  });
});
