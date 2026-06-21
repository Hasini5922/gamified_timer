const CONFIG = {
    work: 25 * 60,
    break: 5 * 60,
    pts: { session: 50, task: 25 }
};

const LEVELS = [
    { level: 1, name: 'Focus Newbie', pointsRequired: 0 },
    { level: 2, name: 'Focus Seeker', pointsRequired: 200 },
    { level: 3, name: 'Focus Master', pointsRequired: 500 },
    { level: 4, name: 'Productivity Ninja', pointsRequired: 1000 },
    { level: 5, name: 'Focus Legend', pointsRequired: 2000 }
];

const ACHIEVEMENTS = [
    { id: 'first', name: 'First Session', icon: '🏆', desc: 'Complete 1 session', check: s => s.sessions >= 1 },
    { id: 'fire', name: 'On Fire', icon: '🔥', desc: '3 sessions in a day', check: s => {
        const today = new Date().toDateString();
        return (s.history?.filter(h => new Date(h.date).toDateString() === today) || []).length >= 3;
    }},
    { id: 'power', name: 'Power User', icon: '💪', desc: '10 total sessions', check: s => s.sessions >= 10 },
    { id: 'tasks', name: 'Task Master', icon: '📚', desc: 'Complete 20 tasks', check: s => s.tasks.filter(t => t.done).length >= 20 },
    { id: 'early', name: 'Early Bird', icon: '🐔', desc: 'Session before 8 AM', check: s => new Date().getHours() < 8 && s.sessions > 0 },
    { id: 'night', name: 'Night Owl', icon: '🦉', desc: 'Session after 11 PM', check: s => new Date().getHours() >= 23 && s.sessions > 0 }
];

