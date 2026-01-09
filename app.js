async function startScan() {
  const btn = document.getElementById("scan-btn");
  const loader = document.getElementById("loader");
  const list = document.getElementById("network-list");

  // UI Feedback
  btn.disabled = true;
  btn.innerHTML = "SCANNING...";
  loader.classList.remove("hidden");
  loader.classList.add("loading");
  list.style.opacity = "0.5";

  try {
    // Mengambil data dari ESP8266 (Pastikan endpoint /scan-json ada di .ino)
    // Jika testing di komputer tanpa ESP, ini akan gagal, jadi kita pakai dummy data di catch block untuk demo
    const response = await fetch("http://192.168.4.1/scan-json", {
      method: "GET",
      mode: "cors", // Penting agar browser tau ini lintas domain
      timeout: 8000,
    });
    if (!response.ok) throw new Error("ESP Busy");
    const data = await response.json();
    renderNetworks(data.networks);
    updateStats(data.networks);
  } catch (error) {
    console.warn("Mode Demo Aktif (ESP tidak terdeteksi)");
    // DUMMY DATA UNTUK DEMO TAMPILAN
    const demoData = [
      { ssid: "Target_Office", bssid: "AA:BB:CC:11:22", channel: 6, rssi: -45 },
      { ssid: "Free_WiFi", bssid: "11:22:33:44:55", channel: 1, rssi: -80 },
      { ssid: "Hidden_Net", bssid: "FF:EE:DD:CC:BB", channel: 11, rssi: -65 },
    ];
    renderNetworks(demoData);
    updateStats(demoData);
  } finally {
    // Reset UI
    btn.disabled = false;
    btn.innerHTML = "INITIATE SCAN";
    loader.classList.remove("loading");
    loader.classList.add("hidden");
    list.style.opacity = "1";
  }
}

function renderNetworks(networks) {
  const list = document.getElementById("network-list");
  list.innerHTML = "";

  if (networks.length === 0) {
    list.innerHTML = `<div class="empty-state"><p>NO SIGNALS DETECTED</p></div>`;
    return;
  }

  networks.forEach((net) => {
    // Kalkulasi sinyal
    let quality = Math.min(Math.max(2 * (net.rssi + 100), 0), 100);
    let colorClass = quality > 70 ? "secure" : "weak";

    let html = `
            <div class="network-card ${colorClass}">
                <div class="net-header">
                    <span class="ssid">${net.ssid || "<HIDDEN>"}</span>
                    <span class="rssi">${net.rssi} dBm</span>
                </div>
                <div class="signal-bar-bg">
                    <div class="signal-bar-fill" style="width: ${quality}%"></div>
                </div>
                <div class="net-details">
                    <span>MAC: ${net.bssid}</span>
                    <span>CH: ${net.channel}</span>
                </div>
            </div>
        `;
    list.innerHTML += html;
  });
}

function updateStats(networks) {
  document.getElementById("total-nets").innerText = networks.length;

  // Cari sinyal terkuat
  if (networks.length > 0) {
    const best = networks.reduce((prev, current) =>
      prev.rssi > current.rssi ? prev : current
    );
    document.getElementById("best-signal").innerText = best.ssid.substring(
      0,
      8
    );
  }

  // Cari channel paling ramai (simple logic)
  if (networks.length > 0) {
    // Logika sederhana untuk demo
    document.getElementById("top-channel").innerText = networks[0].channel;
  }
}
