const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

// =====================================================================
// ПОЛНЫЕ КОЛОДЫ КАРТ — 60 прилагательных, 60 предметов, 60 особенностей, 50 событий
// =====================================================================

const ADJECTIVES = [
    "ЖИВОЙ",
    "ОДНОРАЗОВЫЙ",
    "НАДУВНОЙ",
    "СЪЕДОБНЫЙ",
    "БУМАЖНЫЙ",
    "ЛИПКИЙ",
    "СТЕКЛЯННЫЙ",
    "ЗУБАСТЫЙ",
    "ЖЕЛЕЙНЫЙ",
    "КРЕДИТНЫЙ",
    "КВАДРАТНЫЙ",
    "ЭЛЕКТРИЧЕСКИЙ",
    "ОДНОРАЗОВЫЙ",
    "ХЛЕБНЫЙ",
    "СОЛЕНЫЙ",
    "ГОЛОСОВОЙ",
    "СУМАСШЕДШИЙ",
    "НАКАЧАННЫЙ",
    "СНЕЖНЫЙ",
    "ТЕПЛЫЙ",
    "БЛЕСТЯЩИЙ",
    "СКАНДАЛЬНЫЙ",
    "КРИВОЙ",
    "ДЕРЕВЯННЫЙ",
    "ЗЕРКАЛЬНЫЙ",
    "ЛЕТАЮЩИЙ",
    "ЗАМОРОЖЕННЫЙ",
    "БЕСШУМНЫЙ",
    "ЗАЩИЩАЮЩИЙ",
    "ДРАГОЦЕННЫЙ",
    "ВОЛОСАТЫЙ",
    "БЕТОННЫЙ",
    "МЯСНОЙ",
    "ПЛЮШЕВЫЙ",
    "МАГИЧЕСКИЙ",
    "ШОКОЛАДНЫЙ",
    "ЭЛИТНЫЙ",
    "СЕКРЕТНЫЙ",
    "ВЯЗАНЫЙ",
    "КАРМАННЫЙ",
    "ТАНЦУЮЩИЙ",
    "ГРЯЗНЫЙ",
    "ДИКИЙ",
    "ЯДОВИТЫЙ",
    "БРУТАЛЬНЫЙ",
    "ГАЗИРОВАННЫЙ",
    "ЛЫСЫЙ",
    "ТОЛСТЫЙ",
    "ЭКОЛОГИЧНЫЙ",
    "КНОПОЧНЫЙ",
    "ЖИДКИЙ",
    "ПРОКЛЯТЫЙ",
    "ПУШИСТЫЙ",
    "ЖАРЕНЫЙ",
    "КОСМИЧЕСКИЙ",
    "БЕСЯЧИЙ",
    "ОСТРЫЙ",
    "ЧЕСНОЧНЫЙ",
    "МЕХАНИЧЕСКИЙ",
    "ЛЕНИВЫЙ"
];

const ITEMS = [
    "МАЙОНЕЗ",
    "НОСОК",
    "ПУЛЬТ",
    "ЧАЙНИК",
    "УНИТАЗ",
    "СТУЛ",
    "МОЛОТОК",
    "КЛЕЙ",
    "РЮКЗАК",
    "АВТОМОБИЛЬ",
    "ТЕЛЕФОН",
    "КЛЮЧ",
    "ДОГОВОР",
    "ХАЛАТ",
    "КОШЕЛЕК",
    "ЧЕБУРЕК",
    "МИКРОФОН",
    "ПЫЛЕСОС",
    "ЛИФТ",
    "КАКТУС",
    "СНЕГОВИК",
    "ГРАДУСНИК",
    "ШАМПУНЬ",
    "КАРАНДАШ",
    "ХОЛОДИЛЬНИК",
    "ТЕЛЕВИЗОР",
    "КАЛЕНДАРЬ",
    "ПАКЕТ",
    "ДОМОФОН",
    "СТАКАН",
    "ВЕНИК",
    "ПЕЛЬМЕНЬ",
    "ДИВАН",
    "ФОНАРЬ",
    "ЛИМУЗИН",
    "ХОМЯК",
    "ПАРИК",
    "ЦВЕТОК",
    "КОМАР",
    "КОСТЮМ",
    "МАНЕКЕН",
    "ШОКЕР",
    "АМУЛЕТ",
    "АЛМАЗ",
    "КОМПЬЮТЕР",
    "ЛАВАШ",
    "КОМПОТ",
    "ЧАЙ",
    "ТАМАГОЧИ",
    "ОБЕД",
    "УТЮГ",
    "ПАСПОРТ",
    "БИНОКЛЬ",
    "КИРПИЧ",
    "БУТЕРБРОД",
    "ОГНЕТУШИТЕЛЬ",
    "ШАРФ",
    "ТОРТ",
    "ЗОНТ",
    "БУДИЛЬНИК"
];

