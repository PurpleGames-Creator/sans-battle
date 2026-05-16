const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ★効果音システム（Web Audio API）
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    switch (type) {

        // 骨が飛ぶ音（短いシュッ）
        case 'bone': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now); osc.stop(now + 0.08);
            break;
        }

        // ブラスター予告音（ジリジリ）
        case 'blasterWarn': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(200, now + 0.3);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
            break;
        }

        // ブラスター発射音（激しいドォォォン）
        case 'blasterFire': {
            // 低音の爆発
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            const filter1 = audioCtx.createBiquadFilter();
            osc1.connect(filter1); filter1.connect(gain1); gain1.connect(audioCtx.destination);
            osc1.type = 'sawtooth';
            filter1.type = 'lowpass';
            filter1.frequency.setValueAtTime(3000, now);
            filter1.frequency.exponentialRampToValueAtTime(100, now + 0.6);
            osc1.frequency.setValueAtTime(120, now);
            osc1.frequency.exponentialRampToValueAtTime(20, now + 0.6);
            gain1.gain.setValueAtTime(0.7, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc1.start(now); osc1.stop(now + 0.6);

            // 高音のシャー（レーザー感）
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2); gain2.connect(audioCtx.destination);
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(800, now);
            osc2.frequency.exponentialRampToValueAtTime(200, now + 0.4);
            gain2.gain.setValueAtTime(0.4, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc2.start(now); osc2.stop(now + 0.4);

            // ノイズ（衝撃感）
            const bufSize = audioCtx.sampleRate * 0.15;
            const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
            const noise = audioCtx.createBufferSource();
            const noiseGain = audioCtx.createGain();
            const noiseFilter = audioCtx.createBiquadFilter();
            noise.buffer = buf;
            noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(audioCtx.destination);
            noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 1000;
            noiseGain.gain.setValueAtTime(0.5, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            noise.start(now);

            break;
        }

        // ダメージ音（ビッ）
        case 'damage': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now); osc.stop(now + 0.15);
            break;
        }

        // ジャンプ音（ピョン）
        case 'jump': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.start(now); osc.stop(now + 0.12);
            break;
        }

        // 着地音（トン）
        case 'land': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now); osc.stop(now + 0.08);
            break;
        }

        // 重力切り替え音（ドスン）
        case 'gravity': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc2.connect(gain2); gain2.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(400, now);
            osc2.frequency.exponentialRampToValueAtTime(100, now + 0.15);
            gain2.gain.setValueAtTime(0.2, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now); osc.stop(now + 0.3);
            osc2.start(now); osc2.stop(now + 0.15);
            break;
        }

        // 壁に叩きつけ音（ドーン）
        case 'slam': {
            const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
            const source = audioCtx.createBufferSource();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            source.buffer = buf;
            source.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
            filter.type = 'lowpass'; filter.frequency.value = 300;
            gain.gain.setValueAtTime(0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            source.start(now);
            break;
        }

        // セリフ表示音（ピッピッ）
        case 'text': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now); osc.stop(now + 0.04);
            break;
        }

        // ターン切り替え音（シュワッ）
        case 'transition': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
            break;
        }

        // MISSテキスト音（スカッ）
        case 'miss': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
            break;
        }

        // ゲームオーバー音（ズーン）
        case 'gameover': {
            [0, 0.3, 0.6].forEach((delay, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime([200, 150, 100][i], now + delay);
                osc.frequency.exponentialRampToValueAtTime([100, 75, 50][i], now + delay + 0.25);
                gain.gain.setValueAtTime(0.3, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
                osc.start(now + delay); osc.stop(now + delay + 0.25);
            });
            break;
        }

        // アイテム使用音（ポーン）
        case 'item': {
            [0, 0.08, 0.16].forEach((delay, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.value = [500, 700, 900][i];
                gain.gain.setValueAtTime(0.15, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
                osc.start(now + delay); osc.stop(now + delay + 0.1);
            });
            break;
        }
    }
}

const W = canvas.width;
const H = canvas.height;

const elHpText = document.getElementById('hp-text');
const elHpFill = document.getElementById('hp-bar-fill');
const elKrFill = document.getElementById('kr-bar-fill');
const elFightBtn = document.getElementById('fight-btn');
const elActBtn = document.getElementById('act-btn');
const elItemBtn = document.getElementById('item-btn');
const elMercyBtn = document.getElementById('mercy-btn');
const allMenuBtns = [elFightBtn, elActBtn, elItemBtn, elMercyBtn];
const elSans = document.getElementById('sans-sprite');
// ★サンズを大きく・上に
elSans.style.height = '180px';
elSans.style.width = 'auto';
elSans.style.marginBottom = '60px';

// ★赤い斬撃エフェクト
function slashEffect() {
    // ★サンズの位置を取得
    const sansRect = elSans.getBoundingClientRect();
    const arenaEl = document.getElementById('arena');
    const arenaRect = arenaEl.getBoundingClientRect();

    // サンズの中心をarena座標系に変換（arenaより上にあるので負になる）
    const sansCX = sansRect.left + sansRect.width / 2 - arenaRect.left;
    const sansCY = sansRect.top + sansRect.height / 2 - arenaRect.top;

    // ★斬撃エフェクト用canvas（arenaの外のgame-containerに配置）
    const container = document.getElementById('game-container');
    const slash = document.createElement('canvas');
    slash.style.position = 'fixed';
    slash.style.top = '0';
    slash.style.left = '0';
    slash.style.width = '100vw';
    slash.style.height = '100vh';
    slash.style.pointerEvents = 'none';
    slash.style.zIndex = '100';
    slash.width = window.innerWidth;
    slash.height = window.innerHeight;
    document.body.appendChild(slash);

    const sCtx = slash.getContext('2d');
    let frame = 0;
    const totalFrames = 22;

    // ★斬撃線をサンズの位置に集中させる
    const lines = [];
    const slashCount = 3 + Math.floor(Math.random() * 2);
    const cx = sansRect.left + sansRect.width * 0.5;
    const cy = sansRect.top + sansRect.height * 0.45;

    for (let i = 0; i < slashCount; i++) {
        // 右上から左下への斬撃（剣を振り下ろすイメージ）
        const angle = -0.5 + (i * 0.15) + (Math.random() * 0.2 - 0.1);
        const len = 100 + Math.random() * 80;
        const ox = (Math.random() - 0.5) * 40;
        const oy = (Math.random() - 0.5) * 30;
        lines.push({ cx: cx + ox, cy: cy + oy, angle, len });
    }

    // ★サンズが斬撃後に避ける
    let sansAvoided = false;

    function draw() {
        sCtx.clearRect(0, 0, slash.width, slash.height);

        const alpha = frame < totalFrames * 0.4
            ? frame / (totalFrames * 0.4)
            : 1 - (frame - totalFrames * 0.4) / (totalFrames * 0.6);

        // ★斬撃線を描画（右から左へ伸びるアニメーション）
        lines.forEach(({ cx, cy, angle, len }) => {
            const progress = Math.min(1, frame / (totalFrames * 0.3));

            sCtx.save();
            sCtx.translate(cx, cy);
            sCtx.rotate(angle);

            // 外側グロー
            sCtx.strokeStyle = `rgba(255, 0, 0, ${alpha * 0.35})`;
            sCtx.lineWidth = 20;
            sCtx.lineCap = 'round';
            sCtx.beginPath();
            sCtx.moveTo(-len / 2 * progress, 0);
            sCtx.lineTo(len / 2 * progress, 0);
            sCtx.stroke();

            // 中間の赤
            sCtx.strokeStyle = `rgba(255, 50, 50, ${alpha * 0.85})`;
            sCtx.lineWidth = 7;
            sCtx.beginPath();
            sCtx.moveTo(-len / 2 * progress, 0);
            sCtx.lineTo(len / 2 * progress, 0);
            sCtx.stroke();

            // 中心の白
            sCtx.strokeStyle = `rgba(255, 200, 200, ${alpha})`;
            sCtx.lineWidth = 2;
            sCtx.beginPath();
            sCtx.moveTo(-len / 2 * progress, 0);
            sCtx.lineTo(len / 2 * progress, 0);
            sCtx.stroke();

            sCtx.restore();
        });

        // ★斬撃が当たる瞬間（frame=6）にサンズが避ける
        if (frame === 6 && !sansAvoided) {
            sansAvoided = true;
            elSans.style.transition = 'transform 0.08s ease-out';
            elSans.style.transform = 'translateX(-120px)';
        }

        frame++;
        if (frame < totalFrames) {
            requestAnimationFrame(draw);
        } else {
            document.body.removeChild(slash);
        }
    }
    requestAnimationFrame(draw);
}
const elMiss = document.getElementById('miss-text');
const elFlash = document.getElementById('screen-flash');
const elDebug = document.getElementById('debug-info');
const elSpeech = document.getElementById('speech-bubble');
const elSpeechText = document.getElementById('speech-text');

const imgBlaster = new Image();
imgBlaster.src = "";
let blasterCanvas = null;

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, z: false };
window.addEventListener('keydown', e => {
    if (keys.hasOwnProperty(e.key)) { keys[e.key] = true; e.preventDefault(); }
    if (e.key.toLowerCase() === 'z') { keys.z = true; }
});
window.addEventListener('keyup', e => {
    if (keys.hasOwnProperty(e.key)) { keys[e.key] = false; }
    if (e.key.toLowerCase() === 'z') { keys.z = false; }
});

// turnState:
//   0 = プレイヤーのターン（メニュー操作可）
//   1 = サンズの攻撃中
//   2 = 演出中（ボタン押せない）
//   4 = 慈悲トラップ
const State = {
    hp: 184, maxHp: 184, kr: 0, frameCount: 0, attacks: [],
    turnIndex: 0, patternTimer: 0, inTransition: false,
    turnState: 0, trapTimer: 0, postAttackTimer: 0,
    patternDone: false, items: 8, isGameOver: false, screenShake: 0,
    showingDialogue: false // ★セリフ表示中フラグ
};

function showMessage(text) { elSpeech.classList.remove('hidden'); elSpeechText.innerHTML = text; }
function hideMessage() { elSpeech.classList.add('hidden'); elSpeechText.innerHTML = ''; }

