// shop.js - ระบบร้านเมล็ดพันธุ์, อุปกรณ์ฟาร์มพืช, และตลาดรับซื้อ

// ฟังก์ชัน: วาดหน้าต่างร้านค้า (แสดงสินค้า เรียงตามผักที่ปลูกได้ในฤดูนี้ และตามกำไร)
function renderShop() {
    const shopEl = document.getElementById('shopItems');
    shopEl.innerHTML = '';

    // ส่วนขายอุปกรณ์การปลูกพืช
    const toolDiv = document.createElement('div');
    toolDiv.className = 'shop-tools';
    toolDiv.style.cssText = 'grid-column: 1 / -1; background: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 10px; border: 1px solid #c8e6c9; font-size: 14px;';
    const buyDisabled = fertilizerBoughtThisSeason >= MAX_FERTILIZER_PER_SEASON;
    toolDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #c8e6c9; padding-bottom: 8px;">
            <div>
                <strong style="color: #2e7d32;">💩 ปุ๋ยเร่งโต (ลดเวลาโต 30%)</strong><br>
                <small style="color: #555;">มีอยู่: <strong>${fertilizerStock}</strong> ถุง | ซื้อแล้วฤดูนี้: <strong>${fertilizerBoughtThisSeason}/${MAX_FERTILIZER_PER_SEASON}</strong></small>
            </div>
            <button onclick="buyFertilizer()" style="padding: 8px 12px; background: ${buyDisabled ? '#9e9e9e' : '#4caf50'}; color: white; border: none; border-radius: 6px; cursor: ${buyDisabled ? 'not-allowed' : 'pointer'}; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🛒 ซื้อปุ๋ย (${FERTILIZER_COST} บาท)
            </button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #c8e6c9; padding-bottom: 8px;">
            <div>
                <strong style="color: #0277bd;">💦 สัญญาเช่า: ระบบรดน้ำเหมาแปลง</strong><br>
                <small style="color: #555;">ปุ่มรดน้ำทุกแปลงในคลิกเดียว (ค่าเช่า <strong>${BULK_WATER_COST.toLocaleString()}</strong> บาท/ฤดู)</small>
            </div>
            <button onclick="toggleBulkWater()" style="padding: 8px 12px; background: ${bulkWaterRented ? '#ff4b4b' : '#0288d1'}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${bulkWaterRented ? '❌ ยกเลิกเช่า' : '📝 เช่าระบบ'}
            </button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong style="color: #5d4037;">💩 สัญญาเช่า: ระบบใส่ปุ๋ยเหมาแปลง</strong><br>
                <small style="color: #555;">ใส่ปุ๋ยทุกแปลงพร้อมกันโดยไม่จำกัดสต็อกปุ๋ย (ค่าเช่า <strong>${BULK_FERTILIZER_COST.toLocaleString()}</strong> บาท/ฤดู)</small>
            </div>
            <button onclick="toggleBulkFertilizer()" style="padding: 8px 12px; background: ${bulkFertilizerRented ? '#ff4b4b' : '#8d6e63'}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${bulkFertilizerRented ? '❌ ยกเลิกเช่า' : '📝 เช่าระบบ'}
            </button>
        </div>
    `;
    shopEl.appendChild(toolDiv);

    let shopItems = baseVeggies.map((_, i) => ({ i, v: getVeggie(i) }));
    // จัดเรียง: เอาผักที่ปลูกได้ในฤดูนี้ขึ้นก่อน ตามด้วยกำไร (ราคาขาย - ต้นทุน) มากไปน้อย
    shopItems.sort((a, b) => {
        const aTree = baseVeggies[a.i].isTree;
        const bTree = baseVeggies[b.i].isTree;
        if (!aTree && !bTree) {
            if (a.v.bonus && !b.v.bonus) return -1;
            if (!a.v.bonus && b.v.bonus) return 1;
        }
        return (b.v.value - b.v.cost) - (a.v.value - a.v.cost);
    });

    const renderSeedItem = (item, parentContainer) => {
        const { i, v } = item;
        const div = document.createElement('div');
        div.className = 'seed-item';
        div.style.margin = '0';
        div.style.height = '100%';
        div.style.boxSizing = 'border-box';
        const upgradeCost = Math.floor(60 + veggieLevels[i] * 12);
        const reqSales = veggieLevels[i] * 10;
        const currentSales = veggieSalesCount[i] || 0;
        const canUpgradeBySales = currentSales >= reqSales;

        let reqSeason = "";
        for (let s = 0; s < 4; s++) if (seasonalBonus[s].includes(i)) reqSeason = seasons[s].name;

        const isTree = baseVeggies[i].isTree;

        div.innerHTML = `
            <div>
                <strong>${v.name} (Lv.${veggieLevels[i]}) ${v.bonus && !isTree ? '⭐' : ''}</strong>
                ${baseVeggies[i].isWoodTree ? `<span style="color:#a0522d; font-weight:bold;"> (ให้ไม้)</span>` : ''}
                ${v.popularity > 1.1 ? `<span style="color:#e53e3e; font-size:0.85em; font-weight:bold; margin-left: 5px;" title="ขายเยอะเกินไป: เมล็ดแพงขึ้น / ขายได้ถูกลง">🔥 ขายดี (${v.popularity.toFixed(1)}x)</span>` : ''}
                <br>
                ซื้อ: ${v.cost.toLocaleString()} | 
                ${baseVeggies[i].isWoodTree ? `ให้: ${baseVeggies[i].woodYield} ไม้ / ${(baseVeggies[i].woodTime || 10000) / 1000} วิ` : `ขาย: ${v.value.toLocaleString()}`} | 
                เวลา: ${(v.growTime / 1000).toFixed(0)}s
                ${isTree ? `<small>(${((baseVeggies[i].fruitGrowTime || 0) / 1000).toFixed(0)}s)</small>` : ''}<br>
                ${isTree ? '<span class="bonus" style="color:#f6ad55;">🌳 ปลูกได้ทุกฤดู</span>' : (v.bonus ? '<span class="bonus">🌟 ปลูกได้ในฤดูนี้!</span>' : `<span style="color:#ff4b4b; font-size:0.9em; font-weight:bold;">🔒 ต้องปลูกใน ${reqSeason}</span>`)}
            </div>
            <div class="seed-actions">
                <button ${!v.bonus ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="buySeed(${i})">ปลูก</button>
                <button class="plant-all-btn" ${!v.bonus ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="plantAll(${i})">ปลูกทั้งหมด</button>
                <button class="upgrade-btn" ${!canUpgradeBySales ? 'disabled style="background:#9e9e9e; cursor:not-allowed;"' : ''} onclick="levelUp(${i})">
                    ${canUpgradeBySales ? `อัพ Lv (-${upgradeCost})` : `🔒 ยอดขาย ${currentSales}/${reqSales}`}
                </button>
            </div>
        `;
        parentContainer.appendChild(div);
    };

    const vegHeader = document.createElement('h4');
    vegHeader.textContent = '🌾 เมล็ดพันธุ์ผัก';
    vegHeader.style.cssText = 'color:#2e7d32; margin: 10px 0 10px 0; text-align: left;';
    shopEl.appendChild(vegHeader);

    const vegGrid = document.createElement('div');
    vegGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px;';
    shopEl.appendChild(vegGrid);
    shopItems.forEach(item => { if (!baseVeggies[item.i].isTree) renderSeedItem(item, vegGrid); });

    if (treeFarmExpanded) {
        const treeHeader = document.createElement('h4');
        treeHeader.textContent = '🌲 ต้นกล้าผลไม้ (ปลูกในฟาร์มผลไม้)';
        treeHeader.style.cssText = 'color:#e65100; margin: 15px 0 10px 0; text-align: left; font-size: 16px; border-bottom: 2px dashed #ffcc80; padding-bottom: 5px;';
        shopEl.appendChild(treeHeader);

        const treeGrid = document.createElement('div');
        treeGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px;';
        shopEl.appendChild(treeGrid);
        shopItems.forEach(item => { if (baseVeggies[item.i].isTree && !baseVeggies[item.i].isWoodTree) renderSeedItem(item, treeGrid); });
    }

    if (timberFarmExpanded) {
        const timberHeader = document.createElement('h4');
        timberHeader.textContent = '🪓 พันธุ์ไม้สำหรับตัด (ปลูกในฟาร์มตัดต้นไม้)';
        timberHeader.style.cssText = 'color:#8b4513; margin: 15px 0 10px 0; text-align: left; font-size: 16px; border-bottom: 2px dashed #d2b48c; padding-bottom: 5px;';
        shopEl.appendChild(timberHeader);

        const timberGrid = document.createElement('div');
        timberGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px;';
        shopEl.appendChild(timberGrid);
        shopItems.forEach(item => { if (baseVeggies[item.i].isWoodTree) renderSeedItem(item, timberGrid); });
    }
}

// ฟังก์ชัน: ซื้อปุ๋ยเก็บเข้าสต็อก
window.buyFertilizer = function () {
    if (fertilizerBoughtThisSeason >= MAX_FERTILIZER_PER_SEASON) return showMessage(`🔒 ซื้อปุ๋ยครบโควต้า ${MAX_FERTILIZER_PER_SEASON} ถุงของฤดูนี้แล้ว!`);
    if (money < FERTILIZER_COST) return showMessage("💸 เงินไม่พอ!");

    money -= FERTILIZER_COST;
    currentSeasonExpense += FERTILIZER_COST;
    seasonDetails.exUpgrades += FERTILIZER_COST;
    fertilizerStock++;
    fertilizerBoughtThisSeason++;

    playSound('click');
    showMessage("✅ ซื้อปุ๋ยเร่งโตสำเร็จ 1 ถุง");
    renderShop();
    saveGame();
};

// ฟังก์ชัน: เช่า/ยกเลิก ระบบรดน้ำเหมา
window.toggleBulkWater = function () {
    if (bulkWaterRented) {
        bulkWaterRented = false;
        playSound('click');
        showMessage("❌ ยกเลิกสัญญาระบบรดน้ำเหมาแปลง");
    } else {
        if (money < BULK_WATER_COST) return showMessage(`💸 เงินไม่พอเช่า! (ต้องการ ${BULK_WATER_COST.toLocaleString()} บาท)`);
        money -= BULK_WATER_COST;
        currentSeasonExpense += BULK_WATER_COST;
        seasonDetails.exFees += BULK_WATER_COST;
        bulkWaterRented = true;
        playSound('click');
        showMessage(`✅ เช่าระบบรดน้ำเหมาแปลงสำเร็จ (-${BULK_WATER_COST.toLocaleString()} บาท)`);
    }
    renderShop(); renderFarm(); saveGame();
};

// ฟังก์ชัน: เช่า/ยกเลิก ระบบใส่ปุ๋ยเหมา
window.toggleBulkFertilizer = function () {
    if (bulkFertilizerRented) {
        bulkFertilizerRented = false;
        playSound('click');
        showMessage("❌ ยกเลิกสัญญาระบบใส่ปุ๋ยเหมาแปลง");
    } else {
        if (money < BULK_FERTILIZER_COST) return showMessage(`💸 เงินไม่พอเช่า! (ต้องการ ${BULK_FERTILIZER_COST.toLocaleString()} บาท)`);
        money -= BULK_FERTILIZER_COST;
        currentSeasonExpense += BULK_FERTILIZER_COST;
        seasonDetails.exFees += BULK_FERTILIZER_COST;
        bulkFertilizerRented = true;
        playSound('click');
        showMessage(`✅ เช่าระบบใส่ปุ๋ยเหมาแปลงสำเร็จ (-${BULK_FERTILIZER_COST.toLocaleString()} บาท)`);
    }
    renderShop(); renderFarm(); saveGame();
};

// ฟังก์ชัน: ซื้อเมล็ดพันธุ์และปลูกลงในแปลงที่ว่าง 1 แปลง
window.buySeed = function (type) {
    if (!seasonalBonus[currentSeason].includes(type)) return showMessage("❌ ปลูกไม่ได้! ผักชนิดนี้ไม่ได้อยู่ในฤดูปัจจุบัน");
    const v = getVeggie(type);
    if (money < v.cost) return showMessage("💸 เงินไม่พอ!");

    const b = baseVeggies[type];
    const isWoodTree = b.isWoodTree;
    const isFruitTree = b.isTree && !isWoodTree;

    let empty = -1;
    if (isWoodTree) {
        if (!timberFarmExpanded) return showMessage("🔒 ต้องซื้อฟาร์มตัดต้นไม้ก่อน!");
        for (let i = 40; i < Math.min(48, farm.length); i++) { if (farm[i] && farm[i].type === -1) { empty = i; break; } }
    } else if (isFruitTree) {
        if (!treeFarmExpanded) return showMessage("🔒 ต้องซื้อฟาร์มผลไม้ก่อน!");
        for (let i = 32; i < Math.min(40, farm.length); i++) { if (farm[i] && farm[i].type === -1) { empty = i; break; } }
    } else {
        for (let i = 0; i < Math.min(32, farm.length); i++) { if (farm[i] && farm[i].type === -1) { empty = i; break; } }
    }
    if (empty === -1) return showMessage(isWoodTree ? "🔒 แปลงปลูกไม้เต็ม!" : (isFruitTree ? "🔒 แปลงปลูกผลไม้เต็ม!" : "🔒 แปลงปลูกผักเต็ม!"));

    money -= v.cost;
    currentSeasonExpense += v.cost;
    seasonDetails.exSeeds += v.cost;
    playSound('plant');
    let newPlotData = { type, startTime: Date.now(), watered: false, fertilized: 0, speedMult: 1 };
    if (isWoodTree || isFruitTree) {
        newPlotData.isMature = false;
    }
    farm[empty] = newPlotData;

    // ถ้าปลูกข้ามแท็บ ให้สลับแท็บไปให้เห็นด้วย
    if (empty >= 40) currentFarmTab = 3;
    else if (empty >= 32) currentFarmTab = 2;
    else if (empty >= 16) currentFarmTab = 1;
    else currentFarmTab = 0;

    renderFarm(); saveGame();
};

// ฟังก์ชัน: ซื้อเมล็ดพันธุ์และปลูกลงในแปลงที่ว่าง "ทั้งหมด"
window.plantAll = function (type) {
    if (!seasonalBonus[currentSeason].includes(type)) return showMessage("❌ ปลูกไม่ได้! ผักชนิดนี้ไม่ได้อยู่ในฤดูปัจจุบัน");
    const v = getVeggie(type);
    const b = baseVeggies[type];
    const isWoodTree = b.isWoodTree;
    const isFruitTree = b.isTree && !isWoodTree;

    const emptyIndices = [];
    farm.forEach((plot, idx) => {
        if (plot.type === -1) {
            if (isWoodTree && idx >= 40 && idx < 48) emptyIndices.push(idx);
            else if (isFruitTree && idx >= 32 && idx < 40) emptyIndices.push(idx);
            else if (!isFruitTree && !isWoodTree && idx < 32) emptyIndices.push(idx);
        }
    });

    if (emptyIndices.length === 0) {
        return showMessage(isWoodTree ? "🔒 แปลงปลูกไม้เต็ม!" : (isFruitTree ? "🔒 แปลงปลูกผลไม้เต็ม!" : "🔒 แปลงปลูกผักเต็ม!"));
    }

    let plantedCount = 0;
    let totalCost = 0;

    for (let idx of emptyIndices) {
        if (money >= v.cost) {
            money -= v.cost;
            let newPlotData = { type, startTime: Date.now(), watered: false, fertilized: 0, speedMult: 1 };
            if (isWoodTree || isFruitTree) {
                newPlotData.isMature = false;
            }
            farm[idx] = newPlotData;
            plantedCount++;
            totalCost += v.cost;
        } else {
            break;
        }
    }

    if (plantedCount > 0) {
        playSound('plant');
        currentSeasonExpense += totalCost;
        seasonDetails.exSeeds += totalCost;
        showMessage(`🌱 ปลูก ${v.name} ทั้งหมด ${plantedCount} ต้น (-${totalCost} บาท)`);
        renderFarm(); saveGame();
    } else {
        showMessage("💸 เงินไม่พอปลูก!");
    }
};

// ฟังก์ชัน: อัปเลเวลเมล็ดพันธุ์พืช (เพิ่มราคาขาย) เมื่อขายได้ครบตามเงื่อนไขยอดขาย
window.levelUp = function (i) {
    const reqSales = veggieLevels[i] * 10;
    const currentSales = veggieSalesCount[i] || 0;
    if (currentSales < reqSales) return showMessage(`❌ ต้องขายผักชนิดนี้ให้ครบ ${reqSales} ชิ้นก่อนอัพเลเวล!`);

    const cost = Math.floor(60 + veggieLevels[i] * 12);
    if (money < cost) return showMessage("💸 เงินไม่พอ!");
    money -= cost;
    currentSeasonExpense += cost;
    seasonDetails.exUpgrades += cost;
    veggieLevels[i] = Math.min(veggieLevels[i] + 1, 100);
    playSound('levelup');
    showMessage(`✅ ${baseVeggies[i].name} เลเวล ${veggieLevels[i]}`);
    renderShop(); saveGame();
};

// ==================== ระบบการตลาด (Market System) ====================

// ฟังก์ชัน: อัปเดตราคาตลาดปัจจุบันมาแสดงที่หน้าจอ
function updateMarket() {
    const el = document.getElementById('marketPrices');
    el.innerHTML = '';

    const listContainer = document.createElement('div');
    listContainer.style.display = 'grid';
    listContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    listContainer.style.gap = '6px';
    listContainer.style.marginTop = '10px';

    baseVeggies.forEach((_, i) => {
        const v = getVeggie(i);
        const trendColor = v.modifier > 1.25 ? '#48bb78' : (v.modifier < 0.8 ? '#f56565' : '#a0aec0');
        const trend = v.modifier > 1.25 ? '📈 แพงมาก' : (v.modifier < 0.8 ? '📉 ถูกลง' : '➡️ ปกติ');
        const isTree = baseVeggies[i].isTree;

        const row = document.createElement('div');
        row.style.cssText = 'background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;';

        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 15px;">${v.name} ${v.bonus && !isTree ? '<span style="font-size: 10px; text-shadow: 0 0 4px rgba(255, 215, 0, 0.8);" title="โบนัสฤดูกาล">⭐</span>' : ''}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 13px; font-weight: bold; color: #fff;">${v.value.toLocaleString()} บ.</span>
                <span style="font-size: 12px; color: ${trendColor}; font-weight: bold; width: 60px; text-align: right;">${trend}</span>
            </div>
        `;
        listContainer.appendChild(row);
    });
    el.appendChild(listContainer);
}

