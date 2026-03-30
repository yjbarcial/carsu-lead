<template>
  <!-- ═══════════════════════════════════════════════ -->
  <!-- DATA PRIVACY NOTICE MODAL                       -->
  <!-- ═══════════════════════════════════════════════ -->
  <div v-if="showPrivacyModal" class="privacy-overlay">
    <div class="privacy-modal">
      <div class="privacy-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <h2>Data Privacy Notice</h2>
      </div>
      <div class="privacy-body">
        <p>
          In compliance with the <strong>Data Privacy Act of 2012 (R.A. 10173)</strong>,
          Caraga State University informs you that the personal information you provide
          in this <strong>Individual Development Plan (IDP)</strong> form will be collected
          and processed for the following purposes:
        </p>
        <ul>
          <li>Assessment of your learning and development needs</li>
          <li>Planning and delivery of training interventions</li>
          <li>Human resource management and reporting</li>
          <li>Generation of official IDP documents shared with your supervisor and HR</li>
        </ul>
        <p>
          Your information will be stored securely and accessed only by authorized
          Caraga State University, Human Resource and Management Services (Learning and Development) personnel. It will not be disclosed to third parties without
          your consent, except as required by law.
        </p>
        <p>
          You have the right to access, correct, or request deletion of your data.
          For concerns, contact the Caraga State University HRMS at <strong>yjbarcial@carsu.edu.ph</strong>.
        </p>
        <label class="privacy-checkbox">
          <input type="checkbox" v-model="privacyAgreed" />
          <span>I have read and understood this notice, and I consent to the collection and processing of my personal data.</span>
        </label>
      </div>
      <div class="privacy-footer">
        <a href="/" class="btn-privacy-decline">Decline</a>
        <button class="btn-privacy-agree" :disabled="!privacyAgreed" @click="acceptPrivacy">
          Agree &amp; Continue
        </button>
      </div>
    </div>
  </div>

  <!-- Loading overlay -->
  <div class="overlay" :class="{ active: isLoading }">
    <div class="spinner"></div>
    <p>{{ loadingMsg }}</p>
  </div>
  
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
 
        <!-- Campus — static display only -->
        <div class="field-group" style="margin-bottom: 20px">
          <label>Campus</label>
          <div class="static-value">CSU Main Campus</div>
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
 
        <!-- College / Office / Unit -->
        <div class="field-grid field-grid-2" style="margin-bottom: 18px">
          <div class="field-group span-2">
            <label>College / Office / Unit <span class="req">*</span></label>
            <select
              v-if="collegeOfficeUnitOptions.length > 0"
              v-model="form.collegeOfficeUnit"
              :class="{ error: errors.collegeOfficeUnit }"
            >
              <option value="">Select office / unit…</option>
              <option v-for="opt in collegeOfficeUnitOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <input
              v-else
              type="text"
              v-model="form.collegeOfficeUnit"
              :class="{ error: errors.collegeOfficeUnit }"
              placeholder="Type your college / office / unit"
            />
          </div>
          <!-- Program selector — only for OVPAA colleges with programs -->
          <div v-if="isOVPAA && selectedCollegePrograms.length > 0" class="field-group span-2" style="margin-top: 4px">
            <label>Program / Department <span class="req">*</span></label>
            <select v-model="form.collegeProgram" :class="{ error: errors.collegeProgram }">
              <option value="">Select program…</option>
              <option v-for="p in selectedCollegePrograms" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </div>
 
        <!-- Name of Personnel -->
        <div class="field-group" style="margin-bottom: 18px">
          <label>Name of Personnel <span class="req">*</span></label>
          <div class="name-grid">
            <div>
              <input type="text" v-model="form.lastName" :class="{ error: errors.lastName }" placeholder="Last Name" />
              <small class="field-hint">Last Name</small>
            </div>
            <div>
              <input type="text" v-model="form.firstName" :class="{ error: errors.firstName }" placeholder="First Name" />
              <small class="field-hint">First Name</small>
            </div>
            <div class="mi-col">
              <input type="text" v-model="form.middleInitial" :class="{ error: errors.middleInitial }" placeholder="M.I." maxlength="3" />
              <small class="field-hint">M.I.</small>
            </div>
          </div>
        </div>
 
        <div class="field-grid field-grid-2" style="margin-bottom: 18px">
 
          <!-- Employee Email -->
          <div class="field-group">
            <label>Your CarSU Email Address <span class="req">*</span></label>
            <div class="email-prefix-wrapper" :class="{ error: emailHints.employee.type === 'error', valid: emailHints.employee.type === 'success' }">
              <input
                type="text"
                v-model="form.employeeEmailPrefix"
                class="email-prefix-input"
                placeholder="yourname"
                @blur="validateEmail('employee')"
              />
              <span class="email-suffix">@carsu.edu.ph</span>
            </div>
            <small class="email-hint" :class="emailHints.employee.type">{{ emailHints.employee.msg }}</small>
          </div>
 
          <!-- Date Prepared -->
          <div class="field-group">
            <label>Date Prepared <span class="req">*</span></label>
            <input type="date" v-model="form.datePrepared" :class="{ error: errors.datePrepared }" />
          </div>
 
          <!-- Educational Attainment -->
          <div class="field-group span-2">
            <label>Highest Educational Attainment <span class="req">*</span></label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <select v-model="form.educAttainment" :class="{ error: errors.educAttainment }">
                <option value="">Select…</option>
                <option>Bachelor's Degree</option>
                <option>Post-Baccalaureate Certificate</option>
                <option>Master's Degree</option>
                <option>Post-Master's Certificate</option>
                <option>Doctorate Degree (Ph.D. / Ed.D. / etc.)</option>
                <option>Post-Doctoral</option>
              </select>
              <input
                type="text"
                v-model="form.educAttainmentSpec"
                :class="{ error: errors.educAttainmentSpec }"
                placeholder="Specify degree / program (e.g. BS Computer Science)"
              />
            </div>
          </div>
 
          <!-- Current Position / Designation -->
          <div class="field-group span-2">
            <label>Current Position / Designation <span class="req">*</span></label>

            <!-- OVPAA: show Personnel Type selector + filtered position dropdown -->
            <div v-if="form.officeAffiliation === 'OVPAA'" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <small class="field-hint" style="margin-bottom:4px;display:block;">Personnel Type</small>
                <select v-model="form.personnelType" :class="{ error: errors.personnelType }" @change="form.currentPosition = ''">
                  <option value="">Select type…</option>
                  <option value="administrative">Administrative Personnel</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div>
                <small class="field-hint" style="margin-bottom:4px;display:block;">Position / Designation</small>
                <select v-model="form.currentPosition" :class="{ error: errors.currentPosition }" :disabled="!form.personnelType">
                  <option value="">Select position…</option>
                  <template v-if="form.personnelType === 'administrative'">
                    <option>Admin Aide I – Utility</option>
                    <option>Admin Aide I – Clerk</option>
                    <option>Admin Aide II – Utility</option>
                    <option>Admin Aide II – Clerk</option>
                    <option>Admin Aide III – Clerk</option>
                    <option>Admin Aide IV – Mechanic</option>
                    <option>Admin Aide IV – Clerk</option>
                    <option>Admin Aide IV – Driver</option>
                    <option>Security Guard I</option>
                    <option>Farm Worker I</option>
                    <option>Admin Assistant I</option>
                    <option>Admin Assistant II</option>
                    <option>Admin Assistant III</option>
                    <option>Admin Assistant IV</option>
                    <option>Admin Officer I</option>
                    <option>Admin Officer II</option>
                    <option>Admin Officer III</option>
                    <option>Admin Officer IV</option>
                    <option>Admin Officer V</option>
                    <option>Accountant III</option>
                    <option>College Librarian I</option>
                    <option>College Librarian III</option>
                    <option>Nurse I</option>
                    <option>Nurse II</option>
                    <option>Registrar III</option>
                    <option>Chief Administrative Officer (CAO)</option>
                    <option>Board Secretary V</option>
                    <option>Guidance Counselor III</option>
                    <option>Programmer II</option>
                    <option>Database Administrator</option>
                    <option>System Analyst</option>
                    <option>Planning Officer</option>
                    <option>Attorney II</option>
                    <option>Attorney III</option>
                    <option>Physician</option>
                    <option>Procurement Officer</option>
                    <option>Director</option>
                  </template>
                  <template v-if="form.personnelType === 'faculty'">
                    <option>Instructor I</option>
                    <option>Instructor II</option>
                    <option>Instructor III</option>
                    <option>Assistant Professor I</option>
                    <option>Assistant Professor II</option>
                    <option>Assistant Professor III</option>
                    <option>Assistant Professor IV</option>
                    <option>Associate Professor I</option>
                    <option>Associate Professor II</option>
                    <option>Associate Professor III</option>
                    <option>Associate Professor IV</option>
                    <option>Associate Professor V</option>
                    <option>Associate Professor VI</option>
                    <option>Professor I</option>
                    <option>Professor II</option>
                    <option>Professor III</option>
                    <option>Professor IV</option>
                    <option>Professor V</option>
                    <option>Professor VI</option>
                    <option>University Professor</option>
                  </template>
                </select>
              </div>
            </div>

            <!-- OVPAF / OVPEO / OVPSAS / OVPRDIE: no Personnel Type, just position dropdown -->
            <div v-else-if="['OVPAF','OVPEO','OVPSAS','OVPRDIE'].includes(form.officeAffiliation)">
              <select v-model="form.currentPosition" :class="{ error: errors.currentPosition }" style="max-width: 480px; width: 100%;">
                <option value="">Select position…</option>
                <option>Admin Aide I – Utility</option>
                <option>Admin Aide I – Clerk</option>
                <option>Admin Aide II – Utility</option>
                <option>Admin Aide II – Clerk</option>
                <option>Admin Aide III – Clerk</option>
                <option>Admin Aide IV – Mechanic</option>
                <option>Admin Aide IV – Clerk</option>
                <option>Admin Aide IV – Driver</option>
                <option>Security Guard I</option>
                <option>Farm Worker I</option>
                <option>Admin Assistant I</option>
                <option>Admin Assistant II</option>
                <option>Admin Assistant III</option>
                <option>Admin Assistant IV</option>
                <option>Admin Officer I</option>
                <option>Admin Officer II</option>
                <option>Admin Officer III</option>
                <option>Admin Officer IV</option>
                <option>Admin Officer V</option>
                <option>Accountant III</option>
                <option>College Librarian I</option>
                <option>College Librarian III</option>
                <option>Nurse I</option>
                <option>Nurse II</option>
                <option>Registrar III</option>
                <option>Chief Administrative Officer (CAO)</option>
                <option>Board Secretary V</option>
                <option>Guidance Counselor III</option>
                <option>Programmer II</option>
                <option>Database Administrator</option>
                <option>System Analyst</option>
                <option>Planning Officer</option>
                <option>Attorney II</option>
                <option>Attorney III</option>
                <option>Physician</option>
                <option>Procurement Officer</option>
                <option>Director</option>
              </select>
            </div>

            <!-- No office selected yet -->
            <div v-else>
              <select disabled style="max-width: 480px; width: 100%;">
                <option value="">Select office affiliation first…</option>
              </select>
            </div>
          </div>
 
          <!-- Years in Position -->
          <div class="field-group">
            <label>Years in Position <span class="req">*</span></label>
            <input type="number" v-model="form.yearsInPosition" :class="{ error: errors.yearsInPosition }" min="0" placeholder="0" />
          </div>
 
          <!-- Years in CSU -->
          <div class="field-group">
            <label>Years in CSU <span class="req">*</span></label>
            <input type="number" v-model="form.yearsInCSU" :class="{ error: errors.yearsInCSU }" min="0" placeholder="0" />
          </div>
 
          <!-- Supervisor Name -->
          <div class="field-group">
            <label>Immediate Supervisor Name <span class="req">*</span></label>
            <input type="text" v-model="form.supervisorName" :class="{ error: errors.supervisorName }" placeholder="e.g. Dela Cruz, Juan D." />
            <small class="field-hint">Format: Last name, First name, M.I.</small>
          </div>
 
          <!-- Supervisor Email -->
          <div class="field-group">
            <label>Supervisor CarSU Email <span class="req">*</span></label>
            <div class="email-prefix-wrapper" :class="{ error: emailHints.supervisor.type === 'error', valid: emailHints.supervisor.type === 'success' }">
              <input
                type="text"
                v-model="form.supervisorEmailPrefix"
                class="email-prefix-input"
                placeholder="supervisor"
                @blur="validateEmail('supervisor')"
              />
              <span class="email-suffix">@carsu.edu.ph</span>
            </div>
            <small class="email-hint" :class="emailHints.supervisor.type">{{ emailHints.supervisor.msg }}</small>
          </div>
 
          <!-- Purpose -->
          <div class="field-group span-2">
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
            <div class="other-specify" :class="{ visible: form.headerPurpose === 'Other' }">
              <input type="text" v-model="form.headerPurposeOther" placeholder="Please specify…" />
            </div>
          </div>
 
        </div>
      </div>
    </div>
 
    <!-- ── SECTION I: COMPETENCY ASSESSMENT ── -->
    <div class="section-card section-card-collapsible">
      <div class="section-header">
        <div class="section-num">I</div>
        <div>
          <h3>Competency Assessment</h3>
          <p>Identify key competencies to develop</p>
        </div>
        <div v-if="!form.headerPurpose" class="section-locked-badge">Complete Section H first</div>
      </div>
      <transition name="reveal">
      <div v-if="form.headerPurpose" class="section-body">
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
                <th style="width: 40px">No.</th>
                <th style="min-width:180px">Target Competency</th>
                <th style="width: 150px">Current Level</th>
                <th style="width: 150px">Required Level</th>
                <th>Suggested LeaD Interventions</th>
                <th style="width: 120px">Target Timeline</th>
                <th style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in competencyRows" :key="idx">
                <td class="row-num-cell">{{ idx + 1 }}</td>
                <td>
                  <select v-model="row.targetCompetency" @change="row.competencyGroup = getCompetencyCluster(row.targetCompetency); row.requiredLevel = getRequiredLevel(row.targetCompetency, form.currentPosition)">
                    <option value="">Select…</option>
                    <template v-for="cluster in availableClusters" :key="cluster">
                      <optgroup :label="cluster">
                        <option v-for="c in allCompetencies[cluster]" :key="c" :value="c">{{ c }}</option>
                      </optgroup>
                    </template>
                  </select>
                </td>
                <td>
                  <select v-model="row.currentLevel">
                    <option value="">Select…</option>
                    <option value="1 - Basic">1 - Basic</option>
                    <option value="2 - Intermediate">2 - Intermediate</option>
                    <option value="3 - Advanced">3 - Advanced</option>
                    <option value="4 - Expert">4 - Expert</option>
                  </select>
                </td>
                <td>
                  <template v-if="form.currentPosition === 'Director'">
                    <select v-model="row.requiredLevel" style="min-width: 130px">
                      <option value="">Select…</option>
                      <option value="1 - Basic">1 - Basic</option>
                      <option value="2 - Intermediate">2 - Intermediate</option>
                      <option value="3 - Advanced">3 - Advanced</option>
                      <option value="4 - Expert">4 - Expert</option>
                    </select>
                  </template>
                  <template v-else>
                    <div v-if="row.requiredLevel" class="required-level-badge">{{ row.requiredLevel }}</div>
                    <div v-else class="required-level-empty">Auto-set</div>
                  </template>
                </td>
                <td>
                  <select v-model="row.leadInterventions" style="min-width:200px">
                    <option value="">Select…</option>
                    <optgroup label="On-the-Job Learning">
                      <option>Observation / Demonstration</option>
                      <option>Delegation</option>
                      <option>Coaching</option>
                      <option>Mentoring</option>
                      <option>Deployment</option>
                      <option>Job Rotation / Assignment</option>
                      <option>Detail and Secondment</option>
                      <option>Reading</option>
                      <option>Flexible Learning</option>
                      <option>Brainstorming / Group Discussion</option>
                      <option>Experiential Learning</option>
                    </optgroup>
                    <optgroup label="Off-the-Job Learning">
                      <option>Special Short Courses and Lectures</option>
                      <option>Conferences, Training Programs, Conventions, Seminars, and Cum Paper Presentations</option>
                      <option>Pursue Higher Education</option>
                    </optgroup>
                  </select>
                </td>
                <td>
                  <select v-model="row.targetTimeline">
                    <option value="">Select…</option>
                    <option>2026-2027</option>
                    <option>2027-2028</option>
                    <option>2028-2029</option>
                  </select>
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
      </transition>
    </div>
 
    <!-- ── SECTION II: AGAP ── -->
    <div class="section-card section-card-collapsible">
      <div class="section-header">
        <div class="section-num">II</div>
        <div>
          <h3>Academic Growth and Advancement Program (AGAP)</h3>
          <p>Plans for academic advancement</p>
        </div>
        <div v-if="!sectionIComplete" class="section-locked-badge">Complete Section I first</div>
      </div>
      <transition name="reveal">
      <div v-if="sectionIComplete" class="section-body">
        <div class="section-desc">
          Outline your plans for academic advancement, such as enrolling in
          graduate or certification programs. Ensure alignment with your role
          and CSU's academic goals.
        </div>
        <div class="table-wrapper">
          <table class="dynamic-table">
            <thead>
              <tr>
                <th style="width: 40px">No.</th>
                <th>Degree Program</th>
                <th style="min-width: 200px">Target HEI</th>
                <th style="width: 90px">Mode of Study</th>
                <th style="min-width: 180px">Target Scholarship Grant</th>
                <th style="width: 130px">Intended Year of Enrollment</th>
                <th style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in agapRows" :key="idx">
                <td class="row-num-cell">{{ idx + 1 }}</td>
                <td>
                  <select v-model="row.degreeProgram">
                    <option value="">Select…</option>
                    <option>Post-Baccalaureate Certificate</option>
                    <option>Master's Degree</option>
                    <option>Post-Master's Certificate</option>
                    <option>Doctorate Degree (Ph.D. / Ed.D. / etc.)</option>
                    <option>Post-Doctoral</option>
                  </select>
                </td>
                <td>
                  <input type="text" v-model="row.targetHEI" placeholder="Full name of School" />
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
                  <input type="text" v-model="row.scholarshipGrant" placeholder="" />
                </td>
                <td>
                  <select v-model="row.targetTimeline">
                    <option value="">Select…</option>
                    <option>2026</option>
                    <option>2027</option>
                    <option>2028</option>
                    <option>2029</option>
                  </select>
                </td>
                <td>
                  <button class="btn-remove-row" @click="removeRow(agapRows, idx)" title="Remove row">×</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-actions">
          <button class="btn-add-row" @click="addAgapRow">+ Add Row</button>
        </div>
      </div>
      </transition>
    </div>
 
    <!-- ── SECTION III: PRO-ACT ── -->
    <div class="section-card section-card-collapsible">
      <div class="section-header">
        <div class="section-num">III</div>
        <div>
          <h3>Professional Advancement through Capacity-Building and Trainings (Pro-ACT)</h3>
          <p>Training and workshop interventions</p>
        </div>
        <div v-if="!sectionIIComplete" class="section-locked-badge">Complete Section II first</div>
      </div>
      <transition name="reveal">
      <div v-if="sectionIIComplete" class="section-body">
        <div class="section-desc">
          If a training intervention is identified in Part I (Competency
          Assessment), provide more detailed information here.
        </div>
        <div class="table-wrapper">
          <table class="dynamic-table">
            <thead>
              <tr>
                <th style="width: 40px">No.</th>
                <th>Training / Workshop Title</th>
                <th>Target Competency / Skill</th>
                <th style="width: 130px">Mode of Activity</th>
                <th>Trainer / Provider</th>
                <th style="width: 130px">Target Timeline</th>
                <th style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <template v-if="filledCompetencies.length === 0">
                <tr>
                  <td colspan="6" style="text-align:center; color: var(--text-light); font-style:italic; padding: 20px;">
                    Add competencies in Section I to populate this table.
                  </td>
                </tr>
              </template>
              <tr v-for="(competency, idx) in filledCompetencies" :key="competency">
                <td class="row-num-cell">{{ idx + 1 }}</td>
                <td>
                  <input type="text" v-model="proactRows[idx].trainingTitle" placeholder="" />
                </td>
                <td>
                  <div class="proact-skill-label">{{ competency }}</div>
                </td>
                <td>
                  <select v-model="proactRows[idx].modeOfActivity">
                    <option value="">Select…</option>
                    <option>Face-to-face</option>
                    <option>Online</option>
                    <option>Blended</option>
                    <option>On-the-job</option>
                  </select>
                </td>
                <td>
                  <input type="text" v-model="proactRows[idx].trainerProvider" placeholder="Optional" />
                </td>
                <td>
                  <select v-model="proactRows[idx].targetTimeline">
                    <option value="">Select…</option>
                    <option>2026</option>
                    <option>2027</option>
                    <option>2028</option>
                    <option>2029</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="filledCompetencies.length > 0" style="font-size:13px; color:var(--text-light); margin-top:10px;">
          Rows are auto-generated based on competencies entered in Section I.
        </p>
      </div>
      </transition>
    </div>
 
    <!-- ── SUBMIT STAGE 1 ── -->
    <transition name="reveal">
      <div v-if="sectionIIIComplete" class="submit-area">
        <p>
          By submitting, you confirm that all information provided is accurate.
          Your supervisor will be notified automatically.
        </p>
        <button class="btn-submit" :disabled="isSubmitting" @click="submitStage1">
          {{ isSubmitting ? "Submitting…" : "Submit IDP" }}
        </button>
      </div>
    </transition>
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
import { ref, reactive, computed, watch, onMounted } from "vue";
 
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
// ── Privacy Modal ──
const showPrivacyModal = ref(true);
const privacyAgreed = ref(false);
function acceptPrivacy() {
  if (privacyAgreed.value) showPrivacyModal.value = false;
}
 