// サンズのセリフ（各ターン攻撃終了後）
const turnDialogues = [
    // Turn 1後
    "やれやれ… また来たのか。<br>ったく、骨が折れるぜ。 …骨だけに。",
    // Turn 2後
    "おまえ、何度リセットした？<br>おれには全部 バレてるぜ。 …ぞっとしないね。",
    // Turn 3後
    "正直に言うと、おれ 本当は 寝てたかった。<br>なのに おまえが来るから 起きなきゃいけない。 とんだ迷惑だ。",
    // Turn 4後
    "おまえが通ってきた道を おれは 全部 知ってる。<br>何人 殺したか… 数えるのも ゾッとするぜ。",
    // Turn 5後
    "友達と ある約束をしたんだ。<br>「人間を 守ってやれ」ってな。<br>…おまえみたいなやつが 来るとは 思わなかった。",
    // Turn 6後
    "骨の攻撃が 全部かわされた。<br>まあ… 骨ぬかれるぜ。 …ほんとに。",
    // Turn 7後
    "ブラスター 出したのに 平然としてやがる。<br>…おれも 骨が折れるな。 って さっきも言ったっけ。",
    // Turn 8後
    "何度も死んで また来る。<br>おれは 知ってるぞ。 何度 ロードしたか。<br>…正直 うんざりしてる。",
    // Turn 9後
    "どうせ おまえは また来る。<br>何度 倒しても… リセットして。<br>だから おれは ずっと ここで 番をしてる。",
    // Turn 10後
    "ブラスターまで かわすとは な。<br>…頑張ったな。 まあ おれも 頑張りたくなかったけど。",
    // Turn 11 慈悲（攻撃後にPattern内でセリフ表示）
    "",
    // ★Phase1終了演出ターン→セリフなし（Pattern内で表示）
    "",
    // Turn 12後（旧Turn12、Phase2開始後）
    "重力まで ひっくり返しても ダメか。<br>…時空まで 曲げたのに。 物理法則も 形無しだな。",
    // Turn 13後
    "おれがサボれる時間は もう 残ってないみたいだ。<br>…やれやれ。 こんなに 本気出したの 久しぶりだぜ。",
    // Turn 14後
    "上から 引っ張っても ダメだったか。<br>…重力に 逆らうとは な。 反骨精神ってやつか。 骨だけに。",
    // Turn 15後
    "暗くしても 動けるのか。<br>…おまえ ほんとに 何者だ。<br>ぞっとしない 答えしか 浮かばないけど。",
    // Turn 16後
    "斜めからも ダメか。<br>正直もう アイデアが 底をついてきた。<br>…困ったな。 本当に 困ってる。",
    // Turn 17後
    "四方八方から やっても 死なない。<br>…おまえ、ひょっとして<br>死に方まで 覚えてるんじゃないか。",
    // Turn 18後
    "全方向から 一斉に 来ても ダメか。<br>…おまえ、ほんとに 化け物だな。",
    // Turn 19後
    "でかいやつも ダメか。<br>…もう おれに 残ってる手札は<br>ほとんど ないぞ。 やれやれ。",
    // Turn 20後
    "左も 右も 全部 読まれてた。<br>…おまえと戦ってると 背筋が 凍る。<br>骨まで な。",
    // 追加ターンA後
    "へえ… 狭い枠でも 動けるのか。<br>まあ いい。 次は もっと 狭くしてやる。",
    // 追加ターンB後
    "縦に追い込んでも ダメか。<br>…しぶといな。 ほんとに。<br>まあ… 次が 最後の チャンスだ。",
    // 追加ターンC後（スペシャル直前）→セリフなし
    "",
    // 偽スペシャル後→セリフなし（本物スペシャルに続くため）
    "",
    // 本物スペシャル後→セリフなし
    "",
    // Phase2突入演出→セリフなし
    "",
    // Phase2 Turn1後
    "",
    // Phase2 Turn2後
    "",
    // Phase2 Turn3後
    "",
    // Phase2 Turn4後
    "",
    // Phase2 Turn5後
    "",
    // Phase2 Turn6後
    "",
    // Phase2 Turn7後
    "",
    // Phase2 Turn8後
    "",
    // Phase2 Turn9後
    "",
    // Phase2 Turn10後
    "",
];

class Player {
    constructor() {
        this.w = 16; this.h = 16;
        this.resetPos();
        this.speed = 1.1;
        this.isBlue = true;
        this.gravityDir = 'DOWN';

        // 物理定数
        this.jumpForce = -4.2;        // ジャンプ初速
        this.gravityNormal = 0.05;    // 通常重力（超ふわふわ）
        this.gravityFall = 0.07;      // 落下重力（ゆったり）
        this.bounceCoeff = 0;         // バウンド無効化（反動で避けられてしまうため）

        this.isJumping = false;
        this.isGrounded = false;
        this.gravityBounce = false;   // 重力攻撃中フラグ
        this.lastX = this.x; this.lastY = this.y;
    }

    resetPos() { this.x = W / 2 - 8; this.y = H / 2 - 8; this.vx = 0; this.vy = 0; }

    setGravityDir(dir) {
        this.gravityDir = dir;
        this.isBlue = true;
        this.isJumping = false;
        this.isGrounded = false;
        this.gravityBounce = true; // 重力攻撃→バウンド有効
        playSound('gravity');
        const F = 18;
        if (dir === 'DOWN') this.vy = F;
        if (dir === 'UP') this.vy = -F;
        if (dir === 'LEFT') this.vx = -F;
        if (dir === 'RIGHT') this.vx = F;
        State.screenShake = 12;
    }

    // ★ボタン状態に応じた重力を返す
    _gravity(jumpHeld, vel, isUp) {
        // 上昇中にボタンを離したら即強重力
        if (!jumpHeld && ((isUp && vel > 0) || (!isUp && vel < 0))) return this.gravityFall;
        // 落下中も強重力
        if ((isUp && vel < 0) || (!isUp && vel > 0)) return this.gravityFall;
        return this.gravityNormal;
    }

    _updateDown() {
        if (keys.ArrowLeft) this.x -= this.speed;
        if (keys.ArrowRight) this.x += this.speed;
        const jumpHeld = keys.z || keys.ArrowUp;
        const cH = canvas.height; // ★キャンバスの現在の高さを参照

        if (this.isJumping && this.vy < 0 && !jumpHeld) this.vy *= 0.96;
        this.vy += this._gravity(jumpHeld, this.vy, false);

        if (this.y + this.h >= cH) {
            this.y = cH - this.h;
            if (this.gravityBounce && Math.abs(this.vy) > 2.5) {
                this.vy = -Math.abs(this.vy) * this.bounceCoeff;
                State.screenShake = 6;
                if (Math.abs(this.vy) < 1.0) { this.vy = 0; this.gravityBounce = false; }
            } else {
                this.vy = 0; this.isJumping = false; this.gravityBounce = false;
                if (jumpHeld) { this.vy = this.jumpForce; this.isJumping = true; }
            }
        }
        this.y += this.vy;
    }

    _updateUp() {
        if (keys.ArrowLeft) this.x -= this.speed;
        if (keys.ArrowRight) this.x += this.speed;
        const jumpHeld = keys.z || keys.ArrowDown;

        if (this.isJumping && this.vy > 0 && !jumpHeld) this.vy *= 0.96;
        this.vy -= this._gravity(jumpHeld, this.vy, true);

        if (this.y <= 0) {
            this.y = 0;
            if (this.gravityBounce && Math.abs(this.vy) > 2.5) {
                this.vy = Math.abs(this.vy) * this.bounceCoeff;
                State.screenShake = 6;
                if (Math.abs(this.vy) < 1.0) { this.vy = 0; this.gravityBounce = false; }
            } else {
                this.vy = 0; this.isJumping = false; this.gravityBounce = false;
                if (jumpHeld) { this.vy = -this.jumpForce; this.isJumping = true; }
            }
        }
        this.y += this.vy;
    }

    _updateLeft() {
        if (keys.ArrowUp) this.y -= this.speed;
        if (keys.ArrowDown) this.y += this.speed;
        const jumpHeld = keys.z || keys.ArrowRight;

        if (this.isJumping && this.vx > 0 && !jumpHeld) this.vx *= 0.96;
        this.vx -= this._gravity(jumpHeld, this.vx, true);

        if (this.x <= 0) {
            this.x = 0;
            if (this.gravityBounce && Math.abs(this.vx) > 2.5) {
                this.vx = Math.abs(this.vx) * this.bounceCoeff;
                State.screenShake = 6;
                if (Math.abs(this.vx) < 1.0) { this.vx = 0; this.gravityBounce = false; }
            } else {
                this.vx = 0; this.isJumping = false; this.gravityBounce = false;
                if (jumpHeld) { this.vx = -this.jumpForce; this.isJumping = true; }
            }
        }
        this.x += this.vx;
    }

    _updateRight() {
        if (keys.ArrowUp) this.y -= this.speed;
        if (keys.ArrowDown) this.y += this.speed;
        const jumpHeld = keys.z || keys.ArrowLeft;
        const cW = canvas.width; // ★キャンバスの現在の幅を参照

        if (this.isJumping && this.vx < 0 && !jumpHeld) this.vx *= 0.96;
        this.vx += this._gravity(jumpHeld, this.vx, false);

        if (this.x + this.w >= cW) {
            this.x = cW - this.w;
            if (this.gravityBounce && Math.abs(this.vx) > 2.5) {
                this.vx = -Math.abs(this.vx) * this.bounceCoeff;
                State.screenShake = 6;
                if (Math.abs(this.vx) < 1.0) { this.vx = 0; this.gravityBounce = false; }
            } else {
                this.vx = 0; this.isJumping = false; this.gravityBounce = false;
                if (jumpHeld) { this.vx = this.jumpForce; this.isJumping = true; }
            }
        }
        this.x += this.vx;
    }

    update() {
        this.lastX = this.x; this.lastY = this.y;
        const cW = canvas.width, cH = canvas.height; // ★常に最新サイズを参照
        if (!this.isBlue) {
            if (keys.ArrowUp) this.y -= this.speed;
            if (keys.ArrowDown) this.y += this.speed;
            if (keys.ArrowLeft) this.x -= this.speed;
            if (keys.ArrowRight) this.x += this.speed;
        } else {
            if (this.gravityDir === 'DOWN') this._updateDown();
            else if (this.gravityDir === 'UP') this._updateUp();
            else if (this.gravityDir === 'LEFT') this._updateLeft();
            else if (this.gravityDir === 'RIGHT') this._updateRight();
        }
        this.x = Math.max(0, Math.min(cW - this.w, this.x));
        this.y = Math.max(0, Math.min(cH - this.h, this.y));
    }

    draw(ctx) {
        ctx.fillStyle = this.isBlue ? '#0033ff' : '#ff0000';
        ctx.beginPath();
        ctx.moveTo(this.x + this.w / 2, this.y + this.h);
        ctx.lineTo(this.x, this.y + this.h / 3);
        ctx.arc(this.x + this.w / 4, this.y + this.h / 3, this.w / 4, Math.PI, 0);
        ctx.arc(this.x + this.w * 0.75, this.y + this.h / 3, this.w / 4, Math.PI, 0);
        ctx.fill();
    }

    isMoving() { return Math.abs(this.x - this.lastX) > 0.1 || Math.abs(this.y - this.lastY) > 0.1; }
}
const p = new Player();

function applyDamage(amount) {
    if (State.hp <= 0 || State.isGameOver) return;

    if (State.hp > 1) {
        // ★通常：HP-1＋KR+1
        State.hp -= 1;
        State.kr = Math.min(State.kr + 1, State.maxHp - State.hp);
    } else {
        // ★HP1のとき：KRがあればKR-1、なければHP-1（ゲームオーバー）
        if (State.kr > 0) {
            State.kr -= 1;
        } else {
            State.hp = 0;
            State.isGameOver = true;
            State.attacks = [];
            stopBGM();
            soulBreakEffect();
        }
    }
}