const QUOTES = [
    { q: "The secret of getting ahead is getting started.", a: "Mark Twain" },
    { q: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
    { q: "Don't watch the clock; do what it does. Keep going.", a: "Sam Levenson" },
    { q: "The best time to plant a tree was 20 years ago. The second best time is now.", a: "Chinese Proverb" },
    { q: "Focus on being productive instead of busy.", a: "Tim Ferriss" },
    { q: "Success is the sum of small efforts repeated day in and day out.", a: "Robert Collier" },
    { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
    { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
    { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
    { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" }
];

let state = {
    timeLeft: CONFIG.work,
    totalTime: CONFIG.work,
    isRunning: false,
    isPaused: false,
    isBreak: false,
    points: 0,
    level: 1,
    streak: 0,
    sessions: 0,
    focusTime: 0,
    tasks: [],
    currentTaskId: null,
    achievements: [],
    history: [],
    interval: null,
    lastDate: null,
    customDuration: 25,
    breakDuration: 5,
    takeBreak: true,
    userName: 'User',
    userEmail: 'user@email.com',
    isLoggedIn: false
};

const DOM = {
    authOverlay: document.getElementById('authOverlay'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    showLogin: document.getElementById('showLogin'),
    showSignup: document.getElementById('showSignup'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    signupName: document.getElementById('signupName'),
    signupEmail: document.getElementById('signupEmail'),
    signupPassword: document.getElementById('signupPassword'),
    signupConfirm: document.getElementById('signupConfirm'),
    mainApp: document.getElementById('mainApp'),
    
    timerDisplay: document.getElementById('timerDisplay'),
    progressCircle: document.getElementById('progressCircle'),
    sessionLabel: document.getElementById('sessionLabel'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    customMinutes: document.getElementById('customMinutes'),
    setTimeBtn: document.getElementById('setTimeBtn'),
    breakMinutes: document.getElementById('breakMinutes'),
    breakToggle: document.getElementById('breakToggle'),
    breakToggleText: document.getElementById('breakToggleText'),
    sessionCount: document.getElementById('sessionCount'),
    totalTimeDisplay: document.getElementById('totalTimeDisplay'),
    currentTaskDisplay: document.getElementById('currentTaskDisplay'),
    
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    taskTotal: document.getElementById('taskTotal'),
    taskCompleted: document.getElementById('taskCompleted'),
    taskPending: document.getElementById('taskPending'),
    taskProgressBar: document.getElementById('taskProgressBar'),
    taskProgressText: document.getElementById('taskProgressText'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    
    achievementGrid: document.getElementById('achievementGrid'),
    achUnlocked: document.getElementById('achUnlocked'),
    achTotal: document.getElementById('achTotal'),
    achProgressBar: document.getElementById('achProgressBar'),
    
    welcomeName: document.getElementById('welcomeName'),
    motivationMessage: document.getElementById('motivationMessage'),
    miniStreak: document.getElementById('miniStreak'),
    miniPoints: document.getElementById('miniPoints'),
    miniSessions: document.getElementById('miniSessions'),
    totalHours: document.getElementById('totalHours'),
    totalTasks: document.getElementById('totalTasks'),
    totalAchievements: document.getElementById('totalAchievements'),
    totalSessions: document.getElementById('totalSessions'),
    homeLevel: document.getElementById('homeLevel'),
    levelProgressText: document.getElementById('levelProgressText'),
    homeProgressBar: document.getElementById('homeProgressBar'),
    homeLevelName: document.getElementById('homeLevelName'),
    
    hTotalSessions: document.getElementById('hTotalSessions'),
    hTotalTime: document.getElementById('hTotalTime'),
    hAvgTime: document.getElementById('hAvgTime'),
    hBestStreak: document.getElementById('hBestStreak'),
    historyList: document.getElementById('historyList'),
    
    profileBtn: document.getElementById('profileBtn'),
    profileDropdown: document.getElementById('profileDropdown'),
    profileInitial: document.getElementById('profileInitial'),
    dropdownInitial: document.getElementById('dropdownInitial'),
    dropdownName: document.getElementById('dropdownName'),
    dropdownEmail: document.getElementById('dropdownEmail'),
    profileName: document.getElementById('profileName'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    themeToggle: document.getElementById('themeToggle'),
    
    quoteDisplay: document.getElementById('quoteDisplay'),
    quoteAuthor: document.getElementById('quoteAuthor'),
    quoteRefresh: document.getElementById('quoteRefresh'),
    
    navBtns: document.querySelectorAll('.nav-btn'),
    pages: document.querySelectorAll('.page'),
    particles: document.getElementById('particles')
};

function createParticles() {
    if (!DOM.particles) return;
    const colors = ['#667eea', '#764ba2', '#4CAF50', '#FFC107', '#f44336'];
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 4) + 's';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (3 + Math.random() * 5) + 'px';
        particle.style.height = particle.style.width;
        DOM.particles.appendChild(particle);
    }
}

function showLoginForm() {
    DOM.loginForm.classList.add('active');
    DOM.signupForm.classList.remove('active');
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'none';
    DOM.loginEmail.value = '';
    DOM.loginPassword.value = '';
}

function showSignupForm() {
    DOM.signupForm.classList.add('active');
    DOM.loginForm.classList.remove('active');
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'none';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showAuthError(message) {
    const el = document.getElementById('authError');
    el.textContent = '❌ ' + message;
    el.style.display = 'block';
    el.style.background = '#f44336';
    el.style.color = 'white';
    el.style.padding = '12px 15px';
    el.style.borderRadius = '10px';
    el.style.marginBottom = '15px';
    el.style.fontSize = '0.9rem';
}

function showAuthSuccess(message) {
    const el = document.getElementById('authSuccess');
    el.textContent = '✅ ' + message;
    el.style.display = 'block';
    el.style.background = '#4CAF50';
    el.style.color = 'white';
    el.style.padding = '12px 15px';
    el.style.borderRadius = '10px';
    el.style.marginBottom = '15px';
    el.style.fontSize = '0.9rem';
}

function showSignupError(message) {
    const el = document.getElementById('signupError');
    el.textContent = '❌ ' + message;
    el.style.display = 'block';
    el.style.background = '#f44336';
    el.style.color = 'white';
    el.style.padding = '12px 15px';
    el.style.borderRadius = '10px';
    el.style.marginBottom = '15px';
    el.style.fontSize = '0.9rem';
}

function showSignupSuccess(message) {
    const el = document.getElementById('signupSuccess');
    el.textContent = '✅ ' + message;
    el.style.display = 'block';
    el.style.background = '#4CAF50';
    el.style.color = 'white';
    el.style.padding = '12px 15px';
    el.style.borderRadius = '10px';
    el.style.marginBottom = '15px';
    el.style.fontSize = '0.9rem';
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = DOM.loginEmail.value.trim();
    const password = DOM.loginPassword.value.trim();
    
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'none';
    
    if (!isValidEmail(email)) {
        showAuthError('Please enter a valid email address');
        return;
    }
    
    if (!password) {
        showAuthError('Please enter your password');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showAuthError('No account found with this email. Please sign up first.');
        return;
    }
    
    if (user.password !== password) {
        showAuthError('Incorrect password. Please try again.');
        return;
    }
    
    // Login successful
    state.userName = user.name;
    state.userEmail = user.email;
    state.isLoggedIn = true;
    
    localStorage.setItem('lastUser', JSON.stringify({ 
        email: user.email, 
        password: user.password,
        name: user.name 
    }));
    
    showAuthSuccess('Welcome back, ' + user.name + '! Redirecting...');
    
    setTimeout(() => {
        loginUser();
    }, 800);
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = DOM.signupName.value.trim();
    const email = DOM.signupEmail.value.trim();
    const password = DOM.signupPassword.value.trim();
    const confirm = DOM.signupConfirm.value.trim();
    
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'none';
    
    if (!name || name.length < 2) {
        showSignupError('Please enter a valid name (at least 2 characters)');
        return;
    }
    
    if (!isValidEmail(email)) {
        showSignupError('Please enter a valid email address');
        return;
    }
    
    if (!password || password.length < 6) {
        showSignupError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirm) {
        showSignupError('Passwords do not match!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
        showSignupError('This email is already registered. Please login instead.');
        return;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    state.userName = name;
    state.userEmail = email;
    state.isLoggedIn = true;
    
    localStorage.setItem('lastUser', JSON.stringify({ email, password, name }));
    
    showSignupSuccess('Account created successfully! Welcome, ' + name + '!');
    
    setTimeout(() => {
        loginUser();
    }, 1000);
}

function loginUser() {

    const loggedInName = state.userName;
    const loggedInEmail = state.userEmail;

    loadState();

    state.userName = loggedInName;
    state.userEmail = loggedInEmail;

    DOM.authOverlay.style.display = 'none';
    DOM.mainApp.style.display = 'block';
    document.body.style.overflow = 'auto';

    checkDailyStreak();

    updateUserProfile();
    updateHomePage();
    updateUI();
    renderTasks();
    renderAchievements();
    updateDisplay();
    fetchQuote();
    updateTaskStats();
    renderHistory();
    createParticles();

    showNotification(
        '👋 Welcome!',
        'Welcome back, ' + state.userName + '!'
    );
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        state.isLoggedIn = false;
        state.userName = 'User';
        state.userEmail = 'user@email.com';
        
        DOM.mainApp.style.display = 'none';
        DOM.authOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        DOM.loginForm.reset();
        DOM.signupForm.reset();
        
        document.getElementById('authError').style.display = 'none';
        document.getElementById('authSuccess').style.display = 'none';
        document.getElementById('signupError').style.display = 'none';
        document.getElementById('signupSuccess').style.display = 'none';
        
        localStorage.removeItem('lastUser');
        showLoginForm();
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    DOM.themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    DOM.themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function toggleProfile() {
    DOM.profileDropdown.classList.toggle('active');
}

function closeProfile() {
    DOM.profileDropdown.classList.remove('active');
}

function navigateTo(pageName) {
    DOM.navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageName);
    });
    DOM.pages.forEach(page => {
        page.classList.toggle('active', page.id === `page-${pageName}`);
    });
    closeProfile();
    if (pageName === 'home') updateHomePage();
    if (pageName === 'tasks') updateTaskStats();
    if (pageName === 'history') renderHistory();
    if (pageName === 'achievements') renderAchievements();
    if (pageName === 'profile') loadProfileData();
    if (pageName === 'settings') loadSettings();
    if (pageName === 'stats') loadStatistics();
    showRandomQuote();
}

function showRandomQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    DOM.quoteDisplay.textContent = `"${quote.q}"`;
    DOM.quoteAuthor.textContent = `- ${quote.a}`;
    const motivationMsg = document.getElementById('motivationMessage');
    if (motivationMsg) motivationMsg.textContent = `"${quote.q}"`;
}

function fetchQuote() {
    fetch('https://zenquotes.io/api/random')
        .then(r => r.json())
        .then(data => {
            if (data && data[0]) {
                DOM.quoteDisplay.textContent = `"${data[0].q}"`;
                DOM.quoteAuthor.textContent = `- ${data[0].a}`;
                const motivationMsg = document.getElementById('motivationMessage');
                if (motivationMsg) motivationMsg.textContent = `"${data[0].q}"`;
            }
        })
        .catch(() => showRandomQuote());
}

function startTimer() {
    if (state.isPaused) {
        state.isPaused = false;
        state.isRunning = true;
        DOM.startBtn.textContent = '⏳ Running';
        DOM.startBtn.disabled = true;
        DOM.pauseBtn.textContent = '⏸ Pause';
        DOM.pauseBtn.disabled = false;
        state.interval = setInterval(updateTimer, 1000);
        return;
    }
    if (state.timeLeft > 0 && !state.isRunning) {
        state.isRunning = true;
        state.isPaused = false;
        DOM.startBtn.textContent = '⏳ Running';
        DOM.startBtn.disabled = true;
        DOM.pauseBtn.disabled = false;
        state.interval = setInterval(updateTimer, 1000);
    }
}

function pauseTimer() {
    if (state.isRunning) {
        clearInterval(state.interval);
        state.isRunning = false;
        state.isPaused = true;
        DOM.startBtn.textContent = '▶ Resume';
        DOM.startBtn.disabled = false;
        DOM.pauseBtn.textContent = '⏸ Paused';
        DOM.pauseBtn.disabled = true;
    }
}

function resetTimer() {
    clearInterval(state.interval);
    state.isRunning = false;
    state.isPaused = false;
    state.isBreak = false;
    state.timeLeft = state.customDuration * 60;
    state.totalTime = state.customDuration * 60;
    DOM.sessionLabel.textContent = 'Focus Time';
    DOM.startBtn.textContent = '▶ Start';
    DOM.startBtn.disabled = false;
    DOM.pauseBtn.textContent = '⏸ Pause';
    DOM.pauseBtn.disabled = true;
    updateDisplay();
}

function setCustomTime() {
    const minutes = parseInt(DOM.customMinutes.value);
    if (isNaN(minutes) || minutes < 1 || minutes > 120) {
        alert('Please enter a time between 1 and 120 minutes');
        return;
    }
    if (state.isRunning || state.isPaused) {
        alert('Please stop the timer first before changing duration');
        return;
    }
    state.customDuration = minutes;
    state.timeLeft = minutes * 60;
    state.totalTime = minutes * 60;
    DOM.customMinutes.value = minutes;
    updateDisplay();
    saveState();
    showNotification('⏱️ Time Set', 'Timer set to ' + minutes + ' minutes!');
}

function updateTimer() {
    state.timeLeft--;
    updateDisplay();
    if (state.timeLeft <= 0) {
        clearInterval(state.interval);
        state.isRunning = false;
        DOM.startBtn.textContent = '▶ Start';
        DOM.startBtn.disabled = false;
        DOM.pauseBtn.textContent = '⏸ Pause';
        DOM.pauseBtn.disabled = true;
        if (!state.isBreak) completeSession();
        else completeBreak();
    }
}

function updateDisplay() {
    const m = Math.floor(state.timeLeft / 60);
    const s = state.timeLeft % 60;
    DOM.timerDisplay.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    const circumference = 628.32;
    const progress = (state.timeLeft / state.totalTime) * circumference;
    DOM.progressCircle.style.strokeDashoffset = progress;
    const pct = (state.timeLeft / state.totalTime) * 100;
    DOM.progressCircle.style.stroke = pct > 60 ? '#4CAF50' : pct > 30 ? '#FFC107' : '#f44336';
}

function completeSession() {
    const duration = state.customDuration;
    state.points += CONFIG.pts.session;
    state.sessions++;
    state.focusTime += duration * 60;
    
    if (state.currentTaskId !== null) {
        const task = state.tasks.find(t => t.id === state.currentTaskId);
        if (task && !task.done) {
            task.done = true;
            state.points += CONFIG.pts.task;
            showNotification('✅ Task Complete!', '+' + CONFIG.pts.task + ' points!');
        }
    }
    
    if (!state.history) state.history = [];
    state.history.push({ date: new Date().toISOString(), duration: duration * 60 });
    
    checkAchievements();
    checkLevelUp();
    updateUI();
    renderTasks();
    renderAchievements();
    updateHomePage();
    renderHistory();
    saveState();
    
    if (state.takeBreak && state.breakDuration > 0) {
        state.isBreak = true;
        state.timeLeft = state.breakDuration * 60;
        state.totalTime = state.breakDuration * 60;
        DOM.sessionLabel.textContent = '☕ Break Time';
        updateDisplay();
        showNotification('🎉 Session Complete!', '+' + CONFIG.pts.session + ' points! (' + duration + ' min focus)');
        setTimeout(() => {
            if (!state.isRunning && !state.isPaused) startTimer();
        }, 1000);
    } else {
        // Skip break - start next session immediately
        state.isBreak = false;
        state.timeLeft = state.customDuration * 60;
        state.totalTime = state.customDuration * 60;
        DOM.sessionLabel.textContent = 'Focus Time';
        updateDisplay();
        showNotification('🎉 Session Complete!', '+' + CONFIG.pts.session + ' points! (' + duration + ' min focus)');
        setTimeout(() => {
            if (!state.isRunning && !state.isPaused) startTimer();
        }, 500);
    }
}

function completeBreak() {
    state.isBreak = false;
    state.timeLeft = state.customDuration * 60;
    state.totalTime = state.customDuration * 60;
    DOM.sessionLabel.textContent = 'Focus Time';
    updateDisplay();
    showNotification('☕ Break Over', 'Time to focus again!');
    setTimeout(() => {
        if (!state.isRunning && !state.isPaused) startTimer();
    }, 1000);
}

function checkLevelUp() {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (state.points >= LEVELS[i].pointsRequired && LEVELS[i].level > state.level) {
            state.level = LEVELS[i].level;
            showNotification('🎊 Level Up!', 'You\'re now ' + LEVELS[i].name + '!');
            break;
        }
    }
}

function checkAchievements() {
    let newAchievement = false;
    ACHIEVEMENTS.forEach(a => {
        if (!state.achievements.includes(a.id) && a.check(state)) {
            state.achievements.push(a.id);
            newAchievement = true;
            showNotification('🏆 Achievement Unlocked!', a.icon + ' ' + a.name + ': ' + a.desc);
        }
    });
    if (newAchievement) {
        renderAchievements();
        saveState();
    }
}

function renderAchievements() {
    const grid = DOM.achievementGrid;
    grid.innerHTML = '';
    let unlocked = 0;
    ACHIEVEMENTS.forEach(a => {
        const isUnlocked = state.achievements.includes(a.id);
        if (isUnlocked) unlocked++;
        const div = document.createElement('div');
        div.className = 'achievement ' + (isUnlocked ? 'unlocked' : 'locked');
        div.innerHTML = '<div class="achievement-icon">' + a.icon + '</div><div class="achievement-name">' + a.name + '</div><div class="achievement-desc">' + a.desc + '</div><span>' + (isUnlocked ? '✅' : '🔒') + '</span>';
        grid.appendChild(div);
    });
    DOM.achUnlocked.textContent = unlocked;
    DOM.achTotal.textContent = ACHIEVEMENTS.length;
    const pct = ACHIEVEMENTS.length > 0 ? (unlocked / ACHIEVEMENTS.length) * 100 : 0;
    DOM.achProgressBar.style.width = pct + '%';
}

function addTask() {
    const text = DOM.taskInput.value.trim();
    if (!text) { alert('Please enter a task!'); return; }
    state.tasks.push({ id: Date.now(), text: text, done: false });
    DOM.taskInput.value = '';
    renderTasks();
    updateTaskStats();
    saveState();
    DOM.taskInput.focus();
}

function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (state.currentTaskId === id) {
        state.currentTaskId = null;
        DOM.currentTaskDisplay.textContent = 'No task selected';
    }
    renderTasks();
    updateTaskStats();
    saveState();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        if (task.done) {
            state.points += CONFIG.pts.task;
            checkLevelUp();
            checkAchievements();
            updateUI();
            showNotification('✅ Task Complete!', '+' + CONFIG.pts.task + ' points!');
        }
        renderTasks();
        updateTaskStats();
        updateHomePage();
        saveState();
    }
}

function selectTask(id) {
    state.currentTaskId = id;
    const task = state.tasks.find(t => t.id === id);
    DOM.currentTaskDisplay.textContent = task ? task.text : 'No task selected';
    renderTasks();
    saveState();
}

function renderTasks(filter) {
    filter = filter || 'all';
    const list = DOM.taskList;
    list.innerHTML = '';
    let filtered = state.tasks;
    if (filter === 'pending') filtered = state.tasks.filter(t => !t.done);
    else if (filter === 'completed') filtered = state.tasks.filter(t => t.done);
    if (!filtered.length) {
        list.innerHTML = '<li style="text-align:center;color:var(--text-light);padding:2rem;">' + (state.tasks.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks in this category') + '</li>';
        return;
    }
    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (state.currentTaskId === task.id && !task.done) li.classList.add('task-current');
        li.dataset.taskId = task.id;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = task.done;
        cb.addEventListener('change', function(e) { e.stopPropagation(); toggleTask(task.id); });
        const span = document.createElement('span');
        span.className = 'task-text ' + (task.done ? 'completed' : '');
        span.textContent = task.text;
        const del = document.createElement('button');
        del.className = 'task-delete';
        del.textContent = '✕';
        del.addEventListener('click', function(e) { e.stopPropagation(); deleteTask(task.id); });
        li.appendChild(cb);
        li.appendChild(span);
        li.appendChild(del);
        li.addEventListener('click', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            selectTask(task.id);
        });
        list.appendChild(li);
    });
}

function updateTaskStats() {
    const total = state.tasks.length;
    const done = state.tasks.filter(t => t.done).length;
    const pending = total - done;
    DOM.taskTotal.textContent = total;
    DOM.taskCompleted.textContent = done;
    DOM.taskPending.textContent = pending;
    const pct = total > 0 ? (done / total) * 100 : 0;
    DOM.taskProgressBar.style.width = pct + '%';
    DOM.taskProgressText.textContent = Math.round(pct) + '%';
}

function updateHomePage() {
    DOM.welcomeName.textContent = state.userName || 'User';
    DOM.miniStreak.textContent = state.streak;
    DOM.miniPoints.textContent = state.points;
    
    const today = new Date().toDateString();
    const todaySessions = state.history?.filter(h => new Date(h.date).toDateString() === today) || [];
    DOM.miniSessions.textContent = todaySessions.length;
    
    const hours = Math.floor(state.focusTime / 3600);
    DOM.totalHours.textContent = hours + 'h';
    DOM.totalTasks.textContent = state.tasks.filter(t => t.done).length;
    DOM.totalAchievements.textContent = state.achievements.length;
    DOM.totalSessions.textContent = state.sessions;
    DOM.homeLevel.textContent = state.level;
    
    const currentLevel = LEVELS.find(l => l.level === state.level);
    const nextLevel = LEVELS.find(l => l.level === state.level + 1);
    if (nextLevel) {
        const currentReq = currentLevel.pointsRequired;
        const nextReq = nextLevel.pointsRequired;
        const progress = ((state.points - currentReq) / (nextReq - currentReq)) * 100;
        DOM.homeProgressBar.style.width = Math.min(progress, 100) + '%';
        DOM.levelProgressText.textContent = (state.points - currentReq) + ' / ' + (nextReq - currentReq) + ' XP';
    } else {
        DOM.homeProgressBar.style.width = '100%';
        DOM.levelProgressText.textContent = 'MAX LEVEL!';
    }
    DOM.homeLevelName.textContent = currentLevel.name;
}

function renderHistory() {
    const list = DOM.historyList;
    if (!state.history || !state.history.length) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-history" style="font-size: 3rem; color: var(--text-light);"></i><p style="color: var(--text-light);">No sessions yet. Start your first focus session!</p></div>';
        DOM.hTotalSessions.textContent = '0';
        DOM.hTotalTime.textContent = '0h';
        DOM.hAvgTime.textContent = '0m';
        return;
    }
    const total = state.history.length;
    const totalTime = state.history.reduce(function(sum, h) { return sum + h.duration; }, 0);
    const avgTime = Math.floor(totalTime / total / 60);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    DOM.hTotalSessions.textContent = total;
    DOM.hTotalTime.textContent = hours + 'h ' + minutes + 'm';
    DOM.hAvgTime.textContent = avgTime + 'm';
    DOM.hBestStreak.textContent = state.streak;
    const recent = state.history.slice().reverse().slice(0, 10);
    list.innerHTML = recent.map(function(h) {
        return '<div class="history-item"><span class="date">' + new Date(h.date).toLocaleDateString() + ' ' + new Date(h.date).toLocaleTimeString() + '</span><span>' + Math.floor(h.duration / 60) + ' min</span></div>';
    }).join('');
}

function updateUI() {
    DOM.sessionCount.textContent = state.sessions;
    const hours = Math.floor(state.focusTime / 3600);
    const minutes = Math.floor((state.focusTime % 3600) / 60);
    DOM.totalTimeDisplay.textContent = hours + 'h ' + minutes + 'm';
    updateHomePage();
}

function updateUserProfile() {

    const name = state.userName || 'User';
    const initial = name.charAt(0).toUpperCase();

    DOM.profileInitial.textContent = initial;
    DOM.dropdownInitial.textContent = initial;

    DOM.profileName.textContent = name;
    DOM.dropdownName.textContent = name;
    DOM.welcomeName.textContent = name;

    DOM.dropdownEmail.textContent =
        state.userEmail || 'user@email.com';
}

function loadProfileData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === state.userEmail);
    if (user) {
        document.getElementById('editUsername').value = user.name;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('profileEditInitial').textContent = user.name.charAt(0).toUpperCase();
    }
}

