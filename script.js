const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2YAW83XRbzsrPNF8PX0N-JhA--QzxyhjoApPrpp0rMqShM4bl-syKZMys54xKpX1D/exec';

let currentUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let isPremiumUser = false;
let currentVideoIndex = 0;
let cartBillingData = null;
let authTimer = null;

const videos = [
    { title: "1. Introduction to Crypto & Forex (Basics)", desc: "క్రిప్టో మరియు ఫారెక్స్ ట్రేడింగ్ అంటే ఏమిటి? బేసిక్స్ నేర్చుకోండి.", url: "https://www.youtube.com/embed/dFGVGrc5xHU?si=H26JVaM2ZUj4Mu4m", isLocked: false, duration: "15:20" },
    { title: "2. Technical Analysis & Chart Patterns", desc: "టెక్నికల్ అనాలిసిస్ మరియు చార్ట్ ప్యాటర్న్స్ ద్వారా మార్కెట్ ట్రెండ్స్ ఎలా గుర్తించాలి.", url: "https://www.youtube.com/embed/JgV8ayiVs6s?si=WjwQn36jQI8scn3Z", isLocked: false, duration: "45:10" },
    { title: "3. Risk Management & Psychology", desc: "రిస్క్ మేనేజ్‌మెంట్ ఎందుకు ముఖ్యం? ట్రేడింగ్ సైకాలజీ ఎలా ఉండాలి?", url: "https://www.youtube.com/embed/JgV8ayiVs6s?si=WjwQn36jQI8scn3Z", isLocked: true, duration: "32:05" },
    { title: "4. Live Trading Setup & Strategies", desc: "లైవ్ ట్రేడింగ్ స్ట్రాటజీస్ మరియు నా సీక్రెట్ సెటప్.", url: "https://youtu.be/33gUzpo_-sc?si=gWoENjj3bvj50zar", isLocked: true, duration: "55:40" }
];

async function init() {
    if (currentUser && currentUser.email) {
        try {
            const res = await fetch(`${SCRIPT_URL}?action=check_status&email=${encodeURIComponent(currentUser.email.toLowerCase().trim())}`);
            const data = await res.json();
            isPremiumUser = data.isPremium;
        } catch (err) {
            console.error("Status check failed", err);
        }
    }
    
    checkAuthStatus();
    updateUIState();
    renderPlaylist();
    loadVideo(0);
}

function checkAuthStatus() {
    const authModal = document.getElementById('auth-modal');
    const userDisplay = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');
    const loginNavBtn = document.getElementById('login-nav-btn');

    if (!currentUser) {
        authModal.classList.add('hidden');
        if (loginNavBtn) loginNavBtn.classList.remove('hidden');

        if (authTimer) clearTimeout(authTimer);
        authTimer = setTimeout(() => {
            if (!currentUser) {
                showAuthModal();
            }
        }, 120000);

    } else {
        authModal.classList.add('hidden');
        if (loginNavBtn) loginNavBtn.classList.add('hidden');
        if (authTimer) clearTimeout(authTimer);

        userDisplay.innerText = `Hi, ${currentUser.name}`;
        userDisplay.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
    }
}

function showAuthModal(showNotice = false) {
    const noticeEl = document.getElementById('auth-notice');
    if (showNotice) {
        noticeEl.classList.remove('hidden');
    } else {
        noticeEl.classList.add('hidden');
    }
    document.getElementById('auth-modal').classList.remove('hidden');
}

/* Requirement 2 & 3: Lock Click Handler */
function handleUnlockClick() {
    // Requirement 2: Check if user is logged in/registered first
    if (!currentUser) {
        showAuthModal(true);
        return;
    }

    // Requirement 3: If logged in, open the Digit Input Popup first
    document.getElementById('amount-digit-input').value = '';
    validateAmountDigitInput();
    document.getElementById('amount-modal').classList.remove('hidden');
}

/* Requirement 3: Digit Matching Validation */
function validateAmountDigitInput() {
    const inputVal = document.getElementById('amount-digit-input').value.trim();
    const nextBtn = document.getElementById('amount-next-btn');

    // Strict validation for exact digit match: "INR 1.00"
    if (inputVal === 'INR 1.00') {
        nextBtn.disabled = false;
        nextBtn.className = "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition text-sm shadow-lg shadow-emerald-500/30 cursor-pointer";
    } else {
        nextBtn.disabled = true;
        nextBtn.className = "flex-1 bg-slate-600 text-slate-400 font-bold py-2.5 rounded-lg transition text-sm cursor-not-allowed";
    }
}

