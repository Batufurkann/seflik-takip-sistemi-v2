// Koyuncu Orman İşletme Şefliği - Grafik Yönetimi

let speciesChart = null;
let assortmentChart = null;
let monthlyChart = null;
let cumulativeChart = null;
let currentChartSlide = 0;

// Ortadaki Yazıyı Çizen Custom Chart.js Plugini (Doughnut grafikleri için)
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: function(chart) {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    
    ctx.save();
    
    // "TOPLAM" Etiketi
    ctx.font = 'bold 16px Inter, sans-serif';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TOPLAM', centerX, centerY - 16);
    
    // Toplam Değer (m³)
    const value = chart.options.plugins.centerText?.value || '0 m³';
    ctx.font = 'bold 26px Outfit, sans-serif';
    ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
    ctx.fillText(value, centerX, centerY + 16);
    
    ctx.restore();
  }
};

// HSL to RGB/Hex helper or curated colors for charts
const CHART_COLORS = {
  // Emval Türleri (Ağaçlar)
  species: {
    'Çk': '#2e7d32', // Karaçam - Koyu Yeşil
    'Çz': '#4caf50',  // Kızılçam - Yeşil
    'Ks': '#81c784', // Kestane - Açık Yeşil
    'G': '#1b5e20',  // Göknar - Orman Yeşili
    'Ml': '#a5d6a7', // Saçlı Meşe - Soluk Yeşil
    'Mz': '#d84315', // Saosız Meşe - Sonbahar Kahvesi / Turuncu
    'Dy': '#ffb74d'  // Diğer Yapraklı - Sarı/Turuncu
  },
  // Emval Cinsleri (Ürün Çeşitleri)
  assortments: {
    'Tomruk': '#1e88e5',       // Mavi
    'Tel Direk': '#43a047',     // Yeşil
    'Maden Direk': '#ffb300',   // Amber
    'Kağıtlık Odun': '#f4511e', // Turuncu-Kırmızı
    'İbr. Kab. Kağ.': '#8d6e63',// Açık Kahve
    'İbr. Lif': '#546e7a',      // Mavi-Gri
    'Yap. Lif': '#78909c',      // Açık Mavi-Gri
    'Yap. Yak.': '#6d4c41',     // Kahverengi
    'Sırık': '#8e24aa'          // Mor
  },
  primary: '#1b5e20', // Orman Yeşili
  secondary: '#f4511e', // Turuncu
  secondaryLight: '#ffccbc'
};

