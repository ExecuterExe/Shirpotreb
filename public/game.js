// ═══════════════════════════════════════════════════════════════════
// 🚀 ИННОВАЦИОННЫЙ ШИРПОТРЕБ v2.0 — КЛИЕНТСКАЯ ЛОГИКА
// ═══════════════════════════════════════════════════════════════════

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
var isStreamerMode = false;
var pitchSaveInterval = null;
var ws = null;
var myPlayerId = null;
var myRoomCode = null;
var isHost = false;
var currentPhase = 'welcome';
var myCapital = 10;
var timerInterval = null;
var timerDuration = 0;
var timerRemaining = 0;
var currentEvent = null;
var notificationTimeout = null;
var currentRoundNum = 1;
var totalRoundsNum = 3;

// ==================== ФОНОВЫЕ ЧАСТИЦЫ ====================

var particlesCanvas, particlesCtx;
var particles = [];
var PARTICLE_COUNT = 50;

function initParticles() {
    particlesCanvas = document.getElementById('particles-canvas');
    if (!particlesCanvas) return;
    particlesCtx = particlesCanvas.getContext('2d');

    function resize() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * particlesCanvas.width,
            y: Math.random() * particlesCanvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.3 - 0.15,
            radius: Math.random() * 2.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.1,
            hue: Math.random() * 40 + 160 // бирюзовый спектр
        });
    }

    animateParticles();
}

function animateParticles() {
    if (!particlesCtx) return;
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Заворачиваем
        if (p.x < 0) p.x = particlesCanvas.width;
        if (p.x > particlesCanvas.width) p.x = 0;
        if (p.y < 0) p.y = particlesCanvas.height;
        if (p.y > particlesCanvas.height) p.y = 0;

        particlesCtx.beginPath();
        particlesCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        particlesCtx.fillStyle = 'hsla(' + p.hue + ', 60%, 65%, ' + p.opacity + ')';
        particlesCtx.fill();
    }

    // Линии между близкими частицами
    for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
            var dx = particles[a].x - particles[b].x;
            var dy = particles[a].y - particles[b].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                particlesCtx.beginPath();
                particlesCtx.moveTo(particles[a].x, particles[a].y);
                particlesCtx.lineTo(particles[b].x, particles[b].y);
                particlesCtx.strokeStyle = 'hsla(175, 50%, 55%, ' + (0.08 * (1 - dist / 120)) + ')';
                particlesCtx.lineWidth = 0.5;
                particlesCtx.stroke();
            }
        }
    }

    requestAnimationFrame(animateParticles);
}

// ==================== ЗВУКОВЫЕ ЭФФЕКТЫ (Web Audio API) ====================

var audioCtx = null;

function getAudioCtx() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // Звук недоступен
        }
    }
    return audioCtx;
}

function playSound(type) {
    var ctx = getAudioCtx();
    if (!ctx) return;

    try {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
            case 'join':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
                break;

            case 'start':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);
                osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
                break;

            case 'tick':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.05);
                break;

            case 'warning':
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.setValueAtTime(520, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
                break;

            case 'success':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
                break;

            case 'fanfare':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
                osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.7);
                break;

            case 'invest':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
                break;

            default:
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.1);
        }
    } catch (e) {
        // Игнорируем ошибки звука
    }
}

// ==================== КОНФЕТТИ ====================

function launchConfetti() {
    var container = document.getElementById('confetti');
    if (!container) return;
    container.innerHTML = '';

    var colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4ecdc4', '#a29bfe', '#ff9ff3', '#54a0ff'];

    for (var i = 0; i < 100; i++) {
        var piece = document.createElement('div');
        piece.style.cssText =
            'position:fixed;' +
            'width:' + (Math.random() * 10 + 5) + 'px;' +
            'height:' + (Math.random() * 10 + 5) + 'px;' +
            'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
            'left:' + (Math.random() * 100) + 'vw;' +
            'top:-10px;' +
            'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';' +
            'pointer-events:none;' +
            'z-index:10;' +
            'animation:confettiFall ' + (Math.random() * 3 + 2) + 's linear ' + (Math.random() * 2) + 's forwards;' +
            'transform:rotate(' + (Math.random() * 360) + 'deg);';
        container.appendChild(piece);
    }

    // Добавляем CSS анимацию если еще нет
    if (!document.getElementById('confetti-style')) {
        var style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent =
            '@keyframes confettiFall {' +
            '  0% { transform: translateY(0) rotate(0deg); opacity: 1; }' +
            '  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }' +
            '}';
        document.head.appendChild(style);
    }

    // Убираем через 7 сек
    setTimeout(function () {
        container.innerHTML = '';
    }, 7000);
}

// ==================== WEBSOCKET ====================