const stage = ref("stage1");
 
// ── Loading state ──────────────────────────────────────────────────────────
const isLoading = ref(false);
const isSubmitting = ref(false);
const loadingMsg = ref("Submitting your IDP, please wait…");
 
// ── Stage 1 form data ──────────────────────────────────────────────────────
const form = reactive({
  campus: "CSU Main Campus",
  officeAffiliation: "",
  collegeOfficeUnit: "",
  collegeProgram: "",
  personnelType: "",  // "administrative" | "faculty"
  lastName: "",
  firstName: "",
  middleInitial: "",
  employeeEmailPrefix: "",
  employeeEmail: "",
  educAttainment: "",
  educAttainmentSpec: "",
  datePrepared: "",
  currentPosition: "",
  yearsInPosition: "",
  yearsInCSU: "",
  supervisorName: "",
  supervisorEmailPrefix: "",
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
    competencyGroup: "",  // auto-set by getCompetencyCluster on selection
    targetCompetency: "",
    currentLevel: "",
    requiredLevel: "",
    leadInterventions: "",
    targetTimeline: "",
  },
]);
const agapRows = ref([
  {
    degreeProgram: "",
    targetHEI: "",
    modeOfStudy: "",
    scholarshipGrant: "",
    targetTimeline: "",
  },
]);
const proactRows = ref([
  {
    trainingTitle: "",
    targetSkill: "",
    modeOfActivity: "",
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
const campusOptions = ["CSU Main Campus"];
const officeOptions = [
  "OVPAF",
  "OVPAA",
  "OVPEO",
  "OVPSAS",
  "OVPRDIE",
];
 
// Sub-office / college options per office affiliation
// For OVPAA colleges, value is { name, programs: [] }
const subOfficeMap = {
  OVPAF: [
    "Human Resource Management Services (HRMS)",
    "Supply and Property Management Office (SPMO)",
    "Records Management Office",
    "Procurement Office",
    "Engineering & Construction Office",
    "Office of the Campus Safety & Security",
    "General Services Office",
    "DRRM Office",
    "University Budget Office",
    "University Accounting Office",
    "University Cashiering Office",
    "Business & Resource Management Office",
    "Corporate Enterprise Development Office",
    "University Press",
  ],
  OVPAA: [
    { name: "Professional Schools", programs: [] },
    { name: "College of Engineering and Geo-Sciences (CEGS)", programs: [
      "BS in Agricultural and Biosystems Engineering",
      "BS in Civil Engineering",
      "BS in Electronics Engineering",
      "BS in Geodetic Engineering",
      "BS in Geology",
      "BS in Mining Engineering",
    ]},
    { name: "College of Computing and Information Sciences (CCIS)", programs: [
      "BS in Computer Science",
      "BS in Information System",
      "BS in Information Technology",
    ]},
    { name: "College of Mathematics and Natural Sciences (CMNS)", programs: [
      "BS in Applied Mathematics",
      "BS in Biology",
      "BS in Chemistry",
      "BS in Marine Biology",
      "BS in Mathematics",
      "BS in Physics",
    ]},
    { name: "College of Humanities and Social Sciences (CHaSS)", programs: [
      "Bachelor of Arts in Sociology",
      "Bachelor of Science in Psychology",
      "Bachelor of Science in Social Work",
    ]},
    { name: "College of Agricultural and Agri-Industries (CAA)", programs: [
      "BS in Agriculture",
    ]},
    { name: "College of Forestry and Environmental Sciences", programs: [
      "BS in Environmental Science",
      "BS in Forestry",
      "BS in Agroforestry",
    ]},
    { name: "National Service Training Program", programs: [] },
    { name: "Office of Curriculum & Instruction Development", programs: [] },
    { name: "Office of Student Internship Programs", programs: [] },
    { name: "Office of the University Registrar", programs: [] },
    { name: "Office of the University Librarian", programs: [] },
  ],
  OVPEO: [
    "Project Management Office",
    "Office of the Planning & Quality Management Services",
    "Office of Strategic Foresight and Futures Thinking",
    "Office of Internationalization and Global Engagements",
    "Management Information System",
    "Public Information & Communication Office",
    "Alumni Relations Office",
  ],
  OVPSAS: [
    "Office of the Student Welfare & Engagements",
    "Office of the Student Leadership & Development",
    "Office of the Counselling & Career Services",
    "Office of the Admission & Scholarship",
    "University Center for Culture & Arts",
    "University Center for Sports & Recreation",
    "University Center for Health & Wellness",
  ],
  OVPRDIE: [
    "Research & Development and Innovation (RDI) Services",
    "Technology Transfer & Licensing Office",
    "Technology Business Incubator (TBI) Office",
    "Extension Services Office",
    "RDIE Publication Management Office",
  ],
};
 
// For OVPAA: colleges with sub-programs
const isOVPAA = computed(() => form.officeAffiliation === "OVPAA");
 
const collegeOfficeUnitOptions = computed(() => {
  const list = subOfficeMap[form.officeAffiliation] || [];
  if (isOVPAA.value) return list.map(c => typeof c === "string" ? c : c.name);
  return list;
});
 
const selectedCollegePrograms = computed(() => {
  if (!isOVPAA.value) return [];
  const colleges = subOfficeMap["OVPAA"] || [];
  const found = colleges.find(c => typeof c === "object" && c.name === form.collegeOfficeUnit);
  return found ? found.programs : [];
});
 
// Reset downstream when affiliation changes
watch(() => form.officeAffiliation, (newOffice) => {
  form.collegeOfficeUnit = "";
  form.collegeProgram = "";
  form.currentPosition = "";
  // OVPAA: let user pick type. All other offices: always administrative, no type picker shown.
  if (newOffice === "OVPAA") {
    form.personnelType = "";
  } else {
    form.personnelType = "administrative";
  }
});
 
watch(() => form.collegeOfficeUnit, () => {
  form.collegeProgram = "";
});
 
// Re-compute required levels on all existing rows when position changes
watch(() => form.currentPosition, (newPos) => {
  competencyRows.value.forEach(row => {
    if (row.targetCompetency) {
      row.requiredLevel = getRequiredLevel(row.targetCompetency, newPos);
    }
  });
});
 
// ── Section completion computed flags ─────────────────────────────────────
const sectionIComplete = computed(() => {
  // Section I (Competency) is "done" once purpose is chosen — rows are optional
  return !!form.compPurpose;
});
 
const sectionIIComplete = computed(() => {
  // Section II (AGAP) always shows once Section I purpose picked — rows optional
  return sectionIComplete.value;
});
 
const sectionIIIComplete = computed(() => {
  // Section III (Pro-ACT) always shows once Section II visible — rows optional
  return sectionIIComplete.value;
});
 
// Competencies actually entered in Section I — drives Pro-ACT table rows
const filledCompetencies = computed(() => {
  const list = competencyRows.value
    .map(r => r.targetCompetency)
    .filter(c => c && c.trim());
  // Keep proactRows in sync — grow or shrink as needed
  while (proactRows.value.length < list.length) {
    proactRows.value.push({ trainingTitle: "", targetSkill: "", modeOfActivity: "", trainerProvider: "", targetTimeline: "" });
  }
  // Sync targetSkill on each row
  list.forEach((c, i) => { proactRows.value[i].targetSkill = c; });
  return list;
});
 
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
 
// ── Competency lists ────────────────────────────────────────────────────────
const competencyData = {
  Core: computed(() => {
    const base = ["Integrity","Accountability","Scientific and Technological Excellence","Delivering Service Excellence","Environmental Consciousness","Building Partnership"];
    if (form.personnelType === "faculty") base.push("Faculty Specializing in Environment");
    return base;
  }),
  Leadership: ["Developing People","Facilitating Change","Conflict Management","Leading Innovation","Strategic Planning","Leading Others","Decisiveness"],
  Organizational: ["Teamwork","Commitment to Learning","Customer Focus","Adaptability and Flexibility","Critical Thinking","Effective Communication","Valuing Diversity","Self-Awareness and Confidence","Stress Tolerance","Resource Management","Knowledge Management","Initiative","Result Orientation","Community Engagement","Organizational Commitment","Planning and Organizing","Emotional and Psychological Maturity","Safety and Risk Management","Interpersonal Effectiveness"],
  Technical: computed(() => {
    const base = ["Research Engagement","Diagnostic Information Gathering","Attention to Details","Written Communication","Oral Communication","Conceptual and Analytical Thinking","Computer Literacy","Planning and Project Management","Logical Reasoning"];
    if (form.personnelType === "faculty") {
      base.push("Language Faculty","IT Faculty","Math and Allied Fields Faculty Members");
    }
    return base;
  }),
};
 
function getCompetencyOptions(group) {
  if (!group) return [];
  const v = competencyData[group];
  if (!v) return [];
  return typeof v.value !== "undefined" ? v.value : v;
}
 
// Flat computed lists per cluster (reactive to personnelType)
const allCompetencies = computed(() => ({
  Core: getCompetencyOptions("Core"),
  Leadership: getCompetencyOptions("Leadership"),
  Organizational: getCompetencyOptions("Organizational"),
  Technical: getCompetencyOptions("Technical"),
}));
 
// Which clusters are applicable for the currently selected position
// A cluster is included if ANY competency in it has a non-null required level for that position.
// If no position selected yet, or position is Director, all 4 clusters are shown.
const availableClusters = computed(() => {
  const allClusters = ["Core", "Leadership", "Organizational", "Technical"];
  const pos = form.currentPosition;
  if (!pos || pos === "Director") return allClusters;
  const posData = competencyModel[pos];
  if (!posData || Object.keys(posData).length === 0) return allClusters;
  return allClusters.filter(cluster => {
    const list = allCompetencies.value[cluster] || [];
    return list.some(c => posData[c] !== undefined && posData[c] !== null);
  });
});

// Reverse lookup: competency name → cluster name
function getCompetencyCluster(competency) {
  if (!competency) return "";
  for (const [grp, list] of Object.entries(allCompetencies.value)) {
    if (list.includes(competency)) return grp;
  }
  return "";
}
 
// ── Required Level Lookup ────────────────────────────────────────────────────
// Source: CSU Competency Model (official document)
// Levels: 1 = Basic, 2 = Intermediate, 3 = Advanced, 4 = Expert
// null = no required competency level for that position
//
// COLUMN KEY for admin tables (pages 1-2):
//   AideIII, SecGuard, FarmW, AstI, AstII, AstIII, AstIV,
//   OffI, OffII, OffIII, OffIV, OffV,
//   AideI-U, AideI-C, AideII-U, AideII-C, AideIV-M, AideIV-C, AideIV-D
 
const LEVEL_LABEL = { 1: "1 - Basic", 2: "2 - Intermediate", 3: "3 - Advanced", 4: "4 - Expert" };
 
// Per-position, per-competency required level table
// Keys match exact dropdown option values
// Source: Official CSU Competency Model Document
// Levels: 1=Basic, 2=Intermediate, 3=Advanced, 4=Expert
// Competency absent from a position = key not present (excluded from dropdown)
const competencyModel = {
  // ── ADMIN AIDE I – Utility ──────────────────────────────────────────
  "Admin Aide I – Utility": {
    "Integrity": 1, "Accountability": 1, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 1, "Environmental Consciousness": 2, "Building Partnership": 1,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 1,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 1, "Oral Communication": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN AIDE I – Clerk ────────────────────────────────────────────
  "Admin Aide I – Clerk": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 1,
    "Interpersonal Effectiveness": 1,
    "Attention to Details": 1, "Written Communication": 1,
    "Oral Communication": 1, "Computer Literacy": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN AIDE II – Utility ─────────────────────────────────────────
  "Admin Aide II – Utility": {
    "Integrity": 1, "Accountability": 1, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 1, "Environmental Consciousness": 2, "Building Partnership": 1,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 1,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 1, "Oral Communication": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN AIDE II – Clerk ───────────────────────────────────────────
  "Admin Aide II – Clerk": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 1,
    "Interpersonal Effectiveness": 1,
    "Attention to Details": 1, "Written Communication": 1,
    "Oral Communication": 1, "Computer Literacy": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN AIDE III – Clerk ──────────────────────────────────────────
  "Admin Aide III – Clerk": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 1,
    "Interpersonal Effectiveness": 1, "Oral Communication": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN AIDE IV – Mechanic ────────────────────────────────────────
  "Admin Aide IV – Mechanic": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 1,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 1,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 1, "Oral Communication": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN AIDE IV – Clerk ───────────────────────────────────────────
  "Admin Aide IV – Clerk": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 1,
    "Interpersonal Effectiveness": 1,
    "Attention to Details": 1, "Written Communication": 1,
    "Oral Communication": 1, "Computer Literacy": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN AIDE IV – Driver ──────────────────────────────────────────
  "Admin Aide IV – Driver": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 1,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 3, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 2, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 3,
    "Interpersonal Effectiveness": 1, "Oral Communication": 1, "Logical Reasoning": 1,
  },
  // ── SECURITY GUARD I ────────────────────────────────────────────────
  "Security Guard I": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 1,
    "Teamwork": 2, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 2, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 3, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 2, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 3,
    "Interpersonal Effectiveness": 1,
    "Oral Communication": 1, "Computer Literacy": 1, "Logical Reasoning": 1,
  },
  // ── FARM WORKER I ───────────────────────────────────────────────────
  "Farm Worker I": {
    "Integrity": 1, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 1, "Environmental Consciousness": 2, "Building Partnership": 1,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 1,
    "Adaptability and Flexibility": 1, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 1,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 1, "Oral Communication": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN ASSISTANT I ───────────────────────────────────────────────
  "Admin Assistant I": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 2, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 2, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 1,
    "Interpersonal Effectiveness": 1,
    "Attention to Details": 1, "Written Communication": 1,
    "Oral Communication": 1, "Computer Literacy": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN ASSISTANT II ──────────────────────────────────────────────
  "Admin Assistant II": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 2, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 2, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 1,
    "Interpersonal Effectiveness": 1,
    "Attention to Details": 1, "Written Communication": 1,
    "Oral Communication": 1, "Computer Literacy": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN ASSISTANT III ─────────────────────────────────────────────
  "Admin Assistant III": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 2, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 2, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 1,
    "Interpersonal Effectiveness": 1,
    "Attention to Details": 1, "Written Communication": 1,
    "Oral Communication": 1, "Computer Literacy": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN ASSISTANT IV ──────────────────────────────────────────────
  "Admin Assistant IV": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 1,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 2, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 2, "Effective Communication": 1, "Valuing Diversity": 1,
    "Self-Awareness and Confidence": 1, "Stress Tolerance": 1, "Resource Management": 1,
    "Knowledge Management": 1, "Initiative": 1, "Result Orientation": 1,
    "Organizational Commitment": 1, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 1, "Safety and Risk Management": 1,
    "Interpersonal Effectiveness": 1,
    "Attention to Details": 1, "Written Communication": 1,
    "Oral Communication": 1, "Computer Literacy": 1, "Logical Reasoning": 1,
  },
  // ── ADMIN OFFICER I ─────────────────────────────────────────────────
  "Admin Officer I": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3, "Building Partnership": 3,
    "Teamwork": 3, "Commitment to Learning": 2, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 2, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 2, "Logical Reasoning": 2,
  },
  // ── ADMIN OFFICER II ────────────────────────────────────────────────
  "Admin Officer II": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3, "Building Partnership": 3,
    "Teamwork": 3, "Commitment to Learning": 2, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 2, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 2, "Logical Reasoning": 2,
  },
  // ── ADMIN OFFICER III ───────────────────────────────────────────────
  "Admin Officer III": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3, "Building Partnership": 3,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 2, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 2, "Logical Reasoning": 2,
  },
  // ── ADMIN OFFICER IV ────────────────────────────────────────────────
  "Admin Officer IV": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3, "Building Partnership": 3,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 3, "Valuing Diversity": 3,
    "Self-Awareness and Confidence": 3, "Stress Tolerance": 3, "Resource Management": 3,
    "Knowledge Management": 3, "Initiative": 3, "Result Orientation": 3,
    "Organizational Commitment": 3, "Planning and Organizing": 3,
    "Emotional and Psychological Maturity": 3, "Safety and Risk Management": 3,
    "Interpersonal Effectiveness": 3,
    "Attention to Details": 3, "Written Communication": 3,
    "Oral Communication": 3, "Computer Literacy": 2, "Logical Reasoning": 3,
  },
  // ── ADMIN OFFICER V ─────────────────────────────────────────────────
  "Admin Officer V": {
    "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 4, "Building Partnership": 4,
    "Developing People": 4, "Facilitating Change": 4, "Conflict Management": 4,
    "Leading Innovation": 3, "Strategic Planning": 3, "Leading Others": 4, "Decisiveness": 4,
    "Critical Thinking": 4,
    "Teamwork": 4, "Commitment to Learning": 4, "Customer Focus": 4,
    "Adaptability and Flexibility": 4, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },

  // ════════════════════════════════════════════════════════════════════
  // PROFESSIONAL / SPECIALIZED ADMIN
  // ════════════════════════════════════════════════════════════════════
  "Accountant III": {
    "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 2, "Building Partnership": 3,
    "Developing People": 2, "Facilitating Change": 2, "Conflict Management": 2,
    "Leading Innovation": 1, "Strategic Planning": 1, "Leading Others": 2, "Decisiveness": 2,
    "Critical Thinking": 3,
    "Teamwork": 4, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "College Librarian I": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Critical Thinking": 3,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 3, "Valuing Diversity": 3,
    "Self-Awareness and Confidence": 3, "Stress Tolerance": 3, "Resource Management": 3,
    "Knowledge Management": 3, "Initiative": 3, "Result Orientation": 3,
    "Organizational Commitment": 3, "Planning and Organizing": 3,
    "Emotional and Psychological Maturity": 3, "Safety and Risk Management": 3,
    "Interpersonal Effectiveness": 3,
    "Attention to Details": 3, "Written Communication": 3,
    "Oral Communication": 3, "Computer Literacy": 2, "Logical Reasoning": 3,
  },
  "College Librarian III": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 2, "Building Partnership": 3,
    "Developing People": 2, "Facilitating Change": 2, "Conflict Management": 2,
    "Leading Innovation": 2, "Strategic Planning": 2, "Leading Others": 2, "Decisiveness": 2,
    "Critical Thinking": 3,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Nurse I": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Critical Thinking": 2,
    "Teamwork": 1, "Commitment to Learning": 1, "Customer Focus": 3,
    "Adaptability and Flexibility": 2, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 3, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 2, "Logical Reasoning": 2,
  },
  "Nurse II": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Critical Thinking": 2,
    "Teamwork": 2, "Commitment to Learning": 1, "Customer Focus": 3,
    "Adaptability and Flexibility": 2, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 3, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 2, "Logical Reasoning": 2,
  },
  "Chief Administrative Officer (CAO)": {
    "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 4, "Building Partnership": 4,
    "Developing People": 4, "Facilitating Change": 4, "Conflict Management": 4,
    "Leading Innovation": 4, "Strategic Planning": 4, "Leading Others": 4, "Decisiveness": 4,
    "Critical Thinking": 4,
    "Teamwork": 4, "Commitment to Learning": 4, "Customer Focus": 4,
    "Adaptability and Flexibility": 4, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Board Secretary V": {
    "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 3, "Building Partnership": 3,
    "Developing People": 2, "Facilitating Change": 2, "Conflict Management": 2,
    "Leading Innovation": 2, "Strategic Planning": 2, "Leading Others": 2, "Decisiveness": 2,
    "Critical Thinking": 4,
    "Teamwork": 4, "Commitment to Learning": 3, "Customer Focus": 4,
    "Adaptability and Flexibility": 3, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Guidance Counselor III": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 2, "Building Partnership": 3,
    "Developing People": 2, "Facilitating Change": 2, "Conflict Management": 2,
    "Leading Innovation": 2, "Strategic Planning": 2, "Leading Others": 2, "Decisiveness": 2,
    "Critical Thinking": 4,
    "Teamwork": 4, "Commitment to Learning": 3, "Customer Focus": 4,
    "Adaptability and Flexibility": 3, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Programmer II": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Critical Thinking": 2,
    "Teamwork": 2, "Commitment to Learning": 1, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 3, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 4, "Logical Reasoning": 2,
  },
  "Database Administrator": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Critical Thinking": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 3, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 4, "Logical Reasoning": 2,
  },
  "System Analyst": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Critical Thinking": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 3, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 4, "Logical Reasoning": 2,
  },
  "Planning Officer": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 3, "Building Partnership": 3,
    "Developing People": 2, "Facilitating Change": 2, "Conflict Management": 2,
    "Leading Innovation": 3, "Strategic Planning": 3, "Leading Others": 2, "Decisiveness": 2,
    "Critical Thinking": 4,
    "Teamwork": 4, "Commitment to Learning": 4, "Customer Focus": 4,
    "Adaptability and Flexibility": 4, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Registrar III": {
    "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 2, "Building Partnership": 3,
    "Developing People": 2, "Facilitating Change": 2, "Conflict Management": 2,
    "Leading Innovation": 2, "Strategic Planning": 2, "Leading Others": 2, "Decisiveness": 2,
    "Critical Thinking": 3,
    "Teamwork": 4, "Commitment to Learning": 3, "Customer Focus": 4,
    "Adaptability and Flexibility": 3, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Attorney II": {
    "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 3,
    "Facilitating Change": 4, "Conflict Management": 4, "Strategic Planning": 4, "Decisiveness": 4,
    "Critical Thinking": 4,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Attorney III": {
    "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 2, "Building Partnership": 3,
    "Facilitating Change": 4, "Conflict Management": 4, "Strategic Planning": 4, "Decisiveness": 4,
    "Critical Thinking": 4,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 3, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Physician": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Developing People": 4, "Facilitating Change": 4, "Conflict Management": 4,
    "Leading Innovation": 4, "Strategic Planning": 4, "Decisiveness": 4,
    "Critical Thinking": 4,
    "Teamwork": 2, "Commitment to Learning": 3, "Customer Focus": 4,
    "Adaptability and Flexibility": 2, "Effective Communication": 4, "Valuing Diversity": 4,
    "Self-Awareness and Confidence": 4, "Stress Tolerance": 4, "Resource Management": 4,
    "Knowledge Management": 4, "Initiative": 4, "Result Orientation": 4,
    "Organizational Commitment": 4, "Planning and Organizing": 4,
    "Emotional and Psychological Maturity": 4, "Safety and Risk Management": 4,
    "Interpersonal Effectiveness": 4,
    "Attention to Details": 4, "Written Communication": 4,
    "Oral Communication": 4, "Computer Literacy": 2, "Logical Reasoning": 4,
  },
  "Procurement Officer": {
    "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 4, "Environmental Consciousness": 2, "Building Partnership": 2,
    "Teamwork": 4, "Commitment to Learning": 3, "Customer Focus": 4,
    "Adaptability and Flexibility": 4, "Effective Communication": 2, "Valuing Diversity": 2,
    "Self-Awareness and Confidence": 2, "Stress Tolerance": 3, "Resource Management": 2,
    "Knowledge Management": 2, "Initiative": 2, "Result Orientation": 2,
    "Organizational Commitment": 2, "Planning and Organizing": 2,
    "Emotional and Psychological Maturity": 2, "Safety and Risk Management": 2,
    "Interpersonal Effectiveness": 2,
    "Attention to Details": 2, "Written Communication": 2,
    "Oral Communication": 2, "Computer Literacy": 2, "Logical Reasoning": 2,
  },
  // ── DIRECTOR ────────────────────────────────────────────────────────
  // No preset required levels — Director can input their own required level.
  // All 4 clusters are available (empty model = availableClusters shows all).
  "Director": {},
 
  // ════════════════════════════════════════════════════════════════════
  // FACULTY (Pages 5-8)
  // ════════════════════════════════════════════════════════════════════
  "Instructor I": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2,
    "Faculty Specializing in Environment": 3, "Building Partnership": 2,
    "Facilitating Change": 2, "Conflict Management": 1, "Leading Innovation": 1,
    "Strategic Planning": 2, "Leading Others": 1, "Decisiveness": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Critical Thinking": 2, "Effective Communication": 3,
    "Valuing Diversity": 3, "Self-Awareness and Confidence": 3, "Stress Tolerance": 3,
    "Resource Management": 2, "Knowledge Management": 3, "Initiative": 2,
    "Result Orientation": 2, "Community Engagement": 1, "Organizational Commitment": 2,
    "Planning and Organizing": 3, "Emotional and Psychological Maturity": 3,
    "Safety and Risk Management": 2, "Interpersonal Effectiveness": 2,
    "Research Engagement": 1, "Diagnostic Information Gathering": 2, "Attention to Details": 2,
    "Written Communication": 2, "Oral Communication": 2,
    "Language Faculty": 3, "Conceptual and Analytical Thinking": 2,
    "Computer Literacy": 2, "IT Faculty": 3,
    "Planning and Project Management": null, "Logical Reasoning": 2, "Math and Allied Fields Faculty Members": 3,
  },
  "Instructor II": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2,
    "Faculty Specializing in Environment": 3, "Building Partnership": 2,
    "Facilitating Change": 2, "Conflict Management": 1, "Leading Innovation": 1,
    "Strategic Planning": 2, "Leading Others": 1, "Decisiveness": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Critical Thinking": 2, "Effective Communication": 3,
    "Valuing Diversity": 3, "Self-Awareness and Confidence": 3, "Stress Tolerance": 3,
    "Resource Management": 2, "Knowledge Management": 3, "Initiative": 2,
    "Result Orientation": 2, "Community Engagement": 1, "Organizational Commitment": 2,
    "Planning and Organizing": 3, "Emotional and Psychological Maturity": 3,
    "Safety and Risk Management": 2, "Interpersonal Effectiveness": 2,
    "Research Engagement": 1, "Diagnostic Information Gathering": 2, "Attention to Details": 2,
    "Written Communication": 2, "Oral Communication": 2,
    "Language Faculty": 3, "Conceptual and Analytical Thinking": 2,
    "Computer Literacy": 2, "IT Faculty": 3,
    "Planning and Project Management": null, "Logical Reasoning": 2, "Math and Allied Fields Faculty Members": 3,
  },
  "Instructor III": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2,
    "Faculty Specializing in Environment": 3, "Building Partnership": 2,
    "Facilitating Change": 2, "Conflict Management": 1, "Leading Innovation": 1,
    "Strategic Planning": 2, "Leading Others": 1, "Decisiveness": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Critical Thinking": 2, "Effective Communication": 3,
    "Valuing Diversity": 3, "Self-Awareness and Confidence": 3, "Stress Tolerance": 3,
    "Resource Management": 2, "Knowledge Management": 3, "Initiative": 2,
    "Result Orientation": 2, "Community Engagement": 1, "Organizational Commitment": 2,
    "Planning and Organizing": 3, "Emotional and Psychological Maturity": 3,
    "Safety and Risk Management": 2, "Interpersonal Effectiveness": 2,
    "Research Engagement": 1, "Diagnostic Information Gathering": 2, "Attention to Details": 2,
    "Written Communication": 2, "Oral Communication": 2,
    "Language Faculty": 3, "Conceptual and Analytical Thinking": 2,
    "Computer Literacy": 2, "IT Faculty": 3,
    "Planning and Project Management": null, "Logical Reasoning": 2, "Math and Allied Fields Faculty Members": 3,
  },
  "Assistant Professor I": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2,
    "Faculty Specializing in Environment": 3, "Building Partnership": 2,
    "Facilitating Change": 2, "Conflict Management": 2, "Leading Innovation": 2,
    "Strategic Planning": 2, "Leading Others": 2, "Decisiveness": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Critical Thinking": 2, "Effective Communication": 3,
    "Valuing Diversity": 3, "Self-Awareness and Confidence": 3, "Stress Tolerance": 3,
    "Resource Management": 2, "Knowledge Management": 3, "Initiative": 2,
    "Result Orientation": 2, "Community Engagement": 1, "Organizational Commitment": 2,
    "Planning and Organizing": 3, "Emotional and Psychological Maturity": 3,
    "Safety and Risk Management": 2, "Interpersonal Effectiveness": 2,
    "Research Engagement": 2, "Diagnostic Information Gathering": 2, "Attention to Details": 2,
    "Written Communication": 3, "Oral Communication": 3,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 2,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 1, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  "Assistant Professor II": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2,
    "Faculty Specializing in Environment": 3, "Building Partnership": 2,
    "Facilitating Change": 2, "Conflict Management": 2, "Leading Innovation": 2,
    "Strategic Planning": 2, "Leading Others": 2, "Decisiveness": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Critical Thinking": 2, "Effective Communication": 3,
    "Valuing Diversity": 3, "Self-Awareness and Confidence": 3, "Stress Tolerance": 3,
    "Resource Management": 2, "Knowledge Management": 3, "Initiative": 2,
    "Result Orientation": 2, "Community Engagement": 1, "Organizational Commitment": 2,
    "Planning and Organizing": 3, "Emotional and Psychological Maturity": 3,
    "Safety and Risk Management": 2, "Interpersonal Effectiveness": 2,
    "Research Engagement": 2, "Diagnostic Information Gathering": 2, "Attention to Details": 2,
    "Written Communication": 3, "Oral Communication": 3,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 2,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 1, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  "Assistant Professor III": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2,
    "Faculty Specializing in Environment": 3, "Building Partnership": 2,
    "Facilitating Change": 2, "Conflict Management": 2, "Leading Innovation": 2,
    "Strategic Planning": 2, "Leading Others": 2, "Decisiveness": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Critical Thinking": 2, "Effective Communication": 3,
    "Valuing Diversity": 3, "Self-Awareness and Confidence": 3, "Stress Tolerance": 3,
    "Resource Management": 2, "Knowledge Management": 3, "Initiative": 2,
    "Result Orientation": 2, "Community Engagement": 1, "Organizational Commitment": 2,
    "Planning and Organizing": 3, "Emotional and Psychological Maturity": 3,
    "Safety and Risk Management": 3, "Interpersonal Effectiveness": 2,
    "Research Engagement": 2, "Diagnostic Information Gathering": 2, "Attention to Details": 2,
    "Written Communication": 3, "Oral Communication": 3,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 2,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 2, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  "Assistant Professor IV": {
    "Integrity": 2, "Accountability": 2, "Scientific and Technological Excellence": 2,
    "Delivering Service Excellence": 2, "Environmental Consciousness": 2,
    "Faculty Specializing in Environment": 3, "Building Partnership": 2,
    "Facilitating Change": 2, "Conflict Management": 2, "Leading Innovation": 2,
    "Strategic Planning": 2, "Leading Others": 2, "Decisiveness": 2,
    "Teamwork": 2, "Commitment to Learning": 2, "Customer Focus": 2,
    "Adaptability and Flexibility": 3, "Critical Thinking": 2, "Effective Communication": 3,
    "Valuing Diversity": 3, "Self-Awareness and Confidence": 3, "Stress Tolerance": 3,
    "Resource Management": 2, "Knowledge Management": 3, "Initiative": 2,
    "Result Orientation": 2, "Community Engagement": 1, "Organizational Commitment": 2,
    "Planning and Organizing": 3, "Emotional and Psychological Maturity": 3,
    "Safety and Risk Management": 3, "Interpersonal Effectiveness": 2,
    "Research Engagement": 2, "Diagnostic Information Gathering": 2, "Attention to Details": 2,
    "Written Communication": 3, "Oral Communication": 3,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 2,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 2, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  "Associate Professor I": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 3,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3,
    "Faculty Specializing in Environment": 4, "Building Partnership": 3,
    "Facilitating Change": 3, "Conflict Management": 3, "Leading Innovation": 3,
    "Strategic Planning": 3, "Leading Others": 3, "Decisiveness": 3,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 4, "Critical Thinking": 3, "Effective Communication": 4,
    "Valuing Diversity": 4, "Self-Awareness and Confidence": 4, "Stress Tolerance": 4,
    "Resource Management": 3, "Knowledge Management": 4, "Initiative": 3,
    "Result Orientation": 3, "Community Engagement": 3, "Organizational Commitment": 3,
    "Planning and Organizing": 4, "Emotional and Psychological Maturity": 4,
    "Safety and Risk Management": 3, "Interpersonal Effectiveness": 3,
    "Research Engagement": 3, "Diagnostic Information Gathering": 3, "Attention to Details": 3,
    "Written Communication": 4, "Oral Communication": 4,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 3,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 3, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  "Associate Professor II": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 3,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3,
    "Faculty Specializing in Environment": 4, "Building Partnership": 3,
    "Facilitating Change": 3, "Conflict Management": 3, "Leading Innovation": 3,
    "Strategic Planning": 3, "Leading Others": 3, "Decisiveness": 3,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 4, "Critical Thinking": 3, "Effective Communication": 4,
    "Valuing Diversity": 4, "Self-Awareness and Confidence": 4, "Stress Tolerance": 4,
    "Resource Management": 3, "Knowledge Management": 4, "Initiative": 3,
    "Result Orientation": 3, "Community Engagement": 3, "Organizational Commitment": 3,
    "Planning and Organizing": 4, "Emotional and Psychological Maturity": 4,
    "Safety and Risk Management": 3, "Interpersonal Effectiveness": 3,
    "Research Engagement": 3, "Diagnostic Information Gathering": 3, "Attention to Details": 3,
    "Written Communication": 4, "Oral Communication": 4,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 3,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 3, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  "Associate Professor III": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 3,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3,
    "Faculty Specializing in Environment": 4, "Building Partnership": 3,
    "Developing People": 3, "Facilitating Change": 3, "Conflict Management": 3,
    "Leading Innovation": 3, "Strategic Planning": 3, "Leading Others": 3, "Decisiveness": 3,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 4, "Critical Thinking": 3, "Effective Communication": 4,
    "Valuing Diversity": 4, "Self-Awareness and Confidence": 4, "Stress Tolerance": 4,
    "Resource Management": 3, "Knowledge Management": 4, "Initiative": 3,
    "Result Orientation": 3, "Community Engagement": 3, "Organizational Commitment": 3,
    "Planning and Organizing": 4, "Emotional and Psychological Maturity": 4,
    "Safety and Risk Management": 3, "Interpersonal Effectiveness": 3,
    "Research Engagement": 3, "Diagnostic Information Gathering": 3, "Attention to Details": 3,
    "Written Communication": 4, "Oral Communication": 4,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 3,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 3, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  "Associate Professor IV": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 3,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3,
    "Faculty Specializing in Environment": 4, "Building Partnership": 3,
    "Facilitating Change": 3, "Conflict Management": 3,
    "Leading Innovation": 3, "Strategic Planning": 3, "Leading Others": 3, "Decisiveness": 3,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 4, "Critical Thinking": 3, "Effective Communication": 4,
    "Valuing Diversity": 4, "Self-Awareness and Confidence": 4, "Stress Tolerance": 4,
    "Resource Management": 3, "Knowledge Management": 4, "Initiative": 3,
    "Result Orientation": 3, "Community Engagement": 3, "Organizational Commitment": 3,
    "Planning and Organizing": 4, "Emotional and Psychological Maturity": 4,
    "Safety and Risk Management": 3, "Interpersonal Effectiveness": 3,
    "Research Engagement": 3, "Diagnostic Information Gathering": 3, "Attention to Details": 3,
    "Written Communication": 4, "Oral Communication": 4,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 3,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 3, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  "Associate Professor V": {
    "Integrity": 3, "Accountability": 3, "Scientific and Technological Excellence": 3,
    "Delivering Service Excellence": 3, "Environmental Consciousness": 3,
    "Faculty Specializing in Environment": 4, "Building Partnership": 3,
    "Facilitating Change": 3, "Conflict Management": 3,
    "Leading Innovation": 3, "Strategic Planning": 3, "Leading Others": 3, "Decisiveness": 3,
    "Teamwork": 3, "Commitment to Learning": 3, "Customer Focus": 3,
    "Adaptability and Flexibility": 4, "Critical Thinking": 3, "Effective Communication": 4,
    "Valuing Diversity": 4, "Self-Awareness and Confidence": 4, "Stress Tolerance": 4,
    "Resource Management": 3, "Knowledge Management": 4, "Initiative": 3,
    "Result Orientation": 3, "Community Engagement": 3, "Organizational Commitment": 3,
    "Planning and Organizing": 4, "Emotional and Psychological Maturity": 4,
    "Safety and Risk Management": 3, "Interpersonal Effectiveness": 3,
    "Research Engagement": 3, "Diagnostic Information Gathering": 3, "Attention to Details": 3,
    "Written Communication": 4, "Oral Communication": 4,
    "Language Faculty": 4, "Conceptual and Analytical Thinking": 3,
    "Computer Literacy": 2, "IT Faculty": 4,
    "Planning and Project Management": 3, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
  },
  // Associate Professor VI: document lists "NONE" — no required competency levels defined
  "Associate Professor VI": {},
};
 