const FEATURES = [
    "КОТОРЫЙ БЬЕТ ТОКОМ",
    "КОТОРЫЙ МОЖЕТ ВАС РАЗБУДИТЬ",
    "КОТОРЫЙ РУГАЕТСЯ ПРИ КАСАНИИ",
    "КОТОРЫЙ ТРЕБУЕТ СОЛНЕЧНОГО СВЕТА",
    "КОТОРЫЙ ЭКОНОМИТ ВАШЕ ВРЕМЯ",
    "КОТОРЫЙ ЛЕЧИТ ЗРЕНИЕ",
    "КОТОРЫЙ СОБИРАЕТСЯ ЗА 1 МИНУТУ",
    "КОТОРЫЙ УБИВАЕТ СКУКУ",
    "КОТОРЫЙ СНИМАЕТ СТРЕСС",
    "КОТОРЫЙ УМЕЕТ ГОВОРИТЬ",
    "КОТОРЫЙ ЗАЩИЩАЕТ ОТ ВОРОВ",
    "КОТОРЫЙ МЕНЯЕТ ЦВЕТ ПО ЖЕЛАНИЮ",
    "КОТОРЫЙ ПОМОГАЕТ ЗАСНУТЬ",
    "КОТОРЫЙ ЗАМЕНЯЕТ ПОХОД В СПОРТЗАЛ",
    "КОТОРЫЙ НЕ РАБОТАЕТ ДНЕМ",
    "КОТОРЫЙ ПОМОГАЕТ ГОТОВИТЬ ЕДУ",
    "КОТОРЫЙ МОЖЕТ ПОДБОДРИТЬ ВАС",
    "КОТОРЫЙ УБИРАЕТ МУСОР",
    "КОТОРЫЙ УБИВАЕТ КОМАРОВ",
    "КОТОРЫЙ ПОДДЕРЖИВАЕТ ЗОЖ",
    "КОТОРЫЙ УМЕНЬШАЕТСЯ СО ВРЕМЕНЕМ",
    "КОТОРЫЙ ШЕПЧЕТ НА УХО",
    "КОТОРЫЙ ВЫТЯГИВАЕТ ИЗ ВАС СИЛЫ",
    "КОТОРЫЙ МОЖЕТ ПОМОЧЬ В РЕМОНТЕ",
    "КОТОРЫЙ УБИВАЕТ 100% МИКРОБОВ",
    "КОТОРЫЙ ИЗДАЕТ ЗВУК СИГНАЛИЗАЦИИ",
    "КОТОРЫЙ МОЖЕТ ПОМОЧЬ С ИЗУЧЕНИЕМ КНИГ",
    "КОТОРЫЙ ДЕЛАЕТ ЕДУ СЛАЩЕ",
    "КОТОРЫЙ ПОМОГАЕТ БРОСИТЬ ЗАВИСИМОСТИ",
    "КОТОРЫЙ ЗАМЕНЯЕТ ОБЩЕНИЕ С ЧЕЛОВЕКОМ",
    "КОТОРЫЙ ТРЕБУЕТ ДОПОЛНИТЕЛЬНЫХ ВЛОЖЕНИЙ ДЛЯ СТАРТА РАБОТЫ",
    "КОТОРЫЙ ПРЕДСКАЗЫВАЕТ БУДУЩЕЕ (НО ВСЕГДА ВРЕТ)",
    "КОТОРЫЙ ЖИВЕТ СВОЕЙ ЖИЗНЬЮ",
    "КОТОРЫЙ БЛОКИРУЕТ ЗВОНКИ ОТ СПАМЕРОВ И КОЛЛЕКТОРОВ",
    "КОТОРЫЙ НИКОГДА НЕ ПАЧКАЕТСЯ И НЕ ЛОМАЕТСЯ",
    "КОТОРЫЙ НАХОДИТ ПОТЕРЯННЫЕ ВЕЩИ",
    "КОТОРЫЙ ПРИНОСИТ УДАЧУ",
    "КОТОРЫЙ ЯВЛЯЕТСЯ ВХОДНЫМ БИЛЕТОМ В ТОП-ПРОФЕССИИ",
    "КОТОРЫЙ ЗАЩИЩАЕТ ОТ ТРАВЛИ В ИНТЕРНЕТЕ",
    "КОТОРЫЙ ВЫГЛЯДИТ ОЧЕНЬ ДОРОГО И БОГАТО",
    "КОТОРЫЙ ГАРАНТИРУЕТ УСПЕХ У ПРОТИВОПОЛОЖНОГО ПОЛА",
    "КОТОРЫЙ ИЗДАЕТ ЗВУКИ ХРАПА НОЧЬЮ",
    "КОТОРЫЙ МОЖЕТ СПАСТИ ЖИЗНЬ",
    "КОТОРЫЙ ПОЗВОЛЯЕТ ПОНЯТЬ НАМЕРЕНИЯ ОКРУЖАЮЩИХ",
    "КОТОРЫЙ МОТИВИРУЕТ ВАС К УСПЕХУ",
    "КОТОРЫЙ МОЖНО НАДЕТЬ НА ГОЛОВУ",
    "КОТОРЫЙ ДОБАВЛЯЕТ +100 К ВАШЕЙ ХАРИЗМЕ",
    "КОТОРЫЙ ПУГАЕТ ГОЛУБЕЙ И ДЕТЕЙ",
    "КОТОРЫЙ НА ВКУС КАК ПЕРЕЦ",
    "КОТОРЫЙ ЗАМЕНЯЕТ ПОХОД К ВРАЧУ",
    "КОТОРЫЙ ЗАМЕНЯЕТ ШКОЛУ",
    "КОТОРЫЙ ОБИЖАЕТСЯ, ЕСЛИ ИМ ДОЛГО НЕ ПОЛЬЗУЮТСЯ",
    "КОТОРЫЙ МОЖНО СЪЕСТЬ В СЛУЧАЕ КРАЙНЕЙ НЕОБХОДИМОСТИ",
    "КОТОРЫЙ УЛУЧШАЕТ ВАШ ГОЛОС",
    "КОТОРЫЙ ОТКЛЮЧАЕТСЯ ПО ТАЙМЕРУ",
    "КОТОРЫЙ ЗАЩИЩАЕТ ОТ НЕПОГОДЫ",
    "КОТОРЫЙ ПОДАВЛЯЕТ ШУМ ВОКРУГ",
    "КОТОРЫЙ ТРЕБУЕТ ОТПЕЧАТОК ПАЛЬЦА ДЛЯ РАБОТЫ",
    "КОТОРЫЙ ВЫЗЫВАЕТ СМЕХ",
    "КОТОРЫЙ ПОМОГАЕТ ПЕРЕСТАТЬ ГРУСТИТЬ"
];

