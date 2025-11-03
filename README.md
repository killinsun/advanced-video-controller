# Advanced Video Controller

A Chrome extension that adds advanced video control features to Softbank Basketball LIVE (basketball.mb.softbank.jp) video player.

## Features

### ⌨️ Keyboard Shortcuts
- **← / →**: Skip backward/forward 1 second
- **Shift + ← / →**: Skip backward/forward 0.5 seconds

### 🎮 Custom Control Panel
- **Play/Pause Button**: Toggle video playback
- **Skip Buttons**: Jump backward/forward by 1 second
- **Time Jump**: Enter a specific time (e.g., `1:30` or `90`) to jump to that position

### 🔗 URL Parameter Support
Load the page with a time parameter to pre-fill the time input field:
- `?t=90` - Pre-fills "90" seconds
- `?t=1:30` - Pre-fills "90" seconds (1 minute 30 seconds)

After the page loads, manually click the play button and then click the "移動" (Jump) button to seek to the specified time.

## Installation

### From Source

1. Clone this repository:
```bash
git clone https://github.com/killinsun/advanced-video-controller.git
cd advanced-video-controller
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` directory

### Development Mode

For development with hot reload:

```bash
npm run dev
```

Then load the `.output/chrome-mv3` directory in Chrome as described above.

## Usage

1. Navigate to any video page on `https://basketball.mb.softbank.jp/lives/*`
2. Wait for the extension to load (you'll see a control panel appear above the quality selector)
3. Use keyboard shortcuts or click the control buttons

### Time Input Formats

The time input field accepts multiple formats:
- **Seconds only**: `90` → 1 minute 30 seconds
- **MM:SS format**: `1:30` → 1 minute 30 seconds
- **HH:MM:SS format**: `1:15:30` → 1 hour 15 minutes 30 seconds

### URL Parameter

Access a video with a time parameter to pre-fill the jump time:

```
https://basketball.mb.softbank.jp/lives/504800?t=500
```

This will pre-fill "500" in the time input field. Click play, then click "移動" to jump to 8 minutes 20 seconds.

## Technical Details

### Tech Stack
- **Framework**: [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- **UI Library**: React 19
- **Language**: TypeScript 5.9+
- **Video Player**: Video.js (detected via `window.videojs.getPlayers()`)
- **Target FPS**: 30fps (1 frame = 0.033 seconds)

### Architecture

```
src/
├── entrypoints/
│   └── content/
│       └── index.tsx          # Main content script
├── components/
│   └── ControlPanel.tsx       # Custom control UI
├── utils/
│   ├── player-detector.ts     # Video.js player detection
│   ├── frame-controller.ts    # Video control logic
│   ├── time-parser.ts         # Time string parser
│   └── url-params.ts          # URL parameter handler
└── types/
    └── videojs.d.ts           # Video.js type definitions
```

### Key Implementation Details

**Content Script World**: The extension runs in `MAIN` world (not isolated) to access the page's `window.videojs` object:

```typescript
export default defineContentScript({
  matches: ['https://basketball.mb.softbank.jp/lives/*'],
  runAt: 'document_idle',
  world: 'MAIN',  // Critical for accessing window.videojs
  // ...
});
```

**Player Detection**: Uses a retry mechanism with multiple fallback strategies to detect Video.js player initialization.

**UI Mounting**: Injects the control panel above the quality selector using DOM manipulation and React portal rendering.

## Development

### Project Structure

- `/src/entrypoints/content/` - Content script entry point
- `/src/components/` - React components
- `/src/utils/` - Utility functions and controllers
- `/src/types/` - TypeScript type definitions
- `/docs/` - Documentation and planning files

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production extension
- `npm run build:firefox` - Build for Firefox

### Adding New Features

1. Add utility functions in `/src/utils/`
2. Create React components in `/src/components/`
3. Update the main content script in `/src/entrypoints/content/index.tsx`
4. Add TypeScript types in `/src/types/` if needed

## Known Limitations

- Only works on `https://basketball.mb.softbank.jp/lives/*`
- Assumes 30fps video (frame-by-frame navigation accuracy depends on this)
- URL parameter feature requires manual play button click (auto-play is not implemented due to browser restrictions)

## Troubleshooting

### Extension not loading
- Check that you're on a valid URL (`https://basketball.mb.softbank.jp/lives/*`)
- Open DevTools Console and look for `[AVC]` log messages
- Ensure the extension is enabled in `chrome://extensions/`

### Keyboard shortcuts not working
- Click on the video player area to ensure focus
- Check that you're not focused on an input field
- Verify the shortcuts in the console logs

### Player not detected
- Wait a few seconds for the page to fully load
- Check console for `[AVC] Player detected` message
- If player detection fails after 10 seconds, refresh the page

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

[@killinsun](https://github.com/killinsun)