function handleProfileEdit(e) {
    e.preventDefault();
    const name = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const currentPassword = document.getElementById('editCurrentPassword').value;
    const newPassword = document.getElementById('editNewPassword').value;
    const confirmPassword = document.getElementById('editConfirmPassword').value;
    
    if (!name || name.length < 2) {
        showNotification('❌ Error', 'Please enter a valid name (at least 2 characters)');
        return;
    }
    if (!isValidEmail(email)) {
        showNotification('❌ Error', 'Please enter a valid email address');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === state.userEmail);
    if (userIndex === -1) {
        showNotification('❌ Error', 'User not found!');
        return;
    }
    
    const emailTaken = users.some(function(u, i) { return u.email === email && i !== userIndex; });
    if (emailTaken) {
        showNotification('❌ Error', 'This email is already in use by another account');
        return;
    }
    
    if (newPassword) {
        if (users[userIndex].password !== currentPassword) {
            showNotification('❌ Error', 'Current password is incorrect!');
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotification('❌ Error', 'New passwords do not match!');
            return;
        }
        if (newPassword.length < 6) {
            showNotification('❌ Error', 'New password must be at least 6 characters');
            return;
        }
    }
    
    users[userIndex].name = name;
    users[userIndex].email = email;
    if (newPassword) users[userIndex].password = newPassword;
    
    localStorage.setItem('users', JSON.stringify(users));
    
    state.userName = name;
    state.userEmail = email;
    
    const lastUser = JSON.parse(localStorage.getItem('lastUser') || '{}');
    lastUser.name = name;
    lastUser.email = email;
    if (newPassword) lastUser.password = newPassword;
    localStorage.setItem('lastUser', JSON.stringify(lastUser));
    
    saveState();
    updateUserProfile();
    updateHomePage();
    
    showNotification('✅ Success', 'Profile updated successfully!');
    setTimeout(function() { navigateTo('home'); }, 500);
}

