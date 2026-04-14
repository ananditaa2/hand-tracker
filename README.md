# NeuralTrack OS - Hand Tracking AI

A real-time, browser-based hand tracking interface powered by MediaPipe and modern web technologies. This application uses computer vision to render a live hand-skeleton overlay on a camera feed and triggers interactive UI elements based on specific hand positions.

## Features

- **Real-Time Hand Tracking:** Utilizes MediaPipe's robust machine learning models to detect and track 21 3D hand landmarks in real-time through your webcam.
- **Dynamic Interaction Zones:** The screen is conceptually divided into multiple interactive zones (Alpha, Beta, Gamma, Delta). When a hand enters or interacts within a zone, the UI dynamically responds and illuminates the corresponding status indicator.
- **Visual Effects Overlay:** Provides a custom HTML5 canvas layer that paints dynamic visual feedback alongside the camera feed.
- **Premium UI/UX:** Designed with a vibrant, modern aesthetic utilizing a custom color palette, smooth CSS transitions, glowing elements, and responsive layouts.

## Technologies Used

- **HTML5:** Core structural framework and `<canvas>` API for overlays.
- **CSS3:** Modern styling, Flexbox/Grid layouts, custom variables, and micro-animations.
- **Vanilla JavaScript (ES6+):** Pure JavaScript application engine, DOM manipulation, logic, and integration.
- **MediaPipe Hands:** Google's open-source framework for building multimodal applied machine learning pipelines.

## Getting Started

Because this application uses web cameras and local assets, it must be accessed through a web server (rather than simply double-clicking the `index.html` file on some browsers).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ananditaa2/hand-tracker.git
   cd hand-tracker
   ```

2. **Start a local web server:**
   If you have Python installed, you can use:
   ```bash
   python -m http.server 8000
   ```
   Or using Node.js (`npx`):
   ```bash
   npx serve
   ```

3. **Open the Application:**
   Visit [`http://localhost:8000`](http://localhost:8000) in your web browser. 

*Note: You must grant the browser permissions to access your webcam when prompted.*

## File Overview

- `index.html`: The main markup file, including the SEO tags, UI skeleton, and MediaPipe CDN imports.
- `style.css`: All the styling rules that give NeuralTrack OS its premium, futuristic look.
- `script.js`: Handles starting the webcam, interacting with the MediaPipe APIs, drawing the hand skeleton, and managing UI state updates based on the zone detection.
