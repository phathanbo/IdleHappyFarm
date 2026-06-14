// season.js - ระบบฤดูกาล สภาพอากาศ และสรุปยอด

// ฟังก์ชัน: อัปเดตแถบความคืบหน้าของฤดูกาล และสภาพอากาศปัจจุบัน
function updateSeasonUI() {
    const elapsed = Date.now() - seasonStartTime;
    const duration = 120000;
    const progress = Math.min((elapsed / duration) * 100, 100);
    document.getElementById('seasonProgress').style.width = `${progress}%`;

    const remainingSecs = Math.max(0, Math.ceil((duration - elapsed) / 1000));
    const minutes = Math.floor(remainingSecs / 60);
    const seconds = remainingSecs % 60;
    const w = weatherData[currentWeather] || weatherData[0];
    const cooldownText = `⌛ เปลี่ยนในอีก : ${minutes > 0 ? minutes + ' น. ' : ''}${seconds} วิ. | สภาพอากาศ: ${w.name}`;
    const cooldownEl = document.getElementById('seasonCooldown');
    if (cooldownEl) {
        cooldownEl.textContent = cooldownText;
    }

    const list = document.getElementById('seasonList');
    if (list.children.length === 0) {
        seasons.forEach((s, i) => {
            const div = document.createElement('div');
            div.className = `season-item ${i === currentSeason ? 'current' : ''}`;
            div.textContent = s.name;
            list.appendChild(div);
        });
    } else {
        Array.from(list.children).forEach((child, i) => {
            if (i === currentSeason && !child.classList.contains('current')) {
                child.classList.add('current');
            } else if (i !== currentSeason && child.classList.contains('current')) {
                child.classList.remove('current');
            }
        });
    }
}

