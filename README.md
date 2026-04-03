# @gibme/overlay

A simple, configurable loading overlay built on jQuery, Bootstrap utilities, and FontAwesome icons.

## Requirements

- Node.js >= 22
- jQuery 4.x
- Bootstrap 5.x (CSS utilities)
- FontAwesome (via [@gibme/fontawesome](https://github.com/gibme-npm/fontawesome))

## Installation

```bash
yarn add @gibme/overlay
```

or

```bash
npm install @gibme/overlay
```

## Usage

### Module Import

```typescript
import { Overlay } from '@gibme/overlay';
```

### Webpack / Browser Bundle

A pre-built webpack bundle (`Overlay.min.js`) is included in the package and exposes the `Overlay` global.

### Show / Hide

```typescript
// Show overlay on the document body (default)
Overlay.handle($(document.body), 'show');

// Hide it
Overlay.handle($(document.body), 'hide');
```

### Custom Options

```typescript
Overlay.handle($('#my-element'), 'show', {
    background: { color: 'rgba(0, 0, 0, 0.5)' },
    icon: { name: 'circle-notch', style: 'solid', animation: 'spin', color: '#fff' },
    text: { message: 'Loading...', color: '#fff' },
    fade: { in: 300, out: 200 },
    timeout: 5000 // auto-hide after 5 seconds
});
```

### Update Text

```typescript
Overlay.handle($('#my-element'), 'text', 'Please wait...');
```

### Update Progress Bar

```typescript
Overlay.handle($('#my-element'), 'progress', 50); // 50%
```

### Update Icon

```typescript
Overlay.handle($('#my-element'), 'icon', {
    name: 'check',
    style: 'solid',
    color: '#28a745'
});
```

### Update Image

```typescript
Overlay.handle($('#my-element'), 'image', {
    source: '/path/to/image.png',
    animation: 'spin',
    width: 100,
    height: 100
});
```

### Check Overlay State

```typescript
if (Overlay.isOpen($('#my-element'))) {
    // overlay is currently visible
}
```

## Events

The overlay emits jQuery events on the parent element:

| Event              | Description                    |
|--------------------|--------------------------------|
| `overlay.show`     | Fired when the overlay begins showing |
| `overlay.shown`    | Fired after the overlay is fully visible |
| `overlay.hidden`   | Fired after the overlay is fully removed |
| `overlay.resize`   | Fired after an overlay resize  |
| `overlay.text`     | Fired when overlay text changes |
| `overlay.icon`     | Fired when the icon changes    |
| `overlay.image`    | Fired when the image changes   |
| `overlay.progress` | Fired when progress updates    |

## Default Options

| Option               | Default                      |
|----------------------|------------------------------|
| Background color     | `rgba(255, 255, 255, 0.8)`   |
| Icon                 | `spinner` (solid, spin-pulse)|
| Icon color           | `#202020`                    |
| Text color           | `#202020`                    |
| Fade in/out          | `400ms` / `200ms`            |
| Progress bar         | Animated, striped, `#a0a0a0` |
| z-index              | `2147483647`                 |

## Documentation

Full API documentation is available at [https://gibme-npm.github.io/overlay/](https://gibme-npm.github.io/overlay/).

## License

MIT
