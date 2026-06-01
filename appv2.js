console.log('%cKOYUNCU ORMAN İŞLETME ŞEFİ - FURKAN BATU', 'font-size: 24px; font-family: monospace; font-weight: 900; text-transform: uppercase; color: #00ffcc; text-shadow: 1px 1px 0px #ff00ff, 2px 2px 0px #ff00ff, 3px 3px 0px #ff00ff');

// Koyuncu Orman İşletme Şefliği - Uygulama Mantığı (appv2.js)
console.log(
  "%c🌲 Koyuncu Orman İşletme Şefliği Takip Sistemi\n%cDeveloped by Furkan Batu | 2026",
  "color: #22c55e; font-size: 16px; font-weight: bold;",
  "color: #f59e0b; font-size: 12px; font-style: italic;"
);
// Uygulama Durumu (State)
let state = {
  compartments: [],
  measurements: [],
  selectedYear: 2025,
  activeTab: 'dashboard',
  editingCompartmentId: null,
  editingMeasurementId: null,
  seflikName: 'Koyuncu',
  species: [],
  assortments: [],
  harvestTypes: [],
  rampaStacks: [],
  editingRampaStackId: null,
  seflikComps: [],
  rampaWoodTypes: [],
  isProgrami: {},
  depolar: []
};

// Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Uygulamayı Başlat
function initApp() {
  // Şeflik Paneli Konfigürasyonunu Yükle
  const storedConfig = localStorage.getItem('ko_seflik_config');
  if (storedConfig) {
    const config = JSON.parse(storedConfig);
    state.seflikName = config.seflikName || 'Koyuncu';
    state.species = config.species || [];
    state.assortments = config.assortments || [];
    state.harvestTypes = config.harvestTypes || [];
    state.rampaWoodTypes = config.rampaWoodTypes || [...(window.DEFAULT_RAMPA_WOOD_TYPES || [])];
    state.depolar = config.depolar || [...(window.DEFAULT_DEPOLAR || [])];
  } else {
    state.seflikName = window.DEFAULT_SEFLIK_NAME || 'Koyuncu';
    state.species = [...window.DEFAULT_SPECIES];
    state.assortments = [...window.DEFAULT_ASSORTMENTS];
    state.harvestTypes = [...window.DEFAULT_HARVEST_TYPES];
    state.rampaWoodTypes = [...(window.DEFAULT_RAMPA_WOOD_TYPES || [])];
    state.depolar = [...(window.DEFAULT_DEPOLAR || [])];
    saveSeflikConfig();
  }

  // LocalStorage'dan verileri çek, yoksa varsayılan verileri yükle
  const storedCompartments = localStorage.getItem('ko_compartments');
  const storedMeasurements = localStorage.getItem('ko_measurements');
  const storedYear = localStorage.getItem('ko_selected_year');

  if (storedCompartments) {
    state.compartments = JSON.parse(storedCompartments);
  } else {
    state.compartments = [...window.DEFAULT_COMPARTMENTS];
    saveCompartments();
  }

  if (storedMeasurements) {
    state.measurements = JSON.parse(storedMeasurements);
  } else {
    state.measurements = [...window.DEFAULT_MEASUREMENTS];
    saveMeasurements();
  }

  if (storedYear) {
    state.selectedYear = parseInt(storedYear);
  } else {
    state.selectedYear = 2025;
  }

  // Rampa İstif Verilerini Yükle
  const storedRampa = localStorage.getItem('ko_rampa_stacks');
  if (storedRampa) {
    state.rampaStacks = JSON.parse(storedRampa);
  } else {
    state.rampaStacks = [...window.DEFAULT_RAMPA_STACKS];
    saveRampaStacks();
  }

  // Şeflik Bölme Listesini Yükle
  const storedSeflikComps = localStorage.getItem('ko_seflik_comps');
  if (storedSeflikComps) {
    state.seflikComps = JSON.parse(storedSeflikComps);
  } else {
    state.seflikComps = [...window.DEFAULT_SEFLIK_COMPS];
    saveSeflikComps();
  }

  // Aylık İş Programını Yükle
  const storedIsProgrami = localStorage.getItem('ko_seflik_is_programi');
  if (storedIsProgrami) {
    state.isProgrami = JSON.parse(storedIsProgrami);
  } else {
    state.isProgrami = JSON.parse(JSON.stringify(window.DEFAULT_IS_PROGRAMI || {}));
    saveSeflikIsProgramiConfig();
  }

  // Dinamik Tür Eşlemeyi, Başlığı ve Dropdown'ları Hazırla
  updateSpeciesTypesMap();
  applyBranding();
  populateDropdowns();
  renderSeflikComps();

  // Arayüz Elemanlarını Dinle
  initEventListeners();

  // Yıl Seçimini Ayarla
  document.getElementById('yearSelect').value = state.selectedYear;

  // Arayüzü Çiz
  switchTab(state.activeTab);
  renderAll();
}

// LocalStorage Kaydetme İşlemleri
function saveCompartments() {
  localStorage.setItem('ko_compartments', JSON.stringify(state.compartments));
}

function saveMeasurements() {
  localStorage.setItem('ko_measurements', JSON.stringify(state.measurements));
}

