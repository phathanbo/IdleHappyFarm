// mining.js - ระบบเหมืองแร่และการคราฟท์วัสดุก่อสร้าง
// mining.js - ระบบเหมืองแร่และการคราฟท์วัสดุก่อสร้าง

function renderMining() {
    const container = document.getElementById('miningContainer');
    if (!container) return;

    const maxMat = typeof window.getMaxMaterials === 'function' ? window.getMaxMaterials() : 50;
    const getCardAmtHtml = (stock, max) => {
        const isFull = stock >= max;
        return `<div class="amount" style="font-size: 18px; font-weight: bold; color: ${isFull ? '#fca5a5' : '#fff'};">${stock.toLocaleString()}<span style="font-size: 11px; font-weight: normal; color: ${isFull ? '#fca5a5' : '#cbd5e1'}; display: block; margin-top: 2px;">/ ${max.toLocaleString()}</span></div>`;
    };

    let miningHtml = `
        <div class="material-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div class="material-card" style="border-radius: 16px; padding: 12px; text-align: center;"><h4 style="margin: 0 0 5px 0; color: #cbd5e1; font-size: 13px;">🌲 ไม้ดิบ</h4>${getCardAmtHtml(woodStock, maxMat)}</div>
            <div class="material-card" style="border-radius: 16px; padding: 12px; text-align: center;"><h4 style="margin: 0 0 5px 0; color: #cbd5e1; font-size: 13px;">🪨 หินดิบ</h4>${getCardAmtHtml(stoneStock, maxMat)}</div>
            <div class="material-card" style="border-radius: 16px; padding: 12px; text-align: center;"><h4 style="margin: 0 0 5px 0; color: #86efac; font-size: 13px;">🪵 ไม้แผ่น</h4>${getCardAmtHtml(woodPlankStock, maxMat)}</div>
            <div class="material-card" style="border-radius: 16px; padding: 12px; text-align: center;"><h4 style="margin: 0 0 5px 0; color: #86efac; font-size: 13px;">🧱 หินก้อน</h4>${getCardAmtHtml(stoneBlockStock, maxMat)}</div>
            <div class="material-card" style="border-radius: 16px; padding: 12px; text-align: center;"><h4 style="margin: 0 0 5px 0; color: #cbd5e1; font-size: 13px;">⛏️ แร่เหล็ก</h4>${getCardAmtHtml(ironOreStock, maxMat)}</div>
            <div class="material-card" style="border-radius: 16px; padding: 12px; text-align: center;"><h4 style="margin: 0 0 5px 0; color: #fde047; font-size: 13px;">✨ แร่ทอง</h4>${getCardAmtHtml(goldOreStock, maxMat)}</div>
            <div class="material-card" style="border-radius: 16px; padding: 12px; text-align: center;"><h4 style="margin: 0 0 5px 0; color: #cbd5e1; font-size: 13px;">⚙️ เหล็กแท่ง</h4>${getCardAmtHtml(ironBarStock, maxMat)}</div>
            <div class="material-card" style="border-radius: 16px; padding: 12px; text-align: center;"><h4 style="margin: 0 0 5px 0; color: #fde047; font-size: 13px;">🌟 ทองแท่ง</h4>${getCardAmtHtml(goldBarStock, maxMat)}</div>
        </div>

        <div class="crafting-card" style="margin-bottom: 20px;">
            <h3 style="margin-top:0; color:#fcd34d; border-bottom:2px dashed rgba(255,255,255,0.2); padding-bottom:8px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">🔨 แปรรูปวัสดุก่อสร้าง</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                <div id="craftingRow_woodPlank" style="height: 100%;">${getCraftingRowHtml('woodPlank')}</div>
                <div id="craftingRow_stoneBlock" style="height: 100%;">${getCraftingRowHtml('stoneBlock')}</div>
                <div id="craftingRow_ironBar" style="height: 100%;">${getCraftingRowHtml('ironBar')}</div>
                <div id="craftingRow_goldBar" style="height: 100%;">${getCraftingRowHtml('goldBar')}</div>
            </div>
        </div>

        <div class="mine-card">
            <h3 style="margin-top:0; color:#fcd34d; border-bottom:2px dashed rgba(255,255,255,0.2); padding-bottom:8px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">⛰️ สำรวจเหมืองแร่ (Lv.${mineLevel})</h3>
            <p style="font-size: 14px; color: #cbd5e1; margin-top: 0; text-align: center;">ส่งคนงานไปขุดเหมืองเพื่อหาหินดิบและแร่ล้ำค่า (ใช้เวลา 30 วินาที)</p>
            <p style="font-size: 13px; color: #fca5a5; font-weight: bold; text-align: center;">ค่าจ้าง: 100 บาท + 10 Feed (เสบียง)</p>
            
            <div id="mineActionArea" style="margin-top: 15px;">
                ${getMineActionHtml()}
            </div>

            <div style="margin-top: 20px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #bfdbfe; font-size: 15px; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">🔼 อัพเกรดเหมือง (เพิ่มผลผลิตแร่)</h4>
                ${getMineUpgradeHtml()}
            </div>
            
            <div style="margin-top: 20px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 15px;">
                ${getAutoMinerHtml()}
            </div>
        </div>
    `;

    container.innerHTML = miningHtml;
}

