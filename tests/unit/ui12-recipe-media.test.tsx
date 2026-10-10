// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecipeMedia } from '../../src/web/components/common/RecipeMedia';
import { RecipeCard } from '../../src/web/components/common/RecipeCard';
import { resolveRecipeImage, RECIPE_IMAGE_PLACEHOLDER } from '../../src/web/lib/recipe-media';
import { discoveryRecipes } from '../helpers/ui02-fixtures';

let root: Root, host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
const media = (
  title = 'Món hiện tại',
  src = '/api/v1/recipe-media/meal/hero/2',
  fallbackSrc = '/photo.webp',
) => ({
  image: {
    src,
    fallbackSrc,
    source: 'canonical_r2' as const,
    width: 1200,
    height: 800,
    aspectRatio: '1200 / 800',
  },
  title,
});
const event = async (type: string, image = host.querySelector('img')!) => {
  await act(async () => image.dispatchEvent(new Event(type)));
};

describe('UI12 truthful photo lifecycle', () => {
  it('missing mappings show a named HTML panel without requesting a placeholder image', async () => {
    await act(async () =>
      root.render(<RecipeMedia image={resolveRecipeImage(null)} title="Không ảnh" />),
    );
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('[role=img]')?.getAttribute('aria-label')).toBe('Chưa có ảnh món ăn');
    expect(host.querySelector('[data-recipe-media]')?.getAttribute('aria-busy')).toBe('false');
  });
  it('announces busy until the current photo loads and preserves eager/lazy intent', async () => {
    await act(async () => root.render(<RecipeMedia {...media()} priority />));
    expect(host.querySelector('img')?.getAttribute('loading')).toBe('eager');
    expect(host.querySelector('[data-recipe-media=loading]')).not.toBeNull();
    await event('load');
    expect(host.querySelector('[data-recipe-media=photo]')).not.toBeNull();
    expect(host.querySelector('img')?.alt).toBe('Món hiện tại');
    await act(async () => root.render(<RecipeMedia {...media('Món khác')} />));
    expect(host.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    expect(host.querySelector('[data-recipe-media=loading]')).not.toBeNull();
  });
  it('tries the permitted legacy fallback once, then removes the failed image without a retry loop', async () => {
    await act(async () => root.render(<RecipeMedia {...media()} />));
    await event('error');
    expect(host.querySelector('img')?.getAttribute('src')).toBe('/photo.webp');
    await event('error');
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('[data-recipe-media=missing]')).not.toBeNull();
  });
  it('canonical failure with a placeholder fallback immediately becomes honest missing content', async () => {
    await act(async () =>
      root.render(<RecipeMedia {...media('Ảnh thiếu', undefined, RECIPE_IMAGE_PLACEHOLDER)} />),
    );
    await event('error');
    expect(host.querySelector('img')).toBeNull();
    expect(host.textContent).toContain('Chưa có ảnh món ăn');
  });
  it('a successful legacy fallback stays the current photo', async () => {
    await act(async () => root.render(<RecipeMedia {...media()} />));
    await event('error');
    await event('load');
    expect(host.querySelector('[data-recipe-media=photo] img')?.getAttribute('src')).toBe(
      '/photo.webp',
    );
  });
  it.each(['title', 'src', 'fallbackSrc'] as const)(
    'new %s resets a failed view synchronously',
    async (field) => {
      const initial = media();
      await act(async () => root.render(<RecipeMedia {...initial} />));
      await event('error');
      await event('error');
      const next =
        field === 'title'
          ? { ...initial, title: 'Món mới' }
          : { ...initial, image: { ...initial.image, [field]: '/new.webp' } };
      await act(async () => root.render(<RecipeMedia {...next} />));
      expect(host.querySelector('[data-recipe-media=loading]')).not.toBeNull();
      expect(host.querySelector('img')?.getAttribute('src')).toBe(next.image.src);
    },
  );
  it('late events from an abandoned image cannot alter the new recipe', async () => {
    await act(async () => root.render(<RecipeMedia {...media('Cũ')} />));
    const old = host.querySelector('img')!;
    await act(async () => root.render(<RecipeMedia {...media('Mới', '/new.webp')} />));
    await event('error', old);
    await event('load', old);
    expect(host.querySelector('img')?.alt).toBe('Mới');
    expect(host.querySelector('img')?.getAttribute('src')).toBe('/new.webp');
    expect(host.querySelector('[data-recipe-media=loading]')).not.toBeNull();
  });
});

describe('UI12 native kitchen cards and compatibility', () => {
  it.each(['row', 'grid', 'feature'] as const)(
    '%s exposes the full title and separates type coverage from amount readiness',
    async (variant) => {
      const item = discoveryRecipes(1)[0];
      item.recipe.title = 'Tên món rất dài vẫn có đầy đủ trong thẻ chọn công thức';
      const onClick = vi.fn();
      await act(async () =>
        root.render(
          <RecipeCard
            kitchen
            variant={variant}
            headingLevel={3}
            matchResult={item}
            onClick={onClick}
          />,
        ),
      );
      expect(host.querySelector('h3')?.textContent).toBe(item.recipe.title);
      expect(host.textContent).toContain(`Có ${item.matchPercentage}% loại nguyên liệu`);
      expect(host.querySelector('a')?.getAttribute('href')).toBe(`/recipes/${item.recipe.slug}`);
      await act(async () => host.querySelector('a')!.click());
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );
  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const)(
    '%s preserves native link behavior without invoking SPA navigation',
    async (modifier) => {
      const onClick = vi.fn();
      await act(async () =>
        root.render(<RecipeCard kitchen matchResult={discoveryRecipes(1)[0]} onClick={onClick} />),
      );
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, [modifier]: true });
      // Prevent jsdom navigation only after checking the component's default-prevented state.
      let prevented = true;
      host.addEventListener(
        'click',
        (e) => {
          prevented = e.defaultPrevented;
          e.preventDefault();
        },
        { once: true },
      );
      await act(async () => host.querySelector('a')!.dispatchEvent(click));
      expect(prevented).toBe(false);
      expect(onClick).not.toHaveBeenCalled();
    },
  );
  it('default card rendering remains the legacy presentation', async () => {
    await act(async () =>
      root.render(<RecipeCard matchResult={discoveryRecipes(1)[0]} onClick={() => {}} />),
    );
    expect(host.querySelector('.kitchen-recipe-card')).toBeNull();
    expect(host.querySelector('img')).not.toBeNull();
    expect(host.textContent).toContain('Khớp');
  });
});
