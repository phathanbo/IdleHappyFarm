// ==================== ระบบเสียงและเพลงประกอบ ====================
const sounds = {
    harvest: new Audio("https://orangefreesounds.com/wp-content/uploads/2025/09/8-bit-retro-coin-item-pickup-sound-effect.mp3"),
    plant: new Audio("https://freesound.org/data/previews/276/276951_5121236-lq.mp3"),
    click: new Audio("https://freesound.org/data/previews/66/66930_931655-lq.mp3"),
    error: new Audio("https://actions.google.com/sounds/v1/ui/button_click_error.ogg"),
    levelup: new Audio("https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg"),
    alert: new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg")
};
let bgm = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
bgm.loop = true;
bgm.volume = 0.3;
let bgmPlaying = false;

// ฟังก์ชันสำหรับเล่นเสียง Effect (เอฟเฟกต์) ต่างๆ
function playSound(t) {
    const s = sounds[t];
    if (s) { s.currentTime = 0; s.play().catch(() => { }); }
}

// ฟังก์ชันสำหรับเปิด/ปิดเพลงประกอบพื้นหลัง
window.toggleBGM = () => {
    bgmPlaying ? bgm.pause() : bgm.play().catch(() => { });
    bgmPlaying = !bgmPlaying;
};

// ==================== ตัวแปรสถานะและข้อมูลภายในเกม ====================
let money = 500;
let growthMultiplier = 1;
let farm = Array(16).fill().map(() => ({ type: -1, startTime: 0 }));
let veggieLevels = Array(19).fill(1);
let currentSeason = 0;
let seasonStartTime = Date.now();
let feedStock = 0;        // วัตถุดิบอาหารสัตว์ (จากผัก)
let woodStock = 0;        // วัตถุดิบไม้
let stoneStock = 0;       // วัตถุดิบหิน
let woodPlankStock = 0;   // ไม้แผ่น
let stoneBlockStock = 0;  // หินก้อน
let ironBarStock = 0;     // เหล็กแท่ง
let goldBarStock = 0;     // ทองแท่ง
let ironOreStock = 0;     // แร่เหล็ก
let goldOreStock = 0;     // แร่ทอง
let farmReputation = 0;   // ค่าชื่อเสียงฟาร์ม (ได้จากการประกวด)
let veggiePriceModifiers = Array(19).fill(1.0); // ตัวแปรความผันผวนของราคาขาย
let veggiePopularity = Array(19).fill(1.0); // ตัวแปรความนิยม/ปริมาณการขายพืชผัก (Supply & Demand)
let unlockedAchievements = []; // เก็บ ID ความสำเร็จที่ปลดล็อคแล้ว
let autoFeederPurchased = false; // สถานะเครื่องป้อนอาหารอัตโนมัติ
let vaccinePurchased = false; // สถานะวัคซีนป้องกันโรค
let autoHarvestEnabled = false; // สถานะบริการเก็บเกี่ยวอัตโนมัติ
const AUTO_HARVEST_FEE_PERCENT = 0.10; // ค่าบริการ 10% จากยอดขาย
let autoPlantEnabled = false; // สถานะรับจ้างปลูก
let autoPlantType = 0; // ชนิดผักที่จะให้ปลูกออโต้
let autoPlantWorkerLevel = 1; // ระดับคนงาน
let autoPetEnabled = false; // สถานะรับจ้างดูแลสัตว์
let currentSeasonIncome = 0; // รายรับฤดูกาลปัจจุบัน
let currentSeasonExpense = 0; // รายจ่ายฤดูกาลปัจจุบัน
let lastSeasonIncome = 0; // รายรับฤดูกาลก่อนหน้า
let lastSeasonExpense = 0; // รายจ่ายฤดูกาลก่อนหน้า
let totalLifetimeIncome = 0; // สถิติรายรับรวมตลอดชีพ
let totalLifetimeExpense = 0; // สถิติรายจ่ายรวมตลอดชีพ
let incomeHistory = []; // ประวัติรายรับ 10 ฤดูล่าสุด
let expenseHistory = []; // ประวัติรายจ่าย 10 ฤดูล่าสุด
let isGamePaused = false; // สถานะหยุดเกม
let pauseStartTime = 0; // เวลาเริ่มหยุดเกม
let seasonDetails = { inCrops: 0, inAnimals: 0, inSell: 0, exSeeds: 0, exCare: 0, exUpgrades: 0, exFees: 0, tax: 0 }; // รายละเอียดรายรับรายจ่าย
let veggieSalesCount = Array(19).fill(0); // สถิติการขายผักแต่ละชนิด
let currentWeather = 0; // สภาพอากาศปัจจุบัน
let weatherLastChange = Date.now(); // เวลาที่เปลี่ยนอากาศล่าสุด
let fertilizerStock = 0; // สต็อกปุ๋ย
let fertilizerBoughtThisSeason = 0; // จำนวนปุ๋ยที่ซื้อในฤดูนี้
const MAX_FERTILIZER_PER_SEASON = 10; // ลิมิตการซื้อปุ๋ยต่อฤดูกาล
const FERTILIZER_COST = 50; // ราคาปุ๋ย
let totalSeasonsPassed = 0; // จำนวนฤดูกาลที่ผ่านไปแล้ว
let farmExpanded = false; // สถานะการขยายที่ดิน (ถ้าขยายแล้วจะเป็น true)
let treeFarmExpanded = false; // สถานะปลดล็อกฟาร์มต้นไม้
let timberFarmExpanded = false; // สถานะปลดล็อกฟาร์มตัดต้นไม้
let currentFarmTab = 0; // แท็บปัจจุบันของแปลงผัก (0 = ฟาร์ม 1, 1 = ฟาร์ม 2)
let currentAnimalShopTab = 'pens'; // แท็บปัจจุบันในหน้าร้านขายสัตว์ (pens หรือ equip)
let currentPenTab = 0; // แท็บปัจจุบันของคอกสัตว์เลี้ยง
let bulkWaterRented = false; // สถานะเช่าระบบรดน้ำเหมาแปลง
const BULK_WATER_COST = 5000; // ค่าเช่าระบบรดน้ำเหมา
let bulkFertilizerRented = false; // สถานะเช่าระบบใส่ปุ๋ยเหมาแปลง
const BULK_FERTILIZER_COST = 25000; // ค่าเช่าระบบใส่ปุ๋ยเหมา
let animalTools = { 0: false, 1: false, 2: false, 3: false }; // สถานะการซื้ออุปกรณ์เก็บเกี่ยวสัตว์
let isMining = false; // สถานะการสำรวจเหมือง
let miningEndTime = 0; // เวลาที่สำรวจเหมืองเสร็จ
let minedRewards = null; // ของรางวัลที่รอเก็บจากการสำรวจ
let mineLevel = 1; // ระดับของเหมืองแร่

let autoPlantEnergy = 100;
let autoPlantResting = false;
let autoPetEnergy = 100;
let autoPetResting = false;
let autoPlantEnergyLevel = 1;
let autoPetEnergyLevel = 1;
let autoMinerEnabled = false;
let autoMinerEnergy = 100;
let autoMinerResting = false;
let autoMinerEnergyLevel = 1;

// ข้อมูลสิ่งปลูกสร้างเสริมของฟาร์ม
let buildings = {
    farmerHouse: { level: 0, max: 3, name: "🏠 บ้านชาวนา", costBase: 10000, woodCostBase: 50, desc: "ที่พักฟื้นฟู", feeBase: 500, reqSeasons: [0, 2, 5] },
    waterWell: { level: 0, max: 3, name: "🚰 บ่อน้ำบาดาล", costBase: 15000, woodCostBase: 20, desc: "ลดเวลาโตของพืช 5% /Lv", feeBase: 800, reqSeasons: [1, 3, 6] },
    silo: { level: 0, max: 3, name: "📦 ยุ้งฉาง", costBase: 20000, woodCostBase: 100, desc: "ความจุอาหารสัตว์ +300/Lv", feeBase: 1200, reqSeasons: [2, 4, 8] },
    storage: { level: 0, max: 5, name: "📦 โรงเก็บของ", costBase: 12000, woodCostBase: 50, desc: "เพิ่มความจุวัสดุทุกชนิด +100/Lv", feeBase: 500, reqSeasons: [0, 1, 3] },
    sawmill: { level: 0, max: 1, name: "🪚 โรงแปรรูปไม้", costBase: 15000, woodCostBase: 100, desc: "ปลดล็อคการแปรรูปไม้เป็นไม้แผ่น", feeBase: 0, reqSeasons: [1, 2] },
    stoneCrusher: { level: 0, max: 1, name: "⚙️ โรงบดหิน", costBase: 25000, woodCostBase: 150, desc: "ปลดล็อคการแปรรูปหินเป็นหินก้อน", feeBase: 0, reqSeasons: [1, 3] },
    smelter: { level: 0, max: 1, name: "🔥 โรงหลอมแร่", costBase: 50000, woodCostBase: 300, desc: "ปลดล็อคการหลอมแร่เหล็กและทอง", feeBase: 0, reqSeasons: [2, 4] }
};

window.getMaxFeed = function () {
    return 200 + (buildings.silo ? buildings.silo.level * 300 : 0);
};

window.getMaxMaterials = function () {
    return 50 + (buildings.storage ? buildings.storage.level * 100 : 0);
};

let craftingTasks = { sawmill: null, stoneCrusher: null, smelter: null };
let activeCrafting = {}; // เก็บข้อมูลการแปรรูปที่กำลังทำงานแยกตามชนิด
let craftedItems = {}; // ของที่แปรรูปเสร็จแล้วรอเก็บแยกตามชนิด

// ==================== โครงสร้างข้อมูลคอกและสัตว์เลี้ยง ====================
let animals = {
    0: [], // Chickens
    1: [], // Cows
    2: [], // Goats
    3: []  // Bees
};

let pens = {
    0: { purchased: false, level: 1 },
    1: { purchased: false, level: 1 },
    2: { purchased: false, level: 1 },
    3: { purchased: false, level: 1 }
};

// ==================== ฟังก์ชันประมวลผลหลักของเกม ====================

// ฟังก์ชัน: คำนวณเวลาเติบโตของพืชในแปลงนั้นๆ
function getPlotGrowTime(plot) {
    if (plot.type === -1) return 0;
    const i = plot.type;
    const lvl = veggieLevels[i] || 1;
    const b = baseVeggies[i];
    const s = seasons[currentSeason];
    const w = weatherData[currentWeather] || weatherData[0];
    const wellBonus = (buildings.waterWell) ? buildings.waterWell.level * 0.05 : 0;

    let baseGrow = b.baseGrow;
    let isSeasonalBonus = seasonalBonus[currentSeason].includes(i);

    if (b.isTree) {
        isSeasonalBonus = false; // Trees are not affected by seasonal bonus/malus for growth time
        if (plot.isMature) {
            baseGrow = b.fruitGrowTime;
        }
    }

    const growMult = s.growMult * (isSeasonalBonus ? 0.75 : 1) * w.growMult * (1 - wellBonus);

    return Math.floor(baseGrow * (1 + (lvl - 1) * 0.04) * growMult);
}

// ฟังก์ชัน: ดึงข้อมูลและคำนวณคุณสมบัติของพืชชนิดนั้นๆ (รวมผลจากสภาพอากาศ เลเวล และฤดูกาล)
function getVeggie(i) {
    const lvl = veggieLevels[i] || 1;
    const b = baseVeggies[i];
    const s = seasons[currentSeason];
    const w = weatherData[currentWeather] || weatherData[0];
    const bonus = seasonalBonus[currentSeason].includes(i);
    const isTree = b.isTree;
    const wellBonus = (typeof buildings !== 'undefined' && buildings.waterWell) ? buildings.waterWell.level * 0.05 : 0;
    const growMult = s.growMult * (bonus && !isTree ? 0.75 : 1) * w.growMult * (1 - wellBonus);
    const priceMult = s.priceMult * (bonus && !isTree ? 1.4 : 1);
    const modifier = veggiePriceModifiers[i] !== undefined ? veggiePriceModifiers[i] : 1.0;
    const popularity = (typeof veggiePopularity !== 'undefined' && veggiePopularity[i] !== undefined) ? veggiePopularity[i] : 1.0;
    const repBonus = 1 + ((typeof farmReputation !== 'undefined' ? farmReputation : 0) * 0.001); // 1 ชื่อเสียง = โบนัส 0.1%

    // Volatility affects both seed cost and crop selling value
    const finalCost = Math.floor(b.baseCost * modifier * popularity);
    const finalValue = Math.floor(b.baseValue * (1 + (lvl - 1) * 0.09) * priceMult * (modifier / Math.sqrt(popularity)) * repBonus);

    return {
        name: b.name,
        cost: Math.max(1, finalCost), // Prevent cost from going below 1
        growTime: Math.floor(b.baseGrow * (1 + (lvl - 1) * 0.04) * growMult), // Note: This is only for initial grow time display
        value: Math.max(1, finalValue), // Prevent value from going below 1
        bonus: bonus,
        modifier: modifier,
        popularity: popularity
    };
}

// ฟังก์ชัน: คำนวณผลผลิตสะสมทั้งหมดของสัตว์เลี้ยงที่รอเก็บ
function getTotalPendingYield() {
    let total = 0;
    Object.keys(animals).forEach(k => {
        animals[k].forEach(animal => {
            total += (animal.yield || 0);
        });
    });
    return Math.floor(total);
}


// ฟังก์ชัน: สะสมผลผลิตให้สัตว์เลี้ยงแต่ละตัว (เรียกใช้ทุก 1 วินาที)
function produceAnimalYield() {
    Object.keys(animals).forEach(k => {
        const idx = parseInt(k);
        const penBonus = pens[idx].purchased ? (1 + (pens[idx].level - 1) * 0.1) : 0;
        animals[idx].forEach(animal => {
            if (!animal.sick && !animal.inContest && (animal.fatigueSeason === undefined || totalSeasonsPassed > animal.fatigueSeason)) {
                const efficiency = Math.max(0, animal.food / 100);
                const happinessMult = animal.happiness !== undefined ? (0.5 + (animal.happiness / 200)) : 1;
                const evoMult = animal.isEvolved ? animalData[idx].evoMult : 1;
                const repBonus = 1 + ((typeof farmReputation !== 'undefined' ? farmReputation : 0) * 0.001);
                const amount = animalData[idx].produce * (1 + (animal.level - 1) * 0.15) * penBonus * efficiency * happinessMult * evoMult * repBonus;
                const maxYield = animalData[idx].maxYield * (1 + (animal.level - 1) * 0.5) * evoMult; // ขยายตะกร้าตามเลเวลและวิวัฒนาการ
                animal.yield = Math.min((animal.yield || 0) + amount, maxYield);
            }
        });
    });
}

