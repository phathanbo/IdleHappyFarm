// animals.js - All functions related to animals, pens, and contests.

// ฟังก์ชัน: ดึงชื่อสัตว์เลี้ยง (รองรับการวิวัฒนาการ)
function getAnimalName(animal, idx) {
    if (!animal.isEvolved) return animal.name;
    const idStr = animal.name.includes('#') ? '#' + animal.name.split('#')[1] : '';
    return `${animalData[idx].evoName} ${idStr}`.trim();
}

// ฟังก์ชัน: วาดหน้ารายการคอกสัตว์และสัตว์เลี้ยง พร้อมปุ่มให้อาหาร/ลูบหัว/รักษาโรค
function renderAnimals() {
    const list = document.getElementById('animalList');

    let tabsHtml = `<div style="display: flex; gap: 10px; margin-top: 15px; margin-bottom: 15px; overflow-x: auto; padding-bottom: 5px;">`;
    penData.forEach((p, idx) => {
        const isActive = currentPenTab === idx;
        const bg = isActive ? '#4caf50' : '#e0e0e0';
        const color = isActive ? '#fff' : '#333';
        const shadow = isActive ? '0 4px 6px rgba(0,0,0,0.1)' : 'none';
        tabsHtml += `<button onclick="switchPenTab(${idx})" style="flex: 1; min-width: 90px; padding: 10px; font-size: 14px; font-weight: bold; cursor: pointer; border: none; border-radius: 8px; background: ${bg}; color: ${color}; box-shadow: ${shadow}; transition: 0.2s; white-space: nowrap;">${p.name}</button>`;
    });
    tabsHtml += `</div>`;

    list.innerHTML = `
        <div class="bulk-animal-actions">
            <div class="feed-mix-container">
                <span>📦 อาหารสัตว์: <strong style="color:${feedStock >= (window.getMaxFeed ? window.getMaxFeed() : 200) ? '#e53e3e' : '#fff'}">${Math.floor(feedStock)} / ${window.getMaxFeed ? window.getMaxFeed() : 200}</strong> หน่วย</span>
                <button class="mix-btn" onclick="mixFeedAll()">🍲 ผสมและป้อนทั้งหมด (ใช้ Feed 8/ตัว)</button>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="feed-all-btn" onclick="feedAllAnimals()" style="flex: 1;">🍎 ซื้อ/ป้อนอาหารทั้งหมด (-12 บ./ตัว)</button>
                <button onclick="harvestAllAnimals()" style="flex: 1; background: #4caf50; color: white; border: none; border-radius: 8px; padding: 10px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">🧺 เก็บผลผลิตสัตว์ทั้งหมด</button>
            </div>
        </div>
        ${tabsHtml}
        <div id="currentPenContainer"></div>
    `;

    const container = document.getElementById('currentPenContainer');
    const idx = currentPenTab;
    const p = penData[idx];

    if (pens[idx].purchased) {
        const cap = Math.min(6, pens[idx].level * p.capacityBase);
        const currentCount = animals[idx].length;

        const penHeaderDiv = document.createElement('div');
        penHeaderDiv.style.cssText = 'background: linear-gradient(135deg, rgba(30, 58, 138, 0.5), rgba(30, 64, 175, 0.7)); backdrop-filter: blur(12px); border: 2px solid rgba(147, 197, 253, 0.4); border-radius: 20px; padding: 15px 25px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);';
        penHeaderDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 2.8em; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6)); line-height: 1;">${p.emoji}</div>
                <div>
                    <strong style="font-size: 1.5em; color: #fcd34d; text-shadow: 0 2px 4px rgba(0,0,0,0.6); display: block;">${p.name} (Lv.${pens[idx].level})</strong>
                    <span style="color: #bfdbfe; font-size: 0.95em; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">🌟 โบนัสคอก +${((pens[idx].level - 1) * 10)}%</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 12px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.15); box-shadow: inset 0 4px 8px rgba(0,0,0,0.5);">
                <div style="display: flex; flex-direction: column; align-items: center; margin-right: 5px;">
                    <span style="font-size: 0.8em; color: #cbd5e1; text-transform: uppercase;">ความจุ</span>
                    <strong style="font-size: 1.3em; color: ${currentCount >= cap ? '#fca5a5' : '#86efac'}; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${currentCount}/${cap}</strong>
                </div>
                ${currentCount > 0 ? `<button onclick="harvestAllAnimalsInPen(${idx})" style="background: linear-gradient(180deg, #4ade80, #16a34a); color: white; border: none; border-radius: 10px; padding: 10px 18px; cursor: pointer; font-size: 1em; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">🧺 เก็บยกคอก</button>` : ''}
                ${currentCount > 0 ? `<button onclick="sellAllAnimalsInPen(${idx})" style="background: linear-gradient(180deg, #f87171, #dc2626); color: white; border: none; border-radius: 10px; padding: 10px 18px; cursor: pointer; font-size: 1em; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">💰 ขายยกคอก</button>` : ''}
            </div>
        `;
        container.appendChild(penHeaderDiv);

        const penAnimalsEl = document.createElement('div');
        penAnimalsEl.id = `pen-animals-${idx}`;
        penAnimalsEl.style.display = 'grid';
        penAnimalsEl.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        penAnimalsEl.style.gap = '15px';
        container.appendChild(penAnimalsEl);

        if (currentCount === 0) {
            penAnimalsEl.style.display = 'block';
            penAnimalsEl.innerHTML = `<div class="pen-container" style="justify-content: center; color: rgba(255, 255, 255, 0.7); font-size: 14px; text-align: center; padding: 25px;">ยังไม่มีสัตว์เลี้ยงในคอกนี้ (ซื้อได้ที่แท็บ "ร้านขายสัตว์")</div>`;
        } else {
            animals[idx].forEach((animal, aIdx) => {
                const animalDiv = document.createElement('div');
                animalDiv.className = `animal ${animal.sick ? 'sick' : ''}`;
                animalDiv.style.cssText = 'flex-direction: column; align-items: stretch; margin-bottom: 0; justify-content: space-between; box-sizing: border-box; height: 100%;';

                const displayName = getAnimalName(animal, idx);
                const foodPercent = animal.food;
                const isMaxLevel = animal.level >= 100;
                let capCheck = window.canAnimalLevelUp ? window.canAnimalLevelUp(animal) : { can: true };
                const expPercent = isMaxLevel ? 100 : animal.exp;
                let expDisplay = isMaxLevel ? 'MAX' : `${expPercent}%`;
                const happyPercent = animal.happiness !== undefined ? animal.happiness : 100;
                const beautyPercent = animal.beauty !== undefined ? animal.beauty : 50;
                const yieldValue = Math.floor(animal.yield || 0);
                const evoMult = animal.isEvolved ? animalData[idx].evoMult : 1;
                const maxYield = Math.floor(animalData[idx].maxYield * (1 + (animal.level - 1) * 0.5) * evoMult);
                const isFull = yieldValue >= maxYield;
                const yieldColor = isFull ? '#e53e3e' : '#2e7d32'; // แดงเมื่อเต็ม, เขียวเมื่อปกติ
                const trophyHtml = animal.hasWonFirstPlace ? '<span title="ชนะเลิศการประกวด" style="text-shadow: 0 0 5px gold;">🏆</span>' : '';
                const clvHtml = (animal.contestLevel > 0) ? `<span style="font-size: 0.85em; color: #d69e2e; background: #fffaf0; padding: 2px 4px; border-radius: 4px; border: 1px solid #f6e05e; margin-left: 5px;" title="เลเวลประกวด (เพิ่มราคาขายและชื่อเสียง)">⭐CLv.${animal.contestLevel}</span>` : '';

                let isContesting = animal.inContest;
                let isContestReady = animal.contestReady;
                let isPreparing = isContesting && !isContestReady;

                let yieldStatusHtml = '';
                if (isContesting) {
                    if (isContestReady) {
                        yieldStatusHtml = `<div style="font-size: 0.9em; color: #d69e2e; margin-top: 2px; font-weight: bold;">🏆 พร้อมขึ้นเวทีประกวดแล้ว!</div>`;
                    } else {
                        const remain = (animal.contestPrepEndSeason || totalSeasonsPassed) - totalSeasonsPassed;
                        yieldStatusHtml = `<div style="font-size: 0.9em; color: #e67e22; margin-top: 2px; font-weight: bold;">🏋️ ฟิตหุ่นเตรียมประกวด (ตัดสินในอีก ${remain} ฤดู)</div>`;
                    }
                } else if (animal.fatigueSeason !== undefined && totalSeasonsPassed <= animal.fatigueSeason) {
                    const recoverIn = animal.fatigueSeason - totalSeasonsPassed + 1;
                    yieldStatusHtml = `<div style="font-size: 0.9em; color: #718096; margin-top: 2px; font-weight: bold;">💤 พักฟื้นจากการประกวด (ผลิตต่อในอีก ${recoverIn} ฤดู)</div>`;
                } else {
                    yieldStatusHtml = `<div style="font-size: 0.9em; color: ${yieldColor}; margin-top: 2px; font-weight: bold;">📦 ผลผลิต${isFull ? 'เต็มตะกร้า' : 'รอเก็บ'}: ${yieldValue.toLocaleString()}/${maxYield.toLocaleString()} บ.</div>`;
                }

                animalDiv.innerHTML = `
                    <div class="animal-info">
                        <strong style="cursor: pointer; text-decoration: underline dashed #cbd5e0;" onclick="showAnimalStatus(${idx}, ${aIdx})" title="คลิกเพื่อดูสเตตัส">${animal.sick ? '🤒 ' : ''}${displayName} (Lv.${animal.level}) ${trophyHtml} ${clvHtml}</strong>
                        ${yieldStatusHtml}
                        <div class="stat-bars">
                            <div class="stat-row">
                                <span>อาหาร: ${foodPercent}%</span>
                                <div class="stat-bar-container">
                                    <div class="stat-bar food-bar" style="width: ${foodPercent}%"></div>
                                </div>
                            </div>
                            <div class="stat-row">
                                <span>ความสุข: ${happyPercent}%</span>
                                <div class="stat-bar-container">
                                    <div class="stat-bar" style="width: ${happyPercent}%; background-color: #ff69b4;"></div>
                                </div>
                            </div>
                            <div class="stat-row">
                                <span>สวยงาม: ${beautyPercent}%</span>
                                <div class="stat-bar-container">
                                    <div class="stat-bar" style="width: ${beautyPercent}%; background-color: #9b59b6;"></div>
                                </div>
                            </div>
                            <div class="stat-row">
                                <span>EXP: ${expDisplay}</span>
                                <div class="stat-bar-container">
                                    <div class="stat-bar exp-bar" style="width: ${expPercent}%; background-color: ${isMaxLevel ? '#ff9800' : (!capCheck.can && animal.exp >= 100 ? '#e53e3e' : '#4caf50')}"></div>
                                </div>
                            </div>
                            ${(!capCheck.can && animal.exp >= 100 && !isMaxLevel) ? `<div style="font-size: 0.8em; color: #e53e3e; text-align: right; margin-top: -3px; margin-bottom: 3px;">🔒 ${capCheck.reason}</div>` : ''}
                        </div>
                    </div>
                    <div class="animal-actions-container" style="margin-top: auto; padding-top: 15px; display: flex; flex-direction: column; gap: 8px;">
                        ${isContestReady ? `
                            <button onclick="viewContestResult(${idx}, ${aIdx})" style="background: linear-gradient(45deg, #ffd700, #ff8c00); color: white; border: none; border-radius: 6px; padding: 8px; cursor: pointer; font-weight: bold; width: 100%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🎉 เข้าสู่ลานประกวด</button>
                        ` : ''}
                        ${!isContestReady ? `
                            <div style="display: flex; gap: 6px; width: 100%;">
                                <button onclick="harvestAnimal(${idx}, ${aIdx})" style="flex: 1; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 8px 4px; font-weight: bold; font-size: 0.85em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">🧺 เก็บผล</button>
                                ${animal.sick
                            ? `<button onclick="healAnimal(${idx}, ${aIdx})" style="flex: 1; background: #e53e3e; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 8px 4px; font-weight: bold; font-size: 0.85em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">💊 รักษา (-30)</button>`
                            : `<button onclick="feedAnimalDirect(${idx}, ${aIdx})" style="flex: 1; background: #f6ad55; color: #744210; border: none; border-radius: 6px; cursor: pointer; padding: 8px 4px; font-weight: bold; font-size: 0.85em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">🍎 ป้อน (-15)</button>`
                        }
                                <button onclick="petAnimal(${idx}, ${aIdx})" style="flex: 1; background: #fbb6ce; color: #97266d; border: none; border-radius: 6px; cursor: pointer; padding: 8px 4px; font-weight: bold; font-size: 0.85em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">💖 ลูบหัว</button>
                            </div>
                            <div style="display: flex; gap: 6px; width: 100%;">
                                ${animal.level >= 10 && !animal.isEvolved ? `<button onclick="evolveAnimal(${idx}, ${aIdx})" style="flex: 2; background: linear-gradient(45deg, #6f42c1, #e91e63); color: white; border: none; border-radius: 6px; cursor: pointer; padding: 8px 4px; font-weight: bold; font-size: 0.85em; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">✨ วิวัฒน์ (-${(animalData[idx].evoCost / 1000)}K)</button>` : ''}
                                ${animal.isEvolved ? (animal.lastContestSeason === totalSeasonsPassed || totalSeasonsPassed <= animal.fatigueSeason || isPreparing ? `<button disabled style="flex: 2; background: #a0aec0; color: white; border: none; border-radius: 6px; padding: 8px 4px; cursor: not-allowed; font-weight: bold; font-size: 0.85em;">${isPreparing ? '⏳ รอแข่ง' : '⏳ แข่ง/พัก'}</button>` : `<button onclick="enterContest(${idx}, ${aIdx})" style="flex: 2; background: linear-gradient(45deg, #ffd700, #ff8c00); color: white; border: none; border-radius: 6px; cursor: pointer; padding: 8px 4px; font-weight: bold; font-size: 0.85em; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏆 สมัครแข่ง (-5K)</button>`) : ''}
                                <button onclick="sellAnimal(${idx}, ${aIdx})" style="flex: 1; background: #a0aec0; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 8px 4px; font-weight: bold; font-size: 0.85em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">💰 ขาย</button>
                            </div>
                        ` : ''}
                        ${(animal.isEvolved && !isContestReady) ? `
                            <div style="background: #f8fafc; border: 1px dashed #cbd5e0; border-radius: 6px; padding: 8px; margin-top: 2px;">
                                <div style="font-size: 0.75em; color: #4a5568; font-weight: bold; text-align: center; margin-bottom: 6px;">🌟 บริการดูแลพรีเมียม</div>
                                <div style="display: flex; gap: 5px; width: 100%;">
                                    <button onclick="brushAnimal(${idx}, ${aIdx})" style="flex: 1; background: #9b59b6; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 2px; font-size: 0.75em; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">🪮 แปรง (-20)</button>
                                    <button onclick="supplementAnimal(${idx}, ${aIdx})" style="flex: 1; background: #e67e22; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 2px; font-size: 0.75em; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">💊 ยา (-50)</button>
                                    <button onclick="walkAnimal(${idx}, ${aIdx})" style="flex: 1; background: #1abc9c; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 2px; font-size: 0.75em; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">🚶 เดิน (-10)</button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
                penAnimalsEl.appendChild(animalDiv);
            });
        }
    } else {
        container.innerHTML = `
            <div class="no-pens-message" style="margin-top: 20px;">
                🏘️ คุณยังไม่ได้สร้าง <strong>${p.name}</strong><br>
                <small>คลิกแท็บ "ร้านขายสัตว์" ด้านบนเพื่อสร้างคอกเลี้ยงสัตว์ก่อน</small>
            </div>
        `;
    }
}

