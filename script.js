const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMbPhDbDPYyy9JDTLK08Cq5SVkJ1RNOahK8CN9oy2ZOx6pk_Ra8GVaNzwntWywPt6n/exec';[cite: 1]

let currentUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;[cite: 1]
let isPremiumUser = false;[cite: 1]
let currentVideoIndex = 0;[cite: 1]
let cartBillingData = null;[cite: 1]
let authTimer = null;[cite: 1]

const videos = [
    { title: "Class_1. Introduction to Crypto & Forex (Basics)", desc: "క్రిప్టో మరియు ఫారెక్స్ ట్రేడింగ్ అంటే ఏమిటి? బేసిక్స్ నేర్చుకోండి.", url: "https://www.youtube.com/embed/33gUzpo_-sc?rel=0&modestbranding=1&iv_load_policy=3", isLocked: false, duration: "15:20" },[cite: 1]
    { title: "Class_2. Technical Analysis & Chart Patterns", desc: "టెక్నికల్ అనాలిసిస్ మరియు చార్ట్ ప్యాటర్న్స్ ద్వారా మార్కెట్ ట్రెండ్స్ ఎలా గుర్తించాలి.", url: "https://www.youtube.com/embed/JgV8ayiVs6s?rel=0&modestbranding=1&iv_load_policy=3", isLocked: true, duration: "45:10" },[cite: 1]
    { title: "Class_3. Risk Management & Psychology", desc: "రిస్క్ మేనేజ్‌మెంట్ ఎందుకు ముఖ్యం? ట్రేడింగ్ సైకాలజీ ఎలా ఉండాలి?", url: "https://www.youtube.com/embed/bJaAY_IInsA?rel=0&modestbranding=1&iv_load_policy=3", isLocked: true, duration: "32:05" },[cite: 1]
    { title: "Class_4. Live Trading Setup & Strategies", desc: "లైవ్ ట్రేడింగ్ స్ట్రాటజీస్ మరియు నా సీక్రెట్ సెటప్.", url: "https://www.youtube.com/embed/33gUzpo_-sc?rel=0&modestbranding=1&iv_load_policy=3", isLocked: true, duration: "55:40" },[cite: 1]
    { title: "Class_5. Introduction to Crypto & Forex (Basics)", desc: "క్రిప్టో మరియు ఫారెక్స్ ట్రేడింగ్ అంటే ఏమిటి? బేసిక్స్ నేర్చుకోండి.", url: "https://www.youtube.com/embed/33gUzpo_-sc?rel=0&modestbranding=1&iv_load_policy=3", isLocked: true, duration: "15:20" },[cite: 1]
    { title: "Class_6. Technical Analysis & Chart Patterns", desc: "టెక్నికల్ అనాలిసిస్ మరియు చార్ట్ ప్యాటర్న్స్ ద్వారా మార్కెట్ ట్రెండ్స్ ఎలా గుర్తించాలి.", url: "https://www.youtube.com/embed/JgV8ayiVs6s?rel=0&modestbranding=1&iv_load_policy=3", isLocked: true, duration: "45:10" },[cite: 1]
    { title: "Class_7. Risk Management & Psychology", desc: "రిస్క్ మేనేజ్‌మెంట్ ఎందుకు ముఖ్యం? ట్రేడింగ్ సైకాలజీ ఎలా ఉండాలి?", url: "https://www.youtube.com/embed/bJaAY_IInsA?rel=0&modestbranding=1&iv_load_policy=3", isLocked: true, duration: "32:05" },[cite: 1]
    { title: "Class_8. Live Trading Setup & Strategies", desc: "లైవ్ ట్రేడింగ్ స్ట్రాటజీస్ যত্ন", url: "https://www.youtube.com/embed/33gUzpo_-sc?rel=0&modestbranding=1&iv_load_policy=3", isLocked: true, duration: "55:40" }[cite: 1]
];

async function init() {
    if (currentUser && currentUser.email) {[cite: 1]
        try {
            const res = await fetch(`${SCRIPT_URL}?action=check_status&email=${encodeURIComponent(currentUser.email.toLowerCase().trim())}`);[cite: 1]
            const data = await res.json();[cite: 1]
            isPremiumUser = data.isPremium;[cite: 1]
        } catch (err) {
            console.error("Status check failed", err);[cite: 1]
        }
    }
    
    checkAuthStatus();[cite: 1]
    updateUIState();[cite: 1]
    renderPlaylist();[cite: 1]
    loadVideo(0);[cite: 1]
}

