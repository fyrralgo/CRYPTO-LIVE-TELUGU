let currentUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let isPremiumUser = checkPremiumStatus();
let currentVideoIndex = 0;
let countdownInterval;

const videos = [
    { title: "1. Introduction to Crypto & Forex (Basics)", desc: "క్రిప్టో మరియు ఫారెక్స్ ట్రేడింగ్ అంటే ఏమిటి? బేసిక్స్ నేర్చుకోండి.", url: "https://www.youtube.com/embed/dFGVGrc5xHU?si=H26JVaM2ZUj4Mu4m", isLocked: false, duration: "15:20" },
    { title: "2. Technical Analysis & Chart Patterns", desc: "టెక్నికల్ అనాలిసిస్ మరియు చార్ట్ ప్యాటర్న్స్ ద్వారా మార్కెట్ ట్రెండ్స్ ఎలా గుర్తించాలి.", url: "https://www.youtube.com/embed/JgV8ayiVs6s?si=WjwQn36jQI8scn3Z", isLocked: false, duration: "45:10" },
    { title: "3. Risk Management & Psychology", desc: "రిస్క్ మేనేజ్‌మెంట్ ఎందుకు ముఖ్యం? ట్రేడింగ్ సైకాలజీ ఎలా ఉండాలి?", url: "https://www.youtube.com/embed/JgV8ayiVs6s?si=WjwQn36jQI8scn3Z", isLocked: true, duration: "32:05" },
    { title: "3. Risk Management & Psychology", desc: "రిస్క్ మేనేజ్‌మెంట్ ఎందుకు ముఖ్యం? ట్రేడింగ్ సైకాలజీ ఎలా ఉండాలి?", url: "https://youtu.be/33gUzpo_-sc?si=gWoENjj3bvj50zar", isLocked: true, duration: "32:05" },
    { title: "4. Live Trading Setup & Strategies", desc: "లైవ్ ట్రేడింగ్ స్ట్రాటజీస్ మరియు నా సీక్రెట్ సెటప్.", url: "https://youtu.be/33gUzpo_-sc?si=gWoENjj3bvj50zar", isLocked: true, duration: "55:40" },
    { title: "4. Live Trading Setup & Strategies", desc: "లైవ్ ట్రేడింగ్ స్ట్రాటజీస్ మరియు నా సీక్రెట్ సెటప్.", url: "https://youtu.be/33gUzpo_-sc?si=gWoENjj3bvj50zar", isLocked: true, duration: "55:40" },
    { title: "4. Live Trading Setup & Strategies", desc: "లైవ్ ట్రేడింగ్ స్ట్రాటజీస్ మరియు నా సీక్రెట్ సెటప్.", url: "https://youtu.be/33gUzpo_-sc?si=gWoENjj3bvj50zar", isLocked: true, duration: "55:40" },
    { title: "4. Live Trading Setup & Strategies", desc: "లైవ్ ట్రేడింగ్ స్ట్రాటజీస్ మరియు నా సీక్రెట్ సెటప్.", url: "https://youtu.be/33gUzpo_-sc?si=gWoENjj3bvj50zar", isLocked: true, duration: "55:40" },
    { title: "4. Live Trading Setup & Strategies", desc: "లైవ్ ట్రేడింగ్ స్ట్రాటజీస్ మరియు నా సీక్రెట్ సెటప్.", url: "https://youtu.be/33gUzpo_-sc?si=gWoENjj3bvj50zar", isLocked: true, duration: "55:40" }
];

function init() {
    checkAuthStatus();
    updateUIState();
    renderPlaylist();
    loadVideo(0);
}

function checkPremiumStatus() {
    if (!currentUser) return false;
    // Check if user exists in the utr.js paid database
    return window.paidUsersDB.some(u => u.email === currentUser.email);
}

function checkAuthStatus() {
    const authModal = document.getElementById('auth-modal');
    const userDisplay = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');

    if (!currentUser) {
        authModal.classList.remove('hidden');
    } else {
        authModal.classList.add('hidden');
        userDisplay.innerText = `Hi, ${currentUser.name}`;
        userDisplay.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
    }
}

