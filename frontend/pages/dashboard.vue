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

      <!-- STATS -->
      <div class="stats-row">
        <div class="stat-card" v-for="(stat, i) in stats" :key="stat.label"
          :style="{ animationDelay: i * 0.04 + 0.04 + 's' }">
          <div class="stat-icon"><svg viewBox="0 0 24 24" v-html="stat.icon"></svg></div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-sub">{{ stat.sub }}</div>
        </div>
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
        <div class="charts-grid">
          <div class="chart-card"><h4>IDP Status Breakdown</h4><p class="chart-sub">Distribution of submission statuses</p><div class="chart-wrap"><canvas ref="chartStatus"></canvas></div></div>
          <div class="chart-card"><h4>Submissions by Campus</h4><p class="chart-sub">IDP and LNA counts per campus</p><div class="chart-wrap"><canvas ref="chartCampus"></canvas></div></div>
          <div class="chart-card"><h4>Monthly Submissions</h4><p class="chart-sub">IDP and LNA submissions over time</p><div class="chart-wrap"><canvas ref="chartMonthly"></canvas></div></div>
          <div class="chart-card"><h4>Top Competency Gaps</h4><p class="chart-sub">Most frequently cited in IDP Section I (Required > Current)</p><div class="chart-wrap"><canvas ref="chartGaps"></canvas></div></div>
        </div>
        <div class="charts-grid" style="grid-template-columns:1fr 1fr;margin-bottom:0">
          <div class="chart-card"><h4>IDP Purpose Distribution</h4><p class="chart-sub">Why employees are submitting IDPs</p><div class="chart-wrap"><canvas ref="chartPurpose"></canvas></div></div>
          <div class="chart-card"><h4>Key Insights</h4><p class="chart-sub">Aggregated highlights from all submissions</p>
            <div class="insight-grid">
              <div class="insight-item" v-for="ins in insights" :key="ins.label">
                <div class="i-label">{{ ins.label }}</div>
                <div class="i-val">{{ ins.value }}</div>
              </div>
            </div>
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
          <span class="result-count">{{ filteredIDPs.length }} record{{ filteredIDPs.length !== 1 ? 's' : '' }}</span>
        </div>

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
              <tr v-if="!idpProactRows.length" class="empty-row"><td colspan="11">No Pro-ACT data found.</td></tr>
              <tr v-for="r in idpProactRows" :key="r._key">
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
              <tr v-if="!filteredIDPs.length" class="empty-row"><td colspan="14">No records found.</td></tr>
              <tr v-for="r in filteredIDPs" :key="r.refId">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.employeeName || '—' }}</strong></td>
                <td>{{ r.supervisorName || '—' }}<br/><span class="sub-text">{{ r.supervisorEmail || '' }}</span></td>
                <td>{{ r.office || '—' }}</td>
                <td>{{ r.yearCovered || '—' }}</td>
                <td><span :class="statusBadgeClass(r.status)">{{ statusBadgeLabel(r.status) }}</span></td>
                <template v-if="r.status === 'COMPLETE'">
                  <td style="text-align:center">
                    <span :class="r.perfGapsYN === 'Yes' ? 'badge badge-red' : 'badge badge-green'">{{ r.perfGapsYN || '—' }}</span>
                  </td>
                  <td class="cell-wrap">{{ r.perfGapsSpec || '—' }}</td>
                  <td style="text-align:center">
                    <span :class="r.readinessYN === 'Yes' ? 'badge badge-green' : 'badge badge-gold'">{{ r.readinessYN || '—' }}</span>
                  </td>
                  <td class="cell-wrap">{{ r.readinessRemarks || '—' }}</td>
                  <td style="font-size:12px">{{ Array.isArray(r.supervisorInterventions) ? r.supervisorInterventions.join(', ') : (r.supervisorInterventions || '—') }}</td>
                  <td>{{ r.implementationPeriod || '—' }}</td>
                  <td class="cell-wrap">{{ r.additionalComments || '—' }}</td>
                  <td class="date-cell">{{ fmtDate(r.supervisorReviewDate) }}</td>
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
            <option>CSU Main Campus</option>
            <option>CSU Cabadbaran City Campus</option>
          </select>
          <select v-model="lnaYearFilter">
            <option value="">All Years</option>
            <option v-for="y in lnaYears" :key="y">{{ y }}</option>
          </select>
          <span class="result-count">{{ filteredLNAs.length }} record{{ filteredLNAs.length !== 1 ? 's' : '' }}</span>
        </div>

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
              <tr v-if="!lnaWorkforceRows.length" class="empty-row"><td colspan="14">No workforce data found.</td></tr>
              <tr v-for="r in lnaWorkforceRows" :key="r._key">
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
                <tr v-if="!lnaClusterRows.length" class="empty-row"><td colspan="8">No cluster summary data found.</td></tr>
                <tr v-for="r in lnaClusterRows" :key="r._key">
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
                <tr v-if="!lnaCompRows.length" class="empty-row"><td colspan="17">No competency mapping data found.</td></tr>
                <tr v-for="r in lnaCompRows" :key="r._key">
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
                <tr v-if="!filteredLNAs.length" class="empty-row"><td colspan="5">No records found.</td></tr>
                <tr v-for="r in filteredLNAs" :key="r.refId">
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
                <tr v-if="!lnaInsightRows.length" class="empty-row"><td colspan="8">No insight data found.</td></tr>
                <tr v-for="r in lnaInsightRows" :key="r._key">
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
            <button class="btn-pdf" @click="printModal">
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
            <table class="m-table" v-if="selectedIDP.competencyRows && selectedIDP.competencyRows.length">
              <thead><tr><th>#</th><th>Target Competency</th><th>Cluster</th><th>Current Level</th><th>Required Level</th><th>Suggested Intervention</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP.competencyRows" :key="i">
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
            <table class="m-table" v-if="selectedIDP.agapRows && selectedIDP.agapRows.length">
              <thead><tr><th>#</th><th>Degree Program</th><th>Target HEI</th><th>Mode of Study</th><th>Scholarship / Grant</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP.agapRows" :key="i">
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
            <table class="m-table" v-if="selectedIDP.proactRows && selectedIDP.proactRows.length">
              <thead><tr><th>#</th><th>Training / Workshop Title</th><th>Target Competency</th><th>Mode of Activity</th><th>Trainer / Provider</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP.proactRows" :key="i">
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
            <div v-if="selectedIDP.status === 'COMPLETE'" class="dgrid">
              <div class="df"><label>Performance Gaps?</label><span>{{ selectedIDP.perfGapsYN || '—' }}</span></div>
              <div class="df"><label>Ready for Advancement?</label><span>{{ selectedIDP.readinessYN || '—' }}</span></div>
              <div class="df s2"><label>Gap Description</label><span style="white-space:pre-wrap">{{ selectedIDP.perfGapsSpec || '—' }}</span></div>
              <div class="df s2"><label>Readiness Remarks</label><span style="white-space:pre-wrap">{{ selectedIDP.readinessRemarks || '—' }}</span></div>
              <div class="df s2"><label>Recommended Interventions</label><span>{{ Array.isArray(selectedIDP.supervisorInterventions) ? selectedIDP.supervisorInterventions.join(', ') : (selectedIDP.supervisorInterventions || '—') }}</span></div>
              <div class="df"><label>Implementation Period</label><span>{{ selectedIDP.implementationPeriod || '—' }}</span></div>
              <div class="df"><label>Review Date</label><span>{{ fmtDate(selectedIDP.supervisorReviewDate) }}</span></div>
              <div class="df s2"><label>Additional Comments</label><span style="white-space:pre-wrap">{{ selectedIDP.additionalComments || '—' }}</span></div>
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
            <button class="btn-pdf" @click="printModal">
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
              <span v-for="(src,i) in (selectedLNA.dataSources || [])" :key="i" class="badge badge-grey">{{ src }}</span>
              <span v-if="!selectedLNA.dataSources?.length" style="font-size:13px;color:var(--text-light)">No sources recorded.</span>
            </div>
            <table class="m-table" v-if="(selectedLNA.dataSourceInsights || selectedLNA.insightRows || []).length">
              <thead><tr><th>Data Source</th><th>Gap / Issue</th><th>Relevant Personnel</th><th>Recommended Intervention</th></tr></thead>
              <tbody>
                <tr v-for="(row,i) in (selectedLNA.dataSourceInsights || selectedLNA.insightRows || [])" :key="i">
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

    <div id="printArea" style="display:none"></div>
  </div>
