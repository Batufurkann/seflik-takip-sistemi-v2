// Koyuncu Orman İşletme Şefliği - Örnek Veri Seti

// Şeflik Paneli Varsayılan Ayarları
const DEFAULT_SEFLIK_NAME = "Koyuncu";

const DEFAULT_SEFLIK_COMPS = [
  "13", "13a", "17-18", "23", "40", "41", "41a", "59", "72", "73", "81", "82", "83", "85"
];

const DEFAULT_SPECIES = [
  { code: 'Çk', name: 'Karaçam', type: 'İbreli' },
  { code: 'Çz', name: 'Kızılçam', type: 'İbreli' },
  { code: 'Ks', name: 'Kestane', type: 'Yapraklı' },
  { code: 'G', name: 'Göknar', type: 'İbreli' },
  { code: 'Ml', name: 'Saçlı Meşe', type: 'Yapraklı' },
  { code: 'Mz', name: 'Sapsız Meşe', type: 'Yapraklı' },
  { code: 'Dy', name: 'Diğer Yapraklı', type: 'Yapraklı' }
];

const DEFAULT_ASSORTMENTS = [
  { name: 'Tomruk', unit: 'm3' },
  { name: 'Tel Direk', unit: 'm3' },
  { name: 'Maden Direk', unit: 'm3' },
  { name: 'Kağıtlık Odun', unit: 'm3' },
  { name: 'İbr. Kab. Kağ.', unit: 'Ster' },
  { name: 'İbr. Lif', unit: 'Ster' },
  { name: 'Yap. Lif', unit: 'Ster' },
  { name: 'Yap. Yak.', unit: 'Ster' },
  { name: 'Sırık', unit: 'Ster' }
];

const DEFAULT_HARVEST_TYPES = ['Bakım', 'İlk Aralama', 'Olağanüstü'];

const DEFAULT_RAMPA_WOOD_TYPES = [
  "İbreli Lif Yonga",
  "Kestane Lif Yonga",
  "Meşe Lif Yonga",
  "Dy Lif Yonga",
  "Yapraklı Lif Yonga",
  "İbreli Kabuklu Kağ.",
  "Kestane Sırık",
  "Dy Yakacak Odun",
  "Dy Sırık"
];


// Geriye dönük uyumluluk için varsayılan haritalama
const SPECIES_TYPES = {
  'Çk': 'İbreli',
  'Çz': 'İbreli',
  'Ks': 'Yapraklı',
  'G': 'İbreli',
  'Ml': 'Yapraklı',
  'Mz': 'Yapraklı',
  'Dy': 'Yapraklı'
};