// ฟังก์ชัน: สุ่มปรับเปลี่ยนราคาผัก (ตัวคูณ) เพื่อให้ราคาผันผวน
function randomizeMarketPrices() {
    for (let i = 0; i < baseVeggies.length; i++) {
        veggiePriceModifiers[i] = 0.6 + Math.random() * 0.9;
    }
    renderShop();
    updateMarket();
}

// ฟังก์ชัน: บันทึกสถิติว่าผู้เล่นเก็บเกี่ยว/ขายผักชนิดไหนไปแล้วกี่ชิ้น (เอาไว้อัปเลเวล)
function recordCropSale(type) {
    if (veggieSalesCount[type] !== undefined) {
        veggieSalesCount[type]++;
    }
    if (typeof veggiePopularity !== 'undefined' && veggiePopularity[type] !== undefined) {
        // เพิ่มความนิยม: ทุกชิ้นที่ขายจะเพิ่มความนิยมขึ้น 0.05, สูงสุด 3.0 (3 เท่า)
        veggiePopularity[type] = Math.min(3.0, veggiePopularity[type] + 0.05);
        // ลดความนิยมของผักชนิดอื่นลง
        for (let i = 0; i < veggiePopularity.length; i++) {
            if (i !== type && veggiePopularity[i] > 1.0) {
                veggiePopularity[i] = Math.max(1.0, veggiePopularity[i] - 0.02);
            }
        }
    }
}