function closeAmountModal() {
    document.getElementById('amount-modal').classList.add('hidden');
}

function proceedToQRModal() {
    closeAmountModal();
    openCartModal();
}

function openCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (currentUser) {
        document.getElementById('cart-name').value = currentUser.name || '';
        document.getElementById('cart-email').value = currentUser.email || '';
        if (currentUser.mobile) document.getElementById('cart-mobile').value = currentUser.mobile;
    }
    cartModal.classList.remove('hidden');
}

function closeCartModal() {
    document.getElementById('cart-modal').classList.add('hidden');
}

function handleCartSubmit(e) {
    e.preventDefault();

    cartBillingData = {
        name: document.getElementById('cart-name').value.trim(),
        mobile: document.getElementById('cart-mobile').value.trim(),
        email: document.getElementById('cart-email').value.trim().toLowerCase(),
        address: document.getElementById('cart-address').value.trim(),
        state: document.getElementById('cart-state').value.trim(),
        country: document.getElementById('cart-country').value,
        pincode: document.getElementById('cart-pincode').value.trim()
    };

    closeCartModal();
    showUtrModal();
}

function switchAuthTab(mode) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    
    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-blue-400 border-b-2 border-blue-400";
        tabReg.className = "flex-1 pb-3 text-center font-bold text-slate-400";
    } else if (mode === 'register') {
        regForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        tabReg.className = "flex-1 pb-3 text-center font-bold text-emerald-400 border-b-2 border-emerald-400";
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-slate-400";
    } else if (mode === 'forgot') {
        forgotForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        regForm.classList.add('hidden');
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-slate-400";
        tabReg.className = "flex-1 pb-3 text-center font-bold text-slate-400";
    }
}

async function requestOTP() {
    const name = document.getElementById('reg-name').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-pass').value;
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    const sendOtpBtn = document.getElementById('send-otp-btn');

    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    if (!name || !mobile || !email || !password) {
        errorEl.innerText = "Please fill in all fields first.";
        errorEl.classList.remove('hidden');
        return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        errorEl.innerText = "Please enter a valid 10-digit mobile number.";
        errorEl.classList.remove('hidden');
        return;
    }

    sendOtpBtn.innerText = "Sending OTP...";
    sendOtpBtn.disabled = true;

    const formData = new URLSearchParams();
    formData.append('action', 'send_otp');
    formData.append('email', email);

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const data = await response.json();

        if (!data.success) {
            errorEl.innerText = data.message;
            errorEl.classList.remove('hidden');
            sendOtpBtn.innerText = "Send Verification OTP";
            sendOtpBtn.disabled = false;
            return;
        }

        successEl.innerText = data.message;
        successEl.classList.remove('hidden');
        
        document.getElementById('otp-container').classList.remove('hidden');
        document.getElementById('verify-reg-btn').classList.remove('hidden');
        sendOtpBtn.innerText = "Resend OTP";
        sendOtpBtn.disabled = false;

    } catch (err) {
        errorEl.innerText = "Connection error while requesting OTP.";
        errorEl.classList.remove('hidden');
        sendOtpBtn.innerText = "Send Verification OTP";
        sendOtpBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-pass').value;
    const otp = document.getElementById('reg-otp').value.trim();
    const errorEl = document.getElementById('auth-error');

    errorEl.classList.add('hidden');

    if (!otp) {
        errorEl.innerText = "Please enter the OTP sent to your email.";
        errorEl.classList.remove('hidden');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('action', 'register');
    formData.append('name', name);
    formData.append('mobile', mobile);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('otp', otp);

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const data = await response.json();

        if (!data.success) {
            errorEl.innerText = data.message;
            errorEl.classList.remove('hidden');
            return;
        }

        currentUser = { name: data.name, email: data.email, mobile: mobile };
        localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
        isPremiumUser = data.isPremium || false;
        
        checkAuthStatus();
        updateUIState();
        renderPlaylist();
        loadVideo(currentVideoIndex);
    } catch (err) {
        errorEl.innerText = "Connection error. Please try again.";
        errorEl.classList.remove('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-pass').value;
    const errorEl = document.getElementById('auth-error');

    errorEl.classList.add('hidden');

    const formData = new URLSearchParams();
    formData.append('action', 'login');
    formData.append('email', email);
    formData.append('password', password);

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const data = await response.json();

        if (data.success) {
            currentUser = { name: data.name, email: data.email, mobile: data.mobile || '' };
            localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
            isPremiumUser = data.isPremium;
            
            checkAuthStatus();
            updateUIState();
            renderPlaylist();
            loadVideo(currentVideoIndex);
        } else {
            errorEl.innerText = data.message;
            errorEl.classList.remove('hidden');
        }
    } catch (err) {
        errorEl.innerText = "Connection error. Please try again.";
        errorEl.classList.remove('hidden');
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim().toLowerCase();
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');

    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    const formData = new URLSearchParams();
    formData.append('action', 'forgot_password');
    formData.append('email', email);

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const data = await response.json();

        if (data.success) {
            successEl.innerText = data.message;
            successEl.classList.remove('hidden');
        } else {
            errorEl.innerText = data.message;
            errorEl.classList.remove('hidden');
        }
    } catch (err) {
        errorEl.innerText = "Connection error. Please try again.";
        errorEl.classList.remove('hidden');
    }
}

