export function simulateKeyPress(key) {
    // Note: Due to browser security constraints, dispatching keyboard events from JS
    // usually only interacts with standard web forms/elements within the actual page
    // and CANNOT control other tabs or system-level OS interactions natively.
    const event = new KeyboardEvent('keydown', { key: key, bubbles: true });
    document.dispatchEvent(event);
    console.log(`Dispatched KeyboardEvent: ${key}`);
}

export function handleMediaMode(gesture, audioElement) {
    if (!audioElement) return;

    switch (gesture) {
        case "Pinch":
            if (audioElement.paused) audioElement.play();
            else audioElement.pause();
            break;
        case "Swipe Right":
            simulateKeyPress("MediaTrackNext");
            audioElement.currentTime += 5; // Simulating "skip forward"
            break;
        case "Swipe Left":
            simulateKeyPress("MediaTrackPrevious");
            audioElement.currentTime -= 5;
            break;
        case "Swipe Up":
            if (audioElement.volume <= 0.9) audioElement.volume += 0.1;
            break;
        case "Swipe Down":
            if (audioElement.volume >= 0.1) audioElement.volume -= 0.1;
            break;
    }
}

export function handleScrollMode(gesture) {
    // Utilizing standard Web Scroll APIs
    const scrollAmount = window.innerHeight * 0.4;
    switch (gesture) {
        case "Swipe Up":
            simulateKeyPress("ArrowUp");
            document.querySelector('.app-container').scrollBy({ top: -scrollAmount, behavior: 'smooth' });
            break;
        case "Swipe Down":
            simulateKeyPress("ArrowDown");
            document.querySelector('.app-container').scrollBy({ top: scrollAmount, behavior: 'smooth' });
            break;
        case "Pinch Hold":
            // Can be tied to a continuous scroll lock loop
            document.body.style.cursor = 'all-scroll';
            break;
        case "Pinch Release":
            document.body.style.cursor = 'default';
            break;
    }
}

export function handlePresentationMode(gesture) {
    const presentationBox = document.getElementById('presentation-container');
    const slides = document.querySelectorAll('.slide');
    if (!slides || slides.length === 0) return;

    let activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active-slide'));
    
    switch (gesture) {
        case "Swipe Right": 
            simulateKeyPress("ArrowRight");
            if(activeIndex > 0) {
                slides[activeIndex].classList.remove('active-slide');
                slides[activeIndex-1].classList.add('active-slide');
            }
            break;
        case "Swipe Left": 
            simulateKeyPress("ArrowLeft");
            if(activeIndex < slides.length - 1 && activeIndex > -1) {
                slides[activeIndex].classList.remove('active-slide');
                slides[activeIndex+1].classList.add('active-slide');
            }
            break;
        case "Pinch": 
            simulateKeyPress("Escape"); 
            presentationBox.classList.toggle('presentation-fullscreen');
            break;
    }
}