const DEFAULT_COMPARTMENTS = [
  {
    id: "2025-13a",
    yıl: 2025,
    durum: "Bitti",
    şekil: "Vahidi Fiyat",
    nevi: "İlk Aralama",
    bölmeNo: "13a",
    planİbreli: 18.820,
    planYapraklı: 229.320,
    yüklenici: "Akçakoyun Koop.",
    sözleşmeBaşlangıç: "2025-07-24",
    sözleşmeBitiş: "2025-10-22",
    ekSüreGün: 90,
    ekSüreBitiş: "2026-04-01"
  },
  {
    id: "2025-13",
    yıl: 2025,
    durum: "Bitti",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "13",
    planİbreli: 589.829,
    planYapraklı: 187.013,
    yüklenici: "Akçakoyun Koop.",
    sözleşmeBaşlangıç: "2025-07-24",
    sözleşmeBitiş: "2025-10-22",
    ekSüreGün: 90,
    ekSüreBitiş: "2026-04-01"
  },
  {
    id: "2025-23",
    yıl: 2025,
    durum: "Devam Ediyor",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "23",
    planİbreli: 224.748,
    planYapraklı: 508.214,
    yüklenici: "Karayol Koop.",
    sözleşmeBaşlangıç: "2025-08-23",
    sözleşmeBitiş: "2025-12-30",
    ekSüreGün: 150,
    ekSüreBitiş: "2026-06-01"
  },
  {
    id: "2025-40",
    yıl: 2025,
    durum: "Devam Ediyor",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "40",
    planİbreli: 0,
    planYapraklı: 1030.280,
    yüklenici: "Karayol Koop.",
    sözleşmeBaşlangıç: "2025-08-23",
    sözleşmeBitiş: "2025-12-30",
    ekSüreGün: 150,
    ekSüreBitiş: "2026-06-01"
  },
  {
    id: "2025-41a",
    yıl: 2025,
    durum: "Devam Ediyor",
    şekil: "Vahidi Fiyat",
    nevi: "İlk Aralama",
    bölmeNo: "41a",
    planİbreli: 17.000,
    planYapraklı: 475.470,
    yüklenici: "Akçakoyun Koop.",
    sözleşmeBaşlangıç: "2025-08-23",
    sözleşmeBitiş: "2025-12-30",
    ekSüreGün: 150,
    ekSüreBitiş: "2026-06-01"
  },
  {
    id: "2025-41",
    yıl: 2025,
    durum: "Devam Ediyor",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "41",
    planİbreli: 405.898,
    planYapraklı: 551.601,
    yüklenici: "Akçakoyun Koop.",
    sözleşmeBaşlangıç: "2025-08-23",
    sözleşmeBitiş: "2025-12-30",
    ekSüreGün: 150,
    ekSüreBitiş: "2026-06-01"
  },
  {
    id: "2026-85",
    yıl: 2026,
    durum: "Devam Ediyor",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "85",
    planİbreli: 1380.827,
    planYapraklı: 153.884,
    yüklenici: "Akçakoyun Koop.",
    sözleşmeBaşlangıç: "2025-09-18",
    sözleşmeBitiş: "2026-07-15",
    ekSüreGün: 0,
    ekSüreBitiş: ""
  },
  {
    id: "2026-83",
    yıl: 2026,
    durum: "Daha Başlamadı",
    şekil: "Dikili Satış",
    nevi: "Bakım",
    bölmeNo: "83",
    planİbreli: 875.338,
    planYapraklı: 0.000,
    yüklenici: "",
    sözleşmeBaşlangıç: "",
    sözleşmeBitiş: "",
    ekSüreGün: 0,
    ekSüreBitiş: ""
  },
  {
    id: "2026-82",
    yıl: 2026,
    durum: "Daha Başlamadı",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "82",
    planİbreli: 827.772,
    planYapraklı: 70.551,
    yüklenici: "Karayol Koop.",
    sözleşmeBaşlangıç: "",
    sözleşmeBitiş: "",
    ekSüreGün: 0,
    ekSüreBitiş: ""
  },
  {
    id: "2026-81",
    yıl: 2026,
    durum: "Daha Başlamadı",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "81",
    planİbreli: 600.000,
    planYapraklı: 50.000,
    yüklenici: "",
    sözleşmeBaşlangıç: "",
    sözleşmeBitiş: "",
    ekSüreGün: 0,
    ekSüreBitiş: ""
  },
  {
    id: "2026-17-18",
    yıl: 2026,
    durum: "Daha Başlamadı",
    şekil: "Dikili Satış",
    nevi: "Olağanüstü",
    bölmeNo: "17-18",
    planİbreli: 134.800,
    planYapraklı: 78.358,
    yüklenici: "",
    sözleşmeBaşlangıç: "",
    sözleşmeBitiş: "",
    ekSüreGün: 0,
    ekSüreBitiş: ""
  },
  {
    id: "2026-59",
    yıl: 2026,
    durum: "Daha Başlamadı",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "59",
    planİbreli: 830.957,
    planYapraklı: 285.026,
    yüklenici: "Akçakoyun Koop.",
    sözleşmeBaşlangıç: "",
    sözleşmeBitiş: "",
    ekSüreGün: 0,
    ekSüreBitiş: ""
  },
  {
    id: "2026-72",
    yıl: 2026,
    durum: "Daha Başlamadı",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "72",
    planİbreli: 502.309,
    planYapraklı: 109.278,
    yüklenici: "Akçakoyun Koop.",
    sözleşmeBaşlangıç: "",
    sözleşmeBitiş: "",
    ekSüreGün: 0,
    ekSüreBitiş: ""
  },
  {
    id: "2026-73",
    yıl: 2026,
    durum: "Daha Başlamadı",
    şekil: "Vahidi Fiyat",
    nevi: "Bakım",
    bölmeNo: "73",
    planİbreli: 322.339,
    planYapraklı: 213.274,
    yüklenici: "Akçakoyun Koop.",
    sözleşmeBaşlangıç: "",
    sözleşmeBitiş: "",
    ekSüreGün: 0,
    ekSüreBitiş: ""
  }
];