/* Requirement 4: UTR Submission with 45-Second Loading & Verification Check */
async function submitUTR() {
    const utrInput = document.getElementById('utr-input').value.trim();
    const errorMsg = document.getElementById('utr-error');
    const formContainer = document.getElementById('utr-form-container');
    const loadingContainer = document.getElementById('utr-loading-container');
    const congratsContainer = document.getElementById('congratulations-container');
    const progressBar = document.getElementById('utr-progress-bar');
    
    if (utrInput.length < 8) {
        errorMsg.innerText = "Please enter a valid UTR reference number.";
        errorMsg.classList.remove('hidden');
        return;
    }
    errorMsg.classList.add('hidden');

    const activeEmail = cartBillingData ? cartBillingData.email : (currentUser ? currentUser.email : '');
    if (!activeEmail) return;

    // Show 45-second verification loader UI
    formContainer.classList.add('hidden');
    loadingContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 2.2;
        if (progress > 98) progress = 98;
        progressBar.style.width = progress + '%';
    }, 1000);

    const formData = new URLSearchParams();
    formData.append('action', 'submit_utr');
    formData.append('email', activeEmail.toLowerCase().trim());
    formData.append('utr', utrInput);

    if (cartBillingData) {
        formData.append('name', cartBillingData.name);
        formData.append('mobile', cartBillingData.mobile);
        formData.append('address', cartBillingData.address);
        formData.append('state', cartBillingData.state);
        formData.append('country', cartBillingData.country);
        formData.append('pincode', cartBillingData.pincode);
    }

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const data = await response.json();
        
        clearInterval(progressInterval);
        progressBar.style.width = '100%';

        if (data.success) {
            // Requirement 4: Success - Send invoice (handled in GS), unlock course, show Congratulations popup
            isPremiumUser = true;
            loadingContainer.classList.add('hidden');
            congratsContainer.classList.remove('hidden');

            setTimeout(() => {
                closeModal();
                updateUIState();
                renderPlaylist();
                loadVideo(currentVideoIndex);
            }, 4000);
        } else {
            // Requirement 4: Failure - Show "Submit Valid UTR" and do not send invoice / unlock
            loadingContainer.classList.add('hidden');
            formContainer.classList.remove('hidden');
            errorMsg.innerText = data.message || "Submit Valid UTR";
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        clearInterval(progressInterval);
        loadingContainer.classList.add('hidden');
        formContainer.classList.remove('hidden');
        errorMsg.innerText = "Submit Valid UTR";
        errorMsg.classList.remove('hidden');
    }
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

    if (video.isLocked && !isPremiumUser) {
        iframe.classList.add('hidden');
        iframe.src = ""; 
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        iframe.classList.remove('hidden');
        if (iframe.src !== video.url) {
            iframe.src = video.url;
        }
    }
    renderPlaylist();
    if (window.innerWidth < 768) {
        document.querySelector('.flex-1.overflow-y-auto').scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function showUtrModal() {
    const modal = document.getElementById('utr-modal');
    const content = document.getElementById('utr-modal-content');
    
    // Reset UTR UI State
    document.getElementById('utr-form-container').classList.remove('hidden');
    document.getElementById('utr-loading-container').classList.add('hidden');
    document.getElementById('congratulations-container').classList.add('hidden');
    document.getElementById('utr-error').classList.add('hidden');
    document.getElementById('utr-input').value = '';

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

function logout() {
    localStorage.removeItem('loggedInUser');
    currentUser = null;
    location.reload();
}

window.onload = init;