const EVENTS = [
    "Ваша целевая аудитория — дети от 3 до 10 лет. Ваш товар каким-то образом должен быть привлекателен для них.",
    "Ваш продукт продается только государству. Презентуйте продукт — фокусируясь на том, что государство получит приобретя его?",
    "Ваша целевая аудитория — пожилые люди 80+ лет. Ваш товар каким-то образом должен решать их потребности.",
    "Ваш продукт был выпущен в ограниченном тираже (всего 10 штук на весь мир). Обыграйте лимитированность/редкость продукта.",
    "Ваш продукт — наполовину бракованный. Его действие (карточка «особенность») срабатывает лишь в 50% случаев. Как вы выйдете из этой ситуации?",
    "Ваш продукт очень полезен в определенное время года. В какое именно? Как и чем он полезен?",
    "Ваш продукт случайно получился в 10 раз больше запланированного размера. Он не помещается в квартиру. Найдите в этом ценность.",
    "Ваша целевая аудитория — домашние животные. Вы презентуете продукт для зоомагазина. Какую проблему питомцев он решает?",
    "В стране экономический кризис. Люди экономят на всем. Ваш продукт стоит в 5 раз дороже среднего аналога. Обоснуйте, почему предприниматели, несмотря на кризис, должны вложиться в вас.",
    "Известно, что ваш продукт запретили в 20 странах мира по каким-то причинам. Почему его запретили и как эта «изюминка» может быть полезна при презентации продукта?",
    "Ваш продукт доступен только в аренду, полностью выкупить его нельзя. Как вы выкрутитесь из такой ситуации и навяжете аренду своему продукту?",
    "Ваш продукт можно покупать только ночью и только в промежутке с 0:00 до 3:00. Почему именно ночью вы хотите или можете продавать товар?",
    "Ваш продукт через месяц после покупки становится в 2 раза лучше, но первый месяц работает ужасно. Как вы объясните это инвесторам?",
    "Ваш продукт создает сильную зависимость — люди не могут перестать им пользоваться! Какую именно зависимость он формирует и приятна ли она для инвесторов?",
    "Ваш продукт — идеальный по функционалу, но есть одно маленькое НО: он просто отвратительный по внешнему виду, что люди говорят «фу» при его виде. Как вы преодолеете такой барьер — убедив инвесторов вложиться в это?",
    "Ваш продукт требует инструкцию на 200 страниц. Без нее невозможно разобраться, как им пользоваться. О какой ключевой вещи будет эта инструкция и почему несмотря на это — в вас должны вложиться?",
    "Ваша целевая аудитория — учителя школ. Ваш продукт должен как-то облегчить их работу или сделать уроки интереснее. Как именно?",
    "Ваш продукт позиционирует себя как прекрасный подарок на праздник (неважно какой). Почему же его можно считать «подарком»?",
    "Ой-ой! Всем продуктам обязательно нужно иметь товарный знак, иначе рынка не видать! Какое название вы придумаете к своему продукту, чтобы быть уникальными и при этом — чтобы в вас вложились?",
    "Продукт не предназначен для использования всего одним человеком (например, онлайн-игра или палатка, где обязательно нужен второй для крепежа). До скольких людей предназначен ваш продукт? Чем он будет выгоден инвесторам?",
    "Ваша целевая аудитория — люди с фобией (боязнью). Чего они боятся и как ваш продукт минимизирует их страх?",
    "Ваш продукт весит всего 1 грамм. Он почти невесомый и практически незаметный. Как вы убедите инвесторов, что за такую легкую вещь стоит платить?",
    "Для работы вашего продукта обязательно нужно приобрести две единицы его. Почему это так и чем это выгодно для инвесторов?",
    "Ваш товар позиционируется как отличный способ отомстить своему врагу. Каким образом продукт может испортить жизнь недругу?",
    "Правительство оценило инновационность продукта и теперь хочет использовать ваш продукт в школьной программе. Но вам нужно объяснить — чему именно он научит детей?",
    "Ваш продукт предназначен для использования в экстремальных ситуациях (например, землетрясение и т.п.). В какой экстремальной ситуации ваш продукт используется и как он в ней помогает?",
    "Ваш продукт имеет предостережение: «Хранить в недоступном от детей месте». Почему его обязательно нужно прятать?",
    "Ваша целевая аудитория — роботы и Искусственный Интеллект. Это не шутка — машинам тоже нужны решения! Ваш товар каким-то образом должен решать их потребности.",
    "Ваш продукт позиционирует себя как неотъемлемый инструмент для профессии (например, стетоскоп — для доктора). Для какой профессии — ваш продукт и как он улучшает её?",
    "Ваш продукт оказался идеальным антистрессом. Люди покупают его — чтобы успокоиться. Как именно продукт успокаивает потребителей?",
    "Ваша целевая аудитория — миллионеры, которые уже имеют все. Им ничего не нужно. У них 50 машин, 10 домов, 3 яхты. Зачем им ваш продукт?",
    "Ваш продукт позиционирует себя как идеальная вещь для свидания с противоположным полом. Чем он может быть полезен на свидании?",
    "Чтобы приобрести ваш продукт — клиент дополнительно должен пройти ваш тест из 10 вопросов. К чему такие сложности и почему это увеличивает ценность продукта?",
    "Ваш товар имеет легенду, что давным давно когда-то в истории именно благодаря нему получилось что-то невероятное. Как именно в истории он помог?",
    "Ваш продукт имеет особенность при покупке. Потребитель должен ожидать 6 месяцев — прежде чем получит ваш товар. Почему так долго нужно ждать?",
    "Ваш продукт запрещено использовать в помещении. Его можно использовать только на улице, только на открытом воздухе. Почему ваш продукт «уличный»?",
    "Ваш продукт может быть куплен только анонимно. Ни имени, ни адреса, ни чека. Никто никогда не отследит, что потребитель его купил. Почему продукт покупается так «тайно»? (товар должен быть законодательно разрешен!)",
    "Ваш продукт существует только в цифровом виде. Как именно тогда он работает и почему это должно быть ценно для инвесторов?",
    "Ваш продукт имеет встроенный таймер обратного отсчёта. При покупке на нем написано: «осталось 7 дней, 30 дней или 365 дней». Сколько дней будет на таймере вашего продукта и что произойдёт — когда таймер достигнет нуля?",
    "Ваш продукт в магазинах обязательно находится рядом с отделом определенной еды. С какой едой находится ваш продукт и почему с ней?",
    "Ваш продукт нацелен на экономных людей, которые обычно очень редко что-то покупают. Почему именно ваш продукт — тот, на который человек не пожалеет потратить свои деньги?",
    "Ваш продукт дополняет модную вещь на сегодняшний день. Какой именно тренд он дополняет и как?",
    "Ваша целевая аудитория — люди, которые только что пережили неудачу. Провалили экзамен, потеряли работу, расстались и т.п. Как именно ваш продукт им поможет «подняться» и не грустить?",
    "Известно, что с вашим продуктом запрещено быть в общественных местах (торговые центры, парки и т.п.) — иначе грозит серьезный штраф. Почему товар запрещен и почему он все равно ценен для инвесторов?",
    "Ваша целевая аудитория — люди, которые живут в деревне. Ваш товар каким-то образом должен решать их потребности.",
    "Чтобы ваш продукт заработал — потребителю обязательно нужно купить что-то еще. Что именно нужно приобрести дополнительно и почему ваш продукт тогда будет работать?",
    "Политика вашего бизнеса — оптовая продажа продукции. Вы продаете не поштучно — а сразу 10 штук клиенту. Зачем потребителю так много продукции?",
    "Для работы вашего продукта обязательно нужно приобрести две единицы его. Почему это так и чем это выгодно для инвесторов?",
    "Ваш продукт позиционирует себя как отличное B2B-решение (товар для бизнеса). Как именно он может помочь другому бизнесу?",
    "Покупка вашего продукта дополнительно дает клиенту целый месяц подписки в закрытый чат соц-сети. Зачем нужен этот закрытый чат и как он улучшает ваш продукт?"
];

