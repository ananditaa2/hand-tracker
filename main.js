import { GestureDetector } from './gestureDetection.js';
import { handleMediaMode, handleScrollMode, handlePresentationMode } from './actions.js';
import { showGestureFeedback, updateModeVisuals, drawInteractionPoints } from './ui.js';

const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const audioElement = document.getElementById('demo-audio');
const statusText = document.getElementById('system-status');
const handStatus = document.getElementById('hand-status');

const detector = new GestureDetector();
let currentMode = "Media"; // Default mode

// Zone Logic: Map Y-coordinates of pointer to 3 specific areas
function determineModeByZone(indexTipY) {
    if (indexTipY < 0.33) return "Media";
    if (indexTipY < 0.66) return "Scroll";
    return "Presentation";
}

function onResults(results) {
    // Dynamic resizing
    if (canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        handStatus.innerText = "Tracking Complete";
        handStatus.style.color = "var(--color-green)";

        // Target primary hand only
        const landmarks = results.multiHandLandmarks[0];

        // Draw Skeletal Mesh
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#22d3ee', lineWidth: 3 });
        drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', fillColor: '#22d3ee', lineWidth: 1, radius: 3 });

        // Pipe positional data into Gesture Engine
        const { gesture, indexTip } = detector.processLandmarks(landmarks);
        
        // Determine Context Mode by position
        const newMode = determineModeByZone(indexTip.y);
        if (newMode !== currentMode) {
            currentMode = newMode;
            updateModeVisuals(currentMode);
        }

        // Render pointer cursor
        drawInteractionPoints(canvasCtx, canvasElement, indexTip);

        // Execute routing if a defined gesture was passed
        if (gesture) {
            showGestureFeedback(gesture);
            
            if (currentMode === "Media") {
                handleMediaMode(gesture, audioElement);
            } else if (currentMode === "Scroll") {
                handleScrollMode(gesture);
            } else if (currentMode === "Presentation") {
                handlePresentationMode(gesture);
            }
        }
    } else {
        handStatus.innerText = "Searching Target";
        handStatus.style.color = "var(--text-secondary)";
    }
    canvasCtx.restore();
}

// MediaPipe Initialization
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({
    maxNumHands: 1, // Restricted to 1 hand for pure control mapping
    modelComplexity: 1,
    minDetectionConfidence: 0.75,
    minTrackingConfidence: 0.75
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => await hands.send({image: videoElement}),
    width: 1280, 
    height: 720
});

statusText.innerText = "Warming up Framework...";
camera.start().then(() => {
    statusText.innerText = "System Online";
    statusText.style.color = "var(--color-green)";
});
