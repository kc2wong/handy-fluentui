import {
  Label,
  Title1,
  Title2,
  Subtitle1,
  Subtitle2,
  Body1,
  Body2,
  Caption1,
  Caption2,
} from '@fluentui/react-components';
import React from 'react';

type FuiTextType =
  | 'label'
  | 'title1'
  | 'title2'
  | 'subTitle1'
  | 'subTitle2'
  | 'body1'
  | 'body2'
  | 'caption1'
  | 'caption2';

interface FuiTextProps {
  /** Text content to display. */
  text: string;
  /** Typography style to apply. Defaults to 'label'. */
  type?: FuiTextType;
  /** Renders the text in italics. Defaults to false. */
  italic?: boolean;
  /** Renders the text in bold, overriding the type's default weight. Defaults to false. */
  bold?: boolean;
  /** Renders the text as a block-level element (its own line) instead of inline. Defaults to false. */
  block?: boolean;
  /** Custom CSS class for the text element. */
  className?: string;
  /** Custom CSS styles for the text element. */
  style?: React.CSSProperties;
}

const typeComponents: Record<FuiTextType, React.ComponentType<any>> = {
  label: Label,
  title1: Title1,
  title2: Title2,
  subTitle1: Subtitle1,
  subTitle2: Subtitle2,
  body1: Body1,
  body2: Body2,
  caption1: Caption1,
  caption2: Caption2,
};

/** Typography element covering FluentUI's Label/Title1/Title2/Subtitle1/Subtitle2/Body1/Body2/Caption1/Caption2. */
const FuiText: React.FC<FuiTextProps> = ({
  text,
  type = 'label',
  italic = false,
  bold = false,
  block = false,
  className,
  style,
}) => {
  const Component = typeComponents[type];

  return (
    <Component
      className={className}
      style={{
        display: block ? 'block' : undefined,
        fontStyle: italic ? 'italic' : undefined,
        fontWeight: bold ? 'bold' : undefined,
        ...style,
      }}
    >
      {text}
    </Component>
  );
};

/** Props shared by every fixed-type FuiText variant (FuiLabel, FuiTitle1, ...). */
type FuiTextVariantProps = Omit<FuiTextProps, 'type'>;

const makeFuiTextVariant = (type: FuiTextType): React.FC<FuiTextVariantProps> => {
  const Variant: React.FC<FuiTextVariantProps> = (props) => <FuiText {...props} type={type} />;
  return Variant;
};

/** FuiText fixed to type="label". */
const FuiLabel = makeFuiTextVariant('label');
/** FuiText fixed to type="title1". */
const FuiTitle1 = makeFuiTextVariant('title1');
/** FuiText fixed to type="title2". */
const FuiTitle2 = makeFuiTextVariant('title2');
/** FuiText fixed to type="subTitle1". */
const FuiSubTitle1 = makeFuiTextVariant('subTitle1');
/** FuiText fixed to type="subTitle2". */
const FuiSubTitle2 = makeFuiTextVariant('subTitle2');
/** FuiText fixed to type="body1". */
const FuiBody1 = makeFuiTextVariant('body1');
/** FuiText fixed to type="body2". */
const FuiBody2 = makeFuiTextVariant('body2');
/** FuiText fixed to type="caption1". */
const FuiCaption1 = makeFuiTextVariant('caption1');
/** FuiText fixed to type="caption2". */
const FuiCaption2 = makeFuiTextVariant('caption2');

export {
  FuiText,
  FuiLabel,
  FuiTitle1,
  FuiTitle2,
  FuiSubTitle1,
  FuiSubTitle2,
  FuiBody1,
  FuiBody2,
  FuiCaption1,
  FuiCaption2,
};
export type { FuiTextProps, FuiTextType, FuiTextVariantProps };
