const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const drawingCanvasElement = document.getElementById('drawing_canvas');
const drawingCanvasCtx = drawingCanvasElement.getContext('2d');

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
let lastPinchPos = null;
let lastPinchTime = 0;

// Helper to calculate distance
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
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
    // Make sure canvases match video size
    if (canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        drawingCanvasElement.width = videoElement.videoWidth;
        drawingCanvasElement.height = videoElement.videoHeight;
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
                color: '#22d3ee', 
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

            // Pinch and Draw logic
            if (distance < 0.06) { 
                if (!isPinching) {
                    isPinching = true;
                    const now = Date.now();
                    
                    // Double pinch check (within 400ms)
                    if (now - lastPinchTime < 400) {
                        // Clear Canvas
                        drawingCanvasCtx.clearRect(0, 0, drawingCanvasElement.width, drawingCanvasElement.height);
                        lastPinchTime = 0; // Prevent triple pinch match
                        
                        // Visual feedback for clear
                        document.querySelector('.app-container').style.filter = 'brightness(1.5)';
                        setTimeout(() => { document.querySelector('.app-container').style.filter = 'none'; }, 150);
                        
                        lastPinchPos = null; // Don't draw line from here
                    } else {
                        lastPinchTime = now;
                        lastPinchPos = null; // Start of a new stroke
                    }
                }
                
                // Draw interaction point circle on output_canvas (the visual pointer)
                canvasCtx.beginPath();
                canvasCtx.arc(indexFingerTip.x * canvasElement.width, indexFingerTip.y * canvasElement.height, 10, 0, 2 * Math.PI);
                canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                canvasCtx.fill();

                // Drawing logic (if not a fresh clear)
                if (lastPinchTime !== 0) {
                    let color = '#ffffff';
                    switch(currentZone) {
                        case 0: color = '#3b82f6'; break; // Blue
                        case 1: color = '#eab308'; break; // Yellow
                        case 2: color = '#22c55e'; break; // Green
                        case 3: color = '#ec4899'; break; // Pink
                        default: color = '#22d3ee'; break; // Cyan (fallback)
                    }

                    const currentPos = {
                        x: indexFingerTip.x * drawingCanvasElement.width,
                        y: indexFingerTip.y * drawingCanvasElement.height
                    };

                    if (lastPinchPos) {
                        drawingCanvasCtx.beginPath();
                        drawingCanvasCtx.moveTo(lastPinchPos.x, lastPinchPos.y);
                        drawingCanvasCtx.lineTo(currentPos.x, currentPos.y);
                        drawingCanvasCtx.strokeStyle = color;
                        drawingCanvasCtx.lineWidth = 6;
                        drawingCanvasCtx.lineCap = 'round';
                        drawingCanvasCtx.stroke();
                    } else {
                        drawingCanvasCtx.beginPath();
                        drawingCanvasCtx.arc(currentPos.x, currentPos.y, 3, 0, 2 * Math.PI);
                        drawingCanvasCtx.fillStyle = color;
                        drawingCanvasCtx.fill();
                    }
                    lastPinchPos = currentPos;
                }
            } else {
                isPinching = false;
                lastPinchPos = null;
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
