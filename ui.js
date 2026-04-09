export function showGestureFeedback(gestureName) {
    if (!gestureName || gestureName === "Pinch Hold") return;

    const feedbackEl = document.getElementById('gesture-feedback');
    feedbackEl.innerText = gestureName;
    feedbackEl.style.opacity = '1';
    feedbackEl.style.transform = 'translate(-50%, 0) scale(1.1)';
    
    // Auto-hide timeout
    setTimeout(() => {
        feedbackEl.style.opacity = '0';
        feedbackEl.style.transform = 'translate(-50%, -20px) scale(1)';
    }, 1200);
}

export function updateModeVisuals(mode) {
    const indicators = document.querySelectorAll('.mode-indicator');
    indicators.forEach(ind => ind.classList.remove('active'));
    
    const targetElement = document.getElementById(`ind-${mode.toLowerCase()}`);
    if(targetElement) {
        targetElement.classList.add('active');
    }
}

export function drawInteractionPoints(ctx, canvas, indexTip) {
    const pointX = indexTip.x * canvas.width;
    const pointY = indexTip.y * canvas.height;

    ctx.beginPath();
    ctx.arc(pointX, pointY, 12, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22d3ee';
    ctx.stroke();

    // Create a pulse ring effect
    ctx.beginPath();
    ctx.arc(pointX, pointY, 25, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
}