function connectWS() {
    var statusEl = document.getElementById('connection-status');
    if (statusEl) {
        statusEl.className = 'connection-badge connecting';
        statusEl.querySelector('.status-text').textContent = 'Подключение...';
    }

    var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    var host = location.host;
    var url = protocol + '//' + host;

    console.log('[WS] Connecting to:', url);

    try {
        ws = new WebSocket(url);
    } catch (e) {
        console.error('[WS] Creation error:', e);
        if (statusEl) {
            statusEl.className = 'connection-badge disconnected';
            statusEl.querySelector('.status-text').textContent = 'Ошибка подключения';
        }
        setTimeout(connectWS, 3000);
        return;
    }

    ws.onopen = function () {
        console.log('[WS] Connected!');
        if (statusEl) {
            statusEl.className = 'connection-badge connected';
            statusEl.querySelector('.status-text').textContent = 'Подключено';
        }
    };

    ws.onmessage = function (event) {
        try {
            var msg = JSON.parse(event.data);
            handleMessage(msg);
        } catch (e) {
            console.error('[WS] Parse error:', e);
        }
    };

    ws.onclose = function () {
        console.log('[WS] Disconnected');
        ws = null;
        if (statusEl) {
            statusEl.className = 'connection-badge disconnected';
            statusEl.querySelector('.status-text').textContent = 'Переподключение...';
        }
        setTimeout(connectWS, 3000);
    };

    ws.onerror = function () {
        console.error('[WS] Error');
    };
}

function sendMsg(msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
    } else {
        showNotification('Нет соединения с сервером', 'error');
    }
}

// ==================== ЭКРАНЫ ====================

function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    var target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==================== УТИЛИТЫ ====================

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function showNotification(text, type) {
    var el = document.getElementById('notification');
    var iconEl = document.getElementById('notification-icon');
    var textEl = document.getElementById('notification-text');

    var icon = '';
    switch (type) {
        case 'error': icon = '❌'; break;
        case 'success': icon = '✅'; break;
        default: icon = 'ℹ️'; type = 'info';
    }

    iconEl.textContent = icon;
    textEl.textContent = text;
    el.className = 'notification ' + type;

    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(function () {
        el.classList.add('hidden');
    }, 4500);
}

function stepSetting(id, delta) {
    var input = document.getElementById(id);
    if (!input) return;
    var val = parseInt(input.value) || 0;
    var min = parseInt(input.min) || 1;
    var max = parseInt(input.max) || 999;
    var step = parseInt(input.step) || 1;
    val += delta;
    if (val < min) val = min;
    if (val > max) val = max;
    input.value = val;
    updateSettings();
}

// ==================== ДЕЙСТВИЯ ИГРОКА ====================

function createRoom() {
    var nickname = document.getElementById('nickname').value.trim();
    if (!nickname) {
        showNotification('Введите никнейм!', 'error');
        document.getElementById('nickname').focus();
        return;
    }
    sendMsg({ type: 'createRoom', nickname: nickname, settings: {} });
}

function joinRoom() {
    var nickname = document.getElementById('nickname').value.trim();
    var code = document.getElementById('room-code').value.trim().toUpperCase();
    if (!nickname) {
        showNotification('Введите никнейм!', 'error');
        document.getElementById('nickname').focus();
        return;
    }
    if (!code || code.length < 3) {
        showNotification('Введите код комнаты!', 'error');
        document.getElementById('room-code').focus();
        return;
    }
    sendMsg({ type: 'joinRoom', nickname: nickname, roomCode: code });
}

function copyCode() {
    if (!myRoomCode) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(myRoomCode).then(function () {
            showNotification('Код скопирован: ' + myRoomCode, 'success');
        });
    } else {
        var temp = document.createElement('input');
        temp.value = myRoomCode;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showNotification('Код скопирован: ' + myRoomCode, 'success');
    }
}

function toggleRules() {
    var panel = document.getElementById('rules-panel');
    var arrow = document.getElementById('rules-arrow');
    panel.classList.toggle('hidden');
    arrow.classList.toggle('open');
}

function togglePrevious() {
    var list = document.getElementById('prev-list');
    var arrow = document.getElementById('prev-arrow');
    list.classList.toggle('hidden');
    if (arrow) arrow.classList.toggle('open');
}

function updateSettings() {
    sendMsg({
        type: 'updateSettings',
        settings: {
            rounds: parseInt(document.getElementById('set-rounds').value) || 3,
            startCapital: parseInt(document.getElementById('set-capital').value) || 10,
            useEvents: document.getElementById('set-events').checked,
            streamerMode: document.getElementById('set-streamer').checked,
            prepTime: parseInt(document.getElementById('set-prep').value) || 120,
            presentTime: parseInt(document.getElementById('set-present').value) || 120,
            investTime: parseInt(document.getElementById('set-invest').value) || 60
        }
    });
}

function startGame() {
    sendMsg({ type: 'startGame' });
}

function nextPresenterAction() {
    sendMsg({ type: 'nextPresenter' });
}

function nextTiebreakerPresenter() {
    sendMsg({ type: 'nextTiebreakerPresenter' });
}

function nextRound() {
    sendMsg({ type: 'nextRound' });
}

function showFinal() {
    sendMsg({ type: 'nextRound' });
}

function playAgain() {
    sendMsg({ type: 'playAgain' });
}

function skipTimer() {
    sendMsg({ type: 'skipTimer' });
}