function loadSettings() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
    
    document.querySelectorAll('.color-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            const color = this.dataset.color;
            document.documentElement.style.setProperty('--gradient-start', color);
            document.documentElement.style.setProperty('--nav-active', color);
            localStorage.setItem('themeColor', color);
        });
    });
    
    const savedColor = localStorage.getItem('themeColor');
    if (savedColor) {
        document.querySelectorAll('.color-option').forEach(function(btn) {
            if (btn.dataset.color === savedColor) {
                btn.classList.add('active');
                document.documentElement.style.setProperty('--gradient-start', savedColor);
                document.documentElement.style.setProperty('--nav-active', savedColor);
            }
        });
    }
    
    document.getElementById('settingsDefaultTime').value = state.customDuration || 25;
    document.getElementById('settingsBreakTime').value = state.breakDuration || 5;
    
    document.getElementById('settingsDefaultTime').addEventListener('change', function() {
        const val = parseInt(this.value);
        if (val >= 1 && val <= 120) {
            state.customDuration = val;
            state.timeLeft = val * 60;
            state.totalTime = val * 60;
            DOM.customMinutes.value = val;
            updateDisplay();
            saveState();
        }
    });
    
    document.getElementById('settingsBreakTime').addEventListener('change', function() {
        const val = parseInt(this.value);
        if (val >= 0 && val <= 30) {
            state.breakDuration = val;
            DOM.breakMinutes.value = val;
            saveState();
        }
    });
    
    const notifToggle = document.getElementById('notificationsToggle');
    notifToggle.checked = localStorage.getItem('notificationsEnabled') !== 'false';
    notifToggle.addEventListener('change', function() {
        if (this.checked && Notification.permission === 'default') Notification.requestPermission();
        localStorage.setItem('notificationsEnabled', this.checked);
    });
    
    const soundToggle = document.getElementById('soundToggle');
    soundToggle.checked = localStorage.getItem('soundEnabled') !== 'false';
    soundToggle.addEventListener('change', function() {
        localStorage.setItem('soundEnabled', this.checked);
    });
}

