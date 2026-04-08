const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const drawingCanvas = document.getElementById('drawing_canvas');
const drawingCtx = drawingCanvas.getContext('2d');

const statusText = document.getElementById('system-status');
const handStatus = document.getElementById('hand-status');

const indicators = [
    document.getElementById('ind-1'),
    document.getElementById('ind-2'),
    document.getElementById('ind-3'),
    document.getElementById('ind-4')
];

const lines = [
    document.getElementById('line-1'),
    document.getElementById('line-2'),
    document.getElementById('line-3')
];

let activeZone = -1;
let isPinching = false;
let lastDrawPoint = null;
let lastPinchTime = 0;

const drawingColors = ['#3b82f6', '#eab308', '#22c55e', '#ec4899']; // Blue, Yellow, Green, Pink
let currentColor = drawingColors[0];

// Helper to calculate distance
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function clearCanvas() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // Quick flash effect for feedback
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.backgroundColor = 'var(--text-primary)';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0.3';
    flash.style.transition = 'opacity 0.3s ease-out';
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0'; }, 30);
    setTimeout(() => { flash.remove(); }, 350);
}

function updateZones(zoneIndex) {
    if (activeZone === zoneIndex) return;
    
    // Clear previous
    if (activeZone !== -1) {
        indicators[activeZone].classList.remove('active');
        if (activeZone < 3 && lines[activeZone]) {
            lines[activeZone].classList.remove('active');
        }
        if (activeZone > 0 && lines[activeZone-1]) {
            lines[activeZone-1].classList.remove('active');
        }
    }
    
    activeZone = zoneIndex;
    
    // Set new
    if (activeZone !== -1) {
        indicators[activeZone].classList.add('active');
        // Visually highlight the bounding lines of the zone
        if (activeZone < 3 && lines[activeZone]) {
            lines[activeZone].classList.add('active');
        }
        if (activeZone > 0 && lines[activeZone-1]) {
            lines[activeZone-1].classList.add('active');
        }
    }
}

function onResults(results) {
    // Make sure canvas matches video size for accurate drawing
    if (canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        drawingCanvas.width = videoElement.videoWidth;
        drawingCanvas.height = videoElement.videoHeight;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Only process if hands are detected
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        handStatus.innerText = "Target Acquired";
        handStatus.style.color = "var(--color-green)";

        for (const landmarks of results.multiHandLandmarks) {
            // Draw Hand Skeleton
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: '#22d3ee', // Cyan accent
                lineWidth: 3
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: '#ffffff', 
                fillColor: '#22d3ee',
                lineWidth: 1, 
                radius: 3
            });

            // Tracking logic based on Index Finger Tip (landmark 8) and Thumb Tip (landmark 4)
            const indexFingerTip = landmarks[8];
            const thumbTip = landmarks[4];
            
            const distance = getDistance(indexFingerTip, thumbTip);
            const yPos = indexFingerTip.y; // Normalized coordinates [0.0, 1.0]

            let currentZone = -1;
            if (yPos < 0.25) currentZone = 0;
            else if (yPos < 0.50) currentZone = 1;
            else if (yPos < 0.75) currentZone = 2;
            else currentZone = 3;

            updateZones(currentZone);

            // Pinch detection
            if (distance < 0.05) { 
                const currentPoint = {
                    x: indexFingerTip.x * drawingCanvas.width,
                    y: indexFingerTip.y * drawingCanvas.height
                };

                // Draw interaction point circle on tracking canvas
                canvasCtx.beginPath();
                canvasCtx.arc(currentPoint.x, currentPoint.y, 8, 0, 2 * Math.PI);
                canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                canvasCtx.fill();

                if (!isPinching) {
                    isPinching = true;
                    
                    const now = Date.now();
                    if (now - lastPinchTime < 400) {
                        // Double pinch detected
                        clearCanvas();
                        lastPinchTime = 0; // Reset
                        lastDrawPoint = null;
                        return; // Skip drawing this frame
                    }
                    lastPinchTime = now;
                    lastDrawPoint = currentPoint;
                } else {
                    // Continue drawing
                    if (lastDrawPoint) {
                        currentColor = drawingColors[currentZone === -1 ? 0 : currentZone];
                        
                        drawingCtx.beginPath();
                        drawingCtx.moveTo(lastDrawPoint.x, lastDrawPoint.y);
                        drawingCtx.lineTo(currentPoint.x, currentPoint.y);
                        drawingCtx.strokeStyle = currentColor;
                        drawingCtx.lineWidth = 12;
                        drawingCtx.lineCap = "round";
                        drawingCtx.lineJoin = "round";
                        drawingCtx.shadowBlur = 15;
                        drawingCtx.shadowColor = currentColor;
                        drawingCtx.stroke();
                        drawingCtx.shadowBlur = 0; // Reset shadow for next frame to avoid bleeding
                    }
                    lastDrawPoint = currentPoint;
                }
            } else {
                isPinching = false;
                lastDrawPoint = null;
            }
        }
    } else {
        handStatus.innerText = "Awaiting Target";
        handStatus.style.color = "var(--text-secondary)";
        updateZones(-1);
    }
    canvasCtx.restore();
}

// Initialize MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.65
});

hands.onResults(onResults);

// Start Camera Stream
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
});

statusText.innerText = "Warming up engine...";

camera.start()
    .then(() => {
        statusText.innerText = "System Online";
        statusText.style.color = "var(--color-green)";
    })
    .catch((err) => {
        statusText.innerText = "Camera Denied/Error";
        statusText.style.color = "var(--color-pink)";
        console.error(err);
    });