</template>

<script setup>
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

const sortState = reactive({ idp: { col: -1, asc: true }, lna: { col: -1, asc: true } });

const idpModal   = ref(false);
const lnaModal   = ref(false);
const addHRModal = ref(false);
const selectedIDP = ref(null);
const selectedLNA = ref(null);
const newHR = reactive({ email: '', name: '', role: '' });
const toasts = ref([]);

const chartStatus  = ref(null);
const chartCampus  = ref(null);
const chartMonthly = ref(null);
const chartGaps    = ref(null);
const chartPurpose = ref(null);
let chartInstances = {};

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

const filteredIDPs = computed(() => {
  const q = idpSearch.value.toLowerCase();
  let rows = idps.value.filter(r => {
    const ms = !q || [r.refId, r.employeeName, r.email, r.office, r.campus, r.position].some(v => (v||'').toLowerCase().includes(q));
    return ms && (!idpStatusFilter.value || r.status === idpStatusFilter.value)
              && (!idpCampusFilter.value || r.campus === idpCampusFilter.value)
              && (!idpYearFilter.value  || r.yearCovered === idpYearFilter.value);
  });
  const { col, asc } = sortState.idp;
  if (col >= 0) {
    const ks = ['refId','employeeName','position','office','campus','yearCovered','submittedAt','status'];
    rows = [...rows].sort((a,b) => { const av=(a[ks[col]]||'').toLowerCase(), bv=(b[ks[col]]||'').toLowerCase(); return asc ? av.localeCompare(bv) : bv.localeCompare(av); });
  }
  return rows;
});