function loadStatistics() {
    animateNumber('statsTotalSessions', state.sessions);
    animateNumber('statsTotalPoints', state.points);
    animateNumber('statsTasksDone', state.tasks.filter(function(t) { return t.done; }).length);
    animateNumber('statsAchievements', state.achievements.length);
    animateNumber('statsBestStreak', state.streak);
    const hours = Math.floor(state.focusTime / 3600);
    const minutes = Math.floor((state.focusTime % 3600) / 60);
    document.getElementById('statsTotalHours').textContent = hours + 'h ' + minutes + 'm';
    renderWeeklyChart();
    renderDistributionChart();
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    let current = 0;
    const duration = 1000;
    const steps = 60;
    const increment = target / steps;
    const timer = setInterval(function() {
        current += increment;
        if (current >= target) { current = target; clearInterval(timer); }
        element.textContent = Math.floor(current);
    }, duration / steps);
}

function renderWeeklyChart() {
    const chart = document.getElementById('weeklyChart');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const sessions = state.history?.filter(function(h) { return new Date(h.date).toDateString() === dateStr; }) || [];
        weekData.push({ day: days[date.getDay()], sessions: sessions.length });
    }
    const maxSessions = Math.max.apply(null, weekData.map(function(d) { return d.sessions; }).concat([1]));
    chart.innerHTML = weekData.map(function(data, index) {
        const height = (data.sessions / maxSessions) * 100;
        return '<div class="weekly-bar" style="animation-delay: ' + (index * 0.1) + 's"><div class="bar" style="height: ' + Math.max(height, 5) + 'px;"></div><span class="bar-label">' + data.day + '</span><span class="bar-value">' + data.sessions + '</span></div>';
    }).join('');
}