// ฟังก์ชัน: แสดงป๊อปอัปสเตตัสสัตว์เลี้ยงและประวัติประกวด
window.showAnimalStatus = function (idx, aIdx) {
    playSound('click');
    const animal = animals[idx][aIdx];
    if (!animal) return;

    const displayName = getAnimalName(animal, idx);
    const data = animalData[idx];
    const isMaxLevel = animal.level >= 100;
    const expText = isMaxLevel ? 'MAX' : `${animal.exp}%`;
    const wins = animal.contestWins || { first: 0, second: 0, third: 0, runnerUp: 0 };

    const overlay = document.createElement('div');
    overlay.id = 'animalStatusOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display:flex; align-items:center; justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 25px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.4); z-index: 10000; text-align: center; min-width: 320px; max-width: 90%; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);';

    modal.innerHTML = `
        <h2 style="margin-top:0; color: #2d3748; border-bottom: 2px solid #edf2f7; padding-bottom: 10px;">📋 ข้อมูลสัตว์เลี้ยง</h2>
        <div style="font-size: 50px; margin: 10px 0;">${data.emoji}</div>
        <h3 style="margin: 5px 0; color: #2b6cb0;">${displayName}</h3>
        <div style="color: #4a5568; margin-bottom: 15px;">เลเวล: <strong style="color: #48bb78;">${animal.level}</strong> (EXP: ${expText})</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; text-align: left; margin-bottom: 15px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 5px;"><span>🍖 ความอิ่ม:</span> <strong style="color: ${animal.food < 50 ? '#e53e3e' : '#2d3748'};">${animal.food}%</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 5px;"><span>💖 ความสุข:</span> <strong>${animal.happiness}%</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 5px;"><span>✨ ความสวยงาม:</span> <strong>${animal.beauty !== undefined ? animal.beauty : 50}%</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 5px;"><span>⭐ เลเวลประกวด:</span> <strong style="color: #d69e2e;">Lv.${animal.contestLevel || 0}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>🌟 สถานะ:</span> <strong style="color: ${animal.isEvolved ? '#6f42c1' : '#4a5568'};">${animal.isEvolved ? 'ร่างวิวัฒนาการ' : 'ร่างปกติ'}</strong></div>
        </div>
        <h4 style="text-align: left; color: #4a5568; margin-bottom: 5px;">🏆 ประวัติการประกวด</h4>
        <div style="background: #fffaf0; border: 1px solid #f6e05e; padding: 15px; border-radius: 10px; text-align: left; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>🥇 ชนะเลิศ: <strong>${wins.first}</strong></div>
            <div>🥈 ที่สอง: <strong>${wins.second}</strong></div>
            <div>🥉 ที่สาม: <strong>${wins.third}</strong></div>
            <div>🎀 ชมเชย: <strong>${wins.runnerUp}</strong></div>
        </div>
        <button onclick="document.getElementById('animalStatusOverlay').remove(); playSound('click');" style="margin-top: 20px; padding: 10px; background: #e53e3e; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%;">ปิดหน้าต่าง</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
};

// ฟังก์ชันสลับแท็บคอกสัตว์
window.switchPenTab = function (idx) {
    currentPenTab = idx;
    playSound('click');
    renderAnimals();
};

// ฟังก์ชัน: ลิ้งก์จากหน้าภาพรวมไปยังคอกสัตว์ที่เลือก
window.goToPen = function (idx) {
    playSound('click');
    const animalTabBtn = Array.from(document.querySelectorAll('.tab-button')).find(btn => btn.getAttribute('onclick').includes('tab-animals'));
    switchTab('tab-animals', animalTabBtn);
    switchPenTab(idx);
};

// ==================== ระบบคอกและเลี้ยงสัตว์ ====================

window.canAnimalLevelUp = function (animal) {
    if (animal.level >= 100) return { can: false, reason: "MAX" };

    if (!animal.isEvolved && animal.level >= 10) {
        return { can: false, reason: "ต้องวิวัฒนาการก่อน" };
    }

    if (animal.level >= 90 && !animal.hasWonFirstPlace) {
        return { can: false, reason: "ต้องชนะเลิศประกวด" };
    }

    if (animal.level % 10 === 0) {
        let requiredSeasons = (animal.level / 10) * 4;
        let age = typeof totalSeasonsPassed !== 'undefined' ? totalSeasonsPassed - (animal.birthSeason !== undefined ? animal.birthSeason : totalSeasonsPassed) : 0;
        if (age <= requiredSeasons) return { can: false, reason: `อายุต้องเกิน ${requiredSeasons} ฤดู (ปัจจุบัน ${age})` };
    }

    if (animal.level % 15 === 0 && animal.level % 10 !== 0) {
        let required = Math.ceil(animal.level / 30);
        let contests = animal.totalContests || 0;
        if (contests < required) return { can: false, reason: `ต้องประกวด ${required} ครั้ง (แข่งแล้ว ${contests})` };
    }
    return { can: true, reason: "" };
};

// ฟังก์ชัน: ซื้อคอกสัตว์ใหม่
window.buyPen = function (idx) {
    const cost = penData[idx].cost;
    if (money < cost) return showMessage("💸 เงินไม่พอสร้างคอก!");
    money -= cost;
    currentSeasonExpense += cost;
    seasonDetails.exUpgrades += cost;
    pens[idx].purchased = true;
    pens[idx].level = 1;
    playSound('click');
    showMessage(`✅ ซื้อ ${penData[idx].name} สำเร็จ!`);
    renderAnimals();
    renderAnimalShop();
    saveGame();
};

// ฟังก์ชัน: อัปเกรดคอกสัตว์ เพื่อเพิ่มความจุและโบนัสการผลิต
window.upgradePen = function (idx) {
    const level = pens[idx].level;
    const cap = Math.min(6, level * penData[idx].capacityBase);

    if (animals[idx].length < cap) {
        return showMessage(`🔒 อัพเกรดไม่ได้! ต้องมีสัตว์เต็มคอก (${cap} ตัว) ก่อน`);
    }
    const allLeveledUp = animals[idx].length > 0 && animals[idx].every(a => a.level >= level);
    if (!allLeveledUp) {
        return showMessage(`🔒 อัพเกรดไม่ได้! สัตว์ทุกตัวในคอกต้องมีเลเวล ${level} ขึ้นไป`);
    }

    const plankCost = level * 2;
    const blockCost = level * 1;
    const cost = Math.floor(penData[idx].upgradeCostBase * (1 + (level - 1) * 0.5));
    if (money < cost) return showMessage("💸 เงินไม่พออัพเกรดคอก!");
    if (woodPlankStock < plankCost || stoneBlockStock < blockCost) return showMessage(`🔒 วัสดุไม่พอ! (ต้องการ ไม้แผ่น ${plankCost}, หินก้อน ${blockCost})`);

    money -= cost;
    woodPlankStock -= plankCost;
    stoneBlockStock -= blockCost;
    currentSeasonExpense += cost;
    seasonDetails.exUpgrades += cost;
    pens[idx].level++;
    playSound('levelup');
    showMessage(`✅ อัพเกรด ${penData[idx].name} เป็น Lv.${pens[idx].level} สำเร็จ`);
    renderAnimals();
    renderAnimalShop();
    saveGame();
};

// ฟังก์ชัน: ซื้อสัตว์เลี้ยงใหม่ใส่ในคอก
window.buyAnimal = function (idx) {
    if (!pens[idx].purchased) {
        return showMessage("🔒 ต้องสร้างคอกก่อนซื้อสัตว์เลี้ยง!");
    }
    const cap = Math.min(6, pens[idx].level * penData[idx].capacityBase);
    if (animals[idx].length >= cap) {
        return showMessage("🔒 คอกสัตว์เต็มแล้ว! กรุณาอัพเกรดคอกก่อน");
    }
    const cost = animalData[idx].cost;
    if (money < cost) return showMessage("💸 เงินไม่พอ!");
    money -= cost;
    currentSeasonExpense += cost;
    seasonDetails.exUpgrades += cost;

    // Add animal instance
    const newAnimal = {
        id: Date.now() + Math.random(),
        name: `${animalData[idx].name} #${animals[idx].length + 1}`,
        level: 1,
        exp: 0,
        food: 80,
        happiness: 100,
        sick: false,
        yield: 0,
        isEvolved: false,
        beauty: 50,
        fatigueSeason: -1,
        lastContestSeason: -1,
        inContest: false,
        contestEndTime: 0,
        contestReady: false,
        hasWonFirstPlace: false,
        contestLevel: 0,
        contestWins: { first: 0, second: 0, third: 0, runnerUp: 0 },
        birthSeason: typeof totalSeasonsPassed !== 'undefined' ? totalSeasonsPassed : 0,
        totalContests: 0
    };
    animals[idx].push(newAnimal);

    playSound('click');
    showMessage(`✅ ซื้อ ${animalData[idx].name} สำเร็จ! (${cost} บาท)`);
    renderAnimals();
    renderAnimalShop();
    saveGame();
};

