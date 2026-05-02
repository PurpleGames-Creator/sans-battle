< !DOCTYPE html >
    <html lang="ja">
        <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <title>Sans Battle</title>
                    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
                        <style>
                            * {margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
                            body {background: #000; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; font-family: 'Press Start 2P', monospace; touch-action: none; }

                            #game-container {display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 640px; }

                            /* サンズ */
                            #enemy-container {position: relative; width: 100%; display: flex; justify-content: center; align-items: flex-end; height: 180px; }
                            #sans-sprite {height: 160px; width: auto; image-rendering: pixelated; transition: transform 0.1s ease-out; }
                            #miss-text {position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: #bbb; font-size: 16px; font-family: 'Press Start 2P', monospace; }
                            #speech-bubble {position: absolute; top: 10px; left: 105%; background: #000; border: 3px solid #fff; padding: 8px 12px; max-width: 220px; z-index: 10; }
                            #speech-bubble::before {content: ''; position: absolute; left: -18px; top: 14px; border: 8px solid transparent; border-right-color: #fff; }
                            #speech-text {color: #fff; font-size: 9px; line-height: 1.8; font-family: 'Press Start 2P', monospace; }

                            /* アリーナ */
                            #arena {border: 4px solid #fff; background: #000; position: relative; width: 100%; }
                            #gameCanvas {display: block; width: 100%; height: auto; }

                            /* UI */
                            #ui-container {width: 100%; padding: 6px 0 4px 0; background: #000; }
                            .hp-row {display: flex; align-items: center; gap: 6px; padding: 4px 8px; color: #fff; font-family: 'Press Start 2P', monospace; flex-wrap: nowrap; }
                            .player-name {font - size: 9px; color: #fff; white-space: nowrap; }
                            .lv-label {font - size: 8px; color: #fff; white-space: nowrap; }
                            .hp-label-ut {font - size: 8px; color: #fff; white-space: nowrap; }
                            .hp-bar-wrapper {display: flex; height: 16px; flex: 1; max-width: 200px; background: #000; border: 2px solid #fff; overflow: hidden; position: relative; }
                            #hp-bar-fill {height: 100%; background: #ffff00; position: absolute; left: 0; top: 0; transition: width 0.1s; }
                            #kr-bar-fill {height: 100%; background: #ff69b4; position: absolute; top: 0; transition: width 0.1s, left 0.1s; }
                            #hp-text {font - size: 8px; color: #ff69b4; white-space: nowrap; }
                            .kr-label {color: #ff69b4; font-size: 8px; font-family: 'Press Start 2P', monospace; }
                            #kr-text {color: #ff69b4; font-size: 8px; font-family: 'Press Start 2P', monospace; }

                            /* メニューボタン */
                            .controls {display: flex; justify-content: center; gap: 4px; padding: 4px 4px 6px; }
                            .menu-btn {background: #000; color: #fff; border: 3px solid #ff8c00; font-family: 'Press Start 2P', monospace; font-size: 9px; padding: 8px 0; flex: 1; max-width: 140px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; touch-action: manipulation; user-select: none; }
                            .menu-btn:active {background: #333300; }
                            .btn-icon {font - size: 11px; }

                            /* ★バーチャルパッド */
                            #virtual-pad {display: none; width: 100%; padding: 8px 16px; background: #000; justify-content: space-between; align-items: center; }
                            @media (pointer: coarse) {#virtual - pad {display: flex; } }

                            /* 十字キー */
                            #dpad {position: relative; width: 120px; height: 120px; }
                            .dpad-btn {
                                position: absolute; background: rgba(255,255,255,0.15);
                            border: 2px solid rgba(255,255,255,0.4); border-radius: 6px;
                            display: flex; align-items: center; justify-content: center;
                            color: white; font-size: 18px; cursor: pointer;
                            touch-action: manipulation; user-select: none;
        }
                            .dpad-btn:active {background: rgba(255,255,255,0.35); }
                            #dpad-up    {width: 36px; height: 36px; top: 0;   left: 42px; }
                            #dpad-down  {width: 36px; height: 36px; bottom: 0; left: 42px; }
                            #dpad-left  {width: 36px; height: 36px; top: 42px; left: 0;   }
                            #dpad-right {width: 36px; height: 36px; top: 42px; right: 0;  }
                            #dpad-center {width: 36px; height: 36px; top: 42px; left: 42px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; }

                            /* ジャンプボタン */
                            #jump-btn {
                                width: 70px; height: 70px; border-radius: 50%;
                            background: rgba(255, 100, 100, 0.25);
                            border: 3px solid rgba(255,100,100,0.6);
                            color: white; font-size: 11px; font-family: 'Press Start 2P', monospace;
                            display: flex; align-items: center; justify-content: center;
                            cursor: pointer; touch-action: manipulation; user-select: none;
                            text-align: center; line-height: 1.3;
        }
                            #jump-btn:active {background: rgba(255,100,100,0.5); }

                            /* フラッシュ・ゲームオーバー */
                            #screen-flash {position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 999; pointer-events: none; }
                            #gameover-screen {position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; font-family: 'Press Start 2P', monospace; }
                            #gameover-screen.hidden {display: none !important; }
                            #gameover-title {color: white; font-size: 28px; margin-bottom: 16px; letter-spacing: 3px; text-align: center; }
                            #gameover-sub {color: #888; font-size: 11px; margin-bottom: 40px; text-align: center; }
                            #retry-btn {background: black; color: white; border: 3px solid white; font-family: 'Press Start 2P', monospace; font-size: 12px; padding: 12px 32px; cursor: pointer; letter-spacing: 2px; position: relative; z-index: 10000; pointer-events: auto; touch-action: manipulation; }
                            #retry-btn:active {background: white; color: black; }
                            .hidden {display: none !important; }
                            #debug-info {position: fixed; top: 4px; left: 8px; color: #0f0; font-size: 9px; font-family: monospace; z-index: 100; }
                        </style>
                    </head>
                    <body>
                        <div id="debug-info"></div>
                        <div id="game-container">
                            <div id="enemy-container">
                                <img id="sans-sprite" src="https://img.atwiki.jp/kemonowikii/attach/665/717/IMG_4304.gif" alt="Sans">
                                    <div id="miss-text" class="hidden">MISS</div>
                                    <div id="speech-bubble" class="hidden">
                                        <div id="speech-text"></div>
                                    </div>
                            </div>
                            <div id="arena">
                                <canvas id="gameCanvas" width="600" height="400"></canvas>
                            </div>
                            <div id="ui-container">
                                <div class="hp-row">
                                    <span class="player-name">FRISK</span>
                                    <span class="lv-label">LV 19</span>
                                    <span class="hp-label-ut">HP</span>
                                    <div class="hp-bar-wrapper">
                                        <div id="hp-bar-fill"></div>
                                        <div id="kr-bar-fill"></div>
                                    </div>
                                    <span id="hp-text">184 / 184</span>
                                    <span class="kr-label">KR</span>
                                    <span id="kr-text">0</span>
                                </div>
                                <div class="controls">
                                    <button id="fight-btn" class="menu-btn"><span class="btn-icon">⚔</span>FIGHT</button>
                                    <button id="act-btn" class="menu-btn"><span class="btn-icon">✦</span>ACT</button>
                                    <button id="item-btn" class="menu-btn"><span class="btn-icon">★</span>ITEM (8)</button>
                                    <button id="mercy-btn" class="menu-btn"><span class="btn-icon">♥</span>MERCY</button>
                                </div>
                            </div>

                            <!-- ★バーチャルパッド（スマホのみ表示） -->
                            <div id="virtual-pad">
                                <div id="dpad">
                                    <div class="dpad-btn" id="dpad-up">▲</div>
                                    <div class="dpad-btn" id="dpad-down">▼</div>
                                    <div class="dpad-btn" id="dpad-left">◀</div>
                                    <div class="dpad-btn" id="dpad-right">▶</div>
                                    <div id="dpad-center"></div>
                                </div>
                                <button id="jump-btn">JUMP<br>Z</button>
                            </div>
                        </div>

                        <div id="screen-flash" class="hidden"></div>
                        <div id="gameover-screen" class="hidden">
                            <p id="gameover-title">GAME OVER</p>
                            <p id="gameover-sub">* あなたは しんでしまった。</p>
                            <button id="retry-btn">もう一度</button>
                        </div>

                        <script>
    // ★バーチャルパッドのタッチ操作をkeysに反映
                            function setupVirtualPad() {
        const map = {
                                'dpad-up':    'ArrowUp',
                            'dpad-down':  'ArrowDown',
                            'dpad-left':  'ArrowLeft',
                            'dpad-right': 'ArrowRight',
                            'jump-btn':   'z',
        };
        Object.entries(map).forEach(([id, key]) => {
            const el = document.getElementById(id);
                            if (!el) return;
            el.addEventListener('touchstart', e => {e.preventDefault(); if (window.keys) window.keys[key] = true; }, {passive: false });
            el.addEventListener('touchend',   e => {e.preventDefault(); if (window.keys) window.keys[key] = false; }, {passive: false });
            el.addEventListener('touchcancel',e => {e.preventDefault(); if (window.keys) window.keys[key] = false; }, {passive: false });
            // マウスでも動作するように
            el.addEventListener('mousedown', () => { if (window.keys) window.keys[key] = true; });
            el.addEventListener('mouseup',   () => { if (window.keys) window.keys[key] = false; });
        });
    }
                            document.addEventListener('DOMContentLoaded', setupVirtualPad);
                        </script>
                        <script src="game.js?v=11"></script>
                    </body>
                </html>