function submitInvestment() {
    var inputs = document.querySelectorAll('.invest-amount');
    var investments = [];
    var total = 0;

    for (var i = 0; i < inputs.length; i++) {
        var amount = parseInt(inputs[i].value) || 0;
        if (amount > 0) {
            investments.push({
                targetId: inputs[i].getAttribute('data-target-id'),
                amount: amount
            });
            total += amount;
        }
    }

    if (total > myCapital) {
        showNotification('Недостаточно капитала! У вас: ' + myCapital + ', пытаетесь вложить: ' + total, 'error');
        playSound('warning');
        return;
    }

    sendMsg({ type: 'submitInvestment', investments: investments });
    playSound('invest');
}

function submitTieInvestment() {
    var inputs = document.querySelectorAll('.tie-invest-amount');
    var investments = [];

    for (var i = 0; i < inputs.length; i++) {
        var amount = parseInt(inputs[i].value) || 0;
        if (amount > 0) {
            investments.push({
                targetId: inputs[i].getAttribute('data-target-id'),
                amount: amount
            });
        }
    }

    sendMsg({ type: 'submitTieInvestment', investments: investments });
    playSound('invest');
}

function updateInvestRemaining() {
    var inputs = document.querySelectorAll('.invest-amount');
    var total = 0;
    for (var i = 0; i < inputs.length; i++) {
        total += parseInt(inputs[i].value) || 0;
    }
    var remaining = myCapital - total;
    var el = document.getElementById('inv-remaining');
    el.textContent = remaining;
    if (remaining < 0) {
        el.className = 'remaining-value negative';
    } else {
        el.className = 'remaining-value';
    }
}

// ==================== ТАЙМЕР ====================

function startClientTimer(duration) {
    if (timerInterval) clearInterval(timerInterval);

    timerDuration = duration;
    timerRemaining = duration;
    updateTimerDisplays(timerRemaining);
    updateTimerRings(timerRemaining, timerDuration);

    timerInterval = setInterval(function () {
        timerRemaining--;
        if (timerRemaining <= 0) {
            timerRemaining = 0;
            clearInterval(timerInterval);
            timerInterval = null;
        }

        updateTimerDisplays(timerRemaining);
        updateTimerRings(timerRemaining, timerDuration);

        // Звуковые предупреждения
        if (timerRemaining === 10) playSound('warning');
        if (timerRemaining <= 5 && timerRemaining > 0) playSound('tick');
    }, 1000);
}

function updateTimerDisplays(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
    var text = min + ':' + (sec < 10 ? '0' : '') + sec;

    var timerIds = ['prep-timer', 'pres-timer', 'inv-timer', 'tb-timer', 'tbv-timer', 'tied-timer'];
    for (var i = 0; i < timerIds.length; i++) {
        var el = document.getElementById(timerIds[i]);
        if (el) {
            el.textContent = text;
            if (seconds <= 5) {
                el.className = 'timer-text critical';
            } else if (seconds <= 15) {
                el.className = 'timer-text warning';
            } else {
                el.className = 'timer-text';
            }
        }
    }
}

function updateTimerRings(remaining, total) {
    if (total <= 0) return;
    var fraction = remaining / total;
    var dashoffset = 283 * (1 - fraction);

    var circleIds = ['prep-timer-circle', 'pres-timer-circle', 'inv-timer-circle', 'tb-timer-circle', 'tbv-timer-circle'];
    for (var i = 0; i < circleIds.length; i++) {
        var circle = document.getElementById(circleIds[i]);
        if (circle) {
            circle.style.strokeDashoffset = dashoffset;
            if (remaining <= 5) {
                circle.className.baseVal = 'timer-progress critical';
            } else if (remaining <= 15) {
                circle.className.baseVal = 'timer-progress warning';
            } else {
                circle.className.baseVal = 'timer-progress';
            }
        }
    }
}

// ==================== ОБРАБОТКА СООБЩЕНИЙ ====================

function handleMessage(msg) {
    console.log('[MSG]', msg.type);

    switch (msg.type) {

        case 'roomCreated':
            myPlayerId = msg.playerId;
            myRoomCode = msg.roomCode;
            isHost = true;
            document.getElementById('lobby-code').textContent = msg.roomCode;
            showScreen('screen-lobby');
            showNotification('Комната создана! Код: ' + msg.roomCode, 'success');
            playSound('success');
            break;

        case 'roomJoined':
            myPlayerId = msg.playerId;
            myRoomCode = msg.roomCode;
            document.getElementById('lobby-code').textContent = msg.roomCode;
            showScreen('screen-lobby');
            showNotification('Вы вошли в комнату!', 'success');
            playSound('join');
            break;

        case 'lobbyUpdate':
            handleLobbyUpdate(msg);
            break;

        case 'gameStarted':
            showNotification('Игра начинается!', 'success');
            playSound('start');
            break;

        case 'roundStart':
            handleRoundStart(msg);
            break;

        case 'presentationPhase':
            handlePresentation(msg);
            break;

        case 'investingPhase':
            handleInvesting(msg);
            break;

        case 'investmentAccepted':
            document.getElementById('btn-invest').classList.add('hidden');
            document.getElementById('inv-confirmed').classList.remove('hidden');
            showNotification('Инвестиции приняты! Вложено: ' + msg.total, 'success');
            playSound('success');
            break;

        case 'investmentProgress':
            document.getElementById('inv-progress').textContent =
                'Проголосовали: ' + msg.voted + ' / ' + msg.total;
            break;

        case 'roundResults':
            handleRoundResults(msg);
            break;

        case 'roundResultsTied':
            handleTiedResults(msg);
            break;

        case 'tiebreakerStart':
            // Следующее сообщение будет tiebreakerPresentation
            break;

        case 'tiebreakerPresentation':
            handleTiebreakerPresentation(msg);
            break;

        case 'tiebreakerVoting':
            handleTiebreakerVoting(msg);
            break;

        case 'tieInvestmentAccepted':
            showNotification('Голос принят!', 'success');
            playSound('success');
            break;

        case 'tieVoteProgress':
            // Можно отобразить прогресс тайбрейкер голосования
            break;

        case 'gameOver':
            handleGameOver(msg);
            break;

        case 'timerStart':
            startClientTimer(msg.duration);
            break;

        case 'playerDisconnected':
            showNotification(msg.nickname + ' отключился', 'error');
            break;

        case 'error':
            showNotification(msg.message, 'error');
            playSound('warning');
            break;
    }
}