// Professor I-VI and University Professor all share the same base values
// except: Professors I-III have Developing People=3, Professors IV-VI and UP have Developing People=4
const professorTemplate = {
  "Integrity": 4, "Accountability": 4, "Scientific and Technological Excellence": 4,
  "Delivering Service Excellence": 4, "Environmental Consciousness": 4,
  "Faculty Specializing in Environment": 4, "Building Partnership": 4,
  "Developing People": 4, "Facilitating Change": 4, "Conflict Management": 4,
  "Leading Innovation": 4, "Strategic Planning": 4, "Leading Others": 4, "Decisiveness": 4,
  "Teamwork": 4, "Commitment to Learning": 4, "Customer Focus": 4,
  "Adaptability and Flexibility": 4, "Critical Thinking": 4, "Effective Communication": 4,
  "Valuing Diversity": 4, "Self-Awareness and Confidence": 4, "Stress Tolerance": 4,
  "Resource Management": 4, "Knowledge Management": 4, "Initiative": 4,
  "Result Orientation": 4, "Community Engagement": 4, "Organizational Commitment": 4,
  "Planning and Organizing": 4, "Emotional and Psychological Maturity": 4,
  "Safety and Risk Management": 4, "Interpersonal Effectiveness": 4,
  "Research Engagement": 4, "Diagnostic Information Gathering": 4, "Attention to Details": 4,
  "Written Communication": 4, "Oral Communication": 4,
  "Language Faculty": 4, "Conceptual and Analytical Thinking": 4,
  "Computer Literacy": 2, "IT Faculty": 4,
  "Planning and Project Management": 4, "Logical Reasoning": 3, "Math and Allied Fields Faculty Members": 4,
};
// Professors I–III: Developing People = 3 (Advanced)
["Professor I","Professor II","Professor III"]
  .forEach(pos => { competencyModel[pos] = { ...professorTemplate, "Developing People": 3 }; });