function updateUI() {
    // ★KRが時間経過で少しずつ減る（1秒に1）
    if (State.kr > 0 && State.frameCount % 60 === 0) {
        State.kr -= 1;
    }
    // ★KRがある間はHPがKRに圧迫される（HP+KR≦maxHp）
    if (State.hp + State.kr > State.maxHp) {
        State.kr = State.maxHp - State.hp;
    }
    if (State.hp <= 0) State.hp = 0;
    elHpText.textContent = `${State.hp} / ${State.maxHp}`;
    elHpFill.style.width = `${(State.hp / State.maxHp) * 100}%`;
    elKrFill.style.left = `${(State.hp / State.maxHp) * 100}%`;
    elKrFill.style.width = `${(State.kr / State.maxHp) * 100}%`;
    elDebug.textContent = `Turn: ${State.turnIndex + 1}/21 | State: ${State.turnState} | Objs: ${State.attacks.length}`;
    elItemBtn.textContent = `ITEM (${State.items})`;
    const isMenu = (State.turnState === 0);
    allMenuBtns.forEach(btn => {
        btn.disabled = !isMenu;
        btn.style.opacity = isMenu ? '1' : '0.5';
        btn.style.cursor = isMenu ? 'pointer' : 'default';
    });
}

class Bone {
    constructor(x, y, w, h, vx, vy, isBlue = false) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.vx = vx; this.vy = vy; this.isBlue = isBlue; this.dead = false;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x + this.w < -200 || this.x > W + 200 || this.y + this.h < -200 || this.y > H + 200) this.dead = true;
    }
    draw(ctx) {
        ctx.fillStyle = this.isBlue ? '#00aaff' : '#ffffff';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.beginPath();
        ctx.arc(this.x + this.w / 2, this.y, this.w / 2, 0, Math.PI * 2);
        ctx.arc(this.x + this.w / 2, this.y + this.h, this.w / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    checkCollision(pl) {
        if (this.x < pl.x + pl.w - 2 && this.x + this.w > pl.x + 2 &&
            this.y < pl.y + pl.h - 2 && this.y + this.h > pl.y + 2) {
            if (this.isBlue && !pl.isMoving()) return false;
            return true;
        }
        return false;
    }
}

class GasterBlaster {
    constructor(tx, ty, rot, scale, warnTime, lockTime, fireTime, type, playerX, playerY) {
        this.phase = 'WARN'; this.timer = 0;
        this.x = tx < W / 2 ? -200 : W + 200; this.y = -200;
        this.targetX = tx; this.targetY = ty;
        this.laserWidth = 60 * scale; this.type = type;
        this.angle = (rot === null) ? Math.atan2(playerY - ty, playerX - tx) : rot;
        if (this.type === 'fast') {
            this.warnTime = 150; this.lockTime = 60; this.fireTime = 25;
            this.laserWidth = 35 * scale;
        } else {
            this.warnTime = warnTime; this.lockTime = lockTime; this.fireTime = fireTime;
        }
        this.dead = false;
    }
    update(pl) {
        this.timer++;
        if (this.phase === 'WARN') {
            this.x += (this.targetX - this.x) * 0.15;
            this.y += (this.targetY - this.y) * 0.15;
            if (this.timer > this.warnTime) {
                // ★lockTime=0なら発射せずそのまま消える（チラ見せ用）
                if (this.lockTime === 0) { this.dead = true; return; }
                this.phase = 'LOCK'; this.timer = 0; playSound('blasterWarn');
            }
        } else if (this.phase === 'LOCK') {
            if (this.timer > this.lockTime) { this.phase = 'FIRE'; this.timer = 0; State.screenShake = 5; playSound('blasterFire'); }
        } else if (this.phase === 'FIRE') {
            if (this.timer > this.fireTime) this.dead = true;
        }
    }
    draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
        const bw = 80 * (this.laserWidth / 60), bh = 80 * (this.laserWidth / 60);
        if (this.phase === 'LOCK') {
            const fa = 0.4 + Math.abs(Math.sin(this.timer * 0.2)) * 0.6;
            ctx.strokeStyle = `rgba(255,0,0,${fa})`; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(2000, 0); ctx.stroke();
        } else if (this.phase === 'FIRE') {
            const animW = this.timer < 10 ? this.laserWidth * (this.timer / 10) : this.laserWidth;
            ctx.fillStyle = 'rgba(200,255,255,0.5)'; ctx.fillRect(0, -animW / 4, 2000, animW / 2);
        }
        // ★画像から直接読み取ったドットデータでガスターブラスターを描画
        ctx.save();
        ctx.rotate(-Math.PI / 2);

        // 通常（口閉じ）のドットデータ
        const dotsNormal = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0],
            [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        // ★FIREフェーズ：口が大きく開いたドットデータ
        const dotsOpen = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            // 口が開いた部分（行17以降を変更）
            [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0],
            [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
            [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        // フェーズに応じてドットを切り替え
        const dots = (this.phase === 'FIRE') ? dotsOpen : dotsNormal;

        const ROWS = dots.length;
        const COLS = 24;
        const u = bw / COLS;
        const offX = -(COLS / 2) * u;
        const offY = -(ROWS / 2) * u;

        const eyeColor = this.phase === 'LOCK'
            ? `rgba(255,50,50,${0.85 + Math.sin(this.timer * 0.5) * 0.15})`
            : this.phase === 'FIRE'
                ? `rgba(255,80,80,0.95)` // FIREで目が赤く光る
                : 'rgba(210,240,255,0.95)';

        ctx.fillStyle = '#ffffff';
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (!dots[row][col]) continue;
                ctx.fillRect(offX + col * u, offY + row * u, u + 0.5, u + 0.5);
            }
        }

        // 鼻の縦棒（黒）
        ctx.fillStyle = '#000000';
        for (let row = 4; row <= 18; row++) {
            ctx.fillRect(offX + 12 * u, offY + row * u, u + 0.5, u + 0.5);
        }

        // 目の穴（黒）
        [[3, 14], [4, 14], [3, 15], [4, 15], [3, 16], [4, 16],
        [19, 14], [20, 14], [19, 15], [20, 15], [19, 16], [20, 16]].forEach(([c, r]) => {
            ctx.fillRect(offX + c * u, offY + r * u, u + 0.5, u + 0.5);
        });

        // 目の光
        ctx.fillStyle = eyeColor;
        [[3, 15], [19, 15]].forEach(([c, r]) => {
            ctx.fillRect(offX + c * u, offY + r * u, u + 0.5, u + 0.5);
        });
        ctx.restore();
        ctx.restore();
    }
    checkCollision(pl) {
        if (this.phase !== 'FIRE') return false;
        const dx = pl.x + pl.w / 2 - this.x, dy = pl.y + pl.h / 2 - this.y;
        const lx = dx * Math.cos(-this.angle) - dy * Math.sin(-this.angle);
        const ly = dx * Math.sin(-this.angle) + dy * Math.cos(-this.angle);
        if (lx > 20 && lx < 2000) {
            const animW = this.timer < 10 ? this.laserWidth * (this.timer / 10) : this.laserWidth;
            if (Math.abs(ly) < animW / 2) return true;
        }
        return false;
    }
}

class SlamBone {
    constructor(wall, timerLimit, maxH = 40) {
        this.wall = wall; this.timerLimit = timerLimit; this.timer = 0;
        this.dead = false; this.h = maxH; this.phase = 'WARN'; this.warnCount = 0;
    }
    update() {
        if (this.phase === 'WARN') { this.warnCount++; if (this.warnCount > 90) this.phase = 'ATTACK'; }
        else { this.timer++; if (this.timer > this.timerLimit) this.dead = true; }
    }
    draw(ctx) {
        if (this.phase === 'WARN') {
            ctx.strokeStyle = Math.floor(this.warnCount / 4) % 2 === 0 ? 'red' : 'rgba(255,0,0,0.5)';
            ctx.lineWidth = 3; ctx.beginPath();
            if (this.wall === 'DOWN') ctx.strokeRect(0, H - this.h, W, this.h);
            if (this.wall === 'UP') ctx.strokeRect(0, 0, W, this.h);
            if (this.wall === 'LEFT') ctx.strokeRect(0, 0, this.h, H);
            if (this.wall === 'RIGHT') ctx.strokeRect(W - this.h, 0, this.h, H);
        } else {
            ctx.fillStyle = '#fff';
            const prog = this.timer < 10 ? this.timer / 10 : (this.timer > this.timerLimit - 10 ? (this.timerLimit - this.timer) / 10 : 1);
            const curH = this.h * prog;
            for (let i = 0; i < W; i += 25) {
                if (this.wall === 'DOWN') ctx.fillRect(i, H - curH, 15, curH);
                if (this.wall === 'UP') ctx.fillRect(i, 0, 15, curH);
                if (this.wall === 'LEFT') ctx.fillRect(0, i, curH, 15);
                if (this.wall === 'RIGHT') ctx.fillRect(W - curH, i, curH, 15);
            }
        }
    }
    checkCollision(pl) {
        if (this.phase === 'WARN') return false;
        const curH = this.h;
        if (this.wall === 'DOWN' && pl.y + pl.h > H - curH) return true;
        if (this.wall === 'UP' && pl.y < curH) return true;
        if (this.wall === 'LEFT' && pl.x < curH) return true;
        if (this.wall === 'RIGHT' && pl.x + pl.w > W - curH) return true;
        return false;
    }
}

const spawnBone = (x, y, w, h, vx, vy, blue = false) => State.attacks.push(new Bone(x, y, w, h, vx, vy, blue));
const spawnBlaster = (tx, ty, rot = null, scale = 1, wT = 90, lT = 40, fT = 40, type = 'normal') => {
    State.attacks.push(new GasterBlaster(tx, ty, rot, scale, wT, lT, fT, type, p.x + p.w / 2, p.y + p.h / 2));
};
const spawnSlam = (wall, timeLimit, maxH = 40) => State.attacks.push(new SlamBone(wall, timeLimit, maxH));

const Patterns = [];

// Turn 1: ゆっくり低い骨のみ（簡単）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 150 === 0 && t < 700) spawnBone(W + 10, H - 50, 12, 50, -1.0, 0, false);
    return t > 900;
});

// Turn 2: 本家サンズ風・地面を這う骨（小ジャンプで避ける）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }

    // ★地面ギリギリを這う低い骨（高さ20px・ジャンプしないと絶対当たる）
    if (t === 60) spawnBone(W + 10, H - 20, 12, 20, -1.2, 0, false);
    if (t === 180) spawnBone(W + 10, H - 20, 12, 20, -1.2, 0, false);
    if (t === 300) spawnBone(W + 10, H - 20, 12, 20, -1.2, 0, false);

    // ★少し間を開けて2連続（タイミングが難しい）
    if (t === 460) spawnBone(W + 10, H - 20, 12, 20, -1.3, 0, false);
    if (t === 540) spawnBone(W + 10, H - 20, 12, 20, -1.3, 0, false);

    // ★最後に3連続（本家っぽい）
    if (t === 700) spawnBone(W + 10, H - 20, 12, 20, -1.4, 0, false);
    if (t === 760) spawnBone(W + 10, H - 20, 12, 20, -1.4, 0, false);
    if (t === 820) spawnBone(W + 10, H - 20, 12, 20, -1.4, 0, false);

    return t > 1050;
});

// Turn 3: 低い骨と高い骨が交互（ゆっくり）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 180 === 0 && t < 800) spawnBone(W + 10, H - 50, 12, 50, -0.8, 0, false);
    if (t % 180 === 90 && t < 800) spawnBone(W + 10, 0, 12, H - 70, -0.8, 0, false);
    return t > 1000;
});