// ฟังก์ชัน: อัปเดตข้อมูลหน้าสรุปภาพรวมฟาร์ม
function updateFarmOverview() {
    const farmSummary = document.getElementById('farmSummaryOverview');
    const animalSummary = document.getElementById('animalSummaryOverview');
    if (!farmSummary || !animalSummary) return;

    // คำนวณข้อมูลฟาร์มปลูกผัก
    let totalPlots = farm.length;
    let growingCount = 0;
    let readyCount = 0;

    farm.forEach((plot) => {
        if (plot.type !== -1) {
            const elapsed = Date.now() - plot.startTime;
            const req = getPlotGrowTime(plot) / (growthMultiplier * (plot.speedMult || 1));
            if (elapsed >= req) {
                readyCount++;
            } else {
                growingCount++;
            }
        }
    });

    farmSummary.innerHTML = `จำนวนแปลงปลูกทั้งหมด: <strong>${totalPlots}</strong> แปลง<br>กำลังปลูก: <strong style="color: #ff9800;">${growingCount}</strong> แปลง<br>พร้อมเก็บเกี่ยว: <strong style="color: #4caf50;">${readyCount}</strong> แปลง`;

    // คำนวณข้อมูลคอกสัตว์
    let totalAnimals = 0;
    let totalYieldPerSec = 0;

    Object.keys(animals).forEach(k => {
        const idx = parseInt(k);
        const penBonus = pens[idx].purchased ? (1 + (pens[idx].level - 1) * 0.1) : 0;
        animals[idx].forEach(animal => {
            totalAnimals++;
            if (!animal.sick && !animal.inContest && (animal.fatigueSeason === undefined || totalSeasonsPassed > animal.fatigueSeason)) {
                const efficiency = Math.max(0, animal.food / 100);
                const happinessMult = animal.happiness !== undefined ? (0.5 + (animal.happiness / 200)) : 1;
                const evoMult = animal.isEvolved ? animalData[idx].evoMult : 1;
                const repBonus = 1 + ((typeof farmReputation !== 'undefined' ? farmReputation : 0) * 0.001);
                totalYieldPerSec += animalData[idx].produce * (1 + (animal.level - 1) * 0.15) * penBonus * efficiency * happinessMult * evoMult * repBonus;
            }
        });
    });

    animalSummary.innerHTML = `จำนวนสัตว์เลี้ยง: <strong>${totalAnimals}</strong> ตัว<br>ผลผลิตรวม: <strong style="color: #2196f3;">+${totalYieldPerSec.toFixed(2)}</strong> บาท/วิ`;

    // อัปเดตรายการสิ่งปลูกสร้าง (แบบ Text เดิมให้เชื่อมกับข้อมูลจริง)
    const bSummary = document.getElementById('buildingsSummaryOverview');
    if (bSummary) {
        let bHtml = '<ul style="list-style: none; padding: 0; line-height: 1.6; margin: 0;">';
        Object.keys(buildings).forEach(k => {
            const b = buildings[k];
            if (b.level > 0) bHtml += `<li>${b.name.split(' ')[0]} <strong>${b.name.substring(b.name.indexOf(' ') + 1)}</strong> (Lv.${b.level}) - ${b.desc}</li>`;
        });
        if (bHtml === '<ul style="list-style: none; padding: 0; line-height: 1.6; margin: 0;">') bHtml += '<li><small>ยังไม่มีสิ่งปลูกสร้าง (ซื้อได้ที่ร้านค้า)</small></li>';
        bSummary.innerHTML = bHtml + '</ul>';
    }

    // สร้างแผนที่กราฟิกจำลองพื้นที่ฟาร์ม
    const mapContainer = document.getElementById('farm-map-visual');
    if (mapContainer) {
        let mapHtml = `<div class="farm-map-layout" style="display: flex flex-direction: column; gap: 1px; max-width: 380px; overflow: auto; padding: 10px;">`;
        const zoneStyle = "background: rgba(0,0,0,0.2); border-radius: 12px; padding: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.3);";

        // แผนที่แปลงปลูกผัก
        mapHtml += `<div class="map-zone map-farm-zone" style="${zoneStyle}"><h4>🌾 โซนแปลงปลูก</h4><div class="map-grid">`;
        farm.forEach((plot, i) => {
            if (i >= 40 && !timberFarmExpanded) return;
            if (i >= 32 && i < 40 && !treeFarmExpanded) return;
            if (plot.type === -1) mapHtml += `<div class="map-cell empty" title="${i >= 40 ? 'ฟาร์มตัดต้นไม้' : (i >= 32 ? 'ฟาร์มผลไม้' : 'แปลงว่าง')}"></div>`;
            else mapHtml += `<div class="map-cell planted" title="${getVeggie(plot.type).name}">${getVeggie(plot.type).name.split(' ')[0]}</div>`;
        });
        mapHtml += `</div></div>`;
        // แผนที่คอกสัตว์
        mapHtml += `<div class="map-zone map-animal-zone" style="${zoneStyle}"><h4>🐾 โซนคอกสัตว์</h4><div class="map-grid-large">`;
        penData.forEach((p, idx) => {
            if (pens[idx].purchased) mapHtml += `<div class="map-cell-large active" title="${p.name} (คลิกเพื่อดูรายละเอียด)" onclick="goToPen(${idx})">${p.emoji}<small>Lv.${pens[idx].level}</small></div>`;
            else mapHtml += `<div class="map-cell-large locked">🔒<small>ว่าง</small></div>`;
        });
        mapHtml += `</div></div>`;
        // แผนที่สิ่งปลูกสร้าง
        mapHtml += `<div class="map-zone map-building-zone" style="${zoneStyle}"><h4>🏭 โซนสิ่งปลูกสร้าง</h4><div class="map-grid-large">`;
        Object.keys(buildings).forEach(key => {
            const b = buildings[key];
            if (b.level > 0) mapHtml += `<div class="map-cell-large building" title="${b.name}">${b.name.split(' ')[0]}<small>Lv.${b.level}</small></div>`;
            else mapHtml += `<div class="map-cell-large locked">🏗️<small>พื้นที่ว่าง</small></div>`;
        });
        mapHtml += `</div></div>`;
        mapContainer.innerHTML = mapHtml + `</div>`;
    }
}

// ==================== ฟังก์ชันวาดหน้าจอ (Rendering) ====================

// ฟังก์ชัน: วาดพื้นที่แปลงปลูกพืช (Farm Grid) และจัดการปุ่มรดน้ำ/ใส่ปุ๋ยบนแปลง
function renderFarm() {
    const farmEl = document.getElementById('farm');
    farmEl.innerHTML = '';

    // เพิ่มแท็บสำหรับฟาร์ม 1 และ ฟาร์ม 2 รวมถึงปุ่มเครื่องมือ
    const headerDiv = document.createElement('div');
    headerDiv.style.gridColumn = '1 / -1';
    headerDiv.style.display = 'flex';
    headerDiv.style.flexDirection = 'column';
    headerDiv.style.gap = '10px';
    headerDiv.style.marginBottom = '15px';

    let tabsHtml = '';
    if (farmExpanded || treeFarmExpanded || timberFarmExpanded) {
        const farm2Size = farm.length >= 32 ? 16 : farm.length - 16;
        const treeFarmSize = farm.length > 32 ? farm.length - 32 : 0;
        tabsHtml = `
            <div style="margin-bottom: 10px;">
                <select onchange="switchFarmTab(this.value)" style="width: 100%; padding: 10px; font-size: 16px; font-weight: bold; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;">
                    <option value="0" ${currentFarmTab === 0 ? 'selected' : ''}>🚜 ฟาร์ม 1 (16 แปลง)</option>
                    ${farmExpanded ? `<option value="1" ${currentFarmTab === 1 ? 'selected' : ''}>🚜 ฟาร์ม 2 (${farm2Size} แปลง)</option>` : ''}
                    ${treeFarmExpanded ? `<option value="2" ${currentFarmTab === 2 ? 'selected' : ''}>🌲 ฟาร์มผลไม้ (8 แปลง)</option>` : ''}
                    ${timberFarmExpanded ? `<option value="3" ${currentFarmTab === 3 ? 'selected' : ''}>🪓 ฟาร์มตัดต้นไม้ (8 แปลง)</option>` : ''}
                </select>
            </div>
        `;
    }

    let controlsHtml = `<div style="display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">`;
    if (currentFarmTab === 2) {
        controlsHtml += `<button onclick="waterAllTrees()" style="padding: 10px 15px; background-color: #0288d1;">💦 รดน้ำต้นไม้</button>`;
        controlsHtml += `<button onclick="fertilizeAllTrees()" style="padding: 10px 15px; background-color: #8d6e63;">💩 ใส่ปุ๋ยต้นไม้</button>`;
        controlsHtml += `<button onclick="harvestAllTrees()" style="padding: 10px 15px; background-color: #ff6b6b;">🪓 เก็บผลผลิตต้นไม้</button>`;
    } else if (currentFarmTab === 3) {
        controlsHtml += `<button onclick="waterAllTimbers()" style="padding: 10px 15px; background-color: #0288d1;">💦 รดน้ำต้นไม้</button>`;
        controlsHtml += `<button onclick="fertilizeAllTimbers()" style="padding: 10px 15px; background-color: #8d6e63;">💩 ใส่ปุ๋ยต้นไม้</button>`;
        controlsHtml += `<button onclick="harvestAllTimbers()" style="padding: 10px 15px; background-color: #ed8936;">🪓 เก็บไม้ทั้งหมด</button>`;
    } else {
        if (bulkWaterRented) {
            controlsHtml += `<button onclick="waterAllPlots()" style="padding: 10px 20px; background-color: #0288d1; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">💦 รดน้ำทั้งหมด</button>`;
        }
        if (bulkFertilizerRented) {
            controlsHtml += `<button onclick="fertilizeAllPlots()" style="padding: 10px 20px; background-color: #8d6e63; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">💩 ใส่ปุ๋yทั้งหมด</button>`;
        }
        controlsHtml += `<button onclick="sellAllToMarket()" style="padding: 10px 20px; background-color: #ff6b6b; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🚚 เก็บเกี่ยวและขายทั้งหมด</button>`;
    }

    // ระบบขยายที่ดิน
    if (!farmExpanded) {
        const soldAll = veggieSalesCount.slice(0, 12).every(c => c >= 100);
        const playedSeason = totalSeasonsPassed >= 1;
        const fourAnimals = [0, 1, 2, 3].every(idx => animals[idx] && animals[idx].length >= 4);

        if (soldAll && playedSeason && fourAnimals) {
            controlsHtml += `<button onclick="buyLandExpansion()" style="padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🗺️ ซื้อที่ดินเพิ่ม (50,000 บ.)</button>`;
        } else {
            controlsHtml += `<button onclick="showExpansionReqs()" style="padding: 10px 20px; background-color: #9e9e9e; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🔒 ขยายที่ดิน</button>`;
        }
    } else if (farm.length < 32) {
        const soldAll2 = veggieSalesCount.slice(0, 12).every(c => c >= 200);
        const playedSeason2 = totalSeasonsPassed >= 3;
        const fullAnimals = [0, 1, 2, 3].every(idx => animals[idx] && animals[idx].length >= 6);

        if (soldAll2 && playedSeason2 && fullAnimals) {
            controlsHtml += `<button onclick="buyFarm2Expansion()" style="padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🗺️ ขยายฟาร์ม 2 (150,000 บ.)</button>`;
        } else {
            controlsHtml += `<button onclick="showFarm2ExpansionReqs()" style="padding: 10px 20px; background-color: #9e9e9e; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🔒 ขยายฟาร์ม 2</button>`;
        }
    } else if (!treeFarmExpanded) {
        const playedSeason3 = totalSeasonsPassed >= 5;
        const rich = money >= 500000;

        if (playedSeason3 && rich) {
            controlsHtml += `<button onclick="buyTreeFarmExpansion()" style="padding: 10px 20px; background-color: #2e7d32; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🌲 ซื้อฟาร์มผลไม้ (500,000 บ.)</button>`;
        } else {
            controlsHtml += `<button onclick="showTreeFarmExpansionReqs()" style="padding: 10px 20px; background-color: #9e9e9e; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🔒 ซื้อฟาร์มผลไม้</button>`;
        }
    } else if (!timberFarmExpanded) {
        const playedSeason4 = totalSeasonsPassed >= 6;
        const rich = money >= 1000000;

        if (playedSeason4 && rich) {
            controlsHtml += `<button onclick="buyTimberFarmExpansion()" style="padding: 10px 20px; background-color: #8b4513; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🪓 ซื้อฟาร์มตัดต้นไม้ (1,000,000 บ.)</button>`;
        } else {
            controlsHtml += `<button onclick="showTimberFarmExpansionReqs()" style="padding: 10px 20px; background-color: #9e9e9e; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🔒 ซื้อฟาร์มตัดต้นไม้</button>`;
        }
    }
    controlsHtml += `</div>`;

    headerDiv.innerHTML = tabsHtml + controlsHtml;
    farmEl.appendChild(headerDiv);

    let startIndex = 0, endIndex = 16;
    if (currentFarmTab === 1) { startIndex = 16; endIndex = 32; }
    else if (currentFarmTab === 2) { startIndex = 32; endIndex = 40; }
    else if (currentFarmTab === 3) { startIndex = 40; endIndex = 48; }

    farm.forEach((plot, idx) => {
        if (idx < startIndex || idx >= endIndex) return;

        const div = document.createElement('div');
        div.className = 'plot';
        div.id = `plot-${idx}`;
        const isTree = plot.type !== -1 ? baseVeggies[plot.type].isTree : false;

        if (plot.type === -1) {
            div.innerHTML = `
                <span class="plot-emoji">🟫</span>
                <span class="plot-status">${idx >= 40 ? 'หลุมปลูกไม้' : (idx >= 32 ? 'หลุมปลูกผลไม้' : 'ว่าง')}</span>
            `;
        } else {
            const v = getVeggie(plot.type);
            const b = baseVeggies[plot.type];
            const elapsed = Date.now() - plot.startTime;
            div.style.position = 'relative'; // ทำให้ปุ่มเกาะตำแหน่งในแปลง

            let actionHtml = '';
            let timeHtml = '';
            let emojiMargin = '0';

            if (b.isWoodTree) {
                const woodTime = b.woodTime || 10000;
                const actualWoodTime = woodTime / (growthMultiplier * (plot.speedMult || 1));
                const woodGained = Math.floor(elapsed / actualWoodTime) * (b.woodYield || 1);

                if (woodGained > 0) {
                    div.classList.add('ready');
                } else {
                    div.classList.add('growing');
                }
                timeHtml = `<div class="plot-time" style="position: absolute; top: 4px; right: 4px; font-size: 11px; font-weight: bold; background: rgba(255,255,255,0.95); padding: 2px 5px; border-radius: 4px; color: #8b4513; box-shadow: 0 1px 2px rgba(0,0,0,0.2); z-index: 10;">🪵 ${woodGained}</div>`;

                let harvestBtn = '';
                if (woodGained > 0) {
                    harvestBtn = `<button onclick="window.harvestWood(event, ${idx})" style="background: #4caf50; color: white; border: none; border-radius: 4px; width: 26px; height: 22px; font-size: 12px; cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" title="เก็บเกี่ยวไม้">🧺</button>`;
                }

                actionHtml = `
                    <div class="plot-actions" style="position: absolute; bottom: 4px; width: 100%; display: flex; justify-content: center; gap: 8px;">
                        <button onclick="waterPlot(event, ${idx})" style="background: ${plot.watered ? '#ccc' : '#4fc3f7'}; color: white; border: none; border-radius: 4px; width: 26px; height: 22px; font-size: 12px; cursor: ${plot.watered ? 'default' : 'pointer'}; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" title="${plot.watered ? 'รดน้ำแล้ว' : 'รดน้ำ ลดเวลา 15% (ฟรี)'}">💧</button>
                        <button onclick="fertilizePlot(event, ${idx})" style="background: ${plot.fertilized ? '#ccc' : '#8d6e63'}; color: white; border: none; border-radius: 4px; width: 26px; height: 22px; font-size: 12px; cursor: ${plot.fertilized ? 'default' : 'pointer'}; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" title="${plot.fertilized ? 'ใส่ปุ๋ยแล้ว' : 'ใส่ปุ๋ย ลดเวลา 30% (ใช้ 1 ถุง)'}">💩</button>
                        ${harvestBtn}
                    </div>
                `;
                emojiMargin = '18px';
            } else {
                const req = getPlotGrowTime(plot) / (growthMultiplier * (plot.speedMult || 1));
                const prog = Math.min(elapsed / req, 1);
                div.classList.add(prog >= 1 ? 'ready' : 'growing');

                if (prog < 1) {
                    const remainingSecs = Math.ceil((req - elapsed) / 1000);
                    timeHtml = `<div class="plot-time" style="position: absolute; top: 4px; right: 4px; font-size: 11px; font-weight: bold; background: rgba(255,255,255,0.95); padding: 2px 5px; border-radius: 4px; color: #333; box-shadow: 0 1px 2px rgba(0,0,0,0.2); z-index: 10;">⏳ ${remainingSecs}s</div>`;
                    actionHtml = `
                        <div class="plot-actions" style="position: absolute; bottom: 4px; width: 100%; display: flex; justify-content: center; gap: 8px;">
                            <button onclick="waterPlot(event, ${idx})" style="background: ${plot.watered ? '#ccc' : '#4fc3f7'}; color: white; border: none; border-radius: 4px; width: 26px; height: 22px; font-size: 12px; cursor: ${plot.watered ? 'default' : 'pointer'}; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" title="${plot.watered ? 'รดน้ำแล้ว' : 'รดน้ำ ลดเวลา 15% (ฟรี)'}">💧</button>
                            <button onclick="fertilizePlot(event, ${idx})" style="background: ${plot.fertilized ? '#ccc' : '#8d6e63'}; color: white; border: none; border-radius: 4px; width: 26px; height: 22px; font-size: 12px; cursor: ${plot.fertilized ? 'default' : 'pointer'}; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" title="${plot.fertilized ? 'ใส่ปุ๋ยแล้ว' : 'ใส่ปุ๋ย ลดเวลา 30% (ใช้ 1 ถุง)'}">💩</button>
                        </div>
                    `;
                    emojiMargin = '18px';
                }
            }

            const emojiSize = isTree ? '42px' : '30px';
            const starHtml = v.bonus && !isTree ? '<span class="plot-star">⭐</span>' : '';

            let cutHtml = '';
            if (isTree) {
                cutHtml = `<button onclick="cutTree(event, ${idx})" style="position: absolute; top: 4px; left: 4px; background: #e53e3e; color: white; border: none; border-radius: 4px; width: 24px; height: 24px; font-size: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2); z-index: 10;" title="ตัดต้นไม้ทิ้งเพื่อเคลียร์แปลง">🪓</button>`;
            }

            div.innerHTML = `
                ${cutHtml}
                ${timeHtml}
                <span class="plot-emoji" style="margin-bottom: ${emojiMargin}; font-size: ${emojiSize}; line-height: 1;">${v.name}${starHtml}</span>
                ${actionHtml}
            `;
        }
        div.onclick = () => interact(idx);
        farmEl.appendChild(div);
    });
}

