<template>
  <div>
    <!-- Page Nav -->
    <div class="page-nav">
      <NuxtLink to="/" class="back-link">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        Back to Home
      </NuxtLink>
      <span class="nav-sep">/</span>
      <span class="nav-current">Edit IDP</span>
    </div>

    <!-- ── STAGE 1: IDENTITY LOOKUP ─────────────────────────────────────── -->
    <div v-if="stage === 'lookup'" class="center-wrap">
      <div class="lookup-card">
        <div class="lookup-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <div class="lookup-eyebrow">Employee Access</div>
        <h2>Edit Your IDP</h2>
        <p>
          Enter your Reference ID and CarSU email to retrieve your submission.
          You can only edit your IDP while your supervisor has not yet completed
          their review.
        </p>

        <div class="lookup-fields">
          <div class="field-wrap">
            <label>Reference ID <span class="req">*</span></label>
            <input
              type="text"
              v-model="lookupRefId"
              placeholder="e.g. IDP-1718000000000"
              :class="{ err: lookupError }"
              @keydown.enter="doLookup"
            />
          </div>
          <div class="field-wrap">
            <label>CarSU Email Address <span class="req">*</span></label>
            <input
              type="email"
              v-model="lookupEmail"
              placeholder="yourname@carsu.edu.ph"
              :class="{ err: lookupError }"
              @keydown.enter="doLookup"
            />
          </div>
          <p v-if="lookupError" class="error-msg">{{ lookupError }}</p>
        </div>

        <button class="btn-primary" :disabled="lookupLoading" @click="doLookup">
          {{ lookupLoading ? "Checking..." : "Retrieve My IDP" }}
        </button>
      </div>
    </div>

    <!-- ── STAGE 2: LOCKED ───────────────────────────────────────────────── -->
    <div v-if="stage === 'locked'" class="center-wrap">
      <div class="locked-card">
        <div class="locked-icon">🔒</div>
        <h2>IDP Locked</h2>
        <p>
          Your supervisor has already completed their review of
          <strong>{{ lookupRefId }}</strong
          >. No further edits can be made.
        </p>
        <p style="font-size: 13px; color: var(--text-light); margin-top: 8px">
          If you believe this is an error, please contact the HR office
          directly.
        </p>
        <button class="btn-secondary" @click="stage = 'lookup'">← Back</button>
      </div>
    </div>

    <!-- ── STAGE 2: EDIT FORM ────────────────────────────────────────────── -->
    <div v-if="stage === 'form'" class="form-wrap">
      <!-- Edit banner -->
      <div class="edit-banner">
        <div class="edit-banner-left">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="16"
            height="16"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>
            Editing <strong>{{ lookupRefId }}</strong> — Changes will re-notify
            your supervisor.
          </span>
        </div>
        <button class="btn-cancel-edit" @click="stage = 'lookup'">
          Cancel
        </button>
      </div>

      <!-- Re-use the same form sections as idp-form.vue -->

      <!-- ── SECTION 0: HEADER ─────────────────────────────────────────── -->
      <div class="form-card">
        <div class="form-card-header">
          <div class="section-badge">Header</div>
          <h3>Employee Information</h3>
        </div>
        <div class="form-grid">
          <!-- Name -->
          <div class="field-group span-3">
            <label>Name of Personnel <span class="req">*</span></label>
            <div class="name-row">
              <div>
                <input
                  type="text"
                  v-model="form.lastName"
                  :class="{ error: errors.lastName }"
                  placeholder="Last Name"
                  @input="form.lastName = form.lastName.toUpperCase()"
                />
                <small class="field-hint">Last Name</small>
              </div>
              <div>
                <input
                  type="text"
                  v-model="form.firstName"
                  :class="{ error: errors.firstName }"
                  placeholder="First Name"
                  @input="form.firstName = form.firstName.toUpperCase()"
                />
                <small class="field-hint">First Name</small>
              </div>
              <div class="mi-col">
                <input
                  type="text"
                  v-model="form.middleInitial"
                  :class="{ error: errors.middleInitial }"
                  placeholder="M.I."
                  maxlength="3"
                  @input="form.middleInitial = form.middleInitial.toUpperCase()"
                />
                <small class="field-hint">M.I.</small>
              </div>
            </div>
          </div>

          <!-- Email (read-only — used for identity) -->
          <div class="field-group span-2">
            <label>CarSU Email</label>
            <input
              type="email"
              :value="form.employeeEmail"
              disabled
              class="input-disabled"
            />
            <small class="field-hint">Email cannot be changed</small>
          </div>

          <!-- Date Prepared -->
          <div class="field-group">
            <label>Date Prepared <span class="req">*</span></label>
            <input
              type="date"
              v-model="form.datePrepared"
              :class="{ error: errors.datePrepared }"
            />
          </div>

          <!-- Office Affiliation -->
          <div class="field-group span-2">
            <label>Office Affiliation <span class="req">*</span></label>
            <select
              v-model="form.officeAffiliation"
              :class="{ error: errors.officeAffiliation }"
              @change="
                form.collegeOfficeUnit = '';
                form.collegeProgram = '';
              "
            >
              <option value="">Select office affiliation…</option>
              <option value="OVPAA">
                Office of the VP for Academic Affairs (OVPAA)
              </option>
              <option value="OVPAF">
                Office of the VP for Administration and Finance (OVPAF)
              </option>
              <option value="OVPEO">
                Office of the VP for External Operations (OVPEO)
              </option>
              <option value="OVPSAS">
                Office of the VP for Student Affairs and Services (OVPSAS)
              </option>
              <option value="OVPRDIE">
                Office of the VP for R, D, Innovation and Extension (OVPRDIE)
              </option>
            </select>
          </div>

          <!-- College / Office / Unit -->
          <div class="field-group span-2" v-if="form.officeAffiliation">
            <label>College / Office / Unit <span class="req">*</span></label>
            <select
              v-model="form.collegeOfficeUnit"
              :class="{ error: errors.collegeOfficeUnit }"
            >
              <option value="">Select unit…</option>
              <template v-if="form.officeAffiliation === 'OVPAA'">
                <option
                  v-for="c in subOfficeMap.OVPAA"
                  :key="c.name"
                  :value="c.name"
                >
                  {{ c.name }}
                </option>
              </template>
              <template v-else>
                <option
                  v-for="u in subOfficeMap[form.officeAffiliation] || []"
                  :key="u"
                  :value="u"
                >
                  {{ u }}
                </option>
              </template>
            </select>
          </div>

          <!-- Personnel Type (OVPAA only) -->
          <div class="field-group" v-if="form.officeAffiliation === 'OVPAA'">
            <label>Personnel Type <span class="req">*</span></label>
            <select
              v-model="form.personnelType"
              :class="{ error: errors.personnelType }"
              @change="form.currentPosition = ''"
            >
              <option value="">Select type…</option>
              <option value="non-teaching">Non-Teaching</option>
              <option value="teaching">Teaching</option>
            </select>
          </div>

          <!-- Position + Designation -->
          <div class="field-group span-2">
            <label>Position &amp; Designation <span class="req">*</span></label>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
            >
              <div>
                <small
                  class="field-hint"
                  style="margin-bottom: 4px; display: block"
                  >Position</small
                >
                <select
                  v-model="form.currentPosition"
                  :class="{ error: errors.currentPosition }"
                  :disabled="
                    form.officeAffiliation === 'OVPAA' && !form.personnelType
                  "
                >
                  <option value="">Select position…</option>
                  <template
                    v-if="
                      form.officeAffiliation === 'OVPAA' &&
                      form.personnelType === 'teaching'
                    "
                  >
                    <option>Assistant Professor I</option>
                    <option>Assistant Professor II</option>
                    <option>Assistant Professor III</option>
                    <option>Assistant Professor IV</option>
                    <option>Associate Professor I</option>
                    <option>Associate Professor II</option>
                    <option>Associate Professor III</option>
                    <option>Associate Professor IV</option>
                    <option>Associate Professor V</option>
                    <option>Instructor I</option>
                    <option>Instructor II</option>
                    <option>Instructor III</option>
                    <option>Professor I</option>
                    <option>Professor II</option>
                    <option>Professor III</option>
                    <option>Professor IV</option>
                    <option>Professor V</option>
                    <option>Professor VI</option>
                    <option>University Professor</option>
                  </template>
                  <template
                    v-if="
                      form.officeAffiliation !== 'OVPAA' ||
                      form.personnelType === 'non-teaching'
                    "
                  >
                    <option>Accountant I</option>
                    <option>Accountant II</option>
                    <option>Accountant III</option>
                    <option>Administrative Aide I</option>
                    <option>Administrative Aide II</option>
                    <option>Administrative Aide III</option>
                    <option>Administrative Aide IV</option>
                    <option>Administrative Aide VI</option>
                    <option>Administrative Assistant I</option>
                    <option>Administrative Assistant II</option>
                    <option>Administrative Assistant III</option>
                    <option>Administrative Assistant IV</option>
                    <option>Administrative Assistant V</option>
                    <option>Administrative Officer I</option>
                    <option>Administrative Officer II</option>
                    <option>Administrative Officer III</option>
                    <option>Administrative Officer IV</option>
                    <option>Administrative Officer V</option>
                    <option>Attorney IV</option>
                    <option>Board Secretary I</option>
                    <option>Board Secretary V</option>
                    <option>Chief Administrative Officer</option>
                    <option>College Librarian I</option>
                    <option>College Librarian III</option>
                    <option>Cook I</option>
                    <option>Cook II</option>
                    <option>Dentist II</option>
                    <option>Dormitory Manager III</option>
                    <option>Executive Assistant III</option>
                    <option>Executive Assistant IV</option>
                    <option>Farm Worker I</option>
                    <option>Farm Worker II</option>
                    <option>Food Service Supervisor II</option>
                    <option>Guidance Coordinator I</option>
                    <option>Guidance Counselor I</option>
                    <option>Guidance Counselor III</option>
                    <option>Heavy Equipment Operator I</option>
                    <option>Houseparent II</option>
                    <option>Information Officer I</option>
                    <option>Information Officer II</option>
                    <option>Information Officer III</option>
                    <option>Information Systems Analyst I</option>
                    <option>Information Systems Analyst II</option>
                    <option>Information Technology Officer I</option>
                    <option>Internal Auditor I</option>
                    <option>Internal Auditor II</option>
                    <option>Internal Auditor III</option>
                    <option>Legal Assistant II</option>
                    <option>Legal Assistant III</option>
                    <option>Machinist I</option>
                    <option>Nurse II</option>
                    <option>Planning Officer I</option>
                    <option>Planning Officer II</option>
                    <option>Planning Officer III</option>
                    <option>Project Development Officer I</option>
                    <option>Project Development Officer II</option>
                    <option>Project Development Officer III</option>
                    <option>Registrar III</option>
                    <option>School Farm Demonstrator</option>
                    <option>School Farming Coordinator I</option>
                    <option>Security Guard I</option>
                    <option>Senior Administrative Assistant III</option>
                    <option>SUC President IV</option>
                    <option>Supervising Administrative Officer</option>
                    <option>University Extension Associate I</option>
                    <option>University Extension Specialist I</option>
                    <option>University Extension Specialist II</option>
                    <option>University Extension Specialist III</option>
                    <option>University Extension Specialist IV</option>
                    <option>University Extension Specialist V</option>
                    <option>University Research Associate I</option>
                    <option>University Research Associate II</option>
                    <option>University Researcher II</option>
                    <option>University Researcher IV</option>
                    <option>University Researcher V</option>
                    <option>Veterinarian II</option>
                    <option>Vocational Placement Coordinator I</option>
                  </template>
                </select>
              </div>
              <div>
                <small
                  class="field-hint"
                  style="margin-bottom: 4px; display: block"
                  >Designation</small
                >
                <input
                  type="text"
                  v-model="form.designation"
                  placeholder="Specify or N/A"
                />
                <small class="field-hint">e.g. Officer-in-Charge or N/A</small>
              </div>
            </div>
          </div>

          <!-- Educational Attainment -->
          <div class="field-group span-2">
            <label
              >Highest Educational Attainment <span class="req">*</span></label
            >
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
            >
              <select
                v-model="form.educAttainment"
                :class="{ error: errors.educAttainment }"
              >
                <option value="">Select…</option>
                <option>Elementary Graduate</option>
                <option>High School Graduate</option>
                <option>Vocational / Technical</option>
                <option>Some College</option>
                <option>Bachelor's Degree</option>
                <option>With Units in Master's</option>
                <option>Master's Degree</option>
                <option>With Units in Doctorate</option>
                <option>Doctorate Degree</option>
              </select>
              <input
                type="text"
                v-model="form.educAttainmentSpec"
                placeholder="Specify degree / program (e.g. BS COMPUTER SCIENCE)"
                @input="
                  form.educAttainmentSpec =
                    form.educAttainmentSpec.toUpperCase()
                "
              />
            </div>
          </div>

          <!-- Years in Position / CSU -->
          <div class="field-group">
            <label>Years in Current Position <span class="req">*</span></label>
            <input
              type="number"
              min="0"
              step="0.5"
              v-model="form.yearsInPosition"
              :class="{ error: errors.yearsInPosition }"
              placeholder="e.g. 3"
            />
          </div>
          <div class="field-group">
            <label>Years in CSU <span class="req">*</span></label>
            <input
              type="number"
              min="0"
              step="0.5"
              v-model="form.yearsInCSU"
              :class="{ error: errors.yearsInCSU }"
              placeholder="e.g. 5"
            />
          </div>

          <!-- Supervisor -->
          <div class="field-group span-2">
            <label>Immediate Supervisor Name <span class="req">*</span></label>
            <input
              type="text"
              v-model="form.supervisorName"
              :class="{ error: errors.supervisorName }"
              placeholder="e.g. DELA CRUZ, JUAN D."
              @input="form.supervisorName = form.supervisorName.toUpperCase()"
            />
            <small class="field-hint"
              >Format: Last name, First name, M.I.</small
            >
          </div>
          <div class="field-group span-2">
            <label>Supervisor CarSU Email <span class="req">*</span></label>
            <input
              type="email"
              v-model="form.supervisorEmail"
              :class="{ error: errors.supervisorEmail }"
              placeholder="supervisor@carsu.edu.ph"
            />
          </div>
        </div>
      </div>

      <!-- ── NOTE: Sections I–III (Competency, AGAP, Pro-ACT) ─────────────
           These sections are complex and share a lot of logic with idp-form.vue
           (competency model filtering, position-based required levels, etc.).
           For maintainability, extract the shared sections into composables or
           reusable components rather than duplicating them here.
           See implementation note below the form.
      ────────────────────────────────────────────────────────────────────── -->
      <div class="form-card sections-note">
        <div class="sections-note-icon">📋</div>
        <div>
          <strong
            >Sections I – III are loaded from your saved submission.</strong
          >
          <p>
            Your Competency Assessment, AGAP, and Pro-ACT entries are pre-filled
            from your original submission. Edit them as needed.
          </p>
        </div>
      </div>

      <!-- Simplified inline section editors for I, II, III -->
      <!-- Section I: Competency rows (editable table) -->
      <div class="form-card">
        <div class="form-card-header">
          <div class="section-badge">Section I</div>
          <h3>Competency Assessment</h3>
        </div>
        <div class="table-scroll">
          <table class="edit-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Target Competency</th>
                <th>Cluster</th>
                <th>Current Level</th>
                <th>Required Level</th>
                <th>Suggested Intervention</th>
                <th>Target Timeline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!form.competencyRows.length" class="empty-row">
                <td colspan="8">No competency entries.</td>
              </tr>
              <tr v-for="(row, i) in form.competencyRows" :key="i">
                <td class="tc">{{ i + 1 }}</td>
                <td><input type="text" v-model="row.targetCompetency" /></td>
                <td><input type="text" v-model="row.competencyGroup" /></td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    v-model="row.currentLevel"
                    style="width: 60px"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    v-model="row.requiredLevel"
                    style="width: 60px"
                  />
                </td>
                <td><input type="text" v-model="row.leadInterventions" /></td>
                <td><input type="text" v-model="row.targetTimeline" /></td>
                <td>
                  <button
                    class="btn-remove-row"
                    @click="form.competencyRows.splice(i, 1)"
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section II: AGAP rows -->
      <div class="form-card">
        <div class="form-card-header">
          <div class="section-badge">Section II</div>
          <h3>AGAP</h3>
        </div>
        <div class="table-scroll">
          <table class="edit-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Degree Program</th>
                <th>Target HEI</th>
                <th>Mode of Study</th>
                <th>Scholarship / Grant</th>
                <th>Target Timeline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!form.agapRows.length" class="empty-row">
                <td colspan="7">No AGAP entries.</td>
              </tr>
              <tr v-for="(row, i) in form.agapRows" :key="i">
                <td class="tc">{{ i + 1 }}</td>
                <td><input type="text" v-model="row.degreeProgram" /></td>
                <td>
                  <input
                    type="text"
                    v-model="row.targetHEI"
                    list="hei-suggestions-edit"
                  />
                  <datalist id="hei-suggestions-edit">
                    <option v-for="s in heiSuggestions" :key="s" :value="s" />
                  </datalist>
                </td>
                <td><input type="text" v-model="row.modeOfStudy" /></td>
                <td><input type="text" v-model="row.scholarshipGrant" /></td>
                <td><input type="text" v-model="row.targetTimeline" /></td>
                <td>
                  <button
                    class="btn-remove-row"
                    @click="form.agapRows.splice(i, 1)"
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section III: Pro-ACT rows -->
      <div class="form-card">
        <div class="form-card-header">
          <div class="section-badge">Section III</div>
          <h3>Pro-ACT</h3>
        </div>
        <div class="table-scroll">
          <table class="edit-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Target Competency / Skill</th>
                <th>Training / LeaD Intervention</th>
                <th>Mode of Activity</th>
                <th>Trainer / Provider</th>
                <th>Intended Year of Enrollment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!form.proactRows.length" class="empty-row">
                <td colspan="7">No Pro-ACT entries.</td>
              </tr>
              <tr v-for="(row, i) in form.proactRows" :key="i">
                <td class="tc">{{ i + 1 }}</td>
                <td>
                  <div class="proact-skill-label-edit">
                    {{ row.targetSkill || "—" }}
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.trainingTitle"
                    list="proact-suggestions-edit"
                  />
                  <datalist id="proact-suggestions-edit">
                    <option
                      v-for="s in proactSuggestions"
                      :key="s"
                      :value="s"
                    />
                  </datalist>
                </td>
                <td><input type="text" v-model="row.modeOfActivity" /></td>
                <td><input type="text" v-model="row.trainerProvider" /></td>
                <td><input type="text" v-model="row.targetTimeline" /></td>
                <td>
                  <button
                    class="btn-remove-row"
                    @click="form.proactRows.splice(i, 1)"
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Submit bar -->
      <div class="submit-bar">
        <div class="submit-bar-note">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="14"
            height="14"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Saving will notify your supervisor to re-review your updated
          submission.
        </div>
        <div class="submit-bar-actions">
          <button class="btn-secondary" @click="stage = 'lookup'">
            Cancel
          </button>
          <button
            class="btn-primary"
            :disabled="submitLoading"
            @click="doSubmitEdit"
          >
            {{ submitLoading ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── STAGE 3: SUCCESS ──────────────────────────────────────────────── -->
    <div v-if="stage === 'success'" class="center-wrap">
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h2>IDP Updated Successfully</h2>
        <p>
          Your changes to <strong>{{ lookupRefId }}</strong> have been saved.
          Your supervisor has been notified by email and will review the updated
          version.
        </p>
        <div class="ref-box">{{ lookupRefId }}</div>
        <p style="font-size: 13px; color: var(--text-light)">
          You may continue editing until your supervisor completes their review.
        </p>
        <div class="success-actions">
          <button class="btn-secondary" @click="resetAndEdit">
            Edit Again
          </button>
          <NuxtLink to="/" class="btn-primary-link">Back to Home</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ ssr: false });