const DEFAULT_MEASUREMENTS = [
  { id: 1, yıl: 2025, bölmeNo: "13a", nevi: "İlk Aralama", tür: "Mz", cins: "Yap. Yak.", adet: 0, m3: 0, ster: 328, depo: "Rampa", tarih: "2025-09-10" },
  { id: 2, yıl: 2025, bölmeNo: "13a", nevi: "İlk Aralama", tür: "Çk", cins: "İbr. Lif", adet: 0, m3: 0, ster: 20, depo: "Rampa", tarih: "2025-09-12" },
  { id: 3, yıl: 2025, bölmeNo: "13", nevi: "Bakım", tür: "Çk", cins: "Tomruk", adet: 656, m3: 137.665, ster: 0, depo: "Dallık", tarih: "2025-09-15" },
  { id: 4, yıl: 2025, bölmeNo: "13", nevi: "Bakım", tür: "Çk", cins: "Kağıtlık Odun", adet: 247, m3: 60.607, ster: 0, depo: "Dallık", tarih: "2025-09-16" },
  { id: 5, yıl: 2025, bölmeNo: "13", nevi: "Bakım", tür: "Çk", cins: "Maden Direk", adet: 529, m3: 28.250, ster: 0, depo: "Dallık", tarih: "2025-09-18" },
  { id: 6, yıl: 2025, bölmeNo: "13", nevi: "Bakım", tür: "Çk", cins: "İbr. Lif", adet: 0, m3: 0, ster: 109, depo: "Rampa", tarih: "2025-09-20" },
  { id: 7, yıl: 2025, bölmeNo: "13", nevi: "Bakım", tür: "Mz", cins: "Yap. Lif", adet: 0, m3: 0, ster: 6, depo: "Rampa", tarih: "2025-09-21" },
  { id: 8, yıl: 2025, bölmeNo: "13", nevi: "Bakım", tür: "Çk", cins: "İbr. Kab. Kağ.", adet: 0, m3: 0, ster: 45, depo: "Rampa", tarih: "2025-09-22" },
  { id: 9, yıl: 2025, bölmeNo: "13", nevi: "Bakım", tür: "Mz", cins: "Yap. Yak.", adet: 0, m3: 0, ster: 223, depo: "Rampa", tarih: "2025-09-25" },
  { id: 10, yıl: 2025, bölmeNo: "13", nevi: "Bakım", tür: "Mz", cins: "Sırık", adet: 0, m3: 0, ster: 2, depo: "Rampa", tarih: "2025-09-26" },
  { id: 11, yıl: 2025, bölmeNo: "41a", nevi: "İlk Aralama", tür: "Mz", cins: "Yap. Yak.", adet: 0, m3: 0, ster: 150, depo: "Rampa", tarih: "2025-10-02" },
  { id: 12, yıl: 2025, bölmeNo: "41", nevi: "Bakım", tür: "Ks", cins: "Yap. Lif", adet: 0, m3: 0, ster: 470, depo: "Rampa", tarih: "2025-10-05" },
  { id: 13, yıl: 2025, bölmeNo: "41", nevi: "Bakım", tür: "Çk", cins: "İbr. Lif", adet: 0, m3: 0, ster: 68, depo: "Rampa", tarih: "2025-10-06" },
  { id: 14, yıl: 2025, bölmeNo: "41", nevi: "Bakım", tür: "Mz", cins: "Yap. Lif", adet: 0, m3: 0, ster: 37, depo: "Rampa", tarih: "2025-10-08" },
  { id: 15, yıl: 2025, bölmeNo: "41", nevi: "Bakım", tür: "Dy", cins: "Yap. Lif", adet: 0, m3: 0, ster: 75, depo: "Rampa", tarih: "2025-10-10" },
  { id: 16, yıl: 2026, bölmeNo: "85", nevi: "Bakım", tür: "Çk", cins: "Tomruk", adet: 3, m3: 2.116, ster: 0, depo: "Dallık Br", tarih: "2026-03-05" },
  { id: 17, yıl: 2026, bölmeNo: "85", nevi: "Bakım", tür: "Çk", cins: "Kağıtlık Odun", adet: 43, m3: 15.490, ster: 0, depo: "Dallık Br", tarih: "2026-03-06" },
  { id: 18, yıl: 2026, bölmeNo: "85", nevi: "Bakım", tür: "G", cins: "Tomruk", adet: 7, m3: 1.097, ster: 0, depo: "Dallık Br", tarih: "2026-03-07" },
  { id: 19, yıl: 2026, bölmeNo: "85", nevi: "Bakım", tür: "Ks", cins: "Tomruk", adet: 3, m3: 1.368, ster: 0, depo: "Dallık Br", tarih: "2026-03-08" },
  { id: 20, yıl: 2026, bölmeNo: "85", nevi: "Bakım", tür: "G", cins: "Maden Direk", adet: 19, m3: 1.725, ster: 0, depo: "Dallık Br", tarih: "2026-03-10" },
  { id: 21, yıl: 2026, bölmeNo: "85", nevi: "Bakım", tür: "Çk", cins: "Tomruk", adet: 69, m3: 21.558, ster: 0, depo: "Dallık Br", tarih: "2026-03-12" },
  { id: 22, yıl: 2026, bölmeNo: "85", nevi: "Bakım", tür: "G", cins: "Tomruk", adet: 37, m3: 9.168, ster: 0, depo: "Dallık Br", tarih: "2026-03-15" },
  { id: 23, yıl: 2026, bölmeNo: "85", nevi: "Bakım", tür: "Dy", cins: "Sırık", adet: 0, m3: 0, ster: 3, depo: "Rampa", tarih: "2026-03-16" },
  { id: 24, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "Mz", cins: "Yap. Lif", adet: 0, m3: 0, ster: 156, depo: "Rampa", tarih: "2025-11-02" },
  { id: 25, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "Çk", cins: "Maden Direk", adet: 2, m3: 0.211, ster: 0, depo: "Kalkım", tarih: "2025-11-03" },
  { id: 26, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "G", cins: "Maden Direk", adet: 4, m3: 0.430, ster: 0, depo: "Kalkım", tarih: "2025-11-04" },
  { id: 27, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "G", cins: "Kağıtlık Odun", adet: 56, m3: 12.013, ster: 0, depo: "Kalkım", tarih: "2025-11-05" },
  { id: 28, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "Ks", cins: "Tomruk", adet: 3, m3: 0.800, ster: 0, depo: "Kalkım", tarih: "2025-11-06" },
  { id: 29, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "Mz", cins: "Tomruk", adet: 87, m3: 21.846, ster: 0, depo: "Kalkım", tarih: "2025-11-08" },
  { id: 30, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "Çk", cins: "Kağıtlık Odun", adet: 48, m3: 19.337, ster: 0, depo: "Kalkım", tarih: "2025-11-10" },
  { id: 31, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "Çk", cins: "Tomruk", adet: 88, m3: 52.980, ster: 0, depo: "Kalkım", tarih: "2025-11-12" },
  { id: 32, yıl: 2025, bölmeNo: "23", nevi: "Bakım", tür: "Ml", cins: "Yap. Yak.", adet: 0, m3: 0, ster: 70, depo: "Rampa", tarih: "2025-11-15" }
];