function switchAuthTab(mode) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');
    const errorEl = document.getElementById('auth-error');
    
    errorEl.classList.add('hidden');

    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-blue-400 border-b-2 border-blue-400";
        tabReg.className = "flex-1 pb-3 text-center font-bold text-slate-400";
    } else {
        regForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        tabReg.className = "flex-1 pb-3 text-center font-bold text-emerald-400 border-b-2 border-emerald-400";
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-slate-400";
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-pass').value;
    const errorEl = document.getElementById('auth-error');

    // Check if user exists in hidden.js or utr.js
    const existsInUnpaid = window.registeredUsersDB.some(u => u.email === email);
    const existsInPaid = window.paidUsersDB.some(u => u.email === email);

    if (existsInUnpaid || existsInPaid) {
        errorEl.innerText = "Email is already registered! Please switch to Login.";
        errorEl.classList.remove('hidden');
        return;
    }

    // Add to hidden.js DB
    const newUser = { id: Date.now(), name, email, password };
    window.registeredUsersDB.push(newUser);
    localStorage.setItem('registeredUsersDB', JSON.stringify(window.registeredUsersDB));
    
    currentUser = { name: newUser.name, email: newUser.email };
    localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    
    isPremiumUser = false;
    checkAuthStatus();
    updateUIState();
    loadVideo(currentVideoIndex);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-pass').value;
    const errorEl = document.getElementById('auth-error');

    // 1. Check paid users (utr.js)
    const paidUser = window.paidUsersDB.find(u => u.email === email && u.password === password);
    if (paidUser) {
        currentUser = { name: paidUser.name, email: paidUser.email };
        localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
        isPremiumUser = true;
        checkAuthStatus();
        updateUIState();
        loadVideo(currentVideoIndex);
        return;
    }

    // 2. Check unpaid users (hidden.js)
    const unpaidUser = window.registeredUsersDB.find(u => u.email === email && u.password === password);
    if (unpaidUser) {
        currentUser = { name: unpaidUser.name, email: unpaidUser.email };
        localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
        isPremiumUser = false;
        checkAuthStatus();
        updateUIState();
        loadVideo(currentVideoIndex);
        return;
    }

    errorEl.innerText = "Invalid email or password.";
    errorEl.classList.remove('hidden');
}

function logout() {
    localStorage.removeItem('loggedInUser');
    currentUser = null;
    location.reload();
}

function submitUTR() {
    const utrInput = document.getElementById('utr-input').value.trim();
    const errorMsg = document.getElementById('utr-error');
    
    if (utrInput.length < 8) {
        errorMsg.classList.remove('hidden');
        return;
    }

    errorMsg.classList.add('hidden');
    
    // Transfer user from hidden.js (unpaid) to utr.js (paid)
    if (currentUser) {
        const userIndex = window.registeredUsersDB.findIndex(u => u.email === currentUser.email);
        let userRecord;

        if (userIndex !== -1) {
            userRecord = window.registeredUsersDB.splice(userIndex, 1)[0];
        } else {
            userRecord = { name: currentUser.name, email: currentUser.email, password: "N/A" };
        }

        userRecord.utr = utrInput;
        userRecord.paidAt = new Date().toISOString();

        window.paidUsersDB.push(userRecord);

        // Update storage
        localStorage.setItem('registeredUsersDB', JSON.stringify(window.registeredUsersDB));
        localStorage.setItem('paidUsersDB', JSON.stringify(window.paidUsersDB));
    }

    isPremiumUser = true;
    
    document.getElementById('utr-modal-content').innerHTML = `
        <div class="text-center py-6">
            <i class="fa-solid fa-circle-check text-6xl text-emerald-500 mb-4 animate-bounce"></i>
            <h2 class="text-2xl font-bold text-white mb-2">Payment Verified!</h2>
            <p class="text-slate-400 mb-6">కోర్సు అన్‌లాక్ చేయబడింది. User moved to UTR Paid Registry!</p>
        </div>
    `;

    setTimeout(() => {
        closeModal();
        updateUIState();
        loadVideo(currentVideoIndex);
    }, 2500);
}