// ฟังก์ชัน: ลูบหัวสัตว์เลี้ยง (เพิ่มค่าความสุข 25%)
window.petAnimal = function (idx, aIdx) {
    const animal = animals[idx][aIdx];
    if (animal) {
        if (animal.happiness >= 100) {
            return showMessage(`💖 ${animal.name} มีความสุขเต็มที่แล้ว!`);
        }
        animal.happiness = Math.min(100, (animal.happiness || 0) + 25);
        playSound('click');
        showMessage(`💖 ลูบหัว ${getAnimalName(animal, idx)} รู้สึกมีความสุขขึ้น!`);
        renderAnimals();
        saveGame();
    }
};

// ฟังก์ชัน: ให้อาหารสัตว์เลี้ยง 1 ตัวแบบเจาะจง (เสียเงิน 15 บาท)
window.feedAnimalDirect = function (idx, aIdx) {
    if (money < 15) {
        return showMessage("💸 เงินไม่พอซื้ออาหาร (15 บาท)");
    }
    const animal = animals[idx][aIdx];
    if (animal) {
        money -= 15;
        currentSeasonExpense += 15;
        seasonDetails.exCare += 15;
        animal.food = 100;
        playSound('click');
        showMessage(`🍎 ให้อาหาร ${getAnimalName(animal, idx)} สำเร็จ`);
        renderAnimals();
        saveGame();
    }
};