function checkAuthStatus() {
    const authModal = document.getElementById('auth-modal');[cite: 1]
    const userDisplay = document.getElementById('user-display');[cite: 1]
    const logoutBtn = document.getElementById('logout-btn');[cite: 1]
    const loginNavBtn = document.getElementById('login-nav-btn');[cite: 1]

    if (!currentUser) {[cite: 1]
        authModal.classList.add('hidden');[cite: 1]
        if (loginNavBtn) loginNavBtn.classList.remove('hidden');[cite: 1]

        if (authTimer) clearTimeout(authTimer);[cite: 1]
        authTimer = setTimeout(() => {[cite: 1]
            if (!currentUser) {[cite: 1]
                showAuthModal();[cite: 1]
            }
        }, 120000);[cite: 1]

    } else {
        authModal.classList.add('hidden');[cite: 1]
        if (loginNavBtn) loginNavBtn.classList.add('hidden');[cite: 1]
        if (authTimer) clearTimeout(authTimer);[cite: 1]

        userDisplay.innerText = `Hi, ${currentUser.name}`;[cite: 1]
        userDisplay.classList.remove('hidden');[cite: 1]
        logoutBtn.classList.remove('hidden');[cite: 1]
    }
}

function showAuthModal(showNotice = false) {
    const noticeEl = document.getElementById('auth-notice');[cite: 1]
    if (showNotice) {[cite: 1]
        noticeEl.classList.remove('hidden');[cite: 1]
    } else {
        noticeEl.classList.add('hidden');[cite: 1]
    }
    document.getElementById('auth-modal').classList.remove('hidden');[cite: 1]
}

/* Fix added: Verify login status before proceeding to Cart page */
function handlePayWithQRClick() {
    if (!currentUser) {[cite: 1]
        // If user is not logged in, force auth modal with notice
        showAuthModal(true);[cite: 1]
    } else {
        // If logged in, open the cart details page
        openCartModal();[cite: 1]
    }
}

/* Original amount lock fallback */
function handleUnlockClick() {
    if (!currentUser) {[cite: 1]
        showAuthModal(true);[cite: 1]
        return;[cite: 1]
    }
    document.getElementById('amount-digit-input').value = '';[cite: 1]
    validateAmountDigitInput();[cite: 1]
    document.getElementById('amount-modal').classList.remove('hidden');[cite: 1]
}

function validateAmountDigitInput() {
    const inputVal = document.getElementById('amount-digit-input').value.trim();[cite: 1]
    const nextBtn = document.getElementById('amount-next-btn');[cite: 1]

    if (inputVal === 'INR 1.00') {[cite: 1]
        nextBtn.disabled = false;[cite: 1]
        nextBtn.className = "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition text-sm shadow-lg shadow-emerald-500/30 cursor-pointer";[cite: 1]
    } else {
        nextBtn.disabled = true;[cite: 1]
        nextBtn.className = "flex-1 bg-slate-600 text-slate-400 font-bold py-2.5 rounded-lg transition text-sm cursor-not-allowed";[cite: 1]
    }
}

function closeAmountModal() {
    document.getElementById('amount-modal').classList.add('hidden');[cite: 1]
}

function proceedToQRModal() {
    closeAmountModal();[cite: 1]
    openCartModal();[cite: 1]
}

function openCartModal() {
    const cartModal = document.getElementById('cart-modal');[cite: 1]
    if (currentUser) {[cite: 1]
        document.getElementById('cart-name').value = currentUser.name || '';[cite: 1]
        document.getElementById('cart-email').value = currentUser.email || '';[cite: 1]
        if (currentUser.mobile) document.getElementById('cart-mobile').value = currentUser.mobile;[cite: 1]
    }
    cartModal.classList.remove('hidden');[cite: 1]
}

function closeCartModal() {
    document.getElementById('cart-modal').classList.add('hidden');[cite: 1]
}

/* Function to open scanner or redirect to app/scheme */
function openScanner(appName) {
    let targetUrl = "";

    switch (appName) {
        case 'paytm':
            targetUrl = "https://play.google.com/store/apps/details?id=net.one97.paytm&pcampaignid=web_share";
            break;

        case 'phonepe':
            targetUrl = "https://play.google.com/store/apps/details?id=com.phonepe.app&pcampaignid=web_share";
            break;

        case 'gpay':
            targetUrl = "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user&pcampaignid=web_share";
            break;

        case 'generic':
            targetUrl = "upi://pay";
            break;
    }

    if (targetUrl) {
        window.location.href = targetUrl;
    }
}