const DEFAULT_RAMPA_STACKS = [
  { id: 1, yıl: 2026, cins: "Dy Sırık", istifNo: 1, ster: 1, bölmeNo: "41", rampada: true, satıldı: true, kalktı: true },
  { id: 2, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 2, ster: 15, bölmeNo: "13", rampada: true, satıldı: false, kalktı: false },
  { id: 3, yıl: 2026, cins: "Yapraklı Lif Yonga", istifNo: 3, ster: 6, bölmeNo: "13", rampada: true, satıldı: false, kalktı: false },
  { id: 4, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 4, ster: 8, bölmeNo: "23", rampada: true, satıldı: false, kalktı: false },
  { id: 5, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 5, ster: 10, bölmeNo: "23", rampada: true, satıldı: false, kalktı: false },
  { id: 6, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 6, ster: 12, bölmeNo: "23", rampada: true, satıldı: false, kalktı: false },
  { id: 7, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 7, ster: 10, bölmeNo: "23", rampada: true, satıldı: false, kalktı: false },
  { id: 8, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 8, ster: 40, bölmeNo: "23", rampada: true, satıldı: false, kalktı: false },
  { id: 9, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 9, ster: 16, bölmeNo: "23", rampada: true, satıldı: false, kalktı: false },
  { id: 10, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 10, ster: 10, bölmeNo: "23", rampada: true, satıldı: false, kalktı: false },
  { id: 11, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 11, ster: 10, bölmeNo: "13", rampada: true, satıldı: false, kalktı: false },
  { id: 12, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 12, ster: 36, bölmeNo: "13", rampada: true, satıldı: false, kalktı: false },
  { id: 13, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 13, ster: 15, bölmeNo: "13", rampada: true, satıldı: false, kalktı: false },
  { id: 14, yıl: 2026, cins: "İbreli Kabuklu Kağ.", istifNo: 14, ster: 30, bölmeNo: "13", rampada: true, satıldı: false, kalktı: false },
  { id: 15, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 15, ster: 5, bölmeNo: "13", rampada: true, satıldı: false, kalktı: false },
  { id: 16, yıl: 2026, cins: "Kestane Sırık", istifNo: 16, ster: 2, bölmeNo: "85", rampada: true, satıldı: true, kalktı: true },
  { id: 17, yıl: 2026, cins: "Kestane Sırık", istifNo: 17, ster: 1, bölmeNo: "85", rampada: true, satıldı: true, kalktı: true },
  { id: 18, yıl: 2026, cins: "Dy Lif Yonga", istifNo: 18, ster: 25, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 19, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 19, ster: 18, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 20, yıl: 2026, cins: "Dy Lif Yonga", istifNo: 20, ster: 50, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 21, yıl: 2026, cins: "Kestane Lif Yonga", istifNo: 21, ster: 81, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 22, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 22, ster: 7, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 23, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 23, ster: 20, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 24, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 24, ster: 15, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 25, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 25, ster: 15, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 26, yıl: 2026, cins: "Meşe Lif Yonga", istifNo: 26, ster: 15, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 27, yıl: 2026, cins: "Kestane Lif Yonga", istifNo: 27, ster: 34, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 28, yıl: 2026, cins: "İbreli Lif Yonga", istifNo: 28, ster: 15, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false },
  { id: 29, yıl: 2026, cins: "Kestane Lif Yonga", istifNo: 29, ster: 10, bölmeNo: "41", rampada: true, satıldı: false, kalktı: false }
];