// ฟังก์ชัน: แปรงขนสัตว์เลี้ยง (ดูแลพิเศษ)
window.brushAnimal = function (idx, aIdx) {
    if (money < 20) return showMessage("💸 เงินไม่พอค่าแปรงขน (20 บาท)");
    const animal = animals[idx][aIdx];
    if (animal) {
        money -= 20;
        currentSeasonExpense += 20;
        seasonDetails.exCare += 20;
        animal.happiness = Math.min(100, (animal.happiness || 0) + 15);
        animal.beauty = Math.min(100, (animal.beauty || 0) + 10);
        playSound('click');
        showMessage(`🪮 แปรงขนให้ ${getAnimalName(animal, idx)} ความสวยงามเพิ่มขึ้น!`);
        renderAnimals();
        saveGame();
    }
};

// ฟังก์ชัน: ให้กินอาหารเสริม (ดูแลพิเศษ)
window.supplementAnimal = function (idx, aIdx) {
    if (money < 50) return showMessage("💸 เงินไม่พอค่าอาหารเสริม (50 บาท)");
    const animal = animals[idx][aIdx];
    if (animal) {
        money -= 50;
        currentSeasonExpense += 50;
        seasonDetails.exCare += 50;
        animal.food = 100;
        animal.beauty = Math.min(100, (animal.beauty || 0) + 25);

        // เพิ่ม EXP ออโต้ 10 หน่วย
        if (animal.level < 100) {
            if (animal.exp < 100) animal.exp += 10;
            if (animal.exp >= 100) {
                let capCheck = window.canAnimalLevelUp ? window.canAnimalLevelUp(animal) : { can: true };
                if (capCheck.can) {
                    animal.level++;
                    animal.exp = 0;
                    playSound('levelup');
                    showMessage(`🎉 ${getAnimalName(animal, idx)} เลเวลอัพเป็น Lv.${animal.level}!`);
                } else {
                    animal.exp = 100;
                }
            }
        } else {
            animal.exp = 100;
        }
        playSound('click');
        showMessage(`💊 ${getAnimalName(animal, idx)} กินอาหารเสริม สุขภาพและความสวยงามเพิ่มขึ้น!`);
        renderAnimals();
        saveGame();
    }
};