// Turn 4: 左右から交互（ゆっくり）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 180 === 0 && t < 800) spawnBone(W + 10, H - 50, 12, 50, -0.7, 0, false);
    if (t % 180 === 90 && t < 800) spawnBone(-20, H - 50, 12, 50, 0.7, 0, false);
    return t > 1000;
});

// Turn 5: 青骨→白骨（ゆっくり）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t === 80) spawnBone(W + 10, H - 65, 12, 65, -1.1, 0, true);
    if (t === 280) spawnBone(W + 10, H - 50, 12, 50, -1.1, 0, false);
    if (t === 450) spawnBone(-20, H - 65, 12, 65, 1.1, 0, true);
    if (t === 650) spawnBone(-20, H - 50, 12, 50, 1.1, 0, false);
    return t > 900;
});

// Turn 6: 骨＋ブラスター1発（予告たっぷり）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 150 === 0 && t < 700) spawnBone(W + 10, H - 50, 12, 50, -1.1, 0, false);
    if (t === 350) spawnBlaster(W * 0.15, H * 0.15, null, 1, 180, 50, 40);
    return t > 1000;
});

// Turn 7: ブラスター2秒に1発・細い
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t === 30) spawnBlaster(W * 0.1, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 150) spawnBlaster(W * 0.9, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 270) spawnBlaster(W * 0.9, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 390) spawnBlaster(W * 0.1, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 510) spawnBlaster(W * 0.5, H * 0.05, null, 0.8, 60, 30, 35);
    if (t === 630) spawnBlaster(W * 0.05, H * 0.5, null, 0.8, 60, 30, 35);
    if (t === 750) spawnBlaster(W * 0.95, H * 0.5, null, 0.8, 60, 30, 35);
    if (t === 870) spawnBlaster(W * 0.5, H * 0.95, null, 0.8, 60, 30, 35);
    if (t === 990) spawnBlaster(W * 0.2, H * 0.2, null, 0.8, 60, 30, 35);
    if (t === 1110) spawnBlaster(W * 0.8, H * 0.8, null, 0.8, 60, 30, 35);
    return t > 1400;
});

// Turn 8: ゆっくり骨が続く
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 160 === 0 && t < 800) spawnBone(W + 10, H - 50, 12, 50, -0.9, 0, false);
    if (t % 160 === 80 && t < 800) spawnBone(W + 10, 0, 12, H - 65, -0.9, 0, false);
    return t > 1000;
});

// Turn 9: 隙間骨（赤ソウル・隙間広め）
Patterns.push((t) => {
    if (t === 0) p.isBlue = false;
    if (t % 120 === 0 && t < 700) {
        const gap = 100 + Math.random() * (H - 220);
        spawnBone(W + 10, 0, 12, gap - 40, -1.2, 0, false);
        spawnBone(W + 10, gap + 40, 12, H, -1.2, 0, false);
    }
    return t > 900;
});

// Turn 10: 骨＋固定角度ブラスター（1発ずつ）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 150 === 0 && t < 900) spawnBone(W + 10, H - 50, 12, 50, -1.2, 0, false);
    if (t % 150 === 75 && t < 900) spawnBone(W + 10, 0, 12, H - 65, -1.2, 0, false);
    // 2秒に1発・細い（固定角度）
    if (t === 100) spawnBlaster(W * 0.1, H * 0.1, Math.PI * 0.25, 0.8, 60, 30, 35);
    if (t === 220) spawnBlaster(W * 0.9, H * 0.9, Math.PI * 1.25, 0.8, 60, 30, 35);
    if (t === 340) spawnBlaster(W * 0.9, H * 0.1, Math.PI * 0.75, 0.8, 60, 30, 35);
    if (t === 460) spawnBlaster(W * 0.1, H * 0.9, Math.PI * 1.75, 0.8, 60, 30, 35);
    if (t === 580) spawnBlaster(W * 0.5, H * 0.05, Math.PI * 0.5, 0.8, 60, 30, 35);
    if (t === 700) spawnBlaster(W * 0.05, H * 0.5, 0, 0.8, 60, 30, 35);
    if (t === 820) spawnBlaster(W * 0.95, H * 0.5, Math.PI, 0.8, 60, 30, 35);
    if (t === 940) spawnBlaster(W * 0.5, H * 0.95, Math.PI * 1.5, 0.8, 60, 30, 35);
    return t > 1200;
});

