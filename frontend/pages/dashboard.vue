<template>
  <div>
    <div class="page-nav">
      <NuxtLink to="/" class="back-link">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Home
      </NuxtLink>
      <span class="nav-sep">/</span>
      <span class="nav-current">LeaD Dashboard</span>
    </div>

    <!-- LOGIN -->
    <div v-if="screen === 'login'" class="auth-screen">
      <div class="login-card">
        <div class="login-icon">
          <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div class="login-eyebrow">HR Access Only</div>
        <h2>LeaD Dashboard</h2>
        <p>Enter your CarSU email to access the HRMS Learning &amp; Development Dashboard.</p>
        <div class="login-field">
          <label>CarSU Email Address</label>
          <input type="email" v-model="loginEmail" placeholder="yourname@carsu.edu.ph"
            :class="{ err: loginHintType === 'err' }" @keydown.enter="doLogin" />
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
        <div>
          <h1>LeaD Dashboard</h1>
          <p class="dash-sub">{{ lastUpdated }}</p>
        </div>
        <button class="btn-refresh" :class="{ spinning: dataLoading }" @click="loadDashboard">
          <svg viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></svg>
          Refresh
        </button>
      </div>

      <!-- TABS -->
      <div class="tab-bar">
        <button v-for="tab in tabs" :key="tab.key" class="tab-btn"
          :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- ── OVERVIEW ── -->
      <div v-if="activeTab === 'overview'" class="tab-panel">
        <div class="overview-grid">
          <!-- IDP Stats block -->
          <div class="ov-block">
            <div class="ov-block-title">IDP Submissions</div>
            <div class="ov-stats">
              <div class="ov-stat">
                <div class="ov-stat-val">{{ idps.length }}</div>
                <div class="ov-stat-label">Total</div>
              </div>
              <div class="ov-stat">
                <div class="ov-stat-val green">{{ idps.filter(r=>r.status==='COMPLETE').length }}</div>
                <div class="ov-stat-label">Completed</div>
              </div>
              <div class="ov-stat">
                <div class="ov-stat-val gold">{{ idps.filter(r=>r.status==='PENDING'||r.status==='SUPERVISOR_NOTIFIED').length }}</div>
                <div class="ov-stat-label">Pending</div>
              </div>
              <div class="ov-stat">
                <div class="ov-stat-val navy">{{ idps.filter(r=>r.status==='SUPERVISOR_NOTIFIED').length }}</div>
                <div class="ov-stat-label">With Supervisor</div>
              </div>
            </div>
          </div>
          <!-- LNA Stats block -->
          <div class="ov-block">
            <div class="ov-block-title">LNA Submissions</div>
            <div class="ov-stats">
              <div class="ov-stat">
                <div class="ov-stat-val">{{ lnas.length }}</div>
                <div class="ov-stat-label">Total</div>
              </div>
              <div class="ov-stat">
                <div class="ov-stat-val navy">{{ lnaOfficeCount }}</div>
                <div class="ov-stat-label">Offices</div>
              </div>
              <div class="ov-stat">
                <div class="ov-stat-val gold">{{ lnaFlagged }}</div>
                <div class="ov-stat-label">Need Intervention</div>
              </div>
              <div class="ov-stat">
                <div class="ov-stat-val green">{{ lnaYearsAvail.length }}</div>
                <div class="ov-stat-label">Years Covered</div>
              </div>
            </div>
          </div>
          <!-- IDP by status chart -->
          <div class="ov-block ov-block-chart">
            <div class="ov-block-title">IDP Status</div>
            <div class="chart-wrap"><canvas ref="chartStatus"></canvas></div>
          </div>
          <!-- Top competency gaps -->
          <div class="ov-block ov-block-wide">
            <div class="ov-block-title">Top Competency Gaps <span class="ov-note">IDP Section I — Required &gt; Current</span></div>
            <div v-if="topGaps.length" class="gap-list">
              <div v-for="(g, i) in topGaps" :key="g.label" class="gap-row">
                <span class="gap-rank">{{ i+1 }}</span>
                <span class="gap-label">{{ g.label }}</span>
                <div class="gap-bar-wrap">
                  <div class="gap-bar" :style="{ width: (g.count / topGaps[0].count * 100) + '%' }"></div>
                </div>
                <span class="gap-count">{{ g.count }}</span>
              </div>
            </div>
            <p v-else class="empty-note">No competency gap data yet.</p>
          </div>
          <!-- LNA intervention flags -->
          <div class="ov-block ov-block-wide">
            <div class="ov-block-title">LNA Offices Flagging Intervention Needed</div>
            <div v-if="interventionOffices.length" class="tag-cloud">
              <span v-for="o in interventionOffices" :key="o" class="tag tag-red">{{ o }}</span>
            </div>
            <p v-else class="empty-note">No offices currently flagging intervention needed.</p>
          </div>
          <!-- Recent activity -->
          <div class="ov-block ov-block-wide">
            <div class="ov-block-title">Recent Submissions <span class="ov-note">Latest 8</span></div>
            <table class="ov-table">
              <thead><tr><th>Ref ID</th><th>Type</th><th>Name / Office</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>
                <tr v-if="!recentActivity.length"><td colspan="5" class="empty-row-td">No submissions yet.</td></tr>
                <tr v-for="r in recentActivity" :key="r.refId">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td><span :class="r.type==='IDP'?'badge badge-navy':'badge badge-gold-outline'">{{ r.type }}</span></td>
                  <td>{{ r.label }}</td>
                  <td><span :class="statusBadgeClass(r.status)">{{ statusBadgeLabel(r.status) }}</span></td>
                  <td class="date-cell">{{ fmtDate(r.submittedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── IDP SUBMISSIONS ── -->
      <div v-if="activeTab === 'idp'" class="tab-panel">
        <div class="sub-tab-bar">
          <button v-for="st in idpSubTabs" :key="st.key" class="sub-tab-btn"
            :class="{ active: idpSubTab === st.key }" @click="idpSubTab = st.key">
            {{ st.icon }} {{ st.label }}
          </button>
        </div>

        <div class="filter-bar">
          <input type="text" v-model="idpSearch" placeholder="🔍  Search name, office, email, ref ID..." />
          <select v-model="idpStatusFilter">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUPERVISOR_NOTIFIED">With Supervisor</option>
            <option value="COMPLETE">Completed</option>
          </select>
          <select v-model="idpYearFilter">
            <option value="">All Years</option>
            <option v-for="y in idpYears" :key="y">{{ y }}</option>
          </select>
          <select v-model="idpOfficeFilter">
            <option value="">All Offices</option>
            <option v-for="o in idpOffices" :key="o">{{ o }}</option>
          </select>
          <span class="result-count">{{ activeIdpCount }} record{{ activeIdpCount !== 1 ? 's' : '' }}</span>
        </div>

        <!-- All Submissions -->
        <div v-if="idpSubTab === 'list'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th @click="sortTable('idp',0)">Ref ID<span class="sort-ind">{{ sortIndicator('idp',0) }}</span></th>
              <th @click="sortTable('idp',1)">Name<span class="sort-ind">{{ sortIndicator('idp',1) }}</span></th>
              <th @click="sortTable('idp',2)">Position<span class="sort-ind">{{ sortIndicator('idp',2) }}</span></th>
              <th @click="sortTable('idp',3)">Office / Unit<span class="sort-ind">{{ sortIndicator('idp',3) }}</span></th>
              <th @click="sortTable('idp',4)">Year<span class="sort-ind">{{ sortIndicator('idp',4) }}</span></th>
              <th @click="sortTable('idp',5)">Submitted<span class="sort-ind">{{ sortIndicator('idp',5) }}</span></th>
              <th @click="sortTable('idp',6)">Status<span class="sort-ind">{{ sortIndicator('idp',6) }}</span></th>
              <th>Action</th>
            </tr></thead>
            <tbody>
              <tr v-if="!filteredIDPs.length" class="empty-row"><td colspan="8">No records found.</td></tr>
              <tr v-for="r in filteredIDPs" :key="r.refId">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.employeeName || '—' }}</strong><br/><span class="sub-text">{{ r.email || '' }}</span></td>
                <td>{{ r.position || '—' }}</td>
                <td>{{ r.office || '—' }}</td>
                <td>{{ r.yearCovered || '—' }}</td>
                <td class="date-cell">{{ fmtDate(r.submittedAt) }}</td>
                <td><span :class="statusBadgeClass(r.status)">{{ statusBadgeLabel(r.status) }}</span></td>
                <td><button class="btn-view" @click="viewIDP(r.refId)">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section I: Competency -->
        <div v-if="idpSubTab === 'competency'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Name</th><th>Position</th><th>Office</th><th>Year</th>
              <th>#</th><th>Target Competency</th><th>Cluster</th>
              <th>Current Level</th><th>Required Level</th>
              <th>Intervention</th><th>Timeline</th>
            </tr></thead>
            <tbody>
              <tr v-if="!idpCompetencyRows.length" class="empty-row"><td colspan="12">No competency data found.</td></tr>
              <tr v-for="r in idpCompetencyRows" :key="r._key">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.name }}</strong><br/><span class="sub-text">{{ r.email }}</span></td>
                <td>{{ r.position }}</td>
                <td>{{ r.office }}</td>
                <td>{{ r.year }}</td>
                <td style="text-align:center;color:var(--text-light);font-weight:600">{{ r.rowNum }}</td>
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

        <!-- Section II: AGAP -->
        <div v-if="idpSubTab === 'agap'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Name</th><th>Position</th><th>Office</th><th>Year</th>
              <th>#</th><th>Degree Program</th><th>Target HEI</th>
              <th>Mode of Study</th><th>Scholarship / Grant</th><th>Timeline</th>
            </tr></thead>
            <tbody>
              <tr v-if="!idpAgapRows.length" class="empty-row"><td colspan="11">No AGAP data found.</td></tr>
              <tr v-for="r in idpAgapRows" :key="r._key">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.name }}</strong></td>
                <td>{{ r.position }}</td>
                <td>{{ r.office }}</td>
                <td>{{ r.year }}</td>
                <td style="text-align:center;color:var(--text-light);font-weight:600">{{ r.rowNum }}</td>
                <td>{{ r.degreeProgram || '—' }}</td>
                <td>{{ r.targetHEI || '—' }}</td>
                <td>{{ r.modeOfStudy || '—' }}</td>
                <td>{{ r.scholarshipGrant || '—' }}</td>
                <td class="date-cell">{{ r.targetTimeline || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section III: Pro-ACT -->
        <div v-if="idpSubTab === 'proact'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Name</th><th>Position</th><th>Office</th><th>Year</th>
              <th>#</th><th>Training / Workshop Title</th><th>Target Competency</th>
              <th>Mode of Activity</th><th>Trainer / Provider</th><th>Timeline</th>
            </tr></thead>
            <tbody>
              <tr v-if="!idpProactRows.length" class="empty-row"><td colspan="11">No Pro-ACT data found.</td></tr>
              <tr v-for="r in idpProactRows" :key="r._key">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.name }}</strong></td>
                <td>{{ r.position }}</td>
                <td>{{ r.office }}</td>
                <td>{{ r.year }}</td>
                <td style="text-align:center;color:var(--text-light);font-weight:600">{{ r.rowNum }}</td>
                <td>{{ r.trainingTitle || '—' }}</td>
                <td>{{ r.targetSkill || '—' }}</td>
                <td>{{ r.modeOfActivity || '—' }}</td>
                <td>{{ r.trainerProvider || '—' }}</td>
                <td class="date-cell">{{ r.targetTimeline || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section IV: Supervisor -->
        <div v-if="idpSubTab === 'supervisor'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Employee</th><th>Supervisor</th><th>Office</th><th>Year</th>
              <th>Status</th><th>Perf. Gaps?</th><th>Gap Description</th>
              <th>Ready for Advancement?</th><th>Recommended Interventions</th>
              <th>Impl. Period</th><th>Comments</th><th>Review Date</th>
            </tr></thead>
            <tbody>
              <tr v-if="!filteredIDPs.length" class="empty-row"><td colspan="13">No records found.</td></tr>
              <tr v-for="r in filteredIDPs" :key="r.refId">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.employeeName || '—' }}</strong></td>
                <td>{{ r.supervisorName || '—' }}</td>
                <td>{{ r.office || '—' }}</td>
                <td>{{ r.yearCovered || '—' }}</td>
                <td><span :class="statusBadgeClass(r.status)">{{ statusBadgeLabel(r.status) }}</span></td>
                <template v-if="r.status === 'COMPLETE' && r._assessment">
                  <td><span :class="r._assessment.perfGapsYN==='Yes'?'badge badge-red':'badge badge-green'">{{ r._assessment.perfGapsYN || '—' }}</span></td>
                  <td class="cell-wrap">{{ r._assessment.perfGapsSpec || '—' }}</td>
                  <td><span :class="r._assessment.readinessYN==='Yes'?'badge badge-green':'badge badge-gold'">{{ r._assessment.readinessYN || '—' }}</span></td>
                  <td style="font-size:12px">{{ Array.isArray(r._assessment.interventions) ? r._assessment.interventions.join(', ') : (r._assessment.interventions || '—') }}</td>
                  <td>{{ r._assessment.implYear || '' }} {{ r._assessment.implementationPeriod || '—' }}</td>
                  <td class="cell-wrap">{{ r._assessment.additionalComments || '—' }}</td>
                  <td class="date-cell">{{ fmtDate(r.supervisorSignedAt) }}</td>
                </template>
                <template v-else>
                  <td colspan="7" style="text-align:center;font-style:italic;color:var(--text-light);font-size:12px">Awaiting supervisor assessment</td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── LNA SUBMISSIONS ── -->
      <div v-if="activeTab === 'lna'" class="tab-panel">
        <div class="sub-tab-bar">
          <button v-for="st in lnaSubTabs" :key="st.key" class="sub-tab-btn"
            :class="{ active: lnaSubTab === st.key }" @click="lnaSubTab = st.key">
            {{ st.icon }} {{ st.label }}
          </button>
        </div>

        <div class="filter-bar">
          <input type="text" v-model="lnaSearch" placeholder="🔍  Search office, head, email, ref ID..." />
          <select v-model="lnaYearFilter">
            <option value="">All Years</option>
            <option v-for="y in lnaYearsAvail" :key="y">{{ y }}</option>
          </select>
          <select v-model="lnaOfficeFilter">
            <option value="">All Offices</option>
            <option v-for="o in lnaOffices" :key="o">{{ o }}</option>
          </select>
          <select v-model="lnaPurposeFilter">
            <option value="">All Purposes</option>
            <option v-for="p in lnaPurposes" :key="p">{{ p }}</option>
          </select>
          <span class="result-count">{{ filteredLNAs.length }} record{{ filteredLNAs.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- All Submissions -->
        <div v-if="lnaSubTab === 'list'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th @click="sortTable('lna',0)">Ref ID<span class="sort-ind">{{ sortIndicator('lna',0) }}</span></th>
              <th @click="sortTable('lna',1)">Office / Unit<span class="sort-ind">{{ sortIndicator('lna',1) }}</span></th>
              <th @click="sortTable('lna',2)">Head of Office<span class="sort-ind">{{ sortIndicator('lna',2) }}</span></th>
              <th @click="sortTable('lna',3)">Year<span class="sort-ind">{{ sortIndicator('lna',3) }}</span></th>
              <th @click="sortTable('lna',4)">Purpose<span class="sort-ind">{{ sortIndicator('lna',4) }}</span></th>
              <th @click="sortTable('lna',5)">Personnel<span class="sort-ind">{{ sortIndicator('lna',5) }}</span></th>
              <th @click="sortTable('lna',6)">Submitted<span class="sort-ind">{{ sortIndicator('lna',6) }}</span></th>
              <th>Action</th>
            </tr></thead>
            <tbody>
              <tr v-if="!filteredLNAs.length" class="empty-row"><td colspan="8">No records found.</td></tr>
              <tr v-for="r in filteredLNAs" :key="r.refId">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td><strong>{{ r.office || '—' }}</strong></td>
                <td>{{ r.headOfUnit || '—' }}<br/><span class="sub-text">{{ r.submitterEmail || '' }}</span></td>
                <td>{{ r.yearCovered || '—' }}</td>
                <td><span class="badge badge-grey">{{ r.purpose || '—' }}</span></td>
                <td style="text-align:center">{{ r.totalPersonnel || '—' }}</td>
                <td class="date-cell">{{ fmtDate(r.submittedAt) }}</td>
                <td><button class="btn-view" @click="viewLNA(r.refId)">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section I: Workforce -->
        <div v-if="lnaSubTab === 'workforce'" class="tbl-wrap">
          <table class="dtbl">
            <thead><tr>
              <th>Ref ID</th><th>Office / Unit</th><th>Year</th><th>Position Level</th>
              <th>Permanent</th><th>Temporary</th><th>Contractual</th><th>Casual</th>
              <th>Coterminus</th><th>COS</th><th>Job Order</th><th>Others</th><th>Total</th>
            </tr></thead>
            <tbody>
              <tr v-if="!lnaWorkforceRows.length" class="empty-row"><td colspan="13">No workforce data found.</td></tr>
              <tr v-for="r in lnaWorkforceRows" :key="r._key">
                <td><code class="ref-code">{{ r.refId }}</code></td>
                <td>{{ r.office }}</td>
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

        <!-- Section II: Competency -->
        <div v-if="lnaSubTab === 'competency'">
          <div class="sub-section-label" style="margin-bottom:8px">Cluster Summary</div>
          <div class="tbl-wrap" style="margin-bottom:20px">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Year</th>
                <th>Cluster</th><th>Strongest Competency</th><th>Weakest Competency</th><th>Intervention Needed?</th>
              </tr></thead>
              <tbody>
                <tr v-if="!lnaClusterRows.length" class="empty-row"><td colspan="7">No cluster summary data found.</td></tr>
                <tr v-for="r in lnaClusterRows" :key="r._key">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td>{{ r.office }}</td>
                  <td>{{ r.year }}</td>
                  <td><span class="badge badge-grey">{{ r.cluster }}</span></td>
                  <td>{{ r.strongest || '—' }}</td>
                  <td>{{ r.weakest || '—' }}</td>
                  <td>
                    <span v-if="r.interventionNeeded==='Yes'||r.interventionNeeded==='Y'" class="badge badge-red">Yes</span>
                    <span v-else-if="r.interventionNeeded==='No'||r.interventionNeeded==='N'" class="badge badge-green">No</span>
                    <span v-else class="badge badge-grey">{{ r.interventionNeeded || '—' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="sub-section-label" style="margin-bottom:8px">Detailed Competency Mapping by Position Level</div>
          <div class="tbl-wrap">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Year</th>
                <th>Cluster</th><th>Competency</th>
                <th>1st CL</th><th>1st %</th>
                <th>Non-Sup CL</th><th>Non-Sup %</th>
                <th>Sup CL</th><th>Sup %</th>
                <th>3rd CL</th><th>3rd %</th>
                <th>Faculty CL</th><th>Faculty %</th>
                <th>Observations</th>
              </tr></thead>
              <tbody>
                <tr v-if="!lnaCompRows.length" class="empty-row"><td colspan="16">No competency mapping data found.</td></tr>
                <tr v-for="r in lnaCompRows" :key="r._key">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td>{{ r.office }}</td>
                  <td>{{ r.year }}</td>
                  <td><span class="badge badge-grey">{{ r.cluster }}</span></td>
                  <td><strong>{{ r.competency }}</strong></td>
                  <td style="text-align:center"><span v-if="r.first_cl" class="level-badge level-req">{{ r.first_cl }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.first_pct" class="badge badge-green">{{ r.first_pct }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.secondNonSup_cl" class="level-badge level-req">{{ r.secondNonSup_cl }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.secondNonSup_pct" class="badge badge-green">{{ r.secondNonSup_pct }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.secondSup_cl" class="level-badge level-req">{{ r.secondSup_cl }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.secondSup_pct" class="badge badge-green">{{ r.secondSup_pct }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.third_cl" class="level-badge level-req">{{ r.third_cl }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.third_pct" class="badge badge-green">{{ r.third_pct }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.faculty_cl" class="level-badge level-req">{{ r.faculty_cl }}</span><span v-else class="muted">—</span></td>
                  <td style="text-align:center"><span v-if="r.faculty_pct" class="badge badge-green">{{ r.faculty_pct }}</span><span v-else class="muted">—</span></td>
                  <td class="cell-wrap">{{ r.observations || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section III: Data Sources -->
        <div v-if="lnaSubTab === 'sources'">
          <div class="sub-section-label" style="margin-bottom:8px">A. Data Sources Used</div>
          <div class="tbl-wrap" style="margin-bottom:20px">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Year</th><th>Data Sources Selected</th>
              </tr></thead>
              <tbody>
                <tr v-if="!filteredLNAs.length" class="empty-row"><td colspan="4">No records found.</td></tr>
                <tr v-for="r in filteredLNAs" :key="r.refId">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td>{{ r.office || '—' }}</td>
                  <td>{{ r.yearCovered || '—' }}</td>
                  <td style="font-size:12px">
                    <span v-for="(src,i) in (r._dataSources || [])" :key="i" class="badge badge-grey" style="margin-right:4px;margin-bottom:4px">{{ src }}</span>
                    <span v-if="!r._dataSources?.length" class="muted">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="sub-section-label" style="margin-bottom:8px">B. Key Insights / Gaps Identified</div>
          <div class="tbl-wrap">
            <table class="dtbl">
              <thead><tr>
                <th>Ref ID</th><th>Office / Unit</th><th>Year</th>
                <th>Data Source</th><th>Identified Gap / Issue</th>
                <th>Relevant Personnel</th><th>Recommended Intervention</th>
              </tr></thead>
              <tbody>
                <tr v-if="!lnaInsightRows.length" class="empty-row"><td colspan="7">No insight data found.</td></tr>
                <tr v-for="r in lnaInsightRows" :key="r._key">
                  <td><code class="ref-code">{{ r.refId }}</code></td>
                  <td>{{ r.office }}</td>
                  <td>{{ r.year }}</td>
                  <td>{{ r.dataSource || '—' }}</td>
                  <td class="cell-wrap">{{ r.gap || '—' }}</td>
                  <td>{{ r.personnel || '—' }}</td>
                  <td>{{ r.intervention || '—' }}</td>
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
            <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add HR User
          </button>
          <span style="font-size:13px;color:var(--text-light);align-self:center">Manage who can access this dashboard.</span>
        </div>
        <div class="tbl-wrap">
          <table class="dtbl">
            <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Date Added</th><th>Action</th></tr></thead>
            <tbody>
              <tr v-if="!hrUsers.length" class="empty-row"><td colspan="5">No HR users registered.</td></tr>
              <tr v-for="u in hrUsers" :key="u.email">
                <td>{{ u.email }}</td>
                <td>{{ u.name }}</td>
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
            <button class="btn-close" @click="idpModal = false">×</button>
          </div>
        </div>
        <div class="modal-body" v-if="selectedIDP">
          <div class="m-section">
            <div class="m-section-title">Employee Information</div>
            <div class="dgrid g3">
              <div class="df"><label>Reference ID</label><code>{{ selectedIDP.refId }}</code></div>
              <div class="df"><label>Year Covered</label><span>{{ selectedIDP.yearCovered || '—' }}</span></div>
              <div class="df"><label>Purpose</label><span>{{ selectedIDP.headerPurpose || '—' }}</span></div>
              <div class="df s3"><label>Name of Personnel</label><span>{{ selectedIDP.employeeName || '—' }}</span></div>
              <div class="df"><label>Email</label><span>{{ selectedIDP.email || '—' }}</span></div>
              <div class="df"><label>Position</label><span>{{ selectedIDP.position || '—' }}</span></div>
              <div class="df"><label>Office / Unit</label><span>{{ selectedIDP.office || '—' }}</span></div>
              <div class="df"><label>Campus</label><span>{{ selectedIDP.campus || '—' }}</span></div>
              <div class="df"><label>Educational Attainment</label><span>{{ selectedIDP.educAttainment || '—' }}{{ selectedIDP.educAttainmentSpec ? ' — ' + selectedIDP.educAttainmentSpec : '' }}</span></div>
              <div class="df"><label>Years in Position</label><span>{{ selectedIDP.yearsInPosition || '—' }}</span></div>
              <div class="df"><label>Years in CSU</label><span>{{ selectedIDP.yearsInCSU || '—' }}</span></div>
              <div class="df s3"><label>Immediate Supervisor</label><span>{{ selectedIDP.supervisorName || '—' }} <span class="sub-text">{{ selectedIDP.supervisorEmail || '' }}</span></span></div>
            </div>
          </div>
          <div class="m-section">
            <div class="m-section-title">Section I — Competency Assessment</div>
            <div class="df" style="margin-bottom:10px"><label>Purpose</label><span>{{ selectedIDP.competencyPurpose || '—' }}</span></div>
            <table class="m-table" v-if="selectedIDP._competencyRows?.length">
              <thead><tr><th>#</th><th>Target Competency</th><th>Cluster</th><th>Current Level</th><th>Required Level</th><th>Intervention</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP._competencyRows" :key="i">
                  <td>{{ i+1 }}</td>
                  <td><strong>{{ row.targetCompetency || '—' }}</strong></td>
                  <td>{{ row.competencyGroup || '—' }}</td>
                  <td>{{ row.currentLevel || '—' }}</td>
                  <td>{{ row.requiredLevel || '—' }}</td>
                  <td>{{ row.leadInterventions || '—' }}</td>
                  <td>{{ row.targetTimeline || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-note">No competency entries.</p>
          </div>
          <div class="m-section">
            <div class="m-section-title">Section II — AGAP</div>
            <table class="m-table" v-if="selectedIDP._agapRows?.length">
              <thead><tr><th>#</th><th>Degree Program</th><th>Target HEI</th><th>Mode of Study</th><th>Scholarship / Grant</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP._agapRows" :key="i">
                  <td>{{ i+1 }}</td>
                  <td>{{ row.degreeProgram || '—' }}</td>
                  <td>{{ row.targetHEI || '—' }}</td>
                  <td>{{ row.modeOfStudy || '—' }}</td>
                  <td>{{ row.scholarshipGrant || '—' }}</td>
                  <td>{{ row.targetTimeline || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-note">No AGAP entries.</p>
          </div>
          <div class="m-section">
            <div class="m-section-title">Section III — Pro-ACT</div>
            <table class="m-table" v-if="selectedIDP._proactRows?.length">
              <thead><tr><th>#</th><th>Training / Workshop Title</th><th>Target Competency</th><th>Mode of Activity</th><th>Trainer / Provider</th><th>Timeline</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in selectedIDP._proactRows" :key="i">
                  <td>{{ i+1 }}</td>
                  <td>{{ row.trainingTitle || '—' }}</td>
                  <td>{{ row.targetSkill || '—' }}</td>
                  <td>{{ row.modeOfActivity || '—' }}</td>
                  <td>{{ row.trainerProvider || '—' }}</td>
                  <td>{{ row.targetTimeline || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-note">No Pro-ACT entries.</p>
          </div>
          <div class="m-section">
            <div class="m-section-title">Section IV — Supervisor Assessment</div>
            <div v-if="selectedIDP.status === 'COMPLETE' && selectedIDP._assessment" class="dgrid">
              <div class="df"><label>Performance Gaps?</label><span>{{ selectedIDP._assessment.perfGapsYN || '—' }}</span></div>
              <div class="df"><label>Ready for Advancement?</label><span>{{ selectedIDP._assessment.readinessYN || '—' }}</span></div>
              <div class="df s2"><label>Gap Description</label><span style="white-space:pre-wrap">{{ selectedIDP._assessment.perfGapsSpec || '—' }}</span></div>
              <div class="df s2"><label>Readiness Remarks</label><span style="white-space:pre-wrap">{{ selectedIDP._assessment.readinessRemarks || '—' }}</span></div>
              <div class="df s2"><label>Recommended Interventions</label><span>{{ Array.isArray(selectedIDP._assessment.interventions) ? selectedIDP._assessment.interventions.join(', ') : (selectedIDP._assessment.interventions || '—') }}</span></div>
              <div class="df"><label>Implementation Period</label><span>{{ selectedIDP._assessment.implYear || '' }} {{ selectedIDP._assessment.implementationPeriod || '—' }}</span></div>
              <div class="df"><label>Signed At</label><span>{{ fmtDate(selectedIDP.supervisorSignedAt) }}</span></div>
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
            <button class="btn-close" @click="lnaModal = false">×</button>
          </div>
        </div>
        <div class="modal-body" v-if="selectedLNA">
          <div class="m-section">
            <div class="m-section-title">Office Information</div>
            <div class="dgrid g3">
              <div class="df"><label>Reference ID</label><code>{{ selectedLNA.refId }}</code></div>
              <div class="df"><label>Year Covered</label><span>{{ selectedLNA.yearCovered || '—' }}</span></div>
              <div class="df"><label>Purpose</label><span>{{ selectedLNA.purpose || '—' }}</span></div>
              <div class="df s3"><label>Office / Unit / College</label><span>{{ selectedLNA.office || '—' }}</span></div>
              <div class="df"><label>Head of Office</label><span>{{ selectedLNA.headOfUnit || '—' }}</span></div>
              <div class="df"><label>Position</label><span>{{ selectedLNA.position || '—' }}</span></div>
              <div class="df"><label>Total Personnel</label><span>{{ selectedLNA.totalPersonnel || '—' }}</span></div>
              <div class="df"><label>Date Prepared</label><span>{{ selectedLNA.datePrepared || '—' }}</span></div>
              <div class="df"><label>Submitted By</label><span>{{ selectedLNA.submitterEmail || '—' }}</span></div>
            </div>
          </div>
          <div class="m-section">
            <div class="m-section-title">Section II — Competency Cluster Summary</div>
            <table class="m-table" v-if="selectedLNA._clusterSummary?.length">
              <thead><tr><th>Cluster</th><th>Strongest</th><th>Weakest</th><th>Intervention Needed?</th></tr></thead>
              <tbody>
                <tr v-for="(c, i) in selectedLNA._clusterSummary" :key="i">
                  <td><strong>{{ c.cluster }}</strong></td>
                  <td>{{ c.strongest || '—' }}</td>
                  <td>{{ c.weakest || '—' }}</td>
                  <td>
                    <span v-if="c.interventionNeeded==='Yes'||c.interventionNeeded==='Y'" class="badge badge-red">Yes</span>
                    <span v-else-if="c.interventionNeeded==='No'||c.interventionNeeded==='N'" class="badge badge-green">No</span>
                    <span v-else class="badge badge-grey">{{ c.interventionNeeded || '—' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-note">No cluster summary data.</p>
          </div>
          <div class="m-section">
            <div class="m-section-title">Section III — Data Sources</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
              <span v-for="(src,i) in (selectedLNA._dataSources || [])" :key="i" class="badge badge-grey">{{ src }}</span>
              <span v-if="!selectedLNA._dataSources?.length" class="empty-note">No sources recorded.</span>
            </div>
            <table class="m-table" v-if="selectedLNA._insightRows?.length">
              <thead><tr><th>Data Source</th><th>Gap / Issue</th><th>Relevant Personnel</th><th>Recommended Intervention</th></tr></thead>
              <tbody>
                <tr v-for="(row,i) in selectedLNA._insightRows" :key="i">
                  <td>{{ row.dataSource || '—' }}</td>
                  <td style="white-space:pre-wrap">{{ row.gap || '—' }}</td>
                  <td>{{ row.personnel || '—' }}</td>
                  <td>{{ row.intervention || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-note">No insights recorded.</p>
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
          <div class="add-field"><label>CarSU Email *</label><input type="email" v-model="newHR.email" placeholder="name@carsu.edu.ph"/></div>
          <div class="add-field"><label>Full Name *</label><input type="text" v-model="newHR.name" placeholder="e.g. Juan Dela Cruz"/></div>
          <div class="add-field"><label>Role / Designation</label><input type="text" v-model="newHR.role" placeholder="e.g. HRMO II"/></div>
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
const screen        = ref('login');
const currentUser   = ref(null);
const loginEmail    = ref('');
const loginHint     = ref('');
const loginHintType = ref('');
const loginLoading  = ref(false);
const deniedMsg     = ref('');
const dataLoading   = ref(false);
const lastUpdated   = ref('Loading data...');
const activeTab     = ref('overview');
const idpSubTab     = ref('list');
const lnaSubTab     = ref('list');

const idps    = ref([]);
const lnas    = ref([]);
const hrUsers = ref([]);

const idpSearch       = ref('');
const idpStatusFilter = ref('');
const idpYearFilter   = ref('');
const idpOfficeFilter = ref('');
const lnaSearch       = ref('');
const lnaYearFilter   = ref('');
const lnaOfficeFilter = ref('');
const lnaPurposeFilter = ref('');

const sortState = reactive({ idp: { col: -1, asc: true }, lna: { col: -1, asc: true } });

const idpModal   = ref(false);
const lnaModal   = ref(false);
const addHRModal = ref(false);
const selectedIDP = ref(null);
const selectedLNA = ref(null);
const newHR = reactive({ email: '', name: '', role: '' });
const toasts = ref([]);

const chartStatus = ref(null);
let chartInstances = {};

// ── TABS ──────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'overview', label: 'Overview',        icon: '📊' },
  { key: 'idp',      label: 'IDP Submissions',  icon: '📋' },
  { key: 'lna',      label: 'LNA Submissions',  icon: '📝' },
  { key: 'registry', label: 'HR Registry',      icon: '👥' },
];

const idpSubTabs = [
  { key: 'list',       label: 'All Submissions',         icon: '📋' },
  { key: 'competency', label: 'Section I — Competency',  icon: '🎯' },
  { key: 'agap',       label: 'Section II — AGAP',       icon: '🎓' },
  { key: 'proact',     label: 'Section III — Pro-ACT',   icon: '📚' },
  { key: 'supervisor', label: 'Section IV — Supervisor', icon: '✅' },
];

const lnaSubTabs = [
  { key: 'list',       label: 'All Submissions',            icon: '📋' },
  { key: 'workforce',  label: 'Section I — Workforce',      icon: '👥' },
  { key: 'competency', label: 'Section II — Competency',    icon: '🎯' },
  { key: 'sources',    label: 'Section III — Data Sources', icon: '📊' },
];

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

// ── DATA NORMALIZATION ─────────────────────────────────────────────────────
// Parses raw API responses into clean objects the dashboard can use directly.
function normalizeIDP(raw) {
  // Parse JSON string fields from the database
  let competencyRows = [], agapRows = [], proactRows = [], assessment = null;
  try { competencyRows = JSON.parse(raw.competencyRowsJson || '[]'); } catch {}
  try { agapRows       = JSON.parse(raw.agapRowsJson       || '[]'); } catch {}
  try { proactRows     = JSON.parse(raw.proactRowsJson     || '[]'); } catch {}
  try { assessment     = JSON.parse(raw.supervisorAssessment || 'null'); } catch {}

  return {
    ...raw,
    employeeName: [raw.firstName, raw.lastName].filter(Boolean).join(' ') || raw.nameOfPersonnel || '',
    email:        raw.employeeEmail || '',
    position:     raw.currentPosition || '',
    office:       raw.collegeOfficeUnit || '',
    // Parsed section data — prefixed with _ to distinguish from raw
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

// ── FILTER OPTIONS ─────────────────────────────────────────────────────────
const idpYears   = computed(() => [...new Set(idps.value.map(r=>r.yearCovered).filter(Boolean))].sort().reverse());
const idpOffices = computed(() => [...new Set(idps.value.map(r=>r.office).filter(Boolean))].sort());
const lnaYearsAvail = computed(() => [...new Set(lnas.value.map(r=>r.yearCovered).filter(Boolean))].sort().reverse());
const lnaOffices    = computed(() => [...new Set(lnas.value.map(r=>r.office).filter(Boolean))].sort());
const lnaPurposes   = computed(() => [...new Set(lnas.value.map(r=>r.purpose).filter(Boolean))].sort());

// ── FILTERED LISTS ─────────────────────────────────────────────────────────
const filteredIDPs = computed(() => {
  const q = idpSearch.value.toLowerCase();
  let rows = idps.value.filter(r => {
    const match = !q || [r.refId, r.employeeName, r.email, r.office, r.position, r.supervisorName].some(v => (v||'').toLowerCase().includes(q));
    return match
      && (!idpStatusFilter.value || r.status === idpStatusFilter.value)
      && (!idpYearFilter.value   || r.yearCovered === idpYearFilter.value)
      && (!idpOfficeFilter.value || r.office === idpOfficeFilter.value);
  });
  const { col, asc } = sortState.idp;
  if (col >= 0) {
    const ks = ['refId','employeeName','position','office','yearCovered','submittedAt','status'];
    rows = [...rows].sort((a,b) => { const av=(a[ks[col]]||'').toLowerCase(), bv=(b[ks[col]]||'').toLowerCase(); return asc ? av.localeCompare(bv) : bv.localeCompare(av); });
  }
  return rows;
});

const filteredLNAs = computed(() => {
  const q = lnaSearch.value.toLowerCase();
  let rows = lnas.value.filter(r => {
    const match = !q || [r.refId, r.office, r.headOfUnit, r.submitterEmail].some(v => (v||'').toLowerCase().includes(q));
    return match
      && (!lnaYearFilter.value    || r.yearCovered === lnaYearFilter.value)
      && (!lnaOfficeFilter.value  || r.office === lnaOfficeFilter.value)
      && (!lnaPurposeFilter.value || r.purpose === lnaPurposeFilter.value);
  });
  const { col, asc } = sortState.lna;
  if (col >= 0) {
    const ks = ['refId','office','headOfUnit','yearCovered','purpose','totalPersonnel','submittedAt'];
    rows = [...rows].sort((a,b) => { const av=(a[ks[col]]||'').toLowerCase(), bv=(b[ks[col]]||'').toLowerCase(); return asc ? av.localeCompare(bv) : bv.localeCompare(av); });
  }
  return rows;
});

const activeIdpCount = computed(() => filteredIDPs.value.length);

// ── IDP SECTION EXPANSIONS ─────────────────────────────────────────────────
const idpCompetencyRows = computed(() => {
  const out = [];
  filteredIDPs.value.forEach(r => {
    (r._competencyRows || []).forEach((row, i) => {
      out.push({ _key:`${r.refId}-c${i}`, refId:r.refId, name:r.employeeName, email:r.email, position:r.position, office:r.office, year:r.yearCovered, rowNum:i+1, targetCompetency:row.targetCompetency, competencyGroup:row.competencyGroup, currentLevel:row.currentLevel, requiredLevel:row.requiredLevel, leadInterventions:row.leadInterventions, targetTimeline:row.targetTimeline });
    });
  });
  return out;
});

const idpAgapRows = computed(() => {
  const out = [];
  filteredIDPs.value.forEach(r => {
    (r._agapRows || []).forEach((row, i) => {
      out.push({ _key:`${r.refId}-a${i}`, refId:r.refId, name:r.employeeName, position:r.position, office:r.office, year:r.yearCovered, rowNum:i+1, degreeProgram:row.degreeProgram, targetHEI:row.targetHEI, modeOfStudy:row.modeOfStudy, scholarshipGrant:row.scholarshipGrant, targetTimeline:row.targetTimeline });
    });
  });
  return out;
});

const idpProactRows = computed(() => {
  const out = [];
  filteredIDPs.value.forEach(r => {
    (r._proactRows || []).forEach((row, i) => {
      out.push({ _key:`${r.refId}-p${i}`, refId:r.refId, name:r.employeeName, position:r.position, office:r.office, year:r.yearCovered, rowNum:i+1, trainingTitle:row.trainingTitle, targetSkill:row.targetSkill, modeOfActivity:row.modeOfActivity, trainerProvider:row.trainerProvider, targetTimeline:row.targetTimeline });
    });
  });
  return out;
});

// ── LNA SECTION EXPANSIONS ─────────────────────────────────────────────────
const lnaWorkforceRows = computed(() => {
  const out = [];
  filteredLNAs.value.forEach(r => {
    const wp = r.workforceProfile || {};
    POSITION_LEVELS.forEach(lv => {
      const row = wp[lv.key] || {};
      const total = EMP_TYPE_KEYS.reduce((s,k) => s + (Number(row[k])||0), 0);
      if (total === 0) return;
      out.push({ _key:`${r.refId}-wf-${lv.key}`, refId:r.refId, office:r.office, year:r.yearCovered, levelLabel:lv.label, ...row, total });
    });
  });
  return out;
});

const lnaClusterRows = computed(() => {
  const out = [];
  filteredLNAs.value.forEach(r => {
    (r._clusterSummary || []).forEach((row, i) => {
      out.push({ _key:`${r.refId}-cs${i}`, refId:r.refId, office:r.office, year:r.yearCovered, cluster:row.cluster, strongest:row.strongest, weakest:row.weakest, interventionNeeded:row.interventionNeeded });
    });
  });
  return out;
});

const lnaCompRows = computed(() => {
  const out = [];
  filteredLNAs.value.forEach(r => {
    COMP_CLUSTERS.forEach(({ key, label }) => {
      (r[key] || []).forEach((row, i) => {
        out.push({ _key:`${r.refId}-${key}-${i}`, refId:r.refId, office:r.office, year:r.yearCovered, cluster:label, competency:row.competency, first_cl:row.first_cl, first_pct:row.first_pct, secondNonSup_cl:row.secondNonSup_cl, secondNonSup_pct:row.secondNonSup_pct, secondSup_cl:row.secondSup_cl, secondSup_pct:row.secondSup_pct, third_cl:row.third_cl, third_pct:row.third_pct, faculty_cl:row.faculty_cl, faculty_pct:row.faculty_pct, observations:row.observations });
      });
    });
  });
  return out;
});

const lnaInsightRows = computed(() => {
  const out = [];
  filteredLNAs.value.forEach(r => {
    (r._insightRows || []).forEach((row, i) => {
      out.push({ _key:`${r.refId}-ins${i}`, refId:r.refId, office:r.office, year:r.yearCovered, dataSource:row.dataSource, gap:row.gap, personnel:row.personnel, intervention:row.intervention });
    });
  });
  return out;
});

// ── OVERVIEW COMPUTED ──────────────────────────────────────────────────────
const lnaOfficeCount = computed(() => new Set(lnas.value.map(r=>r.office).filter(Boolean)).size);

const lnaFlagged = computed(() => {
  return lnas.value.filter(r =>
    (r._clusterSummary || []).some(c => c.interventionNeeded === 'Yes' || c.interventionNeeded === 'Y')
  ).length;
});

const topGaps = computed(() => {
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

const interventionOffices = computed(() => {
  return lnas.value
    .filter(r => (r._clusterSummary || []).some(c => c.interventionNeeded === 'Yes' || c.interventionNeeded === 'Y'))
    .map(r => r.office)
    .filter(Boolean);
});

const recentActivity = computed(() => {
  const combined = [
    ...idps.value.map(r => ({ refId: r.refId, type: 'IDP', label: r.employeeName || r.refId, status: r.status, submittedAt: r.submittedAt })),
    ...lnas.value.map(r => ({ refId: r.refId, type: 'LNA', label: r.office || r.refId, status: 'SUBMITTED', submittedAt: r.submittedAt })),
  ];
  return combined.sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0,8);
});

// ── AUTH ───────────────────────────────────────────────────────────────────
async function doLogin() {
  const em = loginEmail.value.trim().toLowerCase();
  if (!em) { loginHint.value = 'Please enter your email.'; loginHintType.value = 'err'; return; }
  if (!em.endsWith('@carsu.edu.ph') && !em.endsWith('@gmail.com')) { loginHint.value = 'Must be a @carsu.edu.ph address.'; loginHintType.value = 'err'; return; }
  loginHint.value = 'Verifying...'; loginHintType.value = ''; loginLoading.value = true;
  try {
    const res = await fetch(`${API}/api/auth/check?email=${encodeURIComponent(em)}`);
    const data = await res.json();
    if (data.authorized) { currentUser.value = { email: em, name: data.name }; screen.value = 'dash'; loadDashboard(); }
    else { screen.value = 'denied'; deniedMsg.value = ''; }
  } catch { loginHint.value = 'Network error. Try again.'; loginHintType.value = 'err'; }
  finally { loginLoading.value = false; }
}

// ── DATA LOADING ───────────────────────────────────────────────────────────
async function loadDashboard() {
  dataLoading.value = true; lastUpdated.value = 'Loading...';
  try {
    const [idpRes, lnaRes, hrRes] = await Promise.all([
      fetch(`${API}/api/idp`),
      fetch(`${API}/api/lna`),
      fetch(`${API}/api/users`),
    ]);
    const rawIdps = await idpRes.json();
    const rawLnas = await lnaRes.json();
    // Normalize immediately so all computed props work correctly
    idps.value    = Array.isArray(rawIdps) ? rawIdps.map(normalizeIDP) : [];
    lnas.value    = Array.isArray(rawLnas) ? rawLnas.map(normalizeLNA) : [];
    hrUsers.value = await hrRes.json();
    const now = new Date();
    lastUpdated.value = `Last updated: ${now.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})} at ${now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}`;
    await nextTick();
    if (activeTab.value === 'overview') renderCharts();
  } catch (e) {
    toast('Failed to load data.', 'error');
    lastUpdated.value = 'Failed to load.';
  } finally { dataLoading.value = false; }
}

// ── CHARTS ─────────────────────────────────────────────────────────────────
watch(activeTab, async tab => { if (tab === 'overview') { await nextTick(); renderCharts(); } });

function dc(k) { if (chartInstances[k]) { chartInstances[k].destroy(); delete chartInstances[k]; } }

async function renderCharts() {
  if (typeof Chart === 'undefined') return;
  dc('s');
  const done = idps.value.filter(r=>r.status==='COMPLETE').length;
  const notif = idps.value.filter(r=>r.status==='SUPERVISOR_NOTIFIED').length;
  const pend  = idps.value.filter(r=>r.status==='PENDING').length;
  if (chartStatus.value) {
    chartInstances.s = new Chart(chartStatus.value, {
      type: 'doughnut',
      data: { labels: ['Completed','With Supervisor','Pending'], datasets: [{ data: [done,notif,pend], backgroundColor: ['#1a4d2e','#f5c300','#8b9db0'], borderWidth: 2, borderColor: '#fff' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } }, cutout: '62%' },
    });
  }
}

// ── MODALS ─────────────────────────────────────────────────────────────────
function viewIDP(refId) {
  selectedIDP.value = idps.value.find(x => x.refId === refId) || null;
  if (selectedIDP.value) idpModal.value = true;
}
function viewLNA(refId) {
  selectedLNA.value = lnas.value.find(x => x.refId === refId) || null;
  if (selectedLNA.value) lnaModal.value = true;
}

// ── HR REGISTRY ─────────────────────────────────────────────────────────────
async function saveHR() {
  if (!newHR.email || !newHR.name) { toast('Email and Name are required.', 'error'); return; }
  if (!newHR.email.endsWith('@carsu.edu.ph')) { toast('Must be a @carsu.edu.ph email.', 'error'); return; }
  try {
    await fetch(`${API}/api/users`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:newHR.email, name:newHR.name, role:newHR.role }) });
    toast(`${newHR.name} added.`, 'success');
    addHRModal.value = false; newHR.email=''; newHR.name=''; newHR.role='';
    loadDashboard();
  } catch { toast('Network error.', 'error'); }
}

async function removeHR(email, name) {
  if (!confirm(`Remove ${name||email} from the HR Registry?`)) return;
  try {
    await fetch(`${API}/api/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
    toast(`${name||email} removed.`, 'success');
    loadDashboard();
  } catch { toast('Network error.', 'error'); }
}

// ── SORT ────────────────────────────────────────────────────────────────────
function sortTable(type, col) { const s = sortState[type]; if (s.col === col) s.asc = !s.asc; else { s.col = col; s.asc = true; } }
function sortIndicator(type, col) { const s = sortState[type]; if (s.col !== col) return '↕'; return s.asc ? '↑' : '↓'; }

// ── HELPERS ─────────────────────────────────────────────────────────────────
function fmtDate(v) { if (!v) return '—'; const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}); }
function statusBadgeClass(s) { const c=(s||'').toUpperCase(); if(c==='COMPLETE')return 'badge badge-green'; if(c==='SUPERVISOR_NOTIFIED')return 'badge badge-navy'; if(c==='PENDING')return 'badge badge-gold'; return 'badge badge-grey'; }
function statusBadgeLabel(s) { const c=(s||'').toUpperCase(); if(c==='COMPLETE')return 'Completed'; if(c==='SUPERVISOR_NOTIFIED')return 'With Supervisor'; if(c==='PENDING')return 'Pending'; if(c==='SUBMITTED')return 'Submitted'; return s||'Unknown'; }
function toast(msg, type='') { const id = Date.now(); toasts.value.push({id,msg,type}); setTimeout(() => { toasts.value = toasts.value.filter(t=>t.id!==id); }, 3500); }

onMounted(() => {
  if (typeof Chart !== 'undefined') return;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
  document.head.appendChild(s);
});
</script>

<style scoped>
:root {
  --navy:#1a4d2e; --navy-mid:#2d6a3f; --navy-light:#3d8b50;
  --gold:#f5c300; --gold-dim:rgba(245,195,0,.12);
  --cream:#faf8f4; --white:#fff; --text:#1a1a2e; --text-light:#5a6070;
  --border:#d8d4c8; --error:#c0392b; --success:#1a6b3c;
  --shadow:0 4px 24px rgba(26,77,46,.1); --shadow-sm:0 2px 8px rgba(26,77,46,.07); --shadow-lg:0 12px 48px rgba(26,77,46,.18);
}
* { box-sizing:border-box; margin:0; padding:0; }

/* ── NAV ── */
.page-nav { background:var(--navy); padding:0 28px; display:flex; align-items:center; border-bottom:1px solid rgba(255,255,255,.08); }
.page-nav a.back-link { display:inline-flex; align-items:center; gap:9px; padding:10px 0; color:rgba(255,255,255,.75); text-decoration:none; font-size:12.5px; font-weight:500; transition:color .2s; }
.page-nav a.back-link:hover { color:#fff; }
.page-nav a.back-link svg { width:13px; height:13px; stroke:currentColor; fill:none; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; }
.nav-sep { color:rgba(255,255,255,.25); font-size:13px; margin:0 10px; }
.nav-current { font-size:12.5px; color:var(--gold); font-weight:600; letter-spacing:.03em; }

/* ── AUTH ── */
.auth-screen { display:flex; align-items:center; justify-content:center; min-height:calc(100vh - 42px); padding:40px 20px; }
.login-card { background:var(--white); border:1px solid var(--border); border-radius:20px; padding:48px 44px; max-width:420px; width:100%; box-shadow:var(--shadow-lg); text-align:center; animation:fadeUp .5s ease; }
.login-icon { width:68px; height:68px; background:var(--navy); border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
.login-icon svg { width:32px; height:32px; stroke:var(--gold); fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.login-eyebrow { font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); border:1px solid rgba(245,195,0,.3); border-radius:20px; display:inline-block; padding:4px 14px; margin-bottom:12px; }
.login-card h2 { font-family:'Playfair Display',serif; font-size:24px; color:var(--navy); margin-bottom:8px; }
.login-card > p { font-size:13px; color:var(--text-light); margin-bottom:28px; }
.login-field { display:flex; flex-direction:column; gap:6px; text-align:left; margin-bottom:16px; }
.login-field label { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--navy-mid); }
.login-field input { width:100%; padding:11px 14px; border:1.5px solid var(--border); border-radius:9px; font-family:inherit; font-size:14px; color:var(--text); outline:none; transition:border-color .2s; background:#f8f7f4; }
.login-field input:focus { border-color:var(--navy); background:#fff; }
.login-field input.err { border-color:var(--error); }
.login-hint { font-size:12px; min-height:16px; display:block; }
.login-hint.err { color:var(--error); }
.btn-login { width:100%; padding:13px; background:var(--navy); color:#fff; border:none; border-radius:9px; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-login:hover { background:var(--navy-mid); }
.btn-login:disabled { background:#aaa; cursor:not-allowed; }
.denied-card { background:var(--white); border:1px solid #f5c6c2; border-radius:20px; padding:48px 40px; max-width:420px; width:100%; text-align:center; }
.denied-icon { font-size:34px; margin-bottom:16px; }
.denied-card h2 { font-family:'Playfair Display',serif; font-size:22px; color:var(--error); margin-bottom:8px; }
.denied-card p { font-size:13px; color:var(--text-light); margin-bottom:18px; }
.btn-try { padding:9px 24px; background:var(--navy); color:#fff; border:none; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; }

/* ── DASH SHELL ── */
.dash-wrap { max-width:1400px; margin:0 auto; padding:28px 28px 80px; }
.dash-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; flex-wrap:wrap; gap:12px; }
.dash-head h1 { font-family:'Playfair Display',serif; font-size:26px; color:var(--navy); margin-bottom:2px; }
.dash-sub { font-size:12px; color:var(--text-light); }
.btn-refresh { display:flex; align-items:center; gap:7px; padding:8px 16px; background:var(--navy); color:#fff; border:none; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-refresh:hover { background:var(--navy-mid); }
.btn-refresh svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; }
.btn-refresh.spinning svg { animation:spin .8s linear infinite; }

/* ── TABS ── */
.tab-bar { display:flex; gap:3px; background:rgba(26,77,46,.07); border-radius:10px; padding:4px; margin-bottom:20px; width:fit-content; flex-wrap:wrap; }
.tab-btn { padding:7px 18px; border:none; background:transparent; border-radius:7px; font-family:inherit; font-size:13px; font-weight:600; color:var(--text-light); cursor:pointer; transition:all .2s; white-space:nowrap; }
.tab-btn.active { background:var(--navy); color:#fff; box-shadow:0 2px 8px rgba(26,77,46,.2); }
.tab-btn:not(.active):hover { background:rgba(26,77,46,.1); color:var(--navy); }
.tab-panel { animation:fadeUp .25s ease; }

.sub-tab-bar { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
.sub-tab-btn { padding:6px 14px; border:1.5px solid var(--border); background:var(--white); border-radius:7px; font-family:inherit; font-size:12px; font-weight:600; color:var(--text-light); cursor:pointer; transition:all .2s; white-space:nowrap; }
.sub-tab-btn.active { background:var(--navy); color:#fff; border-color:var(--navy); }
.sub-tab-btn:not(.active):hover { border-color:var(--navy); color:var(--navy); }

/* ── OVERVIEW ── */
.overview-grid { display:grid; grid-template-columns:1fr 1fr 280px; gap:16px; }
.ov-block { background:var(--white); border:1px solid var(--border); border-radius:12px; padding:18px 20px; box-shadow:var(--shadow-sm); }
.ov-block-chart { display:flex; flex-direction:column; }
.ov-block-wide { grid-column:span 3; }
.ov-block-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--navy-mid); margin-bottom:14px; display:flex; align-items:center; gap:10px; }
.ov-note { font-size:10px; font-weight:500; text-transform:none; letter-spacing:0; color:var(--text-light); }
.ov-stats { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.ov-stat { text-align:center; padding:10px 8px; background:#faf9f6; border-radius:8px; border:1px solid var(--border); }
.ov-stat-val { font-family:'Playfair Display',serif; font-size:28px; color:var(--navy); line-height:1; margin-bottom:4px; }
.ov-stat-val.green { color:var(--success); }
.ov-stat-val.gold { color:#8a6c00; }
.ov-stat-val.navy { color:var(--navy-mid); }
.ov-stat-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text-light); }
.chart-wrap { flex:1; position:relative; min-height:180px; }

.gap-list { display:flex; flex-direction:column; gap:7px; }
.gap-row { display:flex; align-items:center; gap:10px; font-size:12px; }
.gap-rank { width:18px; height:18px; background:var(--navy); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0; }
.gap-label { width:220px; flex-shrink:0; color:var(--text); font-weight:500; }
.gap-bar-wrap { flex:1; background:#eee; border-radius:4px; height:8px; overflow:hidden; }
.gap-bar { height:100%; background:var(--navy); border-radius:4px; transition:width .4s ease; }
.gap-count { width:24px; text-align:right; font-weight:700; color:var(--navy); }

.tag-cloud { display:flex; flex-wrap:wrap; gap:8px; }
.tag { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
.tag-red { background:rgba(192,57,43,.1); color:var(--error); border:1px solid rgba(192,57,43,.2); }

.ov-table { width:100%; border-collapse:collapse; font-size:12px; }
.ov-table thead tr { background:#f5f3ee; }
.ov-table thead th { padding:8px 10px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-light); text-align:left; border-bottom:1.5px solid var(--border); }
.ov-table tbody tr { border-bottom:1px solid #eee; }
.ov-table tbody tr:last-child { border-bottom:none; }
.ov-table tbody td { padding:8px 10px; }
.empty-row-td { text-align:center; padding:28px; color:var(--text-light); font-style:italic; }
.empty-note { font-size:13px; color:var(--text-light); font-style:italic; padding:8px 0; }

/* ── FILTER BAR ── */
.filter-bar { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px; }
.filter-bar input, .filter-bar select { padding:7px 12px; border:1.5px solid var(--border); border-radius:8px; font-family:inherit; font-size:13px; color:var(--text); background:var(--white); outline:none; transition:border-color .2s; }
.filter-bar input { min-width:240px; }
.filter-bar input:focus, .filter-bar select:focus { border-color:var(--navy); }
.filter-bar select { min-width:140px; }
.result-count { font-size:12px; color:var(--text-light); margin-left:auto; }

/* ── TABLES ── */
.tbl-wrap { overflow-x:auto; border-radius:10px; border:1px solid var(--border); box-shadow:var(--shadow-sm); margin-bottom:8px; }
.dtbl { width:100%; border-collapse:collapse; font-size:13px; background:var(--white); }
.dtbl thead tr { background:var(--navy); }
.dtbl thead th { padding:10px 12px; color:#fff; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.06em; text-align:left; white-space:nowrap; cursor:pointer; user-select:none; border-right:1px solid rgba(255,255,255,.07); }
.dtbl thead th:last-child { border-right:none; cursor:default; }
.dtbl thead th:hover:not(:last-child) { background:var(--navy-mid); }
.sort-ind { font-size:9px; margin-left:3px; opacity:.55; }
.dtbl tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
.dtbl tbody tr:last-child { border-bottom:none; }
.dtbl tbody tr:hover { background:rgba(26,77,46,.025); }
.dtbl tbody td { padding:9px 12px; vertical-align:middle; }
.empty-row td { text-align:center; padding:40px; color:var(--text-light); font-style:italic; }
.sub-text { font-size:11px; color:var(--text-light); }
.date-cell { font-size:12px; white-space:nowrap; }
.ref-code { font-size:11px; background:rgba(26,77,46,.07); padding:2px 6px; border-radius:4px; font-family:monospace; }
.cell-wrap { max-width:180px; white-space:pre-wrap; font-size:12px; }
.muted { color:var(--text-light); font-size:12px; }
.level-badge { display:inline-block; padding:2px 7px; border-radius:5px; font-size:11px; font-weight:600; }
.level-cur { background:rgba(90,96,112,.1); color:var(--text-light); }
.level-req { background:rgba(26,77,46,.1); color:var(--navy); }
.sub-section-label { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--navy-mid); padding-bottom:6px; border-bottom:1.5px solid var(--border); }

/* ── BADGES ── */
.badge { display:inline-flex; align-items:center; padding:3px 8px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
.badge-green  { background:rgba(26,107,60,.1); color:#1a6b3c; }
.badge-gold   { background:rgba(245,195,0,.15); color:#8a6c00; }
.badge-red    { background:rgba(192,57,43,.1);  color:var(--error); }
.badge-grey   { background:rgba(90,96,112,.1);  color:var(--text-light); }
.badge-navy   { background:rgba(26,77,46,.12);  color:var(--navy); }
.badge-gold-outline { background:var(--gold-dim); color:#8a6c00; border:1px solid rgba(245,195,0,.3); }

/* ── BUTTONS ── */
.btn-view   { background:none; border:1px solid var(--border); padding:5px 11px; border-radius:6px; cursor:pointer; font-size:12px; color:var(--navy); font-family:inherit; font-weight:600; transition:all .2s; white-space:nowrap; }
.btn-view:hover { background:var(--navy); color:#fff; border-color:var(--navy); }
.reg-actions { display:flex; gap:8px; margin-bottom:14px; }
.btn-add  { display:flex; align-items:center; gap:6px; padding:8px 16px; background:var(--navy); color:#fff; border:none; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-add:hover { background:var(--navy-mid); }
.btn-remove { background:none; border:none; cursor:pointer; color:var(--error); padding:4px 8px; border-radius:6px; font-size:13px; transition:background .15s; }
.btn-remove:hover { background:rgba(192,57,43,.08); }

/* ── MODAL ── */
.modal-overlay { display:none; position:fixed; inset:0; background:rgba(10,20,30,.6); z-index:500; align-items:flex-start; justify-content:center; padding:20px; overflow-y:auto; }
.modal-overlay.active { display:flex; }
.modal { background:var(--white); border-radius:16px; max-width:960px; width:100%; box-shadow:0 24px 80px rgba(0,0,0,.25); animation:fadeUp .3s ease; margin:auto; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:16px 22px 14px; border-bottom:1px solid var(--border); position:sticky; top:0; background:var(--white); z-index:1; border-radius:16px 16px 0 0; }
.modal-header-left h3 { font-family:'Playfair Display',serif; font-size:17px; color:var(--navy); }
.modal-header-left p  { font-size:12px; color:var(--text-light); margin-top:1px; }
.modal-header-right { display:flex; gap:8px; align-items:center; }
.btn-close { width:28px; height:28px; background:rgba(26,77,46,.07); border:none; border-radius:6px; cursor:pointer; font-size:16px; color:var(--text-light); display:flex; align-items:center; justify-content:center; transition:all .2s; }
.btn-close:hover { background:rgba(192,57,43,.1); color:var(--error); }
.modal-body { padding:18px 22px 24px; }
.m-section { margin-bottom:20px; }
.m-section-title { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--navy-mid); padding-bottom:6px; border-bottom:1.5px solid var(--border); margin-bottom:12px; }
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
.pending-note { background:rgba(245,195,0,.08); border:1px solid rgba(245,195,0,.35); border-radius:8px; padding:14px; font-size:13px; color:var(--navy); }

.add-field { display:flex; flex-direction:column; gap:5px; margin-bottom:13px; }
.add-field label { font-size:11px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--navy-mid); }
.add-field input { padding:10px 13px; border:1.5px solid var(--border); border-radius:8px; font-family:inherit; font-size:13px; outline:none; transition:border-color .2s; }
.add-field input:focus { border-color:var(--navy); }
.btn-save { width:100%; padding:11px; background:var(--navy); color:#fff; border:none; border-radius:8px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:background .2s; }
.btn-save:hover { background:var(--navy-mid); }

/* ── TOASTS ── */
.toast-wrap { position:fixed; bottom:20px; right:20px; z-index:600; display:flex; flex-direction:column; gap:7px; }
.toast { background:var(--navy); color:#fff; padding:11px 16px; border-radius:9px; font-size:13px; font-weight:500; box-shadow:0 4px 20px rgba(0,0,0,.2); animation:fadeUp .3s ease; max-width:300px; }
.toast.success { background:var(--success); }
.toast.error   { background:var(--error); }

@media (max-width:900px) {
  .overview-grid { grid-template-columns:1fr 1fr; }
  .ov-block-chart { grid-column:span 2; }
  .ov-block-wide  { grid-column:span 2; }
}
@media (max-width:640px) {
  .dash-wrap { padding:16px 14px 60px; }
  .overview-grid { grid-template-columns:1fr; }
  .ov-block-chart, .ov-block-wide { grid-column:span 1; }
  .page-nav { padding:0 16px; }
  .nav-current, .nav-sep { display:none; }
}
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin { to { transform:rotate(360deg); } }
</style>