function renderDistributionChart() {
    const chart = document.getElementById('distributionChart');
    const completedTasks = state.tasks.filter(function(t) { return t.done; }).length;
    const achievements = state.achievements.length;
    const focusPercent = Math.min(Math.round((state.focusTime / (state.sessions * state.customDuration * 60 || 1)) * 100), 100);
    const taskPercent = Math.min(Math.round((completedTasks / (state.tasks.length || 1)) * 100), 100);
    const achPercent = Math.min(Math.round((achievements / ACHIEVEMENTS.length) * 100), 100);
    const data = [
        { label: 'Focus', value: focusPercent, color: '#667eea' },
        { label: 'Tasks', value: taskPercent, color: '#4CAF50' },
        { label: 'Achievements', value: achPercent, color: '#FF9800' }
    ];
    chart.innerHTML = data.map(function(item, index) {
        return '<div class="distribution-item" style="animation-delay: ' + (index * 0.2) + 's"><div class="distribution-circle" style="background: ' + item.color + '; animation-delay: ' + (index * 0.2) + 's">' + item.value + '%</div><span class="distribution-label">' + item.label + '</span></div>';
    }).join('');
}

function exportData() {
    const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user: { name: state.userName, email: state.userEmail },
        stats: { points: state.points, level: state.level, streak: state.streak, sessions: state.sessions, focusTime: state.focusTime },
        tasks: state.tasks,
        achievements: state.achievements,
        history: state.history,
        settings: { customDuration: state.customDuration, breakDuration: state.breakDuration, takeBreak: state.takeBreak, theme: document.documentElement.getAttribute('data-theme') }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focus_timer_data_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('📤 Exported', 'Your data has been exported successfully!');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.stats || !data.tasks) throw new Error('Invalid data format');
            if (confirm('This will replace ALL your current data. Continue?')) {
                if (data.tasks) state.tasks = data.tasks;
                if (data.history) state.history = data.history;
                if (data.achievements) state.achievements = data.achievements;
                if (data.stats) {
                    state.points = data.stats.points || 0;
                    state.level = data.stats.level || 1;
                    state.streak = data.stats.streak || 0;
                    state.sessions = data.stats.sessions || 0;
                    state.focusTime = data.stats.focusTime || 0;
                }
                if (data.settings) {
                    state.customDuration = data.settings.customDuration || 25;
                    state.breakDuration = data.settings.breakDuration || 5;
                    state.takeBreak = data.settings.takeBreak !== undefined ? data.settings.takeBreak : true;
                }
                saveState();
                updateUI();
                renderTasks();
                renderAchievements();
                renderHistory();
                updateHomePage();
                updateTaskStats();
                updateDisplay();
                showNotification('📥 Imported', 'Your data has been imported successfully!');
            }
        } catch (error) {
            alert('Error importing data. Please check the file format.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function clearAllData() {
    if (confirm('⚠️ Are you sure you want to delete ALL your data? This cannot be undone!')) {
        if (confirm('Really? All your points, tasks, history will be lost forever!')) {
            state.points = 0; state.level = 1; state.streak = 0; state.sessions = 0; state.focusTime = 0;
            state.tasks = []; state.achievements = []; state.history = []; state.currentTaskId = null;
            state.customDuration = 25;
            state.breakDuration = 5;
            state.takeBreak = true;
            state.timeLeft = state.customDuration * 60;
            state.totalTime = state.customDuration * 60;
            localStorage.removeItem('focusTimerData');
            updateUI(); renderTasks(); renderAchievements(); renderHistory(); updateHomePage(); updateTaskStats(); updateDisplay();
            showNotification('🗑️ Cleared', 'All data has been cleared successfully!');
        }
    }
}

function setupBreakControls() {
    // Break duration input
    if (DOM.breakMinutes) {
        DOM.breakMinutes.value = state.breakDuration || 5;
        DOM.breakMinutes.addEventListener('change', function() {
            const val = parseInt(this.value);
            if (val >= 0 && val <= 30) {
                state.breakDuration = val;
                saveState();
                showNotification('⏱️ Break Updated', 'Break duration set to ' + val + ' minutes');
            }
        });
    }
    
    if (DOM.breakToggle) {
        DOM.breakToggle.checked = state.takeBreak !== false;
        if (DOM.breakToggleText) {
            DOM.breakToggleText.textContent = state.takeBreak ? 'Take Break' : 'Skip Break';
        }
        DOM.breakToggle.addEventListener('change', function() {
            state.takeBreak = this.checked;
            if (DOM.breakToggleText) {
                DOM.breakToggleText.textContent = state.takeBreak ? 'Take Break' : 'Skip Break';
            }
            saveState();
            showNotification(
                state.takeBreak ? '☕ Break Enabled' : '⏭️ Break Skipped',
                state.takeBreak ? 'You will get a break after each session' : 'You will skip breaks and continue working'
            );
        });
    }
}

function showNotification(title, message) {
    if (Notification.permission === 'granted' && localStorage.getItem('notificationsEnabled') !== 'false') {
        new Notification(title, { body: message, icon: '🎯' });
    }
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:20px;right:20px;background:var(--bg-card);padding:1.5rem 2rem;border-radius:15px;box-shadow:0 10px 30px var(--shadow-color-dark);z-index:1000;animation:slideIn 0.5s ease;max-width:350px;border-left:4px solid var(--nav-active);color:var(--text-primary);';
    el.innerHTML = '<strong style="font-size:1.1rem;">' + title + '</strong><p style="margin-top:0.5rem;color:var(--text-secondary);">' + message + '</p>';
    document.body.appendChild(el);
    setTimeout(function() { el.style.animation = 'slideOut 0.5s ease'; setTimeout(function() { el.remove(); }, 500); }, 4000);
}


function checkDailyStreak() {
    const today = new Date().toDateString();
    const last = state.lastDate ? new Date(state.lastDate).toDateString() : null;
    if (last !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        state.streak = last === yesterday.toDateString() ? state.streak + 1 : 0;
        state.lastDate = new Date().toISOString();
        saveState();
    }
}

function saveState() {
    const data = {
        points: state.points, level: state.level, streak: state.streak,
        sessions: state.sessions, focusTime: state.focusTime, tasks: state.tasks,
        currentTaskId: state.currentTaskId, achievements: state.achievements,
        history: state.history, lastDate: state.lastDate, 
        customDuration: state.customDuration,
        breakDuration: state.breakDuration,
        takeBreak: state.takeBreak,
        userName: state.userName, userEmail: state.userEmail
    };
    localStorage.setItem('focusTimerData', JSON.stringify(data));
}

function loadState() {
    const saved = localStorage.getItem('focusTimerData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const currentUserName = state.userName;
            const currentUserEmail = state.userEmail;
            Object.assign(state, data);
            state.userName = currentUserName;
            state.userEmail = currentUserEmail;
            state.timeLeft = state.customDuration * 60;
            state.totalTime = state.customDuration * 60;
            state.interval = null;
            state.isRunning = false;
            state.isPaused = false;
            state.isBreak = false;
            DOM.customMinutes.value = state.customDuration || 25;
            if (DOM.breakMinutes) DOM.breakMinutes.value = state.breakDuration || 5;
            if (DOM.breakToggle) DOM.breakToggle.checked = state.takeBreak !== false;
            if (DOM.breakToggleText) DOM.breakToggleText.textContent = state.takeBreak ? 'Take Break' : 'Skip Break';
        } catch (e) { console.error('Error loading data:', e); }
    }
}