// Turn 11: 小さい追尾ブラスターがバコバコ・発射3秒→慈悲セリフ
Patterns.push((t) => {
    if (t === 0) { p.isBlue = false; }

    // ★scale=1.0（小さめ）、lockTime=180（3秒の赤い予告線）
    if (t === 30) {
        State.attacks.push(new GasterBlaster(-200, -200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W + 200, H + 200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
    }
    if (t === 220) {
        State.attacks.push(new GasterBlaster(W + 200, -200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(-200, H + 200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
    }
    if (t === 410) {
        State.attacks.push(new GasterBlaster(-200, -200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W + 200, H + 200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W + 200, -200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(-200, H + 200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
    }
    if (t === 620) {
        State.attacks.push(new GasterBlaster(-200, H / 2, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W + 200, H / 2, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W / 2, -200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W / 2, H + 200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
    }
    if (t === 830) {
        State.attacks.push(new GasterBlaster(-200, -200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W + 200, -200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W + 200, H + 200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(-200, H + 200, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(-200, H / 2, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        State.attacks.push(new GasterBlaster(W + 200, H / 2, null, 1.0, 80, 180, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
    }

    // 攻撃終了後に慈悲セリフ
    if (t === 1150) {
        p.isBlue = true; p.gravityDir = 'DOWN';
        showMessage("いまなら おまえを みのがしてやる。<br>パピルスとの 約束もある。<br>…頼む。 もう やめてくれ。");
    }

    return t > 1150;
});

// ★Phase1終了・サンズが本気を出す演出ターン
Patterns.push((t) => {
    if (t === 0) {
        p.isBlue = true; p.gravityDir = 'DOWN';
        State.attacks = [];
        // 画面を暗転
        document.getElementById('gameCanvas').style.filter = 'brightness(0)';
    }
    if (t === 60) {
        document.getElementById('gameCanvas').style.filter = 'none';
        showMessage("…やれやれ。<br>まあまあ やるじゃないか。");
    }
    if (t === 180) {
        showMessage("でも これは<br>まだ おれの 手加減した攻撃だ。");
    }
    if (t === 330) {
        showMessage("ここから先は…<br>本気で いくからな。");
    }
    if (t === 480) {
        showMessage("覚悟しろよ。<br>…骨が 折れるぜ。 骨だけに。");
    }
    if (t === 620) {
        hideMessage();
        document.getElementById('gameCanvas').style.filter = 'brightness(0)';
    }
    if (t === 680) {
        document.getElementById('gameCanvas').style.filter = 'none';
        // ★本気演出：16方向ブラスターがチラ見せ（lockTime=0で発射しない）
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const tx = W / 2 + Math.cos(angle) * 400;
            const ty = H / 2 + Math.sin(angle) * 300;
            State.attacks.push(new GasterBlaster(tx, ty, null, 0.9, 60, 0, 0, 'normal', W / 2, H / 2));
        }
    }
    if (t === 760) {
        State.attacks = [];
        document.getElementById('gameCanvas').style.filter = 'brightness(0)';
    }
    if (t === 820) {
        document.getElementById('gameCanvas').style.filter = 'none';
        showMessage("…やれやれ。<br>じゃあ いくぞ。");
    }
    if (t === 960) hideMessage();
    return t > 1000;
});

// Turn 12: 重力操作＋骨（骨メイン）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; }
    if (t === 30) p.setGravityDir('LEFT');
    if (t === 50) spawnSlam('LEFT', 80, 30);
    if (t === 80) spawnBone(0, H * 0.3, 30, 12, 1.5, 0, false);
    if (t === 160) spawnBone(0, H * 0.6, 30, 12, 1.5, 0, false);
    if (t === 250) p.setGravityDir('RIGHT');
    if (t === 270) spawnSlam('RIGHT', 80, 30);
    if (t === 300) spawnBone(W, H * 0.3, 30, 12, -1.5, 0, false);
    if (t === 380) spawnBone(W, H * 0.6, 30, 12, -1.5, 0, false);
    if (t === 460) p.setGravityDir('DOWN');
    // ブラスター固定・補助
    if (t === 500) spawnBlaster(W * 0.5, H * 0.05, Math.PI / 2, 1, 140, 35, 35);
    return t > 750;
});

// Turn 13: 追尾ブラスター1発ずつポンポン（赤ソウル）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = false; }
    // 2秒に1発ずつ追尾・細い
    if (t === 30) spawnBlaster(W * 0.1, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 150) spawnBlaster(W * 0.9, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 270) spawnBlaster(W * 0.9, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 390) spawnBlaster(W * 0.1, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 510) spawnBlaster(W * 0.5, H * 0.05, null, 0.8, 60, 30, 35);
    if (t === 630) spawnBlaster(W * 0.05, H * 0.5, null, 0.8, 60, 30, 35);
    if (t === 750) spawnBlaster(W * 0.95, H * 0.5, null, 0.8, 60, 30, 35);
    if (t === 870) spawnBlaster(W * 0.5, H * 0.95, null, 0.8, 60, 30, 35);
    if (t === 990) spawnBlaster(W * 0.15, H * 0.15, null, 0.8, 60, 30, 35);
    if (t === 1110) spawnBlaster(W * 0.85, H * 0.85, null, 0.8, 60, 30, 35);
    if (t === 1230) spawnBlaster(W * 0.5, H * 0.5, null, 0.8, 60, 30, 35);
    return t > 1500;
});

// Turn 14: 重力上下＋骨＋ブラスター固定補助
Patterns.push((t) => {
    if (t === 0) p.isBlue = true;
    if (t === 50) p.setGravityDir('UP');
    if (t === 70) spawnSlam('UP', 80, 30);
    if (t === 100) { spawnBone(W + 10, 0, 12, H * 0.25, -1.4, 0, false); spawnBone(-20, 0, 12, H * 0.25, 1.4, 0, false); }
    if (t === 200) { p.setGravityDir('DOWN'); spawnSlam('DOWN', 80, 50); }
    if (t === 250) { spawnBone(W + 10, H * 0.75, 12, H * 0.25, -1.4, 0, false); spawnBone(-20, H * 0.75, 12, H * 0.25, 1.4, 0, false); }
    // ブラスター固定・縦に走る
    if (t === 380) spawnBlaster(W * 0.3, H * 0.05, Math.PI / 2, 1, 140, 35, 35);
    if (t === 380) spawnBlaster(W * 0.7, H * 0.05, Math.PI / 2, 1, 140, 35, 35);
    return t > 650;
});

// Turn 15: 暗転＋骨メイン（ブラスター固定補助）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t === 50) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 100) {
        document.getElementById('gameCanvas').style.filter = 'none';
        spawnBone(W + 10, H - 50, 12, 50, -1.5, 0, false);
        spawnBone(-20, H - 50, 12, 50, 1.5, 0, false);
        // ブラスター固定・上から
        spawnBlaster(W * 0.5, H * 0.05, Math.PI / 2, 1.2, 140, 35, 35);
    }
    if (t % 100 === 0 && t > 150 && t < 800) spawnBone(W + 10, H - 50, 12, 50, -1.5, 0, false);
    if (t % 100 === 50 && t > 150 && t < 800) spawnBone(W + 10, 0, 12, H - 60, -1.5, 0, false);
    if (t === 450) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 500) {
        document.getElementById('gameCanvas').style.filter = 'none';
        spawnBone(W + 10, H - 50, 12, 50, -1.5, 0, false);
        spawnBone(-20, H - 50, 12, 50, 1.5, 0, false);
        spawnBlaster(W * 0.5, H * 0.95, -Math.PI / 2, 1.2, 140, 35, 35);
    }
    if (t === 900) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 950) {
        document.getElementById('gameCanvas').style.filter = 'none';
        spawnBone(W + 10, H - 50, 12, 50, -1.5, 0, false);
        spawnBone(-20, H - 50, 12, 50, 1.5, 0, false);
        spawnBlaster(W * 0.05, H * 0.5, 0, 1.2, 140, 35, 35);
        spawnBlaster(W * 0.95, H * 0.5, Math.PI, 1.2, 140, 35, 35);
    }
    return t > 1400;
});

// Turn 16: 骨メイン＋ブラスター固定補助
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 140 === 0 && t < 1000) spawnBone(W + 10, H - 50, 12, 50, -1.0, 0, false);
    if (t % 140 === 70 && t < 1000) spawnBone(W + 10, 0, 12, H - 60, -1.0, 0, false);
    // ブラスター固定・斜め補助
    if (t === 200) spawnBlaster(W * 0.05, H * 0.05, Math.PI / 4, 1.2, 140, 35, 35);
    if (t === 500) spawnBlaster(W * 0.95, H * 0.05, Math.PI * 3 / 4, 1.2, 140, 35, 35);
    if (t === 800) { spawnBlaster(W * 0.05, H * 0.95, -Math.PI / 4, 1.2, 140, 35, 35); spawnBlaster(W * 0.95, H * 0.95, -Math.PI * 3 / 4, 1.2, 140, 35, 35); }
    return t > 1300;
});

// Turn 17: 連続重力スラム＋骨メイン＋ブラスター固定補助
Patterns.push((t) => {
    if (t === 0) p.isBlue = true;
    if (t === 30) { p.setGravityDir('LEFT'); spawnSlam('LEFT', 80, 25); }
    if (t === 80) { spawnBone(0, H * 0.4, 30, 12, 1.6, 0, false); spawnBone(0, H * 0.7, 30, 12, 1.6, 0, false); }
    if (t === 200) { p.setGravityDir('RIGHT'); spawnSlam('RIGHT', 80, 25); }
    if (t === 250) { spawnBone(W, H * 0.4, 30, 12, -1.6, 0, false); spawnBone(W, H * 0.7, 30, 12, -1.6, 0, false); }
    if (t === 370) { p.setGravityDir('UP'); spawnSlam('UP', 80, 25); }
    if (t === 420) { spawnBone(W + 10, H - 50, 12, 50, -1.6, 0, false); spawnBone(-20, H - 50, 12, 50, 1.6, 0, false); }
    if (t === 540) { p.setGravityDir('DOWN'); spawnSlam('DOWN', 80, 25); }
    if (t === 590) { spawnBone(W + 10, H - 50, 12, 50, -1.6, 0, false); spawnBone(-20, H - 50, 12, 50, 1.6, 0, false); }
    // ブラスター固定・補助
    if (t === 650) spawnBlaster(W * 0.5, H * 0.05, Math.PI / 2, 1, 140, 35, 35);
    return t > 900;
});

// Turn 18: 1発ずつポンポン追尾ブラスター
Patterns.push((t) => {
    if (t === 0) p.isBlue = false;

    // 四方から1発ずつポンポン出てくる（120フレーム間隔）
    const positions = [
        [-100, -100], [W / 2, -150], [W + 100, -100], [W + 150, H / 2],
        [W + 100, H + 100], [W / 2, H + 150], [-100, H + 100], [-150, H / 2],
        [W * 0.25, -150], [W * 0.75, -150], [W + 150, H * 0.25], [W + 150, H * 0.75],
        [W * 0.75, H + 150], [W * 0.25, H + 150], [-150, H * 0.75], [-150, H * 0.25],
    ];
    positions.forEach(([tx, ty], i) => {
        if (t === 30 + i * 120) {
            State.attacks.push(new GasterBlaster(tx, ty, null, 0.5, 60, 30, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        }
    });

    return t > 1950;
});
Patterns.push((t) => {
    if (t === 0) p.isBlue = false;
    if (t === 50) spawnBlaster(W / 2, H / 2, Math.PI / 2, 4.0, 160, 45, 55);
    if (t === 100) spawnBlaster(W * 0.1, H * 0.5, 0, 2.0, 160, 45, 45);
    if (t === 100) spawnBlaster(W * 0.9, H * 0.5, Math.PI, 2.0, 160, 45, 45);
    if (t === 430) spawnBlaster(W / 2, H / 2, Math.PI / 2, 3.5, 160, 45, 55);
    if (t === 480) spawnBlaster(W * 0.5, H * 0.1, Math.PI / 2, 2.0, 160, 45, 45);
    if (t === 480) spawnBlaster(W * 0.5, H * 0.9, -Math.PI / 2, 2.0, 160, 45, 45);
    if (t === 810) spawnBlaster(W / 2, H / 2, Math.PI / 2, 3.0, 160, 45, 55);
    if (t === 860) spawnBlaster(W * 0.1, H * 0.1, Math.PI * 0.25, 1.8, 160, 45, 45);
    if (t === 860) spawnBlaster(W * 0.9, H * 0.9, Math.PI * 1.25, 1.8, 160, 45, 45);
    if (t === 1190) spawnBlaster(W * 0.9, H * 0.1, Math.PI * 0.75, 1.8, 160, 45, 45);
    if (t === 1190) spawnBlaster(W * 0.1, H * 0.9, -Math.PI * 0.25, 1.8, 160, 45, 45);
    if (t === 1190) spawnBlaster(W / 2, H / 2, Math.PI / 2, 2.5, 160, 45, 55);
    return t > 1700;
});
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 100 === 0 && t < 700) spawnBone(W + 10, H - 40, 12, 40, -1.5, 0, false);
    if (t % 100 === 50 && t < 700) spawnBone(-20, H - 40, 12, 40, 1.5, 0, false);
    if (t === 200 || t === 500) spawnBone(W + 10, H - 60, 12, 60, -1.2, 0, true);
    return t > 900;
});
// ★追加ターン A: 枠が横長に縮む→上下から骨
Patterns.push((t) => {
    if (t === 0) {
        p.isBlue = true; p.gravityDir = 'DOWN';
        showMessage("そろそろ… おれの スペシャル攻撃の<br>準備が 整ってきたぜ。<br>早めに 終わらせといた ほうが いいんじゃないか？");
    }
    if (t === 120) hideMessage();

    const cW = canvas.width, cH = canvas.height;
    // 上下から骨（キャンバス全体に対して出す）
    if (t % 90 === 0 && t > 80 && t < 700) {
        spawnBone(Math.random() * cW, -20, 12, 40, 0, 1.5, false); // 上から
    }
    if (t % 90 === 45 && t > 80 && t < 700) {
        spawnBone(Math.random() * cW, cH + 20, 12, 40, 0, -1.5, false); // 下から
    }
    // ソウルをキャンバス内に収める
    p.x = Math.max(0, Math.min(cW - p.w, p.x));
    p.y = Math.max(0, Math.min(cH - p.h, p.y));

    return t > 900;
});

// ★追加ターン B: 枠が縦長に縮む→左右から骨
Patterns.push((t) => {
    if (t === 0) {
        p.isBlue = true; p.gravityDir = 'DOWN';
        showMessage("まじで… 早くしないと やばいぜ？<br>おれの スペシャル攻撃… そろそろ 来るからな。");
    }
    if (t === 120) hideMessage();

    const cW = canvas.width, cH = canvas.height;
    // 左右から骨
    if (t % 80 === 0 && t > 80 && t < 700) {
        spawnBone(-20, Math.random() * cH, 40, 12, 1.5, 0, false); // 左から
    }
    if (t % 80 === 40 && t > 80 && t < 700) {
        spawnBone(cW + 20, Math.random() * cH, 40, 12, -1.5, 0, false); // 右から
    }
    p.x = Math.max(0, Math.min(cW - p.w, p.x));
    p.y = Math.max(0, Math.min(cH - p.h, p.y));

    return t > 900;
});

// ★追加ターン C: 枠が小さく縮む→全方向から骨
Patterns.push((t) => {
    if (t === 0) {
        p.isBlue = true; p.gravityDir = 'DOWN';
        showMessage("ハハ… もう 時間切れだ。<br>おまえが 早くしないから こうなった。<br>…覚悟しろよ。");
    }
    if (t === 150) hideMessage();

    const cW = canvas.width, cH = canvas.height;
    // 四方から骨
    if (t % 60 === 0 && t > 100 && t < 700) {
        spawnBone(Math.random() * cW, -20, 12, 30, 0, 1.8, false);       // 上
        spawnBone(Math.random() * cW, cH + 20, 12, 30, 0, -1.8, false);  // 下
    }
    if (t % 60 === 30 && t > 100 && t < 700) {
        spawnBone(-20, Math.random() * cH, 30, 12, 1.8, 0, false);       // 左
        spawnBone(cW + 20, Math.random() * cH, 30, 12, -1.8, 0, false);  // 右
    }
    p.x = Math.max(0, Math.min(cW - p.w, p.x));
    p.y = Math.max(0, Math.min(cH - p.h, p.y));

    return t > 1000;
});

// ★偽スペシャルターン
Patterns.push((t) => {
    if (t === 0) { showMessage("これが おれの スペシャルこうげきだ。<br>…おまえの 旅は ここで終わりだ。"); p.setGravityDir('DOWN'); }
    if (t === 150) hideMessage();

    // フェーズ1: 重力叩きつけのみ
    if (t === 150) { p.setGravityDir('LEFT'); spawnSlam('LEFT', 40, 20); }
    if (t === 220) { p.setGravityDir('UP'); spawnSlam('UP', 40, 20); }
    if (t === 290) { p.setGravityDir('RIGHT'); spawnSlam('RIGHT', 40, 20); }
    if (t === 360) { p.setGravityDir('DOWN'); spawnSlam('DOWN', 40, 20); }

    // フェーズ2: ブラスターのみ
    if (t === 500) p.isBlue = false;
    if (t > 550 && t % 120 === 0 && t < 950) {
        spawnBlaster(W / 4, 0, Math.PI / 2, 1.5, 120, 20, 30);
        spawnBlaster(W * 3 / 4, H, -Math.PI / 2, 1.5, 120, 20, 30);
    }

    // フェーズ3: 洗濯機ブラスターのみ
    if (t === 1050) { p.resetPos(); p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t > 1100 && t % 60 === 0 && t < 1900) {
        const a = t * 0.012, r = Math.min(W, H) / 2 + 50;
        const tx = W / 2 + Math.cos(a) * r, ty = H / 2 + Math.sin(a) * r;
        spawnBlaster(tx, ty, Math.atan2(H / 2 - ty, W / 2 - tx), 0.5, 130, 30, 35);
    }

    // ★終了前にセリフ→本物スペシャルへの予告
    if (t === 2000) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 2100) {
        document.getElementById('gameCanvas').style.filter = 'none';
        p.isBlue = true; p.setGravityDir('DOWN');
        showMessage("ハァ... ハァ...<br>…やれやれ。");
    }
    if (t === 2300) { showMessage("…これが おれの スペシャルこうげきだと<br>おもったか？"); }
    if (t === 2600) { showMessage("ほんとうの スペシャルこうげきを<br>お見舞いするからな？<br>骨が 折れるぜ。 …骨だけに。"); }
    if (t === 2900) hideMessage();
    return t > 2950;
});

// ★本物スペシャルターン（簡単ver）
Patterns.push((t) => {
    if (t === 0) { showMessage("いくぞ。"); p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t === 80) hideMessage();

    // 骨（ゆっくり・交互）
    if (t % 120 === 0 && t > 80 && t < 600) spawnBone(W + 10, H - 50, 12, 50, -1.3, 0, false);
    if (t % 120 === 60 && t > 80 && t < 600) spawnBone(W + 10, 0, 12, H - 60, -1.3, 0, false);

    // 重力4方向（警告時間長め）
    if (t === 650) { p.setGravityDir('LEFT'); spawnSlam('LEFT', 90, 25); }
    if (t === 850) { p.setGravityDir('UP'); spawnSlam('UP', 90, 25); }
    if (t === 1050) { p.setGravityDir('RIGHT'); spawnSlam('RIGHT', 90, 25); }
    if (t === 1250) { p.setGravityDir('DOWN'); spawnSlam('DOWN', 90, 25); }

    // 4方向ブラスター1波（予告たっぷり）
    if (t === 1450) {
        p.isBlue = false;
        const pos = [[-100, -100], [W + 100, -100], [W + 100, H + 100], [-100, H + 100]];
        pos.forEach(([tx, ty]) => State.attacks.push(new GasterBlaster(tx, ty, null, 0.8, 200, 50, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2)));
    }

    // 洗濯機ブラスター（ゆっくり・細い）
    if (t === 1900) { p.resetPos(); p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t > 1950 && t % 70 === 0 && t < 2700) {
        const a = t * 0.010, r = Math.min(W, H) / 2 + 50;
        const tx = W / 2 + Math.cos(a) * r, ty = H / 2 + Math.sin(a) * r;
        spawnBlaster(tx, ty, Math.atan2(H / 2 - ty, W / 2 - tx), 0.5, 160, 40, 40);
    }

    // エンディング
    if (t === 2800) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 3000) {
        document.getElementById('gameCanvas').style.filter = 'none';
        showMessage("ハァ... ハァ...<br>…パピルス。 おれは 約束を 守れなかった。");
    }
    if (t === 3150) { hideMessage(); p.isBlue = true; p.setGravityDir('DOWN'); }
    return t > 3200;
});