function getCraftingRowHtml(type) {
    let reqBuilding = '';
    if (type === 'woodPlank') reqBuilding = 'sawmill';
    if (type === 'stoneBlock') reqBuilding = 'stoneCrusher';
    if (type === 'ironBar' || type === 'goldBar') reqBuilding = 'smelter';

    if (reqBuilding && (!buildings || !buildings[reqBuilding] || buildings[reqBuilding].level === 0)) {
        let bName = buildings && buildings[reqBuilding] ? buildings[reqBuilding].name : reqBuilding;
        return `<div style="background: rgba(0,0,0,0.4); padding: 20px; border-radius: 16px; border: 1px dashed rgba(255,255,255,0.2); height: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; text-align: center; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);"><strong style="color: #94a3b8; font-size: 1.1em;">🔒 ต้องสร้าง<br><span style="color:#fcd34d;">${bName}</span><br>ก่อนจึงจะใช้งานได้</strong></div>`;
    }

    let name = getMaterialName(type);
    let icon = type === 'woodPlank' ? '🪵' : type === 'stoneBlock' ? '🧱' : type === 'ironBar' ? '⚙️' : '🌟';
    let recipeStr = '';

    if (type === 'woodPlank') recipeStr = 'ใช้ 2 ไม้ดิบ + 10 บ.<br>➔ 1 ไม้แผ่น (10s)';
    if (type === 'stoneBlock') recipeStr = 'ใช้ 2 หินดิบ + 20 บ.<br>➔ 1 หินก้อน (15s)';
    if (type === 'ironBar') recipeStr = 'ใช้ 5 แร่เหล็ก + 50 บ.<br>➔ 1 เหล็กแท่ง (30s)';
    if (type === 'goldBar') recipeStr = 'ใช้ 10 แร่ทอง + 100 บ.<br>➔ 1 ทองแท่ง (60s)';

    let active = activeCrafting[type];
    let crafted = craftedItems[type];

    if (crafted) {
        return `<div style="background: linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(22, 163, 74, 0.3)); padding: 15px; border-radius: 16px; border: 1px solid rgba(74, 222, 128, 0.4); display: flex; flex-direction: column; justify-content: space-between; align-items: center; height: 100%; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.2);">
            <div style="text-align: center; margin-bottom: 10px;"><strong style="color: #bbf7d0; font-size: 1.1em;">✅ ${icon} สำเร็จ!</strong><br><span style="color: #fff; font-size: 1.2em; font-weight: bold;">${name} x${crafted.qty}</span></div>
            <button onclick="collectCraftedItem('${type}')" style="background: linear-gradient(180deg, #4ade80, #16a34a); color: white; width: 100%; padding: 10px 0;">🧺 เก็บของ</button>
        </div>`;
    } else if (active) {
        const remain = Math.max(0, Math.ceil((active.endTime - Date.now()) / 1000));
        const progress = Math.min(100, 100 - (remain / (active.totalTime / 1000) * 100));
        return `<div style="background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(37, 99, 235, 0.3)); padding: 15px; border-radius: 16px; border: 1px solid rgba(96, 165, 250, 0.4); display: flex; flex-direction: column; justify-content: space-between; align-items: center; height: 100%; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.2);">
            <div style="text-align: center; margin-bottom: 5px;"><strong style="color: #bfdbfe; font-size: 1.1em;">⏳ กำลังแปรรูป</strong><br><span style="color: #fff; font-size: 1.2em; font-weight: bold;">${name} x${active.qty}</span></div>
            <div style="color: #fcd34d; font-weight: bold; font-size: 1.4em; margin-bottom: 10px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${remain}s</div>
            <div style="width: 100%; background: rgba(0,0,0,0.5); border-radius: 6px; height: 12px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);"><div style="width: ${progress}%; background: linear-gradient(90deg, #60a5fa, #3b82f6); height: 100%; transition: width 0.5s linear; box-shadow: inset 0 2px 4px rgba(255,255,255,0.4);"></div></div>
        </div>`;
    } else {
        let capType = type.charAt(0).toUpperCase() + type.slice(1);
        let btnBg = type === 'woodPlank' ? 'linear-gradient(180deg, #f97316, #c2410c)' : type === 'stoneBlock' ? 'linear-gradient(180deg, #94a3b8, #475569)' : type === 'ironBar' ? 'linear-gradient(180deg, #cbd5e1, #64748b)' : 'linear-gradient(180deg, #fcd34d, #b45309)';
        return `<div style="background: rgba(0,0,0,0.25); padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between; align-items: center; height: 100%; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);">
            <div style="text-align: center; margin-bottom: 10px;"><strong style="color: #fff; font-size: 1.2em; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${icon} แปรรูป${name}</strong><br><small style="color: #cbd5e1; display: block; margin-top: 5px; line-height: 1.4;">${recipeStr}</small></div>
            <div style="display: flex; gap: 8px; align-items: center; width: 100%;"><input type="number" id="qty${capType}" value="1" min="1" style="width: 60px; text-align: center; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 8px; background: rgba(0,0,0,0.4); color: white; font-weight: bold; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); outline: none;"><button onclick="startCraftMaterial('${type}')" style="flex: 1; background: ${btnBg}; color: white; padding: 10px 0;">${type.includes('Bar') ? 'หลอม' : 'แปรรูป'}</button></div>
        </div>`;
    }
}