// ==================== ЛОББИ ====================

function handleLobbyUpdate(msg) {
    var container = document.getElementById('lobby-players');
    container.innerHTML = '';

    var avatars = ['🦊', '🐸', '🦄', '🐙', '🦋', '🐯', '🐼', '🦁'];

    for (var i = 0; i < msg.players.length; i++) {
        var p = msg.players[i];
        var div = document.createElement('div');
        div.className = 'player-item';

        var avatar = document.createElement('div');
        avatar.className = 'player-avatar';
        avatar.style.background = 'linear-gradient(135deg, hsl(' + (i * 45 + 120) + ', 60%, 45%), hsl(' + (i * 45 + 150) + ', 60%, 35%))';
        avatar.textContent = avatars[i % avatars.length];
        div.appendChild(avatar);

        var name = document.createElement('span');
        name.className = 'player-name';
        name.textContent = p.nickname;
        div.appendChild(name);

        var badges = document.createElement('div');
        badges.className = 'badges';

        if (p.isHost) {
            var b1 = document.createElement('span');
            b1.className = 'player-badge badge-host';
            b1.textContent = '👑 Хост';
            badges.appendChild(b1);
        }
        if (p.id === myPlayerId) {
            var b2 = document.createElement('span');
            b2.className = 'player-badge badge-you';
            b2.textContent = 'Вы';
            badges.appendChild(b2);
        }
        div.appendChild(badges);
        container.appendChild(div);
    }

    // Обновляем статус хоста
    for (var j = 0; j < msg.players.length; j++) {
        if (msg.players[j].id === myPlayerId) {
            isHost = msg.players[j].isHost;
            break;
        }
    }

    var hostSettings = document.getElementById('host-settings');
    var btnStart = document.getElementById('btn-start-game');
    var waitingMsg = document.getElementById('waiting-msg');

    if (isHost) {
        hostSettings.classList.remove('hidden');
        document.getElementById('set-rounds').value = msg.settings.rounds;
        document.getElementById('set-capital').value = msg.settings.startCapital;
        document.getElementById('set-events').checked = msg.settings.useEvents;
        document.getElementById('set-streamer').checked = msg.settings.streamerMode;
        isStreamerMode = msg.settings.streamerMode;
        document.getElementById('set-prep').value = msg.settings.prepTime;
        document.getElementById('set-present').value = msg.settings.presentTime;
        document.getElementById('set-invest').value = msg.settings.investTime;

        if (msg.canStart) {
            btnStart.classList.remove('hidden');
            waitingMsg.classList.add('hidden');
        } else {
            btnStart.classList.add('hidden');
            waitingMsg.innerHTML = '<span class="waiting-spinner"></span> Ожидание игроков... (' + msg.players.length + '/3 мин.)';
            waitingMsg.classList.remove('hidden');
        }
    } else {
        hostSettings.classList.add('hidden');
        btnStart.classList.add('hidden');
        if (msg.canStart) {
            waitingMsg.innerHTML = '<span class="waiting-spinner"></span> Ожидание начала игры от хоста...';
        } else {
            waitingMsg.innerHTML = '<span class="waiting-spinner"></span> Ожидание игроков... (' + msg.players.length + '/3 мин.)';
        }
        waitingMsg.classList.remove('hidden');
    }

    // Показываем экран лобби только если мы ещё не на нём (чтобы не скроллить вверх при обновлении настроек)
    if (currentPhase !== 'lobby') {
        showScreen('screen-lobby');
    }
    currentPhase = 'lobby';
}

// ==================== НАЧАЛО РАУНДА ====================

