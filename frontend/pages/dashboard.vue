<template>
  <div>
    <!-- Page Nav -->
    <div class="page-nav">
      <NuxtLink to="/" class="back-link">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        Back to Home
      </NuxtLink>
      <span class="nav-sep">/</span>
      <span class="nav-current">LeaD DASHBOARD</span>
    </div>

    <!-- LOGIN -->
    <div v-if="screen === 'login'" class="auth-screen">
      <div class="login-card">
        <div class="login-icon">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div class="login-eyebrow">HR Access Only</div>
        <h2>LeaD Dashboard</h2>
        <p>Enter your CarSU email to access the HRMS Learning &amp; Development Dashboard.</p>
        <div class="login-field">
          <label>CarSU Email Address</label>
          <input type="email" v-model="loginEmail" placeholder="yourname@carsu.edu.ph"
            autocomplete="email" :class="{ err: loginHintType === 'err' }" @keydown.enter="doLogin" />
          <span class="login-hint" :class="loginHintType">{{ loginHint }}</span>
        </div>
        <button class="btn-login" :disabled="loginLoading" @click="doLogin">
          {{ loginLoading ? 'Checking...' : 'Access Dashboard' }}
        </button>
      </div>
    </div>

    <!-- ACCESS DENIED -->
    <div v-if="screen === 'denied'" class="auth-screen">
      <div class="denied-card">
        <div class="denied-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>{{ deniedMsg || 'Your email is not authorized to access this dashboard.' }}</p>
        <button class="btn-try" @click="screen = 'login'">← Try Another Email</button>
      </div>
    </div>

    <!-- DASHBOARD -->
    <div v-if="screen === 'dash'" class="dash-wrap">
      <div class="dash-head">
        <div class="dash-head-left">
          <h1>LeaD Dashboard</h1>
          <p>{{ lastUpdated }}</p>
        </div>
        <button class="btn-refresh" :class="{ spinning: dataLoading }" @click="loadDashboard">
          <svg viewBox="0 0 24 24">
            <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
          </svg>
          Refresh
        </button>
      </div>

      <!-- MAIN TABS -->
      <div class="tab-bar">
        <button class="tab-btn" v-for="tab in tabs" :key="tab.key"
          :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- ── OVERVIEW ── -->
      <div v-if="activeTab === 'overview'" class="tab-panel">

        <!-- ── STAT CARDS ── -->
        <div class="ov-cards">

          <!-- IDP: Total -->
          <div class="ov-card" :class="{ active: ovActive === 'idp-all' }" @click="toggleOv('idp-all')">
            <div class="ov-card-top">
              <span class="ov-card-label">Total IDPs</span>
              <span class="ov-card-num">{{ idps.length }}</span>
            </div>
            <div class="ov-card-sub">All submitted plans</div>
          </div>

          <!-- IDP: Pending -->
          <div class="ov-card ov-card-amber" :class="{ active: ovActive === 'idp-pending' }" @click="toggleOv('idp-pending')">
            <div class="ov-card-top">
              <span class="ov-card-label">Pending</span>
              <span class="ov-card-num">{{ ovCounts.idpPending }}</span>
            </div>
            <div class="ov-card-sub">Awaiting supervisor</div>
          </div>

          <!-- IDP: With Supervisor -->
          <div class="ov-card ov-card-blue" :class="{ active: ovActive === 'idp-supervisor' }" @click="toggleOv('idp-supervisor')">
            <div class="ov-card-top">
              <span class="ov-card-label">With Supervisor</span>
              <span class="ov-card-num">{{ ovCounts.idpWithSup }}</span>
            </div>
            <div class="ov-card-sub">Notified, not yet reviewed</div>
          </div>

          <!-- IDP: Completed -->
          <div class="ov-card ov-card-green" :class="{ active: ovActive === 'idp-complete' }" @click="toggleOv('idp-complete')">
            <div class="ov-card-top">
              <span class="ov-card-label">Completed IDPs</span>
              <span class="ov-card-num">{{ ovCounts.idpComplete }}</span>
            </div>
            <div class="ov-card-sub">Supervisor reviewed</div>
          </div>

          <!-- Divider -->
          <div class="ov-card-divider"></div>

          <!-- LNA: Total -->
          <div class="ov-card" :class="{ active: ovActive === 'lna-all' }" @click="toggleOv('lna-all')">
            <div class="ov-card-top">
              <span class="ov-card-label">Total LNAs</span>
              <span class="ov-card-num">{{ lnas.length }}</span>
            </div>
            <div class="ov-card-sub">Office assessments</div>
          </div>

          <!-- LNA: Offices -->
          <div class="ov-card ov-card-green" :class="{ active: ovActive === 'lna-offices' }" @click="toggleOv('lna-offices')">
            <div class="ov-card-top">
              <span class="ov-card-label">Offices</span>
              <span class="ov-card-num">{{ ovCounts.lnaOffices }}</span>
            </div>
            <div class="ov-card-sub">Unique units submitted</div>
          </div>

          <!-- LNA: Need Intervention -->
          <div class="ov-card ov-card-red" :class="{ active: ovActive === 'lna-flagged' }" @click="toggleOv('lna-flagged')">
            <div class="ov-card-top">
              <span class="ov-card-label">Need Intervention</span>
              <span class="ov-card-num">{{ ovCounts.lnaFlagged }}</span>
            </div>
            <div class="ov-card-sub">Flagged by cluster summary</div>
          </div>

        </div>

        <!-- ── DRILL-DOWN LIST ── -->
        <div v-if="ovActive" class="ov-drill">
          <div class="ov-drill-header">
            <span class="ov-drill-title">{{ ovDrillTitle }}</span>
            <button class="btn-ov-close" @click="ovActive = null">✕</button>
          </div>

          <!-- IDP lists -->
          <template v-if="ovActive.startsWith('idp')">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Name</th><th>Position</th><th>Office</th><th>Year</th><th>Status</th><th>Submitted</th><th></th>
              </tr></thead>
              <tbody>
                <tr v-if="!ovDrillRows.length" class="empty-row"><td colspan="8">No records.</td></tr>
                <tr v-for="r in ovDrillRows" :key="r.refId">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td><strong>{{ r.employeeName || '—' }}</strong><br/><span class="sub-text">{{ r.email }}</span></td>
                  <td>{{ r.position || '—' }}</td>
                  <td>{{ r.office || '—' }}</td>
                  <td>{{ r.yearCovered || '—' }}</td>
                  <td><span :class="statusBadgeClass(r.status)">{{ statusBadgeLabel(r.status) }}</span></td>
                  <td class="date-cell">{{ fmtDate(r.submittedAt) }}</td>
                  <td><button class="btn-view" @click="viewIDP(r.refId)">View</button></td>
                </tr>
              </tbody>
            </table>
          </template>

          <!-- LNA lists -->
          <template v-if="ovActive.startsWith('lna')">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Head of Office</th><th>Year</th><th>Purpose</th><th>Personnel</th><th>Submitted</th><th></th>
              </tr></thead>
              <tbody>
                <tr v-if="!ovDrillRows.length" class="empty-row"><td colspan="8">No records.</td></tr>
                <tr v-for="r in ovDrillRows" :key="r.refId">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td><strong>{{ r.office || '—' }}</strong></td>
                  <td>{{ r.headOfUnit || '—' }}</td>
                  <td>{{ r.yearCovered || '—' }}</td>
                  <td><span class="badge badge-grey">{{ r.purpose || '—' }}</span></td>
                  <td style="text-align:center">{{ r.totalPersonnel || '—' }}</td>
                  <td class="date-cell">{{ fmtDate(r.submittedAt) }}</td>
                  <td><button class="btn-view" @click="viewLNA(r.refId)">View</button></td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>

        <!-- ── RECENT ACTIVITY (shown when no drill active) ── -->
        <div v-if="!ovActive" class="chart-card" style="margin-top:0">
          <h4>Recent Submissions <span class="chart-sub" style="font-weight:400;font-size:11px">Latest 10</span></h4>
          <table class="dtbl" style="margin-top:10px">
            <thead><tr><th>Ref ID</th><th>Type</th><th>Name / Office</th><th>Status</th><th>Submitted</th></tr></thead>
            <tbody>
              <tr v-if="!recentActivity.length" class="empty-row"><td colspan="5">No submissions yet.</td></tr>
              <tr v-for="r in recentActivity" :key="r.refId">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><span :class="r.type==='IDP'?'badge badge-green':'badge badge-gold'">{{ r.type }}</span></td>
                <td>{{ r.label }}</td>
                <td><span :class="statusBadgeClass(r.status)">{{ statusBadgeLabel(r.status) }}</span></td>
                <td class="date-cell">{{ fmtDate(r.submittedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── LNA Intervention Flags ── -->
        <div v-if="!ovActive && interventionOffices.length" class="chart-card" style="margin-top:14px">
          <h4>LNA Offices Flagging Intervention Needed</h4>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
            <span v-for="o in interventionOffices" :key="o"
              style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(192,57,43,.08);color:#c0392b;border:1px solid rgba(192,57,43,.18)">
              {{ o }}
            </span>
          </div>
        </div>

      </div>

      <!-- ── IDP SUBMISSIONS ── -->
      <div v-if="activeTab === 'idp'" class="tab-panel">
        <!-- sub-tabs -->
        <div class="sub-tab-bar">
          <button class="sub-tab-btn" v-for="st in idpSubTabs" :key="st.key"
            :class="{ active: idpSubTab === st.key }" @click="idpSubTab = st.key">
            {{ st.icon }} {{ st.label }}
          </button>
        </div>

        <!-- shared filters -->
        <div class="filter-bar">
          <input type="text" v-model="idpSearch" placeholder="🔍  Search name, office, email..." />
          <select v-model="idpStatusFilter">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETE">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <select v-model="idpCampusFilter">
            <option value="">All Campuses</option>
            <option v-for="c in idpCampuses" :key="c">{{ c }}</option>
          </select>
          <select v-model="idpYearFilter">
            <option value="">All Years</option>
            <option v-for="y in idpYears" :key="y">{{ y }}</option>
          </select>
          <button class="btn-adv-filter" :class="{ active: showAdvFilters }" @click="showAdvFilters = !showAdvFilters">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Filters
            <span v-if="idpSubTab==='list' && (idpOfficeFilter||idpPositionFilter)" class="adv-badge">{{ [idpOfficeFilter,idpPositionFilter].filter(Boolean).length }}</span>
            <span v-if="idpSubTab==='competency' && (idpCompClusterFilter||idpCompTargetCompFilter||idpCompCurrentLvlFilter||idpCompRequiredLvlFilter||idpCompInterventionFilter||idpCompTimelineFilter||idpCompGapFilter)" class="adv-badge">{{ [idpCompClusterFilter,idpCompTargetCompFilter,idpCompCurrentLvlFilter,idpCompRequiredLvlFilter,idpCompInterventionFilter,idpCompTimelineFilter,idpCompGapFilter].filter(Boolean).length }}</span>
            <span v-if="idpSubTab==='agap' && (idpAgapDegreeFilter||idpAgapHeiFilter||idpAgapModeFilter||idpAgapScholarshipFilter||idpAgapTimelineFilter)" class="adv-badge">{{ [idpAgapDegreeFilter,idpAgapHeiFilter,idpAgapModeFilter,idpAgapScholarshipFilter,idpAgapTimelineFilter].filter(Boolean).length }}</span>
            <span v-if="idpSubTab==='proact' && (idpProactTitleFilter||idpProactSkillFilter||idpProactModeFilter||idpProactProviderFilter||idpProactTimelineFilter)" class="adv-badge">{{ [idpProactTitleFilter,idpProactSkillFilter,idpProactModeFilter,idpProactProviderFilter,idpProactTimelineFilter].filter(Boolean).length }}</span>
            <span v-if="idpSubTab==='supervisor' && (idpSupPerfGapsFilter||idpSupReadinessFilter||idpSupInterventionFilter||idpSupImplYearFilter||idpSupImplPeriodFilter)" class="adv-badge">{{ [idpSupPerfGapsFilter,idpSupReadinessFilter,idpSupInterventionFilter,idpSupImplYearFilter,idpSupImplPeriodFilter].filter(Boolean).length }}</span>
          </button>
          <span class="result-count">{{ filteredIDPs.length }} record{{ filteredIDPs.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- ── ADVANCED FILTER PANEL ── -->
        <transition name="adv-slide">
        <div v-if="showAdvFilters" class="adv-filter-panel">

          <!-- ALL SUBMISSIONS advanced filters -->
          <template v-if="idpSubTab === 'list'">
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Office / Unit</label>
                <select v-model="idpOfficeFilter" class="adv-select">
                  <option value="">All Offices</option>
                  <option v-for="o in idpOffices" :key="o" :value="o">{{ o }}</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Position</label>
                <select v-model="idpPositionFilter" class="adv-select">
                  <option value="">All Positions</option>
                  <option v-for="p in idpPositions" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="idpOfficeFilter=''; idpPositionFilter=''">Clear</button>
            </div>
            <div v-if="idpOfficeFilter || idpPositionFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredIDPs.length }}</span> employee{{ filteredIDPs.length !== 1 ? 's' : '' }} match this filter
            </div>
          </template>

          <!-- COMPETENCY advanced filters -->
          <template v-if="idpSubTab === 'competency'">
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Cluster</label>
                <select v-model="idpCompClusterFilter" class="adv-select">
                  <option value="">All Clusters</option>
                  <option v-for="o in compClusterOptions" :key="o.v" :value="o.v">{{ o.v }} <template v-if="o.c">({{ o.c }})</template></option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Target Competency</label>
                <select v-model="idpCompTargetCompFilter" class="adv-select">
                  <option value="">All Competencies</option>
                  <option v-for="o in compTargetCompOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Current Level</label>
                <select v-model="idpCompCurrentLvlFilter" class="adv-select">
                  <option value="">Any</option>
                  <option v-for="o in compCurrentLvlOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Required Level</label>
                <select v-model="idpCompRequiredLvlFilter" class="adv-select">
                  <option value="">Any</option>
                  <option v-for="o in compRequiredLvlOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="idpCompClusterFilter=''; idpCompTargetCompFilter=''; idpCompCurrentLvlFilter=''; idpCompRequiredLvlFilter=''; idpCompInterventionFilter=''">Clear</button>
            </div>
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Suggested Intervention</label>
                <select v-model="idpCompInterventionFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in compInterventionOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Target Timeline</label>
                <select v-model="idpCompTimelineFilter" class="adv-select">
                  <option value="">All Timelines</option>
                  <option v-for="o in compTimelineOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Has Gap?</label>
                <div class="adv-toggle-group">
                  <button class="adv-toggle" :class="{ active: idpCompGapFilter === '' }" @click="idpCompGapFilter = ''">All</button>
                  <button class="adv-toggle adv-toggle-red" :class="{ active: idpCompGapFilter === 'Yes' }" @click="idpCompGapFilter = idpCompGapFilter === 'Yes' ? '' : 'Yes'">Yes</button>
                  <button class="adv-toggle adv-toggle-green" :class="{ active: idpCompGapFilter === 'No' }" @click="idpCompGapFilter = idpCompGapFilter === 'No' ? '' : 'No'">No</button>
                </div>
              </div>
              <button class="btn-clear-adv" @click="idpCompTimelineFilter=''; idpCompGapFilter=''">Clear</button>
            </div>
            <div v-if="idpCompClusterFilter||idpCompTargetCompFilter||idpCompCurrentLvlFilter||idpCompRequiredLvlFilter||idpCompInterventionFilter||idpCompTimelineFilter||idpCompGapFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredCompetencyRows.length }}</span> entr{{ filteredCompetencyRows.length !== 1 ? 'ies' : 'y' }} match
              &nbsp;·&nbsp;
              <span class="adv-who-num">{{ new Set(filteredCompetencyRows.map(r => r.refId)).size }}</span> unique employee{{ new Set(filteredCompetencyRows.map(r => r.refId)).size !== 1 ? 's' : '' }}
            </div>
          </template>

          <!-- AGAP advanced filters -->
          <template v-if="idpSubTab === 'agap'">
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Degree Program</label>
                <select v-model="idpAgapDegreeFilter" class="adv-select">
                  <option value="">All Programs</option>
                  <option v-for="o in agapDegreeOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Target HEI</label>
                <select v-model="idpAgapHeiFilter" class="adv-select">
                  <option value="">All HEIs</option>
                  <option v-for="o in agapHeiOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Mode of Study</label>
                <select v-model="idpAgapModeFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in agapModeOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Scholarship / Grant</label>
                <select v-model="idpAgapScholarshipFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in agapScholarshipOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="idpAgapDegreeFilter=''; idpAgapHeiFilter=''; idpAgapModeFilter=''; idpAgapScholarshipFilter=''; idpAgapTimelineFilter=''">Clear</button>
            </div>
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Target Timeline</label>
                <select v-model="idpAgapTimelineFilter" class="adv-select">
                  <option value="">All Timelines</option>
                  <option v-for="o in agapTimelineOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="idpAgapTimelineFilter=''">Clear</button>
            </div>
            <div v-if="idpAgapDegreeFilter||idpAgapHeiFilter||idpAgapModeFilter||idpAgapScholarshipFilter||idpAgapTimelineFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredAgapRows.length }}</span> entr{{ filteredAgapRows.length !== 1 ? 'ies' : 'y' }} match
              &nbsp;·&nbsp;
              <span class="adv-who-num">{{ new Set(filteredAgapRows.map(r => r.refId)).size }}</span> unique employee{{ new Set(filteredAgapRows.map(r => r.refId)).size !== 1 ? 's' : '' }}
            </div>
          </template>

          <!-- PRO-ACT advanced filters -->
          <template v-if="idpSubTab === 'proact'">
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Training Title</label>
                <select v-model="idpProactTitleFilter" class="adv-select">
                  <option value="">All Titles</option>
                  <option v-for="o in proactTitleOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Target Competency / Skill</label>
                <select v-model="idpProactSkillFilter" class="adv-select">
                  <option value="">All Skills</option>
                  <option v-for="o in proactSkillOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Mode of Activity</label>
                <select v-model="idpProactModeFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in proactModeOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Trainer / Provider</label>
                <select v-model="idpProactProviderFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in proactProviderOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="idpProactTitleFilter=''; idpProactSkillFilter=''; idpProactModeFilter=''; idpProactProviderFilter=''; idpProactTimelineFilter=''">Clear</button>
            </div>
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Target Timeline</label>
                <select v-model="idpProactTimelineFilter" class="adv-select">
                  <option value="">All Timelines</option>
                  <option v-for="o in proactTimelineOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="idpProactTimelineFilter=''">Clear</button>
            </div>
            <div v-if="idpProactTitleFilter||idpProactSkillFilter||idpProactModeFilter||idpProactProviderFilter||idpProactTimelineFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredProactRows.length }}</span> entr{{ filteredProactRows.length !== 1 ? 'ies' : 'y' }} match
              &nbsp;·&nbsp;
              <span class="adv-who-num">{{ new Set(filteredProactRows.map(r => r.refId)).size }}</span> unique employee{{ new Set(filteredProactRows.map(r => r.refId)).size !== 1 ? 's' : '' }}
            </div>
          </template>

          <!-- SUPERVISOR advanced filters -->
          <template v-if="idpSubTab === 'supervisor'">
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Performance Gaps?</label>
                <div class="adv-toggle-group">
                  <button class="adv-toggle" :class="{ active: idpSupPerfGapsFilter === '' }" @click="idpSupPerfGapsFilter = ''">All</button>
                  <button class="adv-toggle adv-toggle-red" :class="{ active: idpSupPerfGapsFilter === 'Yes' }" @click="idpSupPerfGapsFilter = idpSupPerfGapsFilter === 'Yes' ? '' : 'Yes'">Yes</button>
                  <button class="adv-toggle adv-toggle-green" :class="{ active: idpSupPerfGapsFilter === 'No' }" @click="idpSupPerfGapsFilter = idpSupPerfGapsFilter === 'No' ? '' : 'No'">No</button>
                </div>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Ready for Advancement?</label>
                <div class="adv-toggle-group">
                  <button class="adv-toggle" :class="{ active: idpSupReadinessFilter === '' }" @click="idpSupReadinessFilter = ''">All</button>
                  <button class="adv-toggle adv-toggle-green" :class="{ active: idpSupReadinessFilter === 'Yes' }" @click="idpSupReadinessFilter = idpSupReadinessFilter === 'Yes' ? '' : 'Yes'">Yes</button>
                  <button class="adv-toggle adv-toggle-red" :class="{ active: idpSupReadinessFilter === 'No' }" @click="idpSupReadinessFilter = idpSupReadinessFilter === 'No' ? '' : 'No'">No</button>
                </div>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Recommended Intervention</label>
                <select v-model="idpSupInterventionFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in supInterventionOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Impl. Year</label>
                <select v-model="idpSupImplYearFilter" class="adv-select">
                  <option value="">Any</option>
                  <option v-for="o in supImplYearOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Impl. Period</label>
                <select v-model="idpSupImplPeriodFilter" class="adv-select">
                  <option value="">Any</option>
                  <option v-for="o in supImplPeriodOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="idpSupPerfGapsFilter=''; idpSupReadinessFilter=''; idpSupInterventionFilter=''; idpSupImplYearFilter=''; idpSupImplPeriodFilter=''">Clear</button>
            </div>
            <div v-if="idpSupPerfGapsFilter||idpSupReadinessFilter||idpSupInterventionFilter||idpSupImplYearFilter||idpSupImplPeriodFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredSupRows.length }}</span> employee{{ filteredSupRows.length !== 1 ? 's' : '' }} match this filter
            </div>
          </template>

        </div>
        </transition>

        <!-- ALL SUBMISSIONS -->
        <div v-if="idpSubTab === 'list'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th v-for="(col,i) in idpCols" :key="col" @click="sortTable('idp',i)">{{ col }}<span class="sort-ind">{{ sortIndicator('idp',i) }}</span></th>
              <th>Action</th>
            </tr></thead>
            <tbody>
              <tr v-if="!filteredIDPs.length" class="empty-row"><td colspan="9">No records found.</td></tr>
              <tr v-for="r in filteredIDPs" :key="r.refId">
                <td><code class="ref-code">{{ r.refId || '—' }}</code></td>
                <td><strong>{{ r.employeeName || '—' }}</strong><br/><span class="sub-text">{{ r.email || '' }}</span></td>
                <td>{{ r.position || '—' }}</td>
                <td>{{ r.office || '—' }}</td>
                <td>{{ r.campus || '—' }}</td>
                <td>{{ r.yearCovered || '—' }}</td>
                <td class="date-cell">{{ fmtDate(r.submittedAt) }}</td>
                <td><span :class="statusBadgeClass(r.status)">{{ statusBadgeLabel(r.status) }}</span></td>
                <td><button class="btn-view" @click="viewIDP(r.refId)">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TOP COMPETENCY GAPS — shown on Section I sub-tab -->
        <div v-if="idpSubTab === 'competency'" class="chart-card" style="margin-bottom:16px">
          <h4>Top Competency Gaps</h4>
          <p class="chart-sub">Most frequently cited in IDP Section I (Required &gt; Current)</p>
          <div v-if="topCompetencyGaps.length" style="margin-top:10px">
            <div v-for="(g, i) in topCompetencyGaps" :key="g.label"
              style="display:flex;align-items:center;gap:10px;margin-bottom:7px;font-size:12px">
              <span style="width:18px;height:18px;background:var(--navy);color:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0">{{ i+1 }}</span>
              <span style="width:200px;flex-shrink:0">{{ g.label }}</span>
              <div style="flex:1;background:#eee;border-radius:4px;height:7px;overflow:hidden">
                <div :style="{ width: (g.count/topCompetencyGaps[0].count*100)+'%', height:'100%', background:'var(--navy)', borderRadius:'4px' }"></div>
              </div>
              <span style="width:24px;text-align:right;font-weight:700;color:var(--navy)">{{ g.count }}</span>
            </div>
          </div>
          <p v-else style="font-size:13px;color:var(--text-light);margin-top:8px">No competency data yet.</p>
        </div>
        <!-- SECTION I: COMPETENCY ASSESSMENT -->
        <div v-if="idpSubTab === 'competency'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Name</th><th>Position</th><th>Office</th><th>Year</th>
              <th>#</th><th>Target Competency</th><th>Cluster</th>
              <th>Current Level</th><th>Required Level</th>
              <th>Suggested Intervention</th><th>Target Timeline</th>
            </tr></thead>
            <tbody>
              <tr v-if="!idpCompetencyRows.length" class="empty-row"><td colspan="12">No competency data found.</td></tr>
              <tr v-for="r in idpCompetencyRows" :key="r._key">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.name }}</strong><br/><span class="sub-text">{{ r.email }}</span></td>
                <td>{{ r.position }}</td>
                <td>{{ r.office }}</td>
                <td>{{ r.year }}</td>
                <td style="text-align:center;color:var(--text-light);font-weight:600">{{ r.priority }}</td>
                <td><strong>{{ r.targetCompetency || '—' }}</strong></td>
                <td><span class="badge badge-grey">{{ r.competencyGroup || '—' }}</span></td>
                <td style="text-align:center"><span class="level-badge level-cur">{{ r.currentLevel || '—' }}</span></td>
                <td style="text-align:center"><span class="level-badge level-req">{{ r.requiredLevel || '—' }}</span></td>
                <td>{{ r.leadInterventions || '—' }}</td>
                <td class="date-cell">{{ r.targetTimeline || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION II: AGAP -->
        <div v-if="idpSubTab === 'agap'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Name</th><th>Position</th><th>Office</th><th>Year</th>
              <th>#</th><th>Degree Program</th><th>Target HEI</th>
              <th>Mode of Study</th><th>Scholarship / Grant</th><th>Target Timeline</th>
            </tr></thead>
            <tbody>
              <tr v-if="!idpAgapRows.length" class="empty-row"><td colspan="11">No AGAP data found.</td></tr>
              <tr v-for="r in idpAgapRows" :key="r._key">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.name }}</strong></td>
                <td>{{ r.position }}</td>
                <td>{{ r.office }}</td>
                <td>{{ r.year }}</td>
                <td style="text-align:center;color:var(--text-light);font-weight:600">{{ r.priority }}</td>
                <td>{{ r.degreeProgram || '—' }}</td>
                <td>{{ r.targetHEI || '—' }}</td>
                <td>{{ r.modeOfStudy || '—' }}</td>
                <td>{{ r.scholarshipGrant || '—' }}</td>
                <td class="date-cell">{{ r.targetTimeline || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION III: PRO-ACT -->
        <div v-if="idpSubTab === 'proact'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Name</th><th>Position</th><th>Office</th><th>Year</th>
              <th>#</th><th>Training / Workshop Title</th><th>Target Competency / Skill</th>
              <th>Mode of Activity</th><th>Trainer / Provider</th><th>Target Timeline</th>
            </tr></thead>
            <tbody>
              <tr v-if="!filteredProactRows.length" class="empty-row"><td colspan="11">No Pro-ACT data found.</td></tr>
              <tr v-for="r in filteredProactRows" :key="r._key">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.name }}</strong></td>
                <td>{{ r.position }}</td>
                <td>{{ r.office }}</td>
                <td>{{ r.year }}</td>
                <td style="text-align:center;color:var(--text-light);font-weight:600">{{ r.priority }}</td>
                <td>{{ r.trainingTitle || '—' }}</td>
                <td>{{ r.targetSkill || '—' }}</td>
                <td>{{ r.modeOfActivity || '—' }}</td>
                <td>{{ r.trainerProvider || '—' }}</td>
                <td class="date-cell">{{ r.targetTimeline || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION IV: SUPERVISOR ASSESSMENT -->
        <div v-if="idpSubTab === 'supervisor'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Employee</th><th>Supervisor</th><th>Office</th><th>Year</th>
              <th>Status</th><th>Performance Gaps?</th><th>Gap Description</th>
              <th>Ready for Advancement?</th><th>Readiness Remarks</th>
              <th>Recommended Interventions</th><th>Implementation Period</th>
              <th>Additional Comments</th><th>Review Date</th>
            </tr></thead>
            <tbody>
              <tr v-if="!filteredSupRows.length" class="empty-row"><td colspan="14">No records found.</td></tr>
              <tr v-for="r in filteredSupRows" :key="r.refId">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.employeeName || '—' }}</strong></td>
                <td>{{ r.supervisorName || '—' }}<br/><span class="sub-text">{{ r.supervisorEmail || '' }}</span></td>
                <td>{{ r.office || '—' }}</td>
                <td>{{ r.yearCovered || '—' }}</td>
                <td><span :class="statusBadgeClass(r.status)">{{ statusBadgeLabel(r.status) }}</span></td>
                <template v-if="r.status === 'COMPLETE' && r._assessment">
                  <td style="text-align:center">
                    <span :class="r._assessment.perfGapsYN === 'Yes' ? 'badge badge-red' : 'badge badge-green'">{{ r._assessment.perfGapsYN || '—' }}</span>
                  </td>
                  <td class="cell-wrap">{{ r._assessment.perfGapsSpec || '—' }}</td>
                  <td style="text-align:center">
                    <span :class="r._assessment.readinessYN === 'Yes' ? 'badge badge-green' : 'badge badge-gold'">{{ r._assessment.readinessYN || '—' }}</span>
                  </td>
                  <td class="cell-wrap">{{ r._assessment.readinessRemarks || '—' }}</td>
                  <td style="font-size:12px">{{ Array.isArray(r._assessment.interventions) ? r._assessment.interventions.join(', ') : (r._assessment.interventions || '—') }}</td>
                  <td>{{ r._assessment.implYear || '' }} {{ r._assessment.implementationPeriod || '—' }}</td>
                  <td class="cell-wrap">{{ r._assessment.additionalComments || '—' }}</td>
                  <td class="date-cell">{{ fmtDate(r.supervisorSignedAt) }}</td>
                </template>
                <template v-else>
                  <td colspan="8" style="text-align:center;font-style:italic;color:var(--text-light);font-size:12px">Awaiting supervisor assessment</td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── LNA SUBMISSIONS ── -->
      <div v-if="activeTab === 'lna'" class="tab-panel">
        <!-- sub-tabs -->
        <div class="sub-tab-bar">
          <button class="sub-tab-btn" v-for="st in lnaSubTabs" :key="st.key"
            :class="{ active: lnaSubTab === st.key }" @click="lnaSubTab = st.key">
            {{ st.icon }} {{ st.label }}
          </button>
        </div>

        <!-- shared filters -->
        <div class="filter-bar">
          <input type="text" v-model="lnaSearch" placeholder="🔍  Search office, head, email..." />
          <select v-model="lnaCampusFilter">
            <option value="">All Campuses</option>
            <option v-for="c in idpCampuses" :key="c">{{ c }}</option>
          </select>
          <select v-model="lnaYearFilter">
            <option value="">All Years</option>
            <option v-for="y in lnaYears" :key="y">{{ y }}</option>
          </select>
          <button class="btn-adv-filter" :class="{ active: showLnaAdvFilters }" @click="showLnaAdvFilters = !showLnaAdvFilters">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Filters
            <span v-if="lnaSubTab==='list' && (lnaPurposeFilter||lnaOfficeFilter)" class="adv-badge">{{ [lnaPurposeFilter,lnaOfficeFilter].filter(Boolean).length }}</span>
            <span v-if="lnaSubTab==='workforce' && (lnaWfLevelFilter||lnaWfHasTypeFilter||lnaWfCountFilter)" class="adv-badge">{{ [lnaWfLevelFilter,lnaWfHasTypeFilter,lnaWfCountFilter].filter(Boolean).length }}</span>
            <span v-if="lnaSubTab==='competency' && (lnaClusterFilter||lnaStrongestFilter||lnaWeakestFilter||lnaInterventionFilter||lnaCompClusterFilter||lnaCompCompetencyFilter||lnaHasObsFilter)" class="adv-badge">{{ [lnaClusterFilter,lnaStrongestFilter,lnaWeakestFilter,lnaInterventionFilter,lnaCompClusterFilter,lnaCompCompetencyFilter,lnaHasObsFilter].filter(Boolean).length }}</span>
            <span v-if="lnaSubTab==='sources' && (lnaDataSourceFilter||lnaHasSourcesFilter||lnaInsightSourceFilter||lnaInsightPersonnelFilter||lnaInsightInterventionFilter)" class="adv-badge">{{ [lnaDataSourceFilter,lnaHasSourcesFilter,lnaInsightSourceFilter,lnaInsightPersonnelFilter,lnaInsightInterventionFilter].filter(Boolean).length }}</span>
          </button>
          <span class="result-count">{{ filteredLNAs.length }} record{{ filteredLNAs.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- ── LNA ADVANCED FILTER PANEL ── -->
        <transition name="adv-slide">
        <div v-if="showLnaAdvFilters" class="adv-filter-panel">

          <!-- ALL SUBMISSIONS -->
          <template v-if="lnaSubTab === 'list'">
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Office / Unit</label>
                <select v-model="lnaOfficeFilter" class="adv-select">
                  <option value="">All Offices</option>
                  <option v-for="o in lnaOffices" :key="o" :value="o">{{ o }}</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Purpose</label>
                <select v-model="lnaPurposeFilter" class="adv-select">
                  <option value="">All Purposes</option>
                  <option v-for="o in lnaPurposeOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="lnaOfficeFilter=''; lnaPurposeFilter=''">Clear</button>
            </div>
            <div v-if="lnaOfficeFilter||lnaPurposeFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredLNAs.length }}</span> office{{ filteredLNAs.length !== 1 ? 's' : '' }} match this filter
            </div>
          </template>

          <!-- WORKFORCE -->
          <template v-if="lnaSubTab === 'workforce'">
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Position Level</label>
                <select v-model="lnaWfLevelFilter" class="adv-select">
                  <option value="">All Levels</option>
                  <option v-for="o in lnaWfLevelOptions" :key="o.v" :value="o.v">{{ o.v }}</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Has Personnel Type</label>
                <select v-model="lnaWfHasTypeFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in lnaWfHasTypeOptions" :key="o.v" :value="o.v">{{ o.v }}</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Personnel Count</label>
                <div class="adv-toggle-group">
                  <button class="adv-toggle" :class="{ active: lnaWfCountFilter === '' }" @click="lnaWfCountFilter = ''">All</button>
                  <button class="adv-toggle" :class="{ active: lnaWfCountFilter === 'gt0' }" @click="lnaWfCountFilter = lnaWfCountFilter === 'gt0' ? '' : 'gt0'">&gt; 0</button>
                  <button class="adv-toggle" :class="{ active: lnaWfCountFilter === 'gt10' }" @click="lnaWfCountFilter = lnaWfCountFilter === 'gt10' ? '' : 'gt10'">&gt; 10</button>
                  <button class="adv-toggle" :class="{ active: lnaWfCountFilter === 'gt50' }" @click="lnaWfCountFilter = lnaWfCountFilter === 'gt50' ? '' : 'gt50'">&gt; 50</button>
                </div>
              </div>
              <button class="btn-clear-adv" @click="lnaWfLevelFilter=''; lnaWfHasTypeFilter=''; lnaWfCountFilter=''">Clear</button>
            </div>
            <div v-if="lnaWfLevelFilter||lnaWfHasTypeFilter||lnaWfCountFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredWorkforceRows.length }}</span> row{{ filteredWorkforceRows.length !== 1 ? 's' : '' }} match
              &nbsp;·&nbsp;
              <span class="adv-who-num">{{ new Set(filteredWorkforceRows.map(r=>r.refId)).size }}</span> unique office{{ new Set(filteredWorkforceRows.map(r=>r.refId)).size !== 1 ? 's' : '' }}
            </div>
          </template>

          <!-- COMPETENCY -->
          <template v-if="lnaSubTab === 'competency'">
            <div class="adv-filter-section-label">Cluster Summary</div>
            <div class="adv-filter-row" style="margin-bottom:14px">
              <div class="adv-filter-group">
                <label class="adv-label">Cluster</label>
                <select v-model="lnaClusterFilter" class="adv-select">
                  <option value="">All Clusters</option>
                  <option v-for="o in lnaClusterOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Strongest Competency</label>
                <select v-model="lnaStrongestFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in lnaStrongestOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Weakest Competency</label>
                <select v-model="lnaWeakestFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in lnaWeakestOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Intervention Needed?</label>
                <div class="adv-toggle-group">
                  <button class="adv-toggle" :class="{ active: lnaInterventionFilter === '' }" @click="lnaInterventionFilter=''">All</button>
                  <button class="adv-toggle adv-toggle-red" :class="{ active: lnaInterventionFilter === 'Yes' }" @click="lnaInterventionFilter = lnaInterventionFilter==='Yes'?'':'Yes'">Yes</button>
                  <button class="adv-toggle adv-toggle-green" :class="{ active: lnaInterventionFilter === 'No' }" @click="lnaInterventionFilter = lnaInterventionFilter==='No'?'':'No'">No</button>
                </div>
              </div>
              <button class="btn-clear-adv" @click="lnaClusterFilter=''; lnaStrongestFilter=''; lnaWeakestFilter=''; lnaInterventionFilter=''">Clear</button>
            </div>
            <div v-if="lnaClusterFilter||lnaStrongestFilter||lnaWeakestFilter||lnaInterventionFilter" class="adv-who-count" style="margin-bottom:14px">
              <span class="adv-who-num">{{ filteredClusterRows.length }}</span> entr{{ filteredClusterRows.length !== 1 ? 'ies' : 'y' }} match
              &nbsp;·&nbsp;
              <span class="adv-who-num">{{ new Set(filteredClusterRows.map(r=>r.refId)).size }}</span> unique office{{ new Set(filteredClusterRows.map(r=>r.refId)).size !== 1 ? 's' : '' }}
            </div>

            <div class="adv-filter-section-label">Detailed Competency Mapping</div>
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Cluster</label>
                <select v-model="lnaCompClusterFilter" class="adv-select">
                  <option value="">All Clusters</option>
                  <option v-for="o in lnaCompClusterOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Competency</label>
                <select v-model="lnaCompCompetencyFilter" class="adv-select">
                  <option value="">All Competencies</option>
                  <option v-for="o in lnaCompCompetencyOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Has Observations?</label>
                <div class="adv-toggle-group">
                  <button class="adv-toggle" :class="{ active: lnaHasObsFilter === '' }" @click="lnaHasObsFilter=''">All</button>
                  <button class="adv-toggle" :class="{ active: lnaHasObsFilter === 'Yes' }" @click="lnaHasObsFilter = lnaHasObsFilter==='Yes'?'':'Yes'">Yes</button>
                  <button class="adv-toggle" :class="{ active: lnaHasObsFilter === 'No' }" @click="lnaHasObsFilter = lnaHasObsFilter==='No'?'':'No'">No</button>
                </div>
              </div>
              <button class="btn-clear-adv" @click="lnaCompClusterFilter=''; lnaCompCompetencyFilter=''; lnaHasObsFilter=''">Clear</button>
            </div>
            <div v-if="lnaCompClusterFilter||lnaCompCompetencyFilter||lnaHasObsFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredCompRows.length }}</span> entr{{ filteredCompRows.length !== 1 ? 'ies' : 'y' }} match
              &nbsp;·&nbsp;
              <span class="adv-who-num">{{ new Set(filteredCompRows.map(r=>r.refId)).size }}</span> unique office{{ new Set(filteredCompRows.map(r=>r.refId)).size !== 1 ? 's' : '' }}
            </div>
          </template>

          <!-- DATA SOURCES & INSIGHTS -->
          <template v-if="lnaSubTab === 'sources'">
            <div class="adv-filter-section-label">Data Sources</div>
            <div class="adv-filter-row" style="margin-bottom:14px">
              <div class="adv-filter-group">
                <label class="adv-label">Data Source</label>
                <select v-model="lnaDataSourceFilter" class="adv-select">
                  <option value="">All Sources</option>
                  <option v-for="o in lnaDataSourceOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Has Sources?</label>
                <div class="adv-toggle-group">
                  <button class="adv-toggle" :class="{ active: lnaHasSourcesFilter === '' }" @click="lnaHasSourcesFilter=''">All</button>
                  <button class="adv-toggle" :class="{ active: lnaHasSourcesFilter === 'Yes' }" @click="lnaHasSourcesFilter = lnaHasSourcesFilter==='Yes'?'':'Yes'">Yes</button>
                  <button class="adv-toggle" :class="{ active: lnaHasSourcesFilter === 'No' }" @click="lnaHasSourcesFilter = lnaHasSourcesFilter==='No'?'':'No'">No</button>
                </div>
              </div>
              <button class="btn-clear-adv" @click="lnaDataSourceFilter=''; lnaHasSourcesFilter=''">Clear</button>
            </div>
            <div v-if="lnaDataSourceFilter||lnaHasSourcesFilter" class="adv-who-count" style="margin-bottom:14px">
              <span class="adv-who-num">{{ filteredDataSourceRows.length }}</span> office{{ filteredDataSourceRows.length !== 1 ? 's' : '' }} match
            </div>

            <div class="adv-filter-section-label">Key Insights</div>
            <div class="adv-filter-row">
              <div class="adv-filter-group">
                <label class="adv-label">Data Source</label>
                <select v-model="lnaInsightSourceFilter" class="adv-select">
                  <option value="">All Sources</option>
                  <option v-for="o in lnaInsightSourceOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Relevant Personnel</label>
                <select v-model="lnaInsightPersonnelFilter" class="adv-select">
                  <option value="">All Personnel</option>
                  <option v-for="o in lnaInsightPersonnelOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <div class="adv-filter-group">
                <label class="adv-label">Recommended Intervention</label>
                <select v-model="lnaInsightInterventionFilter" class="adv-select">
                  <option value="">All</option>
                  <option v-for="o in lnaInsightInterventionOptions" :key="o.v" :value="o.v">{{ o.v }} ({{ o.c }})</option>
                </select>
              </div>
              <button class="btn-clear-adv" @click="lnaInsightSourceFilter=''; lnaInsightPersonnelFilter=''; lnaInsightInterventionFilter=''">Clear</button>
            </div>
            <div v-if="lnaInsightSourceFilter||lnaInsightPersonnelFilter||lnaInsightInterventionFilter" class="adv-who-count">
              <span class="adv-who-num">{{ filteredInsightRows.length }}</span> insight{{ filteredInsightRows.length !== 1 ? 's' : '' }} match
              &nbsp;·&nbsp;
              <span class="adv-who-num">{{ new Set(filteredInsightRows.map(r=>r.refId)).size }}</span> unique office{{ new Set(filteredInsightRows.map(r=>r.refId)).size !== 1 ? 's' : '' }}
            </div>
          </template>

        </div>
        </transition>

        <!-- ALL SUBMISSIONS -->
        <div v-if="lnaSubTab === 'list'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th v-for="(col,i) in lnaCols" :key="col" @click="sortTable('lna',i)">{{ col }}<span class="sort-ind">{{ sortIndicator('lna',i) }}</span></th>
              <th>Action</th>
            </tr></thead>
            <tbody>
              <tr v-if="!filteredLNAs.length" class="empty-row"><td colspan="9">No records found.</td></tr>
              <tr v-for="r in filteredLNAs" :key="r.refId">
                <td><code class="ref-code">{{ r.refId || '—' }}</code></td>
                <td><strong>{{ r.office || '—' }}</strong></td>
                <td>{{ r.headOfUnit || '—' }}<br/><span class="sub-text">{{ r.email || '' }}</span></td>
                <td>{{ r.campus || '—' }}</td>
                <td>{{ r.yearCovered || '—' }}</td>
                <td><span class="badge badge-grey">{{ r.purpose || '—' }}</span></td>
                <td style="text-align:center">{{ r.totalPersonnel || '—' }}</td>
                <td class="date-cell">{{ fmtDate(r.submittedAt) }}</td>
                <td><button class="btn-view" @click="viewLNA(r.refId)">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION I: WORKFORCE PROFILE -->
        <div v-if="lnaSubTab === 'workforce'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Office / Unit</th><th>Campus</th><th>Year</th>
              <th>Position Level</th>
              <th>Permanent</th><th>Temporary</th><th>Contractual</th><th>Casual</th>
              <th>Coterminus</th><th>COS</th><th>Job Order</th><th>Others</th>
              <th>Total</th>
            </tr></thead>
            <tbody>
              <tr v-if="!filteredWorkforceRows.length" class="empty-row"><td colspan="14">No workforce data found.</td></tr>
              <tr v-for="r in filteredWorkforceRows" :key="r._key">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td>{{ r.office }}</td>
                <td>{{ r.campus }}</td>
                <td>{{ r.year }}</td>
                <td><strong>{{ r.levelLabel }}</strong></td>
                <td style="text-align:center">{{ r.permanent || 0 }}</td>
                <td style="text-align:center">{{ r.temporary || 0 }}</td>
                <td style="text-align:center">{{ r.contractual || 0 }}</td>
                <td style="text-align:center">{{ r.casual || 0 }}</td>
                <td style="text-align:center">{{ r.coterminus || 0 }}</td>
                <td style="text-align:center">{{ r.cos || 0 }}</td>
                <td style="text-align:center">{{ r.jobOrder || 0 }}</td>
                <td style="text-align:center">{{ r.others || 0 }}</td>
                <td style="text-align:center;font-weight:700;color:var(--navy)">{{ r.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION II: COMPETENCY MAPPING -->
        <div v-if="lnaSubTab === 'competency'">
          <!-- Summary (cluster summary rows) -->
          <div class="sub-section-label" style="margin-bottom:8px">Cluster Summary</div>
          <div class="tbl-wrap" style="margin-bottom:20px">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Campus</th><th>Year</th>
                <th>Cluster</th><th>Strongest Competency</th><th>Weakest Competency</th><th>Intervention Needed?</th>
              </tr></thead>
              <tbody>
                <tr v-if="!filteredClusterRows.length" class="empty-row"><td colspan="8">No cluster summary data found.</td></tr>
                <tr v-for="r in filteredClusterRows" :key="r._key">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td>{{ r.office }}</td>
                  <td>{{ r.campus }}</td>
                  <td>{{ r.year }}</td>
                  <td><span class="badge badge-grey">{{ r.cluster }}</span></td>
                  <td>{{ r.strongest || '—' }}</td>
                  <td>{{ r.weakest || '—' }}</td>
                  <td>
                    <span v-if="r.interventionNeeded === 'Y'" class="badge badge-red">Yes</span>
                    <span v-else-if="r.interventionNeeded === 'N'" class="badge badge-green">No</span>
                    <span v-else class="badge badge-grey">{{ r.interventionNeeded || '—' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Detailed competency mapping per position level -->
          <div class="sub-section-label" style="margin-bottom:8px">Detailed Competency Mapping by Position Level</div>
          <div class="tbl-wrap">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Campus</th><th>Year</th>
                <th>Cluster</th><th>Competency</th>
                <th>1st Level CL</th><th>1st Level %</th>
                <th>2nd (Non-Sup) CL</th><th>2nd (Non-Sup) %</th>
                <th>2nd (Sup) CL</th><th>2nd (Sup) %</th>
                <th>3rd Level CL</th><th>3rd Level %</th>
                <th>Faculty CL</th><th>Faculty %</th>
                <th>Observations</th>
              </tr></thead>
              <tbody>
                <tr v-if="!filteredCompRows.length" class="empty-row"><td colspan="17">No competency mapping data found.</td></tr>
                <tr v-for="r in filteredCompRows" :key="r._key">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td>{{ r.office }}</td>
                  <td>{{ r.campus }}</td>
                  <td>{{ r.year }}</td>
                  <td><span class="badge badge-grey">{{ r.cluster }}</span></td>
                  <td><strong>{{ r.competency }}</strong></td>
                  <td style="text-align:center"><span v-if="r.first_cl" class="level-badge level-req">{{ r.first_cl }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.first_pct" class="badge badge-green">{{ r.first_pct }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.secondNonSup_cl" class="level-badge level-req">{{ r.secondNonSup_cl }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.secondNonSup_pct" class="badge badge-green">{{ r.secondNonSup_pct }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.secondSup_cl" class="level-badge level-req">{{ r.secondSup_cl }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.secondSup_pct" class="badge badge-green">{{ r.secondSup_pct }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.third_cl" class="level-badge level-req">{{ r.third_cl }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.third_pct" class="badge badge-green">{{ r.third_pct }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.faculty_cl" class="level-badge level-req">{{ r.faculty_cl }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td style="text-align:center"><span v-if="r.faculty_pct" class="badge badge-green">{{ r.faculty_pct }}</span><span v-else style="color:var(--text-light)">—</span></td>
                  <td class="cell-wrap">{{ r.observations || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECTION III: DATA SOURCES & KEY INSIGHTS -->
        <div v-if="lnaSubTab === 'sources'">
          <div class="sub-section-label" style="margin-bottom:8px">A. Data Sources Used</div>
          <div class="tbl-wrap" style="margin-bottom:20px">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Campus</th><th>Year</th><th>Data Sources Selected</th>
              </tr></thead>
              <tbody>
                <tr v-if="!filteredDataSourceRows.length" class="empty-row"><td colspan="5">No records found.</td></tr>
                <tr v-for="r in filteredDataSourceRows" :key="r.refId">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td>{{ r.office || '—' }}</td>
                  <td>{{ r.campus || '—' }}</td>
                  <td>{{ r.yearCovered || '—' }}</td>
                  <td style="font-size:12px">
                    <span v-for="(src,i) in (r.dataSources || [])" :key="i" class="badge badge-grey" style="margin-right:4px;margin-bottom:4px">{{ src }}</span>
                    <span v-if="!r.dataSources || !r.dataSources.length" style="color:var(--text-light)">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="sub-section-label" style="margin-bottom:8px">B. Summary of Key Insights / Gaps Identified</div>
          <div class="tbl-wrap">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Campus</th><th>Year</th>
                <th>Data Source</th><th>Identified Gap / Issue</th>
                <th>Relevant Personnel / Function</th><th>Recommended Intervention</th>
              </tr></thead>
              <tbody>
                <tr v-if="!filteredInsightRows.length" class="empty-row"><td colspan="8">No insight data found.</td></tr>
                <tr v-for="r in filteredInsightRows" :key="r._key">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td>{{ r.office }}</td>
                  <td>{{ r.campus }}</td>
                  <td>{{ r.year }}</td>
                  <td>{{ r.dataSource || '—' }}</td>
                  <td class="cell-wrap">{{ r.gap || '—' }}</td>
                  <td style="font-size:12px">{{ r.personnel || '—' }}</td>
                  <td style="font-size:12px">{{ r.intervention || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── HR REGISTRY ── -->
      <div v-if="activeTab === 'registry'" class="tab-panel">
        <div class="reg-actions">
          <button class="btn-add" @click="addHRModal = true">
            <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add HR User
          </button>
          <span style="font-size:13px;color:var(--text-light);align-self:center">Manage who can access this dashboard. Changes apply immediately.</span>
        </div>
        <div class="tbl-wrap">
          <table class="dtbl">
            <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Date Added</th><th>Action</th></tr></thead>
            <tbody>
              <tr v-if="!hrUsers.length" class="empty-row"><td colspan="5">No HR users registered.</td></tr>
              <tr v-for="u in hrUsers" :key="u.email">
                <td>{{ u.email || '—' }}</td>
                <td>{{ u.name || '—' }}</td>
                <td><span class="badge badge-green">{{ u.role || 'HR Staff' }}</span></td>
                <td class="date-cell">{{ fmtDate(u.dateAdded) }}</td>
                <td>
                  <span v-if="u.email === currentUser?.email" style="font-size:12px;color:var(--text-light);font-style:italic">You</span>
                  <button v-else class="btn-remove" @click="removeHR(u.email, u.name)">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- IDP DETAIL MODAL -->
    <div v-if="idpModal" class="modal-overlay active" @click.self="idpModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-header-left">
            <h3>IDP — {{ selectedIDP?.employeeName || 'Unknown' }}</h3>
            <p>{{ selectedIDP?.refId }} &nbsp;·&nbsp; {{ selectedIDP?.yearCovered || '—' }} &nbsp;·&nbsp;
              <span :class="statusBadgeClass(selectedIDP?.status)">{{ statusBadgeLabel(selectedIDP?.status) }}</span>
            </p>
          </div>
          <div class="modal-header-right">
            <button class="btn-pdf" @click="downloadPDF('idp', selectedIDP.refId, selectedIDP.employeeName)">
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Download PDF
            </button>
            <button class="btn-close" @click="idpModal = false">×</button>
          </div>
        </div>
        <div class="modal-body" v-if="selectedIDP">
          <!-- Header -->
          <div class="m-section">
            <div class="m-section-title">Employee Information <span class="m-badge">Header</span></div>
            <div class="dgrid g3">
              <div class="df"><label>Reference ID</label><code>{{ selectedIDP.refId || '—' }}</code></div>
              <div class="df"><label>Year Covered</label><span>{{ selectedIDP.yearCovered || '—' }}</span></div>
              <div class="df"><label>Purpose</label><span>{{ selectedIDP.headerPurpose || '—' }}</span></div>
              <div class="df s3"><label>Name of Personnel</label><span>{{ selectedIDP.employeeName || '—' }}</span></div>
              <div class="df"><label>Email</label><span>{{ selectedIDP.email || '—' }}</span></div>
              <div class="df"><label>Position / Designation</label><span>{{ selectedIDP.position || '—' }}</span></div>
              <div class="df"><label>Office / Unit</label><span>{{ selectedIDP.office || '—' }}</span></div>
              <div class="df"><label>Campus</label><span>{{ selectedIDP.campus || '—' }}</span></div>
              <div class="df"><label>Educational Attainment</label><span>{{ selectedIDP.educAttainment || '—' }}</span></div>
              <div class="df"><label>Years in Position</label><span>{{ selectedIDP.yearsInPosition || '—' }}</span></div>
              <div class="df"><label>Years in CSU</label><span>{{ selectedIDP.yearsInCSU || '—' }}</span></div>
              <div class="df"><label>Immediate Supervisor</label><span>{{ selectedIDP.supervisorName || '—' }}</span></div>
              <div class="df"><label>Supervisor Email</label><span>{{ selectedIDP.supervisorEmail || '—' }}</span></div>
            </div>
          </div>
          <!-- Section I -->
          <div class="m-section">
            <div class="m-section-title">Section I — Competency Assessment <span class="m-badge">Employee</span></div>
            <div class="df" style="margin-bottom:10px"><label>Purpose</label><span>{{ selectedIDP.competencyPurpose || '—' }}</span></div>
            <table class="m-table" v-if="selectedIDP._competencyRows && selectedIDP._competencyRows.length">
              <thead><tr><th>#</th><th>Target Competency</th><th>Cluster</th><th>Current Level</th><th>Required Level</th><th>Suggested Intervention</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP._competencyRows" :key="i">
                  <td>{{ row.priority ?? i+1 }}</td>
                  <td><strong>{{ row.targetCompetency || '—' }}</strong></td>
                  <td>{{ row.competencyGroup || '—' }}</td>
                  <td>{{ row.currentLevel || '—' }}</td>
                  <td>{{ row.requiredLevel || '—' }}</td>
                  <td>{{ row.leadInterventions || '—' }}</td>
                  <td>{{ row.targetTimeline || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else style="font-size:13px;color:var(--text-light)">No competency entries.</p>
          </div>
          <!-- Section II -->
          <div class="m-section">
            <div class="m-section-title">Section II — AGAP <span class="m-badge">Employee</span></div>
            <table class="m-table" v-if="selectedIDP._agapRows && selectedIDP._agapRows.length">
              <thead><tr><th>#</th><th>Degree Program</th><th>Target HEI</th><th>Mode of Study</th><th>Scholarship / Grant</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP._agapRows" :key="i">
                  <td>{{ row.priority ?? i+1 }}</td>
                  <td>{{ row.degreeProgram || '—' }}</td>
                  <td>{{ row.targetHEI || '—' }}</td>
                  <td>{{ row.modeOfStudy || '—' }}</td>
                  <td>{{ row.scholarshipGrant || '—' }}</td>
                  <td>{{ row.targetTimeline || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else style="font-size:13px;color:var(--text-light)">No AGAP entries.</p>
          </div>
          <!-- Section III -->
          <div class="m-section">
            <div class="m-section-title">Section III — Pro-ACT <span class="m-badge">Employee</span></div>
            <table class="m-table" v-if="selectedIDP._proactRows && selectedIDP._proactRows.length">
              <thead><tr><th>#</th><th>Training / Workshop Title</th><th>Target Competency</th><th>Mode of Activity</th><th>Trainer / Provider</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP._proactRows" :key="i">
                  <td>{{ row.priority ?? i+1 }}</td>
                  <td>{{ row.trainingTitle || '—' }}</td>
                  <td>{{ row.targetSkill || '—' }}</td>
                  <td>{{ row.modeOfActivity || '—' }}</td>
                  <td>{{ row.trainerProvider || '—' }}</td>
                  <td>{{ row.targetTimeline || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else style="font-size:13px;color:var(--text-light)">No Pro-ACT entries.</p>
          </div>
          <!-- Section IV -->
          <div class="m-section">
            <div class="m-section-title">Section IV — Supervisor Assessment <span class="m-badge">Supervisor</span></div>
            <div v-if="selectedIDP.status === 'COMPLETE' && selectedIDP._assessment" class="dgrid">
              <div class="df"><label>Performance Gaps?</label><span>{{ selectedIDP._assessment.perfGapsYN || '—' }}</span></div>
              <div class="df"><label>Ready for Advancement?</label><span>{{ selectedIDP._assessment.readinessYN || '—' }}</span></div>
              <div class="df s2"><label>Gap Description</label><span style="white-space:pre-wrap">{{ selectedIDP._assessment.perfGapsSpec || '—' }}</span></div>
              <div class="df s2"><label>Readiness Remarks</label><span style="white-space:pre-wrap">{{ selectedIDP._assessment.readinessRemarks || '—' }}</span></div>
              <div class="df s2"><label>Recommended Interventions</label><span>{{ Array.isArray(selectedIDP._assessment.interventions) ? selectedIDP._assessment.interventions.join(', ') : (selectedIDP._assessment.interventions || '—') }}</span></div>
              <div class="df"><label>Implementation Period</label><span>{{ selectedIDP._assessment.implYear || '' }} {{ selectedIDP._assessment.implementationPeriod || '—' }}</span></div>
              <div class="df"><label>Review Date</label><span>{{ fmtDate(selectedIDP.supervisorSignedAt) }}</span></div>
              <div class="df s2"><label>Additional Comments</label><span style="white-space:pre-wrap">{{ selectedIDP._assessment.additionalComments || '—' }}</span></div>
            </div>
            <div v-else class="pending-note">Supervisor assessment not yet completed.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- LNA DETAIL MODAL -->
    <div v-if="lnaModal" class="modal-overlay active" @click.self="lnaModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-header-left">
            <h3>LNA — {{ selectedLNA?.office || 'Unknown Office' }}</h3>
            <p>{{ selectedLNA?.refId }} &nbsp;·&nbsp; {{ selectedLNA?.yearCovered || '—' }} &nbsp;·&nbsp; {{ selectedLNA?.purpose || '—' }}</p>
          </div>
          <div class="modal-header-right">
            <button class="btn-pdf" @click="downloadPDF('lna', selectedLNA.refId, selectedLNA.office)">
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Download PDF
            </button>
            <button class="btn-close" @click="lnaModal = false">×</button>
          </div>
        </div>
        <div class="modal-body" v-if="selectedLNA">
          <div class="m-section">
            <div class="m-section-title">Office Information <span class="m-badge">Header</span></div>
            <div class="dgrid g3">
              <div class="df"><label>Reference ID</label><code>{{ selectedLNA.refId || '—' }}</code></div>
              <div class="df"><label>Year Covered</label><span>{{ selectedLNA.yearCovered || '—' }}</span></div>
              <div class="df"><label>Purpose</label><span>{{ selectedLNA.purpose || '—' }}</span></div>
              <div class="df s3"><label>Office / Unit / College</label><span>{{ selectedLNA.office || '—' }}</span></div>
              <div class="df"><label>Head of Office</label><span>{{ selectedLNA.headOfUnit || '—' }}</span></div>
              <div class="df"><label>Position</label><span>{{ selectedLNA.position || '—' }}</span></div>
              <div class="df"><label>Campus</label><span>{{ selectedLNA.campus || '—' }}</span></div>
              <div class="df"><label>Total Personnel</label><span>{{ selectedLNA.totalPersonnel || '—' }}</span></div>
              <div class="df"><label>Rater</label><span>{{ selectedLNA.raterFullName || selectedLNA.raterName || '—' }}</span></div>
              <div class="df"><label>Date Prepared</label><span>{{ selectedLNA.datePrepared || '—' }}</span></div>
            </div>
          </div>
          <div class="m-section">
            <div class="m-section-title">Section III — Data Sources <span class="m-badge">Office</span></div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
              <span v-for="(src,i) in (selectedLNA._dataSources || [])" :key="i" class="badge badge-grey">{{ src }}</span>
              <span v-if="!selectedLNA._dataSources?.length" style="font-size:13px;color:var(--text-light)">No sources recorded.</span>
            </div>
            <table class="m-table" v-if="(selectedLNA.dataSourceInsights || selectedLNA.insightRows || []).length">
              <thead><tr><th>Data Source</th><th>Gap / Issue</th><th>Relevant Personnel</th><th>Recommended Intervention</th></tr></thead>
              <tbody>
                <tr v-for="(row,i) in (selectedLNA._insightRows || [])" :key="i">
                  <td>{{ row.dataSource || '—' }}</td>
                  <td style="white-space:pre-wrap">{{ row.gap || '—' }}</td>
                  <td>{{ row.personnel || '—' }}</td>
                  <td>{{ row.intervention || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD HR MODAL -->
    <div v-if="addHRModal" class="modal-overlay active" @click.self="addHRModal = false">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <div class="modal-header-left"><h3>Add HR User</h3></div>
          <div class="modal-header-right"><button class="btn-close" @click="addHRModal = false">×</button></div>
        </div>
        <div class="modal-body">
          <p style="font-size:13px;color:var(--text-light);margin-bottom:16px">The new user can log in once added to the HR Registry.</p>
          <div class="add-field"><label>CarSU Email *</label><input type="email" v-model="newHR.email" placeholder="name@carsu.edu.ph" /></div>
          <div class="add-field"><label>Full Name *</label><input type="text" v-model="newHR.name" placeholder="e.g. Juan Dela Cruz" /></div>
          <div class="add-field"><label>Role / Designation</label><input type="text" v-model="newHR.role" placeholder="e.g. HRMO II" /></div>
          <button class="btn-save" @click="saveHR">Save to Registry</button>
        </div>
      </div>
    </div>

    <!-- TOASTS -->
    <div class="toast-wrap">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">{{ t.msg }}</div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ ssr: false });
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';

const config = useRuntimeConfig();
const API = config.public.apiBase;

// ── STATE ──────────────────────────────────────────────────────────────────
const screen      = ref('login');
const currentUser = ref(null);
const loginEmail  = ref('');
const loginHint   = ref('');
const loginHintType = ref('');
const loginLoading  = ref(false);
const deniedMsg   = ref('');
const dataLoading = ref(false);
const lastUpdated = ref('Loading data...');
const activeTab   = ref('overview');
const idpSubTab   = ref('list');
const lnaSubTab   = ref('list');

const idps    = ref([]);
const lnas    = ref([]);
const hrUsers = ref([]);

const idpSearch       = ref('');
const idpStatusFilter = ref('');
const idpCampusFilter = ref('');
const idpYearFilter   = ref('');
const lnaSearch       = ref('');
const lnaCampusFilter = ref('');
const lnaYearFilter   = ref('');

// ── Advanced filter state ──
const showAdvFilters  = ref(false);

// IDP - All Submissions
const idpOfficeFilter    = ref('');
const idpPositionFilter  = ref('');

// IDP - Competency tab
const idpCompClusterFilter      = ref('');
const idpCompTargetCompFilter   = ref('');
const idpCompCurrentLvlFilter   = ref('');
const idpCompRequiredLvlFilter  = ref('');
const idpCompInterventionFilter = ref('');
const idpCompTimelineFilter     = ref('');
const idpCompGapFilter          = ref('');

// IDP - AGAP tab
const idpAgapDegreeFilter       = ref('');
const idpAgapHeiFilter          = ref('');
const idpAgapModeFilter         = ref('');
const idpAgapScholarshipFilter  = ref('');
const idpAgapTimelineFilter     = ref('');

// IDP - Pro-ACT tab
const idpProactTitleFilter      = ref('');
const idpProactSkillFilter      = ref('');
const idpProactModeFilter       = ref('');
const idpProactProviderFilter   = ref('');
const idpProactTimelineFilter   = ref('');

// IDP - Supervisor tab
const idpSupPerfGapsFilter     = ref('');
const idpSupReadinessFilter    = ref('');
const idpSupInterventionFilter = ref('');
const idpSupImplYearFilter     = ref('');
const idpSupImplPeriodFilter   = ref('');

// LNA advanced filter state
const showLnaAdvFilters = ref(false);

// LNA - All Submissions
const lnaPurposeFilter  = ref('');
const lnaOfficeFilter   = ref('');

// LNA - Workforce
const lnaWfLevelFilter    = ref('');
const lnaWfHasTypeFilter  = ref('');
const lnaWfCountFilter    = ref('');

// LNA - Competency (cluster summary)
const lnaClusterFilter          = ref('');
const lnaStrongestFilter        = ref('');
const lnaWeakestFilter          = ref('');
const lnaInterventionFilter     = ref('');   // Yes / No / ''

// LNA - Competency (detailed mapping)
const lnaCompClusterFilter      = ref('');
const lnaCompCompetencyFilter   = ref('');
const lnaHasObsFilter           = ref('');

// LNA - Sources (data sources table)
const lnaDataSourceFilter       = ref('');
const lnaHasSourcesFilter       = ref('');

// LNA - Insights
const lnaInsightSourceFilter         = ref('');
const lnaInsightPersonnelFilter      = ref('');
const lnaInsightInterventionFilter    = ref('');

const sortState = reactive({ idp: { col: -1, asc: true }, lna: { col: -1, asc: true } });
const ovActive = ref(null); // null | 'idp-all' | 'idp-pending' | 'idp-supervisor' | 'idp-complete' | 'lna-all' | 'lna-offices' | 'lna-flagged'

const idpModal   = ref(false);
const lnaModal   = ref(false);
const addHRModal = ref(false);
const selectedIDP = ref(null);
const selectedLNA = ref(null);
const newHR = reactive({ email: '', name: '', role: '' });
const toasts = ref([]);



// ── STATIC CONFIG ──────────────────────────────────────────────────────────
const tabs = [
  { key: 'overview', label: 'Overview',       icon: '📊' },
  { key: 'idp',      label: 'IDP Submissions', icon: '📋' },
  { key: 'lna',      label: 'LNA Submissions', icon: '📝' },
  { key: 'registry', label: 'HR Registry',     icon: '👥' },
];

const idpSubTabs = [
  { key: 'list',       label: 'All Submissions',             icon: '📋' },
  { key: 'competency', label: 'Section I — Competency',      icon: '🎯' },
  { key: 'agap',       label: 'Section II — AGAP',           icon: '🎓' },
  { key: 'proact',     label: 'Section III — Pro-ACT',       icon: '📚' },
  { key: 'supervisor', label: 'Section IV — Supervisor',     icon: '✅' },
];

const lnaSubTabs = [
  { key: 'list',       label: 'All Submissions',              icon: '📋' },
  { key: 'workforce',  label: 'Section I — Workforce',        icon: '👥' },
  { key: 'competency', label: 'Section II — Competency',      icon: '🎯' },
  { key: 'sources',    label: 'Section III — Data Sources',   icon: '📊' },
];

const idpCols = ['Ref ID','Name','Position','Office','Campus','Year','Submitted','Status'];
const lnaCols = ['Ref ID','Office / Unit','Head of Office','Campus','Year','Purpose','Personnel','Submitted'];

const POSITION_LEVELS = [
  { key: 'first',        label: 'First Level Positions' },
  { key: 'secondNonSup', label: 'Second Level (Non-Supervisory)' },
  { key: 'secondSup',    label: 'Second Level (Supervisory)' },
  { key: 'third',        label: 'Third Level Positions' },
  { key: 'faculty',      label: 'Faculty Positions' },
];
const EMP_TYPE_KEYS = ['permanent','temporary','contractual','casual','coterminus','cos','jobOrder','others'];
const COMP_CLUSTERS = [
  { key: 'coreCompetencies', label: 'Core' },
  { key: 'leadershipComps',  label: 'Leadership' },
  { key: 'orgComps',         label: 'Organizational' },
  { key: 'technicalComps',   label: 'Technical' },
];

// ── COMPUTED — FILTERS ─────────────────────────────────────────────────────
const idpCampuses = computed(() => [...new Set(idps.value.map(r => r.campus).filter(Boolean))].sort());
const idpYears    = computed(() => [...new Set(idps.value.map(r => r.yearCovered).filter(Boolean))].sort().reverse());
const lnaYears    = computed(() => [...new Set(lnas.value.map(r => r.yearCovered).filter(Boolean))].sort().reverse());


const filteredLNAs = computed(() => {
  const q = lnaSearch.value.toLowerCase();
  let rows = lnas.value.filter(r => {
    const ms = !q || [r.refId, r.office, r.headOfUnit, r.email, r.campus].some(v => (v||'').toLowerCase().includes(q));
    return ms && (!lnaCampusFilter.value || r.campus === lnaCampusFilter.value)
              && (!lnaYearFilter.value   || r.yearCovered === lnaYearFilter.value)
              && (!lnaPurposeFilter.value || r.purpose === lnaPurposeFilter.value)
              && (!lnaOfficeFilter.value  || r.office  === lnaOfficeFilter.value);
  });
  const { col, asc } = sortState.lna;
  if (col >= 0) {
    const ks = ['refId','office','headOfUnit','campus','yearCovered','purpose','totalPersonnel','submittedAt'];
    rows = [...rows].sort((a,b) => { const av=(a[ks[col]]||'').toLowerCase(), bv=(b[ks[col]]||'').toLowerCase(); return asc ? av.localeCompare(bv) : bv.localeCompare(av); });
  }
  return rows;
});

// ── COMPUTED — ADVANCED FILTER OPTIONS (with counts) ───────────────────────
const idpOffices   = computed(() => [...new Set(idps.value.map(r => r.office).filter(Boolean))].sort());
const idpPositions = computed(() => [...new Set(idps.value.map(r => r.position).filter(Boolean))].sort());

// Base filtered IDPs (shared by all sub-tabs, includes office+position filter)
const baseFilteredIDPs = computed(() => {
  const q = idpSearch.value.toLowerCase();
  let rows = idps.value.filter(r => {
    const ms = !q || [r.refId, r.employeeName, r.email, r.office, r.campus, r.position].some(v => (v||'').toLowerCase().includes(q));
    return ms
      && (!idpStatusFilter.value   || r.status === idpStatusFilter.value)
      && (!idpCampusFilter.value   || r.campus === idpCampusFilter.value)
      && (!idpYearFilter.value     || r.yearCovered === idpYearFilter.value)
      && (!idpOfficeFilter.value   || r.office === idpOfficeFilter.value)
      && (!idpPositionFilter.value || r.position === idpPositionFilter.value);
  });
  const { col, asc } = sortState.idp;
  if (col >= 0) {
    const ks = ['refId','employeeName','position','office','campus','yearCovered','submittedAt','status'];
    rows = [...rows].sort((a,b) => { const av=(a[ks[col]]||'').toLowerCase(), bv=(b[ks[col]]||'').toLowerCase(); return asc ? av.localeCompare(bv) : bv.localeCompare(av); });
  }
  return rows;
});

const filteredIDPs = computed(() => baseFilteredIDPs.value);

// ── Competency filter options ───────────────────────────────────────────────
const compClusterOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._competencyRows||[]).forEach(row => {
    const v = (row.competencyGroup||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const compTargetCompOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._competencyRows||[]).forEach(row => {
    const v = (row.targetCompetency||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const compCurrentLvlOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._competencyRows||[]).forEach(row => {
    const v = (row.currentLevel||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const compRequiredLvlOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._competencyRows||[]).forEach(row => {
    const v = (row.requiredLevel||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const compInterventionOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._competencyRows||[]).forEach(row => {
    const v = (row.leadInterventions||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const compTimelineOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._competencyRows||[]).forEach(row => {
    const v = (row.targetTimeline||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});

// Filtered competency rows (applies adv filters on top)
const filteredCompetencyRows = computed(() => {
  return idpCompetencyRows.value.filter(r => {
    const curLvl = parseInt(r.currentLevel) || 0;
    const reqLvl = parseInt(r.requiredLevel) || 0;
    const hasGap = reqLvl > curLvl;
    const gapMatch = !idpCompGapFilter.value ||
      (idpCompGapFilter.value === 'Yes' && hasGap) ||
      (idpCompGapFilter.value === 'No' && !hasGap);
    return (!idpCompClusterFilter.value      || r.competencyGroup === idpCompClusterFilter.value)
    && (!idpCompTargetCompFilter.value      || r.targetCompetency === idpCompTargetCompFilter.value)
    && (!idpCompCurrentLvlFilter.value      || r.currentLevel === idpCompCurrentLvlFilter.value)
    && (!idpCompRequiredLvlFilter.value     || r.requiredLevel === idpCompRequiredLvlFilter.value)
    && (!idpCompInterventionFilter.value    || r.leadInterventions === idpCompInterventionFilter.value)
    && (!idpCompTimelineFilter.value        || r.targetTimeline === idpCompTimelineFilter.value)
    && gapMatch;
  });
});

// ── AGAP filter options ─────────────────────────────────────────────────────
const agapDegreeOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._agapRows||[]).forEach(row => {
    const v = (row.degreeProgram||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const agapHeiOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._agapRows||[]).forEach(row => {
    const v = (row.targetHEI||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const agapModeOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._agapRows||[]).forEach(row => {
    const v = (row.modeOfStudy||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const agapScholarshipOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._agapRows||[]).forEach(row => {
    const v = (row.scholarshipGrant||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const agapTimelineOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._agapRows||[]).forEach(row => {
    const v = (row.targetTimeline||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const filteredAgapRows = computed(() => {
  return idpAgapRows.value.filter(r =>
    (!idpAgapDegreeFilter.value         || r.degreeProgram === idpAgapDegreeFilter.value)
    && (!idpAgapHeiFilter.value          || r.targetHEI === idpAgapHeiFilter.value)
    && (!idpAgapModeFilter.value         || r.modeOfStudy === idpAgapModeFilter.value)
    && (!idpAgapScholarshipFilter.value  || r.scholarshipGrant === idpAgapScholarshipFilter.value)
    && (!idpAgapTimelineFilter.value    || r.targetTimeline === idpAgapTimelineFilter.value)
  );
});

// ── Pro-ACT filter options ──────────────────────────────────────────────────
const proactTitleOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._proactRows||[]).forEach(row => {
    const v = (row.trainingTitle||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const proactSkillOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._proactRows||[]).forEach(row => {
    const v = (row.targetSkill||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const proactModeOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._proactRows||[]).forEach(row => {
    const v = (row.modeOfActivity||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const proactProviderOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._proactRows||[]).forEach(row => {
    const v = (row.trainerProvider||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const proactTimelineOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => (r._proactRows||[]).forEach(row => {
    const v = (row.targetTimeline||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  }));
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const filteredProactRows = computed(() => {
  return idpProactRows.value.filter(r =>
    (!idpProactTitleFilter.value       || r.trainingTitle === idpProactTitleFilter.value)
    && (!idpProactSkillFilter.value     || r.targetSkill === idpProactSkillFilter.value)
    && (!idpProactModeFilter.value      || r.modeOfActivity === idpProactModeFilter.value)
    && (!idpProactProviderFilter.value   || r.trainerProvider === idpProactProviderFilter.value)
    && (!idpProactTimelineFilter.value   || r.targetTimeline === idpProactTimelineFilter.value)
  );
});

// ── Supervisor filter options ───────────────────────────────────────────────
const supInterventionOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => {
    if (!r._assessment) return;
    const arr = Array.isArray(r._assessment.interventions) ? r._assessment.interventions : [];
    arr.forEach(v => { const vt = (v||'').trim(); if (vt) freq[vt] = (freq[vt]||0)+1; });
  });
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const supImplYearOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => {
    if (!r._assessment) return;
    const v = (r._assessment.implYear||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const supImplPeriodOptions = computed(() => {
  const freq = {};
  baseFilteredIDPs.value.forEach(r => {
    if (!r._assessment) return;
    const v = (r._assessment.implementationPeriod||'').trim(); if (v) freq[v] = (freq[v]||0)+1;
  });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});

// People who match the supervisor filters (for WHO count)
const filteredSupRows = computed(() => {
  return baseFilteredIDPs.value.filter(r => {
    if (!r._assessment && (idpSupPerfGapsFilter.value || idpSupReadinessFilter.value || idpSupInterventionFilter.value || idpSupImplYearFilter.value || idpSupImplPeriodFilter.value)) return false;
    if (!r._assessment) return true;
    const a = r._assessment;
    const interventions = Array.isArray(a.interventions) ? a.interventions : [];
    return (!idpSupPerfGapsFilter.value    || a.perfGapsYN === idpSupPerfGapsFilter.value)
        && (!idpSupReadinessFilter.value   || a.readinessYN === idpSupReadinessFilter.value)
        && (!idpSupInterventionFilter.value|| interventions.includes(idpSupInterventionFilter.value))
        && (!idpSupImplYearFilter.value    || a.implYear === idpSupImplYearFilter.value)
        && (!idpSupImplPeriodFilter.value  || a.implementationPeriod === idpSupImplPeriodFilter.value);
  });
});

// helper: active filter count for a tab
function countActiveFilters(filters) { return filters.filter(v => v.value !== '').length; }
function clearFilters(refs) { refs.forEach(r => r.value = ''); }

// ── COMPUTED — IDP SECTION EXPANSIONS ──────────────────────────────────────
const idpCompetencyRows = computed(() => {
  const out = [];
  filteredIDPs.value.forEach(r => {
    (r._competencyRows || []).forEach((row, i) => {
      out.push({
        _key: `${r.refId}-c${i}`,
        refId: r.refId, name: r.employeeName, email: r.email,
        position: r.position, office: r.office, year: r.yearCovered,
        priority: row.priority ?? i+1,
        targetCompetency: row.targetCompetency,
        competencyGroup:  row.competencyGroup,
        currentLevel:     row.currentLevel,
        requiredLevel:    row.requiredLevel,
        leadInterventions:row.leadInterventions,
        targetTimeline:   row.targetTimeline,
      });
    });
  });
  return out;
});

const idpAgapRows = computed(() => {
  const out = [];
  filteredIDPs.value.forEach(r => {
    (r._agapRows || []).forEach((row, i) => {
      out.push({
        _key: `${r.refId}-a${i}`,
        refId: r.refId, name: r.employeeName,
        position: r.position, office: r.office, year: r.yearCovered,
        priority: row.priority ?? i+1,
        degreeProgram:   row.degreeProgram,
        targetHEI:       row.targetHEI,
        modeOfStudy:     row.modeOfStudy,
        scholarshipGrant:row.scholarshipGrant,
        targetTimeline:  row.targetTimeline,
      });
    });
  });
  return out;
});

const idpProactRows = computed(() => {
  const out = [];
  filteredIDPs.value.forEach(r => {
    (r._proactRows || []).forEach((row, i) => {
      out.push({
        _key: `${r.refId}-p${i}`,
        refId: r.refId, name: r.employeeName,
        position: r.position, office: r.office, year: r.yearCovered,
        priority: row.priority ?? i+1,
        trainingTitle:  row.trainingTitle,
        targetSkill:    row.targetSkill,
        modeOfActivity: row.modeOfActivity,
        trainerProvider:row.trainerProvider,
        targetTimeline: row.targetTimeline,
      });
    });
  });
  return out;
});

// ── COMPUTED — LNA SECTION EXPANSIONS ──────────────────────────────────────
const lnaWorkforceRows = computed(() => {
  const out = [];
  filteredLNAs.value.forEach(r => {
    const wp = r.workforceProfile || {};
    POSITION_LEVELS.forEach(lv => {
      const row = wp[lv.key] || {};
      const total = EMP_TYPE_KEYS.reduce((s, k) => s + (Number(row[k]) || 0), 0);
      if (total === 0) return;
      out.push({ _key: `${r.refId}-wf-${lv.key}`, refId: r.refId, office: r.office, campus: r.campus, year: r.yearCovered, levelLabel: lv.label, ...row, total });
    });
  });
  return out;
});

const lnaClusterRows = computed(() => {
  const out = [];
  filteredLNAs.value.forEach(r => {
    (r._clusterSummary || []).forEach((row, i) => {
      out.push({ _key: `${r.refId}-cs${i}`, refId: r.refId, office: r.office, campus: r.campus, year: r.yearCovered, cluster: row.cluster, strongest: row.strongest, weakest: row.weakest, interventionNeeded: row.interventionNeeded });
    });
  });
  return out;
});

const lnaCompRows = computed(() => {
  const out = [];
  filteredLNAs.value.forEach(r => {
    COMP_CLUSTERS.forEach(({ key, label }) => {
      (r[key] || []).forEach((row, i) => {
        out.push({ _key: `${r.refId}-${key}-${i}`, refId: r.refId, office: r.office, campus: r.campus, year: r.yearCovered, cluster: label, competency: row.competency, first_cl: row.first_cl, first_pct: row.first_pct, secondNonSup_cl: row.secondNonSup_cl, secondNonSup_pct: row.secondNonSup_pct, secondSup_cl: row.secondSup_cl, secondSup_pct: row.secondSup_pct, third_cl: row.third_cl, third_pct: row.third_pct, faculty_cl: row.faculty_cl, faculty_pct: row.faculty_pct, observations: row.observations });
      });
    });
  });
  return out;
});

const lnaInsightRows = computed(() => {
  const out = [];
  filteredLNAs.value.forEach(r => {
    (r._insightRows || []).forEach((row, i) => {
      out.push({ _key: `${r.refId}-ins${i}`, refId: r.refId, office: r.office, campus: r.campus, year: r.yearCovered, dataSource: row.dataSource, gap: row.gap, personnel: row.personnel, intervention: row.intervention });
    });
  });
  return out;
});
// ── COMPUTED — LNA ADVANCED FILTER OPTIONS ─────────────────────────────────
const lnaPurposeOptions = computed(() => {
  const freq = {};
  lnas.value.forEach(r => { const v=(r.purpose||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const lnaOffices = computed(() => [...new Set(lnas.value.map(r=>r.office).filter(Boolean))].sort());

// Workforce - position level options
const lnaWfLevelOptions = computed(() => {
  const seen = new Set();
  filteredLNAs.value.forEach(r => {
    const wp = r.workforceProfile || {};
    POSITION_LEVELS.forEach(lv => {
      const row = wp[lv.key] || {};
      const total = EMP_TYPE_KEYS.reduce((s,k)=>s+(Number(row[k])||0),0);
      if (total > 0) seen.add(lv.label);
    });
  });
  return POSITION_LEVELS.filter(lv => seen.has(lv.label)).map(lv=>({v:lv.label,c:null}));
});
const lnaWfHasTypeOptions = computed(() => {
  const freq = {};
  lnaWorkforceRows.value.forEach(r => {
    EMP_TYPE_KEYS.forEach(k => {
      if (Number(r[k]) > 0) {
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        freq[label] = (freq[label]||0) + 1;
      }
    });
  });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const filteredWorkforceRows = computed(() =>
  lnaWorkforceRows.value.filter(r => {
    const levelMatch = !lnaWfLevelFilter.value || r.levelLabel === lnaWfLevelFilter.value;
    let typeMatch = true;
    if (lnaWfHasTypeFilter.value) {
      const key = lnaWfHasTypeFilter.value.toLowerCase();
      typeMatch = Number(r[key]) > 0;
    }
    let countMatch = true;
    if (lnaWfCountFilter.value) {
      const t = r.total || 0;
      if (lnaWfCountFilter.value === 'gt0') countMatch = t > 0;
      else if (lnaWfCountFilter.value === 'gt10') countMatch = t > 10;
      else if (lnaWfCountFilter.value === 'gt50') countMatch = t > 50;
    }
    return levelMatch && typeMatch && countMatch;
  })
);

// Competency - cluster summary filter options
const lnaClusterOptions = computed(() => {
  const freq = {};
  lnaClusterRows.value.forEach(r => { const v=(r.cluster||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const lnaStrongestOptions = computed(() => {
  const freq = {};
  lnaClusterRows.value.forEach(r => { const v=(r.strongest||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const lnaWeakestOptions = computed(() => {
  const freq = {};
  lnaClusterRows.value.forEach(r => { const v=(r.weakest||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const filteredClusterRows = computed(() =>
  lnaClusterRows.value.filter(r => {
    const intMatch = !lnaInterventionFilter.value ||
      (lnaInterventionFilter.value === 'Yes' && (r.interventionNeeded === 'Y' || r.interventionNeeded === 'Yes')) ||
      (lnaInterventionFilter.value === 'No'  && (r.interventionNeeded === 'N' || r.interventionNeeded === 'No'));
    return (!lnaClusterFilter.value || r.cluster === lnaClusterFilter.value)
      && (!lnaStrongestFilter.value || r.strongest === lnaStrongestFilter.value)
      && (!lnaWeakestFilter.value || r.weakest === lnaWeakestFilter.value)
      && intMatch;
  })
);

// Competency - detailed mapping filter options
const lnaCompClusterOptions = computed(() => {
  const freq = {};
  lnaCompRows.value.forEach(r => { const v=(r.cluster||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const lnaCompCompetencyOptions = computed(() => {
  const freq = {};
  lnaCompRows.value
    .filter(r => !lnaCompClusterFilter.value || r.cluster === lnaCompClusterFilter.value)
    .forEach(r => { const v=(r.competency||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const filteredCompRows = computed(() =>
  lnaCompRows.value.filter(r => {
    let obsMatch = true;
    if (lnaHasObsFilter.value) {
      const hasObs = !!(r.observations && r.observations.trim());
      obsMatch = lnaHasObsFilter.value === 'Yes' ? hasObs : !hasObs;
    }
    return (!lnaCompClusterFilter.value    || r.cluster    === lnaCompClusterFilter.value)
    && (!lnaCompCompetencyFilter.value || r.competency === lnaCompCompetencyFilter.value)
    && obsMatch;
  })
);

// Sources - data source options
const lnaDataSourceOptions = computed(() => {
  const freq = {};
  filteredLNAs.value.forEach(r => {
    (r.dataSources || []).forEach(v => { const vt=(v||'').trim(); if(vt) freq[vt]=(freq[vt]||0)+1; });
  });
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const filteredDataSourceRows = computed(() =>
  filteredLNAs.value.filter(r => {
    let srcMatch = !lnaDataSourceFilter.value || (r.dataSources||[]).includes(lnaDataSourceFilter.value);
    let hasMatch = true;
    if (lnaHasSourcesFilter.value) {
      const hasSources = (r.dataSources||[]).length > 0;
      hasMatch = lnaHasSourcesFilter.value === 'Yes' ? hasSources : !hasSources;
    }
    return srcMatch && hasMatch;
  })
);

// Insights filter options
const lnaInsightSourceOptions = computed(() => {
  const freq = {};
  lnaInsightRows.value.forEach(r => { const v=(r.dataSource||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const lnaInsightPersonnelOptions = computed(() => {
  const freq = {};
  lnaInsightRows.value.forEach(r => { const v=(r.personnel||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>a[0].localeCompare(b[0])).map(([v,c])=>({v,c}));
});
const lnaInsightInterventionOptions = computed(() => {
  const freq = {};
  lnaInsightRows.value.forEach(r => { const v=(r.intervention||'').trim(); if(v) freq[v]=(freq[v]||0)+1; });
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
});
const filteredInsightRows = computed(() =>
  lnaInsightRows.value.filter(r =>
    (!lnaInsightSourceFilter.value         || r.dataSource   === lnaInsightSourceFilter.value)
    && (!lnaInsightPersonnelFilter.value    || r.personnel === lnaInsightPersonnelFilter.value)
    && (!lnaInsightInterventionFilter.value || r.intervention === lnaInsightInterventionFilter.value)
  )
);


// ── STATS ──────────────────────────────────────────────────────────────────
const stats = computed(() => {
  const total = idps.value.length;
  const done  = idps.value.filter(r => r.status === 'COMPLETE').length;
  const pend  = idps.value.filter(r => r.status === 'PENDING').length;
  const over  = idps.value.filter(r => r.status === 'OVERDUE').length;
  const lnaCount = lnas.value.length;
  const offices = new Set([...idps.value.map(r => r.office), ...lnas.value.map(r => r.office)].filter(Boolean)).size;
  return [
    { label:'Total IDPs',      value:total,    sub:'Submitted plans',         icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { label:'Completed',       value:done,     sub:'Supervisor reviewed',      icon:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
    { label:'Pending IDPs',    value:pend,     sub:'Awaiting supervisor',      icon:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
    { label:'Overdue IDPs',    value:over,     sub:'Past deadline',            icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
    { label:'Total LNAs',      value:lnaCount, sub:'Office assessments',       icon:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>' },
    { label:'Offices Covered', value:offices,  sub:'Unique units submitted',   icon:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  ];
});

const insights = computed(() => {
  const yrs = idps.value.map(r => parseFloat(r.yearsInPosition)).filter(n => !isNaN(n));
  const avgYrs = yrs.length ? (yrs.reduce((a,b)=>a+b,0)/yrs.length).toFixed(1)+' yrs' : '—';
  const rate = idps.value.length ? Math.round((idps.value.filter(r=>r.status==='COMPLETE').length/idps.value.length)*100)+'%' : '—';
  const supPending = new Set(idps.value.filter(r=>r.status==='PENDING').map(r=>r.supervisorEmail).filter(Boolean)).size;
  let flagCount = 0;
  lnas.value.forEach(r => { try { if ((r.clusterSummary||[]).some(c=>c.interventionNeeded==='Y')) flagCount++; } catch{} });
  const modes={};
  idps.value.forEach(r=>{(r.agapRows||[]).forEach(row=>{const m=(row.modeOfStudy||'').trim();if(m)modes[m]=(modes[m]||0)+1;});});
  const tm = Object.entries(modes).sort((a,b)=>b[1]-a[1])[0];
  const rf={};
  idps.value.forEach(r=>{(r.supervisorInterventions||[]).forEach(i=>{rf[i]=(rf[i]||0)+1;});});
  const tr = Object.entries(rf).sort((a,b)=>b[1]-a[1])[0];
  return [
    { label:'Avg Years in Position',             value:avgYrs },
    { label:'IDP Completion Rate',               value:rate },
    { label:'Supervisors w/ Pending',            value:supPending },
    { label:'LNA Offices Flagging Intervention', value:flagCount+(flagCount===1?' office':' offices') },
    { label:'Most Common AGAP Mode',             value:tm?tm[0]:'—' },
    { label:'Top Supervisor Recommendation',     value:tr?tr[0]:'—' },
  ];
});


// ── DATA NORMALIZATION ──────────────────────────────────────────────────────
function normalizeIDP(raw) {
  let competencyRows = [], agapRows = [], proactRows = [], assessment = null;
  try { competencyRows = JSON.parse(raw.competencyRowsJson || '[]'); } catch {}
  try { agapRows       = JSON.parse(raw.agapRowsJson       || '[]'); } catch {}
  try { proactRows     = JSON.parse(raw.proactRowsJson     || '[]'); } catch {}
  try { assessment     = JSON.parse(raw.supervisorAssessment || 'null'); } catch {}
  return {
    ...raw,
    employeeName: [raw.firstName, raw.lastName].filter(Boolean).join(' ') || raw.nameOfPersonnel || '',
    email:    raw.employeeEmail    || '',
    position: raw.currentPosition  || '',
    office:   raw.collegeOfficeUnit || '',
    _competencyRows: competencyRows,
    _agapRows:       agapRows,
    _proactRows:     proactRows,
    _assessment:     assessment,
  };
}

function normalizeLNA(raw) {
  return {
    ...raw,
    office:          raw.office || raw.unitOfficCollege || '',
    _clusterSummary: raw.clusterSummaryRaw || raw.clusterSummary || [],
    _dataSources:    raw.dataSourcesRaw    || raw.dataSources    || [],
    _insightRows:    raw.dataSourceInsights || [],
  };
}

const topCompetencyGaps = computed(() => {
  const freq = {};
  idps.value.forEach(r => {
    (r._competencyRows || []).forEach(row => {
      const comp = (row.targetCompetency || '').trim();
      const cur  = parseInt(row.currentLevel)  || 0;
      const req  = parseInt(row.requiredLevel) || 0;
      if (comp && req > cur) freq[comp] = (freq[comp] || 0) + 1;
    });
  });
  return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,8).map(([label,count]) => ({ label, count }));
});

// ── OVERVIEW COMPUTED ──────────────────────────────────────────────────────
const ovCounts = computed(() => ({
  idpPending:  idps.value.filter(r => r.status === 'PENDING').length,
  idpWithSup:  idps.value.filter(r => r.status === 'SUPERVISOR_NOTIFIED').length,
  idpComplete: idps.value.filter(r => r.status === 'COMPLETE').length,
  lnaOffices:  new Set(lnas.value.map(r => r.office).filter(Boolean)).size,
  lnaFlagged:  lnas.value.filter(r => (r._clusterSummary || []).some(c => c.interventionNeeded === 'Yes' || c.interventionNeeded === 'Y')).length,
}));

const ovDrillTitle = computed(() => {
  const map = {
    'idp-all':        `All IDP Submissions (${idps.value.length})`,
    'idp-pending':    `Pending IDPs — Awaiting Supervisor (${ovCounts.value.idpPending})`,
    'idp-supervisor': `IDPs With Supervisor — Not Yet Reviewed (${ovCounts.value.idpWithSup})`,
    'idp-complete':   `Completed IDPs (${ovCounts.value.idpComplete})`,
    'lna-all':        `All LNA Submissions (${lnas.value.length})`,
    'lna-offices':    `LNA Submissions by Office`,
    'lna-flagged':    `LNA Offices Flagging Intervention Needed (${ovCounts.value.lnaFlagged})`,
  };
  return map[ovActive.value] || '';
});

const ovDrillRows = computed(() => {
  switch (ovActive.value) {
    case 'idp-all':        return idps.value;
    case 'idp-pending':    return idps.value.filter(r => r.status === 'PENDING');
    case 'idp-supervisor': return idps.value.filter(r => r.status === 'SUPERVISOR_NOTIFIED');
    case 'idp-complete':   return idps.value.filter(r => r.status === 'COMPLETE');
    case 'lna-all':        return lnas.value;
    case 'lna-offices':    return lnas.value;
    case 'lna-flagged':    return lnas.value.filter(r => (r._clusterSummary || []).some(c => c.interventionNeeded === 'Yes' || c.interventionNeeded === 'Y'));
    default:               return [];
  }
});

function toggleOv(key) {
  ovActive.value = ovActive.value === key ? null : key;
}

const interventionOffices = computed(() =>
  lnas.value
    .filter(r => (r._clusterSummary || []).some(c => c.interventionNeeded === 'Yes' || c.interventionNeeded === 'Y'))
    .map(r => r.office).filter(Boolean)
);

const recentActivity = computed(() => {
  const all = [
    ...idps.value.map(r => ({ refId: r.refId, type: 'IDP', label: r.employeeName || r.refId, status: r.status, submittedAt: r.submittedAt })),
    ...lnas.value.map(r => ({ refId: r.refId, type: 'LNA', label: r.office || r.refId, status: 'SUBMITTED', submittedAt: r.submittedAt })),
  ];
  return all.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 10);
});

// ── AUTH ───────────────────────────────────────────────────────────────────
async function doLogin() {
  const em = loginEmail.value.trim().toLowerCase();
  if (!em) { loginHint.value = 'Please enter your email.'; loginHintType.value = 'err'; return; }
  if (!em.endsWith('@carsu.edu.ph')) { loginHint.value = 'Must be a @carsu.edu.ph address.'; loginHintType.value = 'err'; return; }
  loginHint.value = 'Verifying...'; loginHintType.value = ''; loginLoading.value = true;
  try {
    const res = await fetch(`${API}/api/auth/check?email=${encodeURIComponent(em)}`);
    const data = await res.json();
    if (data.authorized) { currentUser.value = { email: em, name: data.name }; screen.value = 'dash'; loadDashboard(); }
    else { screen.value = 'denied'; }
  } catch { loginHint.value = 'Network error. Try again.'; loginHintType.value = 'err'; }
  finally { loginLoading.value = false; }
}

// ── DATA ───────────────────────────────────────────────────────────────────
async function loadDashboard() {
  dataLoading.value = true; lastUpdated.value = 'Loading...';
  try {
    const [idpRes, lnaRes, hrRes] = await Promise.all([fetch(`${API}/api/idp`), fetch(`${API}/api/lna`), fetch(`${API}/api/users`)]);
    const rawIdps = await idpRes.json();
    const rawLnas = await lnaRes.json();
    idps.value = Array.isArray(rawIdps) ? rawIdps.map(normalizeIDP) : [];
    lnas.value = Array.isArray(rawLnas) ? rawLnas.map(normalizeLNA) : [];
    hrUsers.value = await hrRes.json();
    const now = new Date();
    lastUpdated.value = `Last updated: ${now.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})} at ${now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}`;
  } catch { toast('Failed to load data.','error'); lastUpdated.value = 'Failed to load.'; }
  finally { dataLoading.value = false; }
}

// ── CHARTS ─────────────────────────────────────────────────────────────────

// ── MODALS// ── MODALS ─────────────────────────────────────────────────────────────────
function viewIDP(refId) { selectedIDP.value = idps.value.find(x=>x.refId===refId)||null; if (selectedIDP.value) idpModal.value = true; }
function viewLNA(refId) { selectedLNA.value = lnas.value.find(x=>x.refId===refId)||null; if (selectedLNA.value) lnaModal.value = true; }

async function downloadPDF(type, refId, name) {
  try {
    toast('Generating PDF…');
    const url = `${API}/api/${type}/${encodeURIComponent(refId)}/pdf`;
    const res = await fetch(url);
    if (!res.ok) { toast('PDF generation failed.', 'error'); return; }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${type.toUpperCase()}_${refId}_${(name || '').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch { toast('Failed to download PDF.', 'error'); }
}

// ── HR REGISTRY ─────────────────────────────────────────────────────────────
async function saveHR() {
  if (!newHR.email||!newHR.name) { toast('Email and Name are required.','error'); return; }
  if (!newHR.email.endsWith('@carsu.edu.ph')) { toast('Must be a @carsu.edu.ph email.','error'); return; }
  try { await fetch(`${API}/api/users`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:newHR.email,name:newHR.name,role:newHR.role})}); toast(`${newHR.name} added.`,'success'); addHRModal.value=false; newHR.email=''; newHR.name=''; newHR.role=''; loadDashboard(); } catch { toast('Network error.','error'); }
}
async function removeHR(email, name) {
  if (!confirm(`Remove ${name||email} from the HR Registry?`)) return;
  try { await fetch(`${API}/api/users/${encodeURIComponent(email)}`,{method:'DELETE'}); toast(`${name||email} removed.`,'success'); loadDashboard(); } catch { toast('Network error.','error'); }
}

// ── SORT ────────────────────────────────────────────────────────────────────
function sortTable(type, col) { const s=sortState[type]; if (s.col===col) s.asc=!s.asc; else { s.col=col; s.asc=true; } }
function sortIndicator(type, col) { const s=sortState[type]; if (s.col!==col) return '↕'; return s.asc?'↑':'↓'; }

// ── HELPERS ─────────────────────────────────────────────────────────────────
function fmtDate(v) { if(!v) return '—'; const d=new Date(v); return isNaN(d)?v:d.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}); }
function statusBadgeClass(s) { const c=(s||'').toUpperCase(); if(c==='COMPLETE')return 'badge badge-green'; if(c==='PENDING')return 'badge badge-gold'; if(c==='OVERDUE')return 'badge badge-red'; return 'badge badge-grey'; }
function statusBadgeLabel(s) { const c=(s||'').toUpperCase(); if(c==='COMPLETE')return 'Completed'; if(c==='PENDING')return 'Pending Review'; if(c==='OVERDUE')return 'Overdue'; return s||'Unknown'; }
function toast(msg,type='') { const id=Date.now(); toasts.value.push({id,msg,type}); setTimeout(()=>{toasts.value=toasts.value.filter(t=>t.id!==id);},3500); }

onMounted(() => {});
</script>

<style scoped>
:root { --navy:#1a4d2e; --navy-mid:#2d6a3f; --navy-light:#3d8b50; --gold:#f5c300; --gold-light:#ffd740; --gold-dim:rgba(245,195,0,.12); --cream:#faf8f4; --white:#fff; --text:#1a1a2e; --text-light:#5a6070; --border:#d8d4c8; --error:#c0392b; --success:#1a6b3c; --shadow:0 4px 24px rgba(26,77,46,.1); --shadow-sm:0 2px 8px rgba(26,77,46,.07); --shadow-lg:0 12px 48px rgba(26,77,46,.18); }
* { box-sizing:border-box; margin:0; padding:0; }

.page-nav { background:var(--navy); padding:0 28px; display:flex; align-items:center; border-bottom:1px solid rgba(255,255,255,.08); }
.page-nav a.back-link { display:inline-flex; align-items:center; gap:9px; padding:10px 0; color:rgba(255,255,255,.75); text-decoration:none; font-size:12.5px; font-weight:500; letter-spacing:.02em; transition:color .2s; position:relative; }
.page-nav a.back-link::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--gold); transform:scaleX(0); transform-origin:left; transition:transform .25s ease; }
.page-nav a.back-link:hover { color:#fff; }
.page-nav a.back-link:hover::after { transform:scaleX(1); }
.page-nav a.back-link svg { width:13px; height:13px; stroke:currentColor; fill:none; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; opacity:.8; transition:transform .2s; }
.page-nav a.back-link:hover svg { transform:translateX(-3px); opacity:1; }
.nav-sep { color:rgba(255,255,255,.25); font-size:13px; margin:0 10px; }
.nav-current { font-size:12.5px; color:var(--gold); font-weight:600; letter-spacing:.03em; }

.auth-screen { display:flex; align-items:center; justify-content:center; min-height:calc(100vh - 100px); padding:40px 20px; }
.login-card { background:var(--white); border:1px solid var(--border); border-radius:20px; padding:48px 44px; max-width:420px; width:100%; box-shadow:var(--shadow-lg); text-align:center; animation:fadeUp .5s ease; }
.login-icon { width:68px; height:68px; background:var(--navy); border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow:0 8px 24px rgba(26,77,46,.25); }
.login-icon svg { width:32px; height:32px; stroke:var(--gold); fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.login-eyebrow { font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); border:1px solid rgba(245,195,0,.3); border-radius:20px; display:inline-block; padding:4px 14px; margin-bottom:12px; }
.login-card h2 { font-family:'Playfair Display',serif; font-size:24px; color:var(--navy); margin-bottom:8px; }
.login-card > p { font-size:13px; color:var(--text-light); margin-bottom:28px; }
.login-field { display:flex; flex-direction:column; gap:6px; text-align:left; margin-bottom:16px; }
.login-field label { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--navy-mid); }
.login-field input { width:100%; padding:11px 14px; border:1.5px solid var(--border); border-radius:9px; font-family:inherit; font-size:14px; color:var(--text); outline:none; transition:border-color .2s,box-shadow .2s; background:#f8f7f4; }
.login-field input:focus { border-color:var(--navy); box-shadow:0 0 0 3px rgba(26,77,46,.08); background:#fff; }
.login-field input.err { border-color:var(--error); }
.login-hint { font-size:12px; min-height:16px; display:block; }
.login-hint.err { color:var(--error); }
.btn-login { width:100%; padding:13px; background:var(--navy); color:#fff; border:none; border-radius:9px; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; transition:background .2s,transform .15s; box-shadow:0 4px 16px rgba(26,77,46,.2); }
.btn-login:hover { background:var(--navy-mid); transform:translateY(-1px); }
.btn-login:disabled { background:#aaa; cursor:not-allowed; transform:none; box-shadow:none; }
.denied-card { background:var(--white); border:1px solid #f5c6c2; border-radius:20px; padding:48px 40px; max-width:420px; width:100%; text-align:center; box-shadow:var(--shadow); }
.denied-icon { width:68px; height:68px; background:rgba(192,57,43,.08); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:34px; margin:0 auto 18px; }
.denied-card h2 { font-family:'Playfair Display',serif; font-size:22px; color:var(--error); margin-bottom:8px; }
.denied-card p { font-size:13px; color:var(--text-light); margin-bottom:18px; }
.btn-try { padding:9px 24px; background:var(--navy); color:#fff; border:none; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-try:hover { background:var(--navy-mid); }

.dash-wrap { max-width:1400px; margin:0 auto; padding:32px 28px 80px; }
.dash-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:14px; }
.dash-head-left h1 { font-family:'Playfair Display',serif; font-size:28px; color:var(--navy); margin-bottom:2px; }
.dash-head-left p { font-size:13px; color:var(--text-light); }
.btn-refresh { display:flex; align-items:center; gap:7px; padding:9px 18px; background:var(--navy); color:#fff; border:none; border-radius:9px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-refresh:hover { background:var(--navy-mid); }
.btn-refresh svg { width:15px; height:15px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
.btn-refresh.spinning svg { animation:spin .8s linear infinite; }

.stats-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(178px,1fr)); gap:14px; margin-bottom:28px; }
.stat-card { background:var(--white); border:1px solid var(--border); border-radius:12px; padding:20px 20px 16px; box-shadow:var(--shadow-sm); position:relative; overflow:hidden; animation:fadeUp .4s ease both; }
.stat-card::before { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:var(--gold); transform:scaleX(0); transform-origin:left; transition:transform .3s; }
.stat-card:hover::before { transform:scaleX(1); }
.stat-icon { position:absolute; top:16px; right:16px; width:32px; height:32px; background:rgba(26,77,46,.07); border-radius:8px; display:flex; align-items:center; justify-content:center; }
.stat-icon svg { width:16px; height:16px; stroke:var(--navy-mid); fill:none; stroke-width:1.8; stroke-linecap:round; }
.stat-label { font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--text-light); margin-bottom:6px; }
.stat-value { font-family:'Playfair Display',serif; font-size:34px; color:var(--navy); line-height:1; margin-bottom:2px; }
.stat-sub { font-size:11px; color:var(--text-light); }

.tab-bar { display:flex; gap:3px; background:rgba(26,77,46,.07); border-radius:11px; padding:4px; margin-bottom:22px; width:fit-content; flex-wrap:wrap; }
.tab-btn { padding:8px 20px; border:none; background:transparent; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; color:var(--text-light); cursor:pointer; transition:all .2s; white-space:nowrap; }
.tab-btn.active { background:var(--navy); color:#fff; box-shadow:0 2px 8px rgba(26,77,46,.2); }
.tab-btn:not(.active):hover { background:rgba(26,77,46,.1); color:var(--navy); }
.tab-panel { animation:fadeUp .3s ease; }

.sub-tab-bar { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
.sub-tab-btn { padding:7px 16px; border:1.5px solid var(--border); background:var(--white); border-radius:8px; font-family:inherit; font-size:12px; font-weight:600; color:var(--text-light); cursor:pointer; transition:all .2s; white-space:nowrap; }
.sub-tab-btn.active { background:var(--navy); color:#fff; border-color:var(--navy); }
.sub-tab-btn:not(.active):hover { border-color:var(--navy); color:var(--navy); }

.sub-section-label { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--navy-mid); padding-bottom:6px; border-bottom:1.5px solid var(--border); }

.charts-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; margin-bottom:22px; }
.chart-card { background:var(--white); border:1px solid var(--border); border-radius:12px; padding:20px 20px 16px; box-shadow:var(--shadow-sm); }
.chart-card h4 { font-size:13px; font-weight:700; color:var(--navy); margin-bottom:2px; }
.chart-sub { font-size:11px; color:var(--text-light); margin-bottom:14px; }
.chart-wrap { position:relative; height:210px; }
.insight-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:6px; }
.insight-item { background:rgba(26,77,46,.04); border-left:3px solid var(--gold); border-radius:0 8px 8px 0; padding:10px 13px; }
.i-label { font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--text-light); margin-bottom:3px; }
.i-val { font-size:14px; font-weight:600; color:var(--navy); }

.filter-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:12px; }
.filter-bar input, .filter-bar select { padding:8px 12px; border:1.5px solid var(--border); border-radius:8px; font-family:inherit; font-size:13px; color:var(--text); background:var(--white); outline:none; transition:border-color .2s; }
.filter-bar input { min-width:200px; }
.filter-bar input:focus, .filter-bar select:focus { border-color:var(--navy); }
.filter-bar select { min-width:145px; }
.result-count { font-size:12px; color:var(--text-light); margin-left:auto; }

.tbl-wrap { overflow-x:auto; border-radius:11px; border:1px solid var(--border); box-shadow:var(--shadow-sm); margin-bottom:8px; }
.dtbl { width:100%; border-collapse:collapse; font-size:13px; background:var(--white); }
.dtbl thead tr { background:var(--navy); }
.dtbl thead th { padding:11px 13px; color:#fff; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.06em; text-align:left; white-space:nowrap; border-right:1px solid rgba(255,255,255,.07); cursor:pointer; user-select:none; }
.dtbl thead th:last-child { border-right:none; cursor:default; }
.dtbl thead th:hover:not(:last-child) { background:var(--navy-mid); }
.sort-ind { font-size:9px; margin-left:3px; opacity:.55; }
.dtbl tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
.dtbl tbody tr:last-child { border-bottom:none; }
.dtbl tbody tr:hover { background:rgba(26,77,46,.03); }
.dtbl tbody td { padding:10px 13px; vertical-align:middle; }
.empty-row td { text-align:center; padding:44px; color:var(--text-light); font-style:italic; }
.sub-text { font-size:11px; color:var(--text-light); }
.date-cell { font-size:12px; white-space:nowrap; }
.ref-code { font-size:11px; background:rgba(26,77,46,.07); padding:2px 6px; border-radius:4px; font-family:monospace; }
.cell-wrap { max-width:200px; white-space:pre-wrap; font-size:12px; }
.level-badge { display:inline-block; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:600; }
.level-cur { background:rgba(90,96,112,.1); color:var(--text-light); }
.level-req { background:rgba(26,77,46,.1); color:var(--navy); }

.btn-view { background:none; border:1px solid var(--border); padding:5px 12px; border-radius:6px; cursor:pointer; font-size:12px; color:var(--navy); font-family:inherit; font-weight:600; transition:all .2s; white-space:nowrap; }
.btn-view:hover { background:var(--navy); color:#fff; border-color:var(--navy); }

.badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
.badge-green { background:rgba(26,107,60,.1); color:#1a6b3c; }
.badge-gold  { background:rgba(245,195,0,.15); color:#8a6c00; }
.badge-red   { background:rgba(192,57,43,.1); color:var(--error); }
.badge-grey  { background:rgba(90,96,112,.1); color:var(--text-light); }

.reg-actions { display:flex; gap:8px; margin-bottom:14px; }
.btn-add { display:flex; align-items:center; gap:6px; padding:8px 16px; background:var(--navy); color:#fff; border:none; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-add:hover { background:var(--navy-mid); }
.btn-remove { background:none; border:none; cursor:pointer; color:var(--error); padding:4px 8px; border-radius:6px; font-size:13px; transition:background .15s; }
.btn-remove:hover { background:rgba(192,57,43,.08); }

.modal-overlay { display:none; position:fixed; inset:0; background:rgba(10,20,30,.6); z-index:500; align-items:flex-start; justify-content:center; padding:20px; overflow-y:auto; }
.modal-overlay.active { display:flex; }
.modal { background:var(--white); border-radius:16px; max-width:960px; width:100%; box-shadow:0 24px 80px rgba(0,0,0,.25); animation:fadeUp .3s ease; margin:auto; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px 16px; border-bottom:1px solid var(--border); position:sticky; top:0; background:var(--white); z-index:1; border-radius:16px 16px 0 0; }
.modal-header-left h3 { font-family:'Playfair Display',serif; font-size:18px; color:var(--navy); }
.modal-header-left p { font-size:12px; color:var(--text-light); margin-top:1px; }
.modal-header-right { display:flex; gap:8px; align-items:center; }
.btn-pdf { display:flex; align-items:center; gap:6px; padding:7px 14px; background:var(--navy); color:#fff; border:none; border-radius:7px; font-family:inherit; font-size:12px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-pdf:hover { background:var(--navy-mid); }
.btn-pdf svg { width:13px; height:13px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; }
.btn-close { width:30px; height:30px; background:rgba(26,77,46,.07); border:none; border-radius:7px; cursor:pointer; font-size:17px; color:var(--text-light); display:flex; align-items:center; justify-content:center; transition:all .2s; }
.btn-close:hover { background:rgba(192,57,43,.1); color:var(--error); }
.modal-body { padding:20px 24px 26px; }
.m-section { margin-bottom:22px; }
.m-section-title { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--navy-mid); padding-bottom:7px; border-bottom:1.5px solid var(--border); margin-bottom:12px; display:flex; align-items:center; gap:8px; }
.m-badge { font-size:9px; padding:2px 8px; background:var(--gold-dim); color:var(--navy); border-radius:10px; border:1px solid rgba(245,195,0,.3); font-weight:700; }
.dgrid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.dgrid.g3 { grid-template-columns:1fr 1fr 1fr; }
.df { display:flex; flex-direction:column; gap:2px; }
.df.s2 { grid-column:span 2; }
.df.s3 { grid-column:span 3; }
.df label { font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--text-light); }
.df span, .df code { font-size:13px; color:var(--text); }
.df code { background:rgba(26,77,46,.07); padding:1px 6px; border-radius:4px; font-size:11px; }
.m-table { width:100%; border-collapse:collapse; font-size:12px; border-radius:8px; overflow:hidden; border:1px solid var(--border); }
.m-table thead tr { background:var(--navy-mid); }
.m-table thead th { padding:7px 10px; color:#fff; font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:.05em; text-align:left; }
.m-table tbody tr { border-bottom:1px solid var(--border); }
.m-table tbody tr:last-child { border-bottom:none; }
.m-table tbody tr:nth-child(even) { background:#faf9f6; }
.m-table tbody td { padding:7px 10px; vertical-align:top; }
.pending-note { background:rgba(245,195,0,.08); border:1px solid rgba(245,195,0,.35); border-radius:8px; padding:16px; font-size:13px; color:var(--navy); }

.add-field { display:flex; flex-direction:column; gap:5px; margin-bottom:13px; }
.add-field label { font-size:11px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--navy-mid); }
.add-field input { padding:10px 13px; border:1.5px solid var(--border); border-radius:8px; font-family:inherit; font-size:13px; outline:none; transition:border-color .2s; }
.add-field input:focus { border-color:var(--navy); }
.btn-save { width:100%; padding:11px; background:var(--navy); color:#fff; border:none; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-save:hover { background:var(--navy-mid); }

.toast-wrap { position:fixed; bottom:20px; right:20px; z-index:600; display:flex; flex-direction:column; gap:7px; }
.toast { background:var(--navy); color:#fff; padding:11px 16px; border-radius:9px; font-size:13px; font-weight:500; box-shadow:0 4px 20px rgba(0,0,0,.2); animation:fadeUp .3s ease; max-width:300px; }
.toast.success { background:var(--success); }
.toast.error   { background:var(--error); }

@media (max-width:640px) {
  .dash-wrap { padding:20px 14px 60px; }
  .stats-row { grid-template-columns:1fr 1fr; }
  .charts-grid { grid-template-columns:1fr; }
  .page-nav { padding:0 16px; }
  .nav-current, .nav-sep { display:none; }
  .sub-tab-btn { font-size:11px; padding:6px 12px; }
}
/* ── OVERVIEW CARDS ── */
.ov-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: stretch;
}
.ov-card-divider {
  width: 1px;
  background: var(--border);
  margin: 0 4px;
  align-self: stretch;
}
.ov-card {
  flex: 1;
  min-width: 130px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all .18s;
  user-select: none;
}
.ov-card:hover { border-color: var(--navy); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.ov-card.active { border-color: var(--navy); background: var(--navy); }
.ov-card.active .ov-card-label,
.ov-card.active .ov-card-num,
.ov-card.active .ov-card-sub { color: #fff !important; opacity: 1; }
.ov-card-amber         { border-left: 3px solid #c9a200; }
.ov-card-amber.active  { background: #8a6c00; border-color: #8a6c00; }
.ov-card-green         { border-left: 3px solid var(--navy-light); }
.ov-card-green.active  { background: var(--navy-mid); border-color: var(--navy-mid); }
.ov-card-blue          { border-left: 3px solid #2d6a9f; }
.ov-card-blue.active   { background: #1e4e7a; border-color: #1e4e7a; }
.ov-card-red           { border-left: 3px solid #c0392b; }
.ov-card-red.active    { background: #922b21; border-color: #922b21; }
.ov-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.ov-card-label { font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--text-light); }
.ov-card-num { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--navy); line-height: 1; }
.ov-card-sub { font-size: 11px; color: var(--text-light); }

.ov-drill {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 18px;
  overflow: hidden;
  animation: fadeUp .2s ease;
}
.ov-drill-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
  background: #faf9f6;
}
.ov-drill-title { font-size: 13px; font-weight: 700; color: var(--navy); }
.btn-ov-close {
  background: none; border: none; cursor: pointer;
  font-size: 14px; color: var(--text-light); padding: 2px 6px;
  border-radius: 5px; transition: all .15s; font-family: inherit;
}
.btn-ov-close:hover { background: rgba(192,57,43,.1); color: var(--error); }


@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin { to { transform:rotate(360deg); } }
/* ── Advanced Filter Panel ─────────────────────────────────────────── */
.btn-adv-filter {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  font-family: inherit; font-size: 12px; font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}
.btn-adv-filter:hover { border-color: var(--navy); color: var(--navy); }
.btn-adv-filter.active { background: var(--navy); color: #fff; border-color: var(--navy); }
.btn-adv-filter.active svg { stroke: #fff; }
.adv-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 17px; height: 17px;
  background: var(--gold); color: var(--navy);
  border-radius: 50%; font-size: 10px; font-weight: 800;
  margin-left: 2px;
}
.btn-adv-filter.active .adv-badge { background: rgba(255,255,255,.25); color: #fff; }

.adv-filter-panel {
  background: #f7f6f1;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 14px 18px 12px;
  margin-bottom: 12px;
}
.adv-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}
.adv-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
  flex: 1;
}
.adv-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--text-light);
}
.adv-select {
  padding: 7px 10px;
  border: 1.5px solid var(--border);
  border-radius: 7px;
  font-family: inherit;
  font-size: 12px;
  color: var(--text);
  background: var(--white);
  outline: none;
  transition: border-color .2s;
  min-width: 0;
}
.adv-select:focus { border-color: var(--navy); }

.adv-toggle-group {
  display: flex;
  gap: 4px;
}
.adv-toggle {
  padding: 6px 14px;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  background: var(--white);
  font-family: inherit; font-size: 12px; font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.adv-toggle:hover { border-color: var(--navy); color: var(--navy); }
.adv-toggle.active { background: var(--navy); color: #fff; border-color: var(--navy); }
.adv-toggle-red.active  { background: #c0392b; border-color: #c0392b; color: #fff; }
.adv-toggle-green.active { background: #1a6b3c; border-color: #1a6b3c; color: #fff; }

.btn-clear-adv {
  padding: 7px 14px;
  border: 1.5px dashed var(--border);
  border-radius: 7px;
  background: transparent;
  font-family: inherit; font-size: 11px; font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  align-self: flex-end;
  transition: all .15s;
  white-space: nowrap;
}
.btn-clear-adv:hover { border-color: var(--error); color: var(--error); }

.adv-who-count {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-light);
}
.adv-filter-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--navy-mid);
  margin-bottom: 8px;
  margin-top: 4px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border);
}

.adv-who-num {
  font-size: 15px;
  font-weight: 700;
  color: var(--navy);
  font-family: 'Playfair Display', serif;
}

/* slide transition */
.adv-slide-enter-active, .adv-slide-leave-active {
  transition: all .22s ease;
  overflow: hidden;
}
.adv-slide-enter-from, .adv-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
}
.adv-slide-enter-to, .adv-slide-leave-from {
  opacity: 1;
  max-height: 300px;
}

</style>