// =====================================================================
// ИГРОВЫЕ КОМНАТЫ
// =====================================================================

const rooms = new Map();
const playerRooms = new Map(); // ws -> { roomCode, playerId }

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function mapToObj(map) {
    const obj = {};
    map.forEach((val, key) => { obj[key] = val; });
    return obj;
}

function createRoom(hostId, settings) {
    let code;
    do { code = generateRoomCode(); } while (rooms.has(code));

    const room = {
        code,
        hostId,
        settings: {
            rounds: Math.min(10, Math.max(1, parseInt(settings.rounds) || 3)),
            startCapital: Math.min(30, Math.max(3, parseInt(settings.startCapital) || 10)),
            useEvents: !!settings.useEvents,
            prepTime: Math.min(600, Math.max(10, parseInt(settings.prepTime) || 120)),
            presentTime: Math.min(600, Math.max(10, parseInt(settings.presentTime) || 120)),
            investTime: Math.min(600, Math.max(10, parseInt(settings.investTime) || 60)),
        },
        players: new Map(),
        state: 'lobby',
        currentRound: 0,
        totalRounds: Math.min(10, Math.max(1, parseInt(settings.rounds) || 3)),
        decks: {
            adjectives: shuffle(ADJECTIVES),
            items: shuffle(ITEMS),
            features: shuffle(FEATURES),
            events: shuffle(EVENTS),
        },
        currentEvent: null,
        presentationOrder: [],
        currentPresenterIndex: 0,
        investments: new Map(),
        timer: null,
        timerEnd: null,
        roundHistory: [],
        tiedPlayers: [],
        tieInvestments: new Map(),
        tieRoundInvestments: null,
        tieInvestmentDetails: null,
        tieOriginalInvestments: null,
        autoFinalTimer: null,
    };
    rooms.set(code, room);
    return room;
}

function addPlayer(room, playerId, nickname, ws) {
    room.players.set(playerId, {
        id: playerId,
        nickname,
        ws,
        capital: room.settings.startCapital,
        attractedInvestments: 0,
        cards: null,
        connected: true,
        isHost: room.hostId === playerId,
    });
}

function broadcastToRoom(room, message) {
    const msg = JSON.stringify(message);
    room.players.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN && player.connected) {
            try { player.ws.send(msg); } catch (e) { /* ignore */ }
        }
    });
}

function sendToPlayer(room, playerId, message) {
    const player = room.players.get(playerId);
    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) {
        try { player.ws.send(JSON.stringify(message)); } catch (e) { /* ignore */ }
    }
}

function getPlayersPublicInfo(room) {
    const players = [];
    room.players.forEach(p => {
        players.push({
            id: p.id,
            nickname: p.nickname,
            capital: p.capital,
            attractedInvestments: p.attractedInvestments,
            isHost: p.isHost,
            connected: p.connected,
        });
    });
    return players;
}

function getLobbyState(room) {
    return {
        type: 'lobbyUpdate',
        roomCode: room.code,
        players: getPlayersPublicInfo(room),
        settings: room.settings,
        canStart: room.players.size >= 3,
    };
}

function startTimer(room, seconds, callback) {
    clearTimer(room);
    room.timerEnd = Date.now() + seconds * 1000;
    broadcastToRoom(room, {
        type: 'timerStart',
        duration: seconds,
        endsAt: room.timerEnd,
    });
    room.timer = setTimeout(() => {
        room.timer = null;
        callback();
    }, seconds * 1000);
}

function clearTimer(room) {
    if (room.timer) {
        clearTimeout(room.timer);
        room.timer = null;
    }
    room.timerEnd = null;
}

// =====================================================================
// ФАЗЫ ИГРЫ
// =====================================================================