function handleRoundStart(msg) {
    currentPhase = 'preparation';
    currentRoundNum = msg.round;
    totalRoundsNum = msg.totalRounds;
    currentEvent = msg.event;

    for (var i = 0; i < msg.players.length; i++) {
        if (msg.players[i].id === myPlayerId) {
            myCapital = msg.players[i].capital;
            break;
        }
    }

    document.getElementById('prep-round').textContent = msg.round;
    document.getElementById('prep-total').textContent = msg.totalRounds;
    document.getElementById('prep-capital').textContent = myCapital;

    document.getElementById('prep-adj').textContent = msg.yourCards.adjective;
    document.getElementById('prep-item').textContent = msg.yourCards.item;
    document.getElementById('prep-feat').textContent = msg.yourCards.feature;

    // Событие
    var eventBanner = document.getElementById('prep-event');
    var eventText = document.getElementById('prep-event-text');
    if (msg.event) {
        eventText.textContent = msg.event;
        eventBanner.classList.remove('hidden');
    } else {
        eventBanner.classList.add('hidden');
    }

    // Порядок выступлений
    var orderEl = document.getElementById('prep-order');
    orderEl.innerHTML = '';
    for (var j = 0; j < msg.presentationOrder.length; j++) {
        var po = msg.presentationOrder[j];
        var span = document.createElement('span');
        span.className = 'order-item' + (po.id === myPlayerId ? ' you' : '');
        span.textContent = (j + 1) + '. ' + po.nickname;
        orderEl.appendChild(span);
    }

    // Хост контроли
    var hostCtrl = document.getElementById('prep-host-controls');
    if (isHost) {
        hostCtrl.classList.remove('hidden');
    } else {
        hostCtrl.classList.add('hidden');
    }

    // Стримерский режим
    isStreamerMode = !!msg.streamerMode;
    var pitchSection = document.getElementById('prep-pitch-section');
    var pitchTextarea = document.getElementById('prep-pitch-text');
    if (isStreamerMode) {
        pitchSection.classList.remove('hidden');
        pitchTextarea.value = '';
        var counter = document.getElementById('pitch-char-count');
        if (counter) counter.textContent = '0';
        startPitchAutoSave();
    } else {
        pitchSection.classList.add('hidden');
        stopPitchAutoSave();
    }

    showScreen('screen-preparation');
    showNotification('Раунд ' + msg.round + '! Готовьте презентацию!', 'success');
    playSound('start');
}

// ==================== ПРЕЗЕНТАЦИЯ ====================

function handlePresentation(msg) {
    currentPhase = 'presentation';

    if (msg.round) currentRoundNum = msg.round;
    if (msg.totalRounds) totalRoundsNum = msg.totalRounds;

    document.getElementById('pres-round').textContent = currentRoundNum;
    document.getElementById('pres-total').textContent = totalRoundsNum;
    document.getElementById('pres-capital').textContent = myCapital;

    var pres = msg.currentPresenter;
    document.getElementById('pres-index').textContent = msg.presenterIndex + 1;
    document.getElementById('pres-count').textContent = msg.totalPresenters;
    document.getElementById('pres-name').textContent = pres.nickname;

    document.getElementById('pres-adj').textContent = pres.cards.adjective;
    document.getElementById('pres-item').textContent = pres.cards.item;
    document.getElementById('pres-feat').textContent = pres.cards.feature;

    var isMe = pres.id === myPlayerId;
    var youBadge = document.getElementById('pres-is-you');
    if (isMe) {
        youBadge.classList.remove('hidden');
    } else {
        youBadge.classList.add('hidden');
    }

    // Событие
    var eventBanner = document.getElementById('pres-event');
    var eventText = document.getElementById('pres-event-text');
    var ev = msg.event || currentEvent;
    if (ev) {
        eventText.textContent = ev;
        eventBanner.classList.remove('hidden');
    } else {
        eventBanner.classList.add('hidden');
    }

    // Предыдущие
    var prevSection = document.getElementById('previous-presentations');
    var prevList = document.getElementById('prev-list');
    if (msg.previousPresentations && msg.previousPresentations.length > 0) {
        prevSection.classList.remove('hidden');
        prevList.innerHTML = '';
        prevList.classList.add('hidden'); // скрыт по умолчанию
        var prevArrow = document.getElementById('prev-arrow');
        if (prevArrow) prevArrow.classList.remove('open');

        for (var i = 0; i < msg.previousPresentations.length; i++) {
            var pp = msg.previousPresentations[i];
            var div = document.createElement('div');
            div.className = 'prev-item';
            var pitchHtml = '';
            if (streamerMode && pp.pitchText && pp.pitchText.trim()) {
                pitchHtml = '<div class="prev-pitch">' + escapeHtml(pp.pitchText) + '</div>';
            }
            div.innerHTML =
                '<div class="prev-name">' + escapeHtml(pp.nickname) + '</div>' +
                '<div class="prev-cards">' +
                '<span class="tag-adj">' + escapeHtml(pp.cards.adjective) + '</span>' +
                '<span class="tag-item">' + escapeHtml(pp.cards.item) + '</span>' +
                '<span class="tag-feat">' + escapeHtml(pp.cards.feature) + '</span>' +
                '</div>' +
                pitchHtml;
            prevList.appendChild(div);
        }
    } else {
        prevSection.classList.add('hidden');
    }

    // Стримерский режим — текст презентации
    var streamerMode = !!msg.streamerMode;
    var pitchDisplay = document.getElementById('pres-pitch-section');
    var pitchText = document.getElementById('pres-pitch-text');
    if (streamerMode && pres.pitchText && pres.pitchText.trim()) {
        pitchDisplay.classList.remove('hidden');
        pitchText.textContent = pres.pitchText;
    } else if (streamerMode) {
        pitchDisplay.classList.remove('hidden');
        pitchText.textContent = '';
    } else {
        pitchDisplay.classList.add('hidden');
    }

    // Отправляем последнюю версию текста при переходе из подготовки
    if (isStreamerMode) {
        sendPitchText();
        stopPitchAutoSave();
    }

    // Контроли
    var controls = document.getElementById('pres-controls');
    if (isHost || isMe) {
        controls.classList.remove('hidden');
    } else {
        controls.classList.add('hidden');
    }

    showScreen('screen-presentation');
    if (isMe) {
        playSound('start');
    } else {
        playSound('join');
    }
}