function getMaterialName(type) {
    if (type === 'woodPlank') return 'ไม้แผ่น';
    if (type === 'stoneBlock') return 'หินก้อน';
    if (type === 'ironBar') return 'เหล็กแท่ง';
    if (type === 'goldBar') return 'ทองแท่ง';
    return type;
}

function getMineUpgradeHtml() {
    const nextLevel = mineLevel + 1;
    const ironCost = mineLevel * 5;
    const goldCost = mineLevel * 2;
    const moneyCost = mineLevel * 1000;

    const canUpgrade = ironBarStock >= ironCost && goldBarStock >= goldCost && money >= moneyCost;

    return `
        <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 16px; font-size: 14px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
            <p style="margin: 0 0 10px 0; color: #fcd34d; text-shadow: 0 1px 2px rgba(0,0,0,0.5); font-size: 1.1em; text-align: center;"><strong>เลื่อนเป็นระดับ ${nextLevel}</strong></p>
            <ul style="margin: 0 0 15px 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; text-align: center;">
                <li style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 8px; color: ${ironBarStock >= ironCost ? '#86efac' : '#fca5a5'}">⚙️ เหล็กแท่ง: ${ironCost.toLocaleString()} (มี ${ironBarStock.toLocaleString()})</li>
                <li style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 8px; color: ${goldBarStock >= goldCost ? '#86efac' : '#fca5a5'}">🌟 ทองแท่ง: ${goldCost.toLocaleString()} (มี ${goldBarStock.toLocaleString()})</li>
                <li style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 8px; color: ${money >= moneyCost ? '#86efac' : '#fca5a5'}">💰 เงิน: ${moneyCost.toLocaleString()} บ. (มี ${Math.floor(money).toLocaleString()})</li>
            </ul>
            <button onclick="upgradeMine()" ${!canUpgrade ? 'disabled' : ''} style="${!canUpgrade ? 'background: linear-gradient(180deg, #64748b, #334155); cursor: not-allowed;' : 'background: linear-gradient(180deg, #3b82f6, #1d4ed8);'} color: white; width: 100%; padding: 12px;">
                ${canUpgrade ? '✨ อัพเกรดเหมืองเลย!' : '🔒 ทรัพยากรไม่พออัพเกรด'}
            </button>
        </div>
    `;
}