// ฟังก์ชัน: พาเดินเล่น (ดูแลพิเศษ)
window.walkAnimal = function (idx, aIdx) {
    if (money < 10) return showMessage("💸 เงินไม่พอค่าพาเดินเล่น (10 บาท)");
    const animal = animals[idx][aIdx];
    if (animal) {
        money -= 10;
        currentSeasonExpense += 10;
        seasonDetails.exCare += 10;
        animal.happiness = Math.min(100, (animal.happiness || 0) + 20);
        animal.beauty = Math.min(100, (animal.beauty || 0) + 5);
        if (animal.level < 100) {
            if (animal.exp < 100) animal.exp += 5;
            if (animal.exp >= 100) {
                let capCheck = window.canAnimalLevelUp ? window.canAnimalLevelUp(animal) : { can: true };
                if (capCheck.can) {
                    animal.level++;
                    animal.exp = 0;
                    playSound('levelup');
                    showMessage(`🎉 ${getAnimalName(animal, idx)} เลเวลอัพเป็น Lv.${animal.level}!`);
                } else {
                    animal.exp = 100;
                }
            }
        } else { animal.exp = 100; }
        playSound('click');
        showMessage(`🚶 พา ${getAnimalName(animal, idx)} ไปเดินเล่น ความสุขและความสวยเพิ่ม!`);
        renderAnimals();
        saveGame();
    }
};

// ฟังก์ชัน: ขายสัตว์เลี้ยง 1 ตัว
window.sellAnimal = function (idx, aIdx) {
    const animal = animals[idx][aIdx];
    if (animal) {
        const baseCost = animalData[idx].cost;
        // คำนวณราคาขาย: 50% ของราคาเริ่มต้น + 25% ต่อ 1 เลเวล
        let sellPrice = Math.floor(baseCost * (0.5 + (animal.level - 1) * 0.25));
        if (animal.isEvolved) {
            sellPrice += Math.floor(animalData[idx].evoCost * 0.5); // เพิ่มราคาขาย 50% ของคาวิวัฒนาการ
        }
        if (animal.contestLevel > 0) {
            sellPrice += Math.floor(baseCost * animal.contestLevel * 1.5); // เพิ่มราคา 150% ของราคาต้น ตามระดับเลเวลประกวด
        }
        const displayName = getAnimalName(animal, idx);

        if (confirm(`คุณต้องการขาย ${displayName} (Lv.${animal.level}) ในราคา ${sellPrice.toLocaleString()} บาท ใช่หรือไม่?`)) {
            animals[idx].splice(aIdx, 1);
            money += sellPrice;
            currentSeasonIncome += sellPrice;
            totalLifetimeIncome += sellPrice;
            seasonDetails.inSell += sellPrice;
            playSound('harvest');
            showMessage(`💰 ขาย ${displayName} ได้รับเงิน ${sellPrice.toLocaleString()} บาท`);
            renderAnimals();
            renderAnimalShop();
            saveGame();
        }
    }
};

// ฟังก์ชัน: ขายสัตว์เลี้ยงทั้งหมดยกคอก
window.sellAllAnimalsInPen = function (idx) {
    const count = animals[idx].length;
    if (count === 0) return;

    const inContestCount = animals[idx].filter(a => a.inContest).length;
    if (inContestCount > 0) {
        return showMessage("❌ ไม่สามารถขายยกคอกได้ เนื่องจากมีสัตว์กำลังประกวดอยู่");
    }

    let totalSellPrice = 0;
    const baseCost = animalData[idx].cost;

    animals[idx].forEach(animal => {
        let price = Math.floor(baseCost * (0.5 + (animal.level - 1) * 0.25));
        if (animal.isEvolved) price += Math.floor(animalData[idx].evoCost * 0.5);
        if (animal.contestLevel > 0) price += Math.floor(baseCost * animal.contestLevel * 1.5);
        totalSellPrice += price;
    });

    if (confirm(`คุณต้องการขายสัตว์ทั้งหมดในคอกนี้จำนวน ${count} ตัว ในราคารวม ${totalSellPrice.toLocaleString()} บาท ใช่หรือไม่?`)) {
        animals[idx] = [];
        money += totalSellPrice;
        currentSeasonIncome += totalSellPrice;
        totalLifetimeIncome += totalSellPrice;
        seasonDetails.inSell += totalSellPrice;
        playSound('harvest');
        showMessage(`💰 ขายสัตว์ยกคอกได้รับเงินรวม ${totalSellPrice.toLocaleString()} บาท`);
        renderAnimals();
        renderAnimalShop();
        saveGame();
    }
};

// ฟังก์ชัน: เก็บผลผลิตจากสัตว์เลี้ยง 1 ตัว
window.harvestAnimal = function (idx, aIdx) {
    if (!animalTools[idx]) {
        return showMessage(`❌ คุณยังไม่มี ${animalData[idx].toolName} สำหรับเก็บเกี่ยว!`);
    }
    const animal = animals[idx][aIdx];
    if (animal && !animal.inContest && animal.yield >= 1) {
        const gross = Math.floor(animal.yield);
        const fee = autoPetEnabled ? Math.ceil(gross * 0.15) : 0;
        const net = gross - fee;

        money += net;
        currentSeasonIncome += gross;
        totalLifetimeIncome += gross;
        seasonDetails.inAnimals += gross;
        if (fee > 0) {
            currentSeasonExpense += fee;
            seasonDetails.exFees += fee;
        }
        animal.yield -= gross; // เก็บทศนิยมที่เหลือไว้รอบต่อไป
        playSound('harvest');
        showMessage(`🧺 เก็บผลผลิต ${getAnimalName(animal, idx)} ได้ ${net} บ. ${fee > 0 ? `(หักค่าจ้าง ${fee} บ.)` : ''}`);
        renderAnimals();
        saveGame();
    } else {
        showMessage(`⏳ ผลผลิตยังไม่พร้อม`);
    }
};

// ฟังก์ชัน: เก็บผลผลิตสัตว์เลี้ยงยกคอก
window.harvestAllAnimalsInPen = function (idx) {
    if (!animalTools[idx]) {
        return showMessage(`❌ คุณยังไม่มี ${animalData[idx].toolName} สำหรับเก็บเกี่ยว!`);
    }
    let totalGross = 0;
    animals[idx].forEach(animal => {
        if (!animal.inContest && animal.yield >= 1) {
            const gross = Math.floor(animal.yield);
            totalGross += gross;
            animal.yield -= gross;
        }
    });
    if (totalGross > 0) {
        const fee = autoPetEnabled ? Math.ceil(totalGross * 0.15) : 0;
        const net = totalGross - fee;
        money += net;
        currentSeasonIncome += totalGross;
        totalLifetimeIncome += totalGross;
        seasonDetails.inAnimals += totalGross;
        if (fee > 0) {
            currentSeasonExpense += fee;
            seasonDetails.exFees += fee;
        }
        playSound('harvest');
        showMessage(`🧺 เก็บผลผลิตยกคอก ได้ ${net} บ. ${fee > 0 ? `(หักค่าจ้าง ${fee} บ.)` : ''}`);
        renderAnimals();
        saveGame();
    } else {
        showMessage(`⏳ ผลผลิตในคอกนี้ยังไม่พร้อม`);
    }
};