// Olay Dinleyicileri (Event Listeners)
function initEventListeners() {
  // Sekme Geçişleri
  document.querySelectorAll('.menu-item[data-tab]').forEach(item => {
    item.addEventListener('click', (e) => {
      const tabName = e.currentTarget.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Yıl Seçimi
  document.getElementById('yearSelect').addEventListener('change', (e) => {
    state.selectedYear = parseInt(e.target.value);
    localStorage.setItem('ko_selected_year', state.selectedYear);
    renderAll();
  });

  // Tema Değişimi
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('ko_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ko_theme', newTheme);
    updateThemeButton(newTheme);
    // Grafikleri yeniden yükle (karanlık mod renk geçişi için)
    renderAll();
  });

  // Arama ve Filtreler - Bölmeler
  document.getElementById('compSearch').addEventListener('input', () => renderCompartmentsTable());
  document.getElementById('compStatusFilter').addEventListener('change', () => renderCompartmentsTable());

  // Arama ve Filtreler - Ölçü Tespit
  document.getElementById('measSearch').addEventListener('input', () => renderMeasurementsTable());
  document.getElementById('measDepoFilter').addEventListener('change', () => renderMeasurementsTable());

  // Modal Kapatma Düğmeleri
  document.querySelectorAll('.close-btn, .btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModals();
    });
  });

  // Bölme Ekleme / Düzenleme Formu Gönderimi
  document.getElementById('compartmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveCompartmentForm();
  });

  // Ölçü Tespit Ekleme / Düzenleme Formu Gönderimi
  document.getElementById('measurementForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveMeasurementForm();
  });

  // Tarih Alanı Sözleşme Süresi Hesaplama Tetikleyicisi
  document.getElementById('compStartDate').addEventListener('change', calculateDurationDays);
  document.getElementById('compEndDate').addEventListener('change', calculateDurationDays);

  // JSON Yedek Yükleme (File Input)
  document.getElementById('importFile').addEventListener('change', handleJsonImport);

  // Rampa İstif Arama Girişi
  const rampaSearch = document.getElementById('rampaSearch');
  if (rampaSearch) {
    rampaSearch.addEventListener('input', () => renderRampaTable());
  }

  // Rampa İstif Ekleme / Düzenleme Formu Gönderimi
  const rampaForm = document.getElementById('rampaForm');
  if (rampaForm) {
    rampaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveRampaForm();
    });
  }

  // Şeflik Adı Güncelleme Formu Gönderimi
  const seflikNameForm = document.getElementById('seflikNameForm');
  if (seflikNameForm) {
    seflikNameForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('seflikNameInput').value.trim();
      if (val) {
        state.seflikName = val;
        saveSeflikConfig();
        applyBranding();
        showNotification('Şeflik adı başarıyla güncellendi!', 'success');
      }
    });
  }

  // Kesim Nevi Ekleme Formu Gönderimi
  const seflikNeviForm = document.getElementById('seflikNeviForm');
  if (seflikNeviForm) {
    seflikNeviForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('seflikNeviInput').value.trim();
      if (val) {
        if (state.harvestTypes.includes(val)) {
          showNotification('Bu kesim nevi zaten ekli!', 'warning');
          return;
        }
        state.harvestTypes.push(val);
        saveSeflikConfig();
        populateDropdowns();
        renderSeflikTab();
        document.getElementById('seflikNeviInput').value = '';
      }
    });
  }

  // Ağaç Türü Ekleme Formu Gönderimi
  const seflikSpeciesForm = document.getElementById('seflikSpeciesForm');
  if (seflikSpeciesForm) {
    seflikSpeciesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('speciesCodeInput').value.trim();
      const name = document.getElementById('speciesNameInput').value.trim();
      const type = document.getElementById('speciesTypeInput').value;
      
      if (code && name) {
        if (state.species.some(sp => sp.code.toLowerCase() === code.toLowerCase())) {
          showNotification('Bu kısaltma koduna sahip bir ağaç türü zaten kayıtlı!', 'warning');
          return;
        }
        state.species.push({ code, name, type });
        saveSeflikConfig();
        populateDropdowns();
        renderSeflikTab();
        document.getElementById('speciesCodeInput').value = '';
        document.getElementById('speciesNameInput').value = '';
      }
    });
  }

  // Ürün Cinsi Ekleme Formu Gönderimi
  const seflikAssortmentForm = document.getElementById('seflikAssortmentForm');
  if (seflikAssortmentForm) {
    seflikAssortmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('assortmentNameInput').value.trim();
      const unit = document.getElementById('assortmentUnitInput').value;
      
      if (name) {
        if (state.assortments.some(assort => assort.name.toLowerCase() === name.toLowerCase())) {
          showNotification('Bu isimde bir ürün cinsi zaten kayıtlı!', 'warning');
          return;
        }
        state.assortments.push({ name, unit });
        saveSeflikConfig();
        populateDropdowns();
        renderSeflikTab();
        document.getElementById('assortmentNameInput').value = '';
      }
    });
  }

  // İstif Emval Cinsi Ekleme Formu Gönderimi
  const seflikRampaCinsForm = document.getElementById('seflikRampaCinsForm');
  if (seflikRampaCinsForm) {
    seflikRampaCinsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('rampaCinsInput').value.trim();
      
      if (val) {
        if (!state.rampaWoodTypes) {
          state.rampaWoodTypes = [];
        }
        if (state.rampaWoodTypes.some(c => c.toLowerCase() === val.toLowerCase())) {
          showNotification('Bu isimde bir emval cinsi zaten kayıtlı!', 'warning');
          return;
        }
        state.rampaWoodTypes.push(val);
        saveSeflikConfig();
        populateDropdowns();
        renderSeflikTab();
        document.getElementById('rampaCinsInput').value = '';
      }
    });
  }

  // Depolar Yönetimi Formu Gönderimi
  const seflikDepoForm = document.getElementById('seflikDepoForm');
  if (seflikDepoForm) {
    seflikDepoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('seflikDepoInput').value.trim();
      if (val) {
        if (state.depolar.some(d => d.toLowerCase() === val.toLowerCase())) {
          showNotification('Bu isimde bir depo zaten kayıtlı!', 'warning');
          return;
        }
        state.depolar.push(val);
        saveSeflikConfig();
        populateDropdowns();
        renderSeflikTab();
        document.getElementById('seflikDepoInput').value = '';
      }
    });
  }

  // Şeflik Bölme Ekleme Formu (Tekil)
  const seflikCompSingleForm = document.getElementById('seflikCompSingleForm');
  if (seflikCompSingleForm) {
    seflikCompSingleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('seflikCompSingleInput').value.trim();
      if (val) {
        if (state.seflikComps.includes(val)) {
          showNotification('Bu bölme zaten listede kayıtlı!', 'warning');
          return;
        }
        state.seflikComps.push(val);
        saveSeflikComps();
        renderSeflikComps();
        document.getElementById('seflikCompSingleInput').value = '';
      }
    });
  }

  // Şeflik Bölme Ekleme Formu (Toplu/Aralık)
  const seflikCompBulkForm = document.getElementById('seflikCompBulkForm');
  if (seflikCompBulkForm) {
    seflikCompBulkForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawInput = document.getElementById('seflikCompBulkInput').value.trim();
      if (rawInput) {
        let addedCount = 0;
        let duplicateCount = 0;

        // Sayı Aralığı kontrolü (Örn: 1-94)
        const rangeMatch = rawInput.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          const startNum = parseInt(rangeMatch[1]);
          const endNum = parseInt(rangeMatch[2]);
          
          if (startNum > endNum) {
            showNotification('Başlangıç değeri bitiş değerinden büyük olamaz!', 'danger');
            return;
          }

          for (let i = startNum; i <= endNum; i++) {
            const numStr = i.toString();
            if (!state.seflikComps.includes(numStr)) {
              state.seflikComps.push(numStr);
              addedCount++;
            } else {
              duplicateCount++;
            }
          }
        } else {
          // Virgülle ayrılmış liste veya boşlukla ayrılmış liste
          const items = rawInput.split(/[,\s]+/).map(x => x.trim()).filter(Boolean);
          items.forEach(item => {
            if (!state.seflikComps.includes(item)) {
              state.seflikComps.push(item);
              addedCount++;
            } else {
              duplicateCount++;
            }
          });
        }

        saveSeflikComps();
        renderSeflikComps();
        document.getElementById('seflikCompBulkInput').value = '';
        showNotification(`${addedCount} adet bölme başarıyla eklendi.${duplicateCount > 0 ? ` (${duplicateCount} adet mükerrer bölme atlandı)` : ''}`, 'success');
      }
    });
  }

  // Custom dropdown'ların açılıp kapanmasını yöneten dinleyiciler
  document.addEventListener('click', (e) => {
    const isDropdownBtn = e.target.classList.contains('custom-dropdown-btn');
    if (isDropdownBtn) {
      e.stopPropagation();
      const currentMenu = e.target.nextElementSibling;
      
      // Diğer tüm açık custom dropdown'ları kapat
      document.querySelectorAll('.custom-dropdown-menu').forEach(menu => {
        if (menu !== currentMenu) {
          menu.classList.remove('active');
        }
      });
      
      currentMenu.classList.toggle('active');
    } else {
      // Dışarıya tıklandığında tüm dropdown'ları kapat
      document.querySelectorAll('.custom-dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });

  // Paskalya Yumurtası (Easter Egg) - Klavye Kısayolu ("batu")
  let secretBuffer = "";
  document.addEventListener("keydown", (e) => {
    secretBuffer += e.key.toLowerCase();
    if (secretBuffer.length > 4) {
      secretBuffer = secretBuffer.slice(-4);
    }
    if (secretBuffer === "batu") {
      triggerEasterEgg();
      secretBuffer = ""; 
    }
  });

  // Paskalya Yumurtası (Easter Egg) - Mobil Dokunmatik (Brand logosuna 5 kez tıklama/dokunma)
  let brandClickCount = 0;
  let brandClickTimeout = null;
  const brandEl = document.querySelector('.brand');
  if (brandEl) {
    brandEl.style.cursor = 'pointer'; // Tıklanabilir olduğunu hissettirmek için
    brandEl.addEventListener('click', () => {
      brandClickCount++;
      
      // Her tıklamada zamanlayıcıyı sıfırla, 2 saniye içinde basılmazsa sayacı sıfırla
      clearTimeout(brandClickTimeout);
      brandClickTimeout = setTimeout(() => {
        brandClickCount = 0;
      }, 2000);

      if (brandClickCount === 5) {
        triggerEasterEgg();
        brandClickCount = 0;
      }
    });
  }

  // Easter Egg Bildirim Tetikleyicisi
  function triggerEasterEgg() {
    showNotification("Bu yazılım Furkan Batu tarafından kodlanmıştır. 🌲 Kaz Dağları'nın 30 metrelik ağaçlarına selam olsun!", 'info');
  }

}

// Tema Düğmesini Güncelle
function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  if (theme === 'dark') {
    btn.innerHTML = '<i data-lucide="sun"></i> <span>Aydınlık Mod</span>';
  } else {
    btn.innerHTML = '<i data-lucide="moon"></i> <span>Karanlık Mod</span>';
  }
  // Lucide ikonlarını güncelle
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Sekme Değiştirme
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Menü aktiflik durumunu güncelle
  document.querySelectorAll('.menu-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Sayfa içeriklerini göster/gizle
  document.querySelectorAll('.tab-content').forEach(content => {
    if (content.id === `${tabId}Tab`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Tablo aramalarını ve filtreleri sıfırla
  if (tabId === 'compartments') {
    document.getElementById('compSearch').value = '';
    document.getElementById('compStatusFilter').value = 'all';
    renderCompartmentsTable();
  } else if (tabId === 'measurements') {
    document.getElementById('measSearch').value = '';
    document.getElementById('measDepoFilter').value = 'all';
    renderMeasurementsTable();
  } else if (tabId === 'rampa') {
    document.getElementById('rampaSearch').value = '';
    renderRampaTable();
    renderRampaSummary();
  } else if (tabId === 'seflik') {
    renderSeflikTab();
  } else if (tabId === 'dashboard') {
    renderDashboard();
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// HESAPLAMA MANTIKLARI ( Forestry Business Rules )
// ==========================================

// Ağaç Türüne Göre Sınıflandırma
function getSpeciesType(speciesCode) {
  return window.SPECIES_TYPES[speciesCode] || 'İbreli'; // Varsayılan İbreli
}

// Belirli bir bölmenin gerçekleşme değerlerini ölçü tespitlerden derle
function getCompartmentRealized(bölmeNo, yıl) {
  const result = {
    tomrukAdet: 0, tomrukM3: 0,
    telDirekAdet: 0, telDirekM3: 0,
    madenDirekAdet: 0, madenDirekM3: 0,
    kağıtlıkAdet: 0, kağıtlıkM3: 0,
    ibrKabKağSter: 0,
    ibrLifSter: 0,
    yapLifSter: 0,
    yapYakSter: 0,
    sırıkSter: 0,
    
    // Toplam hacimler (m3)
    ibreliM3: 0,
    yapraklıM3: 0,
    toplamM3: 0
  };

  // Bu bölmeye ve yıla ait tüm ölçü tespitleri bul
  const matchMeas = state.measurements.filter(m => m.bölmeNo === bölmeNo && m.yıl === yıl);

  matchMeas.forEach(m => {
    const isIbreli = getSpeciesType(m.tür) === 'İbreli';
    const volume = m.m3 > 0 ? m.m3 : (m.ster * 0.75); // 1 Ster = 0.75 m3 Formülü

    // Ürün çeşitlerine göre grupla
    if (m.cins === 'Tomruk') {
      result.tomrukAdet += m.adet || 0;
      result.tomrukM3 += m.m3 || 0;
    } else if (m.cins === 'Tel Direk') {
      result.telDirekAdet += m.adet || 0;
      result.telDirekM3 += m.m3 || 0;
    } else if (m.cins === 'Maden Direk') {
      result.madenDirekAdet += m.adet || 0;
      result.madenDirekM3 += m.m3 || 0;
    } else if (m.cins === 'Kağıtlık Odun') {
      result.kağıtlıkAdet += m.adet || 0;
      result.kağıtlıkM3 += m.m3 || 0;
    } else if (m.cins === 'İbr. Kab. Kağ.') {
      result.ibrKabKağSter += m.ster || 0;
    } else if (m.cins === 'İbr. Lif') {
      result.ibrLifSter += m.ster || 0;
    } else if (m.cins === 'Yap. Lif') {
      result.yapLifSter += m.ster || 0;
    } else if (m.cins === 'Yap. Yak.') {
      result.yapYakSter += m.ster || 0;
    } else if (m.cins === 'Sırık') {
      result.sırıkSter += m.ster || 0;
    }

    // Ağaç türü toplam hacmine ekle
    if (isIbreli) {
      result.ibreliM3 += volume;
    } else {
      result.yapraklıM3 += volume;
    }
  });

  result.toplamM3 = result.ibreliM3 + result.yapraklıM3;
  return result;
}

// Tarih Kalan Süre Hesaplama
function getSözleşmeDurumu(comp) {
  if (!comp.sözleşmeBaşlangıç || !comp.sözleşmeBitiş) {
    return { text: 'Tarih Belirtilmemiş', class: 'badge-neutral', kalanGün: null };
  }

  // Şu anki yerel zaman
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(comp.sözleşmeBaşlangıç);
  const end = comp.ekSüreBitiş ? new Date(comp.ekSüreBitiş) : new Date(comp.sözleşmeBitiş);
  
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);

  if (comp.durum === 'Bitti') {
    return { text: 'Sözleşme Tamamlandı', class: 'badge-success', kalanGün: 0 };
  }

  if (today < start) {
    return { text: 'Henüz Başlamadı', class: 'badge-neutral', kalanGün: null };
  }

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Süre Aşıldı (${Math.abs(diffDays)} gün)`, class: 'badge-danger', kalanGün: diffDays };
  } else if (diffDays <= 15) {
    return { text: `Son ${diffDays} Gün!`, class: 'badge-warning', kalanGün: diffDays };
  } else {
    return { text: `${diffDays} Gün Kaldı`, class: 'badge-info', kalanGün: diffDays };
  }
}

// ==========================================
// ARAYÜZ ÇİZİM İŞLEMLERİ ( Render Functions )
// ==========================================

function renderAll() {
  renderDashboard();
  renderCompartmentsTable();
  renderMeasurementsTable();
  renderRampaTable();
  renderRampaSummary();
  renderSeflikComps();
  // Lucide ikonlarını yükle
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 1. GÖSTERGE PANELİ (Dashboard)
function renderDashboard() {
  const filteredCompartments = state.compartments.filter(c => c.yıl === state.selectedYear);
  
  // Sayısal özetler
  const totalComps = filteredCompartments.length;
  const completedComps = filteredCompartments.filter(c => c.durum === 'Bitti').length;
  const activeComps = filteredCompartments.filter(c => c.durum === 'Devam Ediyor').length;

  let totalPlanM3 = 0;
  let totalRealizedM3 = 0;

  filteredCompartments.forEach(c => {
    totalPlanM3 += (c.planİbreli || 0) + (c.planYapraklı || 0);
    const realized = getCompartmentRealized(c.bölmeNo, c.yıl);
    totalRealizedM3 += realized.toplamM3;
  });

  const totalPercent = totalPlanM3 > 0 ? (totalRealizedM3 / totalPlanM3) * 100 : 0;

  // Rampada bekleyen ster hesabı
  const waitingSter = state.rampaStacks
    .filter(item => item.yıl === state.selectedYear && !item.kalktı)
    .reduce((sum, item) => sum + item.ster, 0);

  // Widget değerlerini yaz
  document.getElementById('widgetTotalComps').innerText = totalComps;
  document.getElementById('widgetCompletedComps').innerText = completedComps;
  document.getElementById('widgetActiveComps').innerText = activeComps;
  document.getElementById('widgetTotalPlan').innerText = totalPlanM3.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' m³';
  document.getElementById('widgetTotalRealized').innerText = totalRealizedM3.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' m³';
  document.getElementById('widgetOverallProgress').innerText = `%${totalPercent.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  
  const rampaWaitingEl = document.getElementById('widgetRampaWaiting');
  if (rampaWaitingEl) {
    rampaWaitingEl.innerText = waitingSter.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' Ster';
  }
  
  // Dashboard İlerleme Çubuğu
  const progressBg = document.getElementById('dashboardProgressBar');
  if (progressBg) {
    progressBg.style.width = `${Math.min(totalPercent, 100)}%`;
    if (totalPercent >= 90) progressBg.className = 'progress-bar-fill progress-green';
    else if (totalPercent >= 40) progressBg.className = 'progress-bar-fill progress-amber';
    else progressBg.className = 'progress-bar-fill progress-red';
  }

  // Bölme Üretim Durum Haritası Kartlarını Çiz
  renderCompartmentGrid(filteredCompartments);

  // Uyarı Kutuları (Sözleşmesi Yaklaşanlar ve Gecikenler)
  renderDashboardAlerts(filteredCompartments);

  // Yüklenici Performans Raporunu Çiz
  renderContractorPerformance(filteredCompartments);

  // Grafikleri Güncelle (chartsv2.js tetikle)
  if (window.updateDashboardCharts) {
    window.updateDashboardCharts(state.compartments, state.measurements, state.selectedYear, state.isProgrami);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Bölme Üretim Durum Haritası Kartlarını Çizen Yardımcı Fonksiyon
function renderCompartmentGrid(filteredCompartments) {
  const gridContainer = document.getElementById('compartmentGrid');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  if (filteredCompartments.length === 0) {
    gridContainer.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.85rem; padding: 1rem 0;">Seçilen yıla ait kayıtlı bölme bulunamadı.</div>';
    return;
  }

  // Bölme numaralarına göre sırala (Örn: 13, 13a, 23, 40...)
  const sortedComps = [...filteredCompartments].sort((a, b) => {
    return a.bölmeNo.localeCompare(b.bölmeNo, undefined, { numeric: true, sensitivity: 'base' });
  });

  sortedComps.forEach(c => {
    const realized = getCompartmentRealized(c.bölmeNo, c.yıl);
    const planTotal = (c.planİbreli || 0) + (c.planYapraklı || 0);
    const pctTotal = planTotal > 0 ? (realized.toplamM3 / planTotal) * 100 : 0;

    // Yüzde ve duruma göre renk belirle
    let cardBg = '#ea5455'; // Kritik (<%40) - Kırmızı
    let textCol = '#ffffff';

    if (c.durum === 'Bitti') {
      cardBg = 'var(--primary)'; // Tamamlandı - Koyu Yeşil
    } else if (pctTotal >= 80) {
      cardBg = '#22c55e'; // İyi - Yeşil
    } else if (pctTotal >= 40) {
      cardBg = '#f59e0b'; // Orta - Amber
    }

    const statusDetails = getSözleşmeDurumu(c);

    const card = document.createElement('div');
    card.className = 'comp-card';
    card.style.backgroundColor = cardBg;
    card.style.color = textCol;

    card.innerHTML = `
      <span style="font-size: 1.4rem; font-weight: 800;">${c.bölmeNo}</span>
      <span style="font-size: 0.9rem; font-weight: 600; opacity: 0.95;">%${Math.round(pctTotal)}</span>
      
      <div class="tooltip">
        <div class="tooltip-title">Bölme ${c.bölmeNo} Detayları</div>
        <div style="margin-bottom: 2px;"><b>Üretim Yılı:</b> ${c.yıl}</div>
        <div style="margin-bottom: 2px;"><b>Durum:</b> ${c.durum}</div>
        <div style="margin-bottom: 2px;"><b>Üretim Şekli:</b> ${c.şekil}</div>
        <div style="margin-bottom: 2px;"><b>Kesim Nevi:</b> ${c.nevi}</div>
        <div style="margin-bottom: 2px;"><b>Planlanan:</b> ${planTotal.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} m³</div>
        <div style="margin-bottom: 2px;"><b>Ölçülen:</b> ${realized.toplamM3.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} m³</div>
        <div style="margin-bottom: 2px;"><b>Oran:</b> %${Math.round(pctTotal)}</div>
        <div style="margin-bottom: 2px;"><b>Yüklenici:</b> ${c.yüklenici || 'Belirtilmedi'}</div>
        <div><b>Sözleşme:</b> ${statusDetails.text}</div>
      </div>
    `;

    // Kartın üzerine tıklandığında düzenleme modalını aç (kullanıcıya ek kolaylık!)
    card.addEventListener('click', () => {
      openCompartmentDetail(c.bölmeNo, c.yıl);
    });

    gridContainer.appendChild(card);
  });
}

// Gösterge Paneli Bildirimler / Uyarılar
function renderDashboardAlerts(filteredCompartments) {
  const alertContainer = document.getElementById('dashboardAlerts');
  if (!alertContainer) return;

  alertContainer.innerHTML = '';
  const warnings = [];

  filteredCompartments.forEach(c => {
    const status = getSözleşmeDurumu(c);
    if (c.durum !== 'Bitti' && status.kalanGün !== null) {
      if (status.kalanGün < 0) {
        warnings.push({
          type: 'danger',
          text: `<b>Bölme ${c.bölmeNo}</b> sözleşme süresini <b>${Math.abs(status.kalanGün)} gün</b> aştı! (Süre Bitiş: ${formatTurkishDate(c.ekSüreBitiş || c.sözleşmeBitiş)})`
        });
      } else if (status.kalanGün <= 15) {
        warnings.push({
          type: 'warning',
          text: `<b>Bölme ${c.bölmeNo}</b> sözleşmesinin bitmesine son <b>${status.kalanGün} gün</b> kaldı!`
        });
      }
    }
  });

  if (warnings.length === 0) {
    alertContainer.innerHTML = `
      <div class="alert-box warning" style="background-color: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.2); color: var(--primary);">
        <i data-lucide="check-circle"></i>
        <span>Sözleşme süreleri ve üretimler yolunda! Süresi dolan veya geciken bölme bulunmuyor.</span>
      </div>
    `;
    return;
  }

  warnings.forEach(w => {
    const box = document.createElement('div');
    box.className = `alert-box ${w.type === 'danger' ? '' : 'warning'}`;
    box.innerHTML = `
      <i data-lucide="alert-triangle"></i>
      <span>${w.text}</span>
    `;
    alertContainer.appendChild(box);
  });
}

// Yüklenici Performans Raporunu Çizen Fonksiyon
function renderContractorPerformance(filteredCompartments) {
  const tbody = document.getElementById('contractorPerformanceTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  // 1. Verileri toplayalım ve Yüklenici + Bölme No'ya göre sıralayalım
  const rowsData = [];

  filteredCompartments.forEach(c => {
    const contractorName = c.yüklenici ? c.yüklenici.trim() : 'Belirtilmedi';
    const planTotal = (c.planİbreli || 0) + (c.planYapraklı || 0);
    const realized = getCompartmentRealized(c.bölmeNo, c.yıl);
    const progressPct = planTotal > 0 ? (realized.toplamM3 / planTotal) * 100 : 0;

    // Verilen Süre (Ek Süre Hariç)
    let originalDurationDays = 0;
    if (c.sözleşmeBaşlangıç && c.sözleşmeBitiş) {
      const start = new Date(c.sözleşmeBaşlangıç);
      const end = new Date(c.sözleşmeBitiş);
      const diff = end - start;
      if (diff > 0) {
        originalDurationDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }
    }

    // Bu bölmedeki en çok üretilen emval türü ve cinsi hesabı
    const speciesStats = {};
    const assortmentStats = {};

    state.measurements.filter(m => m.bölmeNo === c.bölmeNo && m.yıl === c.yıl).forEach(m => {
      const volume = m.m3 > 0 ? m.m3 : ((m.ster || 0) * 0.75);
      if (volume > 0) {
        const type = getSpeciesType(m.tür);
        speciesStats[type] = (speciesStats[type] || 0) + volume;

        const cins = m.cins;
        assortmentStats[cins] = (assortmentStats[cins] || 0) + volume;
      }
    });

    let maxSpecies = '-';
    let maxSpeciesVal = 0;
    for (const [sp, val] of Object.entries(speciesStats)) {
      if (val > maxSpeciesVal) {
        maxSpeciesVal = val;
        maxSpecies = sp;
      }
    }

    let maxAssortment = '-';
    let maxAssortmentVal = 0;
    for (const [as, val] of Object.entries(assortmentStats)) {
      if (val > maxAssortmentVal) {
        maxAssortmentVal = val;
        maxAssortment = as;
      }
    }

    const status = getSözleşmeDurumu(c);
    let delayDays = 0;
    if (c.durum !== 'Bitti' && status.kalanGün !== null && status.kalanGün < 0) {
      delayDays = Math.abs(status.kalanGün);
    }

    rowsData.push({
      contractorName,
      bölmeNo: c.bölmeNo,
      durum: c.durum,
      planTotal,
      realizedTotal: realized.toplamM3,
      progressPct,
      originalDurationDays,
      extDays: c.ekSüreGün || 0,
      delayDays,
      maxSpecies,
      maxAssortment,
      status,
      speciesStats,
      assortmentStats
    });
  });

  if (rowsData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Kayıtlı yüklenici verisi bulunamadı.</td></tr>`;
    return;
  }

  // Sıralama: Yüklenici ismine göre alfabetik, ardından bölme numarasına göre sayısal/alfabetik
  rowsData.sort((a, b) => {
    if (a.contractorName !== b.contractorName) {
      return a.contractorName.localeCompare(b.contractorName, 'tr');
    }
    return a.bölmeNo.localeCompare(b.bölmeNo, undefined, { numeric: true });
  });

  // Tablo Satırlarını ve Yüklenici Toplamlarını Oluştur
  let currentContractor = null;
  let contractorPlan = 0;
  let contractorRealized = 0;
  let contractorDuration = 0;
  let contractorExt = 0;
  let contractorMaxDelay = 0;
  let contractorAllCompleted = true;
  let contractorSpeciesStats = {};
  let contractorAssortmentStats = {};
  let contractorCompartmentCount = 0;

  function renderContractorSubtotal(name) {
    if (contractorCompartmentCount === 0) return;
    const progressPct = contractorPlan > 0 ? (contractorRealized / contractorPlan) * 100 : 0;
    
    // Yüklenici için ağırlıklı üretilen emval türü ve cinsi hesabı
    let maxSp = '-';
    let maxSpVal = 0;
    for (const [sp, val] of Object.entries(contractorSpeciesStats)) {
      if (val > maxSpVal) {
        maxSpVal = val;
        maxSp = sp;
      }
    }
    let maxAs = '-';
    let maxAsVal = 0;
    for (const [as, val] of Object.entries(contractorAssortmentStats)) {
      if (val > maxAsVal) {
        maxAsVal = val;
        maxAs = as;
      }
    }
    const spBadgeClass = maxSp === 'İbreli' ? 'badge-success' : (maxSp === 'Yapraklı' ? 'badge-warning' : 'badge-neutral');

    // Yüklenici Performans derecesi
    let statusText = 'Normal 👍';
    let badgeClass = 'badge-info';
    if (contractorMaxDelay > 0) {
      if (contractorMaxDelay > 15) {
        statusText = `Süre Aşımı (${contractorMaxDelay} gün) 🚨`;
        badgeClass = 'badge-danger';
      } else {
        statusText = `Gecikmeli (${contractorMaxDelay} gün) ⚠️`;
        badgeClass = 'badge-warning';
      }
    } else if (contractorAllCompleted) {
      statusText = 'Tamamlandı 🎯';
      badgeClass = 'badge-success';
    } else if (progressPct >= 90) {
      statusText = 'Yüksek İlerleme ⭐';
      badgeClass = 'badge-success';
    }

    const tr = document.createElement('tr');
    tr.className = 'contractor-total-row';
    tr.innerHTML = `
      <td style="text-align: left; padding-left: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.4rem;" class="contractor-title">
          <i data-lucide="users" style="width: 14px;"></i>
          <span>${name} Toplamı</span>
        </div>
      </td>
      <td style="text-align: center; color: var(--text-light); font-weight: normal;">-</td>
      <td style="text-align: center; color: var(--text-light); font-weight: normal;">-</td>
      <td class="excel-cell-number" style="text-align: right;">${contractorPlan.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m³</td>
      <td class="excel-cell-number realized-cell" style="text-align: right;">${contractorRealized.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m³</td>
      <td>
        <div class="progress-container" style="justify-content: flex-start;">
          <div class="progress-bar-bg" style="height: 6px; background-color: var(--border-color); flex-grow: 1; min-width: 80px;">
            <div class="progress-bar-fill ${progressPct >= 90 ? 'progress-green' : (progressPct >= 40 ? 'progress-amber' : 'progress-red')}" style="width: ${Math.min(progressPct, 100)}%;"></div>
          </div>
          <span class="progress-text" style="font-size: 0.75rem; font-weight: 700; min-width: 35px; text-align: right; display: inline-block; margin-left: 0.25rem;">%${Math.round(progressPct)}</span>
        </div>
      </td>
      <td style="text-align: center; color: var(--text-primary);">
        ${contractorDuration > 0 ? `${contractorDuration} Gün` : '-'}
      </td>
      <td style="text-align: center;" class="${contractorExt > 0 ? 'accent-blue-text' : ''}">
        ${contractorExt > 0 ? `${contractorExt} Gün` : '-'}
      </td>
      <td style="text-align: left;">
        ${contractorRealized > 0 ? `
          <div style="display: inline-flex; align-items: center; gap: 0.3rem;">
            <span class="badge ${spBadgeClass}" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; font-weight: 700;">${maxSp}</span>
            <span style="font-weight: 600; color: var(--text-primary); font-size: 0.8rem;">${maxAs}</span>
          </div>
        ` : '<span style="color: var(--text-light);">-</span>'}
      </td>
      <td style="text-align: center;">
        <span class="badge ${badgeClass}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem; font-weight: 700;">${statusText}</span>
      </td>
    `;
    tbody.appendChild(tr);
  }

  let lastContractor = '';

  rowsData.forEach(row => {
    // Yüklenici değiştiğinde önceki yüklenicinin toplam satırını ekle
    if (row.contractorName !== currentContractor) {
      if (currentContractor !== null) {
        renderContractorSubtotal(currentContractor);
      }
      currentContractor = row.contractorName;
      contractorPlan = 0;
      contractorRealized = 0;
      contractorDuration = 0;
      contractorExt = 0;
      contractorMaxDelay = 0;
      contractorAllCompleted = true;
      contractorSpeciesStats = {};
      contractorAssortmentStats = {};
      contractorCompartmentCount = 0;
      lastContractor = ''; // Yeni yüklenici bloğunun ilk satırında isim göstermek için sıfırla
    }

    // Yüklenici istatistiklerini biriktir
    contractorPlan += row.planTotal;
    contractorRealized += row.realizedTotal;
    contractorDuration += row.originalDurationDays;
    contractorExt += row.extDays;
    if (row.delayDays > contractorMaxDelay) {
      contractorMaxDelay = row.delayDays;
    }
    if (row.durum !== 'Bitti') {
      contractorAllCompleted = false;
    }
    if (row.speciesStats) {
      for (const [sp, val] of Object.entries(row.speciesStats)) {
        contractorSpeciesStats[sp] = (contractorSpeciesStats[sp] || 0) + val;
      }
    }
    if (row.assortmentStats) {
      for (const [as, val] of Object.entries(row.assortmentStats)) {
        contractorAssortmentStats[as] = (contractorAssortmentStats[as] || 0) + val;
      }
    }
    contractorCompartmentCount++;

    const showContractor = row.contractorName !== lastContractor;
    lastContractor = row.contractorName;

    // Durum / Performans derecesi
    let statusText = 'Normal 👍';
    let badgeClass = 'badge-info';

    if (row.delayDays > 0) {
      if (row.delayDays > 15) {
        statusText = `Süre Aşımı (${row.delayDays} gün) 🚨`;
        badgeClass = 'badge-danger';
      } else {
        statusText = `Gecikmeli (${row.delayDays} gün) ⚠️`;
        badgeClass = 'badge-warning';
      }
    } else if (row.durum === 'Bitti') {
      statusText = 'Tamamlandı 🎯';
      badgeClass = 'badge-success';
    } else if (row.progressPct >= 90) {
      statusText = 'Yüksek İlerleme ⭐';
      badgeClass = 'badge-success';
    }

    const spBadgeClass = row.maxSpecies === 'İbreli' ? 'badge-success' : (row.maxSpecies === 'Yapraklı' ? 'badge-warning' : 'badge-neutral');

    // Bölme Durumu badge rengi
    let compStatusClass = 'badge-neutral';
    if (row.durum === 'Bitti') compStatusClass = 'badge-success';
    else if (row.durum === 'Devam Ediyor') compStatusClass = 'badge-info';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: left; font-weight: 700; color: var(--text-primary);">
        ${showContractor ? `
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <i data-lucide="user" style="width: 14px; color: var(--primary);"></i>
            <span>${row.contractorName}</span>
          </div>
        ` : `
          <span style="color: var(--text-light); font-size: 0.78rem; font-weight: 500; padding-left: 1.25rem;">↳ aynı yüklenici</span>
        `}
      </td>
      <td style="text-align: center; font-family: monospace; font-weight: 700;">Bölme ${row.bölmeNo}</td>
      <td style="text-align: center;">
        <span class="badge ${compStatusClass}" style="font-size: 0.75rem; font-weight: 600;">${row.durum}</span>
      </td>
      <td class="excel-cell-number" style="text-align: right;">${row.planTotal.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m³</td>
      <td class="excel-cell-number bold-row" style="text-align: right; color: var(--text-success);">${row.realizedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m³</td>
      <td>
        <div class="progress-container" style="justify-content: flex-start;">
          <div class="progress-bar-bg" style="height: 6px; background-color: var(--border-color); flex-grow: 1; min-width: 80px;">
            <div class="progress-bar-fill ${row.progressPct >= 90 ? 'progress-green' : (row.progressPct >= 40 ? 'progress-amber' : 'progress-red')}" style="width: ${Math.min(row.progressPct, 100)}%;"></div>
          </div>
          <span class="progress-text" style="font-size: 0.75rem; font-weight: 700; min-width: 35px; text-align: right; display: inline-block; margin-left: 0.25rem;">%${Math.round(row.progressPct)}</span>
        </div>
      </td>
      <td style="text-align: center; font-weight: 600; color: var(--text-primary);">
        ${row.originalDurationDays > 0 ? `${row.originalDurationDays} Gün` : '-'}
      </td>
      <td style="text-align: center; font-weight: ${row.extDays > 0 ? '700' : 'normal'};" class="${row.extDays > 0 ? 'accent-blue-text' : ''}">
        ${row.extDays > 0 ? `${row.extDays} Gün` : '-'}
      </td>
      <td style="text-align: left;">
        ${row.realizedTotal > 0 ? `
          <div style="display: inline-flex; align-items: center; gap: 0.3rem;">
            <span class="badge ${spBadgeClass}" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; font-weight: 700;">${row.maxSpecies}</span>
            <span style="font-weight: 600; color: var(--text-primary); font-size: 0.8rem;">${row.maxAssortment}</span>
          </div>
        ` : '<span style="color: var(--text-light);">-</span>'}
      </td>
      <td style="text-align: center;">
        <span class="badge ${badgeClass}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem; font-weight: 700;">${statusText}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // En son yüklenici için de toplam satırı ekle
  if (currentContractor !== null) {
    renderContractorSubtotal(currentContractor);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 2. BÖLMELER LİSTESİ VE TABLOSU
function renderCompartmentsTable() {
  const tbody = document.getElementById('compartmentsTableBody');
  if (!tbody) return;

  // Hücre içindeki oranları sağa hizalarken sütun hizalamasını bozmamak için fixed-width spacer helper
  const getRealCellHtml = (realVal, planVal, pctVal, customStyle = '') => {
    const numText = realVal.toLocaleString('tr-TR', { minimumFractionDigits: 3 });
    const style = customStyle || 'color: var(--text-neutral-pct); font-weight: 600;';
    
    let displayPct = pctVal;
    if (planVal === 0) {
      displayPct = realVal > 0 ? 100 : 0;
    }
    
    return `${numText}<span style="display: inline-block; width: 58px; text-align: right; font-size: 0.88rem; font-weight: 600; margin-left: 6px; ${style}">(%${Math.round(displayPct)})</span>`;
  };

  const searchQuery = document.getElementById('compSearch').value.toLowerCase();
  const statusFilter = document.getElementById('compStatusFilter').value;

  // Filtreleme
  let filtered = state.compartments.filter(c => c.yıl === state.selectedYear);

  if (searchQuery) {
    filtered = filtered.filter(c => 
      c.bölmeNo.toLowerCase().includes(searchQuery) ||
      (c.yüklenici && c.yüklenici.toLowerCase().includes(searchQuery))
    );
  }

  if (statusFilter !== 'all') {
    filtered = filtered.filter(c => c.durum === statusFilter);
  }

  // HTML Üret
  tbody.innerHTML = '';
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="15" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aradığınız kriterlere uygun bölme kaydı bulunamadı.</td></tr>`;
    return;
  }

  // Toplam Satırı İçin Sayaçlar
  let sumPlanIbreli = 0;
  let sumPlanYaprak = 0;
  let sumPlanTotal = 0;
  let sumRealIbreli = 0;
  let sumRealYaprak = 0;
  let sumRealTotal = 0;

  filtered.forEach(c => {
    const realized = getCompartmentRealized(c.bölmeNo, c.yıl);
    
    const planIbreli = c.planİbreli || 0;
    const planYaprak = c.planYapraklı || 0;
    const planTotal = planIbreli + planYaprak;

    const realIbreli = realized.ibreliM3;
    const realYaprak = realized.yapraklıM3;
    const realTotal = realized.toplamM3;

    // Yıllık toplamlar için ekle
    sumPlanIbreli += planIbreli;
    sumPlanYaprak += planYaprak;
    sumPlanTotal += planTotal;
    sumRealIbreli += realIbreli;
    sumRealYaprak += realYaprak;
    sumRealTotal += realTotal;

    // Yüzdeler
    const pctIbreli = planIbreli > 0 ? (realIbreli / planIbreli) * 100 : 0;
    const pctYaprak = planYaprak > 0 ? (realYaprak / planYaprak) * 100 : 0;
    const pctTotal = planTotal > 0 ? (realTotal / planTotal) * 100 : 0;

    const wordSözleşme = getSözleşmeDurumu(c);
    
    // İlerleme çubuğu rengi
    let progressClass = 'progress-green';
    if (pctTotal < 40) progressClass = 'progress-red';
    else if (pctTotal < 80) progressClass = 'progress-amber';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-edit" style="padding: 0.3rem 0.5rem;" onclick="openCompartmentDetail('${c.bölmeNo}', ${c.yıl})" title="Görüntüle/Düzenle">
            <i data-lucide="edit-2" style="font-size: 0.8rem; width: 14px;"></i>
          </button>
          <button class="btn btn-danger" style="padding: 0.3rem 0.5rem;" onclick="deleteCompartment('${c.id}')" title="Sil">
            <i data-lucide="trash" style="font-size: 0.8rem; width: 14px;"></i>
          </button>
        </div>
      </td>
      <td class="bold-row" style="text-align: center;">${c.bölmeNo}</td>
      <td style="text-align: center;">
        <span class="badge ${c.durum === 'Bitti' ? 'badge-success' : (c.durum === 'Devam Ediyor' ? 'badge-info' : 'badge-warning')}">
          ${c.durum}
        </span>
      </td>
      <td style="text-align: center;">${c.şekil}</td>
      <td style="text-align: center;">${c.nevi}</td>
      <td class="excel-cell-number">${planIbreli.toLocaleString('tr-TR', { minimumFractionDigits: 3 })}</td>
      <td class="excel-cell-number">${planYaprak.toLocaleString('tr-TR', { minimumFractionDigits: 3 })}</td>
      <td class="excel-cell-number bold-row">${planTotal.toLocaleString('tr-TR', { minimumFractionDigits: 3 })}</td>
      
      <td class="excel-cell-number" style="text-align: center;">${getRealCellHtml(realIbreli, planIbreli, pctIbreli)}</td>
      <td class="excel-cell-number" style="text-align: center;">${getRealCellHtml(realYaprak, planYaprak, pctYaprak)}</td>
      <td class="excel-cell-number bold-row" style="text-align: center;">${getRealCellHtml(realTotal, planTotal, pctTotal, `color: ${pctTotal >= 90 ? 'var(--text-success)' : (pctTotal >= 40 ? 'var(--text-warning)' : 'var(--text-danger)')}; font-weight: 700;`)}</td>
      
      <td>${c.yüklenici || '-'}</td>
      <td>
        <div style="font-size: 0.75rem;">
          <b>Bşl:</b> ${formatTurkishDate(c.sözleşmeBaşlangıç)}<br>
          <b>Bit:</b> ${formatTurkishDate(c.sözleşmeBitiş)}
        </div>
      </td>
      <td>
        <span class="badge ${wordSözleşme.class}">${wordSözleşme.text}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Toplam Satırını Ekle (Excel görünümündeki gibi)
  const sumPctIbreli = sumPlanIbreli > 0 ? (sumRealIbreli / sumPlanIbreli) * 100 : 0;
  const sumPctYaprak = sumPlanYaprak > 0 ? (sumRealYaprak / sumPlanYaprak) * 100 : 0;
  const sumPctTotal = sumPlanTotal > 0 ? (sumRealTotal / sumPlanTotal) * 100 : 0;

  const totalTr = document.createElement('tr');
  totalTr.className = 'bold-row';
  totalTr.style.borderTop = '2px solid var(--text-primary)';
  totalTr.style.backgroundColor = 'var(--bg-active)';
  totalTr.innerHTML = `
    <td colspan="5" style="text-align: right;">TOPLAM / ORTALAMA:</td>
    <td class="excel-cell-number">${sumPlanIbreli.toLocaleString('tr-TR', { minimumFractionDigits: 3 })}</td>
    <td class="excel-cell-number">${sumPlanYaprak.toLocaleString('tr-TR', { minimumFractionDigits: 3 })}</td>
    <td class="excel-cell-number">${sumPlanTotal.toLocaleString('tr-TR', { minimumFractionDigits: 3 })}</td>
    <td class="excel-cell-number" style="text-align: center;">${getRealCellHtml(sumRealIbreli, sumPlanIbreli, sumPctIbreli)}</td>
    <td class="excel-cell-number" style="text-align: center;">${getRealCellHtml(sumRealYaprak, sumPlanYaprak, sumPctYaprak)}</td>
    <td class="excel-cell-number" style="text-align: center;">${getRealCellHtml(sumRealTotal, sumPlanTotal, sumPctTotal, 'color: var(--text-success); font-weight: 700;')}</td>
    <td colspan="3">-</td>
  `;
  tbody.appendChild(totalTr);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 3. ÖLÇÜ TESPİT LİSTESİ VE TABLOSU
function renderMeasurementsTable() {
  const tbody = document.getElementById('measurementsTableBody');
  if (!tbody) return;

  const searchQuery = document.getElementById('measSearch').value.toLowerCase();
  const depoFilter = document.getElementById('measDepoFilter').value;

  // Filtreleme
  let filtered = state.measurements.filter(m => m.yıl === state.selectedYear);

  if (searchQuery) {
    filtered = filtered.filter(m => 
      m.bölmeNo.toLowerCase().includes(searchQuery) ||
      m.tür.toLowerCase().includes(searchQuery) ||
      m.cins.toLowerCase().includes(searchQuery)
    );
  }

  if (depoFilter !== 'all') {
    filtered = filtered.filter(m => m.depo === depoFilter);
  }

  // Tarihe Göre Sırala (Son eklenenler üstte)
  filtered.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

  tbody.innerHTML = '';
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Kayıtlı ölçü tespit verisi bulunamadı.</td></tr>`;
    return;
  }

  // Depo Filtreleme Seçeneklerini Güncelle
  const depos = [...new Set(state.measurements.filter(m => m.yıl === state.selectedYear).map(m => m.depo).filter(Boolean))];
  const select = document.getElementById('measDepoFilter');
  const currentVal = select.value;
  select.innerHTML = '<option value="all">Tüm Depolar</option>';
  depos.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.innerText = d;
    select.appendChild(opt);
  });
  select.value = currentVal;

  // Tablo Satırlarını Oluştur
  filtered.forEach((m, idx) => {
    const isIbreli = getSpeciesType(m.tür) === 'İbreli';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="display: flex; gap: 0.5rem; justify-content: center;">
          <button class="btn btn-edit" style="padding: 0.3rem 0.5rem;" onclick="openMeasurementEdit(${m.id})" title="Düzenle">
            <i data-lucide="edit-2" style="font-size: 0.8rem; width: 14px;"></i>
          </button>
          <button class="btn btn-danger" style="padding: 0.3rem 0.5rem;" onclick="deleteMeasurement(${m.id})" title="Sil">
            <i data-lucide="trash" style="font-size: 0.8rem; width: 14px;"></i>
          </button>
        </div>
      </td>
      <td style="text-align: center; font-family: monospace; font-weight: 600; font-size: 0.9rem;">${filtered.length - idx}</td>
      <td class="bold-row" style="text-align: center;">${m.bölmeNo}</td>
      <td style="text-align: center;">${m.nevi}</td>
      <td style="text-align: center;">
        <span class="badge ${isIbreli ? 'badge-success' : 'badge-warning'}">
          ${m.tür} (${getSpeciesType(m.tür)})
        </span>
      </td>
      <td style="text-align: left;"><b>${m.cins}</b></td>
      <td class="excel-cell-number" style="text-align: center;">${m.adet ? m.adet.toLocaleString('tr-TR') : '-'}</td>
      <td class="excel-cell-number" style="text-align: center;">${m.m3 ? m.m3.toLocaleString('tr-TR', { minimumFractionDigits: 3 }) : '-'}</td>
      <td class="excel-cell-number" style="text-align: center;">${m.ster ? m.ster.toLocaleString('tr-TR') : '-'}</td>
      <td style="text-align: center;">${m.depo}</td>
      <td style="text-align: center;">${formatTurkishDate(m.tarih)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Toplam Satırını Ekle
  let sumAdet = 0;
  let sumM3 = 0;
  let sumSter = 0;

  filtered.forEach(m => {
    sumAdet += m.adet || 0;
    sumM3 += m.m3 || 0;
    sumSter += m.ster || 0;
  });

  const totalTr = document.createElement('tr');
  totalTr.className = 'bold-row';
  totalTr.style.borderTop = '2px solid var(--text-primary)';
  totalTr.style.backgroundColor = 'var(--bg-active)';
  totalTr.innerHTML = `
    <td style="text-align: center;">-</td>
    <td colspan="5" style="text-align: right; padding-right: 1.5rem;">TOPLAM:</td>
    <td class="excel-cell-number" style="text-align: center;">${sumAdet > 0 ? sumAdet.toLocaleString('tr-TR') : '-'}</td>
    <td class="excel-cell-number" style="text-align: center;">${sumM3 > 0 ? sumM3.toLocaleString('tr-TR', { minimumFractionDigits: 3 }) : '-'}</td>
    <td class="excel-cell-number" style="text-align: center;">${sumSter > 0 ? sumSter.toLocaleString('tr-TR') : '-'}</td>
    <td colspan="2" style="text-align: center;">-</td>
  `;
  tbody.appendChild(totalTr);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// MODAL & FORM İŞLEMLERİ ( Modals & Forms )
// ==========================================

function closeModals() {
  document.querySelectorAll('.modal-overlay').forEach(el => {
    el.classList.remove('active');
  });
  state.editingCompartmentId = null;
  state.editingMeasurementId = null;
}

// --- BÖLME MODAL AÇMA ---
function openCompartmentModal(isEdit = false) {
  const modal = document.getElementById('compartmentModal');
  const title = document.getElementById('compModalTitle');
  const form = document.getElementById('compartmentForm');
  
  form.reset();
  
  if (isEdit) {
    title.innerText = `Bölme Düzenle: ${state.editingCompartmentId}`;
    // Mevcut değerleri forma aktar
    const comp = state.compartments.find(c => c.bölmeNo === state.editingCompartmentId && c.yıl === state.selectedYear);
    if (comp) {
      document.getElementById('compNo').value = comp.bölmeNo;
      document.getElementById('compNo').readOnly = true; // Bölme No değiştirilemez (yeni eklemek gerekir)
      document.getElementById('compStatus').value = comp.durum;
      document.getElementById('compMethod').value = comp.şekil;
      document.getElementById('compNevi').value = comp.nevi;
      document.getElementById('compPlanIbreli').value = comp.planİbreli;
      document.getElementById('compPlanYaprak').value = comp.planYapraklı;
      document.getElementById('compContractor').value = comp.yüklenici || '';
      document.getElementById('compStartDate').value = comp.sözleşmeBaşlangıç || '';
      document.getElementById('compEndDate').value = comp.sözleşmeBitiş || '';
      document.getElementById('compExtDays').value = comp.ekSüreGün || 0;
      document.getElementById('compExtEndDate').value = comp.ekSüreBitiş || '';
    }
  } else {
    title.innerText = `${state.selectedYear} Yılına Yeni Bölme Ekle`;
    document.getElementById('compNo').value = '';
    document.getElementById('compNo').readOnly = false;
    document.getElementById('compExtDays').value = 0;
  }

  modal.classList.add('active');
}

// Bölme Detayına Tıklanınca Düzenleme Modunu Aç
function openCompartmentDetail(bölmeNo, yıl) {
  state.editingCompartmentId = bölmeNo;
  // Dashboard veya tablodan tıklandığında seçilen yılı düzelt
  state.selectedYear = yıl;
  document.getElementById('yearSelect').value = yıl;
  openCompartmentModal(true);
}

// Tarihlerden Süre Gün Hesaplama
function calculateDurationDays() {
  const startVal = document.getElementById('compStartDate').value;
  const endVal = document.getElementById('compEndDate').value;
  const targetInput = document.getElementById('compExtEndDate');
  const extDays = parseInt(document.getElementById('compExtDays').value) || 0;

  if (startVal && endVal) {
    const start = new Date(startVal);
    const end = new Date(endVal);
    
    // Ek Süre Sonu Hesaplama
    if (extDays > 0) {
      const extEnd = new Date(end.getTime());
      extEnd.setDate(extEnd.getDate() + extDays);
      targetInput.value = extEnd.toISOString().split('T')[0];
    } else {
      targetInput.value = '';
    }
  }
}

// Ek süre gün değiştiğinde tarihi tekrar hesapla
document.getElementById('compExtDays').addEventListener('input', calculateDurationDays);

// Bölme Kaydetme
function saveCompartmentForm() {
  const bölmeNo = document.getElementById('compNo').value.trim();
  const durum = document.getElementById('compStatus').value;
  const şekil = document.getElementById('compMethod').value;
  const nevi = document.getElementById('compNevi').value;
  const planİbreli = parseFloat(document.getElementById('compPlanIbreli').value) || 0;
  const planYapraklı = parseFloat(document.getElementById('compPlanYaprak').value) || 0;
  const yüklenici = document.getElementById('compContractor').value.trim();
  const sözleşmeBaşlangıç = document.getElementById('compStartDate').value;
  const sözleşmeBitiş = document.getElementById('compEndDate').value;
  const ekSüreGün = parseInt(document.getElementById('compExtDays').value) || 0;
  const ekSüreBitiş = document.getElementById('compExtEndDate').value;

  if (!bölmeNo) {
    showNotification('Lütfen bölme numarasını giriniz.', 'warning');
    return;
  }

  const id = `${state.selectedYear}-${bölmeNo}`;

  if (state.editingCompartmentId) {
    // Düzenleme
    const idx = state.compartments.findIndex(c => c.id === id);
    if (idx !== -1) {
      state.compartments[idx] = {
        ...state.compartments[idx],
        durum, şekil, nevi, planİbreli, planYapraklı, yüklenici, sözleşmeBaşlangıç, sözleşmeBitiş, ekSüreGün, ekSüreBitiş
      };
    }
  } else {
    // Yeni Ekleme
    // Mükerrer Kontrolü
    if (state.compartments.some(c => c.id === id)) {
      showNotification(`Bu bölme numarası (${bölmeNo}) ${state.selectedYear} yılı için zaten kayıtlı!`, 'danger');
      return;
    }

    state.compartments.push({
      id, yıl: state.selectedYear, bölmeNo, durum, şekil, nevi, planİbreli, planYapraklı, yüklenici, sözleşmeBaşlangıç, sözleşmeBitiş, ekSüreGün, ekSüreBitiş
    });
  }

  saveCompartments();
  closeModals();
  renderAll();
}

// Bölme Sil
function deleteCompartment(id) {
  if (confirm('Bu bölmeyi silmek istediğinize emin misiniz? Bölmeye ait ölçü tespit kayıtları silinmeyecektir ancak hesaplamalar güncellenecektir.')) {
    state.compartments = state.compartments.filter(c => c.id !== id);
    saveCompartments();
    renderAll();
  }
}

// --- ÖLÇÜ TESPİT MODAL AÇMA ---
function openMeasurementModal(isEdit = false) {
  const modal = document.getElementById('measurementModal');
  const title = document.getElementById('measModalTitle');
  const form = document.getElementById('measurementForm');
  
  form.reset();

  // Bölme Seçeneklerini Doldur (Şeflik bölmelerine göre)
  const sortedComps = [...state.seflikComps].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    }
    return a.localeCompare(b, 'tr');
  });
  populateCustomDropdown('measCompDropdown', 'measCompNo', sortedComps);

  // Tarihi otomatik doldur (bugünün tarihi)
  document.getElementById('measDate').value = new Date().toISOString().split('T')[0];

  if (isEdit) {
    title.innerText = 'Ölçü Tespit Kaydı Düzenle';
    const meas = state.measurements.find(m => m.id === state.editingMeasurementId);
    if (meas) {
      setCustomDropdownValue('measCompDropdown', 'measCompNo', meas.bölmeNo);
      document.getElementById('measNevi').value = meas.nevi;
      document.getElementById('measSpecies').value = meas.tür;
      document.getElementById('measAssortment').value = meas.cins;
      document.getElementById('measCount').value = meas.adet || '';
      document.getElementById('measVolume').value = meas.m3 || '';
      document.getElementById('measStere').value = meas.ster || '';
      document.getElementById('measDepo').value = meas.depo || '';
      document.getElementById('measDate').value = meas.tarih || '';
    }
  } else {
    title.innerText = 'Yeni Ölçü Tespit Girişi';
    setCustomDropdownValue('measCompDropdown', 'measCompNo', '');
  }

  modal.classList.add('active');
  toggleMeasurementFields(); // Hacim/Ster alan kilidini ayarla
}

// Ürün Cinsine Göre Adet/m3 ve Ster alanlarını aktif/deaktif et
function toggleMeasurementFields() {
  const cins = document.getElementById('measAssortment').value;
  const countInput = document.getElementById('measCount');
  const volumeInput = document.getElementById('measVolume');
  const stereInput = document.getElementById('measStere');

  // Adet/m3 kullanılan cinsleri state üzerinden dinamik bul
  const assort = state.assortments.find(a => a.name === cins);
  const isVolumeBased = assort ? assort.unit === 'm3' : true;

  if (isVolumeBased) {
    countInput.disabled = false;
    volumeInput.disabled = false;
    stereInput.disabled = true;
    stereInput.value = '';
  } else {
    countInput.disabled = true;
    volumeInput.disabled = true;
    stereInput.disabled = false;
    countInput.value = '';
    volumeInput.value = '';
  }
}

// Cins seçimi değiştiğinde alanları kilitle/aç
document.getElementById('measAssortment').addEventListener('change', toggleMeasurementFields);

function openMeasurementEdit(id) {
  state.editingMeasurementId = id;
  openMeasurementModal(true);
}

// Ölçü Tespit Kaydet
function saveMeasurementForm() {
  const bölmeNo = document.getElementById('measCompNo').value;
  const nevi = document.getElementById('measNevi').value;
  const tür = document.getElementById('measSpecies').value;
  const cins = document.getElementById('measAssortment').value;
  const adet = parseInt(document.getElementById('measCount').value) || 0;
  const m3 = parseFloat(document.getElementById('measVolume').value) || 0;
  const ster = parseFloat(document.getElementById('measStere').value) || 0;
  const depo = document.getElementById('measDepo').value.trim();
  const tarih = document.getElementById('measDate').value;

  if (!bölmeNo) {
    showNotification('Lütfen bir bölme seçiniz.', 'warning');
    return;
  }
  if (!tarih) {
    showNotification('Lütfen tarih seçiniz.', 'warning');
    return;
  }

  if (state.editingMeasurementId) {
    // Düzenleme
    const idx = state.measurements.findIndex(m => m.id === state.editingMeasurementId);
    if (idx !== -1) {
      state.measurements[idx] = {
        ...state.measurements[idx],
        bölmeNo, nevi, tür, cins, adet, m3, ster, depo, tarih
      };
    }
  } else {
    // Yeni Ekleme
    const newId = state.measurements.length > 0 ? Math.max(...state.measurements.map(m => m.id)) + 1 : 1;
    state.measurements.push({
      id: newId, yıl: state.selectedYear, bölmeNo, nevi, tür, cins, adet, m3, ster, depo, tarih
    });
  }

  saveMeasurements();
  closeModals();
  renderAll();
}

// Ölçü Tespit Sil
function deleteMeasurement(id) {
  if (confirm('Bu ölçü tespit kaydını silmek istediğinize emin misiniz?')) {
    state.measurements = state.measurements.filter(m => m.id !== id);
    saveMeasurements();
    renderAll();
  }
}

// ==========================================
// YEDEKLEME VE AYARLAR ( Backup & Settings )
// ==========================================

// JSON Formatında Yedek İndir
function exportJsonBackup() {
  const data = {
    compartments: state.compartments,
    measurements: state.measurements,
    rampaStacks: state.rampaStacks,
    seflikComps: state.seflikComps,
    isProgrami: state.isProgrami,
    seflikConfig: {
      seflikName: state.seflikName,
      species: state.species,
      assortments: state.assortments,
      harvestTypes: state.harvestTypes,
      rampaWoodTypes: state.rampaWoodTypes,
      depolar: state.depolar
    }
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `${state.seflikName}_orman_yedek_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// JSON Yedek Yükleme
function handleJsonImport(e) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      if (data.compartments && data.measurements) {
        state.compartments = data.compartments;
        state.measurements = data.measurements;
        if (data.rampaStacks) {
          state.rampaStacks = data.rampaStacks;
          saveRampaStacks();
        }
        if (data.seflikComps) {
          state.seflikComps = data.seflikComps;
          saveSeflikComps();
        }
        if (data.isProgrami) {
          state.isProgrami = data.isProgrami;
        } else {
          state.isProgrami = JSON.parse(JSON.stringify(window.DEFAULT_IS_PROGRAMI || {}));
        }
        saveSeflikIsProgramiConfig();
        if (data.seflikConfig) {
          state.seflikName = data.seflikConfig.seflikName || 'Koyuncu';
          state.species = data.seflikConfig.species || [];
          state.assortments = data.seflikConfig.assortments || [];
          state.harvestTypes = data.seflikConfig.harvestTypes || [];
          state.rampaWoodTypes = data.seflikConfig.rampaWoodTypes || [];
          state.depolar = data.seflikConfig.depolar || [...(window.DEFAULT_DEPOLAR || [])];
          saveSeflikConfig();
        }
        saveCompartments();
        saveMeasurements();
        showNotification('Yedek başarıyla yüklendi!', 'success');
        applyBranding();
        populateDropdowns();
        renderAll();
        if (state.activeTab === 'seflik') {
          renderSeflikTab();
        }
      } else {
        showNotification('Geçersiz dosya formatı. Lütfen doğru yedek dosyasını yükleyin.', 'danger');
      }
    } catch (err) {
      showNotification('Dosya okunurken bir hata oluştu: ' + err.message, 'danger');
    }
  };
  fileReader.readAsText(e.target.files[0]);
}

// Verileri Sıfırla (Fabrika Ayarları)
function resetDatabase() {
  if (confirm('DİKKAT: Kaydettiğiniz tüm değişiklikler silinecek ve başlangıçtaki örnek veriler geri yüklenecektir. Emin misiniz?')) {
    localStorage.removeItem('ko_compartments');
    localStorage.removeItem('ko_measurements');
    localStorage.removeItem('ko_seflik_config');
    localStorage.removeItem('ko_rampa_stacks');
    localStorage.removeItem('ko_seflik_comps');
    localStorage.removeItem('ko_seflik_is_programi');
    state.compartments = [...window.DEFAULT_COMPARTMENTS];
    state.measurements = [...window.DEFAULT_MEASUREMENTS];
    state.rampaStacks = [...window.DEFAULT_RAMPA_STACKS];
    state.seflikName = window.DEFAULT_SEFLIK_NAME || 'Koyuncu';
    state.species = [...window.DEFAULT_SPECIES];
    state.assortments = [...window.DEFAULT_ASSORTMENTS];
    state.harvestTypes = [...window.DEFAULT_HARVEST_TYPES];
    state.rampaWoodTypes = [...(window.DEFAULT_RAMPA_WOOD_TYPES || [])];
    state.depolar = [...(window.DEFAULT_DEPOLAR || [])];
    state.seflikComps = [...window.DEFAULT_SEFLIK_COMPS];
    state.isProgrami = JSON.parse(JSON.stringify(window.DEFAULT_IS_PROGRAMI || {}));
    saveCompartments();
    saveMeasurements();
    saveRampaStacks();
    saveSeflikConfig();
    saveSeflikComps();
    saveSeflikIsProgramiConfig();
    applyBranding();
    populateDropdowns();
    showNotification('Veritabanı, Şeflik, Rampa ve Aylık İş Programı ayarları sıfırlandı.', 'success');
    renderAll();
    if (state.activeTab === 'seflik') {
      renderSeflikTab();
    }
  }
}

// CSV/Excel Dışa Aktarma
// CSV/Excel Dışa Aktarma (SheetJS ile Gelişmiş Formüllü Excel)
function exportCSV(type) {
  if (typeof XLSX === 'undefined') {
    showNotification('SheetJS kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.', 'danger');
    return;
  }
  
  // Excel Hücresi Oluşturucu Yardımcı Fonksiyon
  function makeCell(val, isHeader = false, isTotal = false, align = 'left', format = null) {
    const cell = {
      v: val,
      t: typeof val === 'number' ? 'n' : 's'
    };

    // Eğer değer '=' ile başlıyorsa formül olarak ayarla
    if (typeof val === 'string' && val.startsWith('=')) {
      cell.t = 'f';
      cell.f = val.substring(1); // '=' işaretini kaldırıp formül dizesini ver
      cell.v = undefined;
    }

    const style = {
      font: {
        name: 'Segoe UI',
        sz: 10,
        color: { rgb: '1E293B' }
      },
      alignment: {
        horizontal: align,
        vertical: 'center'
      },
      border: {
        top: { style: 'thin', color: { rgb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } }
      }
    };

    if (isHeader) {
      style.fill = { fgColor: { rgb: '1B5E20' } }; // Orman Yeşili
      style.font.color = { rgb: 'FFFFFF' };
      style.font.bold = true;
      style.font.sz = 10.5;
      style.alignment.horizontal = 'center';
    } else if (isTotal) {
      style.fill = { fgColor: { rgb: 'E8F4EC' } }; // Açık nane yeşili dolgu
      style.font.bold = true;
      style.font.color = { rgb: '111E1B' };
      style.border.top = { style: 'double', color: { rgb: '1B5E20' } };
      style.border.bottom = { style: 'double', color: { rgb: '1B5E20' } };
    }

    cell.s = style;

    if (format) {
      cell.z = format;
    }

    return cell;
  }

  // Worksheet Oluşturucu Yardımcı Fonksiyon
  function buildSheet(headers, rows, totalRow = null) {
    const sheet = {};
    let maxCol = headers.length - 1;
    let maxRow = rows.length + 1;
    if (totalRow) maxRow++;

    // Başlıkları ekle
    headers.forEach((h, colIdx) => {
      const addr = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      sheet[addr] = makeCell(h.label, true, false, 'center');
    });

    // Veri satırlarını ekle
    rows.forEach((r, rowIdx) => {
      headers.forEach((h, colIdx) => {
        const addr = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        const rawVal = r[h.key];
        sheet[addr] = makeCell(rawVal, false, false, h.align, h.format);
      });
    });

    // Eğer varsa toplam satırını ekle
    if (totalRow) {
      headers.forEach((h, colIdx) => {
        const addr = XLSX.utils.encode_cell({ r: maxRow - 1, c: colIdx });
        const rawVal = totalRow[h.key];
        sheet[addr] = makeCell(rawVal, false, true, h.align, h.format);
      });
    }

    // !ref (veri aralığı) belirle
    sheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: maxRow - 1, c: maxCol }
    });

    // !cols (sütun genişlikleri) belirle
    sheet['!cols'] = headers.map(h => ({ wch: h.width || 12 }));

    return sheet;
  }

  const wb = XLSX.utils.book_new();
  let filename = '';

  if (type === 'compartments') {
    filename = `${state.seflikName}_bölmeler_${state.selectedYear}.xlsx`;
    
    const headers = [
      { label: 'Bölme No', key: 'bölmeNo', align: 'center', width: 12 },
      { label: 'Üretim Yılı', key: 'yıl', align: 'center', width: 12 },
      { label: 'Durum', key: 'durum', align: 'center', width: 15 },
      { label: 'Üretim Şekli', key: 'şekil', align: 'center', width: 15 },
      { label: 'Kesim Nevi', key: 'nevi', align: 'center', width: 18 },
      { label: 'Plan İbreli (m³)', key: 'planİbreli', align: 'right', format: '#,##0.0', width: 16 },
      { label: 'Plan Yapraklı (m³)', key: 'planYapraklı', align: 'right', format: '#,##0.0', width: 16 },
      { label: 'Plan Toplam (m³)', key: 'planToplam', align: 'right', format: '#,##0.0', width: 16 },
      { label: 'Gerçekleşen İbreli (m³)', key: 'realİbreli', align: 'right', format: '#,##0.0', width: 20 },
      { label: 'Gerçekleşen Yapraklı (m³)', key: 'realYapraklı', align: 'right', format: '#,##0.0', width: 20 },
      { label: 'Gerçekleşen Toplam (m³)', key: 'realToplam', align: 'right', format: '#,##0.0', width: 20 },
      { label: 'İbreli Oran %', key: 'pctIbreli', align: 'right', format: '0.0%', width: 14 },
      { label: 'Yapraklı Oran %', key: 'pctYapraklı', align: 'right', format: '0.0%', width: 14 },
      { label: 'Toplam Oran %', key: 'pctToplam', align: 'right', format: '0.0%', width: 14 },
      { label: 'Yüklenici', key: 'yüklenici', align: 'left', width: 22 },
      { label: 'Başlangıç', key: 'sözleşmeBaşlangıç', align: 'center', width: 14 },
      { label: 'Bitiş', key: 'sözleşmeBitiş', align: 'center', width: 14 },
      { label: 'Ek Süre (Gün)', key: 'ekSüreGün', align: 'center', format: '#,##0', width: 14 },
      { label: 'Ek Süre Bitiş', key: 'ekSüreBitiş', align: 'center', width: 14 }
    ];

    const list = state.compartments.filter(c => c.yıl === state.selectedYear);
    const rows = list.map((c, idx) => {
      const real = getCompartmentRealized(c.bölmeNo, c.yıl);
      const rowNum = idx + 2; // Excel veri satırı (1 tabanlı, başlık 1. satırda)

      return {
        bölmeNo: `Bölme ${c.bölmeNo}`,
        yıl: c.yıl,
        durum: c.durum,
        şekil: c.şekil || '-',
        nevi: c.nevi || '-',
        planİbreli: c.planİbreli || 0,
        planYapraklı: c.planYapraklı || 0,
        planToplam: `=F${rowNum}+G${rowNum}`,
        realİbreli: real.ibreliM3 || 0,
        realYapraklı: real.yapraklıM3 || 0,
        realToplam: `=I${rowNum}+J${rowNum}`,
        pctIbreli: `=IF(F${rowNum}>0,I${rowNum}/F${rowNum},0)`,
        pctYapraklı: `=IF(G${rowNum}>0,J${rowNum}/G${rowNum},0)`,
        pctToplam: `=IF(H${rowNum}>0,K${rowNum}/H${rowNum},0)`,
        yüklenici: c.yüklenici || '-',
        sözleşmeBaşlangıç: formatTurkishDate(c.sözleşmeBaşlangıç),
        sözleşmeBitiş: formatTurkishDate(c.sözleşmeBitiş),
        ekSüreGün: c.ekSüreGün || 0,
        ekSüreBitiş: formatTurkishDate(c.ekSüreBitiş)
      };
    });

    const totalRowIndex = rows.length + 2; // Toplam Satırının Excel Satır İndeksi
    const lastRowIndex = rows.length + 1;  // Verinin Bittiği Son Satır İndeksi

    const totalRow = {
      bölmeNo: 'TOPLAM',
      yıl: '-',
      durum: '-',
      şekil: '-',
      nevi: '-',
      planİbreli: `=SUM(F2:F${lastRowIndex})`,
      planYapraklı: `=SUM(G2:G${lastRowIndex})`,
      planToplam: `=SUM(H2:H${lastRowIndex})`,
      realİbreli: `=SUM(I2:I${lastRowIndex})`,
      realYapraklı: `=SUM(J2:J${lastRowIndex})`,
      realToplam: `=SUM(K2:K${lastRowIndex})`,
      pctIbreli: `=IF(F${totalRowIndex}>0,I${totalRowIndex}/F${totalRowIndex},0)`,
      pctYapraklı: `=IF(G${totalRowIndex}>0,J${totalRowIndex}/G${totalRowIndex},0)`,
      pctToplam: `=IF(H${totalRowIndex}>0,K${totalRowIndex}/H${totalRowIndex},0)`,
      yüklenici: '-',
      sözleşmeBaşlangıç: '-',
      sözleşmeBitiş: '-',
      ekSüreGün: `=SUM(R2:R${lastRowIndex})`,
      ekSüreBitiş: '-'
    };

    const ws = buildSheet(headers, rows, totalRow);
    XLSX.utils.book_append_sheet(wb, ws, "Bölme Listesi");
  } else if (type === 'measurements') {
    filename = `${state.seflikName}_ölçümler_${state.selectedYear}.xlsx`;

    const headers = [
      { label: 'Bölme No', key: 'bölmeNo', align: 'center', width: 14 },
      { label: 'Üretim Yılı', key: 'yıl', align: 'center', width: 12 },
      { label: 'Kesim Nevi', key: 'nevi', align: 'center', width: 18 },
      { label: 'Ağaç Türü', key: 'tür', align: 'center', width: 14 },
      { label: 'Ürün Cinsi', key: 'cins', align: 'center', width: 18 },
      { label: 'Adet', key: 'adet', align: 'right', format: '#,##0', width: 14 },
      { label: 'Hacim (m³)', key: 'm3', align: 'right', format: '#,##0.000', width: 18 },
      { label: 'Miktar (Ster)', key: 'ster', align: 'right', format: '#,##0', width: 14 },
      { label: 'Depo', key: 'depo', align: 'center', width: 18 },
      { label: 'Tarih', key: 'tarih', align: 'center', width: 16 }
    ];

    const list = state.measurements.filter(m => m.yıl === state.selectedYear);
    const rows = list.map(m => ({
      bölmeNo: `Bölme ${m.bölmeNo}`,
      yıl: m.yıl,
      nevi: m.nevi || '-',
      tür: m.tür || '-',
      cins: m.cins || '-',
      adet: m.adet || 0,
      m3: m.m3 || 0,
      ster: m.ster || 0,
      depo: m.depo || '-',
      tarih: formatTurkishDate(m.tarih)
    }));

    const lastRowIndex = rows.length + 1;

    const totalRow = {
      bölmeNo: 'TOPLAM',
      yıl: '-',
      nevi: '-',
      tür: '-',
      cins: '-',
      adet: `=SUM(F2:F${lastRowIndex})`,
      m3: `=SUM(G2:G${lastRowIndex})`,
      ster: `=SUM(H2:H${lastRowIndex})`,
      depo: '-',
      tarih: '-'
    };

    const ws = buildSheet(headers, rows, totalRow);
    XLSX.utils.book_append_sheet(wb, ws, "Ölçüm Kayıtları");
  } else if (type === 'rampa') {
    filename = `${state.seflikName}_rampa_istif_tablosu_${state.selectedYear}.xlsx`;

    // 1. İstif Listesi Sayfası
    const listHeaders = [
      { label: 'İstif No', key: 'istifNo', align: 'center', width: 12 },
      { label: 'Bölme No', key: 'bölmeNo', align: 'center', width: 14 },
      { label: 'Emvalin Cinsi', key: 'cins', align: 'left', width: 22 },
      { label: 'Miktar (Ster)', key: 'ster', align: 'right', format: '#,##0', width: 15 },
      { label: 'Rampada', key: 'rampada', align: 'center', width: 14 },
      { label: 'Satıldı', key: 'satildi', align: 'center', width: 14 },
      { label: 'Rampadan Kalktı', key: 'kalkti', align: 'center', width: 16 },
      { label: 'Kalan Miktar (Ster)', key: 'kalan', align: 'right', format: '#,##0', width: 18 }
    ];

    const list = state.rampaStacks.filter(item => item.yıl === state.selectedYear);
    list.sort((a, b) => a.istifNo - b.istifNo);

    const listRows = list.map((item, idx) => {
      const rowNum = idx + 2;
      return {
        istifNo: item.istifNo,
        bölmeNo: `Bölme ${item.bölmeNo}`,
        cins: item.cins,
        ster: item.ster || 0,
        rampada: item.rampada ? 'Evet' : 'Hayır',
        satildi: item.satıldı ? 'Evet' : 'Hayır',
        kalkti: item.kalktı ? 'Evet' : 'Hayır',
        kalan: `=IF(G${rowNum}="Evet",0,D${rowNum})`
      };
    });

    const listLastRow = listRows.length + 1;
    const listTotalRow = {
      istifNo: 'TOPLAM',
      bölmeNo: '-',
      cins: '-',
      ster: `=SUM(D2:D${listLastRow})`,
      rampada: '-',
      satildi: '-',
      kalkti: '-',
      kalan: `=SUM(H2:H${listLastRow})`
    };

    const wsList = buildSheet(listHeaders, listRows, listTotalRow);
    XLSX.utils.book_append_sheet(wb, wsList, "Rampa İstif Tablosu");

    // 2. İstif Özet Sayfası
    const summaryHeaders = [
      { label: 'Emval Cinsi', key: 'cins', align: 'left', width: 22 },
      { label: 'Toplam Miktar (Ster)', key: 'toplamSter', align: 'right', format: '#,##0', width: 20 },
      { label: 'Satılan Miktar (Ster)', key: 'satildi', align: 'right', format: '#,##0', width: 20 },
      { label: 'Kalktı (Ster)', key: 'kalkti', align: 'right', format: '#,##0', width: 16 },
      { label: 'Kalan Miktar (Ster)', key: 'kalan', align: 'right', format: '#,##0', width: 20 }
    ];

    // Cinsine göre grupla
    const summaryData = {};
    list.forEach(item => {
      if (!summaryData[item.cins]) {
        summaryData[item.cins] = { toplamSter: 0, satildi: 0, kalkti: 0 };
      }
      summaryData[item.cins].toplamSter += item.ster;
      if (item.satıldı) {
        summaryData[item.cins].satildi += item.ster;
      }
      if (item.kalktı) {
        summaryData[item.cins].kalkti += item.ster;
      }
    });

    const keys = Object.keys(summaryData);
    keys.sort();

    const summaryRows = keys.map((cins, idx) => {
      const rowNum = idx + 2;
      const data = summaryData[cins];
      return {
        cins: cins,
        toplamSter: data.toplamSter,
        satildi: data.satildi,
        kalkti: data.kalkti,
        kalan: `=B${rowNum}-D${rowNum}`
      };
    });

    const summaryLastRow = summaryRows.length + 1;
    const summaryTotalRow = {
      cins: 'TOPLAM',
      toplamSter: `=SUM(B2:B${summaryLastRow})`,
      satildi: `=SUM(C2:C${summaryLastRow})`,
      kalkti: `=SUM(D2:D${summaryLastRow})`,
      kalan: `=SUM(E2:E${summaryLastRow})`
    };

    const wsSummary = buildSheet(summaryHeaders, summaryRows, summaryTotalRow);
    XLSX.utils.book_append_sheet(wb, wsSummary, "İstif Özet Tablosu");
  }

  XLSX.writeFile(wb, filename);
  showNotification('Gelişmiş Excel (.xlsx) dosyası başarıyla oluşturuldu ve indirildi.', 'success');
}

// Yardımcı Tarih Formatlayıcı
function formatTurkishDate(dateString) {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}.${parts[1]}.${parts[0]}`; // YYYY-MM-DD -> DD.MM.YYYY
}

// Şeflik Paneli Kaydetme
function saveSeflikConfig() {
  const config = {
    seflikName: state.seflikName,
    species: state.species,
    assortments: state.assortments,
    harvestTypes: state.harvestTypes,
    rampaWoodTypes: state.rampaWoodTypes,
    depolar: state.depolar
  };
  localStorage.setItem('ko_seflik_config', JSON.stringify(config));
  updateSpeciesTypesMap();
}

function saveSeflikComps() {
  localStorage.setItem('ko_seflik_comps', JSON.stringify(state.seflikComps));
}

function saveSeflikIsProgramiConfig() {
  localStorage.setItem('ko_seflik_is_programi', JSON.stringify(state.isProgrami));
}

// Dinamik Ağaç Türü Map Güncelleme
function updateSpeciesTypesMap() {
  window.SPECIES_TYPES = {};
  state.species.forEach(sp => {
    window.SPECIES_TYPES[sp.code] = sp.type;
  });
}

// Şeflik İsmini Arayüze Yansıt
function applyBranding() {
  const h2 = document.querySelector('.brand-name h2');
  if (h2) h2.innerText = state.seflikName;
  const h1 = document.querySelector('#topBanner h1');
  if (h1) h1.innerText = `${state.seflikName} Orman İşletme Şefliği`;
  document.title = `${state.seflikName} Orman İşletme Şefliği - Üretim ve Bölme Takip Sistemi`;
}

// Modallardaki Dropdown Seçeneklerini Doldur
function populateDropdowns() {
  // Compartment Kesim Nevi
  const compNeviSelect = document.getElementById('compNevi');
  if (compNeviSelect) {
    compNeviSelect.innerHTML = '';
    state.harvestTypes.forEach(nevi => {
      const opt = document.createElement('option');
      opt.value = nevi;
      opt.innerText = nevi;
      compNeviSelect.appendChild(opt);
    });
  }

  // Measurement Kesim Nevi
  const measNeviSelect = document.getElementById('measNevi');
  if (measNeviSelect) {
    measNeviSelect.innerHTML = '';
    state.harvestTypes.forEach(nevi => {
      const opt = document.createElement('option');
      opt.value = nevi;
      opt.innerText = nevi;
      measNeviSelect.appendChild(opt);
    });
  }

  // Measurement Ağaç Türü
  const measSpeciesSelect = document.getElementById('measSpecies');
  if (measSpeciesSelect) {
    measSpeciesSelect.innerHTML = '';
    state.species.forEach(sp => {
      const opt = document.createElement('option');
      opt.value = sp.code;
      opt.innerText = `${sp.code} (${sp.name} - ${sp.type})`;
      measSpeciesSelect.appendChild(opt);
    });
  }

  // Measurement Ürün Cinsi
  const measAssortmentSelect = document.getElementById('measAssortment');
  if (measAssortmentSelect) {
    measAssortmentSelect.innerHTML = '';
    state.assortments.forEach(assort => {
      const unitText = assort.unit === 'm3' ? 'Adet/m³' : 'Ster';
      const opt = document.createElement('option');
      opt.value = assort.name;
      opt.innerText = `${assort.name} (${unitText})`;
      measAssortmentSelect.appendChild(opt);
    });
  }

  // Measurement Depo / Rampa Seçimi
  const measDepoSelect = document.getElementById('measDepo');
  if (measDepoSelect) {
    measDepoSelect.innerHTML = '';
    state.depolar.forEach(depo => {
      const opt = document.createElement('option');
      opt.value = depo;
      opt.innerText = depo;
      measDepoSelect.appendChild(opt);
    });
  }

  // Measurement Depo Filtresi
  const measDepoFilter = document.getElementById('measDepoFilter');
  if (measDepoFilter) {
    const currentVal = measDepoFilter.value;
    measDepoFilter.innerHTML = '<option value="all">Tüm Depolar</option>';
    state.depolar.forEach(depo => {
      const opt = document.createElement('option');
      opt.value = depo;
      opt.innerText = depo;
      measDepoFilter.appendChild(opt);
    });
    // Restore previous filter selection if it still exists
    if (state.depolar.includes(currentVal) || currentVal === 'all') {
      measDepoFilter.value = currentVal;
    } else {
      measDepoFilter.value = 'all';
    }
  }
}

// Şeflik Paneli Arayüzünü Çiz
function renderSeflikTab() {
  // 1. Şeflik Adı
  const nameInput = document.getElementById('seflikNameInput');
  if (nameInput) nameInput.value = state.seflikName;

  // 2. Kesim Nevileri
  const neviTbody = document.getElementById('seflikNeviTableBody');
  if (neviTbody) {
    neviTbody.innerHTML = '';
    if (state.harvestTypes.length === 0) {
      neviTbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:var(--text-secondary);">Kayıtlı kesim nevi bulunamadı.</td></tr>';
    } else {
      state.harvestTypes.forEach((nevi) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${nevi}</b></td>
          <td style="text-align: center;">
            <button class="btn btn-danger" style="padding: 0.2rem 0.4rem;" onclick="deleteHarvestType('${nevi}')" title="Sil">
              <i data-lucide="trash" style="font-size: 0.75rem; width: 12px;"></i>
            </button>
          </td>
        `;
        neviTbody.appendChild(tr);
      });
    }
  }

  // 3. Ağaç Türleri
  const speciesTbody = document.getElementById('seflikSpeciesTableBody');
  if (speciesTbody) {
    speciesTbody.innerHTML = '';
    if (state.species.length === 0) {
      speciesTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-secondary);">Kayıtlı ağaç türü bulunamadı.</td></tr>';
    } else {
      state.species.forEach(sp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${sp.code}</code></td>
          <td><b>${sp.name}</b></td>
          <td>
            <span class="badge ${sp.type === 'İbreli' ? 'badge-success' : 'badge-warning'}">${sp.type}</span>
          </td>
          <td style="text-align: center;">
            <button class="btn btn-danger" style="padding: 0.2rem 0.4rem;" onclick="deleteSpecies('${sp.code}')" title="Sil">
              <i data-lucide="trash" style="font-size: 0.75rem; width: 12px;"></i>
            </button>
          </td>
        `;
        speciesTbody.appendChild(tr);
      });
    }
  }

  // 4. Ürün Cinsleri
  const assortmentTbody = document.getElementById('seflikAssortmentTableBody');
  if (assortmentTbody) {
    assortmentTbody.innerHTML = '';
    if (state.assortments.length === 0) {
      assortmentTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-secondary);">Kayıtlı ürün cinsi bulunamadı.</td></tr>';
    } else {
      state.assortments.forEach(assort => {
        const isVolume = assort.unit === 'm3';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${assort.name}</b></td>
          <td><code>${assort.unit}</code></td>
          <td>
            <span class="badge ${isVolume ? 'badge-info' : 'badge-neutral'}">
              ${isVolume ? 'Tomruk/Direk (Adet-m³)' : 'Lif/Yakacak (Ster)'}
            </span>
          </td>
          <td style="text-align: center;">
            <button class="btn btn-danger" style="padding: 0.2rem 0.4rem;" onclick="deleteAssortment('${assort.name}')" title="Sil">
              <i data-lucide="trash" style="font-size: 0.75rem; width: 12px;"></i>
            </button>
          </td>
        `;
        assortmentTbody.appendChild(tr);
      });
    }
  }

  // 5. Rampa Emval Cinsleri
  const rampaCinsTbody = document.getElementById('seflikRampaCinsTableBody');
  if (rampaCinsTbody) {
    rampaCinsTbody.innerHTML = '';
    if (!state.rampaWoodTypes || state.rampaWoodTypes.length === 0) {
      rampaCinsTbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:var(--text-secondary);">Kayıtlı emval cinsi bulunamadı.</td></tr>';
    } else {
      state.rampaWoodTypes.forEach(cins => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${cins}</b></td>
          <td style="text-align: center;">
            <button class="btn btn-danger" style="padding: 0.2rem 0.4rem;" onclick="deleteSeflikRampaCins('${cins}')" title="Sil">
              <i data-lucide="trash" style="font-size: 0.75rem; width: 12px;"></i>
            </button>
          </td>
        `;
        rampaCinsTbody.appendChild(tr);
      });
    }
  }

  // 6. Depolar Yönetimi
  const depoTbody = document.getElementById('seflikDepoTableBody');
  if (depoTbody) {
    depoTbody.innerHTML = '';
    if (!state.depolar || state.depolar.length === 0) {
      depoTbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:var(--text-secondary);">Kayıtlı depo bulunamadı.</td></tr>';
    } else {
      state.depolar.forEach(depo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${depo}</b></td>
          <td style="text-align: center;">
            <button class="btn btn-danger" style="padding: 0.2rem 0.4rem;" onclick="deleteDepo('${depo}')" title="Sil">
              <i data-lucide="trash" style="font-size: 0.75rem; width: 12px;"></i>
            </button>
          </td>
        `;
        depoTbody.appendChild(tr);
      });
    }
  }

  // Lucide ikonlarını oluştur
  renderSeflikComps();
  renderSeflikIsProgrami();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Şeflik Silme Mantıkları
function deleteHarvestType(name) {
  const isUsedInComp = state.compartments.some(c => c.nevi === name);
  const isUsedInMeas = state.measurements.some(m => m.nevi === name);
  if (isUsedInComp || isUsedInMeas) {
    if (!confirm(`UYARI: "${name}" kesim nevi bazı bölme veya ölçü tespit kayıtlarında kullanılmaktadır. Yine de silmek istiyor musunuz?`)) {
      return;
    }
  } else {
    if (!confirm(`"${name}" kesim nevini silmek istediğinize emin misiniz?`)) {
      return;
    }
  }
  state.harvestTypes = state.harvestTypes.filter(n => n !== name);
  saveSeflikConfig();
  populateDropdowns();
  renderSeflikTab();
}

function deleteSpecies(code) {
  const isUsed = state.measurements.some(m => m.tür === code);
  if (isUsed) {
    if (!confirm(`UYARI: "${code}" ağaç türü bazı ölçü tespit kayıtlarında kullanılmaktadır. Silmeniz durumunda hesaplama hataları oluşabilir. Yine de silmek istiyor musunuz?`)) {
      return;
    }
  } else {
    if (!confirm(`"${code}" ağaç türünü silmek istediğinize emin misiniz?`)) {
      return;
    }
  }
  state.species = state.species.filter(s => s.code !== code);
  saveSeflikConfig();
  populateDropdowns();
  renderSeflikTab();
}

function deleteAssortment(name) {
  const isUsed = state.measurements.some(m => m.cins === name);
  if (isUsed) {
    if (!confirm(`UYARI: "${name}" ürün cinsi bazı ölçü tespit kayıtlarında kullanılmaktadır. Silmeniz durumunda hesaplama hataları oluşabilir. Yine de silmek istiyor musunuz?`)) {
      return;
    }
  } else {
    if (!confirm(`"${name}" ürün cinsini silmek istediğinize emin misiniz?`)) {
      return;
    }
  }
  state.assortments = state.assortments.filter(a => a.name !== name);
  saveSeflikConfig();
  populateDropdowns();
  renderSeflikTab();
}

function deleteDepo(name) {
  const isUsed = state.measurements.some(m => m.depo === name);
  if (isUsed) {
    if (!confirm(`UYARI: "${name}" deposu bazı ölçü tespit kayıtlarında kullanılmaktadır. Silmeniz durumunda hesaplama/görüntüleme hataları oluşabilir. Yine de silmek istiyor musunuz?`)) {
      return;
    }
  } else {
    if (!confirm(`"${name}" deposunu silmek istediğinize emin misiniz?`)) {
      return;
    }
  }
  state.depolar = state.depolar.filter(d => d !== name);
  saveSeflikConfig();
  populateDropdowns();
  renderSeflikTab();
}

// Rampa İstif Kaydetme
function saveRampaStacks() {
  localStorage.setItem('ko_rampa_stacks', JSON.stringify(state.rampaStacks));
}

// Rampa İstif Tablosunu Çiz
function renderRampaTable() {
  const tbody = document.getElementById('rampaTableBody');
  if (!tbody) return;

  const searchQuery = document.getElementById('rampaSearch').value.toLowerCase();
  
  // Yıla göre filtrele
  let filtered = state.rampaStacks.filter(item => item.yıl === state.selectedYear);

  // Arama sorgusuna göre filtrele
  if (searchQuery) {
    filtered = filtered.filter(item => 
      item.bölmeNo.toLowerCase().includes(searchQuery) ||
      item.cins.toLowerCase().includes(searchQuery) ||
      item.istifNo.toString().includes(searchQuery)
    );
  }

  // İstif No'ya göre sırala
  filtered.sort((a, b) => a.istifNo - b.istifNo);

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Kayıtlı istif verisi bulunamadı.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="display: flex; gap: 0.5rem; justify-content: center;">
          <button class="btn btn-edit" style="padding: 0.3rem 0.5rem;" onclick="openRampaModal(true, ${item.id})" title="Düzenle">
            <i data-lucide="edit-2" style="font-size: 0.8rem; width: 14px;"></i>
          </button>
          <button class="btn btn-danger" style="padding: 0.3rem 0.5rem;" onclick="deleteRampaStack(${item.id})" title="Sil">
            <i data-lucide="trash" style="font-size: 0.8rem; width: 14px;"></i>
          </button>
        </div>
      </td>
      <td class="bold-row" style="text-align: center;">${item.istifNo}</td>
      <td style="text-align: left;"><b>${item.cins}</b></td>
      <td class="excel-cell-number" style="text-align: center;">${item.ster.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
      <td style="text-align: center;">Bölme ${item.bölmeNo}</td>
      <td style="text-align: center;">
        <input type="checkbox" ${item.rampada ? 'checked' : ''} onchange="toggleRampaCheckbox(${item.id}, 'rampada', this.checked)" style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--secondary);">
      </td>
      <td style="text-align: center;">
        <input type="checkbox" ${item.satıldı ? 'checked' : ''} onchange="toggleRampaCheckbox(${item.id}, 'satıldı', this.checked)" style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent-red);">
      </td>
      <td style="text-align: center;">
        <input type="checkbox" ${item.kalktı ? 'checked' : ''} onchange="toggleRampaCheckbox(${item.id}, 'kalktı', this.checked)" style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary);">
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Toplam Satırı Ekle
  let totalSter = 0;
  let totalRampada = 0;
  let totalSatildi = 0;
  let totalKalkti = 0;

  filtered.forEach(item => {
    totalSter += (item.ster || 0);
    if (item.rampada) {
      totalRampada += (item.ster || 0);
    }
    if (item.satıldı) {
      totalSatildi += (item.ster || 0);
    }
    if (item.kalktı) {
      totalKalkti += (item.ster || 0);
    }
  });

  const totalTr = document.createElement('tr');
  totalTr.className = 'sticky-total-row';
  totalTr.innerHTML = `
    <td></td>
    <td></td>
    <td class="total-label" style="text-align: left;">TOPLAM:</td>
    <td class="excel-cell-number total-value-ster" style="text-align: center;">${totalSter.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
    <td></td>
    <td class="excel-cell-number total-value-rampada" style="text-align: center;">${totalRampada.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
    <td class="excel-cell-number total-value-satildi" style="text-align: center;">${totalSatildi.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
    <td class="excel-cell-number total-value-kalkti" style="text-align: center;">${totalKalkti.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
  `;
  tbody.appendChild(totalTr);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Rampa Özet Toplamlar Tablosunu Çiz
function renderRampaSummary() {
  const tbody = document.getElementById('rampaSummaryTableBody');
  if (!tbody) return;

  // Yıla göre filtrele
  const filtered = state.rampaStacks.filter(item => item.yıl === state.selectedYear);

  // Cinsine göre grupla
  const summaryData = {};
  filtered.forEach(item => {
    if (!summaryData[item.cins]) {
      summaryData[item.cins] = { toplamSter: 0, satildi: 0, kalkti: 0 };
    }
    summaryData[item.cins].toplamSter += item.ster;
    if (item.satıldı) {
      summaryData[item.cins].satildi += item.ster;
    }
    if (item.kalktı) {
      summaryData[item.cins].kalkti += item.ster;
    }
  });

  tbody.innerHTML = '';

  let sumSter = 0;
  let sumSatildi = 0;
  let sumKalkti = 0;
  let sumKalan = 0;

  const keys = Object.keys(summaryData);
  if (keys.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--text-secondary);">Özetlenecek veri bulunamadı.</td></tr>`;
    return;
  }

  // Alfabetik sırala
  keys.sort();

  keys.forEach(cins => {
    const data = summaryData[cins];
    const kalan = data.toplamSter - data.kalkti;

    sumSter += data.toplamSter;
    sumSatildi += data.satildi;
    sumKalkti += data.kalkti;
    sumKalan += kalan;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: left;"><b>${cins}</b></td>
      <td class="excel-cell-number" style="text-align: center;">${data.toplamSter.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
      <td class="excel-cell-number" style="color: ${data.satildi > 0 ? 'var(--text-warning)' : 'inherit'}; text-align: center;">${data.satildi > 0 ? data.satildi.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '0'}</td>
      <td class="excel-cell-number" style="color: ${data.kalkti > 0 ? 'var(--text-danger)' : 'inherit'}; text-align: center;">${data.kalkti > 0 ? data.kalkti.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '0'}</td>
      <td class="excel-cell-number bold-row" style="color: var(--text-success); text-align: center;">${kalan.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
    `;
    tbody.appendChild(tr);
  });

  // Toplam Satırı
  const totalTr = document.createElement('tr');
  totalTr.className = 'bold-row';
  totalTr.style.borderTop = '2px solid var(--text-primary)';
  totalTr.style.backgroundColor = 'var(--bg-active)';
  totalTr.innerHTML = `
    <td style="text-align: left;">TOPLAM:</td>
    <td class="excel-cell-number" style="text-align: center;">${sumSter.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
    <td class="excel-cell-number" style="color: var(--text-warning); text-align: center;">${sumSatildi.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
    <td class="excel-cell-number" style="color: var(--text-danger); text-align: center;">${sumKalkti.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
    <td class="excel-cell-number" style="color: var(--text-success); font-weight: 800; font-size: 0.95rem; text-align: center;">${sumKalan.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
  `;
  tbody.appendChild(totalTr);
}

// Rampa Modal Aç
function openRampaModal(isEdit = false, id = null) {
  const modal = document.getElementById('rampaModal');
  const title = document.getElementById('rampaModalTitle');
  const form = document.getElementById('rampaForm');

  form.reset();

  // Bölme dropdown'unu doldur
  const sortedComps = [...state.seflikComps].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    }
    return a.localeCompare(b, 'tr');
  });
  populateCustomDropdown('rampaCompDropdown', 'rampaCompNo', sortedComps);

  // Emval Cinsi dropdown'unu doldur
  populateCustomDropdown('rampaCinsDropdown', 'rampaCins', state.rampaWoodTypes, 'Emval Seçiniz...', '');

  if (isEdit && id !== null) {
    state.editingRampaStackId = id;
    title.innerText = 'İstif Kaydı Düzenle';
    const item = state.rampaStacks.find(x => x.id === id);
    if (item) {
      document.getElementById('rampaIstifNo').value = item.istifNo;
      setCustomDropdownValue('rampaCompDropdown', 'rampaCompNo', item.bölmeNo);
      setCustomDropdownValue('rampaCinsDropdown', 'rampaCins', item.cins, 'Emval Seçiniz...', '');
      document.getElementById('rampaSter').value = item.ster;
      document.getElementById('rampaStatusRampada').checked = item.rampada;
      document.getElementById('rampaStatusSatildi').checked = item.satıldı;
      document.getElementById('rampaStatusKalkti').checked = item.kalktı;
    }
  } else {
    state.editingRampaStackId = null;
    title.innerText = 'Yeni İstif Kaydı Ekle';
    setCustomDropdownValue('rampaCompDropdown', 'rampaCompNo', '');
    setCustomDropdownValue('rampaCinsDropdown', 'rampaCins', '', 'Emval Seçiniz...', '');
    // Otomatik sonraki istif numarasını öner
    const activeYearStacks = state.rampaStacks.filter(x => x.yıl === state.selectedYear);
    const nextNo = activeYearStacks.length > 0 ? Math.max(...activeYearStacks.map(x => x.istifNo)) + 1 : 1;
    document.getElementById('rampaIstifNo').value = nextNo;
    document.getElementById('rampaStatusRampada').checked = true;
    document.getElementById('rampaStatusSatildi').checked = false;
    document.getElementById('rampaStatusKalkti').checked = false;
  }

  modal.classList.add('active');
}

// Rampa Kaydet
function saveRampaForm() {
  const istifNo = parseInt(document.getElementById('rampaIstifNo').value);
  const bölmeNo = document.getElementById('rampaCompNo').value;
  const cins = document.getElementById('rampaCins').value.trim();
  const ster = parseInt(document.getElementById('rampaSter').value) || 0;
  const rampada = document.getElementById('rampaStatusRampada').checked;
  const satıldı = document.getElementById('rampaStatusSatildi').checked;
  const kalktı = document.getElementById('rampaStatusKalkti').checked;

  if (!istifNo || !bölmeNo || !cins || ster <= 0) {
    showNotification('Lütfen tüm zorunlu alanları eksiksiz doldurunuz.', 'warning');
    return;
  }

  if (state.editingRampaStackId !== null) {
    // Düzenleme
    const idx = state.rampaStacks.findIndex(x => x.id === state.editingRampaStackId);
    if (idx !== -1) {
      state.rampaStacks[idx] = {
        ...state.rampaStacks[idx],
        istifNo, bölmeNo, cins, ster, rampada, satıldı, kalktı
      };
    }
  } else {
    // Yeni Ekleme
    // Mükerrer İstif No kontrolü
    if (state.rampaStacks.some(x => x.yıl === state.selectedYear && x.istifNo === istifNo)) {
      showNotification(`İstif No ${istifNo} ${state.selectedYear} yılı için zaten kayıtlı!`, 'danger');
      return;
    }
    const newId = state.rampaStacks.length > 0 ? Math.max(...state.rampaStacks.map(x => x.id)) + 1 : 1;
    state.rampaStacks.push({
      id: newId, yıl: state.selectedYear, istifNo, bölmeNo, cins, ster, rampada, satıldı, kalktı
    });
  }

  saveRampaStacks();
  closeModals();
  renderAll();
}

// Rampa Sil
function deleteRampaStack(id) {
  if (confirm('Bu istif kaydını silmek istediğinize emin misiniz?')) {
    state.rampaStacks = state.rampaStacks.filter(x => x.id !== id);
    saveRampaStacks();
    renderAll();
  }
}

// Rampa Hızlı Checkbox Güncelleme
function toggleRampaCheckbox(id, field, value) {
  const item = state.rampaStacks.find(x => x.id === id);
  if (item) {
    item[field] = value;
    saveRampaStacks();
    renderRampaTable();
    renderRampaSummary();
    renderDashboard();
  }
}

// Şeflik Bölme Listesini Çiz
function renderSeflikComps() {
  // 1. Datalist Güncelle (#seflikCompsDatalist)
  const datalist = document.getElementById('seflikCompsDatalist');
  if (datalist) {
    datalist.innerHTML = '';
    // Sıralı listele
    const sortedComps = [...state.seflikComps].sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) return numA - numB;
      }
      return a.localeCompare(b, 'tr');
    });

    sortedComps.forEach(comp => {
      const opt = document.createElement('option');
      opt.value = comp;
      datalist.appendChild(opt);
    });
  }

  // 2. Şeflik Ayarlar Tablosunu Çiz (#seflikCompsTableBody)
  const tbody = document.getElementById('seflikCompsTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    if (state.seflikComps.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:var(--text-secondary);">Kayıtlı bölme bulunamadı.</td></tr>';
      return;
    }

    // Sıralı listele
    const sortedComps = [...state.seflikComps].sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) return numA - numB;
      }
      return a.localeCompare(b, 'tr');
    });

    sortedComps.forEach(comp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>Bölme ${comp}</b></td>
        <td style="text-align: center;">
          <button class="btn btn-danger" style="padding: 0.2rem 0.4rem;" onclick="deleteSeflikComp('${comp}')" title="Sil">
            <i data-lucide="trash" style="font-size: 0.75rem; width: 12px;"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Şeflik Bölme Numarası Silme
function deleteSeflikComp(comp) {
  const isUsedInComps = state.compartments.some(c => c.bölmeNo === comp);
  const isUsedInMeas = state.measurements.some(m => m.bölmeNo === comp);
  const isUsedInRampa = state.rampaStacks.some(r => r.bölmeNo === comp);

  if (isUsedInComps || isUsedInMeas || isUsedInRampa) {
    showNotification(`"${comp}" nolu bölme sistemdeki bazı bölme planlarında, ölçü tespitlerinde veya rampa istiflerinde kullanılmaktadır. Önce bu kayıtları silmeli veya değiştirmelisiniz!`, 'danger');
    return;
  }

  if (confirm(`"${comp}" nolu bölmeyi şeflik listesinden silmek istediğinize emin misiniz?`)) {
    state.seflikComps = state.seflikComps.filter(c => c !== comp);
    saveSeflikComps();
    renderSeflikComps();
  }
}

// Şeflik Rampa Emval Cinsi Silme
function deleteSeflikRampaCins(cins) {
  const isUsedInRampa = state.rampaStacks.some(r => r.cins === cins);
  if (isUsedInRampa) {
    showNotification(`"${cins}" emval cinsi sistemdeki bazı rampa istif kayıtlarında kullanılmaktadır. Önce bu kayıtları silmeli veya değiştirmelisiniz!`, 'danger');
    return;
  }

  if (confirm(`"${cins}" emval cinsini şeflik listesinden silmek istediğinize emin misiniz?`)) {
    state.rampaWoodTypes = state.rampaWoodTypes.filter(c => c !== cins);
    saveSeflikConfig();
    renderSeflikTab();
  }
}

// Şeflik Aylık İş Programı Tablosunu Çiz
function renderSeflikIsProgrami() {
  const tbody = document.getElementById('seflikIsProgramiTableBody');
  if (!tbody) return;

  const titleEl = document.getElementById('seflikIsProgramiTitle');
  if (titleEl) {
    titleEl.innerText = `Aylık İş Programı Yönetimi (${state.selectedYear} Yılı)`;
  }

  // Yıl verisi yoksa boş oluştur
  if (!state.isProgrami[state.selectedYear]) {
    state.isProgrami[state.selectedYear] = {
      dkgh: new Array(12).fill(0),
      tomruk: new Array(12).fill(0),
      telDirek: new Array(12).fill(0),
      madenDirek: new Array(12).fill(0),
      sanayi: new Array(12).fill(0),
      kagitlik: new Array(12).fill(0),
      lifYonga: new Array(12).fill(0),
      sirik: new Array(12).fill(0),
      olaganustu: new Array(12).fill(0),
      yakacak: new Array(12).fill(0)
    };
  }

  const prog = state.isProgrami[state.selectedYear];

  const rows = [
    { key: 'dkgh', name: 'D.K.G.H (m³)', unit: 'm³', calc: false },
    { key: 'tomruk', name: 'Tomruk (m³)', unit: 'm³', calc: false },
    { key: 'telDirek', name: 'Tel Direği (m³)', unit: 'm³', calc: false },
    { key: 'madenDirek', name: 'Maden Direği (m³)', unit: 'm³', calc: false },
    { key: 'sanayi', name: 'Sanayi Odunu (m³)', unit: 'm³', calc: false },
    { key: 'kagitlik', name: 'Kağıtlık Odun (m³)', unit: 'm³', calc: false },
    { key: 'lifYonga', name: 'Lif Yonga Odunu (m³)', unit: 'm³', calc: false },
    { key: 'sirik', name: 'Sırık (m³)', unit: 'm³', calc: false },
    { key: 'endustriyel', name: 'Endüstriyel Odun Toplamı (m³)', unit: 'm³', calc: true },
    { key: 'olaganustu', name: 'Olağanüstü (m³)', unit: 'm³', calc: false },
    { key: 'yakacak', name: 'Yakacak Odun (Ster)', unit: 'Ster', calc: false }
  ];

  tbody.innerHTML = '';

  rows.forEach(r => {
    const tr = document.createElement('tr');
    if (r.calc) {
      tr.className = 'bold-row';
      tr.style.backgroundColor = 'var(--bg-active)';
    }

    let innerHTML = `
      <td style="text-align: left; font-weight: bold; border-right: 2px solid var(--border-color);">${r.name}</td>
      <td style="text-align: center; font-weight: bold; border-right: 2px solid var(--border-color);">${r.unit}</td>
    `;

    for (let m = 0; m < 12; m++) {
      if (r.calc) {
        const tomrukVal = parseFloat(prog.tomruk[m]) || 0;
        const telVal = parseFloat(prog.telDirek[m]) || 0;
        const madenVal = parseFloat(prog.madenDirek[m]) || 0;
        const sanayiVal = parseFloat(prog.sanayi[m]) || 0;
        const kagitlikVal = parseFloat(prog.kagitlik[m]) || 0;
        const lifYongaVal = parseFloat(prog.lifYonga[m]) || 0;
        const sirikVal = parseFloat(prog.sirik[m]) || 0;
        const endVal = tomrukVal + telVal + madenVal + sanayiVal + kagitlikVal + lifYongaVal + sirikVal;
        
        innerHTML += `<td id="calc-endustriyel-${m}" style="font-weight: 800; font-family: monospace; text-align: center;">${endVal.toLocaleString('tr-TR')}</td>`;
      } else {
        const val = prog[r.key] ? prog[r.key][m] : 0;
        innerHTML += `
          <td style="padding: 2px; text-align: center;">
            <input type="number" step="any" min="0" class="form-control text-center" 
              style="padding: 0.25rem; font-size: 0.8rem; font-family: monospace; border: none; background: transparent; width: 100%; min-width: 60px; text-align: center;" 
              data-key="${r.key}" data-month="${m}" value="${val}" onchange="onIsProgramiChange(this)">
          </td>
        `;
      }
    }

    tr.innerHTML = innerHTML;
    tbody.appendChild(tr);
  });
}

// Hücre Değiştiğinde Anlık Güncelleme
function onIsProgramiChange(input) {
  const key = input.dataset.key;
  const month = parseInt(input.dataset.month);
  const val = parseFloat(input.value) || 0;

  if (state.isProgrami[state.selectedYear] && state.isProgrami[state.selectedYear][key]) {
    state.isProgrami[state.selectedYear][key][month] = val;
  }

  // Endüstriyel Toplamı anlık güncelle
  const prog = state.isProgrami[state.selectedYear];
  const tomrukVal = parseFloat(prog.tomruk[month]) || 0;
  const telVal = parseFloat(prog.telDirek[month]) || 0;
  const madenVal = parseFloat(prog.madenDirek[month]) || 0;
  const sanayiVal = parseFloat(prog.sanayi[month]) || 0;
  const kagitlikVal = parseFloat(prog.kagitlik[month]) || 0;
  const lifYongaVal = parseFloat(prog.lifYonga[month]) || 0;
  const sirikVal = parseFloat(prog.sirik[month]) || 0;
  const endVal = tomrukVal + telVal + madenVal + sanayiVal + kagitlikVal + lifYongaVal + sirikVal;

  const calcTd = document.getElementById(`calc-endustriyel-${month}`);
  if (calcTd) {
    calcTd.innerText = endVal.toLocaleString('tr-TR');
  }
}

// Kaydetme İşlevi
function saveSeflikIsProgrami() {
  const tbody = document.getElementById('seflikIsProgramiTableBody');
  if (!tbody) return;

  const inputs = tbody.querySelectorAll('input');
  inputs.forEach(input => {
    const key = input.dataset.key;
    const month = parseInt(input.dataset.month);
    const val = parseFloat(input.value) || 0;

    if (state.isProgrami[state.selectedYear] && state.isProgrami[state.selectedYear][key]) {
      state.isProgrami[state.selectedYear][key][month] = val;
    }
  });

  saveSeflikIsProgramiConfig();
  showNotification(`${state.selectedYear} yılı İş Programı başarıyla kaydedildi.`, 'success');
  renderAll(); // Dashboard'u yeniden çiz
}



// Custom Dropdown Doldurma Yardımcı Fonksiyonu
function populateCustomDropdown(containerId, inputId, items, placeholder = 'Bölme Seçiniz...', prefix = 'Bölme ') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const btn = container.querySelector('.custom-dropdown-btn');
  const menu = container.querySelector('.custom-dropdown-menu');
  const input = document.getElementById(inputId);

  menu.innerHTML = '';
  
  // Varsayılan boş seçenek
  const defaultDiv = document.createElement('div');
  defaultDiv.className = 'custom-dropdown-item';
  defaultDiv.innerText = placeholder;
  defaultDiv.dataset.value = '';
  menu.appendChild(defaultDiv);

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'custom-dropdown-item';
    div.innerText = prefix ? `${prefix}${item}` : item;
    div.dataset.value = item;
    menu.appendChild(div);
  });

  // Tıklama olayı dinle
  menu.querySelectorAll('.custom-dropdown-item').forEach(itemEl => {
    itemEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = itemEl.dataset.value;
      const text = itemEl.innerText;
      input.value = val;
      btn.innerText = text;
      menu.classList.remove('active');
    });
  });
}

// Custom Dropdown Değerini Programatik Olarak Ayarla
function setCustomDropdownValue(containerId, inputId, value, placeholder = 'Bölme Seçiniz...', prefix = 'Bölme ') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const btn = container.querySelector('.custom-dropdown-btn');
  const input = document.getElementById(inputId);
  input.value = value;
  btn.innerText = value ? (prefix ? `${prefix}${value}` : value) : placeholder;
}

window.openCompartmentDetail = openCompartmentDetail;
window.deleteCompartment = deleteCompartment;
window.openMeasurementEdit = openMeasurementEdit;
window.deleteMeasurement = deleteMeasurement;
window.exportJsonBackup = exportJsonBackup;
window.resetDatabase = resetDatabase;
window.exportCSV = exportCSV;
window.openCompartmentModal = openCompartmentModal;
window.openMeasurementModal = openMeasurementModal;
window.deleteHarvestType = deleteHarvestType;
window.deleteSpecies = deleteSpecies;
window.deleteAssortment = deleteAssortment;
window.openRampaModal = openRampaModal;
window.deleteRampaStack = deleteRampaStack;
window.toggleRampaCheckbox = toggleRampaCheckbox;
window.saveRampaStacks = saveRampaStacks;
window.renderRampaTable = renderRampaTable;
window.renderRampaSummary = renderRampaSummary;
window.renderSeflikComps = renderSeflikComps;
window.deleteSeflikComp = deleteSeflikComp;
window.deleteSeflikRampaCins = deleteSeflikRampaCins;
window.saveSeflikComps = saveSeflikComps;
window.populateCustomDropdown = populateCustomDropdown;
window.setCustomDropdownValue = setCustomDropdownValue;
window.onIsProgramiChange = onIsProgramiChange;
window.saveSeflikIsProgrami = saveSeflikIsProgrami;
window.renderSeflikIsProgrami = renderSeflikIsProgrami;
window.saveSeflikIsProgramiConfig = saveSeflikIsProgramiConfig;
window.deleteDepo = deleteDepo;

// Toast Bildirim Yapısı ve Yöntemleri
function createToastContainer() {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showNotification(message, type = 'success') {
  const container = createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  else if (type === 'warning') iconName = 'alert-triangle';
  else if (type === 'danger') iconName = 'alert-octagon';
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-content">${message}</div>
    <button class="toast-close">&times;</button>
  `;
  
  container.appendChild(toast);
  
  // Lucide ikonlarını oluştur
  if (window.lucide) {
    window.lucide.createIcons();
  }
  
  // Animasyon için aktif sınıfı ekle
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);
  
  // Elle kapatma
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });
  
  // 4 saniye sonra otomatik kaldır
  const autoRemoveTimer = setTimeout(() => {
    removeToast(toast);
  }, 4000);
  
  function removeToast(el) {
    el.classList.remove('active');
    el.addEventListener('transitionend', () => {
      el.remove();
    });
  }
}

window.showNotification = showNotification;