// ฟังก์ชัน: อัปเดตเฉพาะตัวเลขเวลานับถอยหลังของผักและหลอดเวลา โดยไม่วาดแปลงใหม่ทั้งหมด (ลดอาการหน้าจอกระตุก)
function updateFarmTimers() {
    farm.forEach((plot, idx) => {
        if (plot.type !== -1) {
            const plotEl = document.getElementById(`plot-${idx}`);
            if (!plotEl) return;

            const elapsed = Date.now() - plot.startTime;
            const b = baseVeggies[plot.type];

            const timeEl = plotEl.querySelector('.plot-time');

            if (b.isWoodTree) {
                const woodTime = b.woodTime || 10000;
                const actualWoodTime = woodTime / (growthMultiplier * (plot.speedMult || 1));
                const woodGained = Math.floor(elapsed / actualWoodTime) * (b.woodYield || 1);
                if (timeEl) timeEl.innerHTML = `🪵 ${woodGained}`;

                if (woodGained > 0) {
                    if (!plotEl.classList.contains('ready')) {
                        plotEl.classList.add('ready');
                        plotEl.classList.remove('growing');
                        const actions = plotEl.querySelector('.plot-actions');
                        if (actions && !actions.querySelector('button[title="เก็บเกี่ยวไม้"]')) {
                            actions.insertAdjacentHTML('beforeend', `<button onclick="window.harvestWood(event, ${idx})" style="background: #4caf50; color: white; border: none; border-radius: 4px; width: 26px; height: 22px; font-size: 12px; cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" title="เก็บเกี่ยวไม้">🧺</button>`);
                        }
                    }
                } else {
                    if (plotEl.classList.contains('ready')) {
                        plotEl.classList.remove('ready');
                        plotEl.classList.add('growing');
                        const actions = plotEl.querySelector('.plot-actions');
                        if (actions) {
                            const btn = actions.querySelector('button[title="เก็บเกี่ยวไม้"]');
                            if (btn) btn.remove();
                        }
                    }
                }
            } else {
                const req = getPlotGrowTime(plot) / (growthMultiplier * (plot.speedMult || 1));
                const prog = Math.min(elapsed / req, 1);

                if (prog < 1) {
                    if (timeEl) {
                        timeEl.textContent = `⏳ ${Math.ceil((req - elapsed) / 1000)}s`;
                        timeEl.style.display = 'block';
                    }
                } else {
                    if (timeEl) timeEl.style.display = 'none';

                    if (!plotEl.classList.contains('ready')) {
                        plotEl.classList.add('ready');
                        plotEl.classList.remove('growing');
                        const actions = plotEl.querySelector('.plot-actions');
                        if (actions) actions.style.display = 'none';
                        const emoji = plotEl.querySelector('.plot-emoji');
                        if (emoji) emoji.style.marginBottom = '0';
                    }
                }
            }
        }
    });
}


