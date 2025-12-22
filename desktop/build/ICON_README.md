# Icon Placeholder

This directory should contain the application icon:

- **icon.ico**: Windows application icon (256x256 recommended)

## How to create the icon:

1. Create or design a 256x256 PNG image for your application
2. Convert it to ICO format using tools like:
   - Online: https://convertio.co/png-ico/
   - ImageMagick: `convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
3. Place the `icon.ico` file in this directory

## Temporary Solution:

If you don't have an icon yet, electron-builder will use a default icon.
You can create the icon later and rebuild the installer.

## Icon Requirements:

- Format: ICO
- Recommended sizes: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
- Transparent background recommended
