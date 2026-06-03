<template>
  <div class="wrap">
    <div class="card">
      <h2>My Profile</h2>
      <p>Changes here will reflect on future IDP and LNA submissions.</p>

      <!-- Toast notification -->
      <Transition name="toast">
        <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
          <span class="toast-icon">{{
            toast.type === "success" ? "✓" : "✕"
          }}</span>
          {{ toast.message }}
        </div>
      </Transition>

      <div class="field-group">
        <label>Name</label>
        <div class="name-grid">
          <div>
            <small>Last Name</small>
            <input
              v-model="form.lastName"
              type="text"
              @input="form.lastName = form.lastName.toUpperCase()"
            />
          </div>
          <div>
            <small>First Name</small>
            <input
              v-model="form.firstName"
              type="text"
              @input="form.firstName = form.firstName.toUpperCase()"
            />
          </div>
          <div style="max-width: 80px">
            <small>M.I.</small>
            <input
              v-model="form.middleInitial"
              type="text"
              maxlength="1"
              @input="form.middleInitial = form.middleInitial.toUpperCase()"
            />
          </div>
        </div>
      </div>

      <div class="field-group">
        <label>Email</label>
        <input
          :value="user?.email"
          type="text"
          disabled
          style="background: #e8ede8; color: #888"
        />
      </div>

      <div class="field-group">
        <label>Office Affiliation</label>
        <select v-model="form.officeAffiliation">
          <option value="">Select…</option>
          <option>OVPAF</option>
          <option>OVPAA</option>
          <option>OVPEO</option>
          <option>OVPSAS</option>
          <option>OVPRDIE</option>
        </select>
      </div>

      <div class="field-group">
        <label>College / Office / Unit</label>
        <input
          v-model="form.collegeOfficeUnit"
          type="text"
          @input="form.collegeOfficeUnit = form.collegeOfficeUnit.toUpperCase()"
        />
      </div>

      <div class="field-group">
        <label>Current Position</label>
        <input v-model="form.currentPosition" type="text" />
      </div>

      <div class="field-group">
        <label>Designation</label>
        <input v-model="form.designation" type="text" />
      </div>

      <div class="field-group">
        <label>Highest Educational Attainment</label>
        <select v-model="form.educAttainment">
          <option value="">Select…</option>
          <option>Bachelor's Degree</option>
          <option>Post-Baccalaureate Certificate</option>
          <option>Master's Degree</option>
          <option>Post-Master's Certificate</option>
          <option>Doctorate Degree (Ph.D. / Ed.D. / etc.)</option>
          <option>Post-Doctoral</option>
        </select>
        <input
          v-model="form.educAttainmentSpec"
          type="text"
          placeholder="Specify degree / program"
          style="margin-top: 8px"
          @input="
            form.educAttainmentSpec = form.educAttainmentSpec.toUpperCase()
          "
        />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px">
        <div class="field-group">
          <label>Years in Position</label>
          <input v-model="form.yearsInPosition" type="number" min="0" />
        </div>
        <div class="field-group">
          <label>Years in CSU</label>
          <input v-model="form.yearsInCSU" type="number" min="0" />
        </div>
      </div>

      <div class="form-section-note">Used in IDP Form</div>

      <div class="field-group">
        <label>Immediate Supervisor Name</label>
        <div class="name-grid">
          <div>
            <small>Last Name</small>
            <input
              v-model="form.supervisorLastName"
              type="text"
              @input="
                form.supervisorLastName = form.supervisorLastName.toUpperCase()
              "
            />
          </div>
          <div>
            <small>First Name</small>
            <input
              v-model="form.supervisorFirstName"
              type="text"
              @input="
                form.supervisorFirstName =
                  form.supervisorFirstName.toUpperCase()
              "
            />
          </div>
          <div style="max-width: 80px">
            <small>M.I.</small>
            <input
              v-model="form.supervisorMiddleInitial"
              type="text"
              maxlength="1"
              @input="
                form.supervisorMiddleInitial =
                  form.supervisorMiddleInitial.toUpperCase()
              "
            />
          </div>
        </div>
      </div>

      <div class="field-group">
        <label>Supervisor CarSU Email</label>
        <input
          v-model="form.supervisorEmail"
          type="text"
          placeholder="supervisor@carsu.edu.ph"
        />
      </div>

      <button
        class="btn-save"
        :class="{ 'btn-saved': justSaved }"
        :disabled="loading"
        @click="save"
      >
        <span v-if="loading" class="btn-spinner"></span>
        <template v-else-if="justSaved">✓ Saved!</template>
        <template v-else>Save Changes</template>
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ["auth"] });
const { user, getAccessToken, fetchMe } = useAuth();
const config = useRuntimeConfig();

