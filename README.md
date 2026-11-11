# LAG BENDING

A Gandi IDE custom extension for manually advancing webcam frames.

## Blocks

- **enable camera** — requests webcam permission, starts the camera stream, and immediately captures the first available frame.
- **advance frame** — captures the camera's current frame and replaces the image on the stage.

The camera stream stays active, but the stage image is frozen between calls to **advance frame**. The extension does not run a timer or capture frames automatically.

## Install in Gandi IDE

1. Open the Gandi IDE editor.
2. Open the Extensions panel and choose the custom-extension option.
3. Load this URL:

   `https://cubehub-studio.github.io/Gandi-LAGBENDING/lag-bending.js`

4. Add the **LAG BENDING** blocks to your project.

## Requirements and notes

- Camera access requires a secure context (HTTPS or localhost) and browser permission.
- The extension uses the Gandi 3 `Scratch.gandi.stage.addOverlay()` API to place the frozen frame over the stage.
- Camera access is video-only; audio is not requested.
- If the browser denies permission, the extension reports the error and stops any partially opened stream.

## License

MIT
