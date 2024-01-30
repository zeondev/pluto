# CSS Classes

[Back to README.md](README.md)

There are many CSS classes that are available in Pluto. Until all of them are documented, here are a lot of the utility ones that are commonly used:

## Other

- `with-sidebar` - Applied to a window's wrapper if you want to use a sidebar. Removes padding so that the sidebar is flush with the window edges.

## Spacing

- `ml-auto` - Applied to any div. Pushes content to the right.
- `mr-auto` - Applied to any div. Pushes content to the left.
- `mt-auto` - Applied to any div. Pushes content to the bottom.
- `mb-auto` - Applied to any div. Pushes content to the top.
- `m-0` - Disables margin.
- `mt-0` - Disables margin for the top only.
- `ml-0` - Disables margin for the left only.
- `mr-0` - Disables margin for the right only.
- `mt-1` - Adds 4px of margin to the top.
- `mt-2` - Adds 8px of margin to the top.
- `mb-0` - Disables margin for the bottom only.
- `mb-2` - Adds 8px of margin to the bottom.
- `mb-1` - Adds 4px of margin to the bottom.
- `o-h` - Hides overflow for the content.
- `ovh` - Allows overflow for the content.
- `separator` - Space nearby elements as far apart as they can be.
- `padded` - Applies large horizontal and vertical padding.
- `container` - Applies 10px padding.
- `padding` - Apply a padding of 8px.
- `padding-mid` - Apply a padding of 6px.
- `padding-small` - Apply a padding of 4px.

## Layout

### General

- `w-100` - Sets the width to 100%.
- `h-100` - Sets the height to 100%.
- `mc` - Set the width to max content.
- `mhc` - Set the height to max content.

### Flexbox

- `row` - Applied to any div. Turns it into a flexbox row.
- `row-wrap` - Applied to any div. Turns it into a flexbox row that wraps.
- `col` - Applied to any div. Turns it into a flexbox column.
- `fg` - Expand the element to fill the remaining area. May work better with `w-100` or `h-100`.
- `fc` - Justify content to the center and align items to the center.
- `jc` - Justify content to the center.
- `js` - Justify content to the start.
- `ac` - Align items to the center.
- `as` - Align items to the start.
- `if` - Display the element as inline-flex.

### Flexbox Spacing

- `gap` - Apply a gap of 8px.
- `gap-mid` - Apply a gap of 6px.
- `gap-small` - Apply a gap of 4px.

## Display

- `list-item` - Makes it fill the screen and have pre-formatted spacing.
- `nf` - Display the element as a block.
- `card` - Applies some basic styling to make it look like a card.
- `card-box` - Make the element look like a container that holds cards.
- `alert` - Displays a warning alert

- `display-heading` - Very large heading. Useful for fullscreen windows.
- `display-subheading` - Large heading, used in fullscreen windows
- `display-padding` - Adds padding relative to viewport.

- `no-ui` - Apply monospace font and some terminal-like styles.

- `h1` - Make it look like a top-level heading.
- `h2` - Make it look like a second-level heading.
- `h3` - Make it look like a third-level heading.

- `label` - Make it appear like a label.
- `label-light` - Make it appear like a brighter-colored label.
- `small-label` - Another small label.
- `superscript` - Uses align-self: start

- `spacer` - Used to create a label with a line that stretches to the end:

```html
<div class="spacer">
  <span>Text</span>
  <span class="space"></span>
</div>
```

- `badge` - Create a inline rounded badge with text.

## Animation

- `fadeIn` - Make the element fade in.
- `fadeOut` - Make the element fade out.
- `slideIn` - Make the element slide in.
- `slideOut` - Make the element slide out.

## Color

- `blur` - Applies backdrop filter to the element, blurring things behind it.
- `success` - Turns the colo to the positive color- usually green.
- `danger` - Turns the color to the negative color, usually red.
- `warning` - Turns the color to the warning-light color, usually yellow.
- `info` - Turns the color to the primary color, usually blue.
- `transparent` - Hides the content's background and border colors.
- `muted` - Apply label-light color and make the text look muted.