// ==================== ИНВЕСТИРОВАНИЕ ====================

function handleInvesting(msg) {
    currentPhase = 'investing';

    if (msg.round) currentRoundNum = msg.round;
    if (msg.totalRounds) totalRoundsNum = msg.totalRounds;

    for (var i = 0; i < msg.players.length; i++) {
        if (msg.players[i].id === myPlayerId) {
            myCapital = msg.players[i].capital;
            break;
        }
    }

    document.getElementById('inv-round').textContent = currentRoundNum;
    document.getElementById('inv-total').textContent = totalRoundsNum;
    document.getElementById('inv-capital').textContent = myCapital;
    document.getElementById('inv-remaining').textContent = myCapital;
    document.getElementById('inv-remaining').className = 'remaining-value';

    var container = document.getElementById('inv-presentations');
    container.innerHTML = '';

    for (var j = 0; j < msg.presentations.length; j++) {
        var p = msg.presentations[j];
        var isSelf = p.id === myPlayerId;
        var div = document.createElement('div');
        div.className = 'invest-item' + (isSelf ? ' is-self' : '');

        var infoHtml =
            '<div class="invest-info">' +
            '<div class="invest-name">' + escapeHtml(p.nickname) + (isSelf ? ' (Вы)' : '') + '</div>' +
            '<div class="invest-cards">' +
            '<span class="tag-adj">' + escapeHtml(p.cards.adjective) + '</span>' +
            '<span class="tag-item">' + escapeHtml(p.cards.item) + '</span>' +
            '<span class="tag-feat">' + escapeHtml(p.cards.feature) + '</span>' +
            '</div>' +
            '</div>';

        var inputHtml = '';
        if (!isSelf) {
            inputHtml =
                '<div class="invest-input">' +
                '<label>💰</label>' +
                '<input type="number" class="invest-amount" data-target-id="' + p.id + '" ' +
                'min="0" max="' + myCapital + '" value="0" ' +
                'oninput="updateInvestRemaining()">' +
                '</div>';
        }

        div.innerHTML = infoHtml + inputHtml;
        container.appendChild(div);
    }

    document.getElementById('btn-invest').classList.remove('hidden');
    document.getElementById('inv-confirmed').classList.add('hidden');
    document.getElementById('inv-progress').textContent = '';

    // Хост контроли
    var hostCtrl = document.getElementById('inv-host-controls');
    if (isHost) {
        hostCtrl.classList.remove('hidden');
    } else {
        hostCtrl.classList.add('hidden');
    }

    showScreen('screen-investing');
    showNotification('Время инвестировать!', 'success');
    playSound('invest');
}

// ==================== РЕЗУЛЬТАТЫ РАУНДА ====================

function handleRoundResults(msg) {
    currentPhase = 'roundResults';

    document.getElementById('res-round').textContent = msg.round;

    // Обновляем капитал
    for (var m = 0; m < msg.players.length; m++) {
        if (msg.players[m].id === myPlayerId) {
            myCapital = msg.players[m].capital;
            break;
        }
    }

    // Победитель
    var winnerEl = document.getElementById('res-winner');
    if (msg.roundWinners.length > 0) {
        var names = [];
        for (var w = 0; w < msg.roundWinners.length; w++) {
            names.push(msg.roundWinners[w].nickname);
        }
        winnerEl.innerHTML =
            '<span class="winner-emoji">🏆</span>' +
            'Лучший предприниматель раунда:<br><b>' + escapeHtml(names.join(', ')) + '</b>';
    } else {
        winnerEl.innerHTML =
            '<span class="winner-emoji">😬</span>' +
            'Никто не получил инвестиций в этом раунде!';
    }

    // Детали инвестиций
    var invEl = document.getElementById('res-investments');
    invEl.innerHTML = '<h3>💸 Инвестиции раунда</h3>';
    if (msg.investmentDetails.length === 0) {
        invEl.innerHTML += '<p style="color:var(--text-muted)">Никто не инвестировал</p>';
    } else {
        for (var d = 0; d < msg.investmentDetails.length; d++) {
            var detail = msg.investmentDetails[d];
            var row = document.createElement('div');
            row.className = 'inv-result-item';
            row.innerHTML =
                '<span>' + escapeHtml(detail.from) + '</span>' +
                '<span class="inv-arrow">→ ' + detail.amount + ' жет. →</span>' +
                '<span>' + escapeHtml(detail.to) + '</span>';
            invEl.appendChild(row);
        }
    }

    // Удачные инвесторы
    var luckyEl = document.getElementById('res-lucky');
    luckyEl.innerHTML = '';
    if (msg.luckyInvestors.length > 0) {
        luckyEl.innerHTML = '<h3>🎰 Удачные инвестиции (×2)</h3>';
        for (var l = 0; l < msg.luckyInvestors.length; l++) {
            var li = msg.luckyInvestors[l];
            var ldiv = document.createElement('div');
            ldiv.className = 'lucky-item';
            ldiv.textContent = '✅ ' + li.investorName + ' вложил ' + li.invested +
                ' в ' + li.targetName + ' → получил ' + li.reward + ' жетонов!';
            luckyEl.appendChild(ldiv);
        }
    }

    // Таблица
    renderScoreboard(document.getElementById('res-scoreboard'), msg.players);

    // Контроли
    var controlsNext = document.getElementById('res-controls');
    var controlsFinal = document.getElementById('res-controls-final');
    var waitMsg = document.getElementById('res-wait-msg');

    controlsNext.classList.add('hidden');
    controlsFinal.classList.add('hidden');
    waitMsg.classList.add('hidden');

    if (isHost) {
        if (msg.isLastRound) {
            controlsFinal.classList.remove('hidden');
        } else {
            controlsNext.classList.remove('hidden');
        }
    } else {
        waitMsg.classList.remove('hidden');
    }

    showScreen('screen-results');
    playSound(msg.roundWinners.length > 0 ? 'fanfare' : 'warning');
}