function startGame(room) {
    room.currentRound = 0;
    room.totalRounds = room.settings.rounds;
    room.roundHistory = [];
    room.players.forEach(p => {
        p.capital = room.settings.startCapital;
        p.attractedInvestments = 0;
    });

    broadcastToRoom(room, {
        type: 'gameStarted',
        players: getPlayersPublicInfo(room),
        settings: room.settings,
        totalRounds: room.totalRounds,
    });

    setTimeout(() => { startNewRound(room); }, 2000);
}

function startNewRound(room) {
    room.currentRound++;
    room.state = 'preparation';
    room.investments.clear();
    room.tiedPlayers = [];
    room.tieInvestments.clear();

    // Событие раунда
    if (room.settings.useEvents && room.decks.events.length > 0) {
        room.currentEvent = room.decks.events.pop();
    } else if (room.settings.useEvents && room.decks.events.length === 0) {
        // Перемешиваем заново
        room.decks.events = shuffle(EVENTS);
        room.currentEvent = room.decks.events.pop();
    } else {
        room.currentEvent = null;
    }

    // Раздаём карты
    room.players.forEach(p => {
        if (room.decks.adjectives.length === 0) room.decks.adjectives = shuffle(ADJECTIVES);
        if (room.decks.items.length === 0) room.decks.items = shuffle(ITEMS);
        if (room.decks.features.length === 0) room.decks.features = shuffle(FEATURES);

        p.cards = {
            adjective: room.decks.adjectives.pop(),
            item: room.decks.items.pop(),
            feature: room.decks.features.pop(),
        };
    });

    // Рандомный порядок презентаций
    const playerIds = [];
    room.players.forEach(p => playerIds.push(p.id));
    room.presentationOrder = shuffle(playerIds);
    room.currentPresenterIndex = 0;

    // Каждому отправляем его карты
    room.players.forEach(p => {
        sendToPlayer(room, p.id, {
            type: 'roundStart',
            round: room.currentRound,
            totalRounds: room.totalRounds,
            yourCards: p.cards,
            event: room.currentEvent,
            phase: 'preparation',
            players: getPlayersPublicInfo(room),
            presentationOrder: room.presentationOrder.map(id => {
                const pl = room.players.get(id);
                return { id, nickname: pl ? pl.nickname : '???' };
            }),
            prepTime: room.settings.prepTime,
        });
    });

    startTimer(room, room.settings.prepTime, () => {
        startPresentations(room);
    });
}

function startPresentations(room) {
    room.state = 'presentation';
    room.currentPresenterIndex = 0;
    showCurrentPresenter(room);
}

function showCurrentPresenter(room) {
    if (room.currentPresenterIndex >= room.presentationOrder.length) {
        startInvesting(room);
        return;
    }

    const presenterId = room.presentationOrder[room.currentPresenterIndex];
    const presenter = room.players.get(presenterId);
    if (!presenter) {
        room.currentPresenterIndex++;
        showCurrentPresenter(room);
        return;
    }

    // Карточки всех, кто уже выступил
    const previousPresentations = [];
    for (let i = 0; i < room.currentPresenterIndex; i++) {
        const prevId = room.presentationOrder[i];
        const prevPlayer = room.players.get(prevId);
        if (prevPlayer) {
            previousPresentations.push({
                id: prevId,
                nickname: prevPlayer.nickname,
                cards: prevPlayer.cards,
            });
        }
    }

    broadcastToRoom(room, {
        type: 'presentationPhase',
        phase: 'presentation',
        currentPresenter: {
            id: presenterId,
            nickname: presenter.nickname,
            cards: presenter.cards,
        },
        presenterIndex: room.currentPresenterIndex,
        totalPresenters: room.presentationOrder.length,
        previousPresentations,
        event: room.currentEvent,
        presentTime: room.settings.presentTime,
        round: room.currentRound,
        totalRounds: room.totalRounds,
    });

    startTimer(room, room.settings.presentTime, () => {
        nextPresenter(room);
    });
}

function nextPresenter(room) {
    clearTimer(room);
    room.currentPresenterIndex++;
    showCurrentPresenter(room);
}

function startInvesting(room) {
    room.state = 'investing';
    room.investments.clear();

    const allPresentations = room.presentationOrder.map(id => {
        const p = room.players.get(id);
        return p ? { id, nickname: p.nickname, cards: p.cards } : null;
    }).filter(Boolean);

    broadcastToRoom(room, {
        type: 'investingPhase',
        phase: 'investing',
        players: getPlayersPublicInfo(room),
        presentations: allPresentations,
        event: room.currentEvent,
        investTime: room.settings.investTime,
        round: room.currentRound,
        totalRounds: room.totalRounds,
    });

    startTimer(room, room.settings.investTime, () => {
        processInvestments(room);
    });
}

function processInvestments(room) {
    clearTimer(room);
    room.state = 'roundResults';

    const roundInvestments = new Map();
    room.players.forEach(p => roundInvestments.set(p.id, 0));

    const investmentDetails = [];
    const validatedInvestments = new Map();

    // Валидация
    room.investments.forEach((investData, investorId) => {
        const investor = room.players.get(investorId);
        if (!investor) return;

        let totalSpent = 0;
        const valid = [];

        for (const inv of investData) {
            if (inv.targetId === investorId) continue;
            if (!room.players.has(inv.targetId)) continue;
            if (inv.amount <= 0) continue;
            totalSpent += inv.amount;
            valid.push(inv);
        }

        if (totalSpent <= investor.capital) {
            validatedInvestments.set(investorId, valid);
        }
    });

    // Подсчёт
    validatedInvestments.forEach((investData, investorId) => {
        const investor = room.players.get(investorId);
        investData.forEach(inv => {
            roundInvestments.set(inv.targetId, (roundInvestments.get(inv.targetId) || 0) + inv.amount);
            investmentDetails.push({
                from: investor.nickname,
                fromId: investorId,
                to: room.players.get(inv.targetId).nickname,
                toId: inv.targetId,
                amount: inv.amount,
            });
        });
    });

    room.investments = validatedInvestments;

    // Определяем победителя раунда
    let maxInv = 0;
    roundInvestments.forEach(val => { if (val > maxInv) maxInv = val; });

    const roundWinners = [];
    if (maxInv > 0) {
        roundInvestments.forEach((val, id) => {
            if (val === maxInv) roundWinners.push(id);
        });
    }

    // Ничья?
    if (roundWinners.length > 1) {
        room.tiedPlayers = roundWinners;
        room.tieRoundInvestments = roundInvestments;
        room.tieInvestmentDetails = investmentDetails;
        room.tieOriginalInvestments = new Map(room.investments);

        broadcastToRoom(room, {
            type: 'roundResultsTied',
            phase: 'tiebreaker_announce',
            round: room.currentRound,
            totalRounds: room.totalRounds,
            investmentDetails,
            roundInvestments: mapToObj(roundInvestments),
            tiedPlayers: roundWinners.map(id => ({
                id,
                nickname: room.players.get(id) ? room.players.get(id).nickname : '???',
            })),
            players: getPlayersPublicInfo(room),
        });

        startTimer(room, 12, () => { startTiebreaker(room); });
        return;
    }

    finalizeRound(room, roundWinners, roundInvestments, investmentDetails);
}