// ฟังก์ชัน: ปุ่มกดเก็บเกี่ยวผักที่สุกแล้วพร้อมขาย และถอนผักที่ตายแล้ว (เฉา) ทิ้งอัตโนมัติ
window.sellAllToMarket = function () {
    playSound('harvest');
    let total = 0;
    let totalFeedGained = 0;
    let witheredCount = 0;

    const feedValues = {
        0: 3, 1: 1, 2: 4, 3: 2, 4: 2, 5: 1, 6: 5, 7: 2, 8: 3, 9: 4, 10: 3, 11: 4,
        12: 10, 13: 12, 14: 15, 15: 20
    };

    farm.forEach((p, i) => {
        if (p.type !== -1) {
            const v = getVeggie(p.type);
            const b = baseVeggies[p.type];
            if (b.isWoodTree) return; // ข้ามต้นไม้ให้ไม้ในปุ่มขายผักนี้

            if (!v.bonus) {
                witheredCount++;
                farm[i] = { type: -1, startTime: 0 };
            } else if (Date.now() - p.startTime >= getPlotGrowTime(p) / growthMultiplier) {
                total += v.value;
                const feedGained = feedValues[p.type] || 1;
                totalFeedGained += feedGained + Math.floor(veggieLevels[p.type] / 10);
                recordCropSale(p.type);
                if (baseVeggies[p.type].isTree) {
                    p.startTime = Date.now();
                    p.watered = false;
                    p.fertilized = 0;
                } else {
                    farm[i] = { type: -1, startTime: 0 };
                }
            }
        }
    });
    if (total > 0 || witheredCount > 0) {
        if (total > 0) {
            money += total;
            currentSeasonIncome += total;
            totalLifetimeIncome += total;
            seasonDetails.inCrops += total;
            feedStock = Math.min(window.getMaxFeed(), feedStock + totalFeedGained);
        }
        let msg = total > 0 ? `🚚 ขายได้ +${total} บาท (+${totalFeedGained} Feed)` : `🚚 ไม่มีผักพร้อมขาย`;
        if (witheredCount > 0) msg += ` | 🥀 โละผักเฉาทิ้ง ${witheredCount} แปลง`;
        showMessage(msg);
    } else {
        showMessage(`🚚 ไม่มีผักพร้อมขาย`);
    }
    renderFarm(); renderShop(); saveGame();
};