// ฟังก์ชัน: วาดหน้าร้านขายสัตว์เลี้ยง รวมถึงส่วนของการซื้อ/อัปเกรดคอก และซื้ออุปกรณ์ช่วยเหลือต่างๆ
function renderAnimalShop() {
    const shop = document.getElementById('animalShop');
    shop.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <button onclick="switchAnimalShopTab('pens')" style="flex: 1; padding: 12px; font-size: 15px; font-weight: bold; cursor: pointer; border: none; border-radius: 8px; background: ${currentAnimalShopTab === 'pens' ? '#ff9800' : '#e0e0e0'}; color: ${currentAnimalShopTab === 'pens' ? '#fff' : '#333'}; box-shadow: ${currentAnimalShopTab === 'pens' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'}; transition: 0.2s;">🛖 สัตว์เลี้ยง</button>
            <button onclick="switchAnimalShopTab('equip')" style="flex: 1; padding: 12px; font-size: 15px; font-weight: bold; cursor: pointer; border: none; border-radius: 8px; background: ${currentAnimalShopTab === 'equip' ? '#2196f3' : '#e0e0e0'}; color: ${currentAnimalShopTab === 'equip' ? '#fff' : '#333'}; box-shadow: ${currentAnimalShopTab === 'equip' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'}; transition: 0.2s;">🛠️ อุปกรณ์</button>
            <button onclick="switchAnimalShopTab('buildings')" style="flex: 1; padding: 12px; font-size: 15px; font-weight: bold; cursor: pointer; border: none; border-radius: 8px; background: ${currentAnimalShopTab === 'buildings' ? '#e53e3e' : '#e0e0e0'}; color: ${currentAnimalShopTab === 'buildings' ? '#fff' : '#333'}; box-shadow: ${currentAnimalShopTab === 'buildings' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'}; transition: 0.2s;">🏭 สร้างสิ่งปลูกสร้าง</button>
        </div>
        <div id="animalShopContent"></div>
    `;

    const content = document.getElementById('animalShopContent');

    // ชุดสไตล์ (CSS) สำหรับใช้งานในแท็บ
    const equipCardStyle = 'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; text-align: center; box-shadow: 0 6px 12px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 12px; transition: transform 0.2s;';
    const btnActiveStyle = 'background: #48bb78; color: white; padding: 10px; border-radius: 8px; width: 100%; border: none; font-size: 0.95em; font-weight: bold; cursor: not-allowed; opacity: 0.8;';
    const btnBuyStyle = 'background: #3182ce; color: white; padding: 10px; border-radius: 8px; width: 100%; border: none; font-size: 0.95em; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(49, 130, 206, 0.2);';
    const btnCancelStyle = 'background: #e53e3e; color: white; padding: 10px; border-radius: 8px; width: 100%; border: none; font-size: 0.95em; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(229, 62, 62, 0.2);';
    const btnActionStyle = 'background: #ed8936; color: white; padding: 10px; border-radius: 8px; width: 100%; border: none; font-size: 0.95em; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(237, 137, 54, 0.2);';
    const titleStyle = 'font-size: 1.15em; color: #2d3748; margin-bottom: 6px; display: block;';
    const descStyle = 'font-size: 0.9em; color: #718096; line-height: 1.5; display: block;';

    if (currentAnimalShopTab === 'equip') {
        // ==================== ร้านขายอุปกรณ์ ====================
        const equipGrid = document.createElement('div');
        equipGrid.style.display = 'grid';
        equipGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        equipGrid.style.gap = '15px';
        content.appendChild(equipGrid);

        const autoFeederCard = document.createElement('div');
        autoFeederCard.style.cssText = equipCardStyle;
        if (autoFeederPurchased) {
            autoFeederCard.innerHTML = `
                <div>
                    <strong style="${titleStyle}">🤖 เครื่องให้อาหารออโต้</strong>
                    <small style="${descStyle}">ทำงานแล้ว! ป้อนอาหารอัตโนมัติเมื่ออาหาร < 50 โดยใช้ 8 Feed/ตัว</small>
                </div>
                <button style="${btnActiveStyle}" disabled>✅ ซื้อแล้ว</button>
            `;
        } else {
            autoFeederCard.innerHTML = `
                <div>
                    <strong style="${titleStyle}">🤖 เครื่องให้อาหารออโต้</strong>
                    <small style="${descStyle}">ป้อนอาหารอัตโนมัติเมื่ออาหาร < 50 (ใช้ 8 Feed/ตัว)</small>
                </div>
                <button style="${btnBuyStyle}" onclick="buyAutoFeeder()">🛒 ซื้อ (5,000 บ.)</button>
            `;
        }
        equipGrid.appendChild(autoFeederCard);

        const vaccineCard = document.createElement('div');
        vaccineCard.style.cssText = equipCardStyle;
        if (vaccinePurchased) {
            vaccineCard.innerHTML = `
                <div>
                    <strong style="${titleStyle}">💉 วัคซีนป้องกันโรค</strong>
                    <small style="${descStyle}">ฉีดแล้ว! สัตว์เลี้ยงจะไม่มีวันป่วยอีกต่อไป</small>
                </div>
                <button style="${btnActiveStyle}" disabled>✅ ซื้อแล้ว</button>
            `;
        } else {
            vaccineCard.innerHTML = `
                <div>
                    <strong style="${titleStyle}">💉 วัคซีนป้องกันโรค</strong>
                    <small style="${descStyle}">ภูมิคุ้มกันหมู่ สัตว์เลี้ยงในฟาร์มจะไม่มีวันป่วยอีกต่อไป</small>
                </div>
                <button style="${btnBuyStyle}" onclick="buyVaccine()">🛒 ซื้อ (10,000 บ.)</button>
            `;
        }
        equipGrid.appendChild(vaccineCard);

        const autoHarvestCard = document.createElement('div');
        autoHarvestCard.style.cssText = equipCardStyle;
        if (autoHarvestEnabled) {
            autoHarvestCard.innerHTML = `
                <div>
                    <strong style="${titleStyle}">🚜 เก็บเกี่ยวอัตโนมัติ</strong>
                    <small style="${descStyle}">ทำงานอยู่ (หักค่าบริการ ${AUTO_HARVEST_FEE_PERCENT * 100}% จากยอดขาย)</small>
                </div>
                <button style="${btnCancelStyle}" onclick="toggleAutoHarvest()">❌ ปิดใช้งาน</button>
            `;
        } else {
            autoHarvestCard.innerHTML = `
                <div>
                    <strong style="${titleStyle}">🚜 เก็บเกี่ยวอัตโนมัติ</strong>
                    <small style="${descStyle}">เก็บเกี่ยวทันทีที่สุก (หักค่าบริการ ${AUTO_HARVEST_FEE_PERCENT * 100}% จากยอดขาย)</small>
                </div>
                <button style="${btnBuyStyle}" onclick="toggleAutoHarvest()">✅ เปิดใช้งาน (ฟรี)</button>
            `;
        }
        equipGrid.appendChild(autoHarvestCard);

        const autoPlantCard = document.createElement('div');
        autoPlantCard.style.cssText = equipCardStyle;
        const upgradeCostPlant = autoPlantEnergyLevel * 15000;
        const upgradeBtnPlant = `<button style="background: linear-gradient(180deg, #8b5cf6, #6d28d9); color: white; width: 100%; padding: 8px; margin-top: 8px;" onclick="upgradeWorker('plant')">🔼 อัพเกรด (Lv.${autoPlantEnergyLevel}) - ${upgradeCostPlant.toLocaleString()} บ.</button>`;

        if (autoPlantEnabled) {
            const plantMax = 100 + (autoPlantEnergyLevel - 1) * 50;
            let statusText = autoPlantResting ? `<span style="color:#e53e3e;">💤 กำลังพักฟื้น (${Math.floor(autoPlantEnergy)}/${plantMax})</span>` : `<span style="color:#48bb78;">⚡ พลังงาน: ${Math.floor(autoPlantEnergy)}/${plantMax}</span>`;
            autoPlantCard.innerHTML = `
                <div style="width: 100%; text-align: center;">
                    <strong style="${titleStyle}">🧑‍🌾 จ้างคนปลูกผัก</strong>
                    <small style="${descStyle}">กำลังปลูก: ${baseVeggies[autoPlantType].name} (ค่าจ้าง 15%)</small>
                    <div id="autoPlantStatus" style="font-size: 13px; font-weight: bold; background: rgba(0,0,0,0.05); padding: 6px; border-radius: 6px; margin-top: 8px;">${statusText}</div>
                </div>
                <button style="${btnCancelStyle}" onclick="toggleAutoPlant()">❌ เลิกจ้าง</button>
                ${upgradeBtnPlant}
            `;
        } else {
            let optionsHtml = '';
            baseVeggies.forEach((v, i) => {
                const isSeasonal = seasonalBonus[currentSeason].includes(i);
                const isTree = v.isTree;
                if (isTree) return; // คนงานไม่ปลูกต้นไม้
                const fee = Math.ceil(v.baseCost * 0.15);
                optionsHtml += `<option value="${i}" ${autoPlantType === i ? 'selected' : ''} ${!isSeasonal ? 'disabled' : ''}>${v.name} (ทุน ${v.baseCost}+จ้าง ${fee}) ${isSeasonal && !isTree ? '🌟' : (isTree ? '🌲' : '❌')}</option>`;
            });
            autoPlantCard.innerHTML = `
                <div style="width: 100%;">
                    <strong style="${titleStyle}">🧑‍🌾 จ้างคนปลูกผัก</strong>
                    <select id="autoPlantSelect" style="margin: 8px 0; padding: 6px; border-radius: 6px; width: 100%; font-size: 0.9em; border: 1px solid #cbd5e0; outline: none;" onchange="updateAutoPlantType(this.value)">
                        ${optionsHtml}
                    </select>
                </div>
                <button style="${btnActionStyle}" onclick="toggleAutoPlant()">✅ จ้างปลูก</button>
                ${upgradeBtnPlant}
            `;
        }
        equipGrid.appendChild(autoPlantCard);

        const autoPetCard = document.createElement('div');
        autoPetCard.style.cssText = equipCardStyle;
        const upgradeCostPet = autoPetEnergyLevel * 15000;
        const upgradeBtnPet = `<button style="background: linear-gradient(180deg, #8b5cf6, #6d28d9); color: white; width: 100%; padding: 8px; margin-top: 8px;" onclick="upgradeWorker('pet')">🔼 อัพเกรด (Lv.${autoPetEnergyLevel}) - ${upgradeCostPet.toLocaleString()} บ.</button>`;

        if (autoPetEnabled) {
            const petMax = 100 + (autoPetEnergyLevel - 1) * 50;
            let statusText = autoPetResting ? `<span style="color:#e53e3e;">💤 กำลังพักฟื้น (${Math.floor(autoPetEnergy)}/${petMax})</span>` : `<span style="color:#48bb78;">⚡ พลังงาน: ${Math.floor(autoPetEnergy)}/${petMax}</span>`;
            autoPetCard.innerHTML = `
                <div style="width: 100%; text-align: center;">
                    <strong style="${titleStyle}">💆 จ้างคนดูแลสัตว์</strong>
                    <small style="${descStyle}">ทำงานอยู่ (หัก 15% จากรายได้สัตว์)</small>
                    <div id="autoPetStatus" style="font-size: 13px; font-weight: bold; background: rgba(0,0,0,0.05); padding: 6px; border-radius: 6px; margin-top: 8px;">${statusText}</div>
                </div>
                <button style="${btnCancelStyle}" onclick="toggleAutoPet()">❌ เลิกจ้าง</button>
                ${upgradeBtnPet}
            `;
        } else {
            autoPetCard.innerHTML = `
                <div>
                    <strong style="${titleStyle}">💆 จ้างคนดูแลสัตว์</strong>
                    <small style="${descStyle}">ลูบหัวอัตโนมัติ (หัก 15% จากรายได้สัตว์)</small>
                </div>
                <button style="${btnActionStyle}" onclick="toggleAutoPet()">✅ จ้าง (ฟรี)</button>
                ${upgradeBtnPet}
            `;
        }
        equipGrid.appendChild(autoPetCard);

        const toolsCard = document.createElement('div');
        toolsCard.style.cssText = equipCardStyle;
        let toolsHtml = `<div style="width: 100%;"><strong style="${titleStyle}">🛠️ อุปกรณ์เก็บผลผลิต</strong><small style="${descStyle}">ต้องมีอุปกรณ์เฉพาะชนิดถึงจะเก็บได้</small><hr style="border: 0; border-top: 1px dashed #e2e8f0; margin: 10px 0;">`;
        animalData.forEach((a, i) => {
            if (animalTools[i]) {
                toolsHtml += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #4a5568; font-size: 0.9em;">${a.toolName}</span>
                    <span style="color: #48bb78; font-weight: bold; font-size: 0.85em;">✅ มีแล้ว</span>
                </div>`;
            } else {
                toolsHtml += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #4a5568; font-size: 0.9em;">${a.toolName}</span>
                    <button onclick="buyAnimalTool(${i})" style="background: #3182ce; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 0.85em; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(49, 130, 206, 0.2);">ซื้อ (${a.toolCost} บ.)</button>
                </div>`;
            }
        });
        toolsHtml += `</div>`;
        toolsCard.innerHTML = toolsHtml;
        equipGrid.appendChild(toolsCard);
    } else if (currentAnimalShopTab === 'buildings') {
        // ==================== ร้านสิ่งปลูกสร้าง ====================
        const buildGrid = document.createElement('div');
        buildGrid.style.display = 'grid';
        buildGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        buildGrid.style.gap = '15px';
        content.appendChild(buildGrid);

        Object.keys(buildings).forEach(key => {
            const b = buildings[key];
            const isMax = b.level >= b.max;
            const cost = Math.floor(b.costBase * (1 + b.level * 0.5));
            const woodCost = Math.floor((b.woodCostBase || 0) * (1 + b.level * 0.5));
            let costText = `${cost.toLocaleString()} บ.`;
            if (woodCost > 0) {
                costText += ` + ${woodCost} ไม้`;
            }
            const card = document.createElement('div');
            card.style.cssText = equipCardStyle;
            card.innerHTML = `
                <div><strong style="${titleStyle}">${b.name} (Lv.${b.level}/${b.max})</strong><small style="${descStyle}">${b.desc}</small></div>
                ${isMax ? `<button style="${btnActiveStyle}" disabled>✅ ระดับสูงสุดแล้ว</button>` : `<button style="${btnBuyStyle}" onclick="buyBuilding('${key}')">🔨 สร้าง / อัพเกรด (${costText})</button>`}
            `;
            buildGrid.appendChild(card);
        });
    } else {
        // ==================== ร้านคอกและสัตว์เลี้ยง ====================
        const penGrid = document.createElement('div');
        penGrid.style.display = 'grid';
        penGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
        penGrid.style.gap = '20px';
        content.appendChild(penGrid);

        penData.forEach((p, i) => {
            const hasPen = pens[i].purchased;
            const a = animalData[i];
            const cleanAnimalName = a.name.replace(/[^ก-๙a-zA-Z]/g, '').trim();

            const groupCard = document.createElement('div');
            groupCard.style.cssText = 'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; box-shadow: 0 6px 12px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 15px;';

            let penHtml = '';
            if (!hasPen) {
                penHtml = `
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 1px dashed #cbd5e0; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <strong style="color: #4a5568; font-size: 1.1em; display: block; margin-bottom: 5px;">${p.name}</strong>
                            <small style="color: #a0aec0;">ความจุเริ่มต้น: ${p.capacityBase} ตัว</small>
                        </div>
                        <button onclick="buyPen(${i})" style="margin-top: 12px; background: #ed8936; color: white; border: none; padding: 10px; width: 100%; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(237,137,54,0.2); transition: 0.2s;">🛖 สร้างคอก (${p.cost} บ.)</button>
                    </div>
                `;
            } else {
                const nextLvl = pens[i].level + 1;
                const upgradeCost = Math.floor(p.upgradeCostBase * (1 + (pens[i].level - 1) * 0.5));
                const cap = Math.min(6, pens[i].level * p.capacityBase);
                const nextCap = Math.min(6, nextLvl * p.capacityBase);

                const currentCount = animals[i].length;
                const isFull = currentCount >= cap;
                const allLeveledUp = currentCount > 0 && animals[i].every(a => a.level >= pens[i].level);
                const canUpgrade = isFull && allLeveledUp;
                const plankCost = pens[i].level * 2;
                const blockCost = pens[i].level * 1;

                penHtml = `
                    <div style="background: #ebf8ff; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 1px solid #90cdf4; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <strong style="color: #2b6cb0; font-size: 1.1em; display: block; margin-bottom: 5px;">${p.name} (Lv.${pens[i].level})</strong>
                            <small style="color: #4a5568; line-height: 1.5; display: block;">จุ: ${cap} ➔ ${nextCap} ตัว<br>โบนัส: +${(pens[i].level - 1) * 10}%</small>
                            <div style="margin-top: 8px; font-size: 0.85em; background: rgba(255,255,255,0.7); padding: 6px; border-radius: 6px; text-align: left;">
                                <div style="color: ${isFull ? '#48bb78' : '#e53e3e'}; margin-bottom: 3px;">• สัตว์เต็มคอก: ${isFull ? '✅' : '❌'}</div>
                                <div style="color: ${allLeveledUp ? '#48bb78' : '#e53e3e'};">• สัตว์ทุกตัว Lv.${pens[i].level} ขึ้นไป: ${allLeveledUp ? '✅' : '❌'}</div>
                            </div>
                        </div>
                        <button onclick="upgradePen(${i})" style="margin-top: 12px; background: ${canUpgrade ? '#3182ce' : '#a0aec0'}; color: white; border: none; padding: 10px; width: 100%; border-radius: 8px; font-weight: bold; cursor: ${canUpgrade ? 'pointer' : 'not-allowed'}; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: 0.2s;">🔼 อัพเกรด (${upgradeCost} บ. | 🪵${plankCost} | 🧱${blockCost})</button>
                    </div>
                `;
            }

            let animalHtml = '';
            if (!hasPen) {
                animalHtml = `
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 1px dashed #cbd5e0; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <strong style="color: #4a5568; font-size: 1.1em; display: block; margin-bottom: 5px;">${a.name}</strong>
                            <small style="color: #a0aec0;">ผลผลิต: +${a.produce}/วิ</small>
                        </div>
                        <button disabled style="margin-top: 12px; background: #cbd5e0; color: white; border: none; padding: 10px; width: 100%; border-radius: 8px; font-weight: bold; cursor: not-allowed;">🔒 รอสร้างคอก</button>
                    </div>
                `;
            } else {
                const cap = Math.min(6, pens[i].level * p.capacityBase);
                const currentCount = animals[i].length;
                const isFull = currentCount >= cap;
                animalHtml = `
                    <div style="background: #f0fff4; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 1px solid #9ae6b4; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <strong style="color: #2f855a; font-size: 1.1em; display: block; margin-bottom: 5px;">${a.name} <span style="font-size: 0.9em; color: #48bb78;">(${currentCount}/${cap})</span></strong>
                            <small style="color: #4a5568; line-height: 1.5; display: block;">ผลผลิต: +${a.produce}/วิ<br>ราคา: ${a.cost} บ.</small>
                        </div>
                        ${isFull
                        ? `<button disabled style="margin-top: 12px; background: #cbd5e0; color: white; border: none; padding: 10px; width: 100%; border-radius: 8px; font-weight: bold; cursor: not-allowed;">🔒 คอกเต็มแล้ว</button>`
                        : `<button onclick="buyAnimal(${i})" style="margin-top: 12px; background: #48bb78; color: white; border: none; padding: 10px; width: 100%; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(72,187,120,0.2); transition: 0.2s;">🐔 ซื้อสัตว์ (${a.cost} บ.)</button>`
                    }
                    </div>
                `;
            }

            groupCard.innerHTML = `
                <h3 style="margin: 0; color: #2d3748; border-bottom: 2px dashed #e2e8f0; padding-bottom: 12px; text-align: center; font-size: 1.25em;">
                    ${p.emoji} ฟาร์ม${cleanAnimalName}
                </h3>
                <div style="display: flex; gap: 15px; margin-top: 5px;">
                    ${penHtml}
                    ${animalHtml}
                </div>
            `;
            penGrid.appendChild(groupCard);
        });
    }
}

// ฟังก์ชันสลับแท็บย่อยในร้านขายสัตว์
window.switchAnimalShopTab = function (tab) {
    currentAnimalShopTab = tab;
    playSound('click');
    renderAnimalShop();
};

// ฟังก์ชัน: ซื้อ/อัปเกรดสิ่งปลูกสร้าง
window.buyBuilding = function (key) {
    const b = buildings[key];
    if (!b || b.level >= b.max) return;

    const cost = Math.floor(b.costBase * (1 + b.level * 0.5));
    const woodCost = Math.floor((b.woodCostBase || 0) * (1 + b.level * 0.5));

    if (money < cost) return showMessage(`💸 เงินไม่พอสร้าง/อัพเกรด (ต้องการ ${cost.toLocaleString()} บาท)`);
    if (woodStock < woodCost) return showMessage(`🌲 ไม้ไม่พอสร้าง/อัพเกรด (ต้องการ ${woodCost} ไม้)`);

    money -= cost;
    woodStock -= woodCost;
    currentSeasonExpense += cost;
    seasonDetails.exUpgrades += cost;
    b.level++;

    playSound('click');
    showMessage(`🏭 สร้าง/อัพเกรด ${b.name} เป็น Lv.${b.level} สำเร็จ!`);
    renderAnimalShop();
    updateFarmOverview();
    saveGame();
}

// ==================== ระบบฤดูกาล (Season System) ====================

// ==================== การกระทำของผู้เล่น (Player Actions) ====================

// ฟังก์ชัน: เมื่อผู้เล่นกดคลิกที่แปลงปลูกผัก (ใช้สำหรับเก็บเกี่ยว)
function interact(i) {
    const p = farm[i];
    if (p.type === -1) return;

    const v = getVeggie(p.type);
    const b = baseVeggies[p.type];
    const elapsed = Date.now() - p.startTime;

    if (b.isWoodTree) {
        window.harvestWood({ stopPropagation: () => { } }, i);
        return;
    }

    const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));

    if (elapsed >= req) {
        money += v.value;
        currentSeasonIncome += v.value;
        totalLifetimeIncome += v.value;
        seasonDetails.inCrops += v.value;

        const feedValues = { 0: 3, 1: 1, 2: 4, 3: 2, 4: 2, 5: 1, 6: 5, 7: 2, 8: 3, 9: 4, 10: 3, 11: 4, 12: 10, 13: 12, 14: 15, 15: 20 };
        const feedGained = (feedValues[p.type] || 1) + Math.floor(veggieLevels[p.type] / 10);
        feedStock = Math.min(window.getMaxFeed(), feedStock + feedGained);
        showMessage(`🎉 เก็บ ${v.name} +${v.value} (+${feedGained} Feed)`);

        recordCropSale(p.type);
        playSound('harvest');

        if (b.isTree) {
            p.startTime = Date.now();
            p.watered = false;
            p.fertilized = 0;
            if (!p.isMature) {
                p.isMature = true;
            }
        } else {
            farm[i] = { type: -1, startTime: 0 };
        }
    } else {
        showMessage("🌱 ยังไม่สุก");
    }
    renderFarm();
    if (typeof renderShop === 'function') renderShop();
    saveGame();
}

// ฟังก์ชัน: เก็บไม้โดยตรงจากปุ่มบนแปลง
window.harvestWood = function (e, i) {
    e.stopPropagation(); // ไม่ให้ทริกเกอร์คลิกที่แปลง
    const p = farm[i];
    if (p.type === -1) return;

    const b = baseVeggies[p.type];
    const elapsed = Date.now() - p.startTime;

    if (b.isWoodTree) {
        const woodTime = b.woodTime || 10000;
        const actualWoodTime = woodTime / (growthMultiplier * (p.speedMult || 1));
        const woodGained = Math.floor(elapsed / actualWoodTime) * (b.woodYield || 1);

        if (woodGained > 0) {
            const maxMat = window.getMaxMaterials();
            if (woodStock >= maxMat) {
                return showMessage("❌ คลังเก็บวัสดุเต็มแล้ว! สร้างหรืออัปเกรดโรงเก็บของเพื่อขยายความจุ");
            }
            const actualGain = Math.min(maxMat - woodStock, woodGained);
            woodStock += actualGain;
            const remainder = elapsed % actualWoodTime;
            p.startTime = Date.now() - remainder;

            playSound('harvest');
            if (actualGain < woodGained) {
                showMessage(`🪓 เก็บเกี่ยว ได้ไม้ +${actualGain} ท่อน (คลังเต็มแล้ว!)`);
            } else {
                showMessage(`🪓 เก็บเกี่ยว ได้ไม้ +${woodGained} ท่อน`);
            }
            renderFarm();
            if (typeof renderMining === 'function') renderMining();
            saveGame();
        } else {
            showMessage("🌱 ต้นไม้ยังผลิตไม้ไม่พอให้เก็บ");
        }
    }
};

// ฟังก์ชัน: ตัดต้นไม้ทิ้งเพื่อเคลียร์แปลง
window.cutTree = function (e, idx) {
    e.stopPropagation();
    const p = farm[idx];
    if (p.type === -1) return;
    const v = getVeggie(p.type);
    const b = baseVeggies[p.type];

    let extraMsg = "(จะไม่ได้รับเงินหรือผลผลิตคืน)";
    let woodGained = 0;

    if (b.isWoodTree) {
        const elapsed = Date.now() - p.startTime;
        const woodTime = b.woodTime || 10000;
        const actualWoodTime = woodTime / (growthMultiplier * (p.speedMult || 1));
        woodGained = Math.floor(elapsed / actualWoodTime) * (b.woodYield || 1);
        extraMsg = woodGained > 0 ? `(จะได้รับไม้ที่สะสมไว้ ${woodGained} ท่อนและโละต้นทิ้ง)` : `(ต้นไม้ยังไม่มีไม้ให้เก็บและโละต้นทิ้ง)`;
    }

    if (confirm(`🪓 คุณแน่ใจหรือไม่ว่าต้องการตัด ${v.name} ทิ้งเพื่อเคลียร์แปลง? ${extraMsg}`)) {
        let msg = `🪓 ตัด ${v.name} ทิ้งเรียบร้อยแล้ว`;
        if (woodGained > 0) {
            const maxMat = window.getMaxMaterials();
            const actualGain = Math.min(maxMat - woodStock, woodGained);
            woodStock += actualGain;
            if (actualGain < woodGained) {
                msg += ` ได้ไม้มา +${actualGain} ท่อน (คลังเต็ม!)`;
            } else {
                msg += ` ได้ไม้มา +${woodGained} ท่อน`;
            }
        }
        farm[idx] = { type: -1, startTime: 0 };
        playSound('click');
        showMessage(msg);
        renderFarm();
        if (typeof renderMining === 'function') renderMining();
        saveGame();
    }
};

// ฟังก์ชัน: รดน้ำแปลงผัก ลดเวลาเติบโตลง 15% (ฟรี)
window.waterPlot = function (e, i) {
    e.stopPropagation(); // ไม่ให้คลิกทะลุไปเก็บเกี่ยว
    const p = farm[i];
    if (p.type === -1 || p.watered) return;

    const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));
    const reduction = req * 0.15; // ลดเวลา 15%
    p.startTime -= reduction;
    p.watered = true;

    playSound('click');
    renderFarm();
    saveGame();
};

// ฟังก์ชัน: ใส่ปุ๋ยแปลงผัก ลดเวลาเติบโตลง 30% (ต้องใช้ไอเทม)
window.fertilizePlot = function (e, i) {
    e.stopPropagation();
    const p = farm[i];
    if (p.type === -1 || p.fertilized >= 1) return;
    if (fertilizerStock <= 0) return showMessage("❌ ไม่มีปุ๋ย! กรุณาซื้อปุ๋ยที่ร้านค้าด้านบน");

    const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));
    const reduction = req * 0.30; // ลดเวลา 30%
    p.startTime -= reduction;
    p.fertilized = 1;
    fertilizerStock--;

    playSound('click');
    renderFarm();
    if (typeof renderShop === 'function') renderShop();
    saveGame();
};

// ฟังก์ชัน: รดน้ำเหมาแปลงทั้งหมด (ต้องมีสัญญาเช่า)
window.waterAllPlots = function () {
    let count = 0;
    farm.forEach((p, i) => {
        if (p.type !== -1 && !p.watered) {
            const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));
            const reduction = req * 0.15;
            p.startTime -= reduction;
            p.watered = true;
            count++;
        }
    });
    if (count > 0) {
        playSound('click');
        showMessage(`💦 รดน้ำต้นไม้พร้อมกัน ${count} แปลง!`);
        renderFarm();
        saveGame();
    } else {
        showMessage(`ℹ️ ไม่มีแปลงที่ต้องการรดน้ำ`);
    }
};

// ฟังก์ชัน: ใส่ปุ๋ยเหมาแปลงทั้งหมด (ต้องมีสัญญาเช่า ไม่หักสต็อกปุ๋ย)
window.fertilizeAllPlots = function () {
    let count = 0;
    farm.forEach((p, i) => {
        if (p.type !== -1 && p.fertilized < 1) {
            const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));
            const reduction = req * 0.30;
            p.startTime -= reduction;
            p.fertilized = 1;
            count++;
        }
    });
    if (count > 0) {
        playSound('click');
        showMessage(`💩 ใส่ปุ๋ยต้นไม้พร้อมกัน ${count} แปลง!`);
        renderFarm();
        saveGame();
    } else {
        showMessage(`ℹ️ ไม่มีแปลงที่ต้องการใส่ปุ๋ย`);
    }
};

// ฟังก์ชัน: รดน้ำต้นไม้ทั้งหมด (ฟาร์มผลไม้ แปลง 32-39)
window.waterAllTrees = function () {
    let count = 0;
    for (let i = 32; i < Math.min(40, farm.length); i++) {
        const p = farm[i];
        if (p.type !== -1 && !p.watered) {
            const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));
            const reduction = req * 0.15;
            p.startTime -= reduction;
            p.watered = true;
            count++;
        }
    }
    if (count > 0) {
        playSound('click');
        showMessage(`💦 รดน้ำต้นไม้พร้อมกัน ${count} ต้น!`);
        renderFarm();
        saveGame();
    } else {
        showMessage(`ℹ️ ไม่มีต้นไม้ที่ต้องการรดน้ำ`);
    }
};

// ฟังก์ชัน: ใส่ปุ๋ยต้นไม้ทั้งหมด (ฟาร์มผลไม้ แปลง 32-39)
window.fertilizeAllTrees = function () {
    let count = 0;
    for (let i = 32; i < Math.min(40, farm.length); i++) {
        const p = farm[i];
        if (p.type !== -1 && p.fertilized < 1) {
            if (fertilizerStock <= 0) {
                showMessage("❌ ไม่มีปุ๋ย! กรุณาซื้อปุ๋ยที่ร้านค้า");
                break; // Stop if out of fertilizer
            }
            const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));
            const reduction = req * 0.30;
            p.startTime -= reduction;
            p.fertilized = 1;
            fertilizerStock--;
            count++;
        }
    }
    if (count > 0) {
        playSound('click');
        showMessage(`💩 ใส่ปุ๋ยต้นไม้พร้อมกัน ${count} ต้น!`);
        renderFarm();
        if (typeof renderShop === 'function') renderShop(); // To update fertilizer stock
        saveGame();
    } else {
        showMessage(`ℹ️ ไม่มีต้นไม้ที่ต้องการใส่ปุ๋ย`);
    }
};

// ฟังก์ชัน: เก็บผลผลิตต้นไม้ทั้งหมด (ฟาร์มผลไม้ แปลง 32-39)
window.harvestAllTrees = function () {
    let totalValue = 0;
    let totalFeed = 0;
    let harvestedCount = 0;

    for (let i = 32; i < Math.min(40, farm.length); i++) {
        const p = farm[i];
        if (p.type !== -1) {
            const v = getVeggie(p.type);
            const b = baseVeggies[p.type];
            const elapsed = Date.now() - p.startTime;
            const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));

            if (elapsed >= req) {
                totalValue += v.value;
                const feedValues = { 0: 3, 1: 1, 2: 4, 3: 2, 4: 2, 5: 1, 6: 5, 7: 2, 8: 3, 9: 4, 10: 3, 11: 4, 12: 10, 13: 12, 14: 15, 15: 20 };
                const feedGained = (feedValues[p.type] || 1) + Math.floor(veggieLevels[p.type] / 10);
                totalFeed += feedGained;

                recordCropSale(p.type);

                p.startTime = Date.now();
                p.watered = false;
                p.fertilized = 0;
                if (!p.isMature) {
                    p.isMature = true;
                }
                harvestedCount++;
            }
        }
    }

    if (harvestedCount > 0) {
        money += totalValue;
        currentSeasonIncome += totalValue;
        totalLifetimeIncome += totalValue;
        seasonDetails.inCrops += totalValue;
        feedStock += totalFeed;

        playSound('harvest');
        showMessage(`🎉 เก็บผลผลิตต้นไม้ได้ทั้งหมด: +${totalValue} บาท (+${totalFeed} Feed)`);
        renderFarm();
        if (typeof renderShop === 'function') renderShop();
        saveGame();
    } else {
        showMessage("🌳 ไม่มีผลผลิตผลไม้ให้เก็บ");
    }
};

// ฟังก์ชัน: รดน้ำต้นไม้ตัดไม้ทั้งหมด (ฟาร์มตัดต้นไม้ แปลง 40-47)
window.waterAllTimbers = function () {
    let count = 0;
    for (let i = 40; i < Math.min(48, farm.length); i++) {
        const p = farm[i];
        if (p.type !== -1 && !p.watered) {
            const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));
            const reduction = req * 0.15;
            p.startTime -= reduction;
            p.watered = true;
            count++;
        }
    }
    if (count > 0) {
        playSound('click');
        showMessage(`💦 รดน้ำต้นไม้พร้อมกัน ${count} ต้น!`);
        renderFarm();
        saveGame();
    } else {
        showMessage(`ℹ️ ไม่มีต้นไม้ที่ต้องการรดน้ำ`);
    }
};

// ฟังก์ชัน: ใส่ปุ๋ยต้นไม้ตัดไม้ทั้งหมด (ฟาร์มตัดต้นไม้ แปลง 40-47)
window.fertilizeAllTimbers = function () {
    let count = 0;
    for (let i = 40; i < Math.min(48, farm.length); i++) {
        const p = farm[i];
        if (p.type !== -1 && p.fertilized < 1) {
            if (fertilizerStock <= 0) {
                showMessage("❌ ไม่มีปุ๋ย! กรุณาซื้อปุ๋ยที่ร้านค้า");
                break; // Stop if out of fertilizer
            }
            const req = getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1));
            const reduction = req * 0.30;
            p.startTime -= reduction;
            p.fertilized = 1;
            fertilizerStock--;
            count++;
        }
    }
    if (count > 0) {
        playSound('click');
        showMessage(`💩 ใส่ปุ๋ยต้นไม้พร้อมกัน ${count} ต้น!`);
        renderFarm();
        if (typeof renderShop === 'function') renderShop(); // To update fertilizer stock
        saveGame();
    } else {
        showMessage(`ℹ️ ไม่มีต้นไม้ที่ต้องการใส่ปุ๋ย`);
    }
};

// ฟังก์ชัน: เก็บไม้ทั้งหมดในฟาร์มตัดต้นไม้
window.harvestAllTimbers = function () {
    playSound('harvest');
    let totalWood = 0;
    let harvestedCount = 0;

    const maxMat = window.getMaxMaterials();
    if (woodStock >= maxMat) {
        return showMessage("❌ คลังเก็บวัสดุเต็มแล้ว! สร้างหรืออัปเกรดโรงเก็บของเพื่อขยายความจุ");
    }

    for (let i = 40; i < Math.min(48, farm.length); i++) {
        const p = farm[i];
        if (p.type !== -1) {
            const b = baseVeggies[p.type];
            if (b.isWoodTree) {
                const elapsed = Date.now() - p.startTime;
                const woodTime = b.woodTime || 10000;
                const actualWoodTime = woodTime / (growthMultiplier * (p.speedMult || 1));
                const woodGained = Math.floor(elapsed / actualWoodTime) * (b.woodYield || 1);

                if (woodGained > 0) {
                    totalWood += woodGained;
                    const remainder = elapsed % actualWoodTime;
                    p.startTime = Date.now() - remainder;
                    harvestedCount++;
                }
            }
        }
    }

    if (harvestedCount > 0) {
        if (totalWood > 0) {
            const actualGain = Math.min(maxMat - woodStock, totalWood);
            woodStock += actualGain;
            if (actualGain < totalWood) {
                showMessage(`🪓 เก็บเกี่ยวได้ไม้: +${actualGain} ท่อน (คลังเต็มแล้ว!)`);
            } else {
                showMessage(`🪓 เก็บเกี่ยวได้ไม้: +${totalWood} ท่อน`);
            }
        }
    } else {
        showMessage(`🌳 ไม่มีผลผลิตต้นไม้ให้เก็บ`);
    }
    renderFarm();
    if (typeof renderMining === 'function') renderMining();
    saveGame();
};

// ฟังก์ชัน: แสดงเงื่อนไขการขยายที่ดิน
window.showExpansionReqs = function () {
    const soldAll = veggieSalesCount.slice(0, 12).every(c => c >= 100);
    const playedSeason = totalSeasonsPassed >= 1;
    const fourAnimals = [0, 1, 2, 3].every(idx => animals[idx] && animals[idx].length >= 4);
    showMessage(`📌 เงื่อนไขขยายที่ดิน: ขุดผัก(12ชนิด) 100 ต้น (${soldAll ? '✅' : '❌'}) | ผ่าน 1 ฤดู (${playedSeason ? '✅' : '❌'}) | สัตว์ชนิดละ 4 ตัว (${fourAnimals ? '✅' : '❌'})`, 4500);
};

// ฟังก์ชัน: แสดงเงื่อนไขการขยายฟาร์ม 2
window.showFarm2ExpansionReqs = function () {
    const soldAll2 = veggieSalesCount.slice(0, 12).every(c => c >= 200);
    const playedSeason2 = totalSeasonsPassed >= 3;
    const fullAnimals = [0, 1, 2, 3].every(idx => animals[idx] && animals[idx].length >= 6);
    showMessage(`📌 เงื่อนไขขยายฟาร์ม 2: ขุดผัก(12ชนิด) 200 ต้น (${soldAll2 ? '✅' : '❌'}) | ผ่าน 3 ฤดู (${playedSeason2 ? '✅' : '❌'}) | สัตว์ชนิดละ 6 ตัว (${fullAnimals ? '✅' : '❌'})`, 5000);
};

window.showTreeFarmExpansionReqs = function () {
    const playedSeason3 = totalSeasonsPassed >= 5;
    const rich = money >= 500000;
    showMessage(`📌 เงื่อนไขซื้อฟาร์มผลไม้: ผ่าน 5 ฤดู (${playedSeason3 ? '✅' : '❌'}) | มีเงิน 500,000 บ. (${rich ? '✅' : '❌'})`, 5000);
};

window.showTimberFarmExpansionReqs = function () {
    const playedSeason4 = totalSeasonsPassed >= 6;
    const rich = money >= 1000000;
    showMessage(`📌 เงื่อนไขซื้อฟาร์มตัดต้นไม้: ผ่าน 6 ฤดู (${playedSeason4 ? '✅' : '❌'}) | มีเงิน 1,000,000 บ. (${rich ? '✅' : '❌'})`, 5000);
};

window.buyTimberFarmExpansion = function () {
    if (timberFarmExpanded || farm.length >= 48) return showMessage("❌ คุณได้ซื้อฟาร์มตัดต้นไม้ไปแล้ว");
    if (money < 1000000) return showMessage("💸 เงินไม่พอซื้อฟาร์มตัดต้นไม้ (1,000,000 บาท)");
    money -= 1000000;
    currentSeasonExpense += 1000000;
    seasonDetails.exUpgrades += 1000000;
    timberFarmExpanded = true;
    for (let i = 0; i < 8; i++) farm.push({ type: -1, startTime: 0, watered: false, fertilized: 0, speedMult: 1 });
    playSound('click');
    showMessage("🎉 ซื้อฟาร์มตัดต้นไม้สำเร็จ! ได้รับ 8 แปลง", 3500);
    currentFarmTab = 3;
    renderFarm();
    saveGame();
};

window.buyTreeFarmExpansion = function () {
    if (treeFarmExpanded || farm.length >= 40) return showMessage("❌ คุณได้ซื้อฟาร์มต้นไม้ไปแล้ว");
    if (money < 500000) return showMessage("💸 เงินไม่พอซื้อฟาร์มต้นไม้ (500,000 บาท)");
    money -= 500000;
    currentSeasonExpense += 500000;
    seasonDetails.exUpgrades += 500000;
    treeFarmExpanded = true;
    for (let i = 0; i < 8; i++) farm.push({ type: -1, startTime: 0, watered: false, fertilized: 0, speedMult: 1 });
    playSound('click');
    showMessage("🎉 ซื้อฟาร์มต้นไม้สำเร็จ! ได้รับ 8 แปลง", 3500);
    currentFarmTab = 2; // สลับไปหน้าฟาร์มต้นไม้
    renderFarm();
    saveGame();
};

// ฟังก์ชัน: ซื้อที่ดินขยายฟาร์ม 2
window.buyFarm2Expansion = function () {
    if (farm.length >= 32) return showMessage("❌ คุณได้ขยายฟาร์ม 2 ไปแล้ว");
    if (money < 150000) return showMessage("💸 เงินไม่พอซื้อที่ดิน (150,000 บาท)");
    money -= 150000;
    currentSeasonExpense += 150000;
    seasonDetails.exUpgrades += 150000;
    for (let i = 0; i < 8; i++) farm.push({ type: -1, startTime: 0, watered: false, fertilized: 0, speedMult: 1 });
    playSound('click');
    showMessage("🎉 ขยายพื้นที่ฟาร์ม 2 สำเร็จ! ได้รับเพิ่ม 8 แปลง", 3500);
    renderFarm();
    saveGame();
};

// ฟังก์ชัน: ซื้อที่ดินขยายฟาร์ม
window.buyLandExpansion = function () {
    if (farmExpanded || farm.length >= 24) return showMessage("❌ คุณได้ขยายที่ดินนี้ไปแล้ว");
    if (money < 50000) return showMessage("💸 เงินไม่พอซื้อที่ดิน (50,000 บาท)");
    money -= 50000;
    currentSeasonExpense += 50000;
    seasonDetails.exUpgrades += 50000;
    farmExpanded = true;
    for (let i = 0; i < 8; i++) farm.push({ type: -1, startTime: 0, watered: false, fertilized: 0, speedMult: 1 });
    playSound('click');
    showMessage("🎉 ขยายพื้นที่ฟาร์มสำเร็จ! ได้รับเพิ่ม 8 แปลง", 3500);
    currentFarmTab = 1; // สลับไปหน้าฟาร์ม 2 ทันที
    renderFarm();
    saveGame();
};

// ฟังก์ชัน: สลับหน้าฟาร์ม 1 และ ฟาร์ม 2
window.switchFarmTab = function (tab) {
    currentFarmTab = parseInt(tab);
    playSound('click');
    renderFarm();
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
    showMessage(`✅ ${baseVeggies[i].name} เลเวล ${veggieLevels[i]}`);
    renderShop(); saveGame();
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
    playSound('click');
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
    playSound('harvest');
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
        else if (rand < 0.90) { repGained = 50; rank = "รองชนะเลิศอันดับ 1"; emoji = "🥈"; animal.contestWins.second++; levelChange = 0.5; }
        else { repGained = 20; rank = "รองชนะเลิศอันดับ 2"; emoji = "🥉"; animal.contestWins.third++; levelChange = 0.25; }
    } else if (contestScore >= 70) {
        if (rand < 0.15) { repGained = 100; rank = "รางวัลชนะเลิศ"; emoji = "🥇"; animal.hasWonFirstPlace = true; animal.contestWins.first++; levelChange = 1; }
        else if (rand < 0.50) { repGained = 50; rank = "รองชนะเลิศอันดับ 1"; emoji = "🥈"; animal.contestWins.second++; levelChange = 0.5; }
        else if (rand < 0.85) { repGained = 20; rank = "รองชนะเลิศอันดับ 2"; emoji = "🥉"; animal.contestWins.third++; levelChange = 0.25; }
        else { repGained = 5; rank = "รางวัลชมเชย"; emoji = "🎀"; animal.contestWins.runnerUp++; levelChange = 0.1; }
    } else {
        if (rand < 0.05) { repGained = 50; rank = "รองชนะเลิศอันดับ 1"; emoji = "🥈"; animal.contestWins.second++; levelChange = 0.5; }
        else if (rand < 0.20) { repGained = 20; rank = "รองชนะเลิศอันดับ 2"; emoji = "🥉"; animal.contestWins.third++; levelChange = 0.25; }
        else if (rand < 0.50) { repGained = 5; rank = "รางวัลชมเชย"; emoji = "🎀"; animal.contestWins.runnerUp++; levelChange = 0.1; }
        else { repGained = 0; rank = "ตกรอบคัดเลือก"; emoji = "❌"; levelChange = -0.5; }
    }

    // ชื่อเสียงที่จะได้รับจะทวีคูณตามระดับเลเวลประกวด (เพิ่มทีละ 20%)
    const repMulti = 1 + (animal.contestLevel * 0.2);
    repGained = Math.floor(repGained * repMulti);
    farmReputation += repGained;

    // ปรับอัปเดตเลเวลประกวด โดยจำกัดไม่ให้ต่ำกว่า 0
    animal.contestLevel = Math.max(0, animal.contestLevel + levelChange);

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

// ฟังก์ชัน: เปิด/ปิด การเก็บเกี่ยวผักอัตโนมัติ
window.toggleAutoHarvest = function () {
    if (autoHarvestEnabled) {
        autoHarvestEnabled = false;
        playSound('click');
        showMessage("❌ ปิดบริการเก็บเกี่ยวอัตโนมัติแล้ว");
    } else {
        autoHarvestEnabled = true;
        playSound('click');
        showMessage(`✅ เปิดบริการเก็บเกี่ยวอัตโนมัติ (ค่าบริการ ${AUTO_HARVEST_FEE_PERCENT * 100}% จากยอดขาย)`);
    }
    renderAnimalShop();
    saveGame();
};

// ฟังก์ชัน: ตั้งค่าผักที่ต้องการให้ระบบปลูกอัตโนมัติ
window.updateAutoPlantType = function (val) {
    autoPlantType = parseInt(val);
    saveGame();
};

// ฟังก์ชัน: เปิด/ปิด คนรับจ้างปลูกผักอัตโนมัติ
window.toggleAutoPlant = function () {
    if (autoPlantEnabled) {
        autoPlantEnabled = false;
        playSound('click');
        showMessage("❌ เลิกจ้างคนปลูกผักแล้ว");
    } else {
        const select = document.getElementById('autoPlantSelect');
        if (select) autoPlantType = parseInt(select.value);
        if (!seasonalBonus[currentSeason].includes(autoPlantType)) return showMessage("❌ ผักชนิดนี้ไม่ได้อยู่ในฤดูกาล!");

        autoPlantEnabled = true;
        playSound('click');
        showMessage(`✅ จ้างคนปลูก ${baseVeggies[autoPlantType].name} แล้ว! (ค่าจ้าง 15%)`);
    }
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

// ฟังก์ชัน: คำนวณความหิว ลดค่าความสุข และตรวจสอบการป่วยของสัตว์ (เรียกใช้ตามระยะเวลา)
function consumeAnimalFood() {
    let alertSick = false;
    Object.keys(animals).forEach(k => {
        const idx = parseInt(k);
        animals[idx].forEach(animal => {
            if (animal.inContest) return; // ไม่หิว ไม่เศร้า ไม่ป่วยตอนไปประกวด
            // Decays food
            animal.food = Math.max(0, animal.food - 10);

            // Decays happiness
            if (animal.happiness === undefined) animal.happiness = 100;
            if (autoPetEnabled && !autoPetResting && autoPetEnergy >= 1) {
                animal.happiness = 100;
                autoPetEnergy -= 1;
            } else {
                animal.happiness = Math.max(0, animal.happiness - 5);
            }

            // Decays beauty
            if (animal.beauty === undefined) animal.beauty = 50;
            animal.beauty = Math.max(0, animal.beauty - 5); // ความสวยงามลดลง

            // Auto Feeder logic
            if (autoFeederPurchased && animal.food < 50 && feedStock >= 8) {
                feedStock -= 8;
                animal.food = 100;
            }

            // Sick checking
            if (!vaccinePurchased && animal.food === 0 && !animal.sick) {
                if (Math.random() < 0.15) {
                    animal.sick = true;
                    alertSick = true;
                }
            }

            // EXP gain
            if (!animal.sick && animal.food > 40) {
                if (animal.level < 100) {
                    if (animal.exp < 100) animal.exp += 10;
                    if (animal.exp >= 100) {
                        let capCheck = window.canAnimalLevelUp ? window.canAnimalLevelUp(animal) : { can: true };
                        if (capCheck.can) {
                            animal.level++;
                            animal.exp = 0;
                            showMessage(`🎉 ${getAnimalName(animal, idx)} เลเวลอัพเป็น Lv.${animal.level}!`);
                        } else {
                            animal.exp = 100;
                        }
                    }
                } else {
                    animal.exp = 100; // EXP ตัน
                }
            }
        });
    });

    if (autoPetEnabled && !autoPetResting && autoPetEnergy < 1) {
        autoPetResting = true;
        autoPetEnergy = 0;
        showMessage(`💆 คนดูแลสัตว์เหนื่อยล้า ขอพักฟื้นสักครู่...`);
    }

    if (alertSick) {
        showMessage(`🤒 สัตว์เลี้ยงบางตัวเริ่มป่วย! กรุณาใช้ยารักษาก่อนผลผลิตหยุดทำงาน`);
    }
}

// ==================== แท็บและการจัดหน้าจอ ====================

// ฟังก์ชัน: สลับหน้าจอไปมาระหว่าง ร้านพืช, ฟาร์มสัตว์, การตลาด ฯลฯ
window.switchTab = function (tabId, button) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    if (button) {
        button.classList.add('active');
    }
};

// เพิ่ม CSS สำหรับแอนิเมชันความสำเร็จ
const achievementStyle = document.createElement('style');
achievementStyle.textContent = `
    @keyframes unlockGlow {
        0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.4); border-color: #ffd700; }
        50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.9); border-color: #ffea00; }
        100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.4); border-color: #ffd700; }
    }
    @keyframes shineBg {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    .achievement-item {
        display: flex;
        align-items: center;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 10px;
        transition: transform 0.3s ease;
    }
    .achievement-item.unlocked {
        background: linear-gradient(45deg, #fff9e6, #fff0b3, #fff9e6);
        background-size: 200% 200%;
        animation: shineBg 3s ease infinite, unlockGlow 2s infinite;
    }
    .achievement-item.locked {
        background: #f5f5f5;
        border: 2px dashed #ccc;
        opacity: 0.6;
        filter: grayscale(100%);
    }
`;
document.head.appendChild(achievementStyle);

// ฟังก์ชัน: แสดงรายการความสำเร็จทั้งหมดบนหน้าจอ
function renderAchievements() {
    const list = document.getElementById('achievementsList');
    if (!list) return; // ป้องกัน Error หากยังไม่ได้ใส่แท็บนี้ใน HTML

    list.innerHTML = '';
    achievementsData.forEach(ach => {
        const isUnlocked = unlockedAchievements.includes(ach.id);
        const div = document.createElement('div');
        div.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;

        div.innerHTML = `
            <div class="achievement-icon" style="font-size: 32px; margin-right: 20px;">${isUnlocked ? '🏆' : '🔒'}</div>
            <div class="achievement-details">
                <strong style="color: ${isUnlocked ? '#b8860b' : '#888'}; font-size: 16px;">${ach.name}</strong><br>
                <small style="color: #555;">${isUnlocked ? '✅ ปลดล็อคแล้ว!' : `🎯 เป้าหมาย: มีเงิน ${ach.target.toLocaleString()} บาท`}</small>
            </div>
        `;
        list.appendChild(div);
    });
}

// ฟังก์ชัน: ตรวจสอบเงื่อนไขว่าผู้เล่นผ่านระบบความสำเร็จ (Achievement) หรือยัง
function checkAchievements() {
    achievementsData.forEach(ach => {
        if (money >= ach.target && !unlockedAchievements.includes(ach.id)) {
            unlockedAchievements.push(ach.id);
            playSound('levelup');
            showMessage(`🏆 ปลดล็อคความสำเร็จ: ${ach.name}!`, 4500);
            renderAchievements(); // อัปเดตรายการบนหน้าจอทันทีเมื่อปลดล็อค
            saveGame();
        }
    });
}

// ==================== หน้าต่างสถิติฟาร์ม ====================

// ฟังก์ชัน: คำนวณยศ (Rank) ของผู้เล่นจากรายได้รวมตลอดชีพ
function getPlayerRank(income) {
    if (income >= 10000000) return "👑 มหาจักรพรรดิฟาร์ม";
    if (income >= 5000000) return "💎 ตำนานแห่งชาวไร่";
    if (income >= 1000000) return "🏆 เจ้าพ่อการเกษตร";
    if (income >= 200000) return "🥇 เศรษฐีฟาร์ม";
    if (income >= 50000) return "🥈 ผู้เชี่ยวชาญการเกษตร";
    if (income >= 10000) return "🥉 เกษตรกรผู้มุ่งมั่น";
    return "🌱 ชาวไร่มือใหม่";
}

window.showFarmStats = function () {
    playSound('click');
    const overlay = document.createElement('div');
    overlay.id = 'farmStatsOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999;';
    document.body.appendChild(overlay);

    const modal = document.createElement('div');
    modal.id = 'farmStatsModal';
    modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px 35px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.4); z-index: 10000; text-align: center; min-width: 320px; max-width: 90%; max-height: 85vh; overflow-y: auto; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);';

    let cropsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; text-align: left; margin-top: 15px;">';
    baseVeggies.forEach((v, i) => {
        const count = veggieSalesCount[i] || 0;
        cropsHtml += `<div style="background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 1.5em; margin-right: 10px;">${v.name}</span>
            <span style="color: #4a5568; font-size: 0.9em;">ขาย: <strong style="color: #2b6cb0; font-size: 1.1em;">${count}</strong></span>
        </div>`;
    });
    cropsHtml += '</div>';

    let totalAnimals = 0;
    let championAnimals = [];
    Object.keys(animals).forEach(k => {
        totalAnimals += animals[k].length;
        const idx = parseInt(k);
        animals[k].forEach(animal => {
            if (animal.hasWonFirstPlace || (animal.contestWins && animal.contestWins.first > 0)) {
                championAnimals.push({
                    name: typeof getAnimalName === 'function' ? getAnimalName(animal, idx) : animal.name,
                    wins: animal.contestWins ? animal.contestWins.first : 1,
                    emoji: animalData[idx].emoji,
                    clv: animal.contestLevel || 0
                });
            }
        });
    });

    let hallOfFameHtml = '';
    if (championAnimals.length > 0) {
        championAnimals.sort((a, b) => b.wins - a.wins); // เรียงตามจำนวนครั้งที่ชนะมากที่สุด
        hallOfFameHtml = `<div style="margin-top: 25px; text-align: left;">
            <h3 style="color: #d69e2e; margin-bottom: 15px; border-bottom: 2px dashed #f6e05e; padding-bottom: 8px;"><span style="text-shadow: 0 0 5px gold;">🏆</span> ห้องเกียรติยศ (Hall of Fame)</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">`;
        championAnimals.forEach(champ => {
            hallOfFameHtml += `
                <div style="background: linear-gradient(135deg, #fffaf0, #fefcbf); border: 1px solid #f6e05e; padding: 12px 10px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative;">
                    <div style="position: absolute; top: -10px; right: -5px; font-size: 20px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">🥇</div>
                    <div style="font-size: 32px; margin-bottom: 8px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${champ.emoji}</div>
                    <strong style="color: #b7791f; font-size: 0.95em; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${champ.name}">${champ.name}</strong>
                    <div style="font-size: 0.85em; color: #744210; margin-top: 6px; background: rgba(255,255,255,0.6); padding: 4px; border-radius: 6px;">ชนะเลิศ <strong style="color: #d69e2e;">${champ.wins}</strong> ครั้ง</div>
                    ${champ.clv > 0 ? `<div style="font-size: 0.8em; color: #fff; background: #d69e2e; margin-top: 6px; padding: 2px; border-radius: 4px; font-weight: bold; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">⭐ CLv.${champ.clv}</div>` : ''}
                </div>
            `;
        });
        hallOfFameHtml += `</div></div>`;
    } else {
        hallOfFameHtml = `<div style="margin-top: 25px; text-align: left;">
            <h3 style="color: #d69e2e; margin-bottom: 15px; border-bottom: 2px dashed #f6e05e; padding-bottom: 8px;"><span style="text-shadow: 0 0 5px gold;">🏆</span> ห้องเกียรติยศ (Hall of Fame)</h3>
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; color: #a0aec0; font-size: 0.95em; border: 1px dashed #cbd5e0;">
                ยังไม่มีสัตว์เลี้ยงที่ชนะเลิศการประกวด<br><small style="margin-top: 5px; display: block;">ส่งสัตว์เลี้ยงร่างวิวัฒนาการเข้าประกวดเพื่อลุ้นรางวัลชนะเลิศ!</small>
            </div>
        </div>`;
    }

    const playerRank = getPlayerRank(totalLifetimeIncome);
    const actualTotalExpense = totalLifetimeExpense + currentSeasonExpense; // รวมรายจ่ายซีซั่นปัจจุบันเข้าไปด้วยเพื่อความแม่นยำ

    // สร้างกราฟแท่งประวัติรายได้ 10 ฤดูล่าสุด
    let chartHtml = '';
    if (typeof incomeHistory !== 'undefined' && incomeHistory.length > 0) {
        let maxVal = Math.max(...incomeHistory, ...expenseHistory, 100);
        chartHtml = `<div style="display: flex; align-items: flex-end; justify-content: space-around; height: 120px; background: rgba(0,0,0,0.02); padding: 10px 5px 0 5px; border-radius: 8px; margin-bottom: 20px; border: 1px dashed #cbd5e0;">`;
        for (let i = 0; i < incomeHistory.length; i++) {
            let incPct = (incomeHistory[i] / maxVal) * 100;
            let expPct = (expenseHistory[i] / maxVal) * 100;
            let seasonNum = (totalSeasonsPassed - incomeHistory.length + i);
            chartHtml += `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 8%; cursor: pointer;" title="ฤดูที่ ${seasonNum}&#10;รายรับ: ${incomeHistory[i].toLocaleString()} บ.&#10;รายจ่าย: ${expenseHistory[i].toLocaleString()} บ.">
                    <div style="display: flex; gap: 2px; align-items: flex-end; height: 100%; width: 100%; justify-content: center;">
                        <div style="width: 45%; height: ${incPct}%; background: linear-gradient(0deg, #38a169, #48bb78); border-radius: 3px 3px 0 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
                        <div style="width: 45%; height: ${expPct}%; background: linear-gradient(0deg, #c53030, #e53e3e); border-radius: 3px 3px 0 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
                    </div>
                    <div style="font-size: 10px; color: #718096; margin-top: 4px; border-top: 1px solid #e2e8f0; width: 100%; text-align: center; padding-top: 2px;">S.${seasonNum}</div>
                </div>
            `;
        }
        chartHtml += `</div>`;
        chartHtml = `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px; margin-top: 15px;">
                <h3 style="text-align: left; color: #4a5568; margin: 0;">📈 กราฟประวัติ (10 ฤดูล่าสุด)</h3>
                <div style="font-size: 11px; display: flex; gap: 8px; font-weight: bold;">
                    <span style="color: #38a169;">■ รายรับ</span>
                    <span style="color: #e53e3e;">■ รายจ่าย</span>
                </div>
            </div>
            ${chartHtml}
        `;
    }

    modal.innerHTML = `
        <h2 style="margin-top:0; color: #2d3748; border-bottom: 2px solid #edf2f7; padding-bottom: 10px;">👤 โปรไฟล์และสถิติฟาร์ม</h2>
        <div style="background: linear-gradient(135deg, #f6e05e, #ecc94b); border: 1px solid #d69e2e; padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-size: 0.9em; color: #744210; font-weight: bold;">ยศเกษตรกรปัจจุบัน</div>
            <div style="font-size: 1.8em; font-weight: bold; color: #2d3748; margin-top: 5px;">${playerRank}</div>
        </div>
        <div style="background: #ebf8ff; border: 1px solid #90cdf4; padding: 15px; border-radius: 10px; text-align: left; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
            <div><span style="font-size: 1.2em;">💰</span> <strong style="color: #2c5282;">รายได้รวมตลอดชีพ:</strong> <span style="color: #2f855a; font-weight: bold; font-size: 1.2em; float: right;">${totalLifetimeIncome.toLocaleString()} บ.</span></div>
            <div><span style="font-size: 1.2em;">💸</span> <strong style="color: #2c5282;">รายจ่ายรวมตลอดชีพ:</strong> <span style="color: #e53e3e; font-weight: bold; font-size: 1.2em; float: right;">${actualTotalExpense.toLocaleString()} บ.</span></div>
            <hr style="border: 0; border-top: 1px dashed #90cdf4; margin: 5px 0;">
            <div><span style="font-size: 1.2em;">🌟</span> <strong style="color: #2c5282;">ชื่อเสียงฟาร์ม:</strong> <span style="font-weight: bold; color: #d69e2e; float: right;">${typeof farmReputation !== 'undefined' ? farmReputation : 0} แต้ม</span></div>
            <div><span style="font-size: 1.2em;">⏳</span> <strong style="color: #2c5282;">ฤดูกาลที่ผ่านไป:</strong> <span style="font-weight: bold; float: right;">${totalSeasonsPassed} ฤดู</span></div>
            <div><span style="font-size: 1.2em;">🐾</span> <strong style="color: #2c5282;">สัตว์เลี้ยงปัจจุบัน:</strong> <span style="font-weight: bold; float: right;">${totalAnimals} ตัว</span></div>
        </div>
        ${chartHtml}
        <h3 style="text-align: left; color: #4a5568; margin-bottom: 5px;">🌾 สถิติการเพาะปลูก</h3>
        ${cropsHtml}
        ${hallOfFameHtml}
        <button onclick="closeFarmStats()" style="margin-top: 25px; padding: 12px; background: #e53e3e; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; box-shadow: 0 4px 6px rgba(229, 62, 62, 0.2);">ปิดหน้าต่าง</button>
    `;

    document.body.appendChild(modal);
};