import { ref, reactive } from "vue";

const config = useRuntimeConfig();
const API = config.public.apiBase;

// ── State ───────────────────────────────────────────────────────────────────
const stage = ref("lookup"); // 'lookup' | 'form' | 'locked' | 'success'
const lookupRefId = ref("");
const lookupEmail = ref("");
const lookupError = ref("");
const lookupLoading = ref(false);
const submitLoading = ref(false);

const heiSuggestions = ref([]);
const proactSuggestions = ref([]);

const form = reactive({
  // Header
  lastName: "",
  firstName: "",
  middleInitial: "",
  employeeEmail: "",
  datePrepared: "",
  officeAffiliation: "",
  collegeOfficeUnit: "",
  collegeProgram: "",
  personnelType: "",
  currentPosition: "",
  designation: "",
  educAttainment: "",
  educAttainmentSpec: "",
  yearsInPosition: "",
  yearsInCSU: "",
  supervisorName: "",
  supervisorEmail: "",
  headerPurpose: "",
  competencyPurpose: "",
  // Sections
  competencyRows: [],
  agapRows: [],
  proactRows: [],
});

const errors = reactive({});

// ── Sub-office map (same as idp-form.vue) ──────────────────────────────────
const subOfficeMap = {
  OVPAF: [
    "Business & Resource Management Office",
    "Corporate Enterprise Development Office",
    "Disaster Risk Reduction and Management Office",
    "Engineering & Construction Office",
    "General Services Office",
    "Human Resource Management Services",
    "Office of the Campus Safety & Security",
    "Procurement Office",
    "Records Management Office",
    "Supply and Property Management Office",
    "University Accounting Office",
    "University Budget Office",
    "University Cashiering Office",
    "University Press",
  ],
  OVPAA: [
    { name: "College of Agricultural and Agri-Industries (CAA)", programs: [] },
    {
      name: "College of Computing and Information Sciences (CCIS)",
      programs: [],
    },
    { name: "College of Engineering and Geo-Sciences (CEGS)", programs: [] },
    {
      name: "College of Forestry and Environmental Sciences (COFES)",
      programs: [],
    },
    { name: "College of Humanities and Social Sciences (CHaSS)", programs: [] },
    {
      name: "College of Mathematics and Natural Sciences (CMNS)",
      programs: [],
    },
    { name: "National Service Training Program (NSTP)", programs: [] },
    { name: "Office of Curriculum & Instruction Development", programs: [] },
    { name: "Office of Student Internship Programs", programs: [] },
    { name: "Office of the University Librarian", programs: [] },
    { name: "Office of the University Registrar", programs: [] },
    { name: "Professional Schools", programs: [] },
  ],
  OVPEO: [
    "Alumni Relations Office",
    "Management Information System",
    "Office of Internationalization and Global Engagements",
    "Office of Strategic Foresight and Futures Thinking",
    "Office of the Planning & Quality Management Services",
    "Project Management Office",
    "Public Information & Communication Office",
  ],
  OVPSAS: [
    "Office of the Admission & Scholarship",
    "Office of the Counselling & Career Services",
    "Office of the Student Leadership & Development",
    "Office of the Student Welfare & Engagements",
    "University Center for Culture & Arts",
    "University Center for Health & Wellness",
    "University Center for Sports & Recreation",
  ],
  OVPRDIE: [
    "Extension Services Office",
    "RDIE Publication Management Office",
    "Research & Development and Innovation Services",
    "Technology Business Incubator Office",
    "Technology Transfer & Licensing Office",
  ],
};