function renderPlaylist() {
    const playlistEl = document.getElementById('playlist');
    playlistEl.innerHTML = '';
    videos.forEach((video, index) => {
        const isActive = index === currentVideoIndex;
        const showLock = video.isLocked && !isPremiumUser;
        const item = document.createElement('div');
        item.className = `p-2 md:p-3 mb-2 rounded-lg cursor-pointer transition flex items-start gap-3 ${isActive ? 'bg-blue-600/20 border border-blue-500/50' : 'hover:bg-slate-700/50 border border-transparent'}`;
        item.onclick = () => loadVideo(index);
        item.innerHTML = `
            <div class="relative w-20 h-14 md:w-24 md:h-16 bg-slate-900 rounded flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-700">
                <i class="fa-solid fa-play text-slate-600 text-lg md:text-xl"></i>
                ${showLock ? '<div class="absolute inset-0 bg-slate-900/80 flex items-center justify-center"><i class="fa-solid fa-lock text-slate-400"></i></div>' : ''}
                <span class="absolute bottom-1 right-1 bg-black/80 text-[10px] md:text-xs px-1 rounded text-white">${video.duration}</span>
            </div>
            <div class="flex-1">
                <h4 class="text-xs md:text-sm font-semibold text-white line-clamp-2 ${isActive ? 'text-blue-400' : ''}">${video.title}</h4>
                <p class="text-[10px] md:text-xs text-slate-400 mt-1">${showLock ? 'Premium Only' : 'Free Preview'}</p>
            </div>
        `;
        playlistEl.appendChild(item);
    });
}

function loadVideo(index) {
    currentVideoIndex = index;
    const video = videos[index];
    document.getElementById('video-title').innerText = video.title;
    document.getElementById('video-desc').innerText = video.desc;
    const iframe = document.getElementById('video-frame');
    const overlay = document.getElementById('locked-overlay');
    resetPaymentUI(); 

    if (video.isLocked && !isPremiumUser) {
        iframe.classList.add('hidden');
        iframe.src = ""; 
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        iframe.classList.remove('hidden');
        if(iframe.src !== video.url) {
            iframe.src = video.url;
        }
    }
    renderPlaylist();
    if (window.innerWidth < 768) {
        document.querySelector('.flex-1.overflow-y-auto').scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function initiatePayment() {
    const btn = document.getElementById('pay-btn');
    const qrBtn = document.getElementById('qr-paid-btn'); 
    const msg = document.getElementById('countdown-msg');
    const timerEl = document.getElementById('timer');
    
    btn.classList.add('opacity-50', 'pointer-events-none');
    if (qrBtn) qrBtn.classList.add('opacity-50', 'pointer-events-none'); 
    msg.classList.remove('hidden');
    
    let timeLeft = 60; 
    timerEl.innerText = timeLeft;

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            showUtrModal();
            resetPaymentUI();
        }
    }, 1000);
}

function resetPaymentUI() {
    clearInterval(countdownInterval);
    document.getElementById('pay-btn').classList.remove('opacity-50', 'pointer-events-none');
    const qrBtn = document.getElementById('qr-paid-btn'); 
    if (qrBtn) qrBtn.classList.remove('opacity-50', 'pointer-events-none'); 
    document.getElementById('countdown-msg').classList.add('hidden');
}

function showUtrModal() {
    const modal = document.getElementById('utr-modal');
    const content = document.getElementById('utr-modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('utr-modal');
    const content = document.getElementById('utr-modal-content');
    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('utr-input').value = '';
        document.getElementById('utr-error').classList.add('hidden');
    }, 300); 
}

function updateUIState() {
    const badge = document.getElementById('status-badge');
    if (isPremiumUser) {
        badge.className = "px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-xs md:text-sm font-semibold";
        badge.innerHTML = '<i class="fa-solid fa-check-circle mr-1"></i> Premium Access';
    } else {
        badge.className = "px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/50 text-xs md:text-sm font-semibold";
        badge.innerHTML = '<i class="fa-solid fa-lock mr-1"></i> Locked';
    }
}

window.onload = init;