// ★Phase2突入演出
Patterns.push((t) => {
    if (t === 0) {
        p.isBlue = true; p.gravityDir = 'DOWN';
        State.attacks = [];
        document.getElementById('gameCanvas').style.filter = 'brightness(0)';
    }
    if (t === 90) {
        document.getElementById('gameCanvas').style.filter = 'none';
        showMessage("ハァ... ハァ...<br>…まだ 終わって ないぞ。");
    }
    if (t === 240) showMessage("おれは… まだ<br>本当の力を 出してない。");
    if (t === 390) showMessage("…悪く思うなよ。<br>パピルス。");
    if (t === 540) { hideMessage(); document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 600) {
        document.getElementById('gameCanvas').style.filter = 'none';
        // 全方向ブラスターチラ見せ
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            State.attacks.push(new GasterBlaster(
                W / 2 + Math.cos(angle) * 400, H / 2 + Math.sin(angle) * 300,
                null, 1.2, 60, 0, 0, 'normal', W / 2, H / 2
            ));
        }
    }
    if (t === 680) { State.attacks = []; document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 740) { document.getElementById('gameCanvas').style.filter = 'none'; showMessage("いくぞ。"); }
    if (t === 860) { hideMessage(); }
    return t > 900;
});

// ★Phase2 Turn1: 骨の嵐（速い・Phase1より高速）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t % 60 === 0 && t < 700) spawnBone(W + 10, H - 50, 12, 50, -1.8, 0, false);
    if (t % 60 === 30 && t < 700) spawnBone(W + 10, 0, 12, H - 60, -1.8, 0, false);
    if (t % 60 === 15 && t < 700) spawnBone(-20, H - 50, 12, 50, 1.8, 0, false);
    return t > 900;
});

// ★Phase2 Turn2: 重力4方向連続＋骨
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; }
    if (t === 30) { p.setGravityDir('LEFT'); spawnSlam('LEFT', 60, 25); }
    if (t === 60) spawnBone(0, H * 0.4, 30, 12, 1.8, 0, false);
    if (t === 190) { p.setGravityDir('UP'); spawnSlam('UP', 60, 25); }
    if (t === 220) spawnBone(W * 0.4, 0, 12, 30, 0, 1.8, false);
    if (t === 350) { p.setGravityDir('RIGHT'); spawnSlam('RIGHT', 60, 25); }
    if (t === 380) spawnBone(W, H * 0.4, 30, 12, -1.8, 0, false);
    if (t === 510) { p.setGravityDir('DOWN'); spawnSlam('DOWN', 60, 25); }
    if (t === 600) spawnBlaster(W * 0.2, H * 0.2, null, 0.8, 60, 30, 35);
    if (t === 700) spawnBlaster(W * 0.8, H * 0.8, null, 0.8, 60, 30, 35);
    return t > 900;
});

// ★Phase2 Turn3: 追尾ブラスター＋骨（複合・速い）
Patterns.push((t) => {
    if (t === 0) p.isBlue = false;
    if (t % 80 === 0 && t < 800) {
        const gap = 60 + Math.random() * (H - 150);
        spawnBone(W + 10, 0, 12, gap - 20, -1.8, 0, false);
        spawnBone(W + 10, gap + 20, 12, H, -1.8, 0, false);
    }
    if (t === 60) spawnBlaster(W * 0.1, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 180) spawnBlaster(W * 0.9, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 300) spawnBlaster(W * 0.9, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 420) spawnBlaster(W * 0.1, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 540) spawnBlaster(W * 0.5, H * 0.05, null, 0.8, 60, 30, 35);
    if (t === 660) spawnBlaster(W * 0.5, H * 0.95, null, 0.8, 60, 30, 35);
    return t > 1000;
});

// ★Phase2 Turn4: 暗転＋全方向ブラスター連続
Patterns.push((t) => {
    if (t === 0) p.isBlue = false;
    if (t === 30) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 80) {
        document.getElementById('gameCanvas').style.filter = 'none';
        spawnBlaster(W * 0.1, H * 0.1, null, 0.8, 60, 30, 35);
        spawnBlaster(W * 0.9, H * 0.9, null, 0.8, 60, 30, 35);
    }
    if (t === 280) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 330) {
        document.getElementById('gameCanvas').style.filter = 'none';
        spawnBlaster(W * 0.9, H * 0.1, null, 0.8, 60, 30, 35);
        spawnBlaster(W * 0.1, H * 0.9, null, 0.8, 60, 30, 35);
        spawnBlaster(W * 0.5, H * 0.5, null, 0.8, 60, 30, 35);
    }
    if (t === 580) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 630) {
        document.getElementById('gameCanvas').style.filter = 'none';
        spawnBlaster(W * 0.2, H * 0.2, null, 0.8, 60, 30, 35);
        spawnBlaster(W * 0.8, H * 0.2, null, 0.8, 60, 30, 35);
        spawnBlaster(W * 0.2, H * 0.8, null, 0.8, 60, 30, 35);
        spawnBlaster(W * 0.8, H * 0.8, null, 0.8, 60, 30, 35);
    }
    return t > 1000;
});

// ★Phase2 Turn5: 18ターン型一斉追尾（最終）
Patterns.push((t) => {
    if (t === 0) p.isBlue = false;
    const positions = [
        [-100, -100], [W / 2, -150], [W + 100, -100], [W + 150, H / 2],
        [W + 100, H + 100], [W / 2, H + 150], [-100, H + 100], [-150, H / 2],
        [W * 0.25, -150], [W * 0.75, -150], [W + 150, H * 0.25], [W + 150, H * 0.75],
        [W * 0.75, H + 150], [W * 0.25, H + 150], [-150, H * 0.75], [-150, H * 0.25],
    ];
    positions.forEach(([tx, ty], i) => {
        if (t === 30 + i * 90) {
            State.attacks.push(new GasterBlaster(tx, ty, null, 0.5, 60, 30, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2));
        }
    });
    return t > 1800;
});

// ★Phase2 Turn6: 重力＋骨の嵐＋ブラスター複合
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; }
    if (t === 30) { p.setGravityDir('LEFT'); spawnSlam('LEFT', 60, 25); }
    if (t === 200) { p.setGravityDir('DOWN'); spawnSlam('DOWN', 60, 25); }
    if (t === 370) { p.setGravityDir('RIGHT'); spawnSlam('RIGHT', 60, 25); }
    if (t === 540) { p.setGravityDir('UP'); spawnSlam('UP', 60, 25); }
    if (t === 710) { p.setGravityDir('DOWN'); p.isBlue = false; }
    if (t % 70 === 0 && t > 710 && t < 1100) {
        const gap = 60 + Math.random() * (H - 150);
        spawnBone(W + 10, 0, 12, gap - 20, -1.8, 0, false);
        spawnBone(W + 10, gap + 20, 12, H, -1.8, 0, false);
    }
    if (t === 750) spawnBlaster(W * 0.1, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 870) spawnBlaster(W * 0.9, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 990) spawnBlaster(W * 0.5, H * 0.05, null, 0.8, 60, 30, 35);
    return t > 1300;
});

// ★Phase2 Turn7: 高速追尾ブラスター連続（2秒に1発・速い）
Patterns.push((t) => {
    if (t === 0) p.isBlue = false;
    if (t === 30) spawnBlaster(W * 0.1, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 150) spawnBlaster(W * 0.9, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 270) spawnBlaster(W * 0.9, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 390) spawnBlaster(W * 0.1, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 510) spawnBlaster(W * 0.5, H * 0.05, null, 0.8, 60, 30, 35);
    if (t === 630) spawnBlaster(W * 0.05, H * 0.5, null, 0.8, 60, 30, 35);
    if (t === 750) spawnBlaster(W * 0.95, H * 0.5, null, 0.8, 60, 30, 35);
    if (t === 870) spawnBlaster(W * 0.5, H * 0.95, null, 0.8, 60, 30, 35);
    if (t === 990) spawnBlaster(W * 0.2, H * 0.5, null, 0.8, 60, 30, 35);
    if (t === 1110) spawnBlaster(W * 0.8, H * 0.5, null, 0.8, 60, 30, 35);
    return t > 1400;
});

