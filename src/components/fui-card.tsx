import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
} from '@fluentui/react-components';
import React from 'react';

/** Matches Fluent's Slot shorthand value type, which is narrower than React.ReactNode. */
type FuiCardSlotContent = React.ReactElement | string | number;

interface FuiCardProps {
  /** Visual style of the card. Defaults to 'filled'. */
  appearance?: 'filled' | 'filled-alternative' | 'outline' | 'subtle';
  /** Layout direction of the card's content. Defaults to 'vertical'. */
  orientation?: 'horizontal' | 'vertical';
  /** Controls the card's border radius and inner spacing. Defaults to 'medium'. */
  size?: 'small' | 'medium' | 'large';
  /** Custom CSS class for the card root. */
  className?: string;
  /** Custom CSS styles for the card root. */
  style?: React.CSSProperties;
  /** FuiCardHeader / FuiCardPreview / FuiCardFooter and any other content. */
  children: React.ReactNode;
}

/** A pure content-display container for hosting a single topic's header, preview and footer. */
const FuiCard: React.FC<FuiCardProps> = ({
  appearance,
  orientation,
  size,
  className,
  style,
  children,
}) => {
  return (
    <Card
      appearance={appearance}
      className={className}
      orientation={orientation}
      size={size}
      style={style}
    >
      {children}
    </Card>
  );
};

interface FuiCardHeaderProps {
  /** Image or avatar related to the card. */
  image?: FuiCardSlotContent;
  /** Main header title. */
  header?: FuiCardSlotContent;
  /** Short description related to the title. */
  description?: FuiCardSlotContent;
  /** Content rendered at the far end of the header, e.g. an overflow menu button. */
  action?: FuiCardSlotContent;
  /** Custom CSS class for the header. */
  className?: string;
  /** Custom CSS styles for the header. */
  style?: React.CSSProperties;
}

/** Renders an image, title, description and action at the top of a FuiCard. */
const FuiCardHeader: React.FC<FuiCardHeaderProps> = ({
  image,
  header,
  description,
  action,
  className,
  style,
}) => {
  return (
    <CardHeader
      action={action}
      className={className}
      description={description}
      header={header}
      image={image}
      style={style}
    />
  );
};

interface FuiCardPreviewProps {
  /** Small badge overlaid on the preview content. */
  logo?: FuiCardSlotContent;
  /** The preview image or content itself. */
  children: React.ReactNode;
  /** Custom CSS class for the preview. */
  className?: string;
  /** Custom CSS styles for the preview. */
  style?: React.CSSProperties;
}

/** Renders an image preview of a document or article inside a FuiCard. */
const FuiCardPreview: React.FC<FuiCardPreviewProps> = ({
  logo,
  children,
  className,
  style,
}) => {
  return (
    <CardPreview className={className} logo={logo} style={style}>
      {children}
    </CardPreview>
  );
};

interface FuiCardFooterProps {
  /** Content rendered at the far end of the footer, e.g. a single icon button. */
  action?: FuiCardSlotContent;
  /** Main footer content, e.g. action buttons. */
  children?: React.ReactNode;
  /** Custom CSS class for the footer. */
  className?: string;
  /** Custom CSS styles for the footer. */
  style?: React.CSSProperties;
}

/** Renders action buttons at the bottom of a FuiCard. */
const FuiCardFooter: React.FC<FuiCardFooterProps> = ({
  action,
  children,
  className,
  style,
}) => {
  return (
    <CardFooter action={action} className={className} style={style}>
      {children}
    </CardFooter>
  );
};

export { FuiCard, FuiCardHeader, FuiCardPreview, FuiCardFooter };
export type {
  FuiCardProps,
  FuiCardHeaderProps,
  FuiCardPreviewProps,
  FuiCardFooterProps,
};