// ฟังก์ชัน: เก็บผลผลิตสัตว์เลี้ยงทั้งหมด
window.harvestAllAnimals = function () {
    let totalGross = 0;
    let missingTools = false;
    Object.keys(animals).forEach(idx => {
        if (animalTools[idx]) {
            animals[idx].forEach(animal => {
                if (!animal.inContest && animal.yield >= 1) {
                    const gross = Math.floor(animal.yield);
                    totalGross += gross;
                    animal.yield -= gross;
                }
            });
        } else {
            if (animals[idx].some(a => !a.inContest && a.yield >= 1)) {
                missingTools = true;
            }
        }
    });
    if (totalGross > 0) {
        const fee = autoPetEnabled ? Math.ceil(totalGross * 0.15) : 0;
        const net = totalGross - fee;
        money += net;
        currentSeasonIncome += totalGross;
        totalLifetimeIncome += totalGross;
        seasonDetails.inAnimals += totalGross;
        if (fee > 0) {
            currentSeasonExpense += fee;
            seasonDetails.exFees += fee;
        }
        playSound('harvest');
        let msg = `🧺 เก็บผลผลิตสัตว์ทั้งหมด ได้ ${net} บ. ${fee > 0 ? `(หักค่าจ้าง ${fee} บ.)` : ''}`;
        if (missingTools) msg += ` (⚠️ บางคอกยังไม่มีอุปกรณ์)`;
        showMessage(msg, 3500);
        renderAnimals();
        saveGame();
    } else {
        if (missingTools) {
            showMessage(`❌ ไม่มีอุปกรณ์เก็บเกี่ยวสำหรับสัตว์ที่มีผลผลิต`);
        } else {
            showMessage(`⏳ ไม่มีผลผลิตให้เก็บ`);
        }
    }
};

// ฟังก์ชัน: รักษาโรคให้สัตว์เลี้ยง
window.healAnimal = function (idx, aIdx) {
    if (money < 30) {
        return showMessage("💸 เงินไม่พอยารักษา (30 บาท)");
    }
    const animal = animals[idx][aIdx];
    if (animal) {
        money -= 30;
        currentSeasonExpense += 30;
        seasonDetails.exCare += 30;
        animal.sick = false;
        animal.food = 50; // Restore some food when cured
        playSound('click');
        showMessage(`💊 รักษา ${getAnimalName(animal, idx)} หายป่วยแล้ว!`);
        renderAnimals();
        saveGame();
    }
};

// ฟังก์ชัน: ซื้ออาหารให้สัตว์เลี้ยงทุกตัวในฟาร์ม (เหมาจ่าย)
window.feedAllAnimals = function () {
    let totalAnimals = 0;
    Object.keys(animals).forEach(k => {
        totalAnimals += animals[k].length;
    });

    if (totalAnimals === 0) {
        return showMessage("❓ คุณไม่มีสัตว์เลี้ยงในฟาร์ม");
    }

    const totalCost = totalAnimals * 12;
    if (money < totalCost) {
        return showMessage(`💸 เงินไม่พอ! ต้องการ ${totalCost} บาท`);
    }

    money -= totalCost;
    currentSeasonExpense += totalCost;
    seasonDetails.exCare += totalCost;
    Object.keys(animals).forEach(k => {
        animals[k].forEach(animal => {
            animal.food = 100;
        });
    });

    playSound('click');
    showMessage(`🍎 ให้อาหารสัตว์ทั้งหมด ${totalAnimals} ตัว (-${totalCost} บาท)`);
    renderAnimals();
    saveGame();
};

// ฟังก์ชัน: นำ Feed (วัตถุดิบที่ได้จากการปลูกผัก) มาผสมเป็นอาหารป้อนสัตว์ทุกตัว
window.mixFeedAll = function () {
    let totalAnimals = 0;
    Object.keys(animals).forEach(k => {
        totalAnimals += animals[k].length;
    });

    if (totalAnimals === 0) {
        return showMessage("❓ คุณไม่มีสัตว์เลี้ยงในฟาร์ม");
    }

    const requiredFeed = totalAnimals * 8;
    if (feedStock < requiredFeed) {
        return showMessage(`❌ วัตถุดิบอาหารสัตว์ไม่พอ! ต้องการ ${requiredFeed} Feed`);
    }

    feedStock -= requiredFeed;
    Object.keys(animals).forEach(k => {
        animals[k].forEach(animal => {
            animal.food = 100;
        });
    });

    playSound('plant');
    showMessage(`🍲 ผสมอาหารและป้อนสัตว์ทั้งหมด ${totalAnimals} ตัว สำเร็จ!`);
    renderAnimals();
    saveGame();
};

// ฟังก์ชัน: วิวัฒนาการสัตว์เลี้ยงเป็นร่างพิเศษ
window.evolveAnimal = function (idx, aIdx) {
    const animal = animals[idx][aIdx];
    const data = animalData[idx];
    if (!animal || animal.isEvolved || animal.level < 10) return;

    if (money < data.evoCost) {
        return showMessage(`💸 เงินไม่พอวิวัฒนาการ! (ต้องการ ${data.evoCost.toLocaleString()} บาท)`);
    }

    money -= data.evoCost;
    currentSeasonExpense += data.evoCost;
    seasonDetails.exUpgrades += data.evoCost;

    animal.isEvolved = true;
    playSound('levelup');
    showMessage(`✨ ยินดีด้วย! ${animal.name} วิวัฒนาการเป็น ${data.evoName} แล้ว!`, 4500);

    renderAnimals();
    saveGame();
};

// ฟังก์ชัน: ส่งสัตว์เลี้ยงประกวด (เฉพาะร่างวิวัฒนาการ)
window.enterContest = function (idx, aIdx) {
    const animal = animals[idx][aIdx];
    if (!animal || !animal.isEvolved || animal.inContest) return;

    if (animal.lastContestSeason === totalSeasonsPassed) {
        return showMessage("❌ สัตว์ตัวนี้ส่งประกวดไปแล้วในฤดูกาลนี้ กรุณารอฤดูกาลหน้า!");
    }

    const cost = 5000;
    if (money < cost) {
        return showMessage(`💸 เงินไม่พอส่งประกวด! (ต้องการ ${cost.toLocaleString()} บาท)`);
    }

    money -= cost;
    currentSeasonExpense += cost;
    seasonDetails.exFees += cost; // หักเป็นค่าธรรมเนียม
    animal.lastContestSeason = totalSeasonsPassed;
    animal.inContest = true;
    animal.contestPrepEndSeason = totalSeasonsPassed + 1; // ตัดสินเมื่อเปลี่ยนฤดูกาล
    animal.contestReady = false;

    playSound('click');
    showMessage(`🏋️ ${getAnimalName(animal, idx)} เข้าคอร์สฟิตหุ่นเตรียมประกวดแล้ว! (รอตัดสินเมื่อเปลี่ยนฤดู)`, 4000);

    renderAnimals();
    saveGame();
};

