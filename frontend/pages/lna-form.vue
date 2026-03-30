<template>
  <div>
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
            Caraga State University informs you that the personal and office information
            you provide in this <strong>USWAG Plan (LNA Tool)</strong> will be collected
            and processed for the following purposes:
          </p>
          <ul>
            <li>Assessment of your office's learning and development needs</li>
            <li>Planning of training programs and capacity-building interventions</li>
            <li>Human resource reporting and institutional planning</li>
            <li>Generation of official LNA records processed by HRMS</li>
          </ul>
          <p>
            Your information will be stored securely and accessed only by authorized
          <strong>Caraga State University, Human Resource Management Services (Learning and Development) personnel</strong>. It will not be disclosed to third parties without
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
          <NuxtLink to="/" class="btn-privacy-decline">Decline</NuxtLink>
          <button class="btn-privacy-agree" :disabled="!privacyAgreed" @click="acceptPrivacy">
            Agree &amp; Continue
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isSubmitting" class="overlay active">
      <div class="spinner"></div>
      <p>Submitting your LNA, please wait…</p>
    </div>

    <!-- Page Nav -->
    <div class="page-nav">
      <NuxtLink to="/" class="back-link">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        Back to Home
      </NuxtLink>
      <span class="nav-sep">/</span>
      <span class="nav-current">USWAG Plan (LNA Tool)</span>
    </div>

    <!-- Success Screen -->
    <div v-if="screen === 'success'" class="success-screen active">
      <div class="success-icon">&#10003;</div>
      <h2>LNA Successfully Submitted</h2>
      <p>
        The USWAG PLAN for your office has been received. HRMS has been notified
        and will process your submission accordingly.
      </p>
      <div class="ref-id-box">{{ refId }}</div>
      <p>
        Please keep your <strong>Reference ID</strong> for your records. A
        confirmation email has been sent to your address.
      </p>
    </div>

    <!-- Main Form -->
    <div v-if="screen === 'form'" class="container">
      <div class="form-title-block">
        <span class="eyebrow">HRMS — Learning &amp; Development</span>
        <h2>USWAG PLAN</h2>
        <h3>Unified System for Workforce Assessment and Growth Plan</h3>
        <p>CSU's Learning Needs Assessment (LNA) Tool</p>
      </div>

      <!-- HEADER INFO — always visible -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-num">H</div>
          <div>
            <h3>Office Information</h3>
            <p>Basic details about your office and the submitter</p>
          </div>
          <div v-if="sectionDone.header" class="section-done-badge">✓ Complete</div>
        </div>
        <div class="section-body">

          <div class="field-grid field-grid-2" style="margin-bottom: 18px">
            <div class="field-group span-2">
              <label>Your CarSU Email Address <span class="req">*</span></label>
              <div
                class="email-prefix-wrapper"
                :class="{
                  error: emailHint.type === 'error',
                  valid: emailHint.type === 'success'
                }"
              >
                <input
                  type="text"
                  v-model="form.submitterEmailPrefix"
                  class="email-prefix-input"
                  placeholder="yourname"
                  @blur="validateEmail"
                />
                <span class="email-suffix">@carsu.edu.ph</span>
              </div>
              <small class="email-hint" :class="emailHint.type">{{ emailHint.msg }}</small>
            </div>
          </div>

          <!-- Campus — static display -->
          <div class="field-group" style="margin-bottom: 20px">
            <label>Campus</label>
            <div class="static-value">CSU Main Campus</div>
          </div>

          <!-- Office Affiliation -->
          <div class="field-group" style="margin-bottom: 20px">
            <label>Office Affiliation <span class="req">*</span></label>
            <div class="checkbox-group">
              <label
                v-for="o in officeOptions"
                :key="o"
                class="checkbox-item"
                :class="{ checked: form.officeAffiliation === o }"
              >
                <input
                  type="radio"
                  name="officeAffiliation"
                  :value="o"
                  v-model="form.officeAffiliation"
                />
                {{ o }}
              </label>
            </div>
          </div>

          <div class="field-grid field-grid-2" style="margin-bottom: 18px">

            <!-- Name of Unit/Office/College — dynamic dropdown -->
            <div class="field-group span-2">
              <label>Name of Unit / Office / College <span class="req">*</span></label>
              <select
                v-if="collegeOfficeUnitOptions.length > 0"
                v-model="form.unitOfficeCollege"
              >
                <option value="">Select office / unit…</option>
                <option v-for="opt in collegeOfficeUnitOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <input
                v-else
                type="text"
                v-model="form.unitOfficeCollege"
                placeholder="e.g. College of Engineering"
              />
            </div>

            <!-- Program selector — only for OVPAA colleges with programs -->
            <div v-if="isOVPAA && selectedCollegePrograms.length > 0" class="field-group span-2" style="margin-top: 4px">
              <label>Program / Department <span class="req">*</span></label>
              <select v-model="form.collegeProgram">
                <option value="">Select program…</option>
                <option v-for="p in selectedCollegePrograms" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <!-- Head of Unit — split name fields -->
            <div class="field-group span-2">
              <label>Head of Unit/Office/College <span class="req">*</span></label>
              <div class="name-row">
                <div class="name-sub">
                  <span class="name-sub-label">Last Name</span>
                  <input type="text" v-model="form.headLastName" placeholder="Dela Cruz" />
                </div>
                <div class="name-sub">
                  <span class="name-sub-label">First Name</span>
                  <input type="text" v-model="form.headFirstName" placeholder="Juan" />
                </div>
                <div class="name-sub name-sub-mi">
                  <span class="name-sub-label">M.I.</span>
                  <input type="text" v-model="form.headMiddleInitial" placeholder="A." maxlength="3" />
                </div>
              </div>
            </div>

            <div class="field-group">
              <label>Position / Designation <span class="req">*</span></label>
              <select v-model="form.position" :disabled="!form.officeAffiliation || (isOVPAA && !form.unitOfficeCollege)">
                <option value="">Select position…</option>
                <option v-for="opt in positionOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
            <div class="field-group">
              <label>Date Prepared <span class="req">*</span></label>
              <input type="date" v-model="form.datePrepared" />
            </div>
            <div class="field-group">
              <label>Year Covered <span class="req">*</span></label>
              <select v-model="form.yearCovered">
                <option value="">Select year…</option>
                <option>2026</option>
                <option>2027</option>
                <option>2028</option>
                <option>2029</option>
              </select>
            </div>
            <div class="field-group">
              <label>Total Personnel in Your Office <span class="req">*</span></label>
              <input type="number" v-model="form.totalPersonnel" min="0" placeholder="0" />
            </div>
          </div>

          <div class="field-group">
            <label>Purpose <span class="req">*</span></label>
            <div class="checkbox-group">
              <label
                v-for="p in purposeOptions"
                :key="p"
                class="checkbox-item"
                :class="{ checked: form.purpose === p }"
              >
                <input type="radio" name="purpose" :value="p" v-model="form.purpose" />
                {{ p }}
              </label>
            </div>
            <div v-if="form.purpose === 'Other'" class="other-specify visible" style="margin-top: 10px">
              <input type="text" v-model="form.purposeOther" placeholder="Please specify..." />
            </div>
          </div>

        </div>
      </div>

      <!-- SECTION I: WORKFORCE PROFILE -->
      <div class="section-card section-card-collapsible">
        <div class="section-header">
          <div class="section-num">I</div>
          <div>
            <h3>Workforce Profile by Employment Classification and Position Level</h3>
            <p>Indicate number of personnel per classification per position level</p>
          </div>
          <div v-if="!sectionDone.header" class="section-locked-badge">Complete Section H first</div>
          <div v-else-if="sectionDone.workforce" class="section-done-badge">✓ Complete</div>
        </div>
        <transition name="reveal">
          <div v-if="sectionDone.header" class="section-body">
            <p class="section-desc">
              Indicate the number of personnel per employment classification under
              each position level within your office. Refer to
              <a href="https://drive.google.com/file/d/1V1YBawTYCJFLZEJEJwMvslaXnGi7WErg/view?usp=drive_link" target="_blank" rel="noopener noreferrer"><strong>Annex A</strong></a> for descriptions and sample positions.
            </p>
            <div class="table-wrapper">
              <table class="data-table workforce-table">
                <thead>
                  <tr>
                    <th style="min-width: 180px; text-align: left">Position Level</th>
                    <th v-for="t in employmentTypes" :key="t">{{ t }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="level in visiblePositionLevels" :key="level.key">
                    <td class="row-label">{{ level.label }}</td>
                    <td v-for="t in employmentTypeKeys" :key="t">
                      <input
                        type="number"
                        min="0"
                        v-model.number="workforce[level.key][t]"
                        style="text-align: center; width: 60px"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </transition>
      </div>

      <!-- SECTION II: COMPETENCY MAPPING -->
      <div class="section-card section-card-collapsible">
        <div class="section-header">
          <div class="section-num">II</div>
          <div>
            <h3>Competency Mapping and Assessment</h3>
            <p>Assess current competency levels across all position levels</p>
          </div>
          <div v-if="!sectionDone.workforce" class="section-locked-badge">Complete Section I first</div>
          <div v-else-if="sectionDone.competency" class="section-done-badge">✓ Complete</div>
        </div>
        <transition name="reveal">
          <div v-if="sectionDone.workforce" class="section-body">
            <div class="section-desc">
              Using the rating scale below, identify the highest competency level
              (CL: 1-4) and percentage (%) of personnel demonstrating it. Write
              <strong>N/A</strong> if the competency does not apply. For detailed
              descriptions, refer to the
              <a href="https://tinyurl.com/CompetencyManualandModel" target="_blank">Competency Manual and Model</a>.
              <div style="margin-top: 14px">
                <p><i>Rating Scale:</i></p>
                <img
                  src="/img/rating-scale.png"
                  alt="Rating Scale"
                  style="max-width: 100%; height: auto; display: block; border-radius: 6px;"
                />
              </div>
            </div>

            <!-- Position Level Tabs -->
            <div class="comp-tabs">
              <button
                v-for="lv in visibleCompLevelHeaders"
                :key="lv"
                class="comp-tab"
                :class="{ active: activeCompTab === lv }"
                @click="activeCompTab = lv"
              >
                {{ lv }}
              </button>
            </div>

            <!-- Tab Content: one position level at a time -->
            <div v-for="(lvKey, lvIdx) in visibleCompLevelKeys" :key="lvKey">
              <div v-show="activeCompTab === visibleCompLevelHeaders[lvIdx]">
                <div v-for="cluster in competencyClusters" :key="cluster.key" class="comp-table-wrap">
                  <div class="comp-cluster-label">
                    {{ cluster.name }} Competencies
                    <span class="cluster-badge">{{ cluster.badge }}</span>
                  </div>
                  <p class="comp-note" style="padding: 8px 0 4px">
                    {{ clusterLevelNote[cluster.key]?.[lvKey] || cluster.note }}
                  </p>
                  <p class="comp-caption" style="padding: 0 0 10px">
                    Assess the competencies of <strong>{{ levelFormalLabel[lvKey] }}</strong> employees within each cluster by selecting the appropriate entries in the respective columns.
                  </p>
                  <div class="table-wrapper">
                    <table class="data-table comp-page-table">
                      <thead>
                        <tr>
                          <th style="min-width: 200px">Competency</th>
                          <th style="width: 180px; text-align: center">Competency Level (CL)</th>
                          <th style="width: 180px; text-align: center">Percentage (%)</th>
                          <th style="min-width: 200px">Basis / Key Observations</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(comp, idx) in cluster.competencies" :key="comp">
                          <td class="row-label">{{ comp }}</td>
                          <td>
                            <select
                              v-model="competencyData[cluster.key][idx][lvKey + '_cl']"
                              class="comp-select"
                              :class="{ 'comp-select-error': compValidated && !(competencyData[cluster.key][idx][lvKey + '_cl'] || '').trim() }"
                            >
                              <option v-for="o in clOptions" :key="o" :value="o">{{ o || "---" }}</option>
                            </select>
                            <span v-if="compValidated && !(competencyData[cluster.key][idx][lvKey + '_cl'] || '').trim()" class="comp-field-error">Required</span>
                          </td>
                          <td>
                            <select
                              v-model="competencyData[cluster.key][idx][lvKey + '_pct']"
                              class="comp-select"
                              :class="{ 'comp-select-error': compValidated && !(competencyData[cluster.key][idx][lvKey + '_pct'] || '').trim() }"
                            >
                              <option v-for="o in pctOptions" :key="o" :value="o">{{ o || "---" }}</option>
                            </select>
                            <span v-if="compValidated && !(competencyData[cluster.key][idx][lvKey + '_pct'] || '').trim()" class="comp-field-error">Required</span>
                          </td>
                          <td>
                            <textarea rows="2" v-model="competencyData[cluster.key][idx].observations" placeholder="Observations..."></textarea>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Prev / Next navigation -->
                <div class="comp-tab-nav">
                  <button
                    class="btn-tab-nav"
                    :disabled="lvIdx === 0"
                    @click="activeCompTab = visibleCompLevelHeaders[lvIdx - 1]"
                  >
                    ← Previous
                  </button>
                  <span class="comp-tab-page">{{ lvIdx + 1 }} / {{ visibleCompLevelKeys.length }}</span>
                  <button
                    class="btn-tab-nav"
                    :disabled="lvIdx === visibleCompLevelKeys.length - 1"
                    @click="compValidated = true; activeCompTab = visibleCompLevelHeaders[lvIdx + 1]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            <hr class="subsection-divider" />
            <h4 style="font-family: 'Playfair Display', serif; color: var(--navy); margin-bottom: 12px; font-size: 16px;">
              Competency Cluster Summary
            </h4>
            <div v-for="lvSummary in activeClusterSummary" :key="lvSummary.levelKey" style="margin-bottom: 32px;">
              <h5 class="cluster-summary-level-label">{{ lvSummary.levelLabel }}</h5>
              <p class="comp-caption" style="margin-bottom: 10px;">
                Assess the competencies of <strong>{{ lvSummary.levelLabel }}</strong> employees within each cluster by selecting the appropriate entries in the respective columns.
              </p>
              <div class="table-wrapper">
                <table class="data-table cluster-summary-table">
                  <thead>
                    <tr>
                      <th>Competency Cluster</th>
                      <th>Strongest Competency</th>
                      <th>Weakest Competency</th>
                      <th style="width: 160px">Intervention Needed?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in lvSummary.rows" :key="c.cluster">
                      <td class="row-label">{{ c.cluster }}</td>
                      <td>
                        <select v-model="c.strongest">
                          <option value="">Select competency…</option>
                          <option
                            v-for="comp in clusterCompetencyMap[c.cluster]"
                            :key="'s-' + lvSummary.levelKey + comp"
                            :value="comp"
                          >{{ comp }}</option>
                        </select>
                      </td>
                      <td>
                        <select v-model="c.weakest">
                          <option value="">Select competency…</option>
                          <option
                            v-for="comp in clusterCompetencyMap[c.cluster]"
                            :key="'w-' + lvSummary.levelKey + comp"
                            :value="comp"
                          >{{ comp }}</option>
                        </select>
                      </td>
                      <td>
                        <select v-model="c.interventionNeeded">
                          <option value="">---</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- SECTION III: OTHER LeaD DATA SOURCES -->
      <div class="section-card section-card-collapsible">
        <div class="section-header">
          <div class="section-num">III</div>
          <div>
            <h3>Other LeaD Data Sources</h3>
            <p>Data sources used to identify additional learning needs</p>
          </div>
          <div v-if="!sectionDone.competency" class="section-locked-badge">Complete Section II first</div>
          <div v-else-if="sectionDone.dataSources" class="section-done-badge">✓ Complete</div>
        </div>
        <transition name="reveal">
          <div v-if="sectionDone.competency" class="section-body">
            <p class="section-desc">
              In addition to the competency assessment, indicate the data sources
              your office used to identify additional learning needs. You may also
              summarize insights or gaps surfaced from these sources.
            </p>

            <h4 class="subsec-label">A. Data Source Checklist</h4>
            <div class="source-checklist">
              <label
                v-for="src in dataSources"
                :key="src.value"
                class="source-item"
                :class="{ checked: form.selectedSources.includes(src.value) }"
              >
                <input type="checkbox" :value="src.value" v-model="form.selectedSources" />
                {{ src.label }}
              </label>
            </div>
            <div v-if="form.selectedSources.includes('Others')" style="margin-top: 10px">
              <input type="text" v-model="form.othersSourceText" placeholder="Please specify other data sources..." />
            </div>

            <hr class="subsection-divider" />

            <h4 class="subsec-label">B. Summary of Key Insights or Gaps Identified</h4>
            <div v-if="insightRows.length === 0" style="padding: 16px; color: var(--text-light); font-size: 13px; font-style: italic;">
              Select at least one data source above to populate this table.
            </div>
            <div v-else class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px">No.</th>
                    <th style="min-width: 200px">Data Source</th>
                    <th>Identified Competency Gap / Issue</th>
                    <th>Relevant Personnel / Function</th>
                    <th>Recommended Intervention (if any)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in insightRows" :key="row.dataSource">
                    <td style="text-align: center; color: var(--text-light); font-weight: 600;">{{ idx + 1 }}</td>
                    <td class="row-label" style="font-size: 13px; white-space: normal;">{{ row.dataSource }}</td>
                    <td><textarea rows="2" v-model="row.gap" placeholder="Identified gap or issue..."></textarea></td>
                    <td>
                      <div class="personnel-checks">
                        <label v-for="opt in personnelLevelOptions" :key="opt" class="personnel-check-item" :class="{ checked: row.personnel.includes(opt) }">
                          <input type="checkbox" :value="opt" v-model="row.personnel" />
                          {{ opt }}
                        </label>
                      </div>
                    </td>
                    <td><select v-model="row.intervention" style="min-width:200px">
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
                    </select></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </transition>
      </div>

      <!-- CERTIFICATION -->
      <div class="section-card section-card-collapsible">
        <div class="section-header">
          <div class="section-num">IV</div>
          <div>
            <h3>Certification</h3>
            <p>Rater / Head of Office declaration</p>
          </div>
          <div v-if="!sectionDone.dataSources" class="section-locked-badge">Complete Section III first</div>
        </div>
        <transition name="reveal">
          <div v-if="sectionDone.dataSources" class="section-body">
            <div class="certification-box">
              <p>
                I hereby certify that the information provided in this Learning
                Needs Assessment is accurate and based on actual observation,
                data, and evidence gathered from the office.
              </p>
              <div class="field-group">
                <label>Full Name of Rater / Head of Office <span class="req">*</span></label>
                <input type="text" v-model="form.raterFullName" placeholder="Enter full name" style="max-width: 400px" />
              </div>
              <small style="font-size: 11px; color: var(--text-light); display: block; margin-top: 8px;">
                Signature over Printed Name of Rater/Head of Office
              </small>
            </div>
          </div>
        </transition>
      </div>

      <!-- SUBMIT -->
      <transition name="reveal">
        <div v-if="sectionDone.certification" class="submit-area">
          <p>
            By submitting, you confirm that all information is accurate and based
            on actual office data. HRMS will be notified immediately upon submission.
          </p>
          <button class="btn-submit" :disabled="isSubmitting" @click="submitForm">
            Submit LNA
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";

const config = useRuntimeConfig();
const API = config.public.apiBase;

// ── Privacy Modal ──
const showPrivacyModal = ref(true);
const privacyAgreed = ref(false);
function acceptPrivacy() {
  if (privacyAgreed.value) showPrivacyModal.value = false;
}

const screen = ref("form");
const isSubmitting = ref(false);
const refId = ref("");

// ── EMAIL HINT STATE ──
const emailHint = reactive({ msg: "", type: "" });

// ── CONSTANTS ──
const officeOptions = [
  "OVPAF",
  "OVPAA",
  "OVPEO",
  "OVPRDIE",
  "OVPSAS",
];

const purposeOptions = [
  "Initial Assessment",
  "Mid-Year Review",
  "Annual Review",
  "Other",
];

const employmentTypes = [
  "Permanent", "Temporary", "Contractual", "Casual",
  "Coterminus", "COS", "Job Order", "Others",
];
const employmentTypeKeys = [
  "permanent", "temporary", "contractual", "casual",
  "coterminus", "cos", "jobOrder", "others",
];

const positionLevels = [
  { key: "first",        label: "First Level Positions" },
  { key: "secondNonSup", label: "Second Level (Non-Supervisory)" },
  { key: "secondSup",    label: "Second Level (Supervisory)" },
  { key: "third",        label: "Third Level Positions" },
  { key: "faculty",      label: "Faculty Positions" },
];

const compLevelHeaders = ["1st Level", "2nd level (Non-Supervisory)", "2nd level (Supervisory)", "3rd Level", "Faculty"];
const compLevelKeys    = ["first", "secondNonSup", "secondSup", "third", "faculty"];

// Derived after workforce is initialized (see below) — placeholder refs used in template
// until the real computeds are declared post-workforce.
const activeCompTab = ref("1st Level");
const compValidated = ref(false); // true after user tries to advance past Section II with empty cells

const clOptions  = ["", "N/A", "1 - Basic", "2 - Intermediate", "3 - Advanced", "4 - Expert"];
const pctOptions = ["", "N/A", "A - 76%-100%", "B - 51%-75%", "C - 26%-50%", "D - 25% & below"];

const COMPETENCIES = {
  core: [
    "Integrity", "Accountability", "Scientific & Technological Excellence",
    "Delivering Service Excellence", "Environmental Consciousness", "Building Partnership",
  ],
  leadership: [
    "Developing People", "Facilitating Change", "Conflict Management",
    "Leading Innovation", "Strategic Planning", "Leading Others", "Decisiveness",
  ],
  org: [
    "Teamwork", "Commitment to Learning", "Customer Focus", "Adaptability and Flexibility",
    "Critical Thinking", "Effective Communication", "Valuing Diversity",
    "Self-Awareness and Confidence", "Stress Tolerance", "Resource Management",
    "Knowledge Management", "Initiative", "Result Orientation", "Community Engagement",
    "Organizational Commitment", "Planning and Organizing",
    "Emotional and Psychological Maturity", "Safety and Risk Management",
    "Interpersonal Effectiveness",
  ],
  technical: [
    "Research Engagement", "Diagnostic Information Gathering", "Attention to Details",
    "Written Communication", "Oral Communication", "Conceptual and Analytical Thinking",
    "Computer Literacy", "Planning and Project Management", "Logical Reasoning",
  ],
};

// Maps cluster display name → its competency list (used by Cluster Summary dropdowns)
const clusterCompetencyMap = {
  Core:           COMPETENCIES.core,
  Leadership:     COMPETENCIES.leadership,
  Organizational: COMPETENCIES.org,
  Technical:      COMPETENCIES.technical,
};

const competencyClusters = [
  { key: "core",       name: "Core",          badge: "Core",           note: "Foundational attributes expected of all personnel regardless of position.",      competencies: COMPETENCIES.core },
  { key: "leadership", name: "Leadership",     badge: "Leadership",     note: "Skills and behaviors required to effectively lead individuals, teams, and units.", competencies: COMPETENCIES.leadership },
  { key: "org",        name: "Organizational", badge: "Organizational", note: "Collective attributes that define the institution's way of working.",              competencies: COMPETENCIES.org },
  { key: "technical",  name: "Technical",      badge: "Technical",      note: "Job-specific knowledge, skills, and abilities for effective role performance.",    competencies: COMPETENCIES.technical },
];

const dataSources = [
  { value: "Individual Development Plan (IDP)",                      label: "Individual Development Plan (IDP)" },
  { value: "Training Evaluation Results",                            label: "Training Evaluation Results" },
  { value: "HR Records (Coaching logs, leave patterns, discipline)", label: "HR Records" },
  { value: "IPCR/OPCR/DPCR Reviews",                                label: "IPCR/OPCR/DPCR Reviews" },
  { value: "Audit or Accreditation Results (ISO, AACCUP, etc.)",    label: "Audit / Accreditation Results" },
  { value: "Strategic Plan or SPMS Review",                         label: "Strategic Plan / SPMS Review" },
  { value: "Focus Group Discussion (FGD)",                          label: "Focus Group Discussion (FGD)" },
  { value: "Client/Stakeholder Feedback",                           label: "Client/Stakeholder Feedback" },
  { value: "Risk Assessment",                                        label: "Risk Assessment" },
  { value: "Interview",                                              label: "Interview" },
  { value: "Questionnaire",                                          label: "Questionnaire" },
  { value: "Test",                                                   label: "Test" },
  { value: "Others",                                                 label: "Others" },
];

// ── OFFICE/UNIT MAP ──
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

// ── FORM STATE ──
const form = reactive({
  submitterEmailPrefix: "",
  submitterEmail: "",
  officeAffiliation: "",
  unitOfficeCollege: "",
  collegeProgram: "",
  headLastName: "",
  headFirstName: "",
  headMiddleInitial: "",
  position: "",
  datePrepared: "",
  yearCovered: "",
  totalPersonnel: "",
  purpose: "",
  purposeOther: "",
  selectedSources: [],
  othersSourceText: "",
  raterFullName: "",
});

// ── COMPUTED ──
const isOVPAA = computed(() => form.officeAffiliation === "OVPAA");

const headOfUnitFull = computed(() => {
  const first = form.headFirstName.trim();
  const mi    = form.headMiddleInitial.trim();
  const last  = form.headLastName.trim();
  return [first, mi ? mi + '.' : '', last].filter(Boolean).join(' ');
});

const positionOptions = computed(() => {
  if (form.officeAffiliation === "OVPAA") {
    const unit = (form.unitOfficeCollege || "").toLowerCase().trim();
    if (!unit) return ["Dean", "Chairperson", "Director"];
    if (unit.startsWith("college of") || unit === "professional schools") return ["Dean", "Chairperson"];
    return ["Director"];
  }
  if (["OVPAF", "OVPEO", "OVPRDIE", "OVPSAS"].includes(form.officeAffiliation)) return ["Director"];
  return [];
});

watch(positionOptions, (newOpts) => {
  if (!newOpts.includes(form.position)) {
    form.position = newOpts.length === 1 ? newOpts[0] : "";
  }
});

const visiblePositionLevels = computed(() =>
  positionLevels.filter(lv =>
    lv.key !== "faculty" || form.officeAffiliation === "OVPAA"
  )
);

// ── PROGRESSIVE DISCLOSURE ──
const sectionDone = computed(() => {
  const emailOk = /^[a-zA-Z0-9._%+\-]+$/.test((form.submitterEmailPrefix || "").trim());
  const programRequired = isOVPAA.value && selectedCollegePrograms.value.length > 0;

  const header = !!(
    emailOk &&
    form.officeAffiliation &&
    form.unitOfficeCollege &&
    (!programRequired || form.collegeProgram) &&
    form.headLastName.trim() &&
    form.headFirstName.trim() &&
    form.position &&
    form.datePrepared &&
    form.yearCovered &&
    form.totalPersonnel !== "" && form.totalPersonnel !== null &&
    form.purpose &&
    (form.purpose !== "Other" || form.purposeOther.trim())
  );

  // Workforce: always done once Section H is complete — cells default to 0
  const workforceDone = true;

  // Competency: cluster summary complete + all CL/pct cells filled for active levels
  const clusterSummaryDone = activeClusterSummary.value.length > 0 &&
    activeClusterSummary.value.every(({ rows }) =>
      rows.every(c => c.strongest && c.weakest && c.interventionNeeded)
    );
  const activeLvKeys = (() => {
    const baseKeys = (form.officeAffiliation === "OVPAA" ? compLevelKeys : compLevelKeys.filter(k => k !== "faculty"));
    return baseKeys.filter(k => { const row = workforce?.[k]; if (!row) return false; return employmentTypeKeys.some(t => Number(row[t]) > 0); });
  })();
  const clDataFilled = Object.entries(competencyData).every(([, rows]) =>
    rows.every(row =>
      activeLvKeys.every(k => (row[k + "_cl"] || "").trim() !== "" && (row[k + "_pct"] || "").trim() !== "")
    )
  );
  const competency = clusterSummaryDone && clDataFilled;

  // Data sources: at least one source selected
  const dataSourcesDone = form.selectedSources.length > 0;

  // Certification: rater name filled
  const certification = !!form.raterFullName.trim();

  return { header, workforce: workforceDone, competency, dataSources: dataSourcesDone, certification };
});

const collegeOfficeUnitOptions = computed(() => {
  const list = subOfficeMap[form.officeAffiliation] || [];
  if (isOVPAA.value) return list.map(c => typeof c === "string" ? c : c.name);
  return list;
});

const selectedCollegePrograms = computed(() => {
  if (!isOVPAA.value) return [];
  const colleges = subOfficeMap["OVPAA"] || [];
  const found = colleges.find(c => typeof c === "object" && c.name === form.unitOfficeCollege);
  return found ? found.programs : [];
});

// ── WATCHERS ──
watch(() => form.officeAffiliation, () => {
  form.unitOfficeCollege = "";
  form.collegeProgram = "";
  form.position = "";
});

watch(() => form.unitOfficeCollege, () => {
  form.collegeProgram = "";
  form.position = "";
});

// ── WORKFORCE — all cells default to 0 ──
const workforce = reactive(
  Object.fromEntries(
    positionLevels.map((lv) => [
      lv.key,
      Object.fromEntries(employmentTypeKeys.map((t) => [t, 0])),
    ]),
  ),
);

// Filter out position levels where every employment type cell is 0.
// Also exclude Faculty for non-OVPAA offices.
const activeCompLevelKeys = computed(() => {
  const affiliation = form?.officeAffiliation ?? "";
  const baseKeys = affiliation === "OVPAA"
    ? compLevelKeys
    : compLevelKeys.filter(k => k !== "faculty");

  return baseKeys.filter(k => {
    const row = workforce?.[k];
    if (!row) return false;
    return employmentTypeKeys.some(t => Number(row[t]) > 0);
  });
});

const visibleCompLevelKeys = computed(() => activeCompLevelKeys.value);

const visibleCompLevelHeaders = computed(() =>
  activeCompLevelKeys.value.map(k => compLevelHeaders[compLevelKeys.indexOf(k)])
);

// If the active tab gets zeroed out, reset to the first available tab.
watch(visibleCompLevelHeaders, (newHeaders) => {
  if (newHeaders.length > 0 && !newHeaders.includes(activeCompTab.value)) {
    activeCompTab.value = newHeaders[0];
  }
});

const makeCompRow = (comp) => ({
  competency: comp,
  ...Object.fromEntries(
    compLevelKeys.flatMap((lv) => [
      [lv + "_cl", ""],
      [lv + "_pct", ""],
    ]),
  ),
  observations: "",
});

const competencyData = reactive(
  Object.fromEntries(
    Object.entries(COMPETENCIES).map(([key, comps]) => [
      key,
      comps.map(makeCompRow),
    ]),
  ),
);

// Per-level cluster summary: { [levelKey]: [{ cluster, strongest, weakest, interventionNeeded }] }
const makeClusterSummaryRows = () => [
  { cluster: "Core",           strongest: "", weakest: "", interventionNeeded: "" },
  { cluster: "Leadership",     strongest: "", weakest: "", interventionNeeded: "" },
  { cluster: "Organizational", strongest: "", weakest: "", interventionNeeded: "" },
  { cluster: "Technical",      strongest: "", weakest: "", interventionNeeded: "" },
];

const clusterSummaryByLevel = reactive(
  Object.fromEntries(compLevelKeys.map(k => [k, makeClusterSummaryRows()]))
);

// Computed: cluster summary rows for only the active levels
const activeClusterSummary = computed(() =>
  activeCompLevelKeys.value.map(k => ({
    levelKey:   k,
    levelLabel: levelFormalLabel[k],
    rows:       clusterSummaryByLevel[k],
  }))
);

// ── Level-aware competency labels ──
// Maps level key to its full formal label
const levelFormalLabel = {
  first:        "First Level Positions",
  secondNonSup: "Second Level (Non-Supervisory) Positions",
  secondSup:    "Second Level (Supervisory) Positions",
  third:        "Third Level Positions",
  faculty:      "Faculty Positions",
};

// Per-cluster, per-level formal description shown above the table
const clusterLevelNote = {
  core: {
    first:        "Foundational attributes expected of all personnel regardless of position. These apply to First Level Positions.",
    secondNonSup: "Foundational attributes expected of all personnel regardless of position. These apply to Second Level (Non-Supervisory) Positions.",
    secondSup:    "Foundational attributes expected of all personnel regardless of position. These apply to Second Level (Supervisory) Positions.",
    third:        "Foundational attributes expected of all personnel regardless of position. These apply to Third Level Positions.",
    faculty:      "Foundational attributes expected of all personnel regardless of position. These apply to Faculty Positions.",
  },
  leadership: {
    first:        "Skills and behaviors required to effectively lead individuals, teams, and units. Assessed for First Level Positions.",
    secondNonSup: "Skills and behaviors required to effectively lead individuals, teams, and units. Assessed for Second Level (Non-Supervisory) Positions.",
    secondSup:    "Skills and behaviors required to effectively lead individuals, teams, and units. Assessed for Second Level (Supervisory) Positions.",
    third:        "Skills and behaviors required to effectively lead individuals, teams, and units. Assessed for Third Level Positions.",
    faculty:      "Skills and behaviors required to effectively lead individuals, teams, and units. Assessed for Faculty Positions.",
  },
  org: {
    first:        "Collective attributes that define the institution's way of working. Assessed for First Level Positions.",
    secondNonSup: "Collective attributes that define the institution's way of working. Assessed for Second Level (Non-Supervisory) Positions.",
    secondSup:    "Collective attributes that define the institution's way of working. Assessed for Second Level (Supervisory) Positions.",
    third:        "Collective attributes that define the institution's way of working. Assessed for Third Level Positions.",
    faculty:      "Collective attributes that define the institution's way of working. Assessed for Faculty Positions.",
  },
  technical: {
    first:        "Job-specific knowledge, skills, and abilities for effective role performance. Assessed for First Level Positions.",
    secondNonSup: "Job-specific knowledge, skills, and abilities for effective role performance. Assessed for Second Level (Non-Supervisory) Positions.",
    secondSup:    "Job-specific knowledge, skills, and abilities for effective role performance. Assessed for Second Level (Supervisory) Positions.",
    third:        "Job-specific knowledge, skills, and abilities for effective role performance. Assessed for Third Level Positions.",
    faculty:      "Job-specific knowledge, skills, and abilities for effective role performance. Assessed for Faculty Positions.",
  },
};

// Personnel / function options for insight rows
const personnelLevelOptions = [
  "First Level Positions",
  "Second Level (Supervisory)",
  "Second Level (Non-Supervisory)",
  "Third Level Positions",
  "Faculty Positions",
];

const insightRows = reactive([]);

// Sync insightRows whenever selectedSources changes
watch(
  () => [...form.selectedSources],
  (newSources) => {
    const resolvedSources = newSources.map(val => {
      if (val === "Others") {
        return form.othersSourceText.trim() ? "Others: " + form.othersSourceText.trim() : "Others";
      }
      return val;
    });

    // Remove rows for sources that are gone
    for (let i = insightRows.length - 1; i >= 0; i--) {
      const row = insightRows[i];
      const isOthers = row.dataSource.startsWith("Others");
      const stillPresent = isOthers
        ? newSources.includes("Others")
        : newSources.includes(row.dataSource);
      if (!stillPresent) insightRows.splice(i, 1);
    }

    // Add rows for newly checked sources
    resolvedSources.forEach(src => {
      const exists = insightRows.some(r =>
        r.dataSource === src ||
        (src.startsWith("Others") && r.dataSource.startsWith("Others"))
      );
      if (!exists) {
        insightRows.push({ dataSource: src, gap: "", personnel: [], intervention: "" });
      }
    });
  },
  { deep: true }
);

// Update "Others" row label when othersSourceText changes
watch(
  () => form.othersSourceText,
  (val) => {
    const idx = insightRows.findIndex(r => r.dataSource.startsWith("Others"));
    if (idx !== -1) {
      insightRows[idx].dataSource = val.trim() ? "Others: " + val.trim() : "Others";
    }
  }
);

// ── METHODS ──
function validateEmail() {
  const prefix = (form.submitterEmailPrefix || "").trim();
  form.submitterEmail = prefix + "@carsu.edu.ph";

  if (!prefix) {
    emailHint.msg  = "";
    emailHint.type = "";
    return false;
  }
  if (!/^[a-zA-Z0-9._%+\-]+$/.test(prefix)) {
    emailHint.msg  = "Invalid characters in email prefix.";
    emailHint.type = "error";
    return false;
  }
  emailHint.msg  = "✓ Valid CarSU email";
  emailHint.type = "success";
  return true;
}

function validate() {
  const requiredFields = [
    ["unitOfficeCollege", "Unit/Office/College"],
    ["position",          "Position"],
    ["datePrepared",      "Date Prepared"],
    ["yearCovered",       "Year Covered"],
    ["totalPersonnel",    "Total Personnel in Your Office"],
    ["raterFullName",     "Rater Full Name"],
  ];
  for (const [field] of requiredFields) {
    if (!String(form[field] || "").trim()) {
      alert("Please fill in all required fields.");
      return false;
    }
  }

  if (!form.headLastName.trim() || !form.headFirstName.trim()) {
    alert("Please fill in the Head of Unit/Office/College Last Name and First Name.");
    return false;
  }

  form.submitterEmail = (form.submitterEmailPrefix || "").trim() + "@carsu.edu.ph";
  if (!validateEmail()) {
    alert("Please enter a valid CarSU email prefix.");
    return false;
  }
  if (!form.officeAffiliation) {
    alert("Please select an Office Affiliation.");
    return false;
  }
  if (!form.purpose) {
    alert("Please select a Purpose.");
    return false;
  }
  return true;
}

async function submitForm() {
  if (!validate()) return;
  isSubmitting.value = true;

  let purpose = form.purpose === "Other" ? form.purposeOther || "Other" : form.purpose;

  let selectedSources = [...form.selectedSources];
  if (selectedSources.includes("Others")) {
    selectedSources = selectedSources.filter((v) => v !== "Others");
    if (form.othersSourceText.trim())
      selectedSources.push("Others: " + form.othersSourceText.trim());
  }

  const payload = {
    submitterEmail:    form.submitterEmail,
    campus:            "CSU Main Campus",
    officeAffiliation: form.officeAffiliation,
    office:            form.unitOfficeCollege.trim(),   // matches entity column `office`
    collegeProgram:    form.collegeProgram.trim(),
    headOfUnit:        headOfUnitFull.value,            // matches entity column `headOfUnit`
    position:          form.position.trim(),
    datePrepared:      form.datePrepared,
    yearCovered:       form.yearCovered.trim(),
    totalPersonnel:    form.totalPersonnel,
    purpose,
    workforceProfile:   workforce,
    coreCompetencies:   competencyData.core,
    leadershipComps:    competencyData.leadership,
    orgComps:           competencyData.org,
    technicalComps:     competencyData.technical,
    clusterSummaryRaw:  Object.fromEntries(
      activeCompLevelKeys.value.map(k => [k, clusterSummaryByLevel[k]])
    ),                                               // matches entity column `clusterSummaryRaw`
    dataSourcesRaw:     selectedSources,               // matches entity column `dataSourcesRaw`
    dataSourceInsights: insightRows.map(r => ({ ...r, personnel: Array.isArray(r.personnel) ? r.personnel.join(", ") : r.personnel })),
    // raterFullName removed — raterName is not a field in this form; headOfUnit is used in certification
  };

  try {
    const res = await fetch(`${API}/api/lna`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.refId) {
      refId.value = data.refId;
      screen.value = "success";
    } else {
      alert("Submission failed: " + (data.error || "Unknown error"));
    }
  } catch {
    alert("Network error. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  form.datePrepared = new Date().toISOString().split("T")[0];
});
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
  --shadow: 0 4px 24px rgba(26, 77, 46, 0.1);
  --shadow-sm: 0 2px 8px rgba(26, 77, 46, 0.07);
}
* { box-sizing: border-box; margin: 0; padding: 0; }

.page-nav {
  background: var(--navy); padding: 0 28px;
  display: flex; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.page-nav a.back-link {
  display: inline-flex; align-items: center; gap: 9px; padding: 10px 0;
  color: rgba(255,255,255,0.75); text-decoration: none;
  font-size: 12.5px; font-weight: 500; letter-spacing: 0.02em;
  transition: color 0.2s; position: relative;
}
.page-nav a.back-link::after {
  content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: var(--gold); transform: scaleX(0); transform-origin: left;
  transition: transform 0.25s ease;
}
.page-nav a.back-link:hover { color: #fff; }
.page-nav a.back-link:hover::after { transform: scaleX(1); }
.page-nav a.back-link svg {
  width: 13px; height: 13px; stroke: currentColor; fill: none;
  stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
  transition: transform 0.2s; flex-shrink: 0; opacity: 0.8;
}
.page-nav a.back-link:hover svg { transform: translateX(-3px); opacity: 1; }
.nav-sep { color: rgba(255,255,255,0.25); font-size: 13px; margin: 0 10px; user-select: none; }
.nav-current { font-size: 12.5px; color: var(--gold); font-weight: 600; letter-spacing: 0.03em; }

.container { max-width: 1140px; margin: 0 auto; padding: 48px 40px 80px; }

.form-title-block {
  text-align: center; margin-bottom: 40px;
  padding-bottom: 32px; border-bottom: 3px solid var(--navy);
}
.form-title-block .eyebrow {
  font-size: 11px; font-weight: 600; color: var(--gold);
  letter-spacing: 0.14em; text-transform: uppercase; display: block; margin-bottom: 10px;
}
.form-title-block h2 { font-family: "Playfair Display", serif; font-size: 28px; color: var(--navy); margin-bottom: 4px; }
.form-title-block h3 { font-family: "Playfair Display", serif; font-size: 16px; color: var(--text-light); font-weight: 600; font-style: italic; margin-bottom: 8px; }
.form-title-block p  { color: var(--text-light); font-size: 14px; }

.section-card {
  background: var(--white); border-radius: 12px; box-shadow: var(--shadow-sm);
  margin-bottom: 28px; overflow: hidden; border: 1px solid var(--border);
  animation: fadeUp 0.4s ease both;
}
.section-header { background: var(--navy); padding: 16px 28px; display: flex; align-items: center; gap: 12px; }
.section-num {
  background: var(--gold); color: var(--navy); width: 28px; height: 28px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; flex-shrink: 0;
}
.section-header h3 { color: var(--white); font-size: 15px; font-weight: 600; letter-spacing: 0.03em; }
.section-header p  { color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 1px; }
.section-body { padding: 36px; }

.field-grid   { display: grid; gap: 18px; }
.field-grid-2 { grid-template-columns: 1fr 1fr; }
.field-group  { display: flex; flex-direction: column; gap: 6px; }
.field-group.span-2 { grid-column: span 2; }

label { font-size: 12px; font-weight: 600; color: var(--navy-mid); text-transform: uppercase; letter-spacing: 0.05em; }
.req  { color: var(--error); margin-left: 2px; }

input[type="text"],
input[type="email"],
input[type="date"],
input[type="number"],
select,
textarea {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: 8px;
  background: var(--input-bg); font-family: "Source Sans 3", sans-serif;
  font-size: 14px; color: var(--text);
  transition: border-color 0.2s, box-shadow 0.2s; outline: none;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--navy); box-shadow: 0 0 0 3px rgba(26,77,46,0.08); background: var(--white);
}
input.error { border-color: var(--error); }
textarea { resize: vertical; min-height: 72px; }

/* ── Email prefix widget ── */
.email-prefix-wrapper {
  display: flex; align-items: center;
  border: 1.5px solid var(--border); border-radius: 8px;
  background: var(--input-bg); overflow: hidden; transition: border-color 0.2s;
}
.email-prefix-wrapper:focus-within {
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(26,77,46,0.08);
  background: var(--white);
}
.email-prefix-wrapper.error { border-color: var(--error); }
.email-prefix-wrapper.valid { border-color: var(--success); }
.email-prefix-input {
  flex: 1; border: none !important; background: transparent !important;
  border-radius: 0 !important; padding: 10px 12px;
  font-size: 14px; color: var(--text); outline: none; box-shadow: none !important;
}
.email-suffix {
  padding: 10px 12px 10px 10px; font-size: 13px; color: var(--text-light);
  white-space: nowrap; font-weight: 500; background: transparent;
  border-left: 1.5px solid var(--border);
}

.email-hint         { font-size: 12px; margin-top: 2px; min-height: 16px; display: block; }
.email-hint.error   { color: var(--error); }
.email-hint.success { color: var(--success); }

/* ── Split name row ── */
.name-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.name-sub {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.name-sub-mi {
  flex: 0 0 80px;
}
.name-sub-label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.checkbox-group { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
.checkbox-item {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 8px 14px; border: 1.5px solid var(--border); border-radius: 8px;
  background: var(--input-bg); transition: all 0.2s;
  font-size: 13px; text-transform: none; letter-spacing: 0; font-weight: 400; color: var(--text);
}
.checkbox-item:hover { border-color: var(--navy); background: var(--white); }
.checkbox-item input { width: auto; padding: 0; border: none; background: none; accent-color: var(--navy); cursor: pointer; }
.checkbox-item.checked { border-color: var(--navy); background: rgba(26,77,46,0.05); }

.other-specify { margin-top: 10px; display: none; }
.other-specify.visible { display: block; }

.section-desc {
  background: rgba(245,195,0,0.1); border-left: 3px solid var(--gold);
  padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;
  font-size: 13px; color: var(--text-light); line-height: 1.6;
}
.section-desc a { color: var(--navy); }

.table-wrapper { overflow-x: auto; margin-top: 8px; }
.data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
.data-table thead tr { background: var(--navy-mid); }
.data-table thead th {
  padding: 10px 12px; color: var(--white); font-weight: 600; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.05em; text-align: left;
  border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap;
}
.data-table thead th:last-child { border-right: none; }
.data-table tbody tr { border-bottom: 1px solid var(--border); }
.data-table tbody tr:nth-child(even) { background: #faf9f6; }
.data-table tbody td { padding: 8px 10px; vertical-align: middle; border-right: 1px solid var(--border); }
.data-table tbody td:last-child { border-right: none; }
.data-table td input,
.data-table td select,
.data-table td textarea { padding: 6px 10px; font-size: 13px; border-radius: 6px; }
.data-table td textarea { min-height: 56px; }
.row-label { font-weight: 600; color: var(--navy-mid); background: rgba(26,77,46,0.03) !important; white-space: nowrap; }

.workforce-table th, .workforce-table td { text-align: center; }
.workforce-table td:first-child { text-align: left; }

.comp-table-wrap { margin-bottom: 32px; }
.comp-cluster-label {
  background: var(--navy); color: var(--white);
  font-family: "Playfair Display", serif; font-size: 14px; font-weight: 600;
  padding: 10px 16px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; gap: 10px;
}
.cluster-badge {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  background: rgba(245,195,0,0.2); border: 1px solid rgba(245,195,0,0.4);
  color: var(--gold-light); padding: 3px 10px; border-radius: 20px;
}
.comp-note { font-size: 12px; color: var(--text-light); font-style: italic; margin-bottom: 8px; }
.cluster-summary-table thead th:first-child { width: 140px; }

.source-checklist { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 8px; }
.source-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg);
  font-size: 13px; cursor: pointer; transition: all 0.2s;
  text-transform: none; letter-spacing: 0; font-weight: 400; color: var(--text);
}
.source-item:hover { border-color: var(--navy); background: var(--white); }
.source-item input { accent-color: var(--navy); cursor: pointer; flex-shrink: 0; width: auto; padding: 0; border: none; background: none; }
.source-item.checked { border-color: var(--navy); background: rgba(26,77,46,0.04); }

.certification-box {
  background: rgba(201,168,76,0.08); border: 1.5px solid var(--gold);
  border-radius: 10px; padding: 24px 28px; margin-top: 8px;
}
.certification-box p { font-size: 13px; color: var(--text-light); font-style: italic; margin-bottom: 16px; }

.submit-area {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 12px; padding: 36px; text-align: center; box-shadow: var(--shadow-sm);
}
.submit-area p { font-size: 13px; color: var(--text-light); margin-bottom: 18px; }
.btn-submit {
  padding: 14px 48px; background: var(--navy); color: var(--white); border: none;
  border-radius: 10px; font-family: "Source Sans 3", sans-serif; font-size: 16px;
  font-weight: 600; cursor: pointer; letter-spacing: 0.03em;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(26,77,46,0.2);
}
.btn-submit:hover { background: var(--navy-mid); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,77,46,0.25); }
.btn-submit:disabled { background: #aaa; cursor: not-allowed; transform: none; box-shadow: none; }

.overlay {
  display: none; position: fixed; inset: 0; background: rgba(13,27,62,0.6);
  z-index: 999; align-items: center; justify-content: center; flex-direction: column; gap: 16px;
}
.overlay.active { display: flex; }
.spinner {
  width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.2);
  border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite;
}
.overlay p { color: var(--white); font-size: 15px; }

.success-screen {
  display: none; max-width: 560px; margin: 80px auto; text-align: center;
  background: var(--white); border-radius: 16px; padding: 48px 40px;
  box-shadow: var(--shadow); border: 1px solid var(--border);
}
.success-screen.active { display: block; }
.success-icon {
  width: 72px; height: 72px; background: rgba(26,107,60,0.1); border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 24px;
}
.success-screen h2 { font-family: "Playfair Display", serif; font-size: 24px; color: var(--navy); margin-bottom: 12px; }
.success-screen p  { color: var(--text-light); font-size: 14px; margin-bottom: 20px; }
.ref-id-box {
  background: var(--navy); color: var(--gold-light); font-family: monospace;
  font-size: 22px; font-weight: 700; padding: 16px 24px; border-radius: 10px;
  letter-spacing: 0.1em; margin: 16px 0 24px;
}

.subsection-divider { border: none; border-top: 1px solid var(--border); margin: 28px 0; }
.subsec-label { font-size: 13px; font-weight: 600; color: var(--navy-mid); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }

.btn-add-row {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: var(--navy); color: var(--white); border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;
  font-family: "Source Sans 3", sans-serif;
}
.btn-add-row:hover { background: var(--navy-mid); }
.btn-remove-row {
  background: none; border: none; cursor: pointer; color: var(--error);
  padding: 4px; border-radius: 4px; font-size: 18px; line-height: 1; transition: background 0.15s;
}
.btn-remove-row:hover    { background: rgba(192,57,43,0.08); }
.btn-remove-row:disabled { opacity: 0.3; cursor: not-allowed; }

.static-value {
  background: #f0ede8; border: 1.5px solid var(--border); border-radius: 8px;
  padding: 10px 14px; font-size: 14px; color: var(--text); font-weight: 600;
}

@media (max-width: 640px) {
  .container { padding: 24px 16px 60px; }
  .field-grid-2 { grid-template-columns: 1fr; }
  .field-group.span-2 { grid-column: span 1; }
  .section-body { padding: 24px 20px; }
  .page-nav { padding: 0 16px; }
  .nav-current, .nav-sep { display: none; }
  .source-checklist { grid-template-columns: 1fr 1fr; }
  .name-row { flex-direction: column; }
  .name-sub-mi { flex: unset; width: 100%; }
}

/* ── Competency tabs ── */
.comp-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 12px;
}
.comp-tab {
  padding: 8px 18px;
  border: 1.5px solid var(--border);
  border-radius: 8px 8px 0 0;
  background: var(--input-bg);
  color: var(--text-light);
  font-family: "Source Sans 3", sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.02em;
}
.comp-tab:hover {
  border-color: var(--navy);
  color: var(--navy);
  background: var(--white);
}
.comp-tab.active {
  background: var(--navy);
  color: var(--white);
  border-color: var(--navy);
}

.comp-tab-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding: 14px 0 4px;
  border-top: 1px solid var(--border);
}
.btn-tab-nav {
  padding: 8px 20px;
  background: var(--navy);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-family: "Source Sans 3", sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-tab-nav:hover:not(:disabled) { background: var(--navy-mid); }
.btn-tab-nav:disabled { background: #ccc; cursor: not-allowed; }
.comp-tab-page {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
}

/* ── Competency page table selects ── */
.comp-page-table .comp-select {
  width: 100%;
  min-width: 160px;
  font-size: 13px;
}

/* ── Reveal transition ── */
.reveal-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.reveal-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Section done badge ── */
.section-done-badge {
  margin-left: auto;
  background: rgba(26,107,60,0.15);
  color: #1a6b3c;
  font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 20px;
  letter-spacing: 0.04em;
  white-space: nowrap;
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

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Competency validation ── */
.comp-select-error {
  border-color: var(--error, #c0392b) !important;
  background: rgba(192, 57, 43, 0.04) !important;
}
.comp-field-error {
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: var(--error, #c0392b);
  margin-top: 3px;
  letter-spacing: 0.03em;
}

/* ── Competency level caption ── */
.comp-caption {
  font-size: 12px;
  color: var(--text-light, #5a6070);
  font-style: italic;
  line-height: 1.5;
}

/* ── Cluster summary per-level heading ── */
.cluster-summary-level-label {
  font-family: "Source Sans 3", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 6px;
  padding: 6px 10px;
  background: rgba(26, 77, 46, 0.07);
  border-left: 3px solid var(--navy);
  border-radius: 0 4px 4px 0;
}

/* ── Personnel / Function checkboxes ── */
.personnel-checks {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 220px;
}
.personnel-check-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 9px;
  border: 1.5px solid var(--border, #d8d4c8);
  border-radius: 6px;
  background: var(--input-bg, #f8f7f3);
  font-size: 12px;
  font-weight: 500;
  color: var(--text, #1a1a2e);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.personnel-check-item:hover { border-color: var(--navy, #1a4d2e); background: var(--white, #fff); }
.personnel-check-item.checked { border-color: var(--navy, #1a4d2e); background: rgba(26,77,46,0.05); }
.personnel-check-item input[type="checkbox"] {
  width: auto; padding: 0; border: none;
  background: none; accent-color: var(--navy, #1a4d2e);
  cursor: pointer; flex-shrink: 0;
}
</style>