<template>
  <div>
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

      <!-- HEADER INFO -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-num">H</div>
          <div>
            <h3>Office Information</h3>
            <p>Basic details about your office and the submitter</p>
          </div>
        </div>
        <div class="section-body">
          <div class="field-grid field-grid-2" style="margin-bottom: 18px">
            <div class="field-group span-2">
              <label>Your CarSU Email Address <span class="req">*</span></label>
              <input
                type="email"
                v-model="form.submitterEmail"
                @blur="validateEmail"
                placeholder="yourname@carsu.edu.ph"
                :class="{ error: emailError }"
              />
              <small class="email-hint" :class="emailHintClass">{{
                emailHint
              }}</small>
            </div>
          </div>

          <div class="field-group" style="margin-bottom: 20px">
            <label>Campus <span class="req">*</span></label>
            <div class="checkbox-group">
              <label
                v-for="c in campusOptions"
                :key="c"
                class="checkbox-item"
                :class="{ checked: form.campus === c }"
              >
                <input
                  type="radio"
                  name="campus"
                  :value="c"
                  v-model="form.campus"
                />
                {{ c }}
              </label>
            </div>
          </div>

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
            <div class="field-group span-2">
              <label
                >Name of Unit/Office/College <span class="req">*</span></label
              >
              <input
                type="text"
                v-model="form.unitOfficeCollege"
                placeholder="e.g. College of Engineering"
              />
            </div>
            <div class="field-group">
              <label
                >Head of Unit/Office/College <span class="req">*</span></label
              >
              <input
                type="text"
                v-model="form.headOfUnit"
                placeholder="Full name"
              />
            </div>
            <div class="field-group">
              <label>Position / Designation <span class="req">*</span></label>
              <input
                type="text"
                v-model="form.position"
                placeholder="e.g. Dean, Director"
              />
            </div>
            <div class="field-group">
              <label>Date Prepared <span class="req">*</span></label>
              <input type="date" v-model="form.datePrepared" />
            </div>
            <div class="field-group">
              <label>Year Covered <span class="req">*</span></label>
              <input
                type="text"
                v-model="form.yearCovered"
                placeholder="e.g. 2025"
              />
            </div>
            <div class="field-group">
              <label>Total Personnel <span class="req">*</span></label>
              <input
                type="number"
                v-model="form.totalPersonnel"
                min="0"
                placeholder="0"
              />
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
                <input
                  type="radio"
                  name="purpose"
                  :value="p"
                  v-model="form.purpose"
                />
                {{ p }}
              </label>
            </div>
            <div
              v-if="form.purpose === 'Other'"
              class="other-specify visible"
              style="margin-top: 10px"
            >
              <input
                type="text"
                v-model="form.purposeOther"
                placeholder="Please specify..."
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION I: WORKFORCE PROFILE -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-num">I</div>
          <div>
            <h3>
              Workforce Profile by Employment Classification and Position Level
            </h3>
            <p>
              Indicate number of personnel per classification per position level
            </p>
          </div>
        </div>
        <div class="section-body">
          <p class="section-desc">
            Indicate the number of personnel per employment classification under
            each position level within your office. Refer to
            <strong>Annex A</strong> for descriptions and sample positions.
          </p>
          <div class="table-wrapper">
            <table class="data-table workforce-table">
              <thead>
                <tr>
                  <th style="min-width: 180px; text-align: left">
                    Position Level
                  </th>
                  <th v-for="t in employmentTypes" :key="t">{{ t }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="level in positionLevels" :key="level.key">
                  <td class="row-label">{{ level.label }}</td>
                  <td v-for="t in employmentTypeKeys" :key="t">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      v-model.number="workforce[level.key][t]"
                      style="text-align: center; width: 60px"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SECTION II: COMPETENCY MAPPING -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-num">II</div>
          <div>
            <h3>Competency Mapping and Assessment</h3>
            <p>Assess current competency levels across all position levels</p>
          </div>
        </div>
        <div class="section-body">
          <div class="section-desc">
            Using the rating scale below, identify the highest competency level
            (CL: 1-4) and percentage (%) of personnel demonstrating it. Write
            <strong>N/A</strong> if the competency does not apply. For detailed
            descriptions, refer to the
            <a
              href="https://tinyurl.com/CompetencyManualandModel"
              target="_blank"
              >Competency Manual and Model</a
            >.
            <div style="margin-top: 14px">
              <p><i>Rating Scale:</i></p>
              <img
                src="/img/rating-scale.png"
                alt="Rating Scale"
                style="
                  max-width: 100%;
                  height: auto;
                  display: block;
                  border-radius: 6px;
                "
              />
            </div>
          </div>

          <div
            v-for="cluster in competencyClusters"
            :key="cluster.key"
            class="comp-table-wrap"
          >
            <div class="comp-cluster-label">
              {{ cluster.name }} Competencies
              <span class="cluster-badge">{{ cluster.badge }}</span>
            </div>
            <p class="comp-note" style="padding: 8px 0 4px">
              {{ cluster.note }}
            </p>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="min-width: 180px">Competency</th>
                    <th
                      v-for="lv in compLevelHeaders"
                      :key="lv"
                      colspan="2"
                      style="text-align: center"
                    >
                      {{ lv }}
                    </th>
                    <th style="min-width: 200px">Basis / Key Observations</th>
                  </tr>
                  <tr>
                    <th></th>
                    <template v-for="lv in compLevelHeaders" :key="lv">
                      <th>CL</th>
                      <th>%</th>
                    </template>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(comp, idx) in cluster.competencies" :key="comp">
                    <td class="row-label">{{ comp }}</td>
                    <template v-for="lv in compLevelKeys" :key="lv">
                      <td>
                        <select
                          v-model="competencyData[cluster.key][idx][lv + '_cl']"
                        >
                          <option v-for="o in clOptions" :key="o" :value="o">
                            {{ o || "---" }}
                          </option>
                        </select>
                      </td>
                      <td>
                        <select
                          v-model="
                            competencyData[cluster.key][idx][lv + '_pct']
                          "
                        >
                          <option v-for="o in pctOptions" :key="o" :value="o">
                            {{ o || "---" }}
                          </option>
                        </select>
                      </td>
                    </template>
                    <td>
                      <textarea
                        rows="2"
                        v-model="competencyData[cluster.key][idx].observations"
                        placeholder="Observations..."
                      ></textarea>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr class="subsection-divider" />
          <h4
            style="
              font-family: 'Playfair Display', serif;
              color: var(--navy);
              margin-bottom: 12px;
              font-size: 16px;
            "
          >
            Competency Cluster Summary
          </h4>
          <div class="table-wrapper">
            <table class="data-table cluster-summary-table">
              <thead>
                <tr>
                  <th>Competency Cluster</th>
                  <th>Strongest Competency</th>
                  <th>Weakest Competency</th>
                  <th style="width: 140px">Intervention Needed? (Y/N)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in clusterSummary" :key="c.cluster">
                  <td class="row-label">{{ c.cluster }}</td>
                  <td>
                    <input
                      type="text"
                      v-model="c.strongest"
                      placeholder="e.g. Integrity"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="c.weakest"
                      placeholder="e.g. Building Partnership"
                    />
                  </td>
                  <td>
                    <select v-model="c.interventionNeeded">
                      <option value="">---</option>
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SECTION III: OTHER LeaD DATA SOURCES -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-num">III</div>
          <div>
            <h3>Other LeaD Data Sources</h3>
            <p>Data sources used to identify additional learning needs</p>
          </div>
        </div>
        <div class="section-body">
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
              <input
                type="checkbox"
                :value="src.value"
                v-model="form.selectedSources"
              />
              {{ src.label }}
            </label>
          </div>
          <div
            v-if="form.selectedSources.includes('Others')"
            style="margin-top: 10px"
          >
            <input
              type="text"
              v-model="form.othersSourceText"
              placeholder="Please specify other data sources..."
            />
          </div>

          <hr class="subsection-divider" />

          <h4 class="subsec-label">
            B. Summary of Key Insights or Gaps Identified
          </h4>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 40px">No.</th>
                  <th>Data Source</th>
                  <th>Identified Gap / Issue</th>
                  <th>Relevant Personnel / Function</th>
                  <th>Recommended Intervention (if any)</th>
                  <th style="width: 40px"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in insightRows" :key="idx">
                  <td
                    style="
                      text-align: center;
                      color: var(--text-light);
                      font-weight: 600;
                    "
                  >
                    {{ idx + 1 }}
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="row.dataSource"
                      placeholder="Data source..."
                    />
                  </td>
                  <td>
                    <textarea
                      rows="2"
                      v-model="row.gap"
                      placeholder="Identified gap or issue..."
                    ></textarea>
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="row.personnel"
                      placeholder="Relevant personnel or function..."
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="row.intervention"
                      placeholder="Recommended intervention..."
                    />
                  </td>
                  <td style="text-align: center">
                    <button
                      class="btn-remove-row"
                      @click="removeInsightRow(idx)"
                      :disabled="insightRows.length <= 1"
                    >
                      x
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="margin-top: 12px">
            <button class="btn-add-row" @click="addInsightRow">
              + Add Row
            </button>
          </div>
        </div>
      </div>

      <!-- SECTION IV: LeaD INTERVENTIONS -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-num">IV</div>
          <div>
            <h3>LeaD Interventions for Priority LeaD Needs</h3>
            <p>Top 3 priority learning needs per position level</p>
          </div>
        </div>
        <div class="section-body">
          <div class="section-desc">
            Based on competency mapping and other data sources, identify the top
            <strong>3 priority learning needs</strong> for each applicable
            position level. For each, indicate the most appropriate LeaD
            interventions.<br /><br />
            <strong>On-the-Job:</strong> Observation, Delegation, Coaching,
            Mentoring, Job Rotation, Detail &amp; Secondment, Reading, Flexible
            Learning, Brainstorming, Experiential Learning<br />
            <strong>Off-the-Job:</strong> Short Courses, Conferences, Training
            Programs, Seminars, Cum Paper Presentations, Pursue Higher Education
          </div>

          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 40px">No.</th>
                  <th>Priority Competency / LeaD Need</th>
                  <th>Suggested LeaD Interventions</th>
                  <th style="width: 120px">Timeline</th>
                  <th>Resource / Support Needed</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="level in positionLevels" :key="level.key">
                  <tr>
                    <td
                      colspan="5"
                      class="pos-level-header"
                      style="padding: 10px 12px"
                    >
                      {{ level.label }}
                    </td>
                  </tr>
                  <tr v-for="p in 3" :key="p">
                    <td style="text-align: center; vertical-align: middle">
                      <span class="priority-badge">{{ p }}</span>
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="interventions[level.key][p - 1].need"
                        placeholder="Describe competency/learning need..."
                      />
                    </td>
                    <td>
                      <div class="intervention-checks">
                        <label class="iv-check">
                          <input
                            type="checkbox"
                            v-model="interventions[level.key][p - 1].onJob"
                          />
                          On-the-Job Learning:
                          <input
                            type="text"
                            v-model="interventions[level.key][p - 1].onJobText"
                            placeholder="specify..."
                            class="iv-text"
                          />
                        </label>
                        <label class="iv-check">
                          <input
                            type="checkbox"
                            v-model="interventions[level.key][p - 1].offJob"
                          />
                          Off-the-Job Learning:
                          <input
                            type="text"
                            v-model="interventions[level.key][p - 1].offJobText"
                            placeholder="specify..."
                            class="iv-text"
                          />
                        </label>
                        <label class="iv-check">
                          <input
                            type="checkbox"
                            v-model="interventions[level.key][p - 1].others"
                          />
                          Others:
                          <input
                            type="text"
                            v-model="interventions[level.key][p - 1].othersText"
                            placeholder="specify..."
                            class="iv-text"
                          />
                        </label>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="interventions[level.key][p - 1].timeline"
                        placeholder="e.g. Q2 2025"
                      />
                    </td>
                    <td>
                      <textarea
                        rows="2"
                        v-model="interventions[level.key][p - 1].resource"
                        placeholder="Budget, facilitator, equipment..."
                      ></textarea>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <hr class="subsection-divider" />

          <div class="certification-box">
            <p>
              I hereby certify that the information provided in this Learning
              Needs Assessment is accurate and based on actual observation,
              data, and evidence gathered from the office.
            </p>
            <div class="field-group">
              <label
                >Full Name of Rater / Head of Office
                <span class="req">*</span></label
              >
              <input
                type="text"
                v-model="form.raterFullName"
                placeholder="Enter full name"
                style="max-width: 400px"
              />
            </div>
            <small
              style="
                font-size: 11px;
                color: var(--text-light);
                display: block;
                margin-top: 8px;
              "
              >Signature over Printed Name of Rater/Head of Office</small
            >
          </div>
        </div>
      </div>

      <!-- SUBMIT -->
      <div class="submit-area">
        <p>
          By submitting, you confirm that all information is accurate and based
          on actual office data. HRMS will be notified immediately upon
          submission.
        </p>
        <button class="btn-submit" :disabled="isSubmitting" @click="submitForm">
          Submit LNA
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

const config = useRuntimeConfig();
const API = config.public.apiBase; // resolves to http://localhost:3001

const screen = ref("form");
const isSubmitting = ref(false);
const refId = ref("");

const emailHint = ref("");
const emailError = ref(false);
const emailHintClass = computed(() =>
  emailError.value ? "error" : emailHint.value.startsWith("✓") ? "success" : "",
);

// ── CONSTANTS ──
const campusOptions = ["CSU Main Campus", "CSU Cabadbaran City Campus"];
const officeOptions = [
  "OVPAF",
  "OVPAA",
  "OVPEO",
  "OVPRDIE",
  "OVPSAS",
  "Office of the Campus Director",
];
const purposeOptions = [
  "Initial Assessment",
  "Mid-Year Review",
  "Annual Review",
  "Other",
];
const employmentTypes = [
  "Permanent",
  "Temporary",
  "Contractual",
  "Casual",
  "Coterminus",
  "COS",
  "Job Order",
  "Others",
];
const employmentTypeKeys = [
  "permanent",
  "temporary",
  "contractual",
  "casual",
  "coterminus",
  "cos",
  "jobOrder",
  "others",
];

const positionLevels = [
  { key: "first", label: "First Level Positions" },
  { key: "secondNonSup", label: "Second Level (Non-Supervisory)" },
  { key: "secondSup", label: "Second Level (Supervisory)" },
  { key: "third", label: "Third Level Positions" },
  { key: "faculty", label: "Faculty Positions" },
];

const compLevelHeaders = [
  "1st Level",
  "2nd (Non-Sup)",
  "2nd (Sup)",
  "3rd Level",
  "Faculty",
];
const compLevelKeys = [
  "first",
  "secondNonSup",
  "secondSup",
  "third",
  "faculty",
];
const clOptions = ["", "N/A", "1", "2", "3", "4"];
const pctOptions = ["", "N/A", "A", "B", "C", "D"];

const COMPETENCIES = {
  core: [
    "Integrity",
    "Accountability",
    "Scientific & Technological Excellence",
    "Delivering Service Excellence",
    "Environmental Consciousness",
    "Building Partnership",
  ],
  leadership: [
    "Developing People",
    "Facilitating Change",
    "Conflict Management",
    "Leading Innovation",
    "Strategic Planning",
    "Leading Others",
    "Decisiveness",
  ],
  org: [
    "Teamwork",
    "Commitment to Learning",
    "Customer Focus",
    "Adaptability and Flexibility",
    "Critical Thinking",
    "Effective Communication",
    "Valuing Diversity",
    "Self-Awareness and Confidence",
    "Stress Tolerance",
    "Resource Management",
    "Knowledge Management",
    "Initiative",
    "Result Orientation",
    "Community Engagement",
    "Organizational Commitment",
    "Planning and Organizing",
    "Emotional and Psychological Maturity",
    "Safety and Risk Management",
    "Interpersonal Effectiveness",
  ],
  technical: [
    "Research Engagement",
    "Diagnostic Information Gathering",
    "Attention to Details",
    "Written Communication",
    "Oral Communication",
    "Conceptual and Analytical Thinking",
    "Computer Literacy",
    "Planning and Project Management",
    "Logical Reasoning",
  ],
};

const competencyClusters = [
  {
    key: "core",
    name: "Core",
    badge: "Core",
    note: "Foundational attributes expected of all personnel regardless of position.",
    competencies: COMPETENCIES.core,
  },
  {
    key: "leadership",
    name: "Leadership",
    badge: "Leadership",
    note: "Skills and behaviors required to effectively lead individuals, teams, and units.",
    competencies: COMPETENCIES.leadership,
  },
  {
    key: "org",
    name: "Organizational",
    badge: "Organizational",
    note: "Collective attributes that define the institution's way of working.",
    competencies: COMPETENCIES.org,
  },
  {
    key: "technical",
    name: "Technical",
    badge: "Technical",
    note: "Job-specific knowledge, skills, and abilities for effective role performance.",
    competencies: COMPETENCIES.technical,
  },
];

const dataSources = [
  {
    value: "Individual Development Plan (IDP)",
    label: "Individual Development Plan (IDP)",
  },
  {
    value: "Training Evaluation Results",
    label: "Training Evaluation Results",
  },
  {
    value: "HR Records (Coaching logs, leave patterns, discipline)",
    label: "HR Records",
  },
  { value: "IPCR/OPCR/DPCR Reviews", label: "IPCR/OPCR/DPCR Reviews" },
  {
    value: "Audit or Accreditation Results (ISO, AACCUP, etc.)",
    label: "Audit / Accreditation Results",
  },
  {
    value: "Strategic Plan or SPMS Review",
    label: "Strategic Plan / SPMS Review",
  },
  {
    value: "Focus Group Discussion (FGD)",
    label: "Focus Group Discussion (FGD)",
  },
  {
    value: "Client/Stakeholder Feedback",
    label: "Client/Stakeholder Feedback",
  },
  { value: "Risk Assessment", label: "Risk Assessment" },
  { value: "Interview", label: "Interview" },
  { value: "Questionnaire", label: "Questionnaire" },
  { value: "Test", label: "Test" },
  { value: "Others", label: "Others" },
];

// ── FORM STATE ──
const form = reactive({
  submitterEmail: "",
  campus: "",
  officeAffiliation: "",
  unitOfficeCollege: "",
  headOfUnit: "",
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

const workforce = reactive(
  Object.fromEntries(
    positionLevels.map((lv) => [
      lv.key,
      Object.fromEntries(employmentTypeKeys.map((t) => [t, null])),
    ]),
  ),
);

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

const clusterSummary = reactive([
  { cluster: "Core", strongest: "", weakest: "", interventionNeeded: "" },
  { cluster: "Leadership", strongest: "", weakest: "", interventionNeeded: "" },
  {
    cluster: "Organizational",
    strongest: "",
    weakest: "",
    interventionNeeded: "",
  },
  { cluster: "Technical", strongest: "", weakest: "", interventionNeeded: "" },
]);

const insightRows = reactive([
  { dataSource: "", gap: "", personnel: "", intervention: "" },
]);

const makeIntervention = () => ({
  need: "",
  onJob: false,
  onJobText: "",
  offJob: false,
  offJobText: "",
  others: false,
  othersText: "",
  timeline: "",
  resource: "",
});
const interventions = reactive(
  Object.fromEntries(
    positionLevels.map((lv) => [
      lv.key,
      [makeIntervention(), makeIntervention(), makeIntervention()],
    ]),
  ),
);

// ── METHODS ──
function validateEmail() {
  const val = form.submitterEmail.trim();
  if (!val) {
    emailHint.value = "";
    emailError.value = false;
    return false;
  }
  if (!val.endsWith("@carsu.edu.ph")) {
    emailError.value = true;
    emailHint.value = "Must be a @carsu.edu.ph email address.";
    return false;
  }
  emailError.value = false;
  emailHint.value = "✓ Valid CarSU email";
  return true;
}

function addInsightRow() {
  insightRows.push({
    dataSource: "",
    gap: "",
    personnel: "",
    intervention: "",
  });
}

function removeInsightRow(idx) {
  if (insightRows.length > 1) insightRows.splice(idx, 1);
}

function validate() {
  const requiredFields = [
    ["submitterEmail", "CarSU Email"],
    ["unitOfficeCollege", "Unit/Office/College"],
    ["headOfUnit", "Head of Unit"],
    ["position", "Position"],
    ["datePrepared", "Date Prepared"],
    ["yearCovered", "Year Covered"],
    ["totalPersonnel", "Total Personnel"],
    ["raterFullName", "Rater Full Name"],
  ];
  for (const [field] of requiredFields) {
    if (!String(form[field] || "").trim()) {
      alert("Please fill in all required fields.");
      return false;
    }
  }
  if (!validateEmail()) {
    alert("Only @carsu.edu.ph email addresses are allowed.");
    return false;
  }
  if (!form.campus) {
    alert("Please select a Campus.");
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

  let purpose =
    form.purpose === "Other" ? form.purposeOther || "Other" : form.purpose;

  let selectedSources = [...form.selectedSources];
  if (selectedSources.includes("Others")) {
    selectedSources = selectedSources.filter((v) => v !== "Others");
    if (form.othersSourceText.trim())
      selectedSources.push("Others: " + form.othersSourceText.trim());
  }

  const leadInterventions = [];
  positionLevels.forEach((level) => {
    interventions[level.key].forEach((iv, idx) => {
      leadInterventions.push({
        positionLevel: level.label,
        priority: idx + 1,
        ...iv,
      });
    });
  });

  const payload = {
    action: "submitLNA",
    submitterEmail: form.submitterEmail.trim(),
    campus: form.campus,
    officeAffiliation: form.officeAffiliation,
    unitOfficCollege: form.unitOfficeCollege.trim(),
    headOfUnit: form.headOfUnit.trim(),
    position: form.position.trim(),
    datePrepared: form.datePrepared,
    yearCovered: form.yearCovered.trim(),
    totalPersonnel: form.totalPersonnel,
    purpose,
    workforceProfile: workforce,
    coreCompetencies: competencyData.core,
    leadershipComps: competencyData.leadership,
    orgComps: competencyData.org,
    technicalComps: competencyData.technical,
    clusterSummary,
    dataSources: selectedSources,
    dataSourceInsights: insightRows,
    leadInterventions,
    raterFullName: form.raterFullName.trim(),
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
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

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
}
.header-img {
  width: auto;
  max-width: 700px;
  height: auto;
  display: block;
  object-fit: contain;
}

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
  transition: transform 0.2s;
  flex-shrink: 0;
  opacity: 0.8;
}
.page-nav a.back-link:hover svg {
  transform: translateX(-3px);
  opacity: 1;
}
.nav-sep {
  color: rgba(255, 255, 255, 0.25);
  font-size: 13px;
  margin: 0 10px;
  user-select: none;
}
.nav-current {
  font-size: 12.5px;
  color: var(--gold);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 48px 40px 80px;
}

.form-title-block {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 3px solid var(--navy);
}
.form-title-block .eyebrow {
  font-size: 11px;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 10px;
}
.form-title-block h2 {
  font-family: "Playfair Display", serif;
  font-size: 28px;
  color: var(--navy);
  margin-bottom: 4px;
}
.form-title-block h3 {
  font-family: "Playfair Display", serif;
  font-size: 16px;
  color: var(--text-light);
  font-weight: 600;
  font-style: italic;
  margin-bottom: 8px;
}
.form-title-block p {
  color: var(--text-light);
  font-size: 14px;
}

.section-card {
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 28px;
  overflow: hidden;
  border: 1px solid var(--border);
  animation: fadeUp 0.4s ease both;
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

.field-grid {
  display: grid;
  gap: 18px;
}
.field-grid-2 {
  grid-template-columns: 1fr 1fr;
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
.req {
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
input:focus,
select:focus,
textarea:focus {
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(26, 77, 46, 0.08);
  background: var(--white);
}
input.error {
  border-color: var(--error);
}
textarea {
  resize: vertical;
  min-height: 72px;
}

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
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  color: var(--text);
}
.checkbox-item:hover {
  border-color: var(--navy);
  background: var(--white);
}
.checkbox-item input {
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

.table-wrapper {
  overflow-x: auto;
  margin-top: 8px;
}
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}
.data-table thead tr {
  background: var(--navy-mid);
}
.data-table thead th {
  padding: 10px 12px;
  color: var(--white);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}
.data-table thead th:last-child {
  border-right: none;
}
.data-table tbody tr {
  border-bottom: 1px solid var(--border);
}
.data-table tbody tr:nth-child(even) {
  background: #faf9f6;
}
.data-table tbody td {
  padding: 8px 10px;
  vertical-align: middle;
  border-right: 1px solid var(--border);
}
.data-table tbody td:last-child {
  border-right: none;
}
.data-table td input,
.data-table td select,
.data-table td textarea {
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 6px;
}
.data-table td textarea {
  min-height: 56px;
}
.row-label {
  font-weight: 600;
  color: var(--navy-mid);
  background: rgba(26, 77, 46, 0.03) !important;
  white-space: nowrap;
}

.workforce-table th,
.workforce-table td {
  text-align: center;
}
.workforce-table td:first-child {
  text-align: left;
}

.comp-table-wrap {
  margin-bottom: 32px;
}
.comp-cluster-label {
  background: var(--navy);
  color: var(--white);
  font-family: "Playfair Display", serif;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.cluster-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(245, 195, 0, 0.2);
  border: 1px solid rgba(245, 195, 0, 0.4);
  color: var(--gold-light);
  padding: 3px 10px;
  border-radius: 20px;
}
.comp-note {
  font-size: 12px;
  color: var(--text-light);
  font-style: italic;
  margin-bottom: 8px;
}

.cluster-summary-table thead th:first-child {
  width: 140px;
}

.source-checklist {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}
.source-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  color: var(--text);
}
.source-item:hover {
  border-color: var(--navy);
  background: var(--white);
}
.source-item input {
  accent-color: var(--navy);
  cursor: pointer;
  flex-shrink: 0;
  width: auto;
  padding: 0;
  border: none;
  background: none;
}
.source-item.checked {
  border-color: var(--navy);
  background: rgba(26, 77, 46, 0.04);
}

.pos-level-header {
  background: rgba(245, 195, 0, 0.12) !important;
  font-weight: 700;
  color: var(--navy);
  font-size: 13px;
}
.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--navy);
  color: var(--white);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.intervention-checks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.iv-check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-light);
  font-weight: 400;
  cursor: pointer;
}
.iv-check input[type="checkbox"] {
  width: auto;
  padding: 0;
  border: none;
  background: none;
  accent-color: var(--navy);
}
.iv-text {
  flex: 1;
  padding: 4px 8px;
  font-size: 12px;
}

.certification-box {
  background: rgba(201, 168, 76, 0.08);
  border: 1.5px solid var(--gold);
  border-radius: 10px;
  padding: 24px 28px;
  margin-top: 8px;
}
.certification-box p {
  font-size: 13px;
  color: var(--text-light);
  font-style: italic;
  margin-bottom: 16px;
}

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
.btn-submit:disabled {
  background: #aaa;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

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
.overlay p {
  color: var(--white);
  font-size: 15px;
}

.success-screen {
  display: none;
  max-width: 560px;
  margin: 80px auto;
  text-align: center;
  background: var(--white);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.success-screen.active {
  display: block;
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

.subsection-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 28px 0;
}
.subsec-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--navy-mid);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
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
.btn-remove-row:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

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

@media (max-width: 640px) {
  .container {
    padding: 24px 16px 60px;
  }
  .field-grid-2 {
    grid-template-columns: 1fr;
  }
  .field-group.span-2 {
    grid-column: span 1;
  }
  .section-body {
    padding: 24px 20px;
  }
  .page-nav {
    padding: 0 16px;
  }
  .nav-current,
  .nav-sep {
    display: none;
  }
  .source-checklist {
    grid-template-columns: 1fr 1fr;
  }
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
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