// Grafikleri Ilklendir ve Güncelle
function updateDashboardCharts(compartments, measurements, selectedYear, isProgrami) {
  if (typeof Chart === 'undefined') {
    console.warn("Chart.js kütüphanesi yüklenemedi. Grafik çizimi atlanıyor.");
    return;
  }
  // Seçilen yıla göre filtreleme yap
  const filteredCompartments = compartments.filter(c => c.yıl === selectedYear);
  const filteredMeasurements = measurements.filter(m => m.yıl === selectedYear);

  // Ortadaki Toplam Değer Hesabı (Ölçülen Toplam m³)
  let totalRealVol = 0;
  filteredMeasurements.forEach(m => {
    totalRealVol += m.m3 > 0 ? m.m3 : (m.ster * 0.75);
  });
  const totalVolText = totalRealVol.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' m³';

  // 1. EMVAL TÜRÜNE GÖRE ÜRETİM (Ağaç Türü Dağılımı - m3 cinsinden)
  const speciesData = {};
  filteredMeasurements.forEach(m => {
    const vol = m.m3 > 0 ? m.m3 : (m.ster * 0.75);
    speciesData[m.tür] = (speciesData[m.tür] || 0) + vol;
  });

  const speciesLabels = Object.keys(speciesData);
  const speciesValues = Object.values(speciesData);
  const speciesColors = speciesLabels.map(label => CHART_COLORS.species[label] || '#9e9e9e');

  renderSpeciesChart(speciesLabels, speciesValues, speciesColors, totalVolText);

  // 2. EMVAL CİNSİNE GÖRE ÜRETİM YÜZDELERİ (Ürün Çeşitleri - m3 cinsinden)
  const assortmentData = {};
  filteredMeasurements.forEach(m => {
    const vol = m.m3 > 0 ? m.m3 : (m.ster * 0.75);
    assortmentData[m.cins] = (assortmentData[m.cins] || 0) + vol;
  });

  const assortmentLabels = Object.keys(assortmentData);
  const assortmentValues = Object.values(assortmentData);
  const assortmentColors = assortmentLabels.map(label => CHART_COLORS.assortments[label] || '#9e9e9e');

  renderAssortmentChart(assortmentLabels, assortmentValues, assortmentColors, totalVolText);

  // 3. AYLIK ÜRETİM DURUMU (Aylık Plan vs Ölçülen Miktar)
  const monthlyRealized = new Array(12).fill(0);
  const monthlyPlanned = new Array(12).fill(0);

  // Gerçekleşen Aylık Toplamı Hesapla
  filteredMeasurements.forEach(m => {
    if (m.tarih) {
      const date = new Date(m.tarih);
      if (!isNaN(date.getTime())) {
        const month = date.getMonth(); // 0-11
        const vol = m.m3 > 0 ? m.m3 : (m.ster * 0.75);
        monthlyRealized[month] += vol;
      }
    }
  });

  // Aylık planı "Aylık İş Programı" verilerine göre hesapla
  const prog = isProgrami && isProgrami[selectedYear];
  if (prog) {
    const cumulativeTotal = new Array(12).fill(0);
    for (let m = 0; m < 12; m++) {
      const tomruk = (prog.tomruk && parseFloat(prog.tomruk[m])) || 0;
      const tel = (prog.telDirek && parseFloat(prog.telDirek[m])) || 0;
      const maden = (prog.madenDirek && parseFloat(prog.madenDirek[m])) || 0;
      const sanayi = (prog.sanayi && parseFloat(prog.sanayi[m])) || 0;
      const kagitlik = (prog.kagitlik && parseFloat(prog.kagitlik[m])) || 0;
      const lifYonga = (prog.lifYonga && parseFloat(prog.lifYonga[m])) || 0;
      const sirik = (prog.sirik && parseFloat(prog.sirik[m])) || 0;
      const olaganustu = (prog.olaganustu && parseFloat(prog.olaganustu[m])) || 0;
      const yakacak = (prog.yakacak && parseFloat(prog.yakacak[m])) || 0;

      const endustriyelTotal = tomruk + tel + maden + sanayi + kagitlik + lifYonga + sirik;
      cumulativeTotal[m] = endustriyelTotal + olaganustu + (yakacak * 0.75);
    }

    for (let m = 0; m < 12; m++) {
      if (m === 0) {
        monthlyPlanned[m] = cumulativeTotal[m];
      } else {
        monthlyPlanned[m] = cumulativeTotal[m] - cumulativeTotal[m - 1];
      }
    }
  } else {
    // Geriye dönük uyumluluk için varsayılan plan dağıtım mantığı
    filteredCompartments.forEach(c => {
      const totalPlan = (c.planİbreli || 0) + (c.planYapraklı || 0);
      if (totalPlan <= 0) return;

      let start = c.sözleşmeBaşlangıç ? new Date(c.sözleşmeBaşlangıç) : null;
      let end = c.ekSüreBitiş ? new Date(c.ekSüreBitiş) : (c.sözleşmeBitiş ? new Date(c.sözleşmeBitiş) : null);

      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        let startYear = start.getFullYear();
        let startMonth = start.getMonth();
        let endYear = end.getFullYear();
        let endMonth = end.getMonth();

        let monthsCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
        if (monthsCount <= 0) monthsCount = 1;

        const monthlyVolume = totalPlan / monthsCount;

        let current = new Date(start.getTime());
        while (current <= end) {
          if (current.getFullYear() === selectedYear) {
            monthlyPlanned[current.getMonth()] += monthlyVolume;
          }
          current.setMonth(current.getMonth() + 1);
        }
      } else {
        for (let i = 0; i < 12; i++) {
          monthlyPlanned[i] += totalPlan / 12;
        }
      }
    });
  }

  const monthLabels = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
  
  // Kümülatif toplamları hesapla
  const cumulativePlanned = [];
  const cumulativeRealized = [];
  let sumP = 0;
  let sumR = 0;
  for (let i = 0; i < 12; i++) {
    sumP += monthlyPlanned[i];
    sumR += monthlyRealized[i];
    cumulativePlanned.push(Math.round(sumP * 10) / 10);
    cumulativeRealized.push(Math.round(sumR * 10) / 10);
  }

  renderMonthlyChart(monthLabels, monthlyPlanned, monthlyRealized);
  renderCumulativeChart(monthLabels, cumulativePlanned, cumulativeRealized);
  
  // Slayt durumunu koru
  switchChartSlide(currentChartSlide);
}