// ★Phase2 Turn8: 暗転＋骨嵐＋重力同時
Patterns.push((t) => {
    if (t === 0) { p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t === 30) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 80) {
        document.getElementById('gameCanvas').style.filter = 'none';
        p.isBlue = true;
    }
    if (t % 50 === 0 && t > 80 && t < 700) spawnBone(W + 10, H - 50, 12, 50, -2.0, 0, false);
    if (t % 50 === 25 && t > 80 && t < 700) spawnBone(-20, H - 50, 12, 50, 2.0, 0, false);
    if (t === 400) { p.setGravityDir('LEFT'); spawnSlam('LEFT', 50, 20); }
    if (t === 550) { p.setGravityDir('DOWN'); spawnSlam('DOWN', 50, 20); }
    if (t === 700) { document.getElementById('gameCanvas').style.filter = 'brightness(0)'; }
    if (t === 750) { document.getElementById('gameCanvas').style.filter = 'none'; p.isBlue = false; }
    if (t % 70 === 0 && t > 750 && t < 1100) {
        const gap = 60 + Math.random() * (H - 150);
        spawnBone(W + 10, 0, 12, gap - 20, -2.0, 0, false);
        spawnBone(W + 10, gap + 20, 12, H, -2.0, 0, false);
    }
    return t > 1300;
});

// ★Phase2 Turn9: 洗濯機ブラスター（速め）＋隙間骨
Patterns.push((t) => {
    if (t === 0) { p.resetPos(); p.isBlue = true; p.gravityDir = 'DOWN'; }
    if (t > 30 && t % 50 === 0 && t < 1200) {
        const a = t * 0.02, r = Math.min(W, H) / 2 + 50;
        const tx = W / 2 + Math.cos(a) * r, ty = H / 2 + Math.sin(a) * r;
        spawnBlaster(tx, ty, Math.atan2(H / 2 - ty, W / 2 - tx), 0.8, 60, 30, 35);
    }
    if (t % 90 === 0 && t > 30 && t < 1200) spawnBone(W + 10, H - 50, 12, 50, -1.6, 0, false);
    if (t % 90 === 45 && t > 30 && t < 1200) spawnBone(W + 10, 0, 12, H - 60, -1.6, 0, false);
    return t > 1400;
});

// ★Phase2 Turn10: 全部盛り（最終ターン）
Patterns.push((t) => {
    if (t === 0) { p.isBlue = false; }

    // 骨の嵐
    if (t % 45 === 0 && t < 600) {
        spawnBone(W + 10, H - 50, 12, 50, -2.0, 0, false);
        spawnBone(-20, H - 50, 12, 50, 2.0, 0, false);
    }
    // 追尾ブラスター2秒に1発
    if (t === 60) spawnBlaster(W * 0.1, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 180) spawnBlaster(W * 0.9, H * 0.9, null, 0.8, 60, 30, 35);
    if (t === 300) spawnBlaster(W * 0.9, H * 0.1, null, 0.8, 60, 30, 35);
    if (t === 420) spawnBlaster(W * 0.1, H * 0.9, null, 0.8, 60, 30, 35);

    // 重力
    if (t === 650) { p.isBlue = true; p.setGravityDir('LEFT'); spawnSlam('LEFT', 60, 25); }
    if (t === 800) { p.setGravityDir('UP'); spawnSlam('UP', 60, 25); }
    if (t === 950) { p.setGravityDir('RIGHT'); spawnSlam('RIGHT', 60, 25); }
    if (t === 1100) { p.setGravityDir('DOWN'); spawnSlam('DOWN', 60, 25); }

    // 最後に16方向ブラスター一斉
    if (t === 1300) {
        p.isBlue = false;
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = Math.max(W, H);
            State.attacks.push(new GasterBlaster(
                W / 2 + Math.cos(angle) * r, H / 2 + Math.sin(angle) * r,
                null, 0.5, 60, 30, 40, 'normal', p.x + p.w / 2, p.y + p.h / 2
            ));
        }
    }

    // エンディングメッセージ
    if (t === 1700) {
        p.isBlue = true; p.setGravityDir('DOWN');
        showMessage("ハァ... ハァ...<br>…パピルス。 おれは 約束を 守れなかった。");
    }
    if (t === 1850) hideMessage();
    return t > 1900;
});

// ★攻撃終了後の正しい流れ:
// 攻撃終了 → セリフ表示（turnState=2のまま） → セリフ終了 → プレイヤーターン(turnState=0)
// FIGHTを押す → 演出(turnState=2) → triggerTransition → 次の攻撃(turnState=1)
function endAttackWithDialogue() {
    State.attacks = [];
    State.patternTimer = 0; State.patternDone = false; State.postAttackTimer = 0;
    const dialogue = turnDialogues[State.turnIndex];
    if (dialogue) {
        State.turnState = 2;
        showMessage(dialogue);
        setTimeout(() => { hideMessage(); State.turnState = 0; }, 3500);
    } else {
        State.turnState = 0;
    }
}

function triggerTransition() {
    playSound('transition');
    State.inTransition = true; State.attacks = [];
    setTimeout(() => {
        State.inTransition = false; hideMessage();
        State.turnIndex = Math.min(State.turnIndex + 1, Patterns.length - 1);
        State.patternTimer = 0; State.patternDone = false; State.postAttackTimer = 0;
        if (State.turnIndex === 10) {
            State.turnState = 1; // ★通常の攻撃フローで進める
        } else {
            State.turnState = 1;
        }
        updateArenaStyle();
    }, 50);
}

function update() {
    State.frameCount++;
    if (!State.inTransition && !State.isGameOver) {
        p.update();
        if (State.turnState === 1) {
            if (State.patternTimer < 30) { State.patternTimer++; }
            else {
                if (!State.patternDone) State.patternDone = Patterns[State.turnIndex](State.patternTimer - 30);
                State.patternTimer++;
            }
            if (State.patternDone && State.attacks.length === 0) {
                State.postAttackTimer++;
                if (State.postAttackTimer > 60) {
                    State.turnState = 2;
                    endAttackWithDialogue();
                }
            }
        }
        if (State.turnState === 4) {
            State.trapTimer++;
            if (State.trapTimer === 10) { showMessage("げーーーーーっと<br>だーーーーーんく！！！"); p.isBlue = true; p.gravityDir = 'DOWN'; }
            if (State.trapTimer > 150) { State.isGameOver = true; hideMessage(); playSound('gameover'); }
        }
        for (let i = State.attacks.length - 1; i >= 0; i--) {
            const attack = State.attacks[i];
            if (!attack) { State.attacks.splice(i, 1); continue; }
            if (attack instanceof GasterBlaster) attack.update(p); else attack.update();
            if (attack.checkCollision(p)) { applyDamage(1); playSound('damage'); }
            if (attack.dead) State.attacks.splice(i, 1);
        }
    }
    if (State.screenShake > 0) {
        State.screenShake -= 0.5;
        canvas.style.transform = `translate(${(Math.random() - 0.5) * State.screenShake}px,${(Math.random() - 0.5) * State.screenShake}px)`;
    } else { canvas.style.transform = 'none'; }
    updateUI();
}

function drawArena() {
    const idx = State.turnIndex;
    let arenaX, arenaY, arenaW, arenaH;
    if (idx === 20) { canvas.width = 440; canvas.height = 120; }
    else if (idx === 21) { canvas.width = 160; canvas.height = 320; }
    else if (idx === 22) { canvas.width = 260; canvas.height = 160; }
    else { canvas.width = 600; canvas.height = 400; }
    p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
    p.y = Math.max(0, Math.min(canvas.height - p.h, p.y));
}

const elArena = document.getElementById('arena');
function updateArenaStyle() {
    const idx = State.turnIndex;
    if (idx === 20) { canvas.width = 440; canvas.height = 120; }
    else if (idx === 21) { canvas.width = 160; canvas.height = 320; }
    else if (idx === 22) { canvas.width = 260; canvas.height = 160; }
    else { canvas.width = 600; canvas.height = 400; }
    p.x = canvas.width / 2 - p.w / 2;
    p.y = canvas.height / 2 - p.h / 2;
    p.vx = 0; p.vy = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (State.isGameOver) return; // ゲームオーバー時はHTML側で表示
    p.draw(ctx);
    for (const attack of State.attacks) attack.draw(ctx);
}

// ゲームオーバー画面を表示
// ★ソウルが砕ける演出
function soulBreakEffect() {
    // 破片を生成
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const pieces = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2.5;
        pieces.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 5,
            alpha: 1.0,
            color: p.isBlue ? '#0033ff' : '#ff0000',
        });
    }

    let frame = 0;
    const totalFrames = 80;

    function animateBreak() {
        // 黒背景で画面を覆う
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        // 破片を動かして描画
        pieces.forEach(piece => {
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.vy += 0.1; // 重力
            piece.alpha -= 0.012;
            piece.size *= 0.98;

            if (piece.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, piece.alpha);
            ctx.fillStyle = piece.color;
            ctx.beginPath();
            ctx.arc(piece.x, piece.y, piece.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        frame++;
        if (frame < totalFrames) {
            requestAnimationFrame(animateBreak);
        } else {
            // 演出終了→ゲームオーバー音→画面表示
            playSound('gameover');
            showGameOver();
        }
    }

    requestAnimationFrame(animateBreak);
}

function showGameOver() {
    hideMessage();
    State.turnState = 2;
    elFlash.classList.remove('hidden');
    setTimeout(() => {
        elFlash.classList.add('hidden');
        const goScreen = document.getElementById('gameover-screen');
        if (goScreen) {
            goScreen.classList.remove('hidden');
        } else {
            // gameover-screenがない場合はcanvasに直接描画
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '18px monospace';
            ctx.fillStyle = '#888';
            ctx.fillText('F5キーでリトライ', canvas.width / 2, canvas.height / 2 + 20);
        }
    }, 800);
}

// リトライ処理
const retryBtn = document.getElementById('retry-btn');
if (retryBtn) {
    retryBtn.style.cursor = 'pointer';
    retryBtn.style.zIndex = '10000';
    retryBtn.style.position = 'relative';
    retryBtn.style.pointerEvents = 'auto';
    retryBtn.onclick = () => {
        try { location.reload(true); } catch (e) {
            try { window.location.reload(); } catch (e2) {
                alert('F5キーを押してリトライしてください');
            }
        }
    };
}

function loop() {
    if (!State.isGameOver) update();
    draw();
    requestAnimationFrame(loop);
}

allMenuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (State.turnState !== 0 || State.isGameOver) return;
        if (State.turnIndex === 10) {
            if (e.target.id === 'mercy-btn') {
                hideMessage(); State.turnState = 4; State.trapTimer = 0; State.attacks = [];
                State.attacks.push(new SlamBone('DOWN', 300, H - 20)); return;
            } else if (e.target.id === 'fight-btn') {
                hideMessage(); State.turnState = 2;
                slashEffect(); elMiss.classList.remove('hidden'); playSound('miss');
                setTimeout(() => {
                    elSans.style.transition = 'transform 0.2s'; elSans.style.transform = 'translateX(0)'; elMiss.classList.add('hidden');
                    showMessage('…わかったよ'); setTimeout(triggerTransition, 1000);
                }, 1000); return;
            }
        }
        State.turnState = 2;
        if (e.target.id === 'fight-btn') {
            slashEffect(); elMiss.classList.remove('hidden');
            setTimeout(() => { elSans.style.transition = 'transform 0.2s'; elSans.style.transform = 'translateX(0)'; elMiss.classList.add('hidden'); triggerTransition(); }, 1000);
        } else if (e.target.id === 'item-btn') {
            if (State.items > 0) {
                State.items--; State.hp = State.maxHp; State.kr = 0; playSound('item');
                showMessage('アイテムをつかって<br>ぜんかいふく した！'); updateUI(); setTimeout(triggerTransition, 1500);
            } else { State.turnState = 0; return; }
        } else if (e.target.id === 'act-btn') {
            showMessage('サンズ ATK 1 DEF 1<br>てきの なかで いちばん よわい。');
            setTimeout(triggerTransition, 2000);
        } else {
            setTimeout(triggerTransition, 500);
        }
    });
});