// ── Lookup ──────────────────────────────────────────────────────────────────
async function doLookup() {
  lookupError.value = "";
  const refId = lookupRefId.value.trim().toUpperCase();
  const email = lookupEmail.value.trim().toLowerCase();

  if (!refId) {
    lookupError.value = "Please enter your Reference ID.";
    return;
  }
  if (!email) {
    lookupError.value = "Please enter your CarSU email address.";
    return;
  }
  if (!email.endsWith("@carsu.edu.ph")) {
    lookupError.value = "Must be a @carsu.edu.ph email address.";
    return;
  }

  lookupLoading.value = true;
  try {
    const res = await fetch(
      `${API}/api/idp/${encodeURIComponent(refId)}/edit-check?email=${encodeURIComponent(email)}`,
    );
    if (res.status === 403) {
      const data = await res.json();
      // Distinguish locked vs wrong email by message content
      if (data.message && data.message.toLowerCase().includes("reviewed")) {
        stage.value = "locked";
      } else {
        lookupError.value = data.message || "Access denied.";
      }
      return;
    }
    if (res.status === 404) {
      lookupError.value =
        "No IDP found with that Reference ID. Please check and try again.";
      return;
    }
    if (!res.ok) {
      lookupError.value = "Something went wrong. Please try again.";
      return;
    }

    const record = await res.json();
    populateForm(record);

    // Fetch suggestions in parallel
    fetchSuggestions();

    lookupRefId.value = refId;
    stage.value = "form";
  } catch {
    lookupError.value =
      "Network error. Please check your connection and try again.";
  } finally {
    lookupLoading.value = false;
  }
}