const DEFAULT_IS_PROGRAMI = {
  "2026": {
    dkgh: [9677, 10645, 11613, 12097, 13065, 13548, 14032, 14516, 15000, 15000, 15000, 15000],
    tomruk: [97, 242, 387, 581, 968, 1452, 1936, 2613, 3581, 4355, 5033, 5294],
    telDirek: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    madenDirek: [10, 19, 48, 77, 97, 145, 194, 232, 271, 300, 368, 397],
    sanayi: [0, 0, 10, 29, 48, 77, 116, 164, 203, 290, 338, 377],
    kagitlik: [0, 10, 97, 242, 387, 581, 774, 1161, 1645, 2032, 2613, 2855],
    lifYonga: [48, 97, 290, 484, 677, 968, 1355, 1645, 2032, 2613, 2903, 3077],
    sirik: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    olaganustu: [0, 0, 0, 0, 0, 500, 1000, 1500, 2000, 2500, 3000, 3000],
    yakacak: [10, 19, 29, 48, 97, 145, 387, 581, 871, 1355, 1404, 1452]
  }
};

const DEFAULT_DEPOLAR = ['Dallık', 'Rampa', 'Kalkım', 'Dallık Br'];

window.SPECIES_TYPES = SPECIES_TYPES;
window.DEFAULT_COMPARTMENTS = DEFAULT_COMPARTMENTS;
window.DEFAULT_MEASUREMENTS = DEFAULT_MEASUREMENTS;
window.DEFAULT_SEFLIK_NAME = DEFAULT_SEFLIK_NAME;
window.DEFAULT_SPECIES = DEFAULT_SPECIES;
window.DEFAULT_ASSORTMENTS = DEFAULT_ASSORTMENTS;
window.DEFAULT_HARVEST_TYPES = DEFAULT_HARVEST_TYPES;
window.DEFAULT_RAMPA_STACKS = DEFAULT_RAMPA_STACKS;
window.DEFAULT_SEFLIK_COMPS = DEFAULT_SEFLIK_COMPS;
window.DEFAULT_RAMPA_WOOD_TYPES = DEFAULT_RAMPA_WOOD_TYPES;
window.DEFAULT_IS_PROGRAMI = DEFAULT_IS_PROGRAMI;
window.DEFAULT_DEPOLAR = DEFAULT_DEPOLAR;