function startTiebreaker(room) {
    room.state = 'tiebreaker';
    room.currentPresenterIndex = 0;
    room.tieInvestments.clear();

    broadcastToRoom(room, {
        type: 'tiebreakerStart',
        phase: 'tiebreaker',
        tiedPlayers: room.tiedPlayers.map(id => {
            const p = room.players.get(id);
            return p ? { id, nickname: p.nickname, cards: p.cards } : null;
        }).filter(Boolean),
        presentTime: 60,
    });

    showTiebreakerPresenter(room);
}

function showTiebreakerPresenter(room) {
    if (room.currentPresenterIndex >= room.tiedPlayers.length) {
        startTiebreakerVoting(room);
        return;
    }

    const presenterId = room.tiedPlayers[room.currentPresenterIndex];
    const presenter = room.players.get(presenterId);
    if (!presenter) {
        room.currentPresenterIndex++;
        showTiebreakerPresenter(room);
        return;
    }

    broadcastToRoom(room, {
        type: 'tiebreakerPresentation',
        currentPresenter: {
            id: presenterId,
            nickname: presenter.nickname,
            cards: presenter.cards,
        },
        presenterIndex: room.currentPresenterIndex,
        totalPresenters: room.tiedPlayers.length,
        presentTime: 60,
    });

    startTimer(room, 60, () => {
        room.currentPresenterIndex++;
        showTiebreakerPresenter(room);
    });
}

function startTiebreakerVoting(room) {
    room.state = 'tiebreaker_voting';
    room.tieInvestments.clear();

    broadcastToRoom(room, {
        type: 'tiebreakerVoting',
        phase: 'tiebreaker_voting',
        tiedPlayers: room.tiedPlayers.map(id => {
            const p = room.players.get(id);
            return p ? { id, nickname: p.nickname, cards: p.cards } : null;
        }).filter(Boolean),
        investTime: 45,
        players: getPlayersPublicInfo(room),
    });

    startTimer(room, 45, () => { processTiebreaker(room); });
}

function processTiebreaker(room) {
    clearTimer(room);

    const tieResults = new Map();
    room.tiedPlayers.forEach(id => tieResults.set(id, 0));

    room.tieInvestments.forEach((investData, investorId) => {
        investData.forEach(inv => {
            if (room.tiedPlayers.includes(inv.targetId) && inv.targetId !== investorId) {
                tieResults.set(inv.targetId, (tieResults.get(inv.targetId) || 0) + inv.amount);
            }
        });
    });

    let maxTie = 0;
    tieResults.forEach(val => { if (val > maxTie) maxTie = val; });

    const tieWinners = [];
    if (maxTie > 0) {
        tieResults.forEach((val, id) => { if (val === maxTie) tieWinners.push(id); });
    }

    const roundInvestments = room.tieRoundInvestments;
    const investmentDetails = room.tieInvestmentDetails;

    if (tieWinners.length === 1) {
        finalizeRound(room, tieWinners, roundInvestments, investmentDetails);
    } else {
        // Все тайд — со-победители
        finalizeRound(room, room.tiedPlayers, roundInvestments, investmentDetails);
    }
}

function finalizeRound(room, roundWinners, roundInvestments, investmentDetails) {
    clearTimer(room);
    room.state = 'roundResults';

    // 1) Инвесторы платят
    room.investments.forEach((investData, investorId) => {
        const investor = room.players.get(investorId);
        if (!investor) return;
        let totalSpent = 0;
        investData.forEach(inv => { totalSpent += inv.amount; });
        investor.capital -= totalSpent;
    });

    // 2) Привлечённые инвестиции — в счётчик
    roundInvestments.forEach((amount, playerId) => {
        const player = room.players.get(playerId);
        if (player) player.attractedInvestments += amount;
    });

    // 3) x2 для инвесторов победителя
    const luckyInvestors = [];
    if (roundWinners.length > 0) {
        room.investments.forEach((investData, investorId) => {
            investData.forEach(inv => {
                if (roundWinners.includes(inv.targetId) && inv.amount > 0) {
                    const investor = room.players.get(investorId);
                    if (!investor) return;
                    const reward = inv.amount * 2;
                    investor.capital += reward;
                    luckyInvestors.push({
                        investorId,
                        investorName: investor.nickname,
                        targetId: inv.targetId,
                        targetName: room.players.get(inv.targetId) ? room.players.get(inv.targetId).nickname : '???',
                        invested: inv.amount,
                        reward,
                    });
                }
            });
        });
    }

    // 4) Банкроты получают 1
    room.players.forEach(p => {
        if (p.capital <= 0) p.capital = 1;
    });

    // Сохраняем историю
    room.roundHistory.push({
        round: room.currentRound,
        winners: roundWinners.map(id => {
            const p = room.players.get(id);
            return p ? p.nickname : '???';
        }),
        investmentDetails,
        luckyInvestors,
    });

    const isLastRound = room.currentRound >= room.totalRounds;

    broadcastToRoom(room, {
        type: 'roundResults',
        phase: 'roundResults',
        round: room.currentRound,
        totalRounds: room.totalRounds,
        investmentDetails,
        roundInvestments: mapToObj(roundInvestments),
        roundWinners: roundWinners.map(id => ({
            id,
            nickname: room.players.get(id) ? room.players.get(id).nickname : '???',
        })),
        luckyInvestors,
        players: getPlayersPublicInfo(room),
        isLastRound,
    });

    if (isLastRound) {
        room.autoFinalTimer = setTimeout(() => {
            if (room.state === 'roundResults') showFinalResults(room);
        }, 60000);
    }
}