const filteredLNAs = computed(() => {
  const q = lnaSearch.value.toLowerCase();
  let rows = lnas.value.filter(r => {
    const ms = !q || [r.refId, r.office, r.headOfUnit, r.email, r.campus].some(v => (v||'').toLowerCase().includes(q));
    return ms && (!lnaCampusFilter.value || r.campus === lnaCampusFilter.value)
              && (!lnaYearFilter.value   || r.yearCovered === lnaYearFilter.value);
  });
  const { col, asc } = sortState.lna;
  if (col >= 0) {
    const ks = ['refId','office','headOfUnit','campus','yearCovered','purpose','totalPersonnel','submittedAt'];
    rows = [...rows].sort((a,b) => { const av=(a[ks[col]]||'').toLowerCase(), bv=(b[ks[col]]||'').toLowerCase(); return asc ? av.localeCompare(bv) : bv.localeCompare(av); });
  }
  return rows;
});

// ── COMPUTED — IDP SECTION EXPANSIONS ──────────────────────────────────────
const idpCompetencyRows = computed(() => {
  const out = [];
  filteredIDPs.value.forEach(r => {
    (r.competencyRows || []).forEach((row, i) => {
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
    (r.agapRows || []).forEach((row, i) => {
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
    (r.proactRows || []).forEach((row, i) => {
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
    (r.clusterSummary || []).forEach((row, i) => {
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
    (r.dataSourceInsights || r.insightRows || []).forEach((row, i) => {
      out.push({ _key: `${r.refId}-ins${i}`, refId: r.refId, office: r.office, campus: r.campus, year: r.yearCovered, dataSource: row.dataSource, gap: row.gap, personnel: row.personnel, intervention: row.intervention });
    });
  });
  return out;
});

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
    idps.value = await idpRes.json();
    lnas.value = await lnaRes.json();
    hrUsers.value = await hrRes.json();
    const now = new Date();
    lastUpdated.value = `Last updated: ${now.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})} at ${now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}`;
    await nextTick();
    if (activeTab.value === 'overview') renderCharts();
  } catch { toast('Failed to load data.','error'); lastUpdated.value = 'Failed to load.'; }
  finally { dataLoading.value = false; }
}

// ── CHARTS ─────────────────────────────────────────────────────────────────
watch(activeTab, async tab => { if (tab==='overview') { await nextTick(); renderCharts(); } });
const GRN = ['#1a4d2e','#2d6a3f','#3d8b50','#5aab6a','#7dcc8e','#a5e3b5'];
const GLD = ['#f5c300','#ffd740','#ffe680','#c9a200','#a07d00'];
function dc(k) { if (chartInstances[k]) { chartInstances[k].destroy(); delete chartInstances[k]; } }
async function renderCharts() {
  if (typeof Chart === 'undefined') return;
  const base = { responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{font:{size:11},padding:10}}} };
  dc('s');
  const done=idps.value.filter(r=>r.status==='COMPLETE').length, pend=idps.value.filter(r=>r.status==='PENDING').length, over=idps.value.filter(r=>r.status==='OVERDUE').length;
  if (chartStatus.value) chartInstances.s = new Chart(chartStatus.value,{type:'doughnut',data:{labels:['Completed','Pending','Overdue'],datasets:[{data:[done,pend,over],backgroundColor:['#1a4d2e','#f5c300','#c0392b'],borderWidth:2,borderColor:'#fff'}]},options:{...base,plugins:{legend:{position:'bottom',labels:{font:{size:11},padding:12}}},cutout:'60%'}});
  dc('c');
  const camps=[...new Set([...idps.value.map(r=>r.campus),...lnas.value.map(r=>r.campus)].filter(Boolean))];
  if (chartCampus.value) chartInstances.c = new Chart(chartCampus.value,{type:'bar',data:{labels:camps.map(c=>c.replace('CSU ','').replace(' Campus','')),datasets:[{label:'IDPs',data:camps.map(c=>idps.value.filter(r=>r.campus===c).length),backgroundColor:GRN[0],borderRadius:4},{label:'LNAs',data:camps.map(c=>lnas.value.filter(r=>r.campus===c).length),backgroundColor:GLD[0],borderRadius:4}]},options:{...base,plugins:{legend:{position:'bottom',labels:{font:{size:11}}}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,ticks:{stepSize:1}}}}});
  dc('m');
  const mm={};
  [...idps.value.map(r=>({d:r.submittedAt,t:'i'})),...lnas.value.map(r=>({d:r.submittedAt,t:'l'}))].forEach(({d,t})=>{if(!d)return;const dt=new Date(d);if(isNaN(dt))return;const k=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;if(!mm[k])mm[k]={i:0,l:0};mm[k][t]++;});
  const lbls=Object.keys(mm).sort();
  if (chartMonthly.value) chartInstances.m = new Chart(chartMonthly.value,{type:'line',data:{labels:lbls.map(l=>{const[y,mo]=l.split('-');return new Date(y,mo-1).toLocaleDateString('en-PH',{month:'short',year:'2-digit'});}),datasets:[{label:'IDPs',data:lbls.map(l=>mm[l].i),borderColor:GRN[0],backgroundColor:'rgba(26,77,46,.08)',tension:0.3,fill:true,pointRadius:4},{label:'LNAs',data:lbls.map(l=>mm[l].l),borderColor:GLD[0],backgroundColor:'rgba(245,195,0,.08)',tension:0.3,fill:true,pointRadius:4}]},options:{...base,plugins:{legend:{position:'bottom',labels:{font:{size:11}}}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,ticks:{stepSize:1}}}}});
  dc('g');
  const freq={};
  idps.value.forEach(r=>{(r.competencyRows||[]).forEach(row=>{const comp=(row.targetCompetency||'').trim(),cur=parseInt(row.currentLevel)||0,req=parseInt(row.requiredLevel)||0;if(comp&&req>cur)freq[comp]=(freq[comp]||0)+1;});});
  const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if (chartGaps.value) chartInstances.g = new Chart(chartGaps.value,{type:'bar',data:{labels:sorted.map(([k])=>k.length>24?k.slice(0,24)+'…':k),datasets:[{label:'# with gap',data:sorted.map(([,v])=>v),backgroundColor:GRN[0],borderRadius:4}]},options:{indexAxis:'y',...base,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{stepSize:1}},y:{grid:{display:false},ticks:{font:{size:11}}}}}});
  dc('p');
  const pf={};
  idps.value.forEach(r=>{const p=(r.headerPurpose||'Not specified').trim();pf[p]=(pf[p]||0)+1;});
  const pLbls=Object.keys(pf);
  if (chartPurpose.value) chartInstances.p = new Chart(chartPurpose.value,{type:'pie',data:{labels:pLbls,datasets:[{data:Object.values(pf),backgroundColor:[...GRN,...GLD].slice(0,pLbls.length),borderWidth:2,borderColor:'#fff'}]},options:{...base,plugins:{legend:{position:'bottom',labels:{font:{size:11},padding:10}}}}});
}

