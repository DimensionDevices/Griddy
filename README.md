# Griddy v1.2 - An open-source ASCII creation tool.

[Try Griddy here](https://dimensiondevices.github.io/Griddy/)

## What is Griddy?

A browser-based ASCII diagram and art editor. Draw shapes, drop in FIGlet text banners, paint with color, import images as ASCII art, and export the result as plain text, colored HTML, or plain ASCII.

No build step, no dependencies to install. Open `index.html` in a browser and start drawing.

## Features

- **Drawing tools** - Select, Box, Line, Arrow, Circle, Text, Freehand, Fill, Paint, Erase
- **FIGlet text banners** - insert large ASCII-art text using `.flf` fonts, with an optional start/middle/end color gradient (horizontal or vertical)
- **Internet FIGlet font collection** - FIGlet fonts are collected automatically from this GitHub repository, however you may adjust the code to load them locally from the fonts/ folder.
- **Color layer** - paint colors onto any shape or character; colors move together with their shape when you reposition it
- **Image → ASCII import** - convert an uploaded image into ASCII art with:
  - Area-averaged downsampling (sharper than a naive scale-down)
  - Auto contrast (histogram stretch) plus manual contrast/gamma sliders
  - Optional Sobel edge detection (swaps in `| / - \` along strong edges for extra detail)
  - Optional Floyd–Steinberg dithering for smoother gradients
  - Invert toggle
  - Several built-in charsets (density, blocks, detailed)
- **Select tool** - move, resize, copy/paste, and delete shapes; resize handles on all sides plus corners
- **Undo/redo** - full history across all edits
- **Autosave** - work is saved to `localStorage` automatically and restored on reload
- **Export** - copy as plain ASCII text, colored HTML (for pasting into rich text), or plain uncolored text
- **Keyboard shortcuts** - see below

## Getting started

1. Download or clone this repository.
2. Open `index.html` directly in a modern browser (Chrome, Firefox, Safari, Edge). No server or build step required.
3. Start drawing. Your work autosaves locally as you go - reload the page and it'll still be there.

> **Note:** FIGlet fonts are fetched on demand from a public GitHub-hosted `.flf` font repository, so an internet connection is needed the first time you open the Figlet tool. Image import and everything else works fully offline.

## Keyboard shortcuts

Also viewable in-app via the **Shortcuts** link in the footer.

### Tools

| Key | Tool |
|---|---|
| `V` | Select |
| `B` | Box |
| `L` | Line |
| `A` | Arrow |
| `C` | Circle |
| `T` | Text |
| `G` | Figlet |
| `F` | Fill |
| `H` | Freehand |
| `P` | Paint |
| `E` | Erase |

### Editing

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + Z` | Undo |
| `Ctrl/⌘ + Shift + Z` or `Ctrl/⌘ + Y` | Redo |
| `Ctrl/⌘ + C` | Copy selected shape |
| `Ctrl/⌘ + V` | Paste at cursor |
| `Delete` / `Backspace` | Delete selected shape |
| `Esc` | Deselect, or close an open modal |

### File

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + S` | Save |

## Exporting your work

Use the toolbar buttons to:

- **Copy ASCII** - copies the plain-text grid (characters only, no color) to your clipboard
- **Copy as HTML** - copies a colored `<pre>` block suitable for pasting into rich-text editors or web pages
- **Copy plain text** - copies the plain-text grid without any HTML wrapper

## Tech

Everything - markup, styles, and logic - lives in a single `index.html` file using vanilla JavaScript (no framework, no bundler). Rendering is done with two stacked `<pre>` layers (characters and colors) over a plain-text character grid, with an invisible hit-testing layer on top to handle mouse interaction.