function populateForm(record) {
  form.lastName = record.lastName || "";
  form.firstName = record.firstName || "";
  form.middleInitial = record.middleInitial || "";
  form.employeeEmail = record.employeeEmail || "";
  form.datePrepared = record.datePrepared || "";
  form.officeAffiliation = record.officeAffiliation || "";
  form.collegeOfficeUnit = record.collegeOfficeUnit || "";
  form.collegeProgram = record.collegeProgram || "";
  form.personnelType = record.personnelType || "";
  form.currentPosition = record.currentPosition || "";
  form.designation = record.designation || "";
  form.educAttainment = record.educAttainment || "";
  form.educAttainmentSpec = record.educAttainmentSpec || "";
  form.yearsInPosition = record.yearsInPosition ?? "";
  form.yearsInCSU = record.yearsInCSU ?? "";
  form.supervisorName = record.supervisorName || "";
  form.supervisorEmail = record.supervisorEmail || "";
  form.headerPurpose = record.headerPurpose || "";
  form.competencyPurpose = record.competencyPurpose || "";

  try {
    form.competencyRows = JSON.parse(record.competencyRowsJson || "[]");
  } catch {
    form.competencyRows = [];
  }
  try {
    form.agapRows = JSON.parse(record.agapRowsJson || "[]");
  } catch {
    form.agapRows = [];
  }
  try {
    form.proactRows = JSON.parse(record.proactRowsJson || "[]");
  } catch {
    form.proactRows = [];
  }
}