// 1. Ağaç Türü Grafiği Çizimi (Doughnut)
function renderSpeciesChart(labels, values, colors, totalVolText) {
  const ctx = document.getElementById('speciesChart').getContext('2d');
  
  if (speciesChart) {
    speciesChart.destroy();
  }

  const isNoData = labels.length === 0;
  if (isNoData) {
    labels = ['Kayıt Yok'];
    values = [1];
    colors = ['#e2e8f0'];
  }

  speciesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values.map(v => Math.round(v * 100) / 100),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: getComputedStyle(document.body).getPropertyValue('--bg-card').trim()
      }]
    },
    plugins: [centerTextPlugin],
    options: {
      devicePixelRatio: window.devicePixelRatio || 1,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        centerText: {
          value: isNoData ? '0 m³' : totalVolText
        },
        legend: {
          position: 'right',
          labels: {
            font: { family: 'Inter', size: 16, weight: '600' },
            color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim()
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (isNoData) return ' Kayıt Yok';
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((context.raw / total) * 100) : 0;
              const formattedPercentage = percentage.toLocaleString('tr-TR', { minimumFractionDigits: 1 }) + '%';
              const formattedValue = context.raw.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' m³';
              return [
                ` Miktar: ${formattedValue}`,
                ` Oran: ${formattedPercentage}`
              ];
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

// 2. Emval Cinsi Yüzde Grafiği Çizimi
function renderAssortmentChart(labels, values, colors, totalVolText) {
  const ctx = document.getElementById('assortmentChart').getContext('2d');
  
  if (assortmentChart) {
    assortmentChart.destroy();
  }

  const isNoData = labels.length === 0;
  if (isNoData) {
    labels = ['Kayıt Yok'];
    values = [1];
    colors = ['#e2e8f0'];
  }

  assortmentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values.map(v => Math.round(v * 100) / 100),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: getComputedStyle(document.body).getPropertyValue('--bg-card').trim()
      }]
    },
    plugins: [centerTextPlugin],
    options: {
      devicePixelRatio: window.devicePixelRatio || 1,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        centerText: {
          value: isNoData ? '0 m³' : totalVolText
        },
        legend: {
          position: 'right',
          labels: {
            font: { family: 'Inter', size: 16, weight: '600' },
            color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim()
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (isNoData) return ' Kayıt Yok';
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((context.raw / total) * 100) : 0;
              const formattedPercentage = percentage.toLocaleString('tr-TR', { minimumFractionDigits: 1 }) + '%';
              const formattedValue = context.raw.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' m³';
              return [
                ` Oran: ${formattedPercentage}`,
                ` Miktar: ${formattedValue}`
              ];
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

// 3. Aylık Plan ve Gerçekleşme Çubuk Grafiği Çizimi (Slayt 0)
function renderMonthlyChart(labels, planned, realized) {
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  
  if (monthlyChart) {
    monthlyChart.destroy();
  }

  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Aylık Üretim Planı (m³)',
          data: planned.map(v => Math.round(v * 10) / 10),
          backgroundColor: '#2c7be5',
          borderRadius: 6
        },
        {
          label: 'Aylık Ölçülen Miktar (m³)',
          data: realized.map(v => Math.round(v * 10) / 10),
          backgroundColor: CHART_COLORS.secondary || '#f4511e',
          borderRadius: 6
        }
      ]
    },
    options: {
      devicePixelRatio: window.devicePixelRatio || 1,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
            font: { family: 'Inter', size: 9, weight: 'bold' }
          }
        },
        y: {
          border: { dash: [5, 5] },
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
            font: { family: 'Inter', size: 10 }
          },
          title: {
            display: true,
            text: 'Aylık Miktar (m³)',
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
            font: { family: 'Inter', size: 10, weight: 'bold' }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Inter', size: 13, weight: '500' },
            color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim()
          }
        }
      }
    }
  });
}