window.upgradeMine = function () {
    const ironCost = mineLevel * 5;
    const goldCost = mineLevel * 2;
    const moneyCost = mineLevel * 1000;

    if (ironBarStock < ironCost || goldBarStock < goldCost || money < moneyCost) {
        return showMessage("❌ ทรัพยากรไม่พออัพเกรด!");
    }

    ironBarStock -= ironCost;
    goldBarStock -= goldCost;
    money -= moneyCost;
    currentSeasonExpense += moneyCost;
    if (typeof seasonDetails !== 'undefined') seasonDetails.exUpgrades += moneyCost;

    mineLevel++;
    playSound('levelup');
    showMessage(`🎉 อัพเกรดเหมืองแร่เป็นระดับ ${mineLevel} สำเร็จ!`);
    renderMining();
    saveGame();
}

function getMineActionHtml() {
    if (minedRewards) {
        return `<button onclick="collectMine()" style="width: 100%; background: linear-gradient(180deg, #4ade80, #16a34a); color: white; padding: 15px; font-size: 16px; animation: readyPulse3D 1.5s infinite;">🧺 เก็บเกี่ยวของจากเหมือง!</button>`;
    } else if (isMining) {
        const remain = Math.max(0, Math.ceil((miningEndTime - Date.now()) / 1000));
        return `<button disabled style="width: 100%; background: linear-gradient(180deg, #94a3b8, #475569); color: white; padding: 15px; font-size: 16px;">⏳ กำลังขุดเหมือง... (${remain}s)</button>`;
    } else {
        return `<button onclick="startMining()" style="width: 100%; background: linear-gradient(180deg, #3b82f6, #1d4ed8); color: white; padding: 15px; font-size: 16px;">⛏️ เริ่มสำรวจเหมือง (-100 บ.)</button>`;
    }
}

function getAutoMinerHtml() {
    const minerMax = 100; // พลังงานสูงสุดคงที่
    const upgradeCostMiner = autoMinerEnergyLevel * 15000;
    const upgradeBtnMiner = `<button style="background: linear-gradient(180deg, #8b5cf6, #6d28d9); color: white; width: 100%; padding: 8px; margin-top: 8px;" onclick="upgradeWorker('miner')">🔼 อัพเกรดคนงาน (Lv.${autoMinerEnergyLevel}) - ${upgradeCostMiner.toLocaleString()} บ.</button>`;

    if (autoMinerEnabled) {
        let statusText = autoMinerResting ? `<span style="color:#fca5a5;">💤 กำลังพักฟื้น (${Math.floor(autoMinerEnergy)}/${minerMax})</span>` : `<span style="color:#86efac;">⚡ พลังงาน: ${Math.floor(autoMinerEnergy)}/${minerMax}</span>`;
        return `
            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 16px; margin-top: 5px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="width: 100%; text-align: center;">
                        <strong style="color: #fcd34d; font-size: 1.1em; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">👷 จ้างคนงานเหมืองอัตโนมัติ</strong>
                        <small style="display: block; color: #cbd5e1; margin-top: 4px;">ลงเหมืองและเก็บของอัตโนมัติ (หัก 100บ. + 10 Feed/รอบ)</small>
                    </div>
                </div>
                <div id="autoMinerStatus" style="font-size: 13px; font-weight: bold; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 6px; text-align: center;">${statusText}</div>
                <button onclick="toggleAutoMiner()" style="background: linear-gradient(180deg, #ef4444, #b91c1c); color: white; width: 100%; padding: 10px;">❌ เลิกจ้าง</button>
                ${upgradeBtnMiner}
            </div>
        `;
    } else {
        return `
            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 16px; margin-top: 5px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 8px; text-align: center;">
                <div>
                    <strong style="color: #fcd34d; font-size: 1.1em; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">👷 จ้างคนงานเหมืองอัตโนมัติ</strong>
                    <small style="display: block; color: #cbd5e1; margin-top: 4px;">ลงเหมืองและเก็บของอัตโนมัติ (หัก 100บ. + 10 Feed/รอบ)</small>
                </div>
                <button onclick="toggleAutoMiner()" style="background: linear-gradient(180deg, #3b82f6, #1d4ed8); color: white; width: 100%; padding: 10px;">✅ จ้างทำงาน (ฟรี)</button>
                ${upgradeBtnMiner}
            </div>
        `;
    }
}