// ── Suggestions ─────────────────────────────────────────────────────────────
async function fetchSuggestions() {
  try {
    const [heiRes, proactRes] = await Promise.all([
      fetch(`${API}/api/idp/suggestions/hei`),
      fetch(`${API}/api/idp/suggestions/proact`),
    ]);
    if (heiRes.ok) heiSuggestions.value = await heiRes.json();
    if (proactRes.ok) proactSuggestions.value = await proactRes.json();
  } catch {
    /* suggestions are optional */
  }
}

// ── Submit edit ──────────────────────────────────────────────────────────────
async function doSubmitEdit() {
  submitLoading.value = true;
  try {
    const payload = {
      email: lookupEmail.value.trim().toLowerCase(),
      ...form,
      // Pass parsed arrays — backend will re-stringify
      competencyRows: form.competencyRows,
      agapRows: form.agapRows,
      proactRows: form.proactRows,
    };

    const res = await fetch(
      `${API}/api/idp/${encodeURIComponent(lookupRefId.value.trim().toUpperCase())}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (res.status === 403) {
      const data = await res.json();
      if (data.message && data.message.toLowerCase().includes("reviewed")) {
        stage.value = "locked";
      } else {
        alert(data.message || "Access denied.");
      }
      return;
    }
    if (!res.ok) {
      alert("Failed to save changes. Please try again.");
      return;
    }

    stage.value = "success";
  } catch {
    alert("Network error. Please check your connection and try again.");
  } finally {
    submitLoading.value = false;
  }
}

function resetAndEdit() {
  stage.value = "lookup";
  // Re-trigger lookup immediately with same credentials
  doLookup();
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap");

:root {
  --navy: #1a4d2e;
  --navy-mid: #2d6a3f;
  --navy-light: #3d8b50;
  --gold: #f5c300;
  --gold-light: #ffd740;
  --gold-dim: rgba(245, 195, 0, 0.12);
  --cream: #faf8f4;
  --white: #fff;
  --text: #1a1a2e;
  --text-light: #5a6070;
  --border: #d8d4c8;
  --error: #c0392b;
  --success: #1a6b3c;
  --shadow: 0 4px 24px rgba(26, 77, 46, 0.1);
  --shadow-sm: 0 2px 8px rgba(26, 77, 46, 0.07);
  --shadow-lg: 0 12px 48px rgba(26, 77, 46, 0.18);
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Roboto", sans-serif;
}

/* ── Nav ── */
.page-nav {
  background: var(--navy);
  padding: 0 28px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.back-link {
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
.back-link::after {
  content: '';
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
.back-link:hover {
  color: #fff;
}
.back-link:hover::after {
  transform: scaleX(1);
}
.back-link svg {
  width: 13px;
  height: 13px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.8;
  transition: transform 0.2s;
}
.back-link:hover svg {
  transform: translateX(-3px);
  opacity: 1;
}
.nav-sep {
  color: rgba(255, 255, 255, 0.25);
  font-size: 13px;
  margin: 0 10px;
}
.nav-current {
  font-size: 12.5px;
  color: var(--gold);
  font-weight: 600;
}

/* ── Centered cards ── */
.center-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 44px);
  padding: 40px 20px;
}

.lookup-card,
.locked-card,
.success-card {
  background: var(--white);
  border-radius: 20px;
  padding: 48px 44px;
  max-width: 480px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  text-align: center;
  animation: fadeUp 0.5s ease;
}
.lookup-card,
.success-card {
  border: 1px solid var(--border);
}
.locked-card {
  border: 1px solid #f5c6c2;
}
.lookup-icon {
  width: 68px;
  height: 68px;
  background: var(--navy);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 24px rgba(26, 77, 46, 0.25);
}
.lookup-icon svg {
  width: 32px;
  height: 32px;
  stroke: var(--gold);
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.lookup-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  background: var(--gold-dim);
  border: 1px solid rgba(245, 195, 0, 0.3);
  border-radius: 20px;
  display: inline-block;
  padding: 4px 14px;
  margin-bottom: 12px;
}
.locked-card h2 {
  font-family: "Roboto", sans-serif;
  font-size: 22px;
  color: var(--error);
  margin-bottom: 8px;
}
.lookup-card h2,
.success-card h2 {
  font-family: "Roboto", sans-serif;
  font-size: 24px;
  color: var(--navy);
  margin-bottom: 10px;
}
.lookup-card > p,
.locked-card > p,
.success-card > p {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 6px;
}

.lookup-fields {
  text-align: left;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field-wrap label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--navy-mid);
}
.field-wrap input {
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f8f7f4;
  width: 100%;
}
.field-wrap input:focus {
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(26, 77, 46, 0.08);
  background: #fff;
}
.field-wrap input.err {
  border-color: var(--error);
}

.error-msg {
  color: var(--error);
  font-size: 12px;
  margin-top: -6px;
}

.locked-icon {
  width: 68px;
  height: 68px;
  background: rgba(192, 57, 43, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  margin: 0 auto 18px;
}
.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.ref-box {
  font-family: monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--navy);
  background: rgba(26, 77, 46, 0.06);
  border: 1px solid rgba(26, 77, 46, 0.15);
  border-radius: 8px;
  padding: 10px 20px;
  display: inline-block;
  margin: 16px 0;
}
.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

/* ── Edit form ── */
.form-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 28px 80px;
}

.edit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(245, 195, 0, 0.12);
  border: 1.5px solid rgba(245, 195, 0, 0.4);
  border-radius: 10px;
  padding: 12px 18px;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}
.edit-banner-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--navy);
}
.edit-banner-left svg {
  flex-shrink: 0;
  stroke: var(--navy);
}

.form-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px 28px;
  margin-bottom: 18px;
  box-shadow: var(--shadow-sm);
}
.form-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid var(--border);
}
.form-card-header h3 {
  font-family: "Roboto", sans-serif;
  font-size: 17px;
  color: var(--navy);
}
.section-badge {
  background: var(--navy);
  color: var(--gold);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-light);
}
.field-group input,
.field-group select {
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
  background: var(--white);
}
.field-group input:focus,
.field-group select:focus {
  border-color: var(--navy);
}
.field-group input.error,
.field-group select.error {
  border-color: var(--error);
}
.field-hint {
  font-size: 11px;
  color: var(--text-light);
}
.input-disabled {
  background: #f3f2ee !important;
  color: var(--text-light) !important;
  cursor: not-allowed;
}
.span-2 {
  grid-column: span 2;
}
.span-3 {
  grid-column: span 2;
}
.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
}
.mi-col {
  width: 70px;
}
.req {
  color: var(--error);
}

.sections-note {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: rgba(26, 77, 46, 0.04);
  border-color: rgba(26, 77, 46, 0.18);
}
.sections-note-icon {
  font-size: 24px;
  flex-shrink: 0;
}
.sections-note p {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 4px;
}

.table-scroll {
  overflow-x: auto;
}
.edit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.edit-table thead tr {
  background: var(--navy);
}
.edit-table thead th {
  padding: 9px 11px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  white-space: nowrap;
}
.edit-table tbody tr {
  border-bottom: 1px solid var(--border);
}
.edit-table tbody tr:last-child {
  border-bottom: none;
}
.edit-table tbody td {
  padding: 8px 8px;
  vertical-align: middle;
}
.edit-table input {
  width: 100%;
  padding: 6px 8px;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  color: var(--text);
  outline: none;
  min-width: 90px;
}
.edit-table input:focus {
  border-color: var(--navy);
}
.tc {
  text-align: center;
  font-weight: 700;
  color: var(--text-light);
  font-size: 12px;
  width: 30px;
}
.empty-row td {
  text-align: center;
  padding: 16px;
  color: var(--text-light);
  font-style: italic;
}
.btn-remove-row {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-light);
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}
.btn-remove-row:hover {
  background: rgba(192, 57, 43, 0.1);
  color: var(--error);
}
.proact-skill-label-edit {
  background: rgba(0, 51, 0, 0.07);
  border: 1.5px solid rgba(0, 51, 0, 0.25);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--navy);
  min-width: 140px;
}

.submit-bar {
  position: sticky;
  bottom: 0;
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  box-shadow: 0 -4px 16px rgba(26, 77, 46, 0.08);
  border-radius: 0 0 14px 14px;
  z-index: 10;
}
.submit-bar-note {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--text-light);
  flex: 1;
}
.submit-bar-note svg {
  flex-shrink: 0;
  stroke: var(--text-light);
}
.submit-bar-actions {
  display: flex;
  gap: 10px;
}

/* ── Buttons ── */
.btn-primary {
  padding: 13px 28px;
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  box-shadow: 0 4px 16px rgba(26, 77, 46, 0.2);
  width: 100%;
  margin-top: 6px;
}
.btn-primary:hover:not(:disabled) {
  background: var(--navy-mid);
  transform: translateY(-1px);
}
.btn-primary:disabled {
  background: #aaa;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-primary-link {
  padding: 11px 24px;
  background: var(--navy);
  color: #fff;
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: background 0.2s;
}
.btn-primary-link:hover {
  background: var(--navy-mid);
}
.btn-secondary {
  padding: 11px 24px;
  background: var(--white);
  color: var(--navy);
  border: 1.5px solid var(--border);
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: var(--navy);
}
.btn-cancel-edit {
  padding: 7px 16px;
  background: none;
  border: 1.5px solid var(--border);
  border-radius: 7px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-cancel-edit:hover {
  border-color: var(--error);
  color: var(--error);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>