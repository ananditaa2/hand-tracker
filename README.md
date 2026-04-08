# 👁️‍🗨️ NeuralTrack OS: Real-Time Hand Spatial Interaction

A browser-based, AI-powered spatial interface using Google's **MediaPipe**. 
This application captures webcam feed and overlays a real-time computer vision skeleton on your hands to provide interactive gesture detection.

## ✨ Features
- **Low-latency Spatial Tracking**: Traces your hand structure in real-time.
- **Glassmorphic UI Engine**: Dark-mode cyberpunk dashboard built with Vanilla CSS.
- **Dynamic Interaction Zones**: The screen canvas is divided into 4 horizontal threshold zones (Alpha, Beta, Gamma, Delta).
- **Pinch-to-Draw Engine**:
  - Touch your index finger and thumb together to draw floating strokes.
  - Double-pinch rapidly to trigger a screen flash and wipe the canvas clean.
  - The color of your brush changes automatically as your hand moves across the different spatial height zones.

## 🚀 How to Run Locally

You don't need any complex build steps. You can host it using `serve`, `http-server`, or any basic local server.

```bash
# 1. Clone the repository
git clone https://github.com/ananditaa2/hand-tracker.git
cd hand-tracker

# 2. Run a local development server (e.g., using npx)
npx serve .
```
Open up the assigned localhost port in your web browser. 
*(Make sure you grant the browser permission to access your webcam!)*

## 🛠️ Technology Stack
- **HTML5 Canvas** (Dual-layer rendering architecture)
- **Vanilla JavaScript** (Gesture mathematics & state machines)
- **Vanilla CSS3** (CSS Custom Properties, Backdrop Filters, Keyframe Animations)
- **MediaPipe Hands** (CDN Implementation)
