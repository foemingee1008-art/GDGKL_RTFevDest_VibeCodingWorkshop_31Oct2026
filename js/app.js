// Log In Sentinel Dashboard — Interactive SOC Application Controller
(function () {
  const state = {
    activeTab: "overview",
    activeRange: "24h",
    activeAiIndex: 0,
    logFilterOutcome: "ALL",
    logSearchQuery: "",
    alertFilterSeverity: "ALL",
    selectedIp: "192.168.1.45",
    liveStream: true,
    cachedEventsCount: 2400,
    totalAttemptsNum: 14821,
    successfulNum: 14205,
    failedNum: 616,
    suspiciousIpsNum: 18,
    autoBlockEnabled: true,
    mfaEnforcementEnabled: true,
    thresholdFailures: 5
  };

  // Toast Notification Helper
  window.showSentinelToast = function (title, message, tone = "primary") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toneColors = {
      primary: "border-primary/50 bg-surface-container-highest text-primary",
      secondary: "border-secondary/50 bg-surface-container-highest text-secondary",
      error: "border-error/60 bg-error-container/95 text-on-error-container",
      tertiary: "border-tertiary/50 bg-surface-container-highest text-tertiary"
    };
    const icons = {
      primary: "radar",
      secondary: "verified_user",
      error: "gpp_bad",
      tertiary: "warning"
    };

    const toast = document.createElement("div");
    toast.className = `pointer-events-auto flex items-start gap-2.5 px-3 py-2.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${toneColors[tone] || toneColors.primary}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">${icons[tone] || "info"}</span>
      <div class="flex flex-col min-w-0 flex-1">
        <span class="font-label-caps text-label-caps font-bold uppercase tracking-wider">${title}</span>
        <span class="font-code-sm text-code-sm text-on-surface mt-0.5 break-words">${message}</span>
      </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 3600);
  };

  // Tab Navigation
  window.switchSentinelTab = function (tabName) {
    state.activeTab = tabName;
    const tabTitles = {
      "overview": "Overview",
      "auth-logs": "Auth Logs",
      "threat-detection": "AI Threats",
      "security-alerts": "Alerts",
      "ip-analysis": "IP Trace",
      "settings": "Config"
    };

    const breadcrumbCurrent = document.getElementById("header-breadcrumb-current");
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = tabTitles[tabName] || "Overview";
    }

    // Toggle sections
    document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
      if (panel.getAttribute("data-tab-panel") === tabName) {
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
      }
    });

    // Update bottom nav active state
    document.querySelectorAll("nav a[data-path]").forEach((link) => {
      const path = link.getAttribute("data-path");
      if (path === tabName) {
        link.setAttribute("aria-current", "page");
        link.className = "flex flex-col items-center justify-center gap-0.5 min-w-[54px] h-12 rounded transition-all text-primary bg-surface-container-high/60";
      } else {
        link.removeAttribute("aria-current");
        link.className = "flex flex-col items-center justify-center gap-0.5 min-w-[54px] h-12 rounded text-on-surface-variant hover:text-on-surface transition-all";
      }
    });

    // Render dynamic tab views when entered
    if (tabName === "auth-logs") renderFullLogsTab();
    if (tabName === "threat-detection") renderThreatsTab();
    if (tabName === "security-alerts") renderAlertsTab();
    if (tabName === "ip-analysis") renderIpAnalysisTab();
    if (tabName === "settings") renderSettingsTab();

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Time Range Switching on Overview Chart
  window.setTelemetryRange = function (rangeKey) {
    const data = window.SENTINEL_DATA.timeRanges[rangeKey];
    if (!data) return;
    state.activeRange = rangeKey;

    // Update buttons
    document.querySelectorAll("[data-range-btn]").forEach((btn) => {
      if (btn.getAttribute("data-range-btn") === rangeKey) {
        btn.className = "flex-1 py-1 text-center font-code-sm text-code-sm bg-surface-container-high text-primary font-semibold rounded shadow-sm";
      } else {
        btn.className = "flex-1 py-1 text-center font-code-sm text-code-sm text-on-surface-variant hover:text-on-surface transition-colors rounded";
      }
    });

    // Update KPIs
    const elTotal = document.getElementById("kpi-total-attempts");
    const elTotalTrend = document.getElementById("kpi-total-trend");
    const elTotalLabel = document.getElementById("kpi-total-label");
    const elSuccess = document.getElementById("kpi-successful");
    const elPassRate = document.getElementById("kpi-pass-rate");
    const elFailed = document.getElementById("kpi-failed");
    const elFailSurge = document.getElementById("kpi-fail-surge");
    const elSuspicious = document.getElementById("kpi-suspicious-ips");
    const elSuspiciousStatus = document.getElementById("kpi-suspicious-status");

    if (elTotal) elTotal.textContent = data.kpis.totalAttempts;
    if (elTotalTrend) elTotalTrend.innerHTML = `<span class="material-symbols-outlined text-[12px]">arrow_upward</span>${data.kpis.totalTrend}`;
    if (elTotalLabel) elTotalLabel.textContent = data.kpis.totalLabel;
    if (elSuccess) elSuccess.textContent = data.kpis.successful;
    if (elPassRate) elPassRate.innerHTML = `<span class="material-symbols-outlined text-[12px]">north_east</span>${data.kpis.passRate}`;
    if (elFailed) elFailed.textContent = data.kpis.failed;
    if (elFailSurge) elFailSurge.innerHTML = `<span class="material-symbols-outlined text-[12px]">trending_up</span>${data.kpis.failSurge}`;
    if (elSuspicious) elSuspicious.textContent = data.kpis.suspiciousIps;
    if (elSuspiciousStatus) elSuspiciousStatus.textContent = data.kpis.suspiciousStatus;

    // Update SVG Paths & Spike Marker
    const successArea = document.getElementById("svg-success-area");
    const successLine = document.getElementById("svg-success-line");
    const failArea = document.getElementById("svg-fail-area");
    const failLine = document.getElementById("svg-fail-line");
    const spikePulse = document.getElementById("svg-spike-pulse");
    const spikeOuter = document.getElementById("svg-spike-outer");
    const spikeInner = document.getElementById("svg-spike-inner");
    const spikeGuide = document.getElementById("svg-spike-guide");
    const spikePopover = document.getElementById("chart-spike-popover");
    const spikeLabel = document.getElementById("chart-spike-label");
    const spikeTime = document.getElementById("chart-spike-time");
    const confidenceLabel = document.getElementById("chart-confidence-label");
    const xAxisContainer = document.getElementById("chart-xaxis-labels");

    if (successArea) successArea.setAttribute("d", data.successArea);
    if (successLine) successLine.setAttribute("d", data.successLine);
    if (failArea) failArea.setAttribute("d", data.failArea);
    if (failLine) failLine.setAttribute("d", data.failLine);

    if (spikePulse) {
      spikePulse.setAttribute("cx", data.spikeX);
      spikePulse.setAttribute("cy", data.spikeY);
      spikePulse.style.transformOrigin = `${data.spikeX}px ${data.spikeY}px`;
    }
    if (spikeOuter) {
      spikeOuter.setAttribute("cx", data.spikeX);
      spikeOuter.setAttribute("cy", data.spikeY);
    }
    if (spikeInner) {
      spikeInner.setAttribute("cx", data.spikeX);
      spikeInner.setAttribute("cy", data.spikeY);
    }
    if (spikeGuide) {
      spikeGuide.setAttribute("x1", data.spikeX);
      spikeGuide.setAttribute("x2", data.spikeX);
      spikeGuide.setAttribute("y1", data.spikeY);
    }
    if (spikePopover) {
      spikePopover.style.left = data.spikeLeftPercent;
    }
    if (spikeLabel) spikeLabel.textContent = data.spikeLabel;
    if (spikeTime) spikeTime.textContent = data.spikeTime;
    if (confidenceLabel) confidenceLabel.textContent = data.confidence;

    if (xAxisContainer) {
      xAxisContainer.innerHTML = data.xAxis
        .map((label, idx) =>
          idx === data.spikeAxisIndex
            ? `<span class="text-error font-bold">${label}</span>`
            : `<span>${label}</span>`
        )
        .join("");
    }
  };

  // Explainable AI Sentinel Panel Controls
  window.cycleAiDetection = function (direction = 1) {
    const list = window.SENTINEL_DATA.aiDetections;
    state.activeAiIndex = (state.activeAiIndex + direction + list.length) % list.length;
    renderOverviewAiPanel();
  };

  function renderOverviewAiPanel() {
    const det = window.SENTINEL_DATA.aiDetections[state.activeAiIndex];
    if (!det) return;

    const isBlocked = window.SENTINEL_DATA.blockedIps.has(det.sourceIp);
    const isTrusted = window.SENTINEL_DATA.trustedDetections.has(det.id);

    const titleEl = document.getElementById("ai-panel-title");
    const descEl = document.getElementById("ai-panel-desc");
    const deltaEl = document.getElementById("ai-panel-delta");
    const attemptsEl = document.getElementById("ai-panel-attempts");
    const ipEl = document.getElementById("ai-panel-ip");
    const targetEl = document.getElementById("ai-panel-target");
    const ruleNameEl = document.getElementById("ai-panel-rulename");
    const ruleCodeEl = document.getElementById("ai-panel-rulecode");
    const confTextEl = document.getElementById("ai-panel-conftext");
    const confBarEl = document.getElementById("ai-panel-confbar");
    const actionEl = document.getElementById("ai-panel-action");
    const badgeEl = document.getElementById("ai-panel-badge");
    const counterEl = document.getElementById("ai-panel-counter");
    const blockBtn = document.getElementById("ai-btn-block");
    const trustBtn = document.getElementById("ai-btn-trust");

    if (titleEl) titleEl.textContent = det.title;
    if (descEl) descEl.textContent = det.description;
    if (deltaEl) deltaEl.textContent = det.deltaT;
    if (attemptsEl) attemptsEl.textContent = det.evidenceAttempts;
    if (ipEl) ipEl.textContent = det.sourceIp;
    if (targetEl) targetEl.textContent = det.targetIdentity;
    if (ruleNameEl) ruleNameEl.textContent = det.ruleName;
    if (ruleCodeEl) ruleCodeEl.textContent = det.ruleCode;
    if (confTextEl) confTextEl.textContent = `${det.confidence}% High Confidence`;
    if (confBarEl) confBarEl.style.width = `${det.confidence}%`;
    if (actionEl) actionEl.textContent = det.suggestedAction;
    if (counterEl) counterEl.textContent = `${state.activeAiIndex + 1}/${window.SENTINEL_DATA.aiDetections.length}`;

    if (badgeEl) {
      if (isBlocked) {
        badgeEl.className = "flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container";
        badgeEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-secondary"></span><span class="font-label-caps text-label-caps font-bold">ISOLATED</span>`;
      } else if (isTrusted) {
        badgeEl.className = "flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant";
        badgeEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-outline"></span><span class="font-label-caps text-label-caps font-bold">DISMISSED</span>`;
      } else {
        badgeEl.className = "flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container";
        badgeEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span><span class="font-label-caps text-label-caps font-bold">${det.severity}</span>`;
      }
    }

    if (blockBtn) {
      if (isBlocked) {
        blockBtn.className = "w-full h-10 px-space-sm rounded bg-secondary-container text-on-secondary-container font-semibold font-body-sm text-body-sm flex items-center justify-center gap-1.5 shadow-sm transition-all";
        blockBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">check_circle</span><span>IP Isolated (${det.sourceIp})</span>`;
      } else {
        blockBtn.className = "w-full h-10 px-space-sm rounded bg-error text-surface font-semibold font-body-sm text-body-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all hover:opacity-95";
        blockBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">block</span><span>Block &amp; Isolate</span>`;
      }
    }

    if (trustBtn) {
      if (isTrusted) {
        trustBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] text-secondary">verified</span><span>Marked Trusted</span>`;
      } else {
        trustBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">rule</span><span>Dismiss / Trust</span>`;
      }
    }
  }

  window.handleAiBlockAction = function () {
    const det = window.SENTINEL_DATA.aiDetections[state.activeAiIndex];
    if (!det) return;

    if (window.SENTINEL_DATA.blockedIps.has(det.sourceIp)) {
      window.SENTINEL_DATA.blockedIps.delete(det.sourceIp);
      window.showSentinelToast("Isolation Lifted", `Host ${det.sourceIp} removed from perimeter drop rule.`, "primary");
    } else {
      window.SENTINEL_DATA.blockedIps.add(det.sourceIp);
      window.SENTINEL_DATA.trustedDetections.delete(det.id);
      window.showSentinelToast(
        "Host Blocked & Isolated",
        `BGP blackhole + WAF drop rule applied to ${det.sourceIp} (${det.ruleCode}).`,
        "error"
      );
    }
    renderOverviewAiPanel();
    renderOverviewLogsTable();
  };

  window.handleAiTrustAction = function () {
    const det = window.SENTINEL_DATA.aiDetections[state.activeAiIndex];
    if (!det) return;

    if (window.SENTINEL_DATA.trustedDetections.has(det.id)) {
      window.SENTINEL_DATA.trustedDetections.delete(det.id);
      window.showSentinelToast("Finding Re-opened", `${det.ruleCode} restored to active triage queue.`, "primary");
    } else {
      window.SENTINEL_DATA.trustedDetections.add(det.id);
      window.SENTINEL_DATA.blockedIps.delete(det.sourceIp);
      window.showSentinelToast(
        "Alert Dismissed / Trusted",
        `Telemetry pattern for ${det.sourceIp} whitelisted for 24h.`,
        "secondary"
      );
    }
    renderOverviewAiPanel();
  };

  // Render Overview Logs Table (Top 5)
  function renderOverviewLogsTable() {
    const tbody = document.getElementById("overview-logs-tbody");
    if (!tbody) return;

    const topLogs = window.SENTINEL_DATA.logs.slice(0, 5);
    tbody.innerHTML = topLogs
      .map((row) => {
        const isBlocked = window.SENTINEL_DATA.blockedIps.has(row.ip);
        const outcomeBadge =
          isBlocked
            ? `<span class="px-1.5 py-0.5 rounded bg-surface-container-highest text-primary text-[10px] font-bold">DROP</span>`
            : row.outcome === "PASS"
            ? `<span class="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold">PASS</span>`
            : row.risk >= 80
            ? `<span class="px-1.5 py-0.5 rounded bg-error-container text-on-error-container text-[10px] font-bold">FAIL</span>`
            : `<span class="px-1.5 py-0.5 rounded bg-surface-variant text-tertiary text-[10px] font-bold">FAIL</span>`;

        const riskColor =
          row.risk >= 80
            ? "text-error"
            : row.risk >= 50
            ? "text-tertiary"
            : "text-secondary";

        const riskStr = String(row.risk).padStart(2, "0");

        return `
          <tr onclick="inspectIpFromRow('${row.ip}')" class="hover:bg-surface-container-high/50 transition-colors cursor-pointer">
            <td class="py-2.5 px-2.5 text-on-surface-variant">${row.time}</td>
            <td class="py-2.5 px-2 text-primary">${row.ip}${isBlocked ? ' <span class="text-[10px] text-error">[BLK]</span>' : ""}</td>
            <td class="py-2.5 px-2 text-on-surface font-body-sm text-body-sm">${row.user}</td>
            <td class="py-2.5 px-2 text-center">${outcomeBadge}</td>
            <td class="py-2.5 px-2.5 text-right font-bold ${riskColor}">${riskStr}</td>
          </tr>
        `;
      })
      .join("");
  }

  window.inspectIpFromRow = function (ip) {
    state.selectedIp = ip;
    window.switchSentinelTab("ip-analysis");
    window.showSentinelToast("IP Trace Pivot", `Loaded forensic telemetry for ${ip}`, "primary");
  };

  // Incident Detail Modal
  window.openIncidentModal = function (incidentId) {
    const inc = window.SENTINEL_DATA.incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    const modal = document.getElementById("incident-modal");
    const content = document.getElementById("incident-modal-body");
    if (!modal || !content) return;

    const isBlocked = window.SENTINEL_DATA.blockedIps.has(inc.ip);
    const sevClass =
      inc.severity === "CRIT"
        ? "bg-error-container text-on-error-container"
        : inc.severity === "HIGH"
        ? "bg-surface-container-highest text-tertiary"
        : inc.severity === "MED"
        ? "bg-surface-container-highest text-primary"
        : "bg-surface-container-highest text-secondary";

    content.innerHTML = `
      <div class="flex items-start justify-between gap-2 border-b border-surface-container-high pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-code-sm text-code-sm px-1.5 py-0.5 rounded font-bold ${sevClass}">${inc.severity}</span>
            <span class="font-code-sm text-code-sm text-on-surface-variant">${inc.id}</span>
            <span class="font-code-sm text-code-sm text-outline">•</span>
            <span class="font-code-sm text-code-sm text-primary">${inc.rule}</span>
          </div>
          <h3 class="font-headline-sm text-headline-sm font-semibold text-on-surface mt-1">${inc.title}</h3>
        </div>
        <button onclick="closeIncidentModal()" class="w-8 h-8 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="space-y-2.5 py-3 font-body-sm text-body-sm">
        <p class="text-on-surface-variant leading-relaxed">${inc.details}</p>

        <div class="grid grid-cols-2 gap-2 font-code-sm text-code-sm">
          <div class="bg-surface-container p-2 rounded">
            <span class="font-label-caps text-label-caps text-on-surface-variant block">SOURCE HOST</span>
            <span class="text-primary font-semibold">${inc.ip}</span>
          </div>
          <div class="bg-surface-container p-2 rounded">
            <span class="font-label-caps text-label-caps text-on-surface-variant block">TARGET IDENTITY</span>
            <span class="text-on-surface font-semibold">${inc.user}</span>
          </div>
          <div class="bg-surface-container p-2 rounded">
            <span class="font-label-caps text-label-caps text-on-surface-variant block">GEO / ORIGIN</span>
            <span class="text-on-surface">${inc.location}</span>
          </div>
          <div class="bg-surface-container p-2 rounded">
            <span class="font-label-caps text-label-caps text-on-surface-variant block">MITRE ATT&amp;CK</span>
            <span class="text-tertiary">${inc.mitre}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container-high">
        <button onclick="toggleBlockIp('${inc.ip}'); closeIncidentModal();" class="h-10 px-3 rounded ${isBlocked ? 'bg-secondary-container text-on-secondary-container' : 'bg-error text-surface'} font-semibold font-body-sm text-body-sm flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">${isBlocked ? 'Lock_open' : 'block'}</span>
          <span>${isBlocked ? 'Unblock Host' : 'Isolate Host'}</span>
        </button>
        <button onclick="closeIncidentModal(); inspectIpFromRow('${inc.ip}');" class="h-10 px-3 rounded bg-surface-container-highest text-primary font-body-sm text-body-sm flex items-center justify-center gap-1.5 hover:bg-surface-bright">
          <span class="material-symbols-outlined text-[18px]">travel_explore</span>
          <span>Pivot IP Trace</span>
        </button>
      </div>
    `;

    modal.classList.remove("hidden");
  };

  window.closeIncidentModal = function () {
    const modal = document.getElementById("incident-modal");
    if (modal) modal.classList.add("hidden");
  };

  window.toggleBlockIp = function (ip) {
    if (window.SENTINEL_DATA.blockedIps.has(ip)) {
      window.SENTINEL_DATA.blockedIps.delete(ip);
      window.showSentinelToast("Host Unblocked", `${ip} removed from active perimeter blocklist.`, "primary");
    } else {
      window.SENTINEL_DATA.blockedIps.add(ip);
      window.showSentinelToast("Host Isolated", `Perimeter drop rule active for ${ip}.`, "error");
    }
    renderOverviewAiPanel();
    renderOverviewLogsTable();
    if (state.activeTab === "auth-logs") renderFullLogsTab();
    if (state.activeTab === "ip-analysis") renderIpAnalysisTab();
    if (state.activeTab === "security-alerts") renderAlertsTab();
  };

  // Export PCAP / JSON Telemetry
  window.exportTelemetryPcap = function () {
    const payload = {
      exportedAt: new Date().toISOString(),
      engineVersion: "v4.2.0-SEC",
      cluster: window.SENTINEL_DATA.cluster,
      activeRange: state.activeRange,
      blockedHosts: Array.from(window.SENTINEL_DATA.blockedIps),
      incidents: window.SENTINEL_DATA.incidents,
      recentAuthStream: window.SENTINEL_DATA.logs
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel-capture-${window.SENTINEL_DATA.cluster.toLowerCase()}-${Date.now()}.pcap.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    window.showSentinelToast("PCAP Telemetry Exported", `Saved ${window.SENTINEL_DATA.logs.length} packet records to disk.`, "secondary");
  };

  // Simulate Live Event Injection
  window.injectLiveAuthEvent = function (forceAttack = false) {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const attackPool = [
      { ip: "192.168.1.45", user: "admin", outcome: "FAIL", risk: 92, proto: "HTTPS/TLS1.3", asn: "AS44901", geo: "NL" },
      { ip: "192.168.1.108", user: "svc_deploy", outcome: "FAIL", risk: 95, proto: "MFA-PUSH", asn: "AS24940", geo: "DE" },
      { ip: "198.51.100.2", user: "root", outcome: "FAIL", risk: 79, proto: "SSH-2.0", asn: "AS9009", geo: "RO" },
      { ip: "45.33.32.156", user: "ubuntu", outcome: "FAIL", risk: 71, proto: "SSH-2.0", asn: "AS63949", geo: "US" }
    ];
    const benignPool = [
      { ip: "104.28.19.4", user: "sarah.c", outcome: "PASS", risk: 3, proto: "OIDC/FIDO2", asn: "AS13335", geo: "US" },
      { ip: "172.16.0.88", user: "dev_ops", outcome: "PASS", risk: 9, proto: "SSH-2.0-Ed25519", asn: "INTERNAL", geo: "US-EAST" },
      { ip: "104.28.19.12", user: "alex.r", outcome: "PASS", risk: 4, proto: "OIDC/FIDO2", asn: "AS13335", geo: "US" }
    ];

    const pick = forceAttack || Math.random() < 0.42
      ? attackPool[Math.floor(Math.random() * attackPool.length)]
      : benignPool[Math.floor(Math.random() * benignPool.length)];

    const newEntry = {
      id: "LOG-" + Math.floor(1000 + Math.random() * 9000),
      time: timeStr,
      ip: pick.ip,
      user: pick.user,
      outcome: pick.outcome,
      risk: pick.risk,
      proto: pick.proto,
      asn: pick.asn,
      geo: pick.geo
    };

    window.SENTINEL_DATA.logs.unshift(newEntry);
    if (window.SENTINEL_DATA.logs.length > 40) {
      window.SENTINEL_DATA.logs.pop();
    }

    state.cachedEventsCount += 1;
    state.totalAttemptsNum += 1;
    if (pick.outcome === "PASS") {
      state.successfulNum += 1;
    } else {
      state.failedNum += 1;
    }

    const syncLabel = document.getElementById("sync-buffer-label");
    if (syncLabel) {
      syncLabel.textContent = `Sync buffer: ${state.cachedEventsCount.toLocaleString()} events cached`;
    }

    if (state.activeRange === "24h") {
      const elTotal = document.getElementById("kpi-total-attempts");
      const elSuccess = document.getElementById("kpi-successful");
      const elFailed = document.getElementById("kpi-failed");
      if (elTotal) elTotal.textContent = state.totalAttemptsNum.toLocaleString();
      if (elSuccess) elSuccess.textContent = state.successfulNum.toLocaleString();
      if (elFailed) elFailed.textContent = state.failedNum.toLocaleString();
    }

    renderOverviewLogsTable();
    if (state.activeTab === "auth-logs") renderFullLogsTab();

    if (forceAttack) {
      window.showSentinelToast("Simulated Attack Vector", `Ingested ${pick.outcome} attempt from ${pick.ip} (${pick.user})`, "error");
    }
  };

  // Tab 2: Full Authentication Logs Renderer
  window.renderFullLogsTab = function () {
    const container = document.getElementById("tab-logs-content");
    if (!container) return;

    const query = state.logSearchQuery.trim().toLowerCase();
    const filtered = window.SENTINEL_DATA.logs.filter((row) => {
      if (state.logFilterOutcome !== "ALL" && row.outcome !== state.logFilterOutcome) return false;
      if (!query) return true;
      return (
        row.ip.toLowerCase().includes(query) ||
        row.user.toLowerCase().includes(query) ||
        row.outcome.toLowerCase().includes(query) ||
        (row.proto && row.proto.toLowerCase().includes(query)) ||
        (row.geo && row.geo.toLowerCase().includes(query))
      );
    });

    container.innerHTML = `
      <div class="bg-surface-container-low rounded-lg p-space-md shadow-md flex flex-col space-y-space-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[18px]">lock_clock</span>
            <span class="font-headline-sm text-headline-sm font-semibold text-on-surface">SIEM Authentication Stream</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="injectLiveAuthEvent(true)" class="px-2 py-1 rounded bg-error-container text-on-error-container font-code-sm text-code-sm font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">bolt</span> Simulate Burst
            </button>
            <button onclick="exportTelemetryPcap()" class="px-2 py-1 rounded bg-surface-container-high text-primary font-code-sm text-code-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">download</span> Export
            </button>
          </div>
        </div>

        <!-- KQL Search & Outcome Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="relative flex-1">
            <span class="material-symbols-outlined text-outline text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
            <input
              id="siem-kql-input"
              type="text"
              value="${state.logSearchQuery}"
              oninput="updateLogSearch(this.value)"
              placeholder="Filter KQL: ip, user (admin, root), protocol, geo..."
              class="w-full h-9 pl-8 pr-3 rounded bg-surface-container-lowest border border-surface-container-highest text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div class="flex items-center gap-1 bg-surface-container-lowest p-1 rounded">
            ${["ALL", "FAIL", "PASS"]
              .map(
                (f) => `
              <button
                onclick="setLogOutcomeFilter('${f}')"
                class="px-2.5 py-1 rounded font-code-sm text-code-sm transition-colors ${
                  state.logFilterOutcome === f
                    ? "bg-surface-container-high text-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }"
              >${f}</button>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="w-full overflow-x-auto rounded bg-surface-container-lowest">
          <table class="w-full text-left border-collapse min-w-[460px]">
            <thead>
              <tr class="bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps">
                <th class="py-2 px-2.5">TIME</th>
                <th class="py-2 px-2">SOURCE IP</th>
                <th class="py-2 px-2">IDENTITY</th>
                <th class="py-2 px-2">PROTOCOL</th>
                <th class="py-2 px-2 text-center">OUTCOME</th>
                <th class="py-2 px-2 text-right">RISK</th>
                <th class="py-2 px-2.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container-high font-code-sm text-code-sm">
              ${filtered
                .map((row) => {
                  const isBlocked = window.SENTINEL_DATA.blockedIps.has(row.ip);
                  const riskColor =
                    row.risk >= 80 ? "text-error" : row.risk >= 50 ? "text-tertiary" : "text-secondary";
                  return `
                  <tr class="hover:bg-surface-container-high/50 transition-colors">
                    <td class="py-2.5 px-2.5 text-on-surface-variant">${row.time}</td>
                    <td class="py-2.5 px-2 text-primary cursor-pointer hover:underline" onclick="inspectIpFromRow('${row.ip}')">${row.ip}</td>
                    <td class="py-2.5 px-2 text-on-surface">${row.user}</td>
                    <td class="py-2.5 px-2 text-on-surface-variant">${row.proto || "HTTPS/TLS1.3"}</td>
                    <td class="py-2.5 px-2 text-center">
                      ${
                        isBlocked
                          ? `<span class="px-1.5 py-0.5 rounded bg-surface-container-highest text-primary text-[10px] font-bold">DROP</span>`
                          : row.outcome === "PASS"
                          ? `<span class="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold">PASS</span>`
                          : `<span class="px-1.5 py-0.5 rounded bg-error-container text-on-error-container text-[10px] font-bold">FAIL</span>`
                      }
                    </td>
                    <td class="py-2.5 px-2 text-right font-bold ${riskColor}">${String(row.risk).padStart(2, "0")}</td>
                    <td class="py-2.5 px-2.5 text-right">
                      <button onclick="toggleBlockIp('${row.ip}')" class="px-2 py-0.5 rounded ${
                    isBlocked
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-container-highest text-on-surface hover:text-error"
                  } text-[10px] font-semibold">
                        ${isBlocked ? "UNBLOCK" : "BLOCK IP"}
                      </button>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between text-on-surface-variant font-code-sm text-code-sm">
          <span>Showing ${filtered.length} of ${window.SENTINEL_DATA.logs.length} live buffer rows</span>
          <span> Engine: KQL-v4</span>
        </div>
      </div>
    `;
  };

  window.updateLogSearch = function (val) {
    state.logSearchQuery = val;
    renderFullLogsTab();
    const input = document.getElementById("siem-kql-input");
    if (input) {
      input.focus();
      input.setSelectionRange(val.length, val.length);
    }
  };

  window.setLogOutcomeFilter = function (filter) {
    state.logFilterOutcome = filter;
    renderFullLogsTab();
  };

  // Tab 3: Explainable AI Threats & Correlation Matrix
  window.renderThreatsTab = function () {
    const container = document.getElementById("tab-threats-content");
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-space-md">
        <div class="bg-surface-container-low rounded-lg p-space-md shadow-md">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">shield</span>
              <span class="font-headline-sm text-headline-sm font-semibold text-on-surface">Heuristic Correlation Engine</span>
            </div>
            <span class="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-highest text-secondary">3 ACTIVE MODELS</span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant">
            Real-time behavioral scoring combining credential stuffing velocity, ASN geo-impossibility, and MFA prompt fatigue telemetry.
          </p>
        </div>

        ${window.SENTINEL_DATA.aiDetections
          .map((det) => {
            const isBlocked = window.SENTINEL_DATA.blockedIps.has(det.sourceIp);
            return `
            <div class="bg-surface-container-low rounded-lg p-space-md shadow-md flex flex-col space-y-space-sm relative overflow-hidden">
              <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-error via-tertiary-container to-primary"></div>
              <div class="flex items-center justify-between pt-1">
                <div class="flex items-center gap-2">
                  <span class="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-highest text-primary font-bold">${det.ruleCode}</span>
                  <span class="font-headline-sm text-headline-sm font-semibold text-on-surface">${det.title}</span>
                </div>
                <span class="font-label-caps text-label-caps px-2 py-0.5 rounded-full ${
                  isBlocked
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-error-container text-on-error-container"
                } font-bold">${isBlocked ? "ISOLATED" : det.severity}</span>
              </div>

              <p class="font-body-sm text-body-sm text-on-surface-variant">${det.description}</p>

              <div class="grid grid-cols-2 gap-2 font-code-sm text-code-sm">
                <div class="bg-surface-container p-2 rounded">
                  <span class="font-label-caps text-label-caps text-on-surface-variant block">EVIDENCE VECTOR</span>
                  <span class="text-error font-semibold">${det.evidenceAttempts} (${det.deltaT})</span>
                </div>
                <div class="bg-surface-container p-2 rounded">
                  <span class="font-label-caps text-label-caps text-on-surface-variant block">SOURCE / TARGET</span>
                  <span class="text-primary">${det.sourceIp}</span> → <span class="text-tertiary">${det.targetIdentity}</span>
                </div>
              </div>

              <div class="bg-surface-container p-2 rounded flex items-center justify-between font-code-sm text-code-sm">
                <span class="text-on-surface-variant">MITRE ATT&amp;CK: <strong class="text-on-surface">${det.mitre}</strong></span>
                <span class="text-error font-bold">${det.confidence}% Confidence</span>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <button onclick="toggleBlockIp('${det.sourceIp}'); renderThreatsTab();" class="flex-1 h-9 rounded ${
              isBlocked ? "bg-secondary-container text-on-secondary-container" : "bg-error text-surface"
            } font-semibold font-body-sm text-body-sm flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">${isBlocked ? "check_circle" : "block"}</span>
                  <span>${isBlocked ? "Host Isolated" : "Execute Containment"}</span>
                </button>
                <button onclick="inspectIpFromRow('${det.sourceIp}')" class="px-3 h-9 rounded bg-surface-container-highest text-primary font-code-sm text-code-sm flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">travel_explore</span> Trace IP
                </button>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  };

  // Tab 4: Priority Security Alerts
  window.renderAlertsTab = function () {
    const container = document.getElementById("tab-alerts-content");
    if (!container) return;

    const filtered = window.SENTINEL_DATA.incidents.filter((inc) =>
      state.alertFilterSeverity === "ALL" ? true : inc.severity === state.alertFilterSeverity
    );

    container.innerHTML = `
      <div class="bg-surface-container-low rounded-lg p-space-md shadow-md flex flex-col space-y-space-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-tertiary text-[18px]">warning</span>
            <span class="font-headline-sm text-headline-sm font-semibold text-on-surface">Incident Triage Queue (${filtered.length})</span>
          </div>
          <div class="flex items-center gap-1 bg-surface-container-lowest p-0.5 rounded">
            ${["ALL", "CRIT", "HIGH", "MED", "LOW"]
              .map(
                (sev) => `
              <button
                onclick="setAlertSeverityFilter('${sev}')"
                class="px-2 py-0.5 rounded font-code-sm text-code-sm ${
                  state.alertFilterSeverity === sev
                    ? "bg-surface-container-high text-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }"
              >${sev}</button>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="space-y-space-xs">
          ${filtered
            .map((inc) => {
              const isBlocked = window.SENTINEL_DATA.blockedIps.has(inc.ip);
              const dotClass =
                inc.severity === "CRIT"
                  ? "bg-error animate-ping"
                  : inc.severity === "HIGH"
                  ? "bg-tertiary-container"
                  : inc.severity === "MED"
                  ? "bg-primary"
                  : "bg-secondary-container";
              const badgeClass =
                inc.severity === "CRIT"
                  ? "text-error bg-error-container"
                  : inc.severity === "HIGH"
                  ? "text-tertiary bg-surface-container-highest"
                  : inc.severity === "MED"
                  ? "text-primary bg-surface-container-highest"
                  : "text-secondary bg-surface-container-highest";

              return `
              <div onclick="openIncidentModal('${inc.id}')" class="bg-surface-container p-space-sm rounded flex items-center justify-between gap-space-sm hover:bg-surface-container-high transition-colors cursor-pointer">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="w-2 h-2 rounded-full ${dotClass} shrink-0"></span>
                  <div class="flex flex-col min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-body-md text-body-md font-semibold text-on-surface truncate">${inc.title}</span>
                      <span class="font-code-sm text-code-sm px-1 rounded ${badgeClass}">${inc.severity}</span>
                      ${isBlocked ? `<span class="font-code-sm text-code-sm px-1 rounded bg-secondary-container text-on-secondary-container">ISOLATED</span>` : ""}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="font-code-sm text-code-sm text-primary">${inc.ip}</span>
                      <span class="text-outline font-label-caps text-label-caps">•</span>
                      <span class="font-label-caps text-label-caps text-on-surface-variant">${inc.location}</span>
                      <span class="text-outline font-label-caps text-label-caps">•</span>
                      <span class="font-label-caps text-label-caps text-on-surface-variant">${inc.timeAgo}</span>
                    </div>
                  </div>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">arrow_forward_ios</span>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  };

  window.setAlertSeverityFilter = function (sev) {
    state.alertFilterSeverity = sev;
    renderAlertsTab();
  };

  // Tab 5: IP Trace & Geo-Velocity Intelligence
  window.renderIpAnalysisTab = function () {
    const container = document.getElementById("tab-ip-content");
    if (!container) return;

    const ips = Object.keys(window.SENTINEL_DATA.ipIntelligence);
    const activeIntel =
      window.SENTINEL_DATA.ipIntelligence[state.selectedIp] ||
      window.SENTINEL_DATA.ipIntelligence["192.168.1.45"];
    const isBlocked = window.SENTINEL_DATA.blockedIps.has(activeIntel.ip);

    container.innerHTML = `
      <div class="space-y-space-md">
        <div class="bg-surface-container-low rounded-lg p-space-md shadow-md space-y-space-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">travel_explore</span>
              <span class="font-headline-sm text-headline-sm font-semibold text-on-surface">Suspicious IP Forensic Trace</span>
            </div>
            <span class="font-code-sm text-code-sm text-on-surface-variant">${window.SENTINEL_DATA.blockedIps.size} Blocked</span>
          </div>

          <!-- Tracked IP Selector Pills -->
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${ips
              .map(
                (ip) => `
              <button
                onclick="selectIpForTrace('${ip}')"
                class="px-2.5 py-1 rounded font-code-sm text-code-sm transition-colors flex items-center gap-1 ${
                  activeIntel.ip === ip
                    ? "bg-primary text-on-primary font-bold"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }"
              >
                <span>${ip}</span>
                ${window.SENTINEL_DATA.blockedIps.has(ip) ? `<span class="material-symbols-outlined text-[12px]">block</span>` : ""}
              </button>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Detailed IP Dossier Card -->
        <div class="bg-surface-container-low rounded-lg p-space-md shadow-md space-y-space-sm">
          <div class="flex items-start justify-between">
            <div>
              <span class="font-label-caps text-label-caps text-on-surface-variant">TARGET IPV4 ENDPOINT</span>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-headline-md text-headline-md font-bold text-primary font-code-lg">${activeIntel.ip}</span>
                <span class="font-code-sm text-code-sm px-2 py-0.5 rounded font-bold ${
                  isBlocked
                    ? "bg-secondary-container text-on-secondary-container"
                    : activeIntel.riskScore >= 80
                    ? "bg-error-container text-on-error-container"
                    : "bg-surface-container-highest text-tertiary"
                }">${isBlocked ? "PERIMETER BLOCKED" : activeIntel.reputation}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="font-label-caps text-label-caps text-on-surface-variant block">RISK SCORE</span>
              <span class="font-headline-md text-headline-md font-bold ${
                activeIntel.riskScore >= 80 ? "text-error" : "text-secondary"
              }">${activeIntel.riskScore}/100</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 font-code-sm text-code-sm">
            <div class="bg-surface-container p-2.5 rounded">
              <span class="font-label-caps text-label-caps text-on-surface-variant block">ASN / NETWORK</span>
              <span class="text-on-surface">${activeIntel.asn}</span>
            </div>
            <div class="bg-surface-container p-2.5 rounded">
              <span class="font-label-caps text-label-caps text-on-surface-variant block">GEOLOCATION</span>
              <span class="text-on-surface">${activeIntel.location}</span>
            </div>
            <div class="bg-surface-container p-2.5 rounded">
              <span class="font-label-caps text-label-caps text-on-surface-variant block">AUTH OUTCOMES</span>
              <span class="text-error font-bold">${activeIntel.failedCount} FAIL</span> / <span class="text-secondary font-bold">${activeIntel.successCount} PASS</span>
            </div>
            <div class="bg-surface-container p-2.5 rounded">
              <span class="font-label-caps text-label-caps text-on-surface-variant block">TARGETED IDENTITIES</span>
              <span class="text-tertiary">${activeIntel.targetedUsers.join(", ")}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5 pt-1">
            ${activeIntel.tags
              .map(
                (t) =>
                  `<span class="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-highest text-primary">#${t}</span>`
              )
              .join("")}
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2">
            <button onclick="toggleBlockIp('${activeIntel.ip}')" class="h-10 rounded font-semibold font-body-sm text-body-sm flex items-center justify-center gap-1.5 ${
      isBlocked ? "bg-secondary-container text-on-secondary-container" : "bg-error text-surface"
    }">
              <span class="material-symbols-outlined text-[18px]">${isBlocked ? "lock_open" : "block"}</span>
              <span>${isBlocked ? "Remove Firewall Drop" : "Block & Isolate IP"}</span>
            </button>
            <button onclick="filterLogsByIp('${activeIntel.ip}')" class="h-10 rounded bg-surface-container-highest text-on-surface hover:bg-surface-bright font-body-sm text-body-sm flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">terminal</span>
              <span>View Raw Logs</span>
            </button>
          </div>
        </div>
      </div>
    `;
  };

  window.selectIpForTrace = function (ip) {
    state.selectedIp = ip;
    renderIpAnalysisTab();
  };

  window.filterLogsByIp = function (ip) {
    state.logSearchQuery = ip;
    state.logFilterOutcome = "ALL";
    window.switchSentinelTab("auth-logs");
  };

  // Tab 6: Sentinel Engine Configuration
  window.renderSettingsTab = function () {
    const container = document.getElementById("tab-settings-content");
    if (!container) return;

    const clusters = [
      "US-EAST-AUTH-CLUSTER-9",
      "EU-CENTRAL-AUTH-CLUSTER-4",
      "AP-SOUTH-EDGE-CLUSTER-2"
    ];

    container.innerHTML = `
      <div class="space-y-space-md">
        <div class="bg-surface-container-low rounded-lg p-space-md shadow-md space-y-space-sm">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">settings</span>
            <span class="font-headline-sm text-headline-sm font-semibold text-on-surface">Sentinel Engine Configuration</span>
          </div>

          <div class="space-y-3 pt-1">
            <div>
              <label class="font-label-caps text-label-caps text-on-surface-variant block mb-1">ACTIVE TELEMETRY CLUSTER</label>
              <select onchange="changeActiveCluster(this.value)" class="w-full h-10 px-3 rounded bg-surface-container-lowest border border-surface-container-highest text-on-surface font-code-sm text-code-sm">
                ${clusters
                  .map(
                    (c) =>
                      `<option value="${c}" ${window.SENTINEL_DATA.cluster === c ? "selected" : ""}>${c}</option>`
                  )
                  .join("")}
              </select>
            </div>

            <div class="flex items-center justify-between bg-surface-container p-3 rounded">
              <div>
                <span class="font-body-md text-body-md font-semibold text-on-surface block">Live Telemetry Stream (14ms Tick)</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">Continuously ingest real-time authentication events</span>
              </div>
              <button onclick="toggleLiveStream()" class="px-3 py-1.5 rounded font-code-sm text-code-sm font-bold ${
                state.liveStream ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-highest text-on-surface-variant"
              }">
                ${state.liveStream ? "ENABLED" : "PAUSED"}
              </button>
            </div>

            <div class="flex items-center justify-between bg-surface-container p-3 rounded">
              <div>
                <span class="font-body-md text-body-md font-semibold text-on-surface block">Automated BGP / WAF Auto-Isolation</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">Trigger instant perimeter block when confidence &ge; 95%</span>
              </div>
              <button onclick="toggleConfigFlag('autoBlockEnabled')" class="px-3 py-1.5 rounded font-code-sm text-code-sm font-bold ${
                state.autoBlockEnabled ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
              }">
                ${state.autoBlockEnabled ? "ACTIVE" : "MANUAL"}
              </button>
            </div>

            <div class="flex items-center justify-between bg-surface-container p-3 rounded">
              <div>
                <span class="font-body-md text-body-md font-semibold text-on-surface block">Mandatory Out-of-Band FIDO2 Step-Up</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">Enforce hardware token challenge on RULE-AUTH-04</span>
              </div>
              <button onclick="toggleConfigFlag('mfaEnforcementEnabled')" class="px-3 py-1.5 rounded font-code-sm text-code-sm font-bold ${
                state.mfaEnforcementEnabled ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
              }">
                ${state.mfaEnforcementEnabled ? "ENFORCED" : "DISABLED"}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  window.changeActiveCluster = function (clusterName) {
    window.SENTINEL_DATA.cluster = clusterName;
    const label = document.getElementById("cluster-name-label");
    if (label) label.textContent = `CLUSTER: ${clusterName}`;
    window.showSentinelToast("Cluster Switched", `Bound telemetry stream to ${clusterName}`, "primary");
  };

  window.toggleLiveStream = function () {
    state.liveStream = !state.liveStream;
    const badge = document.getElementById("live-stream-status-text");
    if (badge) badge.textContent = state.liveStream ? "LIVE (14 ms)" : "PAUSED";
    renderSettingsTab();
    window.showSentinelToast(
      state.liveStream ? "Live Stream Resumed" : "Live Stream Paused",
      state.liveStream ? "Receiving real-time syslog & OIDC events." : "Telemetry ingestion buffer paused.",
      state.liveStream ? "secondary" : "tertiary"
    );
  };

  window.toggleConfigFlag = function (key) {
    state[key] = !state[key];
    renderSettingsTab();
    window.showSentinelToast("Policy Updated", `Configuration flag '${key}' set to ${state[key]}`, "primary");
  };

  // Command Palette (⌘K)
  window.openCommandPalette = function () {
    const modal = document.getElementById("cmd-palette-modal");
    const input = document.getElementById("cmd-palette-input");
    if (modal) {
      modal.classList.remove("hidden");
      renderCommandPaletteResults("");
      if (input) {
        input.value = "";
        setTimeout(() => input.focus(), 50);
      }
    }
  };

  window.closeCommandPalette = function () {
    const modal = document.getElementById("cmd-palette-modal");
    if (modal) modal.classList.add("hidden");
  };

  window.renderCommandPaletteResults = function (query) {
    const listEl = document.getElementById("cmd-palette-results");
    if (!listEl) return;

    const actions = [
      { label: "Go to Security Overview", tag: "NAV", icon: "dashboard", run: () => switchSentinelTab("overview") },
      { label: "Explore Raw Auth Logs (SIEM)", tag: "NAV", icon: "lock_clock", run: () => switchSentinelTab("auth-logs") },
      { label: "Explainable AI Threat Correlation", tag: "NAV", icon: "shield", run: () => switchSentinelTab("threat-detection") },
      { label: "Triage Priority Incidents (14)", tag: "NAV", icon: "warning", run: () => switchSentinelTab("security-alerts") },
      { label: "Trace Suspicious Host 192.168.1.45", tag: "TRACE", icon: "travel_explore", run: () => inspectIpFromRow("192.168.1.45") },
      { label: "Block & Isolate 192.168.1.45 (RULE-AUTH-04)", tag: "SOAR", icon: "block", run: () => toggleBlockIp("192.168.1.45") },
      { label: "Simulate Brute-Force Attack Burst", tag: "TEST", icon: "bolt", run: () => injectLiveAuthEvent(true) },
      { label: "Export PCAP / JSON Telemetry Capture", tag: "EXPORT", icon: "download", run: () => exportTelemetryPcap() }
    ];

    const q = (query || "").toLowerCase().trim();
    const matches = actions.filter((a) => !q || a.label.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q));

    window._cmdActions = matches;
    listEl.innerHTML = matches
      .map(
        (item, idx) => `
      <button
        onclick="executeCmdAction(${idx})"
        class="w-full px-3 py-2 rounded flex items-center justify-between hover:bg-surface-container-high text-left transition-colors"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="material-symbols-outlined text-primary text-[18px]">${item.icon}</span>
          <span class="font-body-sm text-body-sm text-on-surface truncate">${item.label}</span>
        </div>
        <span class="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">${item.tag}</span>
      </button>
    `
      )
      .join("");
  };

  window.executeCmdAction = function (idx) {
    const action = window._cmdActions && window._cmdActions[idx];
    closeCommandPalette();
    if (action && action.run) action.run();
  };

  // Initialize event listeners & live ticker on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    renderOverviewAiPanel();
    renderOverviewLogsTable();

    // Keyboard shortcut Cmd+K / Ctrl+K / Escape
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key === "Escape") {
        closeCommandPalette();
        closeIncidentModal();
      }
    });

    // Periodic live stream simulation every 6.5 seconds
    setInterval(() => {
      if (state.liveStream) {
        injectLiveAuthEvent(false);
      }
    }, 6500);
  });
})();