window.toggleAutoMiner = function () {
    autoMinerEnabled = !autoMinerEnabled;
    playSound('click');
    showMessage(autoMinerEnabled ? "✅ จ้างคนงานเหมืองอัตโนมัติแล้ว!" : "❌ เลิกจ้างคนงานเหมืองอัตโนมัติแล้ว");
    renderMining();
    saveGame();
};

window.startCraftMaterial = function (type) {
    if (activeCrafting[type] || craftedItems[type]) return showMessage("❌ มีรายการแปรรูปนี้ทำงานอยู่ หรือต้องเก็บของก่อน");

    let reqBuilding = '';
    if (type === 'woodPlank') reqBuilding = 'sawmill';
    if (type === 'stoneBlock') reqBuilding = 'stoneCrusher';
    if (type === 'ironBar' || type === 'goldBar') reqBuilding = 'smelter';
    if (reqBuilding && (!buildings || !buildings[reqBuilding] || buildings[reqBuilding].level === 0)) {
        return showMessage("🔒 ต้องสร้างโรงงานก่อนจึงจะแปรรูปได้!");
    }

    let qtyInput, qty, cost, moneyCost, timePerUnit;

    if (type === 'woodPlank') {
        qtyInput = document.getElementById('qtyWoodPlank');
        qty = qtyInput ? parseInt(qtyInput.value) : 1;
        if (isNaN(qty) || qty < 1) return showMessage("❌ กรุณาระบุจำนวนที่ถูกต้อง");

        cost = 2 * qty; moneyCost = 10 * qty; timePerUnit = 10;
        if (woodStock < cost) return showMessage(`❌ ไม้ดิบไม่พอ! (ต้องการ ${cost} ไม้ดิบ)`);
        if (money < moneyCost) return showMessage(`💸 เงินไม่พอ! (ต้องการ ${moneyCost} บ.)`);
        woodStock -= cost;
    } else if (type === 'stoneBlock') {
        qtyInput = document.getElementById('qtyStoneBlock');
        qty = qtyInput ? parseInt(qtyInput.value) : 1;
        if (isNaN(qty) || qty < 1) return showMessage("❌ กรุณาระบุจำนวนที่ถูกต้อง");

        cost = 2 * qty; moneyCost = 20 * qty; timePerUnit = 15;
        if (stoneStock < cost) return showMessage(`❌ หินดิบไม่พอ! (ต้องการ ${cost} หินดิบ)`);
        if (money < moneyCost) return showMessage(`💸 เงินไม่พอ! (ต้องการ ${moneyCost} บ.)`);
        stoneStock -= cost;
    } else if (type === 'ironBar') {
        qtyInput = document.getElementById('qtyIronBar');
        qty = qtyInput ? parseInt(qtyInput.value) : 1;
        if (isNaN(qty) || qty < 1) return showMessage("❌ กรุณาระบุจำนวนที่ถูกต้อง");

        cost = 5 * qty; moneyCost = 50 * qty; timePerUnit = 30;
        if (ironOreStock < cost) return showMessage(`❌ แร่เหล็กไม่พอ! (ต้องการ ${cost} แร่เหล็ก)`);
        if (money < moneyCost) return showMessage(`💸 เงินไม่พอ! (ต้องการ ${moneyCost} บ.)`);
        ironOreStock -= cost;
    } else if (type === 'goldBar') {
        qtyInput = document.getElementById('qtyGoldBar');
        qty = qtyInput ? parseInt(qtyInput.value) : 1;
        if (isNaN(qty) || qty < 1) return showMessage("❌ กรุณาระบุจำนวนที่ถูกต้อง");

        cost = 10 * qty; moneyCost = 100 * qty; timePerUnit = 60;
        if (goldOreStock < cost) return showMessage(`❌ แร่ทองไม่พอ! (ต้องการ ${cost} แร่ทอง)`);
        if (money < moneyCost) return showMessage(`💸 เงินไม่พอ! (ต้องการ ${moneyCost} บ.)`);
        goldOreStock -= cost;
    }

    money -= moneyCost;
    currentSeasonExpense += moneyCost;
    if (typeof seasonDetails !== 'undefined') seasonDetails.exUpgrades += moneyCost;

    const totalTime = timePerUnit * qty * 1000;
    activeCrafting[type] = { type: type, qty: qty, endTime: Date.now() + totalTime, totalTime: totalTime };

    showMessage(`🔨 เริ่มแปรรูป ${getMaterialName(type)} จำนวน ${qty} อัน`);
    renderMining(); saveGame();
};

