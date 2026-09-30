# Our Story — A legacy, carried forward

Open `/our-story.html` after running `npm run dev`. The dedicated page is linked from the main navigation and footer on every page. No install or build step is needed.

The design follows the supplied screenshots: white background, green headings, illustrated farming introduction, green statement band, alternating milestones, a winding sand-coloured road, and the 2025 campus finale. The mobile layout stacks each milestone beside a narrow road, retaining the vehicle journey without overlapping the text.

## Animation

- The truck follows the actual SVG road using native scrolling. It turns with the road, reverses its journey when scrolling up, and changes from an early yellow truck to a red truck in 2010 and the green Nirmal truck in 2020.
- Road geometry is measured after layout and on resize; scroll frames use cached path points. No scroll hijacking, animation dependencies, or continuous animation loop.
- Six muted, inline video illustrations loop while near the viewport and pause offscreen or when the tab is hidden. Videos are requested only when needed. Failed or blocked playback leaves the matching illustration visible.
- The pause button stops the videos, truck, and quality ticker. Its setting persists during the browser session.
- System reduced-motion settings use still illustrations without requesting video files. Text, imagery, and links are readable without JavaScript.
- The year navigation supports direct links to `#year-1998`, `#year-2005`, `#year-2010`, `#year-2020`, and `#year-2025`. Mobile navigation supports keyboard focus and Escape.

## Images and GIFs

All assets are local in `dist/assets/our-story/`. The original illustrations and truck artwork come from the brand's [reference story page](https://keerthiagro.com/next-story), preserving the artwork in the supplied screenshots. No replacement AI artwork was needed.

| Scene | Still image | Animation | GIF export |
| --- | --- | --- | --- |
| Farming introduction | `fields.webp` | `fields.mp4` | `gifs/fields.gif` |
| 1998 mill | `mill-1998.webp` | `mill-1998.mp4` | `gifs/mill-1998.gif` |
| 2005 distribution | `distribution-2005.webp` | `distribution-2005.mp4` | `gifs/distribution-2005.gif` |
| 2010 operations | `operations-2010.webp` | `operations-2010.mp4` | `gifs/operations-2010.gif` |
| 2020 facility | `facility-2020.webp` | `facility-2020.mp4` | `gifs/facility-2020.gif` |
| 2025 campus | `legacy-2025.webp` | `legacy-2025.mp4` | `gifs/legacy-2025.gif` |

Truck sprites are `truck-early.webp`, `truck-growth.webp`, and `truck-modern.webp`. The page uses MP4 for smaller transfers and controllable playback; the GIFs are reusable exports and are not downloaded by the page. They run at 10 frames per second, 480px wide, with a five-second loop. `sources.json` records original source URLs and the output mapping. Original downloads are archived under `.preview/story-originals/`, outside the deployable directory.

The scene artwork is illustrative. Milestone years and business figures follow the supplied reference. Update them in `dist/our-story.html` when the brand history changes.

## Validation

`npm run check` checks both animation scripts and the preview server. Browser verification covers 320–1920px widths, truck alignment and era changes, forward/reverse scrolling, navigation, pause/resume, reduced motion, no-JavaScript content, loaded media, and horizontal overflow. The preview server supports video byte ranges and correct MP4/GIF MIME types.

Deploy `dist/` to a static host. The site has no runtime asset-generation service or external media dependency.