// Professors IV–VI and University Professor: Developing People = 4 (Expert)
["Professor IV","Professor V","Professor VI","University Professor"]
  .forEach(pos => { competencyModel[pos] = { ...professorTemplate }; });
 
// Also alias Registrar III (same data as Accountant III pattern in pages 3-4, col 5):
// Integrity=4, Accountability=4, Sci=2, Deliver=4, Environ=2, Build=3
// Leadership: Dev=2, Facil=2, Conflict=2, Innov=2, Strategic=2, Leading=2, Decisive=2
// Organizational: all 4 except Teamwork=4,CommitLearn=3,CustFocus=4,Adapt=3,CommEngage=null
// Technical: same as pattern
// Note: Registrar III is not in the dropdown! So we skip it.
 
function getRequiredLevel(competency, position) {
  if (!competency || !position) return "";
  const posData = competencyModel[position];
  if (!posData) return "";
  const lvl = posData[competency];
  if (lvl === null || lvl === undefined) return "";
  return LEVEL_LABEL[lvl] || "";
}
 
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
  if (who === "employee") {
    form.employeeEmail = (form.employeeEmailPrefix || "").trim() + "@carsu.edu.ph";
  } else {
    form.supervisorEmail = (form.supervisorEmailPrefix || "").trim() + "@carsu.edu.ph";
  }
  const val = who === "employee" ? form.employeeEmail : form.supervisorEmail;
  const hint = emailHints[who];
  const prefix = who === "employee" ? form.employeeEmailPrefix : form.supervisorEmailPrefix;
  if (!prefix || !prefix.trim()) {
    hint.msg = "";
    hint.type = "";
    return false;
  }
  if (!/^[a-zA-Z0-9._%+\-]+$/.test(prefix.trim())) {
    hint.msg = "Invalid characters in email prefix.";
    hint.type = "error";
    return false;
  }
  hint.msg = "✓ Valid CarSU email";
  hint.type = "success";
  return true;
}
 