function setupEventListeners() {
    DOM.themeToggle.addEventListener('click', toggleTheme);
    DOM.profileBtn.addEventListener('click', toggleProfile);
    document.addEventListener('click', function(e) { if (!e.target.closest('.profile-container')) closeProfile(); });
    DOM.logoutBtn.addEventListener('click', function(e) { e.preventDefault(); logoutUser(); });
    DOM.navBtns.forEach(function(btn) { btn.addEventListener('click', function() { navigateTo(this.dataset.page); }); });
    DOM.quoteRefresh.addEventListener('click', showRandomQuote);
    DOM.startBtn.addEventListener('click', startTimer);
    DOM.pauseBtn.addEventListener('click', pauseTimer);
    DOM.resetBtn.addEventListener('click', resetTimer);
    DOM.setTimeBtn.addEventListener('click', setCustomTime);
    DOM.addTaskBtn.addEventListener('click', addTask);
    DOM.taskInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') addTask(); });
    DOM.filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            DOM.filterBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });
    document.querySelectorAll('.dropdown-item[data-page]').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo(this.dataset.page);
            closeProfile();
        });
    });
    var profileForm = document.getElementById('profileEditForm');
    if (profileForm) profileForm.addEventListener('submit', handleProfileEdit);
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    setupBreakControls();
}

