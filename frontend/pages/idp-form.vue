<template>
  <!-- Loading overlay -->
  <div class="overlay" :class="{ active: isLoading }">
    <div class="spinner"></div>
    <p>{{ loadingMsg }}</p>
  </div>

  <!-- Site header -->
  <header class="site-header">
    <div class="header-inner">
      <img
        src="/img/header-logo.png"
        alt="Caraga State University - Office of Human Resource Management Services"
        class="header-img"
      />
    </div>
  </header>

  <!-- Page nav breadcrumb -->
  <div class="page-nav">
    <a href="/" class="back-link">
      <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
      Back to Home
    </a>
    <span class="nav-sep">/</span>
    <span class="nav-current">Individual Development Plan (IDP) 2026-2029</span>
  </div>

  <!-- ═══════════════════════════════════════════════ -->
  <!-- STAGE 1 SUCCESS SCREEN                          -->
  <!-- ═══════════════════════════════════════════════ -->
  <div v-if="stage === 'stage1-success'" class="success-screen">
    <div class="success-icon">✓</div>
    <h2>IDP Successfully Submitted</h2>
    <p>
      Your Individual Development Plan has been received. Your supervisor has
      been notified and has <strong>3 days</strong> to complete their
      assessment.
    </p>
    <div class="ref-id-box">{{ refId }}</div>
    <p>
      Please keep your <strong>Reference ID</strong> for your records. You will
      receive an email confirmation shortly.
    </p>
    <p style="color: #1a6b3c; font-weight: 600; margin-top: 16px">
      📧 A complete copy of your IDP (including your supervisor's assessment)
      will be emailed to you once your supervisor submits their review.
    </p>
    <br />
    <a href="/" class="btn-return">← Return to Home</a>
  </div>

  <!-- ═══════════════════════════════════════════════ -->
  <!-- STAGE 2 TOKEN SCREEN                            -->
  <!-- ═══════════════════════════════════════════════ -->
  <div v-if="stage === 'token'" class="token-screen">
    <h2>Access IDP for Review</h2>
    <p>
      Enter your CarSU email address to verify your identity and load the
      employee's submission.
    </p>
    <input
      v-model="tokenInput"
      type="text"
      placeholder="Token (auto-filled from email link)"
      style="margin-bottom: 12px"
    />
    <input
      v-model="supervisorEmailInput"
      type="email"
      placeholder="Your CarSU email (e.g. name@carsu.edu.ph)"
      style="margin-bottom: 16px"
    />
    <div class="token-error">{{ tokenError }}</div>
    <button class="btn-load" @click="loadByToken">Verify &amp; Load IDP</button>
  </div>

  <!-- ═══════════════════════════════════════════════ -->
  <!-- STAGE 2 SUCCESS SCREEN                          -->
  <!-- ═══════════════════════════════════════════════ -->
  <div v-if="stage === 'stage2-success'" class="success-screen">
    <div class="success-icon">✓</div>
    <h2>Assessment Submitted</h2>
    <p>
      Your assessment for this IDP has been recorded. HRMS has been notified
      that the IDP is now fully complete. Thank you.
    </p>
    <div
      style="
        margin: 16px 0;
        padding: 14px 18px;
        background: rgba(26, 77, 46, 0.07);
        border-left: 4px solid var(--navy);
        border-radius: 8px;
        text-align: left;
      "
    >
      <p style="margin: 0 0 4px; font-weight: 600; color: var(--navy)">
        📧 Employee has been notified
      </p>
      <p style="margin: 0; color: var(--text-light); font-size: 14px">
        A complete copy of the IDP — including your assessment — has been
        automatically emailed to the employee.
      </p>
    </div>
  </div>

  <!-- print area -->
  <div id="printArea" style="display: none"></div>

  <!-- ═══════════════════════════════════════════════ -->
  <!-- STAGE 1: EMPLOYEE FORM                          -->
  <!-- ═══════════════════════════════════════════════ -->
  <div v-if="stage === 'stage1'" class="container">
    <div class="form-title-block">
      <h2>Individual Development Plan (IDP) 2026-2029</h2>
      <p>
        Complete all sections carefully. Your supervisor will be notified
        automatically upon submission.
      </p>
    </div>

    <!-- ── HEADER INFO ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">H</div>
        <div>
          <h3>Personnel Information</h3>
          <p>Basic details and submission purpose</p>
        </div>
      </div>
      <div class="section-body">
        <!-- Campus -->
        <div class="field-group" style="margin-bottom: 20px">
          <label>Campus <span class="req">*</span></label>
          <div class="checkbox-group">
            <label
              v-for="option in campusOptions"
              :key="option"
              class="checkbox-item"
              :class="{ checked: form.campus === option }"
            >
              <input
                type="radio"
                name="campus"
                :value="option"
                v-model="form.campus"
                @change="updateChecked"
              />
              {{ option }}
            </label>
          </div>
        </div>

        <!-- Office Affiliation -->
        <div class="field-group" style="margin-bottom: 20px">
          <label>Office Affiliation <span class="req">*</span></label>
          <div class="checkbox-group">
            <label
              v-for="option in officeOptions"
              :key="option"
              class="checkbox-item"
              :class="{ checked: form.officeAffiliation === option }"
            >
              <input
                type="radio"
                name="officeAffiliation"
                :value="option"
                v-model="form.officeAffiliation"
              />
              {{ option }}
            </label>
          </div>
        </div>

        <div class="field-grid field-grid-2" style="margin-bottom: 18px">
          <div class="field-group span-2">
            <label>College / Office / Unit <span class="req">*</span></label>
            <input
              type="text"
              v-model="form.collegeOfficeUnit"
              :class="{ error: errors.collegeOfficeUnit }"
              placeholder="e.g. College of Engineering"
            />
          </div>
        </div>

        <div class="field-grid field-grid-2" style="margin-bottom: 18px">
          <div class="field-group">
            <label>Name of Personnel <span class="req">*</span></label>
            <input
              type="text"
              v-model="form.nameOfPersonnel"
              :class="{ error: errors.nameOfPersonnel }"
              placeholder="Full name"
            />
          </div>
          <div class="field-group">
            <label>Your CarSU Email Address <span class="req">*</span></label>
            <input
              type="email"
              v-model="form.employeeEmail"
              :class="{
                error: emailHints.employee.type === 'error',
                valid: emailHints.employee.type === 'success',
              }"
              placeholder="yourname@carsu.edu.ph"
              @blur="validateEmail('employee')"
            />
            <small class="email-hint" :class="emailHints.employee.type">{{
              emailHints.employee.msg
            }}</small>
          </div>
          <div class="field-group">
            <label>Date Prepared <span class="req">*</span></label>
            <input
              type="date"
              v-model="form.datePrepared"
              :class="{ error: errors.datePrepared }"
            />
          </div>
          <div class="field-group">
            <label
              >Current Position / Designation <span class="req">*</span></label
            >
            <input
              type="text"
              v-model="form.currentPosition"
              :class="{ error: errors.currentPosition }"
              placeholder="e.g. Instructor I"
            />
          </div>
          <div class="field-group">
            <label>Year Covered <span class="req">*</span></label>
            <input
              type="text"
              v-model="form.yearCovered"
              :class="{ error: errors.yearCovered }"
              placeholder="e.g. 2025"
            />
          </div>
          <div class="field-group">
            <label>Years in Position <span class="req">*</span></label>
            <input
              type="number"
              v-model="form.yearsInPosition"
              :class="{ error: errors.yearsInPosition }"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="field-group">
            <label>Years in CSU <span class="req">*</span></label>
            <input
              type="number"
              v-model="form.yearsInCSU"
              :class="{ error: errors.yearsInCSU }"
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Supervisor -->
        <div class="field-grid field-grid-2" style="margin-bottom: 20px">
          <div class="field-group">
            <label>Immediate Supervisor Name <span class="req">*</span></label>
            <input
              type="text"
              v-model="form.supervisorName"
              :class="{ error: errors.supervisorName }"
              placeholder="e.g. Dr. Juan Dela Cruz"
            />
          </div>
          <div class="field-group">
            <label>Supervisor CarSU Email <span class="req">*</span></label>
            <input
              type="email"
              v-model="form.supervisorEmail"
              :class="{
                error: emailHints.supervisor.type === 'error',
                valid: emailHints.supervisor.type === 'success',
              }"
              placeholder="supervisor@carsu.edu.ph"
              @blur="validateEmail('supervisor')"
            />
            <small class="email-hint" :class="emailHints.supervisor.type">{{
              emailHints.supervisor.msg
            }}</small>
          </div>
        </div>

        <!-- Purpose -->
        <div class="field-group">
          <label>Purpose <span class="req">*</span></label>
          <div class="checkbox-group">
            <label
              v-for="option in purposeOptions"
              :key="option"
              class="checkbox-item"
              :class="{ checked: form.headerPurpose === option }"
            >
              <input
                type="radio"
                name="headerPurpose"
                :value="option"
                v-model="form.headerPurpose"
              />
              {{ option }}
            </label>
          </div>
          <div
            class="other-specify"
            :class="{ visible: form.headerPurpose === 'Other' }"
          >
            <input
              type="text"
              v-model="form.headerPurposeOther"
              placeholder="Please specify…"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── SECTION I: COMPETENCY ASSESSMENT ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">I</div>
        <div>
          <h3>Competency Assessment</h3>
          <p>Identify key competencies to develop</p>
        </div>
      </div>
      <div class="section-body">
        <div class="section-desc">
          Identify key competencies you need to develop based on your current or
          target role. For detailed descriptions and behavioral indicators,
          please refer to the
          <a href="https://tinyurl.com/CompetencyManualandModel" target="_blank"
            >Competency Manual and Model</a
          >.
        </div>

        <div class="field-group" style="margin-bottom: 20px">
          <label>Purpose <span class="req">*</span></label>
          <div class="checkbox-group">
            <label
              v-for="option in compPurposeOptions"
              :key="option.value"
              class="checkbox-item"
              :class="{ checked: form.compPurpose === option.value }"
            >
              <input
                type="radio"
                name="compPurpose"
                :value="option.value"
                v-model="form.compPurpose"
              />
              {{ option.label }}
            </label>
          </div>
          <div
            class="other-specify"
            :class="{ visible: form.compPurpose === 'Others' }"
          >
            <input
              type="text"
              v-model="form.compPurposeOther"
              placeholder="Please specify…"
            />
          </div>
        </div>

        <div class="table-wrapper">
          <table class="dynamic-table">
            <thead>
              <tr>
                <th style="width: 50px">No.</th>
                <th>Target Competency</th>
                <th style="width: 130px">Current Level</th>
                <th style="width: 130px">Required Level</th>
                <th>Suggested LeaD Interventions</th>
                <th>Resource / Support Needed</th>
                <th style="width: 120px">Target Timeline</th>
                <th style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in competencyRows" :key="idx">
                <td>
                  <input
                    type="text"
                    class="priority-num"
                    :value="idx + 1"
                    readonly
                  />
                </td>
                <td>
                  <textarea
                    rows="2"
                    v-model="row.targetCompetency"
                    placeholder=""
                  ></textarea>
                </td>
                <td>
                  <select v-model="row.currentLevel">
                    <option value="">Select…</option>
                    <option>Basic</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Expert</option>
                  </select>
                </td>
                <td>
                  <select v-model="row.requiredLevel">
                    <option value="">Select…</option>
                    <option>Basic</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Expert</option>
                  </select>
                </td>
                <td>
                  <textarea
                    rows="2"
                    v-model="row.leadInterventions"
                    placeholder=""
                  ></textarea>
                </td>
                <td>
                  <textarea
                    rows="2"
                    v-model="row.resourceSupport"
                    placeholder=""
                  ></textarea>
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.targetTimeline"
                    placeholder=""
                  />
                </td>
                <td>
                  <button
                    class="btn-remove-row"
                    @click="removeRow(competencyRows, idx)"
                    title="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-actions">
          <button class="btn-add-row" @click="addCompetencyRow">
            + Add Row
          </button>
        </div>
      </div>
    </div>

    <!-- ── SECTION II: AGAP ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">II</div>
        <div>
          <h3>Academic Growth and Advancement Program (AGAP)</h3>
          <p>Plans for academic advancement</p>
        </div>
      </div>
      <div class="section-body">
        <div class="section-desc">
          Outline your plans for academic advancement, such as enrolling in
          graduate or certification programs. Ensure alignment with your role
          and CSU's academic goals.
        </div>
        <div class="table-wrapper">
          <table class="dynamic-table">
            <thead>
              <tr>
                <th style="width: 50px">No.</th>
                <th>Degree Program</th>
                <th>Target HEI</th>
                <th style="width: 120px">Mode of Study</th>
                <th>Source of Funding</th>
                <th>Target Scholarship Grant</th>
                <th style="width: 120px">Target Timeline</th>
                <th style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in agapRows" :key="idx">
                <td>
                  <input
                    type="text"
                    class="priority-num"
                    :value="idx + 1"
                    readonly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.degreeProgram"
                    placeholder=""
                  />
                </td>
                <td>
                  <input type="text" v-model="row.targetHEI" placeholder="" />
                </td>
                <td>
                  <select v-model="row.modeOfStudy">
                    <option value="">Select…</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Online</option>
                    <option>Blended</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.sourceOfFunding"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.scholarshipGrant"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.targetTimeline"
                    placeholder=""
                  />
                </td>
                <td>
                  <button
                    class="btn-remove-row"
                    @click="removeRow(agapRows, idx)"
                    title="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-actions">
          <button class="btn-add-row" @click="addAgapRow">+ Add Row</button>
        </div>
      </div>
    </div>

    <!-- ── SECTION III: PRO-ACT ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">III</div>
        <div>
          <h3>
            Professional Advancement through Capacity-Building and Trainings
            (Pro-ACT)
          </h3>
          <p>Training and workshop interventions</p>
        </div>
      </div>
      <div class="section-body">
        <div class="section-desc">
          If a training intervention is identified in Part I (Competency
          Assessment), provide more detailed information here.
        </div>
        <div class="table-wrapper">
          <table class="dynamic-table">
            <thead>
              <tr>
                <th style="width: 50px">No.</th>
                <th>Training / Workshop Title</th>
                <th>Target Competency / Skill</th>
                <th style="width: 130px">Mode of Activity</th>
                <th>Source of Funding</th>
                <th>Trainer / Provider</th>
                <th style="width: 120px">Target Timeline</th>
                <th style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in proactRows" :key="idx">
                <td>
                  <input
                    type="text"
                    class="priority-num"
                    :value="idx + 1"
                    readonly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.trainingTitle"
                    placeholder=""
                  />
                </td>
                <td>
                  <input type="text" v-model="row.targetSkill" placeholder="" />
                </td>
                <td>
                  <select v-model="row.modeOfActivity">
                    <option value="">Select…</option>
                    <option>Face-to-face</option>
                    <option>Online</option>
                    <option>Blended</option>
                    <option>On-the-job</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.sourceOfFunding"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.trainerProvider"
                    placeholder=""
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.targetTimeline"
                    placeholder=""
                  />
                </td>
                <td>
                  <button
                    class="btn-remove-row"
                    @click="removeRow(proactRows, idx)"
                    title="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-actions">
          <button class="btn-add-row" @click="addProactRow">+ Add Row</button>
        </div>
      </div>
    </div>

    <!-- ── SUBMIT STAGE 1 ── -->
    <div class="submit-area">
      <p>
        By submitting, you confirm that all information provided is accurate.
        Your supervisor will be notified automatically.
      </p>
      <button class="btn-submit" :disabled="isSubmitting" @click="submitStage1">
        {{ isSubmitting ? "Submitting…" : "Submit IDP" }}
      </button>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════ -->
  <!-- STAGE 2: SUPERVISOR REVIEW                      -->
  <!-- ═══════════════════════════════════════════════ -->
  <div v-if="stage === 'stage2'" class="container">
    <!-- Title bar with ref ID -->
    <div
      style="
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 32px;
        border-bottom: 3px solid var(--navy);
      "
    >
      <h2
        style="
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: var(--navy);
          margin-bottom: 6px;
        "
      >
        Individual Development Plan (IDP)
      </h2>
      <p style="color: var(--text-light); font-size: 14px">
        Supervisor's Review — Read-only view of employee submission. Complete
        Section IV below.
      </p>
      <div
        style="
          margin-top: 12px;
          display: inline-block;
          background: var(--navy);
          color: var(--gold-light);
          font-family: monospace;
          font-size: 16px;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 8px;
          letter-spacing: 0.08em;
        "
      >
        {{ idpData.refId }}
      </div>
    </div>

    <!-- ── H: PERSONNEL INFO (READ-ONLY) ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">H</div>
        <div>
          <h3>Personnel Information</h3>
          <p>Employee-submitted details</p>
        </div>
        <div class="readonly-badge">Read-only</div>
      </div>
      <div class="section-body">
        <div class="ro-grid ro-grid-2" style="margin-bottom: 16px">
          <div class="ro-field">
            <div class="ro-label">Campus</div>
            <div class="ro-value">{{ idpData.campus || "—" }}</div>
          </div>
          <div class="ro-field">
            <div class="ro-label">Office Affiliation</div>
            <div class="ro-value">{{ idpData.officeAffiliation || "—" }}</div>
          </div>
          <div class="ro-field span-2">
            <div class="ro-label">College / Office / Unit</div>
            <div class="ro-value">{{ idpData.collegeOfficeUnit || "—" }}</div>
          </div>
          <div class="ro-field">
            <div class="ro-label">Name of Personnel</div>
            <div class="ro-value">{{ idpData.nameOfPersonnel || "—" }}</div>
          </div>
          <div class="ro-field">
            <div class="ro-label">Date Prepared</div>
            <div class="ro-value">{{ idpData.datePrepared || "—" }}</div>
          </div>
          <div class="ro-field">
            <div class="ro-label">Current Position / Designation</div>
            <div class="ro-value">{{ idpData.currentPosition || "—" }}</div>
          </div>
          <div class="ro-field">
            <div class="ro-label">Year Covered</div>
            <div class="ro-value">{{ idpData.yearCovered || "—" }}</div>
          </div>
          <div class="ro-field">
            <div class="ro-label">Years in Position</div>
            <div class="ro-value">{{ idpData.yearsInPosition || "—" }}</div>
          </div>
          <div class="ro-field">
            <div class="ro-label">Years in CSU</div>
            <div class="ro-value">{{ idpData.yearsInCSU || "—" }}</div>
          </div>
          <div class="ro-field">
            <div class="ro-label">Purpose</div>
            <div class="ro-value">{{ idpData.headerPurpose || "—" }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── I: COMPETENCY (READ-ONLY) ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">I</div>
        <div><h3>Competency Assessment</h3></div>
        <div class="readonly-badge">Read-only</div>
      </div>
      <div class="section-body">
        <div class="ro-field" style="margin-bottom: 16px">
          <div class="ro-label">Purpose</div>
          <div class="ro-value">{{ idpData.competencyPurpose || "—" }}</div>
        </div>
        <div class="ro-table-wrapper">
          <table class="ro-table">
            <thead>
              <tr>
                <th style="width: 50px">No.</th>
                <th>Target Competency</th>
                <th>Current Level</th>
                <th>Required Level</th>
                <th>Suggested LeaD Interventions</th>
                <th>Resource / Support Needed</th>
                <th>Target Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!idpData.competencyRows?.length">
                <td colspan="7" class="empty-row-cell">No entries provided.</td>
              </tr>
              <tr v-for="(row, idx) in idpData.competencyRows" :key="idx">
                <td>{{ row.priority || idx + 1 }}</td>
                <td>{{ row.targetCompetency || "—" }}</td>
                <td>{{ row.currentLevel || "—" }}</td>
                <td>{{ row.requiredLevel || "—" }}</td>
                <td>{{ row.leadInterventions || "—" }}</td>
                <td>{{ row.resourceSupport || "—" }}</td>
                <td>{{ row.targetTimeline || "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── II: AGAP (READ-ONLY) ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">II</div>
        <div><h3>Academic Growth and Advancement Program (AGAP)</h3></div>
        <div class="readonly-badge">Read-only</div>
      </div>
      <div class="section-body">
        <div class="ro-table-wrapper">
          <table class="ro-table">
            <thead>
              <tr>
                <th style="width: 50px">No.</th>
                <th>Degree Program</th>
                <th>Target HEI</th>
                <th>Mode of Study</th>
                <th>Source of Funding</th>
                <th>Target Scholarship Grant</th>
                <th>Target Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!idpData.agapRows?.length">
                <td colspan="7" class="empty-row-cell">No entries provided.</td>
              </tr>
              <tr v-for="(row, idx) in idpData.agapRows" :key="idx">
                <td>{{ row.priority || idx + 1 }}</td>
                <td>{{ row.degreeProgram || "—" }}</td>
                <td>{{ row.targetHEI || "—" }}</td>
                <td>{{ row.modeOfStudy || "—" }}</td>
                <td>{{ row.sourceOfFunding || "—" }}</td>
                <td>{{ row.scholarshipGrant || "—" }}</td>
                <td>{{ row.targetTimeline || "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── III: PRO-ACT (READ-ONLY) ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">III</div>
        <div>
          <h3>
            Professional Advancement through Capacity-Building and Trainings
            (Pro-ACT)
          </h3>
        </div>
        <div class="readonly-badge">Read-only</div>
      </div>
      <div class="section-body">
        <div class="ro-table-wrapper">
          <table class="ro-table">
            <thead>
              <tr>
                <th style="width: 50px">No.</th>
                <th>Training / Workshop Title</th>
                <th>Target Competency / Skill</th>
                <th>Mode of Activity</th>
                <th>Source of Funding</th>
                <th>Trainer / Provider</th>
                <th>Target Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!idpData.proactRows?.length">
                <td colspan="7" class="empty-row-cell">No entries provided.</td>
              </tr>
              <tr v-for="(row, idx) in idpData.proactRows" :key="idx">
                <td>{{ row.priority || idx + 1 }}</td>
                <td>{{ row.trainingTitle || "—" }}</td>
                <td>{{ row.targetSkill || "—" }}</td>
                <td>{{ row.modeOfActivity || "—" }}</td>
                <td>{{ row.sourceOfFunding || "—" }}</td>
                <td>{{ row.trainerProvider || "—" }}</td>
                <td>{{ row.targetTimeline || "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── IV: SUPERVISOR ASSESSMENT (FILLABLE) ── -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-num">IV</div>
        <div>
          <h3>Supervisor's Assessment and Endorsement</h3>
          <p>
            Complete all fields below — this section is for the supervisor only
          </p>
        </div>
      </div>
      <div class="section-body">
        <table class="assessment-table">
          <thead>
            <tr>
              <th style="width: 180px">Assessment Area</th>
              <th style="width: 240px">Guide Question</th>
              <th>Supervisor's Response</th>
            </tr>
          </thead>
          <tbody>
            <!-- 1. Performance Gaps -->
            <tr>
              <td class="area-label">1. Observed Performance Gaps</td>
              <td class="guide-q">
                Are there any gaps in the employee's current performance that
                may be addressed through training, coaching, or mentoring?
              </td>
              <td class="response-cell">
                <div class="checkbox-group" style="margin-bottom: 12px">
                  <label
                    class="checkbox-item"
                    :class="{ checked: assessment.perfGapsYN === 'Yes' }"
                  >
                    <input
                      type="radio"
                      name="perfGapsYN"
                      value="Yes"
                      v-model="assessment.perfGapsYN"
                    />
                    Yes
                  </label>
                  <label
                    class="checkbox-item"
                    :class="{ checked: assessment.perfGapsYN === 'No' }"
                  >
                    <input
                      type="radio"
                      name="perfGapsYN"
                      value="No"
                      v-model="assessment.perfGapsYN"
                    />
                    No
                  </label>
                </div>
                <div v-if="assessment.perfGapsYN === 'Yes'">
                  <label class="field-label">If Yes, specify:</label>
                  <textarea
                    v-model="assessment.perfGapsSpec"
                    rows="3"
                    placeholder="Describe the performance gaps…"
                  ></textarea>
                </div>
              </td>
            </tr>
            <!-- 2. Readiness -->
            <tr>
              <td class="area-label">2. Readiness for Advancement</td>
              <td class="guide-q">
                Based on your observation, is the employee ready for higher
                responsibilities or academic growth (e.g., scholarship,
                promotion readiness)?
              </td>
              <td class="response-cell">
                <div class="checkbox-group" style="margin-bottom: 12px">
                  <label
                    class="checkbox-item"
                    :class="{ checked: assessment.readinessYN === 'Yes' }"
                  >
                    <input
                      type="radio"
                      name="readinessYN"
                      value="Yes"
                      v-model="assessment.readinessYN"
                    />
                    Yes
                  </label>
                  <label
                    class="checkbox-item"
                    :class="{ checked: assessment.readinessYN === 'No' }"
                  >
                    <input
                      type="radio"
                      name="readinessYN"
                      value="No"
                      v-model="assessment.readinessYN"
                    />
                    No
                  </label>
                </div>
                <label class="field-label">Remarks:</label>
                <textarea
                  v-model="assessment.readinessRemarks"
                  rows="3"
                  placeholder="Your remarks on readiness…"
                ></textarea>
              </td>
            </tr>
            <!-- 3. Interventions -->
            <tr>
              <td class="area-label">3. Recommended L&amp;D Interventions</td>
              <td class="guide-q">
                What specific learning and development interventions do you
                recommend for this employee? <em>(Check all applicable)</em>
              </td>
              <td class="response-cell">
                <div class="checkbox-group">
                  <label
                    v-for="opt in interventionOptions"
                    :key="opt"
                    class="checkbox-item"
                    :class="{ checked: assessment.interventions.includes(opt) }"
                  >
                    <input
                      type="checkbox"
                      :value="opt"
                      v-model="assessment.interventions"
                    />
                    {{ opt }}
                  </label>
                </div>
                <div
                  class="other-specify"
                  :class="{
                    visible: assessment.interventions.includes('Others'),
                  }"
                >
                  <input
                    type="text"
                    v-model="assessment.interventionOther"
                    placeholder="Specify other intervention…"
                  />
                </div>
              </td>
            </tr>
            <!-- 4. Implementation Period -->
            <tr>
              <td class="area-label">4. Preferred Implementation Period</td>
              <td class="guide-q">
                When should the recommended interventions ideally be
                implemented?
              </td>
              <td class="response-cell">
                <div class="checkbox-group">
                  <label
                    v-for="opt in implOptions"
                    :key="opt"
                    class="checkbox-item"
                    :class="{
                      checked: assessment.implementationPeriod.includes(opt),
                    }"
                  >
                    <input
                      type="checkbox"
                      :value="opt"
                      v-model="assessment.implementationPeriod"
                    />
                    {{ opt }}
                  </label>
                </div>
              </td>
            </tr>
            <!-- 5. Additional Comments -->
            <tr>
              <td class="area-label">
                5. Additional Comments or Development Notes
              </td>
              <td class="guide-q">
                Any other suggestions or remarks to support the employee's
                development plan?
              </td>
              <td class="response-cell">
                <textarea
                  v-model="assessment.additionalComments"
                  rows="4"
                  placeholder="Your additional comments or development notes…"
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Certification block -->
        <div class="cert-block">
          <p>
            <em
              >I hereby certify that I have reviewed and assessed the Individual
              Development Plan (IDP) of the concerned personnel and confirm that
              the proposed goals and interventions are aligned with their role,
              performance needs, and the strategic direction of the office.</em
            >
          </p>
          <div class="sup-name">{{ idpData.supervisorName || "—" }}</div>
          <small>Signature over Printed Name of Immediate Supervisor</small>
        </div>
      </div>
    </div>

    <!-- ── SUBMIT STAGE 2 ── -->
    <div class="submit-area">
      <p>
        By submitting, you confirm that your assessment is complete and
        accurate. HR will be notified immediately.
      </p>
      <button class="btn-submit" :disabled="isSubmitting" @click="submitStage2">
        {{ isSubmitting ? "Submitting…" : "Submit Assessment" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

// ── NOTE FOR MIGRATION ──────────────────────────────────────────────────────
// APPS_SCRIPT_URL below is temporary for the current Google Sheets backend.
// When NestJS backend is ready, replace this with your API endpoint, e.g.:
//   const API_URL = '/api/idp'
// and update submitStage1() and submitStage2() to use axios calls instead.
// ────────────────────────────────────────────────────────────────────────────
const config = useRuntimeConfig();
const API = config.public.apiBase; // resolves to http://localhost:3001
// ── Stage control ──────────────────────────────────────────────────────────
// Possible values: 'stage1' | 'token' | 'stage2' | 'stage1-success' | 'stage2-success'
const stage = ref("stage1");

// ── Loading state ──────────────────────────────────────────────────────────
const isLoading = ref(false);
const isSubmitting = ref(false);
const loadingMsg = ref("Submitting your IDP, please wait…");

// ── Stage 1 form data ──────────────────────────────────────────────────────
const form = reactive({
  campus: "",
  officeAffiliation: "",
  collegeOfficeUnit: "",
  nameOfPersonnel: "",
  employeeEmail: "",
  datePrepared: "",
  currentPosition: "",
  yearCovered: "",
  yearsInPosition: "",
  yearsInCSU: "",
  supervisorName: "",
  supervisorEmail: "",
  headerPurpose: "",
  headerPurposeOther: "",
  compPurpose: "",
  compPurposeOther: "",
});

const errors = reactive({});
const emailHints = reactive({
  employee: { msg: "", type: "" },
  supervisor: { msg: "", type: "" },
});

// Dynamic table rows
const competencyRows = ref([
  {
    targetCompetency: "",
    currentLevel: "",
    requiredLevel: "",
    leadInterventions: "",
    resourceSupport: "",
    targetTimeline: "",
  },
]);
const agapRows = ref([
  {
    degreeProgram: "",
    targetHEI: "",
    modeOfStudy: "",
    sourceOfFunding: "",
    scholarshipGrant: "",
    targetTimeline: "",
  },
]);
const proactRows = ref([
  {
    trainingTitle: "",
    targetSkill: "",
    modeOfActivity: "",
    sourceOfFunding: "",
    trainerProvider: "",
    targetTimeline: "",
  },
]);

// Stage 1 result
const refId = ref("");

// ── Stage 2 state ──────────────────────────────────────────────────────────
const tokenInput = ref("");
const supervisorEmailInput = ref("");
const tokenError = ref("");
const currentToken = ref("");
const supervisorEmail = ref("");
const idpData = reactive({});

const assessment = reactive({
  perfGapsYN: "",
  perfGapsSpec: "",
  readinessYN: "",
  readinessRemarks: "",
  interventions: [],
  interventionOther: "",
  implementationPeriod: [],
  additionalComments: "",
});

// ── Static options ─────────────────────────────────────────────────────────
const campusOptions = ["CSU Main Campus", "CSU Cabadbaran City Campus"];
const officeOptions = [
  "OVPAF",
  "OVPAA",
  "OVPEO",
  "OVPSAS",
  "OVPRDIE",
  "Office of the Campus Director",
];
const purposeOptions = [
  "Initial Assessment",
  "Mid-Year Review",
  "Annual Review",
  "Other",
];
const compPurposeOptions = [
  {
    value: "To meet the competencies of my current position.",
    label: "Meet competencies of current position",
  },
  {
    value: "To increase the level of competencies of the current position.",
    label: "Increase level of current competencies",
  },
  {
    value: "To meet the competencies of the next higher position.",
    label: "Meet competencies of next higher position",
  },
  {
    value: "To acquire new competencies across different functions/positions.",
    label: "Acquire new competencies across functions",
  },
  { value: "Others", label: "Others" },
];
const interventionOptions = [
  "Technical Training",
  "Soft Skills",
  "Leadership Development",
  "Coaching/Mentoring",
  "Academic Advancement",
  "Job Rotation/Cross-training",
  "Others",
];
const implOptions = ["Q1", "Q2", "Q3", "Q4", "Within this year", "Next year"];

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  // Set today's date as default
  form.datePrepared = new Date().toISOString().split("T")[0];

  // Check if this is a supervisor link (token in URL)
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    tokenInput.value = token;
    tokenError.value = "Please enter your CarSU email address to continue.";
    stage.value = "token";
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────
function validateEmail(who) {
  const val = who === "employee" ? form.employeeEmail : form.supervisorEmail;
  const hint = emailHints[who];
  if (!val) {
    hint.msg = "";
    hint.type = "";
    return false;
  }
  if (!val.endsWith("@carsu.edu.ph")) {
    hint.msg = "Must be a @carsu.edu.ph email address.";
    hint.type = "error";
    return false;
  }
  hint.msg = "✓ Valid CarSU email";
  hint.type = "success";
  return true;
}

function addCompetencyRow() {
  competencyRows.value.push({
    targetCompetency: "",
    currentLevel: "",
    requiredLevel: "",
    leadInterventions: "",
    resourceSupport: "",
    targetTimeline: "",
  });
}
function addAgapRow() {
  agapRows.value.push({
    degreeProgram: "",
    targetHEI: "",
    modeOfStudy: "",
    sourceOfFunding: "",
    scholarshipGrant: "",
    targetTimeline: "",
  });
}
function addProactRow() {
  proactRows.value.push({
    trainingTitle: "",
    targetSkill: "",
    modeOfActivity: "",
    sourceOfFunding: "",
    trainerProvider: "",
    targetTimeline: "",
  });
}
function removeRow(arr, idx) {
  if (arr.length <= 1) return;
  arr.splice(idx, 1);
}

// ── Stage 1 validation ─────────────────────────────────────────────────────
function validateStage1() {
  let ok = true;
  const required = [
    "nameOfPersonnel",
    "datePrepared",
    "currentPosition",
    "yearCovered",
    "yearsInPosition",
    "yearsInCSU",
    "collegeOfficeUnit",
    "supervisorName",
  ];
  required.forEach((field) => {
    if (!form[field]?.toString().trim()) {
      errors[field] = true;
      ok = false;
    } else delete errors[field];
  });
  if (!validateEmail("employee")) ok = false;
  if (!validateEmail("supervisor")) ok = false;
  if (!form.campus) {
    alert("Please select a Campus.");
    ok = false;
  }
  if (!form.officeAffiliation) {
    alert("Please select an Office Affiliation.");
    ok = false;
  }
  if (!form.headerPurpose) {
    alert("Please select a Purpose.");
    ok = false;
  }
  if (!form.compPurpose) {
    alert("Please select a Competency Assessment Purpose.");
    ok = false;
  }
  return ok;
}

// ── Stage 1 submit ─────────────────────────────────────────────────────────
async function submitStage1() {
  if (!validateStage1()) return;

  let headerPurpose = form.headerPurpose;
  if (headerPurpose === "Other")
    headerPurpose = form.headerPurposeOther || "Other";

  let compPurpose = form.compPurpose;
  if (compPurpose === "Others") compPurpose = form.compPurposeOther || "Others";

  const payload = {
    action: "submitStage1",
    employeeEmail: form.employeeEmail,
    campus: form.campus,
    officeAffiliation: form.officeAffiliation,
    collegeOfficeUnit: form.collegeOfficeUnit,
    nameOfPersonnel: form.nameOfPersonnel,
    datePrepared: form.datePrepared,
    currentPosition: form.currentPosition,
    yearCovered: form.yearCovered,
    yearsInPosition: form.yearsInPosition,
    yearsInCSU: form.yearsInCSU,
    supervisorName: form.supervisorName,
    supervisorEmail: form.supervisorEmail,
    headerPurpose,
    competencyPurpose: compPurpose,
    competencyRows: competencyRows.value.map((r, i) => ({
      priority: i + 1,
      ...r,
    })),
    agapRows: agapRows.value.map((r, i) => ({ priority: i + 1, ...r })),
    proactRows: proactRows.value.map((r, i) => ({ priority: i + 1, ...r })),
  };

  isLoading.value = true;
  loadingMsg.value = "Submitting your IDP, please wait…";
  isSubmitting.value = true;

  try {
    const res = await fetch(`${API}/api/idp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.refId) {
      supervisorToken.value = data.refId; // show this token to the employee
      screen.value = "stage1-success";
    } else {
      alert("Submission failed: " + data.error);
    }
  } catch {
    alert("Network error. Please try again.");
  } finally {
    isLoading.value = false;
    isSubmitting.value = false;
  }
}

// ── Stage 2: load by token ─────────────────────────────────────────────────
function loadByToken() {
  if (!tokenInput.value.trim()) {
    alert("Please enter your token.");
    return;
  }
  if (!supervisorEmailInput.value.trim()) {
    alert("Please enter your CarSU email address.");
    return;
  }
  supervisorEmail.value = supervisorEmailInput.value.trim();
  currentToken.value = tokenInput.value.trim();
  tokenError.value = "";
  loadSubmission(currentToken.value);
}

async function loadSubmission(token) {
  if (!supervisorEmail.value) {
    tokenError.value = "Please enter your CarSU email address to continue.";
    stage.value = "token";
    return;
  }
  isLoading.value = true;
  loadingMsg.value = "Loading IDP submission…";

  try {
    // Token verification: new API endpoint
    const res = await fetch(`${API}/api/idp/${token}`);
    const data = await res.json();
    if (data.refId) {
      idpData.value = data;
      stage.value = "stage2";
    } else {
      alert("Token not found.");
      stage.value = "token";
    }
  } catch {
    alert("Network error. Please try again.");
  } finally {
    isLoading.value = false;
  }
}

// ── Stage 2 submit ─────────────────────────────────────────────────────────
async function submitStage2() {
  if (!assessment.perfGapsYN) {
    alert("Please indicate if there are performance gaps.");
    return;
  }
  if (!assessment.readinessYN) {
    alert("Please indicate readiness for advancement.");
    return;
  }

  let interventions = [...assessment.interventions];
  if (interventions.includes("Others")) {
    interventions = interventions.filter((v) => v !== "Others");
    if (assessment.interventionOther.trim())
      interventions.push("Others: " + assessment.interventionOther.trim());
  }

  isLoading.value = true;
  loadingMsg.value = "Submitting your assessment…";
  isSubmitting.value = true;

  try {
    // Supervisor submit: new API endpoint
    const res = await fetch(`${API}/api/idp/${idpData.value.refId}/supervisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    });
    const data = await res.json();
    if (data.success) {
      stage.value = "stage2-success";
    } else {
      alert("Submission failed: " + data.error);
    }
  } catch {
    alert("Network error. Please try again.");
  } finally {
    isLoading.value = false;
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* ── CSS Variables ── */
:root {
  --navy: #1a4d2e;
  --navy-mid: #2d6a3f;
  --gold: #f5c300;
  --gold-light: #ffd740;
  --cream: #faf8f4;
  --white: #ffffff;
  --text: #1a1a2e;
  --text-light: #5a6070;
  --border: #d8d4c8;
  --error: #c0392b;
  --success: #1a6b3c;
  --input-bg: #f8f7f4;
  --readonly-bg: #f0ede8;
  --shadow: 0 4px 24px rgba(26, 77, 46, 0.1);
  --shadow-sm: 0 2px 8px rgba(26, 77, 46, 0.07);
}

/* ── Base ── */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Header ── */
.site-header {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid var(--navy);
}
.header-inner {
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.header-img {
  width: auto;
  max-width: 700px;
  height: auto;
  display: block;
  object-fit: contain;
}

/* ── Page Nav ── */
.page-nav {
  background: var(--navy);
  padding: 0 28px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.page-nav a.back-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 10px 0;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 500;
  font-family: "Source Sans 3", sans-serif;
  letter-spacing: 0.02em;
  transition: color 0.2s;
  position: relative;
}
.page-nav a.back-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}
.page-nav a.back-link:hover {
  color: #fff;
}
.page-nav a.back-link:hover::after {
  transform: scaleX(1);
}
.page-nav a.back-link svg {
  width: 13px;
  height: 13px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.8;
  transition: transform 0.2s, opacity 0.2s;
}
.page-nav a.back-link:hover svg {
  transform: translateX(-3px);
  opacity: 1;
}
.page-nav .nav-sep {
  color: rgba(255, 255, 255, 0.25);
  font-size: 13px;
  margin: 0 10px;
  user-select: none;
}
.page-nav .nav-current {
  font-size: 12.5px;
  color: var(--gold);
  font-weight: 600;
  font-family: "Source Sans 3", sans-serif;
  letter-spacing: 0.03em;
}

/* ── Container ── */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 48px 40px 80px;
}

/* ── Form title ── */
.form-title-block {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--gold);
}
.form-title-block h2 {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: var(--navy);
  margin-bottom: 6px;
}
.form-title-block p {
  color: var(--text-light);
  font-size: 14px;
}

/* ── Section card ── */
.section-card {
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 28px;
  overflow: hidden;
  border: 1px solid var(--border);
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.section-header {
  background: var(--navy);
  padding: 16px 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-num {
  background: var(--gold);
  color: var(--navy);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}
.section-header h3 {
  color: var(--white);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
}
.section-header p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-top: 1px;
}
.section-body {
  padding: 36px;
}
.readonly-badge {
  margin-left: auto;
  background: rgba(245, 195, 0, 0.2);
  color: var(--gold-light);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ── Form fields ── */
.field-grid {
  display: grid;
  gap: 18px;
}
.field-grid-2 {
  grid-template-columns: 1fr 1fr;
}
.field-grid-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group.span-2 {
  grid-column: span 2;
}
label {
  font-size: 12px;
  font-weight: 600;
  color: var(--navy-mid);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
label .req {
  color: var(--error);
  margin-left: 2px;
}
input[type="text"],
input[type="email"],
input[type="date"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  font-family: "Source Sans 3", sans-serif;
  font-size: 14px;
  color: var(--text);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
select {
  width: 220px;
  min-width: 160px;
  max-width: 100%;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 12px;
}
input:focus,
select:focus,
textarea:focus {
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(26, 77, 46, 0.08);
  background: var(--white);
}
input.error,
select.error {
  border-color: var(--error);
}
input.valid {
  border-color: var(--success);
}
textarea {
  resize: vertical;
  min-height: 80px;
}

/* ── Email hint ── */
.email-hint {
  font-size: 12px;
  margin-top: 2px;
  min-height: 16px;
  display: block;
}
.email-hint.error {
  color: var(--error);
}
.email-hint.success {
  color: var(--success);
}

/* ── Checkbox groups ── */
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  transition: all 0.2s;
  font-size: 13px;
}
.checkbox-item:hover {
  border-color: var(--navy);
  background: var(--white);
}
.checkbox-item input[type="checkbox"],
.checkbox-item input[type="radio"] {
  width: auto;
  padding: 0;
  border: none;
  background: none;
  accent-color: var(--navy);
  cursor: pointer;
}
.checkbox-item.checked {
  border-color: var(--navy);
  background: rgba(26, 77, 46, 0.05);
}

/* ── Other specify ── */
.other-specify {
  margin-top: 10px;
  display: none;
}
.other-specify.visible {
  display: block;
}

/* ── Dynamic tables ── */
.table-wrapper {
  overflow-x: auto;
  margin-top: 16px;
}
.dynamic-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  min-width: 700px;
}
.dynamic-table thead tr {
  background: var(--navy-mid);
}
.dynamic-table thead th {
  padding: 10px 12px;
  color: var(--white);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
.dynamic-table thead th:last-child {
  border-right: none;
}
.dynamic-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.dynamic-table tbody tr:hover {
  background: #f5f4f0;
}
.dynamic-table tbody td {
  padding: 8px 10px;
  vertical-align: top;
  border-right: 1px solid var(--border);
}
.dynamic-table tbody td:last-child {
  border-right: none;
  text-align: center;
}
.dynamic-table td input,
.dynamic-table td select,
.dynamic-table td textarea {
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 6px;
}
.priority-num {
  width: 36px;
  text-align: center;
  font-weight: 600;
  color: var(--navy);
  background: rgba(245, 195, 0, 0.15);
  border-color: var(--gold);
}
.table-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.btn-add-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--navy);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: "Source Sans 3", sans-serif;
}
.btn-add-row:hover {
  background: var(--navy-mid);
}
.btn-remove-row {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--error);
  padding: 4px;
  border-radius: 4px;
  font-size: 18px;
  line-height: 1;
  transition: background 0.15s;
}
.btn-remove-row:hover {
  background: rgba(192, 57, 43, 0.08);
}

/* ── Section desc ── */
.section-desc {
  background: rgba(245, 195, 0, 0.1);
  border-left: 3px solid var(--gold);
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.6;
}
.section-desc a {
  color: var(--navy);
}

/* ── Submit area ── */
.submit-area {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 36px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.submit-area p {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 18px;
}
.btn-submit {
  padding: 14px 48px;
  background: var(--navy);
  color: var(--white);
  border: none;
  border-radius: 10px;
  font-family: "Source Sans 3", sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(26, 77, 46, 0.2);
}
.btn-submit:hover {
  background: var(--navy-mid);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(26, 77, 46, 0.25);
}
.btn-submit:active {
  transform: translateY(0);
}
.btn-submit:disabled {
  background: #aaa;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ── Loading overlay ── */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(13, 27, 62, 0.6);
  z-index: 999;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
}
.overlay.active {
  display: flex;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.overlay p {
  color: var(--white);
  font-size: 15px;
}

/* ── Success screen ── */
.success-screen {
  max-width: 560px;
  margin: 80px auto;
  text-align: center;
  background: var(--white);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.success-icon {
  width: 72px;
  height: 72px;
  background: rgba(26, 107, 60, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 24px;
}
.success-screen h2 {
  font-family: "Playfair Display", serif;
  font-size: 24px;
  color: var(--navy);
  margin-bottom: 12px;
}
.success-screen p {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 20px;
}
.ref-id-box {
  background: var(--navy);
  color: var(--gold-light);
  font-family: monospace;
  font-size: 22px;
  font-weight: 700;
  padding: 16px 24px;
  border-radius: 10px;
  letter-spacing: 0.1em;
  margin: 16px 0 24px;
}
.btn-return {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding: 11px 24px;
  background: rgba(26, 77, 46, 0.08);
  color: var(--navy);
  border: 1.5px solid rgba(26, 77, 46, 0.2);
  border-radius: 9px;
  font-family: "Source Sans 3", sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-return:hover {
  background: var(--navy);
  color: #fff;
}

/* ── Token screen ── */
.token-screen {
  max-width: 480px;
  margin: 80px auto;
  background: var(--white);
  border-radius: 16px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.token-screen h2 {
  font-family: "Playfair Display", serif;
  font-size: 24px;
  color: var(--navy);
  margin-bottom: 10px;
}
.token-screen p {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 24px;
}
.btn-load {
  width: 100%;
  padding: 13px;
  background: var(--navy);
  color: var(--white);
  border: none;
  border-radius: 10px;
  font-family: "Source Sans 3", sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-load:hover {
  background: var(--navy-mid);
}
.token-error {
  color: var(--error);
  font-size: 13px;
  margin-top: 10px;
}

/* ── Read-only fields (Stage 2) ── */
.ro-grid {
  display: grid;
  gap: 16px;
}
.ro-grid-2 {
  grid-template-columns: 1fr 1fr;
}
.ro-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ro-field.span-2 {
  grid-column: span 2;
}
.ro-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ro-value {
  background: var(--readonly-bg);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text);
  min-height: 40px;
}
.ro-table-wrapper {
  overflow-x: auto;
  margin-top: 16px;
}
.ro-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  min-width: 600px;
}
.ro-table thead tr {
  background: var(--navy-mid);
}
.ro-table thead th {
  padding: 10px 12px;
  color: var(--white);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
.ro-table thead th:last-child {
  border-right: none;
}
.ro-table tbody tr {
  border-bottom: 1px solid var(--border);
}
.ro-table tbody tr:nth-child(even) {
  background: #f9f8f5;
}
.ro-table tbody td {
  padding: 10px 12px;
  vertical-align: top;
  border-right: 1px solid var(--border);
  font-size: 13px;
}
.ro-table tbody td:last-child {
  border-right: none;
}
.empty-row-cell {
  text-align: center;
  color: var(--text-light);
  font-style: italic;
}

/* ── Assessment table (Stage 2) ── */
.assessment-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}
.assessment-table th,
.assessment-table td {
  border: 1.5px solid var(--border);
  padding: 14px 16px;
  vertical-align: top;
}
.assessment-table thead th {
  background: var(--navy);
  color: var(--white);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.area-label {
  font-weight: 600;
  color: var(--navy-mid);
  font-size: 13px;
  min-width: 160px;
}
.guide-q {
  color: var(--text-light);
  font-size: 13px;
  min-width: 220px;
}
.response-cell {
  min-width: 260px;
}
.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--navy-mid);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Certification block ── */
.cert-block {
  background: rgba(245, 195, 0, 0.08);
  border: 1.5px solid var(--gold);
  border-radius: 10px;
  padding: 20px 24px;
  margin-top: 24px;
}
.cert-block p {
  font-size: 13px;
  color: var(--text-light);
  font-style: italic;
  margin-bottom: 16px;
}
.sup-name {
  font-weight: 600;
  color: var(--navy);
  font-size: 16px;
  padding: 12px 0;
  border-bottom: 2px solid var(--navy);
  display: inline-block;
  min-width: 300px;
  font-family: "Playfair Display", serif;
}
.cert-block small {
  font-size: 11px;
  color: var(--text-light);
  display: block;
  margin-top: 4px;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .container {
    padding: 24px 16px 60px;
  }
  .field-grid-2,
  .field-grid-3 {
    grid-template-columns: 1fr;
  }
  .field-group.span-2 {
    grid-column: span 1;
  }
  .section-body {
    padding: 24px 20px;
  }
  .header-inner {
    padding: 8px 16px;
  }
  .page-nav {
    padding: 0 16px;
  }
  .page-nav .nav-current,
  .page-nav .nav-sep {
    display: none;
  }
  .ro-grid-2 {
    grid-template-columns: 1fr;
  }
  .ro-field.span-2 {
    grid-column: span 1;
  }
  .token-screen {
    margin: 40px 16px;
    padding: 32px 20px;
  }
}
</style>