function addCompetencyRow() {
  competencyRows.value.push({
    competencyGroup: "",
    targetCompetency: "",
    currentLevel: "",
    requiredLevel: "",
    leadInterventions: "",
    targetTimeline: "",
  });
}
function addAgapRow() {
  agapRows.value.push({
    degreeProgram: "",
    targetHEI: "",
    modeOfStudy: "",
    scholarshipGrant: "",
    targetTimeline: "",
  });
}
function addProactRow() {
  proactRows.value.push({
    trainingTitle: "",
    targetSkill: "",
    modeOfActivity: "",
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
    "lastName",
    "firstName",
    "datePrepared",
    "currentPosition",
    "yearsInPosition",
    "yearsInCSU",
    "collegeOfficeUnit",
    "supervisorName",
    "educAttainment",
    "educAttainmentSpec",
  ];
  required.forEach((field) => {
    if (!form[field]?.toString().trim()) {
      errors[field] = true;
      ok = false;
    } else delete errors[field];
  });
  // Build full emails from prefixes before validating
  form.employeeEmail = (form.employeeEmailPrefix || "").trim() + "@carsu.edu.ph";
  form.supervisorEmail = (form.supervisorEmailPrefix || "").trim() + "@carsu.edu.ph";
  if (!validateEmail("employee")) ok = false;
  if (!validateEmail("supervisor")) ok = false;
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
    campus: "CSU Main Campus",
    officeAffiliation: form.officeAffiliation,
    collegeOfficeUnit: form.collegeOfficeUnit,
    nameOfPersonnel: [form.lastName, form.firstName, form.middleInitial].filter(Boolean).join(", "),
    lastName: form.lastName,
    firstName: form.firstName,
    middleInitial: form.middleInitial,
    educAttainment: form.educAttainment,
    educAttainmentSpec: form.educAttainmentSpec,
    datePrepared: form.datePrepared,
    currentPosition: form.currentPosition,
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
    if (!res.ok) {
      const errText = await res.text();
      alert("Submission failed (" + res.status + "): " + errText);
      return;
    }
    const data = await res.json();
    if (data.refId) {
      refId.value = data.refId;
      stage.value = "stage1-success";
    } else {
      alert("Submission failed: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Submit error:", err);
    alert("Network error: " + err.message + "\n\nMake sure the backend is running on " + API);
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
/* ── Privacy Modal ── */
.privacy-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}
.privacy-modal {
  background: #fff;
  border-radius: 14px;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
}
.privacy-header {
  background: var(--navy, #1a4d2e);
  color: #fff;
  padding: 24px 28px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.privacy-header svg {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #a8d5b5;
}
.privacy-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}
.privacy-body {
  padding: 24px 28px;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.65;
  max-height: 55vh;
  overflow-y: auto;
}
.privacy-body p { margin: 0 0 12px; }
.privacy-body ul {
  margin: 0 0 12px;
  padding-left: 20px;
}
.privacy-body ul li { margin-bottom: 4px; }
.privacy-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 16px;
  padding: 14px;
  background: #f0f7f3;
  border: 1.5px solid #b6d9c3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a4d2e;
}
.privacy-checkbox input[type="checkbox"] {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: var(--navy, #1a4d2e);
  cursor: pointer;
}
.privacy-footer {
  padding: 16px 28px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-privacy-decline {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1.5px solid #ccc;
  background: #fff;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
}
.btn-privacy-agree {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: var(--navy, #1a4d2e);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-privacy-agree:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
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
 
/* ── Section locked badge ── */
.section-card-collapsible .section-header {
  flex-wrap: wrap;
}
.section-locked-badge {
  margin-left: auto;
  background: #f0ece0;
  color: var(--text-light);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  white-space: nowrap;
}
 
/* ── Pro-ACT pre-filled skill label ── */
.proact-skill-label {
  background: var(--readonly-bg);
  border: 1.5px solid var(--border);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
  min-width: 160px;
}
 
/* ── Row number cell ── */
.row-num-cell {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
  vertical-align: middle;
}
 
/* ── Required level badge ── */
.required-level-badge {
  background: var(--navy);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 6px;
  text-align: center;
  white-space: nowrap;
}
.required-level-empty {
  font-size: 11px;
  color: var(--text-light);
  font-style: italic;
  text-align: center;
}
 
/* ── Static value display ── */
.static-value {
  background: var(--readonly-bg);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text);
  font-weight: 600;
}
 
/* ── Reveal transition ── */
.reveal-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.reveal-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
 
/* ── Name grid ── */
.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 90px;
  gap: 12px;
  align-items: start;
}
.name-grid input {
  width: 100%;
}
.field-hint {
  display: block;
  font-size: 11px;
  color: var(--text-light);
  margin-top: 4px;
  font-weight: 500;
  letter-spacing: 0.03em;
}
 
/* ── Email prefix widget ── */
.email-prefix-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  overflow: hidden;
  transition: border-color 0.2s;
}
.email-prefix-wrapper:focus-within {
  border-color: var(--navy);
  background: var(--white);
}
.email-prefix-wrapper.error { border-color: var(--error); }
.email-prefix-wrapper.valid { border-color: var(--success); }
.email-prefix-input {
  flex: 1;
  border: none !important;
  background: transparent !important;
  border-radius: 0 !important;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text);
  outline: none;
  box-shadow: none !important;
}
.email-suffix {
  padding: 10px 12px 10px 0;
  font-size: 13px;
  color: var(--text-light);
  white-space: nowrap;
  font-weight: 500;
  background: transparent;
  border-left: 1.5px solid var(--border);
  padding-left: 10px;
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