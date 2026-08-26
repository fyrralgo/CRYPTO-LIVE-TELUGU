// Base API URL (Adjust if hosted in a different folder)
const API_URL = 'api.php';

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadPlaylist();
});

function checkAuthStatus() {
    const userString = HiddenSession.getUser();
    const isPaid = UTRSession.isPaid();

    if (userString) {
        const user = JSON.parse(userString);
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('user-display').textContent = `Welcome, ${user.name}`;
        document.getElementById('user-display').classList.remove('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');

        if (isPaid) {
            unlockPremiumContent();
        } else {
            document.getElementById('locked-overlay').classList.remove('hidden');
        }
    } else {
        document.getElementById('auth-modal').classList.remove('hidden');
        document.getElementById('locked-overlay').classList.remove('hidden');
    }
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const errorMsg = document.getElementById('auth-error');
    
    errorMsg.classList.add('hidden');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.replace('text-slate-400', 'text-blue-400');
        tabLogin.classList.add('border-b-2', 'border-blue-400');
        tabRegister.classList.replace('text-blue-400', 'text-slate-400');
        tabRegister.classList.remove('border-b-2', 'border-blue-400');
    } else {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        tabRegister.classList.replace('text-slate-400', 'text-blue-400');
        tabRegister.classList.add('border-b-2', 'border-blue-400');
        tabLogin.classList.replace('text-blue-400', 'text-slate-400');
        tabLogin.classList.remove('border-b-2', 'border-blue-400');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;
    const errorMsg = document.getElementById('auth-error');

    try {
        const response = await fetch(`${API_URL}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();
        
        if (result.success) {
            alert('Registration Successful! Please Login.');
            switchAuthTab('login');
        } else {
            errorMsg.textContent = result.message;
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        errorMsg.textContent = 'Server error. Please try again.';
        errorMsg.classList.remove('hidden');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('auth-error');

    try {
        const response = await fetch(`${API_URL}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        
        if (result.success) {
            HiddenSession.setUser(JSON.stringify(result.user));
            if (result.isPaid) {
                UTRSession.setPaid(true);
            }
            checkAuthStatus();
        } else {
            errorMsg.textContent = result.message;
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        errorMsg.textContent = 'Server error. Please try again.';
        errorMsg.classList.remove('hidden');
    }
}

function logout() {
    HiddenSession.clear();
    UTRSession.clear();
    location.reload();
}

function initiatePayment() {
    const msg = document.getElementById('countdown-msg');
    const timerSpan = document.getElementById('timer');
    msg.classList.remove('hidden');
    
    let timeLeft = 60;
    const timer = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            msg.classList.add('hidden');
            document.getElementById('utr-modal').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('utr-modal').classList.remove('opacity-0');
            }, 10);
        }
    }, 1000);
}

function closeModal() {
    document.getElementById('utr-modal').classList.add('opacity-0');
    setTimeout(() => {
        document.getElementById('utr-modal').classList.add('hidden');
    }, 300);
}

async function submitUTR() {
    const utr = document.getElementById('utr-input').value;
    const errorMsg = document.getElementById('utr-error');
    
    if(utr.length !== 12 || isNaN(utr)) {
        errorMsg.classList.remove('hidden');
        return;
    }
    errorMsg.classList.add('hidden');

    const user = JSON.parse(HiddenSession.getUser());
    
    try {
        const response = await fetch(`${API_URL}?action=submit_utr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, utr: utr })
        });
        const result = await response.json();
        
        if (result.success) {
            UTRSession.setPaid(true);
            closeModal();
            unlockPremiumContent();
            alert('Payment Verified! Course Unlocked.');
        } else {
            errorMsg.textContent = result.message;
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        errorMsg.textContent = 'Server error. Please try again.';
        errorMsg.classList.remove('hidden');
    }
}

function unlockPremiumContent() {
    document.getElementById('locked-overlay').classList.add('hidden');
    document.getElementById('video-frame').classList.remove('hidden');
    
    const statusBadge = document.getElementById('status-badge');
    statusBadge.innerHTML = '<i class="fa-solid fa-unlock mr-1"></i> Premium Unlocked';
    statusBadge.classList.replace('bg-red-500/20', 'bg-emerald-500/20');
    statusBadge.classList.replace('text-red-400', 'text-emerald-400');
    statusBadge.classList.replace('border-red-500/50', 'border-emerald-500/50');
    
    // Load first video placeholder
    document.getElementById('video-frame').src = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Replace with your actual video
    document.getElementById('video-title').textContent = "Module 1: Introduction to Crypto & Forex";
    document.getElementById('video-desc').textContent = "Welcome to the mastery course. Let's start with the basics.";
}

function loadPlaylist() {
    const playlistDiv = document.getElementById('playlist');
    const videos = [
        { title: "Module 1: Intro to Trading", duration: "45:00" },
        { title: "Module 2: Technical Analysis", duration: "1:15:00" },
        { title: "Module 3: Risk Management", duration: "50:00" },
        { title: "Module 4: Advanced Strategies", duration: "1:30:00" }
    ];
    
    videos.forEach((vid, index) => {
        playlistDiv.innerHTML += `
            <div class="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">${index + 1}</div>
                <div>
                    <h4 class="text-sm font-semibold text-slate-200">${vid.title}</h4>
                    <p class="text-xs text-slate-400 mt-0.5"><i class="fa-regular fa-clock mr-1"></i> ${vid.duration}</p>
                </div>
            </div>
        `;
    });
}