function init() {
    console.log("DOM.showSignup", DOM.showSignup);
    console.log("DOM.showLogin", DOM.showLogin);
    console.log("DOM.loginForm", DOM.loginForm);
    console.log("DOM.signupForm", DOM.signupForm);

    loadTheme();

    setupEventListeners();

    var lastUser =
        JSON.parse(localStorage.getItem('lastUser') || 'null');

    if (lastUser) {

        var users =
            JSON.parse(localStorage.getItem('users') || '[]');

        var user = users.find(function(u) {
            return u.email === lastUser.email &&
                   u.password === lastUser.password;
        });

        if (user) {
            state.userName = user.name;
            state.userEmail = user.email;
            state.isLoggedIn = true;
            loginUser();
            return;
        }
    }

    DOM.authOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    showLoginForm();

    DOM.showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        showSignupForm();
    });

    DOM.showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });

    DOM.loginForm.addEventListener('submit', handleLogin);
    DOM.signupForm.addEventListener('submit', handleSignup);
}

document.addEventListener('DOMContentLoaded', function() {
    window.startTimer = startTimer;
    window.pauseTimer = pauseTimer;
    window.resetTimer = resetTimer;
    window.addTask = addTask;
    window.deleteTask = deleteTask;
    window.toggleTask = toggleTask;
    window.selectTask = selectTask;
    window.navigateTo = navigateTo;
    window.logoutUser = logoutUser;
    window.showLoginForm = showLoginForm;
    window.showSignupForm = showSignupForm;
    window.exportData = exportData;
    window.importData = importData;
    window.clearAllData = clearAllData;
    window.loadProfileData = loadProfileData;
    window.loadSettings = loadSettings;
    window.loadStatistics = loadStatistics;
    window.showNotification = showNotification;
    
    init();
});