function showFinalResults(room) {
    if (room.autoFinalTimer) {
        clearTimeout(room.autoFinalTimer);
        room.autoFinalTimer = null;
    }

    room.state = 'gameOver';
    const players = getPlayersPublicInfo(room);

    let bestInvestor = null, maxCapital = -1;
    let bestEntrepreneur = null, maxAttracted = -1;

    players.forEach(p => {
        if (p.capital > maxCapital) { maxCapital = p.capital; bestInvestor = p; }
        if (p.attractedInvestments > maxAttracted) { maxAttracted = p.attractedInvestments; bestEntrepreneur = p; }
    });

    broadcastToRoom(room, {
        type: 'gameOver',
        phase: 'gameOver',
        players,
        bestInvestor: bestInvestor ? { nickname: bestInvestor.nickname, capital: bestInvestor.capital } : null,
        bestEntrepreneur: bestEntrepreneur ? { nickname: bestEntrepreneur.nickname, attracted: bestEntrepreneur.attractedInvestments } : null,
        roundHistory: room.roundHistory,
    });
}

// =====================================================================
// WEBSOCKET ОБРАБОТЧИК
// =====================================================================

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    console.log(`[+] Player connected: ${playerId.substring(0, 8)}`);

    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', (data) => {
        let msg;
        try { msg = JSON.parse(data.toString()); } catch (e) { return; }

        switch (msg.type) {
            // ==================== СОЗДАНИЕ КОМНАТЫ ====================
            case 'createRoom': {
                const nickname = (msg.nickname || '').trim().substring(0, 20);
                if (!nickname) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Введите никнейм!' }));
                    return;
                }
                const room = createRoom(playerId, msg.settings || {});
                addPlayer(room, playerId, nickname, ws);
                playerRooms.set(ws, { roomCode: room.code, playerId });

                ws.send(JSON.stringify({ type: 'roomCreated', roomCode: room.code, playerId }));
                broadcastToRoom(room, getLobbyState(room));
                console.log(`[ROOM] ${room.code} created by "${nickname}"`);
                break;
            }

            // ==================== ВХОД В КОМНАТУ ====================
            case 'joinRoom': {
                const nickname = (msg.nickname || '').trim().substring(0, 20);
                if (!nickname) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Введите никнейм!' }));
                    return;
                }
                const code = (msg.roomCode || '').toUpperCase().trim();
                const room = rooms.get(code);
                if (!room) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Комната «' + code + '» не найдена. Проверьте код.' }));
                    return;
                }
                if (room.state !== 'lobby') {
                    ws.send(JSON.stringify({ type: 'error', message: 'Игра в этой комнате уже началась.' }));
                    return;
                }
                if (room.players.size >= 8) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Комната заполнена (максимум 8 игроков).' }));
                    return;
                }
                let nickTaken = false;
                room.players.forEach(p => {
                    if (p.nickname.toLowerCase() === nickname.toLowerCase()) nickTaken = true;
                });
                if (nickTaken) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Никнейм «' + nickname + '» уже занят в этой комнате.' }));
                    return;
                }

                addPlayer(room, playerId, nickname, ws);
                playerRooms.set(ws, { roomCode: room.code, playerId });

                ws.send(JSON.stringify({ type: 'roomJoined', roomCode: room.code, playerId }));
                broadcastToRoom(room, getLobbyState(room));
                console.log(`[JOIN] "${nickname}" joined ${code}`);
                break;
            }

            // ==================== НАСТРОЙКИ ====================
            case 'updateSettings': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.hostId !== info.playerId || room.state !== 'lobby') return;

                const s = msg.settings || {};
                if (s.rounds !== undefined) room.settings.rounds = Math.min(10, Math.max(1, parseInt(s.rounds) || 3));
                if (s.startCapital !== undefined) room.settings.startCapital = Math.min(30, Math.max(3, parseInt(s.startCapital) || 10));
                if (s.useEvents !== undefined) room.settings.useEvents = !!s.useEvents;
                if (s.prepTime !== undefined) room.settings.prepTime = Math.min(600, Math.max(10, parseInt(s.prepTime) || 120));
                if (s.presentTime !== undefined) room.settings.presentTime = Math.min(600, Math.max(10, parseInt(s.presentTime) || 120));
                if (s.investTime !== undefined) room.settings.investTime = Math.min(600, Math.max(10, parseInt(s.investTime) || 60));
                room.totalRounds = room.settings.rounds;

                broadcastToRoom(room, getLobbyState(room));
                break;
            }

            // ==================== СТАРТ ИГРЫ ====================
            case 'startGame': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.hostId !== info.playerId || room.state !== 'lobby') return;
                if (room.players.size < 3) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Нужно минимум 3 игрока!' }));
                    return;
                }
                console.log(`[GAME] Starting in room ${room.code} with ${room.players.size} players`);
                startGame(room);
                break;
            }

            // ==================== СЛЕДУЮЩИЙ ПРЕЗЕНТЕР ====================
            case 'nextPresenter': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.state !== 'presentation') return;
                const currentPresenterId = room.presentationOrder[room.currentPresenterIndex];
                if (info.playerId !== room.hostId && info.playerId !== currentPresenterId) return;
                nextPresenter(room);
                break;
            }

            // ==================== ИНВЕСТИЦИИ ====================
            case 'submitInvestment': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.state !== 'investing') return;

                const player = room.players.get(info.playerId);
                if (!player) return;

                const investments = msg.investments || [];
                let total = 0;
                const validInvestments = [];

                for (const inv of investments) {
                    const amount = parseInt(inv.amount) || 0;
                    if (amount > 0 && inv.targetId !== info.playerId && room.players.has(inv.targetId)) {
                        validInvestments.push({ targetId: inv.targetId, amount });
                        total += amount;
                    }
                }

                if (total > player.capital) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Недостаточно капитала! У вас ' + player.capital + ', пытаетесь вложить ' + total }));
                    return;
                }

                room.investments.set(info.playerId, validInvestments);
                ws.send(JSON.stringify({ type: 'investmentAccepted', total }));

                broadcastToRoom(room, {
                    type: 'investmentProgress',
                    voted: room.investments.size,
                    total: room.players.size,
                });
                break;
            }

            // ==================== ТАЙБРЕЙКЕР ГОЛОСОВАНИЕ ====================
            case 'submitTieInvestment': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.state !== 'tiebreaker_voting') return;

                const investments = msg.investments || [];
                const validInvestments = [];
                for (const inv of investments) {
                    const amount = parseInt(inv.amount) || 0;
                    if (amount > 0 && room.tiedPlayers.includes(inv.targetId) && inv.targetId !== info.playerId) {
                        validInvestments.push({ targetId: inv.targetId, amount });
                    }
                }
                room.tieInvestments.set(info.playerId, validInvestments);
                ws.send(JSON.stringify({ type: 'tieInvestmentAccepted' }));

                broadcastToRoom(room, {
                    type: 'tieVoteProgress',
                    voted: room.tieInvestments.size,
                    total: room.players.size,
                });
                break;
            }

            // ==================== СЛЕДУЮЩИЙ РАУНД ====================
            case 'nextRound': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.hostId !== info.playerId || room.state !== 'roundResults') return;

                if (room.currentRound >= room.totalRounds) {
                    showFinalResults(room);
                } else {
                    startNewRound(room);
                }
                break;
            }

            // ==================== ТАЙБРЕЙКЕР — СЛЕДУЮЩИЙ ====================
            case 'nextTiebreakerPresenter': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.state !== 'tiebreaker') return;
                if (info.playerId !== room.hostId) return;
                clearTimer(room);
                room.currentPresenterIndex++;
                showTiebreakerPresenter(room);
                break;
            }

            // ==================== ИГРАТЬ ЗАНОВО ====================
            case 'playAgain': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.hostId !== info.playerId) return;

                room.state = 'lobby';
                room.currentRound = 0;
                room.roundHistory = [];
                room.decks = {
                    adjectives: shuffle(ADJECTIVES),
                    items: shuffle(ITEMS),
                    features: shuffle(FEATURES),
                    events: shuffle(EVENTS),
                };
                room.players.forEach(p => {
                    p.capital = room.settings.startCapital;
                    p.attractedInvestments = 0;
                    p.cards = null;
                });
                broadcastToRoom(room, getLobbyState(room));
                break;
            }

            // ==================== ПРОПУСК ТАЙМЕРА (хост) ====================
            case 'skipTimer': {
                const info = playerRooms.get(ws);
                if (!info) return;
                const room = rooms.get(info.roomCode);
                if (!room || room.hostId !== info.playerId) return;
                // Принудительно срабатывает текущий таймер
                if (room.timer) {
                    clearTimeout(room.timer);
                    room.timer = null;
                    // Определяем, что делать по текущей фазе
                    switch (room.state) {
                        case 'preparation':
                            startPresentations(room);
                            break;
                        case 'investing':
                            processInvestments(room);
                            break;
                    }
                }
                break;
            }
        }
    });

    // ==================== ОТКЛЮЧЕНИЕ ====================
    ws.on('close', () => {
        const info = playerRooms.get(ws);
        if (info) {
            const room = rooms.get(info.roomCode);
            if (room) {
                const player = room.players.get(info.playerId);
                if (player) {
                    player.connected = false;
                    player.ws = null;
                    console.log(`[-] "${player.nickname}" disconnected from ${room.code}`);

                    if (room.state === 'lobby') {
                        room.players.delete(info.playerId);
                        if (room.players.size === 0) {
                            clearTimer(room);
                            rooms.delete(room.code);
                            console.log(`[ROOM] ${room.code} deleted (empty)`);
                        } else {
                            if (room.hostId === info.playerId) {
                                const first = room.players.values().next().value;
                                if (first) {
                                    room.hostId = first.id;
                                    first.isHost = true;
                                }
                            }
                            broadcastToRoom(room, getLobbyState(room));
                        }
                    } else {
                        broadcastToRoom(room, {
                            type: 'playerDisconnected',
                            playerId: info.playerId,
                            nickname: player.nickname,
                            players: getPlayersPublicInfo(room),
                        });
                    }
                }
            }
            playerRooms.delete(ws);
        }
    });
});

// Пинг для поддержания соединений
const pingInterval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => { clearInterval(pingInterval); });

// =====================================================================
// ЗАПУСК СЕРВЕРА
// =====================================================================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('');
    console.log('  🚀 ═══════════════════════════════════════════');
    console.log('  🚀  ИННОВАЦИОННЫЙ ШИРПОТРЕБ v2.0');
    console.log('  🚀  Сервер запущен на порту ' + PORT);
    console.log('  🚀  Откройте: http://localhost:' + PORT);
    console.log('  🚀 ═══════════════════════════════════════════');
    console.log('');
});