window.collectCraftedItem = function (type) {
    if (!craftedItems[type]) return;

    let qty = craftedItems[type].qty;
    const maxMat = typeof window.getMaxMaterials === 'function' ? window.getMaxMaterials() : 50;

    let currentStock = 0;
    if (type === 'woodPlank') currentStock = woodPlankStock;
    else if (type === 'stoneBlock') currentStock = stoneBlockStock;
    else if (type === 'ironBar') currentStock = ironBarStock;
    else if (type === 'goldBar') currentStock = goldBarStock;

    if (currentStock >= maxMat) {
        return showMessage(`❌ คลังเก็บ ${getMaterialName(type)} เต็มแล้ว! (ความจุสูงสุด: ${maxMat})`);
    }

    const actualGain = Math.min(maxMat - currentStock, qty);

    if (type === 'woodPlank') woodPlankStock += actualGain;
    else if (type === 'stoneBlock') stoneBlockStock += actualGain;
    else if (type === 'ironBar') ironBarStock += actualGain;
    else if (type === 'goldBar') goldBarStock += actualGain;

    if (actualGain < qty) {
        showMessage(`✅ ได้รับ ${getMaterialName(type)} ${actualGain} อัน (คลังเต็มแล้ว เหลือค้าง ${qty - actualGain} อัน!)`);
        craftedItems[type].qty = qty - actualGain;
    } else {
        showMessage(`✅ ได้รับ ${getMaterialName(type)} ${qty} อัน!`);
        delete craftedItems[type];
    }

    renderMining(); saveGame();
};

window.startMining = function () {
    if (isMining || minedRewards) return;
    if (money < 100) return showMessage("💸 เงินไม่พอค่าจ้างขุดเหมือง! (ต้องการ 100 บ.)");
    if (feedStock < 10) return showMessage("❌ เสบียงไม่พอ! (ต้องการ 10 Feed)");

    money -= 100; feedStock -= 10;
    currentSeasonExpense += 100; seasonDetails.exFees += 100;
    isMining = true; miningEndTime = Date.now() + 30000;

    playSound('click'); showMessage("⛏️ คนงานเริ่มลงไปสำรวจเหมืองแล้ว!");
    renderMining(); saveGame();
};

window.collectMine = function () {
    if (!minedRewards) return;
    const maxMat = typeof window.getMaxMaterials === 'function' ? window.getMaxMaterials() : 50;

    let stoneGained = Math.min(maxMat - stoneStock, minedRewards.stone);
    let ironGained = Math.min(maxMat - ironOreStock, minedRewards.iron);
    let goldGained = Math.min(maxMat - goldOreStock, minedRewards.gold);

    stoneStock += stoneGained;
    ironOreStock += ironGained;
    goldOreStock += goldGained;

    playSound('harvest');
    let msg = `🧺 ได้รับ หินดิบ x${stoneGained}`;
    if (ironGained > 0) msg += `, แร่เหล็ก x${ironGained}`;
    if (goldGained > 0) msg += `, แร่ทอง x${goldGained}`;

    if (stoneGained < minedRewards.stone || ironGained < minedRewards.iron || goldGained < minedRewards.gold) {
        msg += ` (⚠️ บางส่วนล้นคลัง!)`;
    }

    showMessage(msg, 4000);
    minedRewards = null; isMining = false;
    renderMining(); saveGame();
};

window.checkCraftingProgress = function () {
    let changed = false;
    for (const type of ['woodPlank', 'stoneBlock', 'ironBar', 'goldBar']) {
        if (activeCrafting[type]) {
            if (Date.now() >= activeCrafting[type].endTime) {
                craftedItems[type] = { type: activeCrafting[type].type, qty: activeCrafting[type].qty };
                delete activeCrafting[type];
                playSound('levelup');
                showMessage(`🎉 แปรรูป${getMaterialName(type)}เสร็จแล้ว!`);
                changed = true;
            }
            const row = document.getElementById(`craftingRow_${type}`);
            if (row) row.innerHTML = getCraftingRowHtml(type);
        }
    }
    if (changed) {
        saveGame();
    }
};