/* Feature added: Function to handle QR Image Download & Alert Popup */
function downloadQR() {
    // Dynamically create anchor link to trigger download
    const link = document.createElement('a');[cite: 1]
    link.href = '1qr.png';[cite: 1]
    link.download = 'QR_Payment.png';[cite: 1]
    
    // Append, click, and remove
    document.body.appendChild(link);[cite: 1]
    link.click();[cite: 1]
    document.body.removeChild(link);[cite: 1]
    
    // Show popup notice after interaction
    alert("QR Code Downloaded in your Galary Please upload or Scan With Your UPI Payment APP");[cite: 1]
}

function handleCartSubmit(e) {
    e.preventDefault();[cite: 1]

    cartBillingData = {
        name: document.getElementById('cart-name').value.trim(),[cite: 1]
        mobile: document.getElementById('cart-mobile').value.trim(),[cite: 1]
        email: document.getElementById('cart-email').value.trim().toLowerCase(),[cite: 1]
        address: document.getElementById('cart-address').value.trim(),[cite: 1]
        state: document.getElementById('cart-state').value.trim(),[cite: 1]
        country: document.getElementById('cart-country').value,[cite: 1]
        pincode: document.getElementById('cart-pincode').value.trim()[cite: 1]
    };

    closeCartModal();[cite: 1]
    showUtrModal();[cite: 1]
}

function switchAuthTab(mode) {
    const loginForm = document.getElementById('login-form');[cite: 1]
    const regForm = document.getElementById('register-form');[cite: 1]
    const forgotForm = document.getElementById('forgot-form');[cite: 1]
    const tabLogin = document.getElementById('tab-login');[cite: 1]
    const tabReg = document.getElementById('tab-register');[cite: 1]
    const errorEl = document.getElementById('auth-error');[cite: 1]
    const successEl = document.getElementById('auth-success');[cite: 1]
    
    errorEl.classList.add('hidden');[cite: 1]
    successEl.classList.add('hidden');[cite: 1]

    if (mode === 'login') {[cite: 1]
        loginForm.classList.remove('hidden');[cite: 1]
        regForm.classList.add('hidden');[cite: 1]
        forgotForm.classList.add('hidden');[cite: 1]
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-blue-400 border-b-2 border-blue-400";[cite: 1]
        tabReg.className = "flex-1 pb-3 text-center font-bold text-slate-400";[cite: 1]
    } else if (mode === 'register') {[cite: 1]
        regForm.classList.remove('hidden');[cite: 1]
        loginForm.classList.add('hidden');[cite: 1]
        forgotForm.classList.add('hidden');[cite: 1]
        tabReg.className = "flex-1 pb-3 text-center font-bold text-emerald-400 border-b-2 border-emerald-400";[cite: 1]
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-slate-400";[cite: 1]
    } else if (mode === 'forgot') {[cite: 1]
        forgotForm.classList.remove('hidden');[cite: 1]
        loginForm.classList.add('hidden');[cite: 1]
        regForm.classList.add('hidden');[cite: 1]
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-slate-400";[cite: 1]
        tabReg.className = "flex-1 pb-3 text-center font-bold text-slate-400";[cite: 1]
    }
}