// ฟังก์ชัน: แสดงหน้าต่างป๊อปอัปสรุปรายรับ-รายจ่าย เมื่อหมดฤดูกาล
function showSeasonSummary(oldSeasonName, inc, exp, details) {
    isGamePaused = true;
    pauseStartTime = Date.now();

    const overlay = document.createElement('div');
    overlay.id = 'seasonSummaryOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 9999;
    `;
    document.body.appendChild(overlay);

    const modal = document.createElement('div');
    modal.id = 'seasonSummaryModal';
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 25px 35px; border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4); z-index: 10000; text-align: center;
        min-width: 300px; animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    const profit = inc - exp;
    const profitColor = profit >= 0 ? '#28a745' : '#dc3545';
    const profitText = profit >= 0 ? 'กำไร' : 'ขาดทุน';

    modal.innerHTML = `
        <h2 style="margin-top:0; color: #333;">📊 สรุปยอด ${oldSeasonName}</h2>
        <div style="background: #f4fdf4; border: 1px solid #c3e6cb; padding: 10px; border-radius: 8px; margin-bottom: 10px; text-align: left;">
            <div style="display:flex; justify-content:space-between; font-size:16px; margin-bottom: 5px;">
                <strong style="color:#28a745;">รายรับทั้งหมด:</strong> <strong style="color:#28a745;">+${inc.toLocaleString()} บ.</strong>
            </div>
            <div style="font-size: 13px; color: #555; padding-top: 5px; border-top: 1px dashed #ccc;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 3px;"><span>🌾 ผลผลิต:</span> <span>+${details.inCrops.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 3px;"><span>🐔 สัตว์เลี้ยง:</span> <span>+${details.inAnimals.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between;"><span>💰 ขายสัตว์:</span> <span>+${details.inSell.toLocaleString()}</span></div>
            </div>
        </div>
        <div style="background: #fff5f5; border: 1px solid #f5c6cb; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: left;">
            <div style="display:flex; justify-content:space-between; font-size:16px; margin-bottom: 5px;">
                <strong style="color:#dc3545;">รายจ่ายทั้งหมด:</strong> <strong style="color:#dc3545;">-${exp.toLocaleString()} บ.</strong>
            </div>
            <div style="font-size: 13px; color: #555; padding-top: 5px; border-top: 1px dashed #ccc;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 3px;"><span>🌱 เมล็ดพันธุ์:</span> <span>-${details.exSeeds.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 3px;"><span>🍎 อาหารและยา:</span> <span>-${details.exCare.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 3px;"><span>🔨 ซื้อ/อัพเกรด:</span> <span>-${details.exUpgrades.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 3px;"><span>💸 ค่าธรรมเนียม:</span> <span>-${details.exFees.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; color: #e53e3e; font-weight: bold;"><span>🧾 ภาษีเงินได้ (ขั้นบันได):</span> <span>-${(details.tax || 0).toLocaleString()}</span></div>
            </div>
        </div>
        <div style="font-size: 11px; color: #666; margin-top: -10px; margin-bottom: 15px; text-align: center; line-height: 1.4;">
            * อัตราภาษีขั้นบันไดคิดจากรายรับ: <br>
            ≤1k (0%) | 1k-10k (5%) | 10k-50k (10%) | 50k-200k (15%) | >200k (20%)
        </div>
        ${details.repDecay > 0 ? `<div style="font-size: 13px; color: #b45309; background: #fffbeb; border: 1px dashed #fcd34d; padding: 6px; border-radius: 8px; margin-bottom: 15px; text-align: center;">🌟 เวลาผ่านไป... ชื่อเสียงฟาร์มเสื่อมถอยลง <strong>-${details.repDecay.toLocaleString()} แต้ม</strong></div>` : ''}
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
        <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:bold;">
            <span>${profitText}สุทธิ:</span> <span style="color:${profitColor};">${profit.toLocaleString()} บาท</span>
        </div>
        <button onclick="resumeGameFromSummary()" style="margin-top: 25px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; width: 100%;">ตกลง</button>
    `;

    document.body.appendChild(modal);
}

// ฟังก์ชัน: เล่นเกมต่อหลังจากที่ผู้เล่นกดยืนยันป๊อปอัปสรุปยอดฤดูกาล
window.resumeGameFromSummary = function () {
    if (isGamePaused) {
        const pausedDuration = Date.now() - pauseStartTime;
        seasonStartTime += pausedDuration;
        farm.forEach(p => {
            if (p.type !== -1) p.startTime += pausedDuration;
        });
        isGamePaused = false;
    }
    const modal = document.getElementById('seasonSummaryModal');
    if (modal) modal.remove();
    const overlay = document.getElementById('seasonSummaryOverlay');
    if (overlay) overlay.remove();
};

// ฟังก์ชัน: เปลี่ยนฤดูกาล หักค่าธรรมเนียม และรีเซ็ตโควต้าต่างๆ ของเกม
function updateSeason() {
    isGamePaused = true; // หยุดเกมทันทีเพื่อรอดูแอนิเมชันเปลี่ยนฉาก

    const oldSeasonName = seasons[currentSeason].name;
    const nextSeasonIdx = (currentSeason + 1) % 4;
    const nextSeasonData = seasons[nextSeasonIdx];

    // สร้าง Overlay แอนิเมชันเปลี่ยนฉาก
    const transOverlay = document.createElement('div');
    let iconEmoji = '🌸';
    if (nextSeasonData.name.includes('ร้อน')) iconEmoji = '☀️';
    else if (nextSeasonData.name.includes('ฝน')) iconEmoji = '🌧️';
    else if (nextSeasonData.name.includes('หนาว')) iconEmoji = '❄️';

    transOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, ${nextSeasonData.color} 100%);
        z-index: 100005; display: flex; flex-direction: column; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 1s ease-in-out; pointer-events: none;
    `;

    transOverlay.innerHTML = `
        <div style="font-size: 100px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4)); transform: scale(0.5); transition: transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="seasonTransIcon">${iconEmoji}</div>
        <h1 style="color: white; font-size: 3.5em; text-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3); margin-top: 15px; transform: translateY(30px); transition: transform 1s ease-out;" id="seasonTransText">เข้าสู่${nextSeasonData.name}</h1>
    `;

    document.body.appendChild(transOverlay);

    // เฟดอิน
    setTimeout(() => {
        transOverlay.style.opacity = '1';
        document.getElementById('seasonTransIcon').style.transform = 'scale(1.2)';
        document.getElementById('seasonTransText').style.transform = 'translateY(0)';
        playSound('harvest'); // เล่นเสียงแจ้งเตือน
    }, 50);

    // รอให้แอนิเมชันแสดง 2 วินาที แล้วทำการอัปเดตข้อมูลและแสดงสรุป
    setTimeout(() => {
        currentSeason = nextSeasonIdx;
        totalSeasonsPassed++; // เพิ่มสถิติจำนวนฤดูกาลที่ผ่านไป
        seasonStartTime = Date.now();
        currentWeather = 0; // เริ่มฤดูกาลใหม่ด้วยอากาศแจ่มใสเสมอ
        weatherLastChange = Date.now();
        fertilizerBoughtThisSeason = 0; // รีเซ็ตโควต้าปุ๋ย
        updateSeasonUI();
        document.body.style.background = `linear-gradient(#87CEEB, ${seasons[currentSeason].color})`;

        // คิดภาษีเงินได้แบบขั้นบันไดจากรายรับของฤดูกาลนี้ (currentSeasonIncome)
        let taxPaid = 0;
        const income = currentSeasonIncome;
        if (income > 1000) {
            let remaining = income;
            remaining -= 1000;
            if (remaining <= 9000) { taxPaid += remaining * 0.05; remaining = 0; }
            else { taxPaid += 9000 * 0.05; remaining -= 9000; }
            if (remaining > 0) { if (remaining <= 40000) { taxPaid += remaining * 0.10; remaining = 0; } else { taxPaid += 40000 * 0.10; remaining -= 40000; } }
            if (remaining > 0) { if (remaining <= 150000) { taxPaid += remaining * 0.15; remaining = 0; } else { taxPaid += 150000 * 0.15; remaining -= 150000; } }
            if (remaining > 0) { taxPaid += remaining * 0.20; }
            taxPaid = Math.floor(taxPaid);
        }

        if (taxPaid > 0) {
            if (money >= taxPaid) { money -= taxPaid; currentSeasonExpense += taxPaid; }
            else { currentSeasonExpense += money; taxPaid = Math.floor(money); money = 0; }
            seasonDetails.tax = taxPaid;
        } else {
            seasonDetails.tax = 0;
        }

        // หักเงินค่าธรรมเนียมต่างๆ
        let totalPenFee = 0;
        Object.keys(pens).forEach(idx => { if (pens[idx].purchased) totalPenFee += pens[idx].level * 200; });
        if (totalPenFee > 0) { if (money >= totalPenFee) { money -= totalPenFee; currentSeasonExpense += totalPenFee; seasonDetails.exFees += totalPenFee; } else { currentSeasonExpense += money; seasonDetails.exFees += money; money = 0; } }
        let feeMsgs = [];
        if (totalPenFee > 0) feeMsgs.push(`คอก -${totalPenFee}`);
        if (bulkWaterRented) { if (money >= BULK_WATER_COST) { money -= BULK_WATER_COST; currentSeasonExpense += BULK_WATER_COST; seasonDetails.exFees += BULK_WATER_COST; feeMsgs.push(`เช่าน้ำ -${BULK_WATER_COST}`); } else { bulkWaterRented = false; feeMsgs.push(`ยกเลิกเช่าน้ำ`); } }
        if (bulkFertilizerRented) { if (money >= BULK_FERTILIZER_COST) { money -= BULK_FERTILIZER_COST; currentSeasonExpense += BULK_FERTILIZER_COST; seasonDetails.exFees += BULK_FERTILIZER_COST; feeMsgs.push(`เช่าปุ๋ย -${BULK_FERTILIZER_COST}`); } else { bulkFertilizerRented = false; feeMsgs.push(`ยกเลิกเช่าปุ๋ย`); } }

        const feeText = feeMsgs.length > 0 ? ` (${feeMsgs.join(', ')})` : ``;
        showMessage(`เปลี่ยนฤดูเป็น ${seasons[currentSeason].name}${feeText}`, 4500);

        // เสื่อมถอยชื่อเสียงฟาร์ม 10% ทุกฤดูกาล เพื่อให้ผู้เล่นต้องประกวดสัตว์เรื่อยๆ
        if (typeof farmReputation !== 'undefined' && farmReputation > 0) {
            const decay = Math.ceil(farmReputation * 0.10);
            farmReputation -= decay;
            seasonDetails.repDecay = decay;
        }

        showSeasonSummary(oldSeasonName, currentSeasonIncome, currentSeasonExpense, seasonDetails);

        // บันทึกประวัติลงกราฟ (เก็บแค่ 10 ฤดูล่าสุด)
        if (typeof incomeHistory !== 'undefined') {
            incomeHistory.push(currentSeasonIncome);
            if (incomeHistory.length > 10) incomeHistory.shift();
            expenseHistory.push(currentSeasonExpense);
            if (expenseHistory.length > 10) expenseHistory.shift();
        }

        lastSeasonIncome = currentSeasonIncome; lastSeasonExpense = currentSeasonExpense; totalLifetimeExpense += currentSeasonExpense;
        currentSeasonIncome = 0; currentSeasonExpense = 0; seasonDetails = { inCrops: 0, inAnimals: 0, inSell: 0, exSeeds: 0, exCare: 0, exUpgrades: 0, exFees: 0, tax: 0 };

        renderFarm(); renderShop(); updateMarket(); renderAnimalShop();

        // เฟดเอาต์และลบแอนิเมชันออก
        transOverlay.style.opacity = '0';
        setTimeout(() => transOverlay.remove(), 1000);

    }, 2200);
}

// ฟังก์ชัน: ตรวจสอบเวลา หากเวลาเกินที่กำหนดจะสั่งสับเปลี่ยนฤดูกาล
function checkSeasonProgress() {
    const elapsed = Date.now() - seasonStartTime;
    const duration = 120000;
    if (elapsed >= duration) { updateSeason(); }
}