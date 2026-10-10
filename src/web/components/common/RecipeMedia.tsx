import { useState } from 'react';
import { Utensils } from 'lucide-react';
import { RECIPE_IMAGE_PLACEHOLDER, type ResolvedRecipeImage } from '../../lib/recipe-media';

type RecipeMediaProps = {
  image: ResolvedRecipeImage;
  title: string;
  className?: string;
  priority?: boolean;
};

export function RecipeMedia(props: RecipeMediaProps) {
  // A new identity owns new load/error events; abandoned images cannot alter it.
  return (
    <MediaView
      key={JSON.stringify([props.title, props.image.src, props.image.fallbackSrc])}
      {...props}
    />
  );
}

function MediaView({ image, title, className = '', priority = false }: RecipeMediaProps) {
  const [src, setSrc] = useState(image.source === 'placeholder' ? null : image.src);
  const [loaded, setLoaded] = useState(false);
  const state = src ? (loaded ? 'photo' : 'loading') : 'missing';
  return (
    <div
      className={`recipe-media ${className}`}
      data-recipe-media={state}
      aria-busy={state === 'loading'}
    >
      {src ? (
        <img
          key={src}
          src={src}
          alt={title}
          width={image.width ?? 600}
          height={image.height ?? 450}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setSrc(
              src !== image.fallbackSrc && image.fallbackSrc !== RECIPE_IMAGE_PLACEHOLDER
                ? image.fallbackSrc
                : null,
            );
          }}
        />
      ) : (
        <div className="recipe-media-missing" role="img" aria-label="Chưa có ảnh món ăn">
          <Utensils size={24} aria-hidden="true" />
          <span>Chưa có ảnh món ăn</span>
        </div>
      )}
    </div>
  );
}
