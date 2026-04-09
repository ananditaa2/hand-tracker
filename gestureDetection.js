export class GestureDetector {
    constructor() {
        this.history = [];
        this.maxHistory = 15; // Queue length for position tracking
        this.isPinching = false;
        this.pinchStartTime = 0;
        this.lastGestureTime = 0;
        this.cooldown = 700; // ms between swipe triggers
    }

    getDistance(p1, p2) {
        // Calculate Euclidean distance between two points
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    processLandmarks(landmarks) {
        const now = Date.now();
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];
        const wrist = landmarks[0]; 

        // 1. Maintain tracking history for swipe calculations
        this.history.push({ x: wrist.x, y: wrist.y, time: now });
        if (this.history.length > this.maxHistory) {
            this.history.shift(); // Keep bounded array
        }

        let detectedGesture = null;

        // 2. Pinch Detection Logic
        const pinchDistance = this.getDistance(indexTip, thumbTip);
        if (pinchDistance < 0.05) { // Threshold for pinch connection
            if (!this.isPinching) {
                this.isPinching = true;
                this.pinchStartTime = now;
                detectedGesture = "Pinch"; // Initial tap
            } else {
                if (now - this.pinchStartTime > 800) {
                    detectedGesture = "Pinch Hold"; // Sustained pinch
                }
            }
        } else {
            if (this.isPinching) {
                detectedGesture = "Pinch Release";
                this.isPinching = false;
            }
        }

        // 3. Swipe Detection Logic (Avoid triggering if on cooldown)
        if (now - this.lastGestureTime > this.cooldown) {
            const swipe = this.detectSwipe();
            if (swipe) {
                detectedGesture = swipe;
                this.lastGestureTime = now;
            } else if (detectedGesture === "Pinch") {
                this.lastGestureTime = now;
            }
        }

        return { gesture: detectedGesture, indexTip, thumbTip };
    }

    detectSwipe() {
        // Need min frames to determine momentum/vector
        if (this.history.length < 5) return null;
        
        // Take earliest and latest tracked points
        const first = this.history[0];
        const last = this.history[this.history.length - 1];
        
        // Vector deltas
        const dx = last.x - first.x;
        const dy = last.y - first.y;
        
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        // Strict threshold required to consider a movement a definitive "swipe" and not idle drift
        const swipeThreshold = 0.12; 
        
        // Ensure the movement is deliberate in one axis by comparing magnitudes
        if (absDx > swipeThreshold && absDx > absDy * 1.5) {
            return dx > 0 ? "Swipe Left" : "Swipe Right"; // Note: video feed is mirrored horizontally!
        } else if (absDy > swipeThreshold && absDy > absDx * 1.5) {
            return dy > 0 ? "Swipe Down" : "Swipe Up";
        }
        
        return null;
    }
}