// ==================== НИЧЬЯ ====================

function handleTiedResults(msg) {
    var tiedEl = document.getElementById('tied-players-list');
    tiedEl.innerHTML = '';
    for (var i = 0; i < msg.tiedPlayers.length; i++) {
        var div = document.createElement('div');
        div.className = 'tied-item';
        div.textContent = msg.tiedPlayers[i].nickname;
        tiedEl.appendChild(div);
    }

    var invEl = document.getElementById('tied-investments');
    invEl.innerHTML = '<h3>💸 Инвестиции раунда</h3>';
    for (var d = 0; d < msg.investmentDetails.length; d++) {
        var detail = msg.investmentDetails[d];
        var row = document.createElement('div');
        row.className = 'inv-result-item';
        row.innerHTML =
            '<span>' + escapeHtml(detail.from) + '</span>' +
            '<span class="inv-arrow">→ ' + detail.amount + ' →</span>' +
            '<span>' + escapeHtml(detail.to) + '</span>';
        invEl.appendChild(row);
    }

    showScreen('screen-tied');
    playSound('warning');
}

// ==================== ТАЙБРЕЙКЕР ====================

function handleTiebreakerPresentation(msg) {
    var pres = msg.currentPresenter;
    document.getElementById('tb-name').textContent = pres.nickname;
    document.getElementById('tb-adj').textContent = pres.cards.adjective;
    document.getElementById('tb-item').textContent = pres.cards.item;
    document.getElementById('tb-feat').textContent = pres.cards.feature;

    var controls = document.getElementById('tb-controls');
    if (isHost) {
        controls.classList.remove('hidden');
    } else {
        controls.classList.add('hidden');
    }

    showScreen('screen-tiebreaker');
    playSound('start');

    // Стримерский режим
    var tbPitchSection = document.getElementById('tb-pitch-section');
    var tbPitchText = document.getElementById('tb-pitch-text');
    if (msg.streamerMode && pres.pitchText && pres.pitchText.trim()) {
        tbPitchSection.classList.remove('hidden');
        tbPitchText.textContent = pres.pitchText;
    } else if (msg.streamerMode) {
        tbPitchSection.classList.remove('hidden');
        tbPitchText.textContent = '';
    } else {
        tbPitchSection.classList.add('hidden');
    }
}

function handleTiebreakerVoting(msg) {
    var container = document.getElementById('tbv-players');
    container.innerHTML = '';

    for (var i = 0; i < msg.tiedPlayers.length; i++) {
        var p = msg.tiedPlayers[i];
        var isSelf = p.id === myPlayerId;
        var div = document.createElement('div');
        div.className = 'invest-item' + (isSelf ? ' is-self' : '');

        var html =
            '<div class="invest-info">' +
            '<div class="invest-name">' + escapeHtml(p.nickname) + '</div>';

        if (p.cards) {
            html +=
                '<div class="invest-cards">' +
                '<span class="tag-adj">' + escapeHtml(p.cards.adjective) + '</span>' +
                '<span class="tag-item">' + escapeHtml(p.cards.item) + '</span>' +
                '<span class="tag-feat">' + escapeHtml(p.cards.feature) + '</span>' +
                '</div>';
        }

        html += '</div>';

        if (!isSelf) {
            html +=
                '<div class="invest-input">' +
                '<label>Голос:</label>' +
                '<input type="number" class="tie-invest-amount" data-target-id="' + p.id + '" ' +
                'min="0" max="1" value="0">' +
                '</div>';
        }

        div.innerHTML = html;
        container.appendChild(div);
    }

    showScreen('screen-tiebreaker-voting');
    playSound('invest');
}

// ==================== ФИНАЛ ====================

