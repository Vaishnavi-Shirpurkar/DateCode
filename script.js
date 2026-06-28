document.addEventListener('DOMContentLoaded', () => {
    // Shared Background Layer Engine
    const heartsBg = document.getElementById('hearts-bg');
    
    // Page Elements Navigation Hooks
    const page1 = document.getElementById('page-1');
    const page2 = document.getElementById('page-2');
    const page3 = document.getElementById('page-3');

    // Page 1 Control nodes
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');

    // Page 2 Control nodes
    const choiceCards = document.querySelectorAll('.choice-card');
    const customCard = document.getElementById('custom-option-card');
    const customInputContainer = document.getElementById('custom-input-container');
    const customDestInput = document.getElementById('custom-destination-input');
    const dateSelect = document.getElementById('date-select');
    const timeSelect = document.getElementById('time-select');
    const nextToPage3Btn = document.getElementById('next-to-page3');

    // Page 3 Control nodes & Elements
    const vinylDisk = document.getElementById('vinyl-disk');
    const polaroidImg = document.getElementById('rotating-polaroid');
    const finalSummary = document.getElementById('final-summary');
    const summaryPlace = document.getElementById('summary-place');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const trackIndicator = document.getElementById('current-track-name');
    const togglePlayBtn = document.getElementById('toggle-play-btn');
    const prevSongBtn = document.getElementById('prev-song-btn');
    const nextSongBtn = document.getElementById('next-song-btn');

    // App Session Global Tracker States
    let selectedPlace = "";
    let finalDate = "";
    let finalTime = "";
    let slideshowInterval = null;
    let currentTrackIndex = 1; 
    let isPlaying = true;
    
    // Safety tracker flags
    let hasClickedYes = false;
    let hasConfirmedDateDetails = false;

    // --- PHOTO CONFIGURATION ENGINE ---
    const coupleImages = [
        "images/pic1.webp",
        "images/pic2.jpg",
        "images/pic3.jpg",
        "images/pic4.webp"
    ];
    let photoIndex = 0;

    const fallbackUrls = [
        "https://unsplash.com",
        "https://unsplash.com",
        "https://unsplash.com",
        "https://unsplash.com"
    ];

    // --- SMART VALIDATION: LOCK OUT PAST DATES ---
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    if (dateSelect) dateSelect.min = todayString;

    // --- DYNAMIC LATE NIGHT BUTTON LOGIC ---
    if (timeSelect) {
        timeSelect.addEventListener('input', () => {
            if (!timeSelect.value) return;
            const [hours] = timeSelect.value.split(':');
            const hourInt = parseInt(hours, 10);
            if (hourInt >= 21) {
                nextToPage3Btn.innerHTML = "Confirm Our Late Night Date ✨";
            } else {
                nextToPage3Btn.innerHTML = "Confirm Your Date 💖";
            }
        });
    }

    // --- 1. AMBIENT BACKGROUND ANIMATION LOGIC ---
    function createFloatingEmoji() {
        if (!heartsBg) return;
        const emojiElement = document.createElement('div');
        const items = ['❤️', '🧸', '💖', '🧸'];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        
        emojiElement.innerHTML = randomItem;
        emojiElement.style.left = Math.random() * 100 + 'vw';
        emojiElement.style.animationDuration = Math.random() * 3 + 4 + 's';
        emojiElement.style.fontSize = Math.random() * 14 + 14 + 'px';
        emojiElement.className = (randomItem === '🧸') ? 'floating-bear' : 'floating-heart';
        
        heartsBg.appendChild(emojiElement);
        setTimeout(() => emojiElement.remove(), 6000);
    }
    setInterval(createFloatingEmoji, 450);

    // --- 2. RUNAWAY NO BUTTON INSTABILITY TRIGGERS ---
    function moveNoButton() {
        const cardContainer = document.querySelector('.card-container');
        const containerRect = cardContainer.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();

        const maxX = containerRect.width - btnRect.width - 40;
        const maxY = containerRect.height - btnRect.height - 40;

        const randomX = Math.max(20, Math.floor(Math.random() * maxX));
        const randomY = Math.max(20, Math.floor(Math.random() * maxY));

        noBtn.style.position = 'absolute';
        noBtn.style.left = `${randomX}px`;
        noBtn.style.top = `${randomY}px`;
        noBtn.style.margin = '0';
    }
    noBtn.addEventListener('mouseenter', moveNoButton);
    noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); });

    // --- 3. STATE MANAGEMENT ENGINE (ROUTING INTERFACES) ---
    window.history.replaceState({ page: 1 }, "Page 1", "");

    function showPage(pageNumber) {
        page1.style.display = 'none'; page1.classList.remove('active');
        page2.style.display = 'none'; page2.classList.remove('active');
        page3.style.display = 'none'; page3.classList.remove('active');

        if (pageNumber === 1) {
            page1.style.display = 'flex'; setTimeout(() => page1.classList.add('active'), 20);
            resetApplicationForm(); 
        } else if (pageNumber === 2) {
            page2.style.display = 'flex'; setTimeout(() => page2.classList.add('active'), 20);
            stopPhotoSlideshow(); 
        } else if (pageNumber === 3) {
            page3.style.display = 'flex'; setTimeout(() => page3.classList.add('active'), 20);
            initPage3();
        }
    }

    window.addEventListener('popstate', (event) => {
        const targetPage = (event.state && event.state.page) ? event.state.page : 1;
        if (targetPage === 2 && !hasClickedYes) {
            window.history.replaceState({ page: 1 }, "Page 1", ""); showPage(1); return;
        }
        if (targetPage === 3 && (!hasClickedYes || !hasConfirmedDateDetails)) {
            window.history.replaceState({ page: 2 }, "Page 2", ""); showPage(2); return;
        }
        showPage(targetPage);
    });

    yesBtn.addEventListener('click', () => {
        hasClickedYes = true; 
        window.history.pushState({ page: 2 }, "Page 2", "");
        showPage(2);
    });
    // --- 4. SCREEN 2 DESTINATION CHOICES REGISTRATION ---
    choiceCards.forEach(card => {
        card.addEventListener('click', () => {
            choiceCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const selectedType = card.getAttribute('data-place');
            if (selectedType === 'custom') {
                customInputContainer.classList.remove('hidden'); customDestInput.focus(); selectedPlace = customDestInput.value;
            } else {
                customInputContainer.classList.add('hidden'); selectedPlace = selectedType;
            }
        });
    });

    if (customDestInput) {
        customDestInput.addEventListener('input', () => {
            if (customCard && customCard.classList.contains('selected')) { selectedPlace = customDestInput.value; }
        });
    }

    nextToPage3Btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!selectedPlace || selectedPlace.trim() === "") { alert("Please pick or type a destination, Chiku! ✨"); return; }
        if (!dateSelect.value) { alert("Please pick a special day for our date! 📆"); return; }
        if (!timeSelect.value) { alert("Please pick a time for our meeting! ⏰"); return; }

        const userSelectedDateTime = new Date(`${dateSelect.value}T${timeSelect.value}`);
        const currentLiveTime = new Date();
        if (userSelectedDateTime < currentLiveTime) {
            alert("Chiku, you picked a time that has already passed! Let's pick a future date for our memories. 💕"); return;
        }
        finalDate = dateSelect.value; finalTime = timeSelect.value; hasConfirmedDateDetails = true;
        window.history.pushState({ page: 3 }, "Page 3", ""); showPage(3);
    });

    // --- 5. SCREEN 3: MASTER INITIALIZATION & AUDIO ENGINES ---
    function initPage3() {
        if (finalSummary) finalSummary.classList.remove('hidden');
        isPlaying = true;
        if (togglePlayBtn) togglePlayBtn.innerHTML = "⏸️";
        if (vinylDisk) vinylDisk.classList.add('spinning');
        manageSongPlayback();

        if (polaroidImg) {
            photoIndex = 0; polaroidImg.src = coupleImages[photoIndex];
            polaroidImg.onerror = function() { this.src = fallbackUrls[photoIndex]; };
            polaroidImg.style.opacity = 1;
        }

        stopPhotoSlideshow();
        slideshowInterval = setInterval(() => {
            if (!polaroidImg) return;
            polaroidImg.style.opacity = 0; 
            setTimeout(() => {
                photoIndex = (photoIndex + 1) % coupleImages.length;
                polaroidImg.src = coupleImages[photoIndex];
                polaroidImg.onerror = function() { this.src = fallbackUrls[photoIndex]; };
                polaroidImg.style.opacity = 1; 
            }, 350); 
        }, 3000);

        if (summaryPlace) summaryPlace.innerText = selectedPlace;
        if (summaryDate) summaryDate.innerText = formatDateString(finalDate);
        if (summaryTime) summaryTime.innerText = formatTimeString12hr(finalTime);
    }

    function manageSongPlayback() {
        const song1 = document.getElementById('bg-love-song-1');
        const song2 = document.getElementById('bg-love-song-2');
        if (!song1 || !song2) return;
        song1.pause(); song2.pause();
        if (!isPlaying) return;
        if (currentTrackIndex === 1) {
            if (trackIndicator) trackIndicator.innerText = "🎵 Mala Ved Laagale"; song1.play().catch(() => {});
        } else {
            if (trackIndicator) trackIndicator.innerText = "🎵 Hrudayat Vaje Something"; song1.pause(); song2.play().catch(() => {});
        }
    }

    if (togglePlayBtn) {
        togglePlayBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                togglePlayBtn.innerHTML = "⏸️"; if (vinylDisk) vinylDisk.classList.add('spinning');
            } else {
                togglePlayBtn.innerHTML = "▶️"; if (vinylDisk) vinylDisk.classList.remove('spinning');
            }
            manageSongPlayback();
        });
    }

    function swapTrack() {
        currentTrackIndex = (currentTrackIndex === 1) ? 2 : 1; isPlaying = true; 
        if (togglePlayBtn) togglePlayBtn.innerHTML = "⏸️";
        if (vinylDisk) vinylDisk.classList.add('spinning');
        manageSongPlayback();
    }
    if (nextSongBtn) nextSongBtn.addEventListener('click', swapTrack);
    if (prevSongBtn) prevSongBtn.addEventListener('click', swapTrack);

    function stopPhotoSlideshow() { if (slideshowInterval) { clearInterval(slideshowInterval); slideshowInterval = null; } }

    function resetApplicationForm() {
        selectedPlace = ""; finalDate = ""; finalTime = ""; currentTrackIndex = 1;
        hasClickedYes = false; hasConfirmedDateDetails = false;
        if (dateSelect) dateSelect.value = ""; if (timeSelect) timeSelect.value = "";
        if (customDestInput) { customDestInput.value = ""; customInputContainer.classList.add('hidden'); }
        choiceCards.forEach(c => c.classList.remove('selected'));
        if (nextToPage3Btn) nextToPage3Btn.innerHTML = "Confirm Your Date 💖";
        if (noBtn) { noBtn.style.position = 'static'; noBtn.style.left = 'auto'; noBtn.style.top = 'auto'; }
        const song1 = document.getElementById('bg-love-song-1'); const song2 = document.getElementById('bg-love-song-2');
        if (song1) { song1.pause(); song1.currentTime = 0; } if (song2) { song2.pause(); song2.currentTime = 0; }
    }

    // Pristine core API endpoint link hooked to the new cache-busting ID
    const telegramTrigger = document.getElementById('telegram-final-dispatch');

    if (telegramTrigger) {
        telegramTrigger.addEventListener('click', (event) => {
            event.preventDefault();

            telegramTrigger.innerText = "Sending Plan... 💕";
            telegramTrigger.disabled = true;

            const finalLoc = document.getElementById('summary-place').innerText;
            const finalDay = document.getElementById('summary-date').innerText;
            const finalHour = document.getElementById('summary-time').innerText;
            const finalVibe = document.getElementById('current-track-name').innerText;

            const packetBodyText = `🌹 Chiku accepted your date invitation! 🌹\n\n📍 Destination: ${finalLoc}\n📅 Date: ${finalDay}\n⏰ Time: ${finalHour}\n🎵 Our Vibe Track: ${finalVibe}\n\nCan't wait! 🥰`;

            // Pristine core API endpoint link
            const targetUrl = 'https://telegram.org';

            fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: '1163902427', text: packetBodyText })
            })
            .then(res => {
                if (res.ok) {
                    alert("Itinerary shared successfully with him! Can't wait! ✨");
                } else {
                    alert("Confirmed successfully! Resetting invitation panel... 💕");
                }
                window.history.pushState({ page: 1 }, "Page 1", "");
                location.reload();
            })
            .catch(err => {
                console.log("Fallback loop entry:", err);
                alert("Confirmed successfully! Resetting invitation panel... 💕");
                location.reload();
            });
        });
    }


    function formatDateString(str) {
        const dateObj = new Date(str); if (isNaN(dateObj)) return str;
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatTimeString12hr(timeString) {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(':'); const hourInt = parseInt(hours, 10);
        const ampm = hourInt >= 12 ? 'PM' : 'AM'; const formattedHour = hourInt % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }
});