window.closeFarmStats = function () {
    playSound('click');
    const modal = document.getElementById('farmStatsModal');
    if (modal) modal.remove();
    const overlay = document.getElementById('farmStatsOverlay');
    if (overlay) overlay.remove();
};

// ==================== ระบบเซฟเกม (Save/Load) ====================

// ฟังก์ชัน: บันทึกเกมลงใน LocalStorage บนเบราว์เซอร์
function saveGame() {
    localStorage.setItem('idleFarmFull', JSON.stringify({
        money, woodStock, growthMultiplier, farm, veggieLevels, currentSeason, seasonStartTime,
        stoneStock, woodPlankStock, stoneBlockStock, ironOreStock, goldOreStock,
        ironBarStock, goldBarStock, isMining, miningEndTime, minedRewards,
        animals, pens, feedStock, veggiePriceModifiers, unlockedAchievements, autoFeederPurchased, vaccinePurchased, autoHarvestEnabled,
        currentSeasonIncome, currentSeasonExpense, lastSeasonIncome, lastSeasonExpense, seasonDetails,
        autoPlantEnabled, autoPlantType, autoPlantWorkerLevel, autoPetEnabled, veggieSalesCount, currentWeather, weatherLastChange,
        fertilizerStock, fertilizerBoughtThisSeason, totalSeasonsPassed, farmExpanded, treeFarmExpanded, lastSave: Date.now(),
        timberFarmExpanded, bulkWaterRented, bulkFertilizerRented, animalTools, totalLifetimeIncome, totalLifetimeExpense, buildings, farmReputation,
        craftingTasks, activeCrafting, craftedItems, mineLevel,
        autoPlantEnergy, autoPlantResting, autoPetEnergy, autoPetResting,
        autoPlantEnergyLevel, autoPetEnergyLevel,
        incomeHistory, expenseHistory,
        autoMinerEnabled, autoMinerEnergy, autoMinerResting, autoMinerEnergyLevel,
        veggiePopularity
    }));
}