function handleGameOver(msg) {
    currentPhase = 'gameOver';

    if (msg.bestInvestor) {
        document.getElementById('final-investor').innerHTML =
            '<div style="font-size:1.3em">' + escapeHtml(msg.bestInvestor.nickname) + '</div>' +
            '<div style="font-size:0.7em; color:var(--accent-green); margin-top:5px;">💰 ' + msg.bestInvestor.capital + ' жетонов</div>';
    } else {
        document.getElementById('final-investor').textContent = '—';
    }

    if (msg.bestEntrepreneur) {
        document.getElementById('final-entrepreneur').innerHTML =
            '<div style="font-size:1.3em">' + escapeHtml(msg.bestEntrepreneur.nickname) + '</div>' +
            '<div style="font-size:0.7em; color:var(--accent-gold); margin-top:5px;">📈 ' + msg.bestEntrepreneur.attracted + ' привлечённых</div>';
    } else {
        document.getElementById('final-entrepreneur').textContent = '—';
    }

    renderScoreboard(document.getElementById('final-scoreboard'), msg.players);

    if (isHost) {
        document.getElementById('final-controls').classList.remove('hidden');
        document.getElementById('final-wait').classList.add('hidden');
    } else {
        document.getElementById('final-controls').classList.add('hidden');
        document.getElementById('final-wait').classList.remove('hidden');
    }

    showScreen('screen-gameover');
    playSound('fanfare');
    launchConfetti();
}

// ==================== ТАБЛИЦА ЛИДЕРОВ ====================

function renderScoreboard(container, players) {
    if (!container) return;

    var sorted = players.slice().sort(function (a, b) {
        return b.capital - a.capital;
    });

    container.innerHTML =
        '<h3>📊 Таблица</h3>' +
        '<div class="scoreboard-header">' +
        '<span>Игрок</span>' +
        '<span style="text-align:center">💰 Капитал</span>' +
        '<span style="text-align:center">📈 Привлечено</span>' +
        '</div>';

    for (var i = 0; i < sorted.length; i++) {
        var p = sorted[i];
        var row = document.createElement('div');
        row.className = 'scoreboard-row' + (p.id === myPlayerId ? ' is-me' : '');

        var medal = '';
        if (i === 0) medal = '🥇 ';
        else if (i === 1) medal = '🥈 ';
        else if (i === 2) medal = '🥉 ';

        row.innerHTML =
            '<span class="sb-name">' + medal + escapeHtml(p.nickname) + (p.id === myPlayerId ? ' (Вы)' : '') + '</span>' +
            '<span class="sb-capital">' + p.capital + '</span>' +
            '<span class="sb-attracted">' + p.attractedInvestments + '</span>';
        container.appendChild(row);
    }
}

// ==================== ENTER KEY ====================

document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        var welcomeScreen = document.getElementById('screen-welcome');
        if (welcomeScreen && welcomeScreen.classList.contains('active')) {
            var codeInput = document.getElementById('room-code');
            if (codeInput && codeInput.value.trim()) {
                joinRoom();
            } else {
                createRoom();
            }
        }
    }
});

// ==================== ПРЕДОТВРАЩЕНИЕ СЛУЧАЙНОГО УХОДА ====================

window.addEventListener('beforeunload', function (e) {
    if (currentPhase !== 'welcome' && currentPhase !== 'lobby') {
        e.preventDefault();
        e.returnValue = 'Игра в процессе! Вы уверены, что хотите выйти?';
        return e.returnValue;
    }
});

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

function init() {
    initParticles();
    connectWS();

    // Активируем Audio Context при первом клике (Chrome policy)
    document.addEventListener('click', function () {
        getAudioCtx();
    }, { once: true });

    console.log('🚀 Инновационный Ширпотреб v2.0 загружен!');
}

function leaveRoom() {
    // Закрываем текущее соединение
    if (ws) {
        ws.close();
        ws = null;
    }

    // Сбрасываем состояние
    myPlayerId = null;
    myRoomCode = null;
    isHost = false;
    currentPhase = 'welcome';

    // Возвращаемся на главный экран
    showScreen('screen-welcome');
    showNotification('Вы вышли из комнаты', 'info');

    // Переподключаемся к серверу (новый playerId)
    setTimeout(function () {
        connectWS();
    }, 500);
}

// ==================== СТРИМЕРСКИЙ РЕЖИМ ====================

function onPitchTextChange() {
    var textarea = document.getElementById('prep-pitch-text');
    if (!textarea) return;
    var count = textarea.value.length;
    var counter = document.getElementById('pitch-char-count');
    if (counter) counter.textContent = count;

    // Автосохранение — отправляем на сервер
    sendPitchText();
}

function sendPitchText() {
    var textarea = document.getElementById('prep-pitch-text');
    if (!textarea) return;
    sendMsg({ type: 'updatePitchText', text: textarea.value });
}

function startPitchAutoSave() {
    stopPitchAutoSave();
    // Каждые 3 секунды автосохраняем текст на сервер
    pitchSaveInterval = setInterval(function () {
        if (currentPhase === 'preparation' && isStreamerMode) {
            sendPitchText();
        }
    }, 3000);
}

function stopPitchAutoSave() {
    if (pitchSaveInterval) {
        clearInterval(pitchSaveInterval);
        pitchSaveInterval = null;
    }
}

// Запуск
init();

