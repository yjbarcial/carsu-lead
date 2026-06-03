<template>
  <div class="wrap">
    <div class="card">
      <h2>Complete Your Profile</h2>
      <p>
        This information will auto-fill your IDP and LNA forms. You can update
        it anytime in your profile settings.
      </p>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- Name -->
      <div class="field-group">
        <label>Name <span class="req">*</span></label>
        <div class="name-grid">
          <div>
            <small>Last Name</small>
            <input
              v-model="form.lastName"
              type="text"
              placeholder="DELA CRUZ"
              @input="form.lastName = form.lastName.toUpperCase()"
            />
          </div>
          <div>
            <small>First Name</small>
            <input
              v-model="form.firstName"
              type="text"
              placeholder="JUAN"
              @input="form.firstName = form.firstName.toUpperCase()"
            />
          </div>
          <div style="max-width: 80px">
            <small>M.I.</small>
            <input
              v-model="form.middleInitial"
              type="text"
              maxlength="1"
              placeholder="A"
              @input="form.middleInitial = form.middleInitial.toUpperCase()"
            />
          </div>
        </div>
      </div>

      <!-- Office Affiliation -->
      <div class="field-group">
        <label>Office Affiliation <span class="req">*</span></label>
        <select v-model="form.officeAffiliation">
          <option value="">Select…</option>
          <option>OVPAF</option>
          <option>OVPAA</option>
          <option>OVPEO</option>
          <option>OVPSAS</option>
          <option>OVPRDIE</option>
        </select>
      </div>

      <!-- College / Office / Unit -->
      <div class="field-group">
        <label>College / Office / Unit <span class="req">*</span></label>
        <input
          v-model="form.collegeOfficeUnit"
          type="text"
          placeholder="e.g. Human Resource Management Services"
          @input="form.collegeOfficeUnit = form.collegeOfficeUnit.toUpperCase()"
        />
      </div>

      <!-- Position -->
      <div class="field-group">
        <label>Current Position <span class="req">*</span></label>
        <input
          v-model="form.currentPosition"
          type="text"
          placeholder="e.g. Administrative Officer II"
        />
      </div>

      <!-- Designation -->
      <div class="field-group">
        <label>Designation</label>
        <input
          v-model="form.designation"
          type="text"
          placeholder="e.g. Director, or N/A"
        />
      </div>

      <!-- Educational Attainment -->
      <div class="field-group">
        <label>Highest Educational Attainment <span class="req">*</span></label>
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

      <!-- Years -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px">
        <div class="field-group">
          <label>Years in Position</label>
          <input
            v-model="form.yearsInPosition"
            type="number"
            min="0"
            placeholder="0"
          />
        </div>
        <div class="field-group">
          <label>Years in CSU</label>
          <input
            v-model="form.yearsInCSU"
            type="number"
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Head of Unit (for LNA) -->
      <div class="field-group">
        <label>Head of Unit</label>
        <input
          v-model="form.headOfUnit"
          type="text"
          placeholder="Name of your Head of Unit"
          @input="form.headOfUnit = form.headOfUnit.toUpperCase()"
        />
      </div>

      <button class="btn-save" :disabled="loading" @click="save">
        {{ loading ? "Saving…" : "Save & Continue" }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ["auth"] });
const { user, getAccessToken, fetchMe } = useAuth();
const config = useRuntimeConfig();
const error = ref("");
const loading = ref(false);

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
  headOfUnit: "",
  headLastName: "",
  headFirstName: "",
  headMiddleInitial: "",
  office: "",
  raterName: "",
  campus: "CSU Main Campus",
});

// Pre-fill if user already has partial data
onMounted(() => {
  if (user.value) {
    Object.keys(form).forEach((k) => {
      if (user.value[k]) form[k] = user.value[k];
    });
  }
});

async function save() {
  error.value = "";
  if (
    !form.lastName ||
    !form.firstName ||
    !form.officeAffiliation ||
    !form.collegeOfficeUnit ||
    !form.currentPosition ||
    !form.educAttainment 
  ) {
    error.value = "Please fill in all required fields.";
    return;
  }
  loading.value = true;
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
      error.value = "Failed to save profile.";
      return;
    }
    await fetchMe();
    navigateTo("/");
  } catch {
    error.value = "Network error. Try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f4f0;
  padding: 24px;
}
.card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(26, 77, 46, 0.12);
  border: 1px solid #d8d4c8;
}
h2 {
  font-size: 22px;
  color: #1a4d2e;
  margin-bottom: 8px;
}
p {
  font-size: 13px;
  color: #5a6070;
  margin-bottom: 24px;
}
.error-msg {
  background: #fdf0f0;
  border: 1px solid #e0a0a0;
  border-radius: 8px;
  padding: 10px 14px;
  color: #c0392b;
  font-size: 13px;
  margin-bottom: 16px;
}
.field-group {
  margin-bottom: 16px;
}
.field-group label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #2d6a3f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
}
.req {
  color: #c0392b;
}
.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 80px;
  gap: 10px;
}
.name-grid small {
  display: block;
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
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
  outline: none;
}
input:focus,
select:focus {
  border-color: #1a4d2e;
}
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
}
.btn-save:hover {
  background: #2d6a3f;
}
.btn-save:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>