const loading = ref(false);
const justSaved = ref(false);

const toast = reactive({ show: false, type: "success", message: "" });

function showToast(type, message) {
  toast.type = type;
  toast.message = message;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3500);
}

const form = reactive({
  firstName: "",
  lastName: "",
  middleInitial: "",
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
  supervisorLastName: "",
  supervisorFirstName: "",
  supervisorMiddleInitial: "",
  supervisorEmail: "",
  office: "",
  raterName: "",
});

onMounted(() => {
  if (user.value) {
    Object.keys(form).forEach((k) => {
      if (user.value[k] !== undefined) form[k] = user.value[k];
    });
  }
});

async function save() {
  loading.value = true;
  justSaved.value = false;
  try {
    const res = await fetch(`${config.public.apiBase}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      showToast("error", "Failed to save. Please try again.");
      return;
    }
    await fetchMe();
    justSaved.value = true;
    showToast("success", "Profile updated successfully.");
    setTimeout(() => {
      justSaved.value = false;
    }, 2500);
  } catch {
    showToast("error", "Network error. Please check your connection.");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #f5f4f0;
  padding: 48px 24px;
}
.card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(26, 77, 46, 0.12);
  border: 1px solid #d8d4c8;
  font-family: "Roboto", sans-serif;
}
h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a4d2e;
  margin-bottom: 6px;
}
p {
  font-size: 13px;
  font-weight: 400;
  color: #5a6070;
  margin-bottom: 24px;
}

/* ── TOAST ───────────────────────────────────────────── */
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 20px;
}
.toast-success {
  background: #f0faf4;
  border: 1.5px solid #6dbb8a;
  color: #1a6b3c;
}
.toast-error {
  background: #fdf0f0;
  border: 1.5px solid #e09090;
  color: #c0392b;
}
.toast-icon {
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}

/* Toast transition */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.label-hint {
  display: none;
}
.form-section-note {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1a4d2e;
  background: #e8f4ed;
  border: 1.5px solid #a0ccb0;
  border-radius: 20px;
  display: inline-block;
  padding: 3px 10px;
  margin-bottom: 14px;
  margin-top: 8px;
}

/* ── SECTION DIVIDERS ────────────────────────────────── */
.section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 24px 0 18px;
}
.section-badge {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 3px 9px;
  border-radius: 20px;
  flex-shrink: 0;
}
.badge-idp {
  background: #e8f4ed;
  color: #1a4d2e;
  border: 1.5px solid #a0ccb0;
}
.badge-lna {
  background: #fff8e1;
  color: #7a5500;
  border: 1.5px solid #f5c300;
}
.section-divider-label {
  font-size: 11px;
  color: #aaa;
  font-weight: 500;
  white-space: nowrap;
}
.section-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #ece9e0;
}

/* ── FIELDS ──────────────────────────────────────────── */
.field-group {
  margin-bottom: 16px;
}
.field-group label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #2d6a3f;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 5px;
  font-family: "Roboto", sans-serif;
}
.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 80px;
  gap: 10px;
}
.name-grid small {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #888;
  margin-bottom: 4px;
  font-family: "Roboto", sans-serif;
}
input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #d8d4c8;
  border-radius: 8px;
  background: #f8f7f4;
  font-size: 14px;
  font-family: "Roboto", sans-serif;
  outline: none;
}
input:focus,
select:focus {
  border-color: #1a4d2e;
}

/* ── BUTTON ──────────────────────────────────────────── */
.btn-save {
  width: 100%;
  padding: 13px;
  background: #1a4d2e;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.btn-save:hover:not(:disabled) {
  background: #2d6a3f;
}
.btn-save:disabled {
  background: #aaa;
  cursor: not-allowed;
}
.btn-save.btn-saved {
  background: #1a7a3c;
}
.btn-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