async function requestOTP() {
    const name = document.getElementById('reg-name').value.trim();[cite: 1]
    const mobile = document.getElementById('reg-mobile').value.trim();[cite: 1]
    const email = document.getElementById('reg-email').value.trim().toLowerCase();[cite: 1]
    const password = document.getElementById('reg-pass').value;[cite: 1]
    const errorEl = document.getElementById('auth-error');[cite: 1]
    const successEl = document.getElementById('auth-success');[cite: 1]
    const sendOtpBtn = document.getElementById('send-otp-btn');[cite: 1]

    errorEl.classList.add('hidden');[cite: 1]
    successEl.classList.add('hidden');[cite: 1]

    if (!name || !mobile || !email || !password) {[cite: 1]
        errorEl.innerText = "Please fill in all fields first.";[cite: 1]
        errorEl.classList.remove('hidden');[cite: 1]
        return;[cite: 1]
    }

    if (!/^[0-9]{10}$/.test(mobile)) {[cite: 1]
        errorEl.innerText = "Please enter a valid 10-digit mobile number.";[cite: 1]
        errorEl.classList.remove('hidden');[cite: 1]
        return;[cite: 1]
    }

    sendOtpBtn.innerText = "Sending OTP...";[cite: 1]
    sendOtpBtn.disabled = true;[cite: 1]

    const formData = new URLSearchParams();[cite: 1]
    formData.append('action', 'send_otp');[cite: 1]
    formData.append('email', email);[cite: 1]

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });[cite: 1]
        const data = await response.json();[cite: 1]

        if (!data.success) {[cite: 1]
            errorEl.innerText = data.message;[cite: 1]
            errorEl.classList.remove('hidden');[cite: 1]
            sendOtpBtn.innerText = "Send Verification OTP";[cite: 1]
            sendOtpBtn.disabled = false;[cite: 1]
            return;[cite: 1]
        }

        successEl.innerText = data.message;[cite: 1]
        successEl.classList.remove('hidden');[cite: 1]
        
        document.getElementById('otp-container').classList.remove('hidden');[cite: 1]
        document.getElementById('verify-reg-btn').classList.remove('hidden');[cite: 1]
        sendOtpBtn.innerText = "Resend OTP";[cite: 1]
        sendOtpBtn.disabled = false;[cite: 1]

    } catch (err) {
        errorEl.innerText = "Connection error while requesting OTP.";[cite: 1]
        errorEl.classList.remove('hidden');[cite: 1]
        sendOtpBtn.innerText = "Send Verification OTP";[cite: 1]
        sendOtpBtn.disabled = false;[cite: 1]
    }
}

async function handleRegister(e) {
    e.preventDefault();[cite: 1]
    const name = document.getElementById('reg-name').value.trim();[cite: 1]
    const mobile = document.getElementById('reg-mobile').value.trim();[cite: 1]
    const email = document.getElementById('reg-email').value.trim().toLowerCase();[cite: 1]
    const password = document.getElementById('reg-pass').value;[cite: 1]
    const otp = document.getElementById('reg-otp').value.trim();[cite: 1]
    const errorEl = document.getElementById('auth-error');[cite: 1]

    errorEl.classList.add('hidden');[cite: 1]

    if (!otp) {[cite: 1]
        errorEl.innerText = "Please enter the OTP sent to your email.";[cite: 1]
        errorEl.classList.remove('hidden');[cite: 1]
        return;[cite: 1]
    }

    const formData = new URLSearchParams();[cite: 1]
    formData.append('action', 'register');[cite: 1]
    formData.append('name', name);[cite: 1]
    formData.append('mobile', mobile);[cite: 1]
    formData.append('email', email);[cite: 1]
    formData.append('password', password);[cite: 1]
    formData.append('otp', otp);[cite: 1]

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });[cite: 1]
        const data = await response.json();[cite: 1]

        if (!data.success) {[cite: 1]
            errorEl.innerText = data.message;[cite: 1]
            errorEl.classList.remove('hidden');[cite: 1]
            return;[cite: 1]
        }

        currentUser = { name: data.name, email: data.email, mobile: mobile };[cite: 1]
        localStorage.setItem('loggedInUser', JSON.stringify(currentUser));[cite: 1]
        isPremiumUser = data.isPremium || false;[cite: 1]
        
        checkAuthStatus();[cite: 1]
        updateUIState();[cite: 1]
        renderPlaylist();[cite: 1]
        loadVideo(currentVideoIndex);[cite: 1]
    } catch (err) {
        errorEl.innerText = "Connection error. Please try again.";[cite: 1]
        errorEl.classList.remove('hidden');[cite: 1]
    }
}