window.viewContestResult = function (idx, aIdx) {
    const animal = animals[idx][aIdx];
    if (!animal || !animal.inContest || !animal.contestReady) return;

    const baseScore = Math.floor((animal.food + animal.happiness + (animal.beauty || 50)) / 3);
    let round = 1;
    let bonusScore = 0;
    let cursorDir = 1;
    let cursorPos = 0;
    let gameInterval;
    let isJumping = false;

    const overlay = document.createElement('div');
    overlay.id = 'minigameOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: 90%; max-width: 400px; animation: popIn 0.3s ease;';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function renderGame() {
        modal.innerHTML = `
            <h2 style="margin-top:0; color:#2b6cb0;">🏃 มินิเกมวิ่งข้ามรั้ว</h2>
            <p style="color:#4a5568; margin-bottom: 20px;">กด <strong>กระโดด</strong> ให้ตรงแถบสีเขียว (+10 แต้ม)<br>รอบที่: <strong style="color:#ed8936;">${round} / 3</strong></p>
            <div style="font-size:50px; margin-bottom:10px; transition: transform 0.2s;" id="mgAnimal">${animalData[idx].emoji}</div>
            <div style="width:100%; height:30px; background:#e2e8f0; position:relative; margin: 20px 0; border-radius:15px; overflow:hidden; border: 2px solid #cbd5e0;">
                <div style="position:absolute; left:40%; width:20%; height:100%; background:#48bb78; box-shadow: inset 0 0 8px rgba(0,0,0,0.2);"></div>
                <div id="mgCursor" style="position:absolute; left:${cursorPos}%; width:6px; height:100%; background:#2d3748; border-radius:3px; transition: left 0.05s linear;"></div>
            </div>
            <button id="mgJumpBtn" style="background: linear-gradient(45deg, #f6ad55, #ed8936); color: white; border: none; padding: 15px; font-size: 1.2em; font-weight: bold; border-radius: 12px; width: 100%; cursor: pointer; box-shadow: 0 4px 6px rgba(237, 137, 54, 0.4);">🚀 กระโดด!</button>
            <div id="mgResult" style="margin-top:15px; font-weight:bold; font-size: 1.1em; height: 24px;"></div>
        `;
        document.getElementById('mgJumpBtn').onclick = handleJump;
    }

    function startGameLoop() {
        isJumping = false;
        cursorPos = 0;
        cursorDir = 1.5 + (round * 0.5); // วิ่งเร็วขึ้นทุกรอบ
        gameInterval = setInterval(() => {
            cursorPos += cursorDir * 2;
            if (cursorPos >= 96) { cursorPos = 96; cursorDir *= -1; }
            if (cursorPos <= 0) { cursorPos = 0; cursorDir *= -1; }
            const c = document.getElementById('mgCursor');
            if (c) c.style.left = cursorPos + '%';
        }, 30);
    }

    function handleJump() {
        if (isJumping) return;
        isJumping = true;
        clearInterval(gameInterval);

        const animalIcon = document.getElementById('mgAnimal');
        if (animalIcon) {
            animalIcon.style.transform = 'translateY(-40px) scale(1.2)';
            setTimeout(() => animalIcon.style.transform = 'translateY(0) scale(1)', 300);
        }

        let success = false;
        if (cursorPos >= 38 && cursorPos <= 60) {
            success = true;
            bonusScore += 10;
            playSound('harvest');
        } else {
            playSound('click');
        }

        const resDiv = document.getElementById('mgResult');
        if (resDiv) {
            resDiv.style.color = success ? '#48bb78' : '#e53e3e';
            resDiv.textContent = success ? '✨ กระโดดผ่านฉลุย! (+10)' : '💥 สะดุดรั้ว!';
        }

        const btn = document.getElementById('mgJumpBtn');
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }

        setTimeout(() => {
            round++;
            if (round > 3) {
                overlay.remove();
                window.finishContest(idx, aIdx, baseScore + bonusScore);
            } else {
                renderGame();
                startGameLoop();
            }
        }, 1200);
    }

    renderGame();
    startGameLoop();
};

