<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve the imported website's markup, styling and interactions in source modules; the React index mounts it without redesign so animation-only changes remain isolated.
- Use CDN-hosted motion-interpolated WebP frames with fractional canvas blending and mobile-sized decoded bitmaps; map the gown directly to scroll position without catch-up easing or speed caps, and disable Lenis inertia only within the gown scene to prevent input lag while preserving other sections.
- Render the gown on a full-width canvas with studio-backdrop edge extension and a vertical fade; keep the model's original proportions instead of cropping or stretching it.
- Resolve imported original photographs through individual CDN asset pointers; preserve existing image placements and add only collection image cells when needed to show every supplied photo.