// 4. Aylık Kümülatif Çizgi Grafiği Çizimi (Slayt 1)
function renderCumulativeChart(labels, plannedCumulative, realizedCumulative) {
  const ctx = document.getElementById('cumulativeChart').getContext('2d');
  
  if (cumulativeChart) {
    cumulativeChart.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const linePlannedColor = isDark ? '#38bdf8' : '#1d4ed8'; // Sky Blue / Royal Blue
  const lineRealizedColor = isDark ? '#34d399' : '#059669'; // Light Green / Emerald

  cumulativeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Kümülatif Planlanan (m³)',
          data: plannedCumulative,
          borderColor: linePlannedColor,
          backgroundColor: linePlannedColor,
          borderWidth: 3,
          fill: false,
          tension: 0.15
        },
        {
          label: 'Kümülatif Ölçülen (m³)',
          data: realizedCumulative,
          borderColor: lineRealizedColor,
          backgroundColor: lineRealizedColor,
          borderWidth: 3,
          fill: false,
          tension: 0.15
        }
      ]
    },
    options: {
      devicePixelRatio: window.devicePixelRatio || 1,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
            font: { family: 'Inter', size: 9, weight: 'bold' }
          }
        },
        y: {
          border: { dash: [5, 5] },
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
            font: { family: 'Inter', size: 10 },
            stepSize: 500
          },
          title: {
            display: true,
            text: 'Kümülatif Miktar (m³)',
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
            font: { family: 'Inter', size: 10, weight: 'bold' }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Inter', size: 13, weight: '500' },
            color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim()
          }
        }
      }
    }
  });
}

// 5. Grafikler Arasında Slider (Kaydırmalı/Geçişli) Mantığı
function switchChartSlide(index) {
  currentChartSlide = index;
  
  const monthlySlide = document.getElementById('monthlyChartSlide');
  const cumulativeSlide = document.getElementById('cumulativeChartSlide');
  const titleEl = document.getElementById('monthlyChartTitle');
  const dots = document.querySelectorAll('.chart-dot');
  
  if (!monthlySlide || !cumulativeSlide) return;

  if (index === 0) {
    // Aylık Bar Grafiğini Göster
    monthlySlide.style.opacity = '1';
    monthlySlide.style.visibility = 'visible';
    monthlySlide.style.pointerEvents = 'auto';
    
    cumulativeSlide.style.opacity = '0';
    cumulativeSlide.style.visibility = 'hidden';
    cumulativeSlide.style.pointerEvents = 'none';
    
    if (titleEl) titleEl.innerText = 'Aylık Üretim Durumu (Planlanan vs. Ölçülen m³)';
  } else {
    // Kümülatif Çizgi Grafiğini Göster
    cumulativeSlide.style.opacity = '1';
    cumulativeSlide.style.visibility = 'visible';
    cumulativeSlide.style.pointerEvents = 'auto';
    
    monthlySlide.style.opacity = '0';
    monthlySlide.style.visibility = 'hidden';
    monthlySlide.style.pointerEvents = 'none';
    
    if (titleEl) titleEl.innerText = 'Kümülatif Üretim Durumu (Planlanan vs. Ölçülen m³)';
  }
  
  // Yuvarlakların aktifliğini güncelle
  dots.forEach((dot, idx) => {
    if (idx === index) {
      dot.style.backgroundColor = 'var(--primary)';
      dot.style.transform = 'scale(1.2)';
    } else {
      dot.style.backgroundColor = 'var(--border-color)';
      dot.style.transform = 'scale(1.0)';
    }
    dot.style.transition = 'background-color 0.2s, transform 0.2s';
  });
}

window.updateDashboardCharts = updateDashboardCharts;
window.switchChartSlide = switchChartSlide;