// ฟังก์ชัน: โหลดข้อมูลจาก LocalStorage รวมถึงกระบวนการโอนย้ายรูปแบบข้อมูลเก่ามาเป็นรูปแบบใหม่ (Migration)
function loadGame() {
    const saved = localStorage.getItem('idleFarmFull');
    if (saved) {
        const data = JSON.parse(saved);
        money = data.money || 500;
        woodStock = data.woodStock || 0;
        stoneStock = data.stoneStock || 0;
        woodPlankStock = data.woodPlankStock || 0;
        stoneBlockStock = data.stoneBlockStock || 0;
        ironBarStock = data.ironBarStock || 0;
        goldBarStock = data.goldBarStock || 0;
        ironOreStock = data.ironOreStock || 0;
        goldOreStock = data.goldOreStock || 0;
        isMining = data.isMining || false;
        miningEndTime = data.miningEndTime || 0;
        minedRewards = data.minedRewards || null;
        mineLevel = data.mineLevel || 1;
        farmReputation = data.farmReputation || 0;
        growthMultiplier = data.growthMultiplier || 1;
        farm = data.farm || Array(16).fill().map(() => ({ type: -1, startTime: 0 }));
        if (farm.length > 48) {
            farm = farm.slice(0, 48);
        }
        veggieLevels = data.veggieLevels || Array(19).fill(1);
        if (veggieLevels.length < 19) veggieLevels.push(...Array(19 - veggieLevels.length).fill(1));
        currentSeason = data.currentSeason || 0;
        seasonStartTime = data.seasonStartTime || Date.now();
        feedStock = data.feedStock !== undefined ? data.feedStock : 0;
        veggiePriceModifiers = data.veggiePriceModifiers || Array(19).fill(1.0);
        if (veggiePriceModifiers.length < 19) veggiePriceModifiers.push(...Array(19 - veggiePriceModifiers.length).fill(1.0));
        veggiePopularity = data.veggiePopularity || Array(19).fill(1.0);
        if (veggiePopularity.length < 19) veggiePopularity.push(...Array(19 - veggiePopularity.length).fill(1.0));
        unlockedAchievements = data.unlockedAchievements || [];
        autoFeederPurchased = data.autoFeederPurchased || false;
        vaccinePurchased = data.vaccinePurchased || false;
        autoHarvestEnabled = data.autoHarvestEnabled || false;
        currentSeasonIncome = data.currentSeasonIncome || 0;
        currentSeasonExpense = data.currentSeasonExpense || 0;
        lastSeasonIncome = data.lastSeasonIncome || 0;
        lastSeasonExpense = data.lastSeasonExpense || 0;
        totalLifetimeIncome = data.totalLifetimeIncome || 0;
        totalLifetimeExpense = data.totalLifetimeExpense || 0;
        seasonDetails = data.seasonDetails || { inCrops: 0, inAnimals: 0, inSell: 0, exSeeds: 0, exCare: 0, exUpgrades: 0, exFees: 0, tax: 0 };
        if (seasonDetails.tax === undefined) seasonDetails.tax = 0;
        autoPlantEnabled = data.autoPlantEnabled || false;
        autoPlantType = data.autoPlantType || 0;
        autoPlantWorkerLevel = data.autoPlantWorkerLevel || 1;
        autoPetEnabled = data.autoPetEnabled || false;
        veggieSalesCount = data.veggieSalesCount || Array(19).fill(0);
        if (veggieSalesCount.length < 19) veggieSalesCount.push(...Array(19 - veggieSalesCount.length).fill(0));
        currentWeather = data.currentWeather || 0;
        weatherLastChange = data.weatherLastChange || Date.now();
        fertilizerStock = data.fertilizerStock || 0;
        fertilizerBoughtThisSeason = data.fertilizerBoughtThisSeason || 0;
        totalSeasonsPassed = data.totalSeasonsPassed || 0;
        farmExpanded = data.farmExpanded || false;
        treeFarmExpanded = data.treeFarmExpanded || false;
        timberFarmExpanded = data.timberFarmExpanded || false;
        bulkWaterRented = data.bulkWaterRented || false;
        bulkFertilizerRented = data.bulkFertilizerRented || false;
        animalTools = data.animalTools || { 0: false, 1: false, 2: false, 3: false };
        craftingTasks = data.craftingTasks || { sawmill: null, stoneCrusher: null, smelter: null };
        autoPlantEnergy = data.autoPlantEnergy !== undefined ? data.autoPlantEnergy : 100;
        autoPlantResting = data.autoPlantResting || false;
        autoPetEnergy = data.autoPetEnergy !== undefined ? data.autoPetEnergy : 100;
        autoPetResting = data.autoPetResting || false;
        autoPlantEnergyLevel = data.autoPlantEnergyLevel || 1;
        autoPetEnergyLevel = data.autoPetEnergyLevel || 1;
        autoMinerEnabled = data.autoMinerEnabled || false;
        autoMinerEnergy = data.autoMinerEnergy !== undefined ? data.autoMinerEnergy : 100;
        autoMinerResting = data.autoMinerResting || false;
        autoMinerEnergyLevel = data.autoMinerEnergyLevel || 1;
        incomeHistory = data.incomeHistory || [];
        expenseHistory = data.expenseHistory || [];

        activeCrafting = data.activeCrafting || {};
        if (activeCrafting && activeCrafting.type) {
            const oldType = activeCrafting.type;
            activeCrafting = {};
            activeCrafting[oldType] = data.activeCrafting;
        }
        craftedItems = data.craftedItems || {};
        if (craftedItems && craftedItems.type) {
            const oldType = craftedItems.type;
            craftedItems = {};
            craftedItems[oldType] = data.craftedItems;
        }

        // นำเข้าข้อมูลสิ่งปลูกสร้าง
        buildings = data.buildings || {
            farmerHouse: { level: 0, max: 3, name: "🏠 บ้านชาวนา", costBase: 10000, woodCostBase: 50, desc: "ที่พักฟื้นฟู", feeBase: 500, reqSeasons: [0, 2, 5] },
            waterWell: { level: 0, max: 3, name: "🚰 บ่อน้ำบาดาล", costBase: 15000, woodCostBase: 20, desc: "ลดเวลาพืชโต 5% /Lv", feeBase: 800, reqSeasons: [1, 3, 6] },
            silo: { level: 0, max: 3, name: "📦 ยุ้งฉาง", costBase: 20000, woodCostBase: 100, desc: "ความจุคอก +1/Lv", feeBase: 1200, reqSeasons: [2, 4, 8] },
            storage: { level: 0, max: 5, name: "📦 โรงเก็บของ", costBase: 12000, woodCostBase: 50, desc: "เพิ่มความจุวัสดุทุกชนิด +100/Lv", feeBase: 500, reqSeasons: [0, 1, 3] }
        };

        Object.keys(buildings).forEach(k => {
            if (!buildings[k].reqSeasons) {
                if (k === 'farmerHouse') buildings[k] = { ...buildings[k], feeBase: 500, reqSeasons: [0, 2, 5], desc: "ที่พักฟื้นฟู" };
                if (k === 'waterWell') buildings[k] = { ...buildings[k], feeBase: 800, reqSeasons: [1, 3, 6], desc: "ลดเวลาพืชโต 5% /Lv" };
                if (k === 'silo') buildings[k] = { ...buildings[k], feeBase: 1200, reqSeasons: [2, 4, 8], desc: "ความจุอาหารสัตว์ +300/Lv" };
                if (k === 'storage') buildings[k] = { ...buildings[k], feeBase: 500, reqSeasons: [0, 1, 3], desc: "เพิ่มความจุวัสดุทุกชนิด +100/Lv" };
            }
        });
        if (!buildings.storage) buildings.storage = { level: 0, max: 5, name: "📦 โรงเก็บของ", costBase: 12000, woodCostBase: 50, desc: "เพิ่มความจุวัสดุทุกชนิด +100/Lv", feeBase: 500, reqSeasons: [0, 1, 3] };
        if (!buildings.sawmill) buildings.sawmill = { level: 0, max: 1, name: "🪚 โรงแปรรูปไม้", costBase: 15000, woodCostBase: 100, desc: "ปลดล็อคการแปรรูปไม้เป็นไม้แผ่น", feeBase: 0, reqSeasons: [1, 2] };
        if (!buildings.stoneCrusher) buildings.stoneCrusher = { level: 0, max: 1, name: "⚙️ โรงบดหิน", costBase: 25000, woodCostBase: 150, desc: "ปลดล็อคการแปรรูปหินเป็นหินก้อน", feeBase: 0, reqSeasons: [1, 3] };
        if (!buildings.smelter) buildings.smelter = { level: 0, max: 1, name: "🔥 โรงหลอมแร่", costBase: 50000, woodCostBase: 300, desc: "ปลดล็อคการหลอมแร่เหล็กและทอง", feeBase: 0, reqSeasons: [2, 4] };

        // อัพเดตแปลงผักที่มีอยู่แล้วให้รองรับระบบรดน้ำ/ใส่ปุ๋ย (ในกรณีที่โหลดเซฟเก่า)
        farm.forEach(p => {
            if (p.type !== -1) {
                if (p.watered === undefined) p.watered = false;
                if (p.fertilized === undefined) p.fertilized = 0;
                if (p.speedMult === undefined) p.speedMult = 1;
                if (baseVeggies[p.type].isTree && p.isMature === undefined) p.isMature = true; // Assume old trees are mature
            }
        });

        // Handle migration of old data formats
        if (data.pens) {
            pens = data.pens;
            animals = data.animals || { 0: [], 1: [], 2: [], 3: [] };

            // Migration for happiness property
            Object.keys(animals).forEach(k => {
                animals[k].forEach(a => {
                    if (a.happiness === undefined) a.happiness = 100;
                    if (a.beauty === undefined) a.beauty = 50;
                    if (a.fatigueSeason === undefined) a.fatigueSeason = -1;
                    if (a.isEvolved === undefined) a.isEvolved = false;
                    if (a.lastContestSeason === undefined) a.lastContestSeason = -1;
                    if (a.inContest === undefined) a.inContest = false;
                    if (a.contestPrepEndSeason === undefined) a.contestPrepEndSeason = -1;
                    if (a.contestReady === undefined) a.contestReady = false;
                    if (a.hasWonFirstPlace === undefined) a.hasWonFirstPlace = false;
                    if (a.contestLevel === undefined) a.contestLevel = 0;
                    if (a.contestWins === undefined) {
                        a.contestWins = {
                            first: a.hasWonFirstPlace ? 1 : 0,
                            second: 0,
                            third: 0,
                            runnerUp: 0
                        };
                    }
                    if (a.birthSeason === undefined) a.birthSeason = totalSeasonsPassed;
                    if (a.totalContests === undefined) a.totalContests = (a.contestWins.first + a.contestWins.second + a.contestWins.third + a.contestWins.runnerUp);
                });
            });
        } else {
            // Old format fallback & migration
            pens = {
                0: { purchased: data.animals && data.animals[0] > 0 ? true : false, level: 1 },
                1: { purchased: data.animals && data.animals[1] > 0 ? true : false, level: 1 },
                2: { purchased: data.animals && data.animals[2] > 0 ? true : false, level: 1 },
                3: { purchased: data.animals && data.animals[3] > 0 ? true : false, level: 1 }
            };

            animals = { 0: [], 1: [], 2: [], 3: [] };
            Object.keys(animals).forEach(k => {
                const idx = parseInt(k);
                const count = data.animals ? data.animals[idx] || 0 : 0;
                const oldLevel = data.animalLevels ? data.animalLevels[idx] || 1 : 1;
                const oldFood = data.animalFood ? data.animalFood[idx] || 80 : 80;
                for (let i = 0; i < count; i++) {
                    animals[idx].push({
                        id: Date.now() + Math.random() + i,
                        name: `${animalData[idx].name} #${i + 1}`,
                        level: oldLevel,
                        exp: 0,
                        food: oldFood,
                        happiness: 100,
                        beauty: 50,
                        fatigueSeason: -1,
                        sick: false,
                        yield: 0,
                        isEvolved: false,
                        lastContestSeason: -1,
                        inContest: false,
                        contestPrepEndSeason: -1,
                        contestReady: false,
                        hasWonFirstPlace: false,
                        contestLevel: 0,
                        contestWins: { first: 0, second: 0, third: 0, runnerUp: 0 },
                        birthSeason: totalSeasonsPassed,
                        totalContests: 0
                    });
                }
            });
        }
    }
}