// ฟังก์ชัน: สรุปผลลัพธ์และให้ของรางวัล
window.finishContest = function (idx, aIdx, contestScore) {
    const animal = animals[idx][aIdx];
    if (!animal || !animal.inContest || !animal.contestReady) return;

    const rand = Math.random();
    let repGained = 0;
    let rank = "";
    let emoji = "";
    let levelChange = 0;

    if (!animal.contestWins) animal.contestWins = { first: 0, second: 0, third: 0, runnerUp: 0 };
    if (animal.contestLevel === undefined) animal.contestLevel = 0;
    animal.totalContests = (animal.totalContests || 0) + 1;

    // ความน่าจะเป็นในการชนะแปรผันตามคะแนน Contest Score
    if (contestScore >= 90) {
        if (rand < 0.60) { repGained = 100; rank = "รางวัลชนะเลิศ"; emoji = "🥇"; animal.hasWonFirstPlace = true; animal.contestWins.first++; levelChange = 1; }
        else if (rand < 0.90) { repGained = 50; rank = "รองชนะเลิศอันดับ 1"; emoji = "🥈"; animal.contestWins.second++; levelChange = 0; }
        else { repGained = 20; rank = "รองชนะเลิศอันดับ 2"; emoji = "🥉"; animal.contestWins.third++; levelChange = 0; }
    } else if (contestScore >= 70) {
        if (rand < 0.15) { repGained = 100; rank = "รางวัลชนะเลิศ"; emoji = "🥇"; animal.hasWonFirstPlace = true; animal.contestWins.first++; levelChange = 1; }
        else if (rand < 0.50) { repGained = 50; rank = "รองชนะเลิศอันดับ 1"; emoji = "🥈"; animal.contestWins.second++; levelChange = 0; }
        else if (rand < 0.85) { repGained = 20; rank = "รองชนะเลิศอันดับ 2"; emoji = "🥉"; animal.contestWins.third++; levelChange = 0; }
        else { repGained = 5; rank = "รางวัลชมเชย"; emoji = "🎀"; animal.contestWins.runnerUp++; levelChange = 0; }
    } else {
        if (rand < 0.05) { repGained = 50; rank = "รองชนะเลิศอันดับ 1"; emoji = "🥈"; animal.contestWins.second++; levelChange = 0; }
        else if (rand < 0.20) { repGained = 20; rank = "รองชนะเลิศอันดับ 2"; emoji = "🥉"; animal.contestWins.third++; levelChange = 0; }
        else if (rand < 0.50) { repGained = 5; rank = "รางวัลชมเชย"; emoji = "🎀"; animal.contestWins.runnerUp++; levelChange = 0; }
        else { repGained = 0; rank = "ตกรอบคัดเลือก"; emoji = "❌"; levelChange = 0; }
    }

    // ชื่อเสียงที่จะได้รับจะทวีคูณตามระดับเลเวลประกวด (เพิ่มทีละ 20%)
    const repMulti = 1 + (animal.contestLevel * 0.2);
    repGained = Math.floor(repGained * repMulti);
    farmReputation += repGained;

    // ปรับอัปเดตเลเวลประกวด โดยจำกัดไม่ให้ต่ำกว่า 0 และปัดเศษทิ้งเพื่อให้เป็นจำนวนเต็มเท่านั้น
    animal.contestLevel = Math.max(0, Math.floor(animal.contestLevel) + levelChange);

    animal.inContest = false;
    animal.contestReady = false;
    animal.fatigueSeason = totalSeasonsPassed + 1; // พัก 1 ฤดูกาล (ทำงานใหม่เมื่อฤดูถัดไปสิ้นสุดลง)

    // สร้างป๊อปอัปประกาศผลประกวด
    const overlay = document.createElement('div');
    overlay.id = 'contestResultOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 400px; width: 90%;';

    modal.innerHTML = `
        <h2 style="margin-top: 0; color: #2d3748;">🎉 ผลการประกวด 🎉</h2>
        <div style="font-size: 60px; margin: 10px 0;">${emoji}</div>
        <p style="font-size: 1.2em; color: #4a5568; margin-bottom: 5px;"><strong>${getAnimalName(animal, idx)}</strong> ได้รับตำแหน่ง</p>
        <h3 style="color: #d69e2e; margin-top: 0; font-size: 1.5em;">${rank}</h3>
        <div style="background: #ebf8ff; border: 1px solid #90cdf4; padding: 10px; border-radius: 8px; margin: 10px 0;">
            <strong style="color: #2b6cb0;">📊 คะแนนความพร้อม (อิ่ม+สุข+สวย): ${contestScore}/100</strong><br>
            <span style="color: ${levelChange > 0 ? '#38a169' : (levelChange < 0 ? '#e53e3e' : '#718096')}; font-size: 0.9em; font-weight: bold; margin-top: 5px; display: block;">
                เลเวลประกวด ${levelChange > 0 ? '+' : ''}${levelChange} (ปัจจุบัน CLv.${animal.contestLevel})
            </span>
        </div>
        <div style="background: #fffaf0; border: 1px solid #f6e05e; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <span style="color: #d69e2e; font-size: 1.1em;">ชื่อเสียงฟาร์มที่ได้รับ: <strong style="font-size: 1.2em;">+${repGained} 🌟</strong><br><small style="color: #718096;">(ช่วยเพิ่มมูลค่าผลผลิตในฟาร์ม +${(repGained * 0.1).toFixed(1)}%)</small></span>
        </div>
        <div style="color: #e53e3e; font-size: 0.9em; margin-bottom: 15px; font-weight: bold;">💤 สัตว์จะเข้าสู่ช่วงพักฟื้นและไม่ผลิตผลไปอีก 1 ฤดูกาลเต็ม</div>
        <button onclick="closeContestResult()" style="background: #3182ce; color: white; border: none; padding: 12px 20px; font-size: 1em; font-weight: bold; border-radius: 8px; cursor: pointer; width: 100%;">กลับฟาร์ม</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    playSound('harvest');
    renderAnimals();
    saveGame();
};

window.closeContestResult = function () {
    playSound('click');
    const overlay = document.getElementById('contestResultOverlay');
    if (overlay) overlay.remove();
};

// ==================== ระบบอุปกรณ์เสริม ====================

// ฟังก์ชัน: ซื้ออุปกรณ์เก็บเกี่ยวสัตว์
window.buyAnimalTool = function (idx) {
    const cost = animalData[idx].toolCost;
    if (money < cost) return showMessage("💸 เงินไม่พอซื้ออุปกรณ์!");
    money -= cost;
    currentSeasonExpense += cost;
    seasonDetails.exUpgrades += cost;
    animalTools[idx] = true;
    playSound('click');
    showMessage(`✅ ซื้อ ${animalData[idx].toolName} สำเร็จ!`);
    renderAnimalShop();
    saveGame();
};

// ฟังก์ชัน: ซื้อเครื่องป้อนอาหารสัตว์อัตโนมัติ
window.buyAutoFeeder = function () {
    const cost = 5000;
    if (money < cost) return showMessage("💸 เงินไม่พอซื้อเครื่องป้อนอาหารอัตโนมัติ!");
    money -= cost;
    currentSeasonExpense += cost;
    seasonDetails.exUpgrades += cost;
    autoFeederPurchased = true;
    playSound('click');
    showMessage("✅ ซื้อเครื่องป้อนอาหารอัตโนมัติสำเร็จ!");
    renderAnimalShop();
    saveGame();
};

// ฟังก์ชัน: ซื้อวัคซีนป้องกันโรค (ฉีดให้สัตว์ทุกตัว ป้องกันการป่วยถาวร)
window.buyVaccine = function () {
    const cost = 10000;
    if (money < cost) return showMessage("💸 เงินไม่พอซื้อวัคซีนป้องกันโรค!");
    money -= cost;
    currentSeasonExpense += cost;
    seasonDetails.exUpgrades += cost;
    vaccinePurchased = true;

    // รักษาออโต้ให้กับตัวที่กำลังป่วยอยู่ทันทีโดยไม่เสียเงินเพิ่ม
    Object.keys(animals).forEach(k => {
        animals[k].forEach(animal => {
            if (animal.sick) {
                animal.sick = false;
                animal.food = Math.max(animal.food, 50);
            }
        });
    });

    playSound('click');
    showMessage("✅ ซื้อและฉีดวัคซีนป้องกันโรคให้สัตว์ทั้งหมดสำเร็จ!");
    renderAnimals();
    renderAnimalShop();
    saveGame();
};

// ฟังก์ชัน: เปิด/ปิด การดูแล (ลูบหัว) สัตว์เลี้ยงอัตโนมัติ
window.toggleAutoPet = function () {
    autoPetEnabled = !autoPetEnabled;
    playSound('click');
    showMessage(autoPetEnabled ? "✅ จ้างคนดูแลสัตว์แล้ว! (หัก 15% จากรายได้)" : "❌ เลิกจ้างคนดูแลสัตว์แล้ว");
    renderAnimals();
    renderAnimalShop();
    saveGame();
};

// ฟังก์ชัน: อัปเกรดคนงานให้มีความจุพลังงานเยอะขึ้นและฟื้นฟูเร็วขึ้น
window.upgradeWorker = function (type) {
    if (type === 'plant') {
        const cost = autoPlantEnergyLevel * 15000;
        if (money < cost) return showMessage(`💸 เงินไม่พออัพเกรด! (ต้องการ ${cost.toLocaleString()} บาท)`);
        money -= cost;
        currentSeasonExpense += cost;
        if (typeof seasonDetails !== 'undefined') seasonDetails.exUpgrades += cost;
        autoPlantEnergyLevel++;
        playSound('levelup');
        showMessage(`✅ อัพเกรดคนปลูกผักเป็น Lv.${autoPlantEnergyLevel} สำเร็จ!`);
    } else if (type === 'pet') {
        const cost = autoPetEnergyLevel * 15000;
        if (money < cost) return showMessage(`💸 เงินไม่พออัพเกรด! (ต้องการ ${cost.toLocaleString()} บาท)`);
        money -= cost;
        currentSeasonExpense += cost;
        if (typeof seasonDetails !== 'undefined') seasonDetails.exUpgrades += cost;
        autoPetEnergyLevel++;
        playSound('levelup');
        showMessage(`✅ อัพเกรดคนดูแลสัตว์เป็น Lv.${autoPetEnergyLevel} สำเร็จ!`);
    } else if (type === 'miner') {
        const cost = autoMinerEnergyLevel * 15000;
        if (money < cost) return showMessage(`💸 เงินไม่พออัพเกรด! (ต้องการ ${cost.toLocaleString()} บาท)`);
        money -= cost;
        currentSeasonExpense += cost;
        if (typeof seasonDetails !== 'undefined') seasonDetails.exUpgrades += cost;
        autoMinerEnergyLevel++;
        playSound('levelup');
        showMessage(`✅ อัพเกรดคนงานเหมืองเป็น Lv.${autoMinerEnergyLevel} สำเร็จ! (เพิ่มโอกาสหาแร่หายากและจำนวน)`);
        if (typeof renderMining === 'function') renderMining();
    }
    renderAnimalShop();
    saveGame();
};