window.checkMiningProgress = function () {
    if (!isMining && !minedRewards) return;

    if (isMining && Date.now() >= miningEndTime) {
        // ถ้าจ้างคนงานอยู่ จะได้รับโบนัสเพิ่มจากเลเวลคนงาน
        const workerLevel = (typeof autoMinerEnabled !== 'undefined' && autoMinerEnabled) ? (autoMinerEnergyLevel || 1) : 1;
        const workerBonusMultiplier = 1 + (workerLevel - 1) * 0.1; // +10% ผลผลิตต่อเลเวลคนงาน

        // คำนวณผลผลิตพื้นฐานจากเลเวลเหมือง + โบนัสโอกาสจากเลเวลคนงาน
        let stoneAmount = Math.floor(Math.random() * 11) + 5 + (mineLevel * 2);
        let ironChance = 0.4 + (mineLevel * 0.05) + ((workerLevel - 1) * 0.02);
        let goldChance = 0.1 + (mineLevel * 0.02) + ((workerLevel - 1) * 0.01);

        let ironAmount = Math.random() < ironChance ? Math.floor(Math.random() * 3) + 1 + Math.floor(mineLevel / 2) : 0;
        let goldAmount = Math.random() < goldChance ? 1 + Math.floor(mineLevel / 4) : 0;

        // ใช้โบนัสเพิ่มจำนวนจากคนงาน
        stoneAmount = Math.floor(stoneAmount * workerBonusMultiplier);
        ironAmount = Math.floor(ironAmount * workerBonusMultiplier);
        goldAmount = Math.floor(goldAmount * workerBonusMultiplier);

        minedRewards = { stone: stoneAmount, iron: ironAmount, gold: goldAmount };
        isMining = false;

        if (autoMinerEnabled) {
            const maxMat = typeof window.getMaxMaterials === 'function' ? window.getMaxMaterials() : 50;
            let stoneGained = Math.min(maxMat - stoneStock, minedRewards.stone);
            let ironGained = Math.min(maxMat - ironOreStock, minedRewards.iron);
            let goldGained = Math.min(maxMat - goldOreStock, minedRewards.gold);

            stoneStock += stoneGained;
            ironOreStock += ironGained;
            goldOreStock += goldGained;

            let mMsg = `🧺 ออโต้เก็บเหมือง: หิน x${stoneGained}${ironGained > 0 ? `, เหล็ก x${ironGained}` : ''}${goldGained > 0 ? `, ทอง x${goldGained}` : ''}`;
            if (stoneGained < minedRewards.stone || ironGained < minedRewards.iron || goldGained < minedRewards.gold) {
                mMsg += ` (⚠️ คลังเต็มบางส่วน!)`;
            }
            minedRewards = null;
            playSound('harvest');
            showMessage(mMsg, 3000);
        } else {
            playSound('harvest');
            showMessage("🎉 คนงานเหมืองกลับมาแล้ว! ไปกดรับของได้เลย");
        }
        renderMining(); saveGame();
    } else if (!isMining && minedRewards) {
        if (autoMinerEnabled) {
            const maxMat = typeof window.getMaxMaterials === 'function' ? window.getMaxMaterials() : 50;
            let stoneGained = Math.min(maxMat - stoneStock, minedRewards.stone);
            let ironGained = Math.min(maxMat - ironOreStock, minedRewards.iron);
            let goldGained = Math.min(maxMat - goldOreStock, minedRewards.gold);

            stoneStock += stoneGained;
            ironOreStock += ironGained;
            goldOreStock += goldGained;

            minedRewards = null;
            playSound('harvest');
            renderMining(); saveGame();
        } else {
            const actionArea = document.getElementById('mineActionArea');
            if (actionArea) actionArea.innerHTML = getMineActionHtml();
        }
    } else {
        const actionArea = document.getElementById('mineActionArea');
        if (actionArea) actionArea.innerHTML = getMineActionHtml();
    }
};