// ── MODALS ─────────────────────────────────────────────────────────────────
function viewIDP(refId) { selectedIDP.value = idps.value.find(x=>x.refId===refId)||null; if (selectedIDP.value) idpModal.value = true; }
function viewLNA(refId) { selectedLNA.value = lnas.value.find(x=>x.refId===refId)||null; if (selectedLNA.value) lnaModal.value = true; }

function printModal() {
  const bodyEl  = document.querySelector('.modal-body');
  const titleEl = document.querySelector('.modal-header h3');
  const pa = document.getElementById('printArea');
  if (!pa) return;
  pa.innerHTML = `<div style="font-family:Georgia,serif;color:#1a1a2e"><div style="border-bottom:3px solid #1a4d2e;padding-bottom:10px;margin-bottom:18px"><div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#5a6070;margin-bottom:3px">Caraga State University — Office of Human Resource Management Services</div><h1 style="font-size:18px;color:#1a4d2e;margin-bottom:2px;font-family:Georgia,serif">${titleEl?.textContent||''}</h1></div>${bodyEl?.innerHTML||''}<div style="margin-top:28px;padding-top:10px;border-top:1px solid #d8d4c8;font-size:9px;color:#aaa">Printed from CarSU HRMS LeaD Dashboard · ${new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})}</div></div>`;
  pa.style.display = 'block'; window.print();
  setTimeout(() => { pa.style.display='none'; pa.innerHTML=''; }, 1200);
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

onMounted(() => {
  if (typeof Chart !== 'undefined') return;
  const s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
  document.head.appendChild(s);
});
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
@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin { to { transform:rotate(360deg); } }
</style>