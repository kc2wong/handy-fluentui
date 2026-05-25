import {
  Carousel,
  CarouselNav,
  CarouselNavButton,
  CarouselNavContainer,
  CarouselViewport,
  CarouselSlider,
  CarouselCard,
  CarouselAnnouncerFunction,
  Image,
} from '@fluentui/react-components';
import * as React from 'react';

/** Props for FuiImageCarousel. */
type ImageCarouselProps = {
  /** URLs of images to display as carousel slides. */
  images: string[];
  /** Tooltip label overrides for the carousel navigation buttons. */
  langLabel?: {
    autoplay?: string;
    next?: string;
    previous?: string;
  };
};

const getAnnouncement: CarouselAnnouncerFunction = (index: number, totalSlides: number) =>
  `Carousel slide ${index + 1} of ${totalSlides}`;

/** Circular image carousel with navigation and autoplay controls. */
const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, langLabel: imageCarousellLabel }) => {

  return (
    <div style={{ width: '100%' }}>
      <Carousel announcement={getAnnouncement} circular groupSize={1}>
        <CarouselViewport style={{ width: '100%', overflow: 'hidden' }}>
          <CarouselSlider
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              width: '100%',
            }}
          >
            {images.map((imageSrc, index) => (
              <CarouselCard
                key={`image-${index}`}
                aria-label={`${index + 1} of ${images.length}`}
                id={`carousel-image-${index}`}
                style={{
                  aspectRatio: '5/2',
                  flexShrink: 0,
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                <Image
                  fit="cover"
                  role="presentation"
                  src={imageSrc}
                  style={{
                    display: 'block',
                    height: '100%',
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
              </CarouselCard>
            ))}
          </CarouselSlider>
        </CarouselViewport>

        <CarouselNavContainer
          autoplayTooltip={{
            content: imageCarousellLabel?.autoplay ?? 'Autoplay',
            relationship: 'label',
          }}
          layout="inline"
          nextTooltip={{ content: imageCarousellLabel?.next ?? 'Next image', relationship: 'label' }}
          prevTooltip={{
            content: imageCarousellLabel?.previous ?? 'Previous image',
            relationship: 'label',
          }}
        >
          <CarouselNav>
            {(index) => <CarouselNavButton aria-label={`Carousel Nav Button ${index}`} />}
          </CarouselNav>
        </CarouselNavContainer>
      </Carousel>
    </div>
  );
};

export type { ImageCarouselProps };
export { ImageCarousel as FuiImageCarousel };