// 開幕：セリフ→予告→必殺技→本編
setTimeout(() => {
    loop();
    State.turnState = 2;

    // セリフ1
    showMessage("よう。<br>また 来たのか。<br>やれやれ。");

    setTimeout(() => {
        showMessage("めんどくさいから<br>さいしょから ほんきだそうかと<br>おもったんだけどな。");
    }, 2500);

    setTimeout(() => {
        showMessage("…こういうやつだ。");
    }, 5000);

    // 必殺技
    setTimeout(() => {
        // 骨が長い時間続く（低い骨と高い骨が交互）
        for (let i = 0; i < 14; i++) {
            setTimeout(() => {
                if (i % 2 === 0) {
                    spawnBone(W + 10, H - 55, 12, 55, -1.2, 0, false);
                } else {
                    spawnBone(W + 10, 0, 12, H - 65, -1.2, 0, false);
                }
            }, i * 600);
        }

        // ブラスターは固定角度で4発（四隅から中央方向）
        setTimeout(() => { spawnBlaster(W * 0.1, H * 0.1, Math.PI * 0.25, 1, 150, 40, 35); }, 300);
        setTimeout(() => { spawnBlaster(W * 0.9, H * 0.9, Math.PI * 1.25, 1, 150, 40, 35); }, 1200);
        setTimeout(() => { spawnBlaster(W * 0.9, H * 0.1, Math.PI * 0.75, 1, 150, 40, 35); }, 2500);
        setTimeout(() => { spawnBlaster(W * 0.1, H * 0.9, Math.PI * 1.75, 1, 150, 40, 35); }, 3800);

    }, 6400);

    // 攻撃後にセリフ
    setTimeout(() => {
        State.attacks = [];
        showMessage("…まあ 冗談だ。<br>やれやれ。<br>骨が 折れるぜ。 …骨だけに。");
    }, 13500);

    // 本編スタート
    setTimeout(() => {
        hideMessage();
        State.turnState = 0;
        startBGM(); // ★BGM開始
    }, 16000);

}, 200);
// ★メガロヴァニア風BGM（Web Audio API）
// game.jsの先頭付近（audioCtx定義の後）に追加してください

function createMegaloBGM() {
    const ctx = audioCtx;
    if (!ctx) return null;

    const BPM = 160;
    const b = 60 / BPM;
    const e4 = b;
    const e8 = b / 2;
    const e16 = b / 4;
    const e8d = e8 * 1.5;
    const e4d = e4 * 1.5;

    const F = {
        'D2': 73.42, 'A2': 110.00, 'C3': 130.81, 'C#3': 138.59, 'D3': 146.83,
        'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65,
        'A3': 220.00, 'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18,
        'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99,
        'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
        'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
        'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
        'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50, 'D6': 1174.66,
    };

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(ctx.destination);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.attack.value = 0.002;
    comp.release.value = 0.15;
    comp.connect(masterGain);

    function n(freq, t, dur, type = 'square', vol = 0.15, det = 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(comp);
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = det;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.005);
        g.gain.setValueAtTime(vol, t + dur * 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
        osc.start(t);
        osc.stop(t + dur);
    }

    function kick(t, vol = 0.6) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(comp);
        o.frequency.setValueAtTime(160, t);
        o.frequency.exponentialRampToValueAtTime(28, t + 0.13);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
        o.start(t); o.stop(t + 0.16);
    }

    function snare(t, vol = 0.38) {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        s.buffer = buf; s.connect(f); f.connect(g); g.connect(comp);
        f.type = 'highpass'; f.frequency.value = 1300;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        s.start(t);
    }

    function hat(t, vol = 0.07, open = false) {
        const dur = open ? 0.1 : 0.025;
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        s.buffer = buf; s.connect(f); f.connect(g); g.connect(comp);
        f.type = 'highpass'; f.frequency.value = 9000;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        s.start(t);
    }

    function crash(t) {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        s.buffer = buf; s.connect(f); f.connect(g); g.connect(comp);
        f.type = 'highpass'; f.frequency.value = 4000;
        g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        s.start(t);
    }

    // ★本家メガロヴァニア ベースライン（完全再現）
    // D D D A G# - G - F - D E F G
    const bass = [
        ['D3', e16], ['D3', e16], ['D3', e8],
        ['D4', e8], ['A3', e8],
        ['G#3', e16], ['G#3', e16], ['G3', e8],
        ['F3', e16], ['F3', e16],
        ['E3', e16], ['E3', e16], ['E3', e8],
        ['C4', e8], ['G#3', e8],
        ['G3', e16], ['G3', e16], ['E3', e8],
        ['D3', e16], ['D3', e16],
    ];

    // ★本家メガロヴァニア メロディ第1フレーズ
    // 「HA! You think you can beat me?」の部分
    const melA = [
        ['D5', e4], ['D5', e4],
        ['D5', e8], ['A4', e8d], ['A4', e16],
        ['G#4', e4], ['G4', e4],
        ['F4', e8], ['D4', e8], ['F4', e8], ['G4', e8],
    ];

    // ★本家メガロヴァニア メロディ第2フレーズ
    const melB = [
        ['C5', e4], ['C5', e4],
        ['C5', e8], ['G4', e8d], ['G4', e16],
        ['F#4', e4], ['F4', e4],
        ['E4', e8], ['C4', e8], ['E4', e8], ['F4', e8],
    ];

    // ★本家メガロヴァニア サビメロディ（盛り上がり部分）
    const melC = [
        ['D5', e8], ['E5', e8], ['F5', e8], ['D5', e8],
        ['E5', e8], ['D5', e8], ['C5', e8], ['D5', e8],
        ['A4', e8], ['A#4', e8], ['C5', e8], ['A4', e8],
        ['A#4', e8], ['A4', e8], ['G4', e8], ['A4', e8],
    ];

    // ★本家メガロヴァニア 対旋律
    const melD = [
        ['A5', e8], ['G5', e8], ['F5', e8], ['E5', e8],
        ['F5', e8], ['E5', e8], ['D5', e8], ['E5', e8],
        ['C5', e8], ['D5', e8], ['E5', e8], ['F5', e8],
        ['G5', e4], ['F#5', e8], ['F5', e8],
    ];

    const bar = e16 * 32;

    // ★曲の構成（だんだん盛り上がる・本家に近い）
    const structure = [
        'bass_only',   // 1: ベースのみ
        'bass_only',   // 2: ベースのみ
        'drums',       // 3: ドラム追加
        'drums',       // 4: ドラム
        'melA',        // 5: メロディA（第1フレーズ）
        'melA',        // 6: メロディA
        'melB',        // 7: メロディB（第2フレーズ）
        'melB',        // 8: メロディB
        'build',       // 9: ビルドアップ
        'chorus',      // 10: サビ
        'chorus',      // 11: サビ
        'chorus',      // 12: サビ
        'chorus',      // 13: サビ
        'drums',       // 14: 落ち着く
        'melA',        // 15: メロディA再び
        'melB',        // 16: メロディB
        'build',       // 17: ビルドアップ
        'chorus',      // 18: サビ再び
        'chorus',
        'chorus',
        'chorus',
    ];

    let loopCount = 0;
    let scheduledUntil = 0;

    function scheduleBar(t, section) {
        // ★ベースライン（全セクション）
        const bassVol = section === 'bass_only' ? 0.18
            : section === 'chorus' ? 0.22 : 0.17;
        let bt = t;
        for (const [note, dur] of bass) {
            n(F[note], bt, dur * 0.85, 'sawtooth', bassVol);
            if (section !== 'bass_only') {
                n(F[note] * 2, bt, dur * 0.8, 'square', bassVol * 0.2);
            }
            bt += dur;
        }

        // ★ドラム
        if (section !== 'bass_only') {
            for (let i = 0; i < 32; i++) {
                const nt = t + i * e16;
                if (i === 0 || i === 16) kick(nt);
                if (section === 'chorus' && i === 12) kick(nt, 0.35);
                if (i === 8 || i === 24) snare(nt);
                const hv = section === 'chorus' ? 0.09 : 0.065;
                hat(nt, i % 2 === 0 ? hv : hv * 0.5, i % 8 === 7);
            }
            if (section === 'chorus' || section === 'melA') crash(t);
        }

        // ★メロディA（第1フレーズ）
        if (section === 'melA' || section === 'build') {
            let mt = t;
            const vol = section === 'build' ? 0.13 : 0.14;
            for (const [note, dur] of melA) {
                n(F[note], mt, dur * 0.82, 'square', vol, -8);
                if (section === 'build') n(F[note], mt, dur * 0.82, 'square', 0.05, 8);
                mt += dur;
                if (mt > t + bar) break;
            }
        }

        // ★メロディB（第2フレーズ）
        if (section === 'melB') {
            let mt = t;
            for (const [note, dur] of melB) {
                n(F[note], mt, dur * 0.82, 'square', 0.13, -8);
                mt += dur;
                if (mt > t + bar) break;
            }
        }

        // ★サビ（C+D同時・最も盛り上がる）
        if (section === 'chorus') {
            // メロディC（サビメイン）
            let mt = t;
            for (const [note, dur] of melC) {
                n(F[note], mt, dur * 0.8, 'square', 0.16, -10);
                n(F[note], mt, dur * 0.8, 'sawtooth', 0.06, 12);
                n(F[note] * 0.5, mt, dur * 0.8, 'square', 0.06);
                mt += dur;
                if (mt > t + bar) break;
            }
            // 対旋律D
            let ct = t;
            for (const [note, dur] of melD) {
                n(F[note], ct, dur * 0.75, 'square', 0.07, 5);
                ct += dur;
                if (ct > t + bar) break;
            }
        }
    }

    function scheduler() {
        const now = ctx.currentTime;
        while (scheduledUntil < now + 1.0) {
            const section = structure[loopCount % structure.length];
            const startTime = scheduledUntil === 0 ? now + 0.1 : scheduledUntil;
            scheduleBar(startTime, section);
            scheduledUntil = startTime + bar;
            loopCount++;
        }
    }

    const intervalId = setInterval(scheduler, 200);
    scheduler();

    return {
        stop: () => {
            clearInterval(intervalId);
            masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        },
        masterGain,
    };
}

// BGMを開始する関数
let bgm = null;
function startBGM() {
    if (bgm) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    bgm = createMegaloBGM();
}
function stopBGM() {
    if (bgm) { bgm.stop(); bgm = null; }
}