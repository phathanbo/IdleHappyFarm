// data.js - ไฟล์สำหรับเก็บข้อมูลคงที่ (Constants) ของเกม

const penData = [
    { name: "🛖 เล้าไก่", cost: 150, upgradeCostBase: 100, capacityBase: 4, emoji: "🛖" },
    { name: "🐄 คอกวัว", cost: 350, upgradeCostBase: 250, capacityBase: 4, emoji: "🐄" },
    { name: "🐐 คอกแพะ", cost: 250, upgradeCostBase: 180, capacityBase: 4, emoji: "🐐" },
    { name: "🐝 รังผึ้งคอนโด", cost: 200, upgradeCostBase: 150, capacityBase: 4, emoji: "📦" }
];

const seasons = [
    { name: "🌸 ฤดูใบไม้ผลิ", growMult: 0.8, priceMult: 1.2, color: "#98FB98" },
    { name: "☀️ ฤดูร้อน", growMult: 1.0, priceMult: 1.35, color: "#FFD700" },
    { name: "🍂 ฤดูใบไม้ร่วง", growMult: 0.9, priceMult: 1.3, color: "#FF8C00" },
    { name: "❄️ ฤดูหนาว", growMult: 1.15, priceMult: 1.1, color: "#B0E0E6" }
];

const weatherData = [
    { name: "☀️ แจ่มใส", growMult: 1.0 },
    { name: "🌧️ ฝนตก", growMult: 0.7 },       // โตไวขึ้น (เวลาใช้ 70%)
    { name: "🔥 ร้อนจัด", growMult: 1.2 },     // โตช้าลง 20%
    { name: "🌪️ พายุเข้า", growMult: 1.5 }      // โตช้าลง 50%
];

const seasonalBonus = { 0: [4, 2, 11, 12, 13, 14, 15, 16, 17, 18], 1: [1, 7, 8, 12, 13, 14, 15, 16, 17, 18], 2: [5, 3, 9, 12, 13, 14, 15, 16, 17, 18], 3: [0, 6, 10, 12, 13, 14, 15, 16, 17, 18] };

const baseVeggies = [
    { name: "🥕", baseCost: 20, baseGrow: 8000, baseValue: 32 },
    { name: "🍅", baseCost: 35, baseGrow: 14000, baseValue: 58 },
    { name: "🥬", baseCost: 15, baseGrow: 5500, baseValue: 24 },
    { name: "🌾", baseCost: 40, baseGrow: 11000, baseValue: 48 },
    { name: "🍓", baseCost: 25, baseGrow: 6500, baseValue: 35 },
    { name: "🎃", baseCost: 80, baseGrow: 22000, baseValue: 95 },
    { name: "🧅", baseCost: 18, baseGrow: 4500, baseValue: 22 },
    { name: "🌶️", baseCost: 22, baseGrow: 7000, baseValue: 30 },
    { name: "🍉", baseCost: 100, baseGrow: 25000, baseValue: 140 }, // 8: ฤดูร้อน
    { name: "🍠", baseCost: 30, baseGrow: 9000, baseValue: 42 },    // 9: ฤดูใบไม้ร่วง
    { name: "🥦", baseCost: 45, baseGrow: 13000, baseValue: 62 },   // 10: ฤดูหนาว
    { name: "🍇", baseCost: 90, baseGrow: 21000, baseValue: 125 },  // 11: ฤดูใบไม้ผลิ
    { name: "🍎", baseCost: 500, baseGrow: 60000, fruitGrowTime: 30000, baseValue: 1500, isTree: true }, // 12
    { name: "🍊", baseCost: 600, baseGrow: 75000, fruitGrowTime: 40000, baseValue: 1800, isTree: true }, // 13
    { name: "🥭", baseCost: 800, baseGrow: 90000, fruitGrowTime: 50000, baseValue: 2500, isTree: true }, // 14
    { name: "🥥", baseCost: 1000, baseGrow: 120000, fruitGrowTime: 60000, baseValue: 3500, isTree: true }, // 15
    { name: "🌳", baseCost: 250, baseGrow: 90000, fruitGrowTime: 45000, baseValue: 0, woodYield: 1, woodTime: 10000, isTree: true, isWoodTree: true }, // 16
    { name: "🌲", baseCost: 500, baseGrow: 120000, fruitGrowTime: 60000, baseValue: 0, woodYield: 3, woodTime: 15000, isTree: true, isWoodTree: true }, // 17
    { name: "🎋", baseCost: 1000, baseGrow: 150000, fruitGrowTime: 80000, baseValue: 0, woodYield: 6, woodTime: 20000, isTree: true, isWoodTree: true } // 18
];

const animalData = [
    { name: "🐔 ไก่", cost: 80, produce: 3, maxYield: 300, emoji: "🐔", toolName: "🧺 ตะกร้าเก็บไข่", toolCost: 200, evoName: "🦚 ไก่ทองคำ", evoCost: 5000, evoMult: 5 },
    { name: "🐄 วัว", cost: 250, produce: 12, maxYield: 1200, emoji: "🐄", toolName: "🪣 ถังรีดนม", toolCost: 500, evoName: "🐂 วัวศักดิ์สิทธิ์", evoCost: 15000, evoMult: 5 },
    { name: "🐐 แพะ", cost: 180, produce: 8, maxYield: 800, emoji: "🐐", toolName: "✂️ กรรไกรตัดขน", toolCost: 400, evoName: "🦄 แพะสวรรค์", evoCost: 10000, evoMult: 5 },
    { name: "🐝 ผึ้ง", cost: 120, produce: 5, maxYield: 500, emoji: "🐝", toolName: "💨 เครื่องพ่นควัน", toolCost: 300, evoName: "👑 นางพญาผึ้ง", evoCost: 8000, evoMult: 5 }
];

const achievementsData = [
    { id: 'money_1k', target: 1000, name: "เศรษฐีหน้าใหม่ (มีเงิน 1,000 บาท)" },
    { id: 'money_10k', target: 10000, name: "นายทุนฟาร์ม (มีเงิน 10,000 บาท)" },
    { id: 'money_50k', target: 50000, name: "เถ้าแก่ใหญ่ (มีเงิน 50,000 บาท)" },
    { id: 'money_100k', target: 100000, name: "มหาเศรษฐีฟาร์ม (มีเงิน 100,000 บาท)" },
    { id: 'money_1m', target: 1000000, name: "ตำนานแห่งชาวไร่ (มีเงิน 1,000,000 บาท)" }
];