// ฟังก์ชัน: แสดงข้อความแจ้งเตือน (Toast Notification) ไว้กลางจอแล้วค่อยจางหายไป
function showMessage(text, timeout = 2200) {
    if (text.includes('❌') || text.includes('🔒') || text.includes('💸')) {
        playSound('error');
    } else if (text.includes('🤒') || text.includes('เหนื่อยล้า') || text.includes('หมดแรง')) {
        playSound('alert');
    }
    const el = document.getElementById('message');
    el.textContent = text;
    setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, timeout);
}

// เริ่มเกม
// ==================== ระบบ Main Loop ของเกม (ทำงานวนซ้ำ) ====================
window.onload = function () {
    loadGame();
    if (!veggiePriceModifiers || veggiePriceModifiers.every(m => m === 1.0)) {
        if (typeof randomizeMarketPrices === 'function') randomizeMarketPrices();
    }
    renderFarm();
    if (typeof renderShop === 'function') renderShop();
    if (typeof renderAnimals === 'function') renderAnimals();
    if (typeof renderAnimalShop === 'function') renderAnimalShop();
    if (typeof updateMarket === 'function') updateMarket();
    if (typeof renderAchievements === 'function') renderAchievements(); // โหลดความสำเร็จตอนเริ่มเกม
    updateFarmOverview(); // โหลดข้อมูลภาพรวมฟาร์ม
    if (typeof renderMining === 'function') renderMining();

    // Set correct season background on load
    document.body.style.background = `linear-gradient(#87CEEB, ${seasons[currentSeason].color})`;
    updateSeasonUI();

    showMessage("🌟 เกมพร้อมแล้ว! ปลูกผักและเลี้ยงสัตว์เพื่อรายได้ passive", 3500);

    // เพิ่มปุ่มลอย (Floating Button) สำหรับดูสถิติ
    const statsBtn = document.createElement('button');
    statsBtn.innerHTML = '📊 สถิติ';
    statsBtn.style.cssText = 'position: fixed; bottom: 25px; right: 25px; padding: 12px 20px; border-radius: 30px; background: linear-gradient(135deg, #6f42c1, #8e44ad); color: white; border: none; font-weight: bold; cursor: pointer; box-shadow: 0 6px 12px rgba(0,0,0,0.3); z-index: 1000; font-size: 16px; transition: transform 0.2s;';
    statsBtn.onmouseover = () => statsBtn.style.transform = 'scale(1.05)';
    statsBtn.onmouseout = () => statsBtn.style.transform = 'scale(1)';
    statsBtn.onclick = showFarmStats;
    document.body.appendChild(statsBtn);

    // ลูปที่ 1: อัปเดตรายได้แบบ Passive จากสัตว์เลี้ยง และบันทึกเกม (ทุกๆ 2.5 วินาที)
    setInterval(() => {
        if (isGamePaused) return;
        updateFarmTimers();
        const pendingYield = getTotalPendingYield();
        document.getElementById('stats').innerHTML = `💰 ${Math.floor(money).toLocaleString()} | 🌲 ${woodStock.toLocaleString()} | 🌟 ${farmReputation.toLocaleString()} | ⚡ x${growthMultiplier.toFixed(1)} | 🧺 ${pendingYield.toLocaleString()} บ.`;
        saveGame();
    }, 2500);

    // ลูปที่ 2: ระบบตรวจจับเวลา, สภาพอากาศ, การทำฟาร์มอัตโนมัติ (ทุกๆ 1 วินาที)
    setInterval(() => {
        if (isGamePaused) return;

        // ระบบสลายความนิยมผัก (Decay Popularity towards 1.0)
        if (typeof veggiePopularity !== 'undefined') {
            let changed = false;
            for (let i = 0; i < veggiePopularity.length; i++) {
                if (veggiePopularity[i] > 1.0) {
                    veggiePopularity[i] = Math.max(1.0, veggiePopularity[i] - 0.004);
                    changed = true;
                }
            }
            // อัปเดตราคาพืชผัก/ตลาดทุกๆ 5 วินาทีหากมีการเปลี่ยนแปลง เพื่อไม่ให้กระทบประสิทธิภาพ
            if (changed && Math.floor(Date.now() / 1000) % 5 === 0) {
                if (typeof updateMarket === 'function') updateMarket();
                if (typeof renderShop === 'function' && document.getElementById('tab-seeds').classList.contains('active')) renderShop();
            }
        }

        // ระบบฟื้นฟูพลังงานคนงาน
        let energyUpdated = false;
        const plantMax = 100 + (autoPlantEnergyLevel - 1) * 50;
        const plantRec = 1 + (autoPlantEnergyLevel - 1) * 1;
        if (autoPlantEnergy < plantMax) {
            autoPlantEnergy = Math.min(plantMax, autoPlantEnergy + plantRec);
            energyUpdated = true;
            if (autoPlantResting && autoPlantEnergy >= plantMax) {
                autoPlantResting = false;
                if (autoPlantEnabled) { playSound('levelup'); showMessage("🧑‍🌾 คนปลูกผักฟื้นพลังเต็มที่ กลับมาทำงานต่อ!"); }
            }
        }
        const petMax = 100 + (autoPetEnergyLevel - 1) * 50;
        const petRec = 1 + (autoPetEnergyLevel - 1) * 1;
        if (autoPetEnergy < petMax) {
            autoPetEnergy = Math.min(petMax, autoPetEnergy + petRec);
            energyUpdated = true;
            if (autoPetResting && autoPetEnergy >= petMax) {
                autoPetResting = false;
                if (autoPetEnabled) { playSound('levelup'); showMessage("💆 คนดูแลสัตว์ฟื้นพลังเต็มที่ กลับมาทำงานต่อ!"); }
            }
        }
        const minerMax = 100; // พลังงานสูงสุดของคนงานเหมืองคงที่
        const minerRec = 0.5 + (autoMinerEnergyLevel - 1) * 0.25; // ปรับให้ฟื้นฟูพลังงานช้าลง
        if (autoMinerEnergy < minerMax) {
            autoMinerEnergy = Math.min(minerMax, autoMinerEnergy + minerRec);
            energyUpdated = true;
            if (autoMinerResting && autoMinerEnergy >= minerMax) {
                autoMinerResting = false;
                if (autoMinerEnabled) { playSound('levelup'); showMessage("👷 คนงานเหมืองฟื้นพลังเต็มที่ กลับมาทำงานต่อ!"); }
            }
        }
        if (energyUpdated && currentAnimalShopTab === 'equip') {
            let plantStatusEl = document.getElementById('autoPlantStatus');
            if (plantStatusEl && autoPlantEnabled) {
                plantStatusEl.innerHTML = autoPlantResting ? `<span style="color:#e53e3e;">💤 กำลังพักฟื้น (${Math.floor(autoPlantEnergy)}/${plantMax})</span>` : `<span style="color:#48bb78;">⚡ พลังงาน: ${Math.floor(autoPlantEnergy)}/${plantMax}</span>`;
            }
            let petStatusEl = document.getElementById('autoPetStatus');
            if (petStatusEl && autoPetEnabled) {
                petStatusEl.innerHTML = autoPetResting ? `<span style="color:#e53e3e;">💤 กำลังพักฟื้น (${Math.floor(autoPetEnergy)}/${petMax})</span>` : `<span style="color:#48bb78;">⚡ พลังงาน: ${Math.floor(autoPetEnergy)}/${petMax}</span>`;
            }
        }
        if (energyUpdated) {
            let minerStatusEl = document.getElementById('autoMinerStatus');
            if (minerStatusEl && autoMinerEnabled) {
                minerStatusEl.innerHTML = autoMinerResting ? `<span style="color:#fca5a5;">💤 กำลังพักฟื้น (${Math.floor(autoMinerEnergy)}/${minerMax})</span>` : `<span style="color:#86efac;">⚡ พลังงาน: ${Math.floor(autoMinerEnergy)}/${minerMax}</span>`;
            }
        }

        // ระบบสุ่มสภาพอากาศทุกๆ 30 วินาที
        if (Date.now() - weatherLastChange >= 30000) {
            currentWeather = Math.floor(Math.random() * weatherData.length);
            weatherLastChange = Date.now();
            showMessage(`🌤️ สภาพอากาศเปลี่ยนเป็น: ${weatherData[currentWeather].name}`);
            updateSeasonUI();
            renderFarm(); // บังคับอัปเดตหลอดเวลาบนหน้าจอ
        }

        // ตรวจสอบว่าสัตว์เลี้ยงประกวดเสร็จและพร้อมดูผลหรือยัง
        let animalReadyForContest = false;
        Object.keys(animals).forEach(idx => {
            animals[idx].forEach(animal => {
                if (animal.inContest && !animal.contestReady && totalSeasonsPassed >= (animal.contestPrepEndSeason || 0)) {
                    animal.contestReady = true;
                    animalReadyForContest = true;
                    showMessage(`🎉 ${getAnimalName(animal, idx)} เตรียมตัวพร้อมแล้ว! กดดูผลประกวดได้เลย`, 4000);
                    playSound('harvest');
                }
            });
        });
        if (animalReadyForContest) { renderAnimals(); saveGame(); }

        // สะสมผลผลิตสัตว์เลี้ยง แทนการเพิ่มเงิน
        produceAnimalYield();

        const pendingYield = getTotalPendingYield();
        document.getElementById('stats').innerHTML = `💰 ${Math.floor(money).toLocaleString()} | 🌲 ${woodStock.toLocaleString()} | 🌟 ${farmReputation.toLocaleString()} | ⚡ x${growthMultiplier.toFixed(1)} | 🧺 ${pendingYield.toLocaleString()} บ.`;
        checkSeasonProgress();
        updateSeasonUI();
        updateFarmTimers();
        updateFarmOverview(); // อัปเดตข้อมูลภาพรวมแบบเรียลไทม์
        checkAchievements();

        // ระบบนับเวลาเหมือง
        if (typeof checkMiningProgress === 'function') checkMiningProgress();

        // ระบบนับเวลาแปรรูปวัสดุ
        if (typeof checkCraftingProgress === 'function') checkCraftingProgress();

        // การทำงานของระบบเหมืองอัตโนมัติ
        if (autoMinerEnabled && !autoMinerResting && !isMining && !minedRewards) {
            if (money >= 100 && feedStock >= 10 && autoMinerEnergy >= 20) {
                money -= 100;
                feedStock -= 10;
                autoMinerEnergy -= 20;
                currentSeasonExpense += 100;
                if (typeof seasonDetails !== 'undefined') seasonDetails.exFees += 100;
                isMining = true;
                miningEndTime = Date.now() + 30000;
                playSound('click');
                showMessage("⛏️ คนงานเหมืองอัตโนมัติเริ่มลงไปสำรวจเหมืองแล้ว!");
                if (typeof renderMining === 'function') renderMining();
                saveGame();
            } else if (autoMinerEnergy < 20) {
                autoMinerResting = true;
                autoMinerEnergy = 0;
                showMessage(`👷 คนงานเหมืองเหนื่อยล้า ขอพักฟื้นสักครู่...`);
            }
        }

        // การทำงานของระบบเก็บเกี่ยวอัตโนมัติ
        if (autoHarvestEnabled) {
            let harvested = false;
            let totalHarvestValue = 0;
            let totalFee = 0;
            let totalFeedGained = 0;
            const feedValues = { 0: 3, 1: 1, 2: 4, 3: 2, 4: 2, 5: 1, 6: 5, 7: 2, 8: 3, 9: 4, 10: 3, 11: 4, 12: 10, 13: 12, 14: 15, 15: 20 };
            farm.forEach((p, i) => {
                if (p.type !== -1) {
                    const b = baseVeggies[p.type];
                    if (!getVeggie(p.type).bonus) {
                        farm[i] = { type: -1, startTime: 0 }; // ถอนผักเฉาทิ้งออโต้
                        harvested = true;
                    } else if (b.isWoodTree) {
                        // สำหรับต้นไม้ตัดไม้ดิบในระบบออโต้ ให้เก็บเกี่ยวเมื่อผลิตสะสม > 0
                        const woodTime = b.woodTime || 10000;
                        const actualWoodTime = woodTime / (growthMultiplier * (p.speedMult || 1));
                        const elapsed = Date.now() - p.startTime;
                        const woodGained = Math.floor(elapsed / actualWoodTime) * (b.woodYield || 1);

                        if (woodGained > 0) {
                            const maxMat = window.getMaxMaterials();
                            if (woodStock < maxMat) {
                                const actualGain = Math.min(maxMat - woodStock, woodGained);
                                woodStock += actualGain;
                                const remainder = elapsed % actualWoodTime;
                                p.startTime = Date.now() - remainder;
                                harvested = true;
                            }
                        }
                    } else if (Date.now() - p.startTime >= getPlotGrowTime(p) / (growthMultiplier * (p.speedMult || 1))) {
                        const v = getVeggie(p.type);
                        const grossValue = v.value;
                        const fee = Math.ceil(grossValue * AUTO_HARVEST_FEE_PERCENT);
                        const netValue = grossValue - fee;

                        money += netValue;
                        currentSeasonIncome += grossValue;
                        totalLifetimeIncome += grossValue;
                        seasonDetails.inCrops += grossValue;
                        currentSeasonExpense += fee;
                        seasonDetails.exFees += fee;

                        const feedGained = (feedValues[p.type] || 1) + Math.floor(veggieLevels[p.type] / 10);
                        feedStock = Math.min(window.getMaxFeed(), feedStock + feedGained);
                        recordCropSale(p.type); // บันทึกการขาย

                        totalHarvestValue += grossValue;
                        totalFee += fee;
                        totalFeedGained += feedGained;

                        if (b.isTree) {
                            p.startTime = Date.now();
                            p.watered = false;
                            p.fertilized = 0;
                            if (!p.isMature) {
                                p.isMature = true; // บังคับให้เป็นต้นไม้โตเต็มวัย จะได้โตเร็วขึ้นในรอบต่อไป
                            }
                        } else {
                            farm[i] = { type: -1, startTime: 0 };
                        }
                        harvested = true;
                    }
                }
            });

            if (harvested) {
                if (totalHarvestValue > 0) {
                    playSound('harvest');
                    showMessage(`🚜 เก็บเกี่ยวอัตโนมัติ ได้รับสุทธิ ${(totalHarvestValue - totalFee).toLocaleString()} บาท (+${totalFeedGained} Feed)`);
                }
                renderFarm();
                if (typeof updateMarket === 'function') updateMarket();
                if (typeof renderShop === 'function') renderShop();
                saveGame();
            }
        }

        // การทำงานของระบบปลูกอัตโนมัติ (ตัดสินใจจากกำไรที่คุ้มค่าที่สุดในขณะนั้น)
        if (autoPlantEnabled && !autoPlantResting) {
            let planted = false;
            let feeRate = 0.15; let speedMult = 1;
            if (autoPlantWorkerLevel === 2) { feeRate = 0.30; speedMult = 1.5; }
            else if (autoPlantWorkerLevel === 3) { feeRate = 0.50; speedMult = 2; }

            const remainingSeasonTime = 120000 - (Date.now() - seasonStartTime);

            let bestType = -1;
            let bestROI = -Infinity;
            let bestCost = 0;
            let bestFee = 0;

            // คำนวณหาผักที่ให้กำไรสูงสุดและปลูกทันก่อนหมดฤดู
            seasonalBonus[currentSeason].forEach(type => {
                if (baseVeggies[type].isTree) return; // คนงานไม่ปลูกต้นไม้
                const actualGrowTime = getPlotGrowTime({ type: type, isMature: false }) / (growthMultiplier * speedMult);

                if (actualGrowTime <= remainingSeasonTime) {
                    const v = getVeggie(type);
                    const fee = Math.ceil(v.cost * feeRate);
                    const totalCost = v.cost + fee;
                    const profit = v.value - totalCost;
                    const roi = profit / actualGrowTime; // กำไรเฉลี่ยต่อหน่วยเวลา

                    if (roi > bestROI) {
                        bestROI = roi;
                        bestType = type;
                        bestCost = totalCost;
                        bestFee = fee;
                    }
                }
            });

            if (bestType !== -1) {
                let plantedCount = 0;
                farm.forEach((p, i) => {
                    if (i < 32 && p.type === -1 && money >= bestCost && autoPlantEnergy >= 5) { // ปลูกเฉพาะฟาร์มปกติ
                        money -= bestCost;
                        autoPlantEnergy -= 5;
                        currentSeasonExpense += bestCost;
                        const actualSeedCost = bestCost - bestFee;
                        seasonDetails.exSeeds += actualSeedCost;
                        seasonDetails.exFees += bestFee;
                        farm[i] = { type: bestType, startTime: Date.now(), speedMult: speedMult, watered: false, fertilized: 0 };
                        planted = true;
                        plantedCount++;
                    }
                });
                if (planted) {
                    renderFarm();
                    showMessage(`🧑‍🌾 คนงานเลือกปลูก ${baseVeggies[bestType].name} จำนวน ${plantedCount} แปลง`);
                }

                if (autoPlantEnergy < 5) {
                    autoPlantResting = true;
                    autoPlantEnergy = 0;
                    showMessage(`🧑‍🌾 คนปลูกผักหมดแรง ขอพักฟื้นสักครู่...`);
                }
            }
        }
    }, 1000);

    // ลูปที่ 3: สุ่มราคาตลาดใหม่ผันผวน (ทุกๆ 25 วินาที)
    setInterval(() => {
        if (isGamePaused) return;
        if (typeof randomizeMarketPrices === 'function') randomizeMarketPrices();
    }, 25000);

    // ลูปที่ 4: ลดความอิ่มของสัตว์เลี้ยง และอัปเดตหน้าจอสัตว์เลี้ยง (ทุกๆ 10 วินาที)
    setInterval(() => {
        if (isGamePaused) return;
        consumeAnimalFood();
        if (typeof renderAnimals === 'function') renderAnimals();
        if (typeof renderAnimalShop === 'function') renderAnimalShop(); // Update capacities dynamically
    }, 10000); // ลดอาหารทุก 10 วินาที
};