async function handleLogin(e) {
    e.preventDefault();[cite: 1]
    const email = document.getElementById('login-email').value.trim().toLowerCase();[cite: 1]
    const password = document.getElementById('login-pass').value;[cite: 1]
    const errorEl = document.getElementById('auth-error');[cite: 1]

    errorEl.classList.add('hidden');[cite: 1]

    const formData = new URLSearchParams();[cite: 1]
    formData.append('action', 'login');[cite: 1]
    formData.append('email', email);[cite: 1]
    formData.append('password', password);[cite: 1]

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });[cite: 1]
        const data = await response.json();[cite: 1]

        if (data.success) {[cite: 1]
            currentUser = { name: data.name, email: data.email, mobile: data.mobile || '' };[cite: 1]
            localStorage.setItem('loggedInUser', JSON.stringify(currentUser));[cite: 1]
            isPremiumUser = data.isPremium;[cite: 1]
            
            checkAuthStatus();[cite: 1]
            updateUIState();[cite: 1]
            renderPlaylist();[cite: 1]
            loadVideo(currentVideoIndex);[cite: 1]
        } else {
            errorEl.innerText = data.message;[cite: 1]
            errorEl.classList.remove('hidden');[cite: 1]
        }
    } catch (err) {
        errorEl.innerText = "Connection error. Please try again.";[cite: 1]
        errorEl.classList.remove('hidden');[cite: 1]
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();[cite: 1]
    const email = document.getElementById('forgot-email').value.trim().toLowerCase();[cite: 1]
    const errorEl = document.getElementById('auth-error');[cite: 1]
    const successEl = document.getElementById('auth-success');[cite: 1]

    errorEl.classList.add('hidden');[cite: 1]
    successEl.classList.add('hidden');[cite: 1]

    const formData = new URLSearchParams();[cite: 1]
    formData.append('action', 'forgot_password');[cite: 1]
    formData.append('email', email);[cite: 1]

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });[cite: 1]
        const data = await response.json();[cite: 1]

        if (data.success) {[cite: 1]
            successEl.innerText = data.message;[cite: 1]
            successEl.classList.remove('hidden');[cite: 1]
        } else {
            errorEl.innerText = data.message;[cite: 1]
            errorEl.classList.remove('hidden');[cite: 1]
        }
    } catch (err) {
        errorEl.innerText = "Connection error. Please try again.";[cite: 1]
        errorEl.classList.remove('hidden');[cite: 1]
    }
}

/* Requirement 4: UTR Submission with 90-Second Loading & Verification Check */
async function submitUTR() {
    const utrInput = document.getElementById('utr-input').value.trim();[cite: 1]
    const errorMsg = document.getElementById('utr-error');[cite: 1]
    const formContainer = document.getElementById('utr-form-container');[cite: 1]
    const loadingContainer = document.getElementById('utr-loading-container');[cite: 1]
    const congratsContainer = document.getElementById('congratulations-container');[cite: 1]
    const progressBar = document.getElementById('utr-progress-bar');[cite: 1]
    
    if (utrInput.length < 8) {[cite: 1]
        errorMsg.innerText = "Please enter a valid UTR reference number.";[cite: 1]
        errorMsg.classList.remove('hidden');[cite: 1]
        return;[cite: 1]
    }
    errorMsg.classList.add('hidden');[cite: 1]

    const activeEmail = cartBillingData ? cartBillingData.email : (currentUser ? currentUser.email : '');[cite: 1]
    if (!activeEmail) return;[cite: 1]

    formContainer.classList.add('hidden');[cite: 1]
    loadingContainer.classList.remove('hidden');[cite: 1]
    progressBar.style.width = '0%';[cite: 1]
    
    let progress = 0;[cite: 1]
    const progressInterval = setInterval(() => {[cite: 1]
        progress += 2.2;[cite: 1]
        if (progress > 98) progress = 98;[cite: 1]
        progressBar.style.width = progress + '%';[cite: 1]
    }, 1000);[cite: 1]

    const formData = new URLSearchParams();[cite: 1]
    formData.append('action', 'submit_utr');[cite: 1]
    formData.append('email', activeEmail.toLowerCase().trim());[cite: 1]
    formData.append('utr', utrInput);[cite: 1]

    if (cartBillingData) {[cite: 1]
        formData.append('name', cartBillingData.name);[cite: 1]
        formData.append('mobile', cartBillingData.mobile);[cite: 1]
        formData.append('address', cartBillingData.address);[cite: 1]
        formData.append('state', cartBillingData.state);[cite: 1]
        formData.append('country', cartBillingData.country);[cite: 1]
        formData.append('pincode', cartBillingData.pincode);[cite: 1]
    }

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });[cite: 1]
        const data = await response.json();[cite: 1]
        
        clearInterval(progressInterval);[cite: 1]
        progressBar.style.width = '100%';[cite: 1]

        if (data.success) {[cite: 1]
            isPremiumUser = true;[cite: 1]
            loadingContainer.classList.add('hidden');[cite: 1]
            congratsContainer.classList.remove('hidden');[cite: 1]

            setTimeout(() => {[cite: 1]
                closeModal();[cite: 1]
                updateUIState();[cite: 1]
                renderPlaylist();[cite: 1]
                loadVideo(currentVideoIndex);[cite: 1]
            }, 4000);[cite: 1]
        } else {
            loadingContainer.classList.add('hidden');[cite: 1]
            formContainer.classList.remove('hidden');[cite: 1]
            errorMsg.innerText = data.message || "Submit Valid UTR";[cite: 1]
            errorMsg.classList.remove('hidden');[cite: 1]
        }
    } catch (err) {
        clearInterval(progressInterval);[cite: 1]
        loadingContainer.classList.add('hidden');[cite: 1]
        formContainer.classList.remove('hidden');[cite: 1]
        errorMsg.innerText = "Submit Valid UTR";[cite: 1]
        errorMsg.classList.remove('hidden');[cite: 1]
    }
}

function renderPlaylist() {
    const playlistEl = document.getElementById('playlist');[cite: 1]
    playlistEl.innerHTML = '';[cite: 1]
    videos.forEach((video, index) => {[cite: 1]
        const isActive = index === currentVideoIndex;[cite: 1]
        const showLock = video.isLocked && !isPremiumUser;[cite: 1]
        const item = document.createElement('div');[cite: 1]
        item.className = `p-2 md:p-3 mb-2 rounded-lg cursor-pointer transition flex items-start gap-3 ${isActive ? 'bg-blue-600/20 border border-blue-500/50' : 'hover:bg-slate-700/50 border border-transparent'}`;[cite: 1]
        item.onclick = () => loadVideo(index);[cite: 1]
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
        `;[cite: 1]
        playlistEl.appendChild(item);[cite: 1]
    });
}

function loadVideo(index) {
    currentVideoIndex = index;[cite: 1]
    const video = videos[index];[cite: 1]
    document.getElementById('video-title').innerText = video.title;[cite: 1]
    document.getElementById('video-desc').innerText = video.desc;[cite: 1]
    const iframe = document.getElementById('video-frame');[cite: 1]
    const overlay = document.getElementById('locked-overlay');[cite: 1]

    if (video.isLocked && !isPremiumUser) {[cite: 1]
        iframe.classList.add('hidden');[cite: 1]
        iframe.src = "";[cite: 1]
        overlay.classList.remove('hidden');[cite: 1]
    } else {
        overlay.classList.add('hidden');[cite: 1]
        iframe.classList.remove('hidden');[cite: 1]
        if (iframe.src !== video.url) {[cite: 1]
            iframe.src = video.url;[cite: 1]
        }
    }
    renderPlaylist();[cite: 1]
    if (window.innerWidth < 768) {[cite: 1]
        document.querySelector('.flex-1.overflow-y-auto').scrollTo({ top: 0, behavior: 'smooth' });[cite: 1]
    }
}

function showUtrModal() {
    const modal = document.getElementById('utr-modal');[cite: 1]
    const content = document.getElementById('utr-modal-content');[cite: 1]
    
    document.getElementById('utr-form-container').classList.remove('hidden');[cite: 1]
    document.getElementById('utr-loading-container').classList.add('hidden');[cite: 1]
    document.getElementById('congratulations-container').classList.add('hidden');[cite: 1]
    document.getElementById('utr-error').classList.add('hidden');[cite: 1]
    document.getElementById('utr-input').value = '';[cite: 1]

    modal.classList.remove('hidden');[cite: 1]
    setTimeout(() => {[cite: 1]
        modal.classList.remove('opacity-0');[cite: 1]
        content.classList.remove('scale-95');[cite: 1]
    }, 10);[cite: 1]
}

function closeModal() {
    const modal = document.getElementById('utr-modal');[cite: 1]
    const content = document.getElementById('utr-modal-content');[cite: 1]
    modal.classList.add('opacity-0');[cite: 1]
    content.classList.add('scale-95');[cite: 1]
    setTimeout(() => {[cite: 1]
        modal.classList.add('hidden');[cite: 1]
    }, 300);[cite: 1]
}

function updateUIState() {
    const badge = document.getElementById('status-badge');[cite: 1]
    if (isPremiumUser) {[cite: 1]
        badge.className = "px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-xs md:text-sm font-semibold";[cite: 1]
        badge.innerHTML = '<i class="fa-solid fa-check-circle mr-1"></i> Premium Access';[cite: 1]
    } else {
        badge.className = "px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/50 text-xs md:text-sm font-semibold";[cite: 1]
        badge.innerHTML = '<i class="fa-solid fa-lock mr-1"></i> Locked';[cite: 1]
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');[cite: 1]
    currentUser = null;[cite: 1]
    location.reload();[cite: 1]
}

window.onload = init;[cite: 1]
