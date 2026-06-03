<template>
  <div class="wrap">
    <div class="card">
      <h2>My Profile</h2>
      <p>Changes here will reflect on future IDP and LNA submissions.</p>

      <div v-if="saved" class="success-msg">Profile updated successfully.</div>
      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- Same fields as complete-profile, pre-filled -->
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

      <div class="field-group">
        <label>Head of Unit</label>
        <input
          v-model="form.headOfUnit"
          type="text"
          @input="form.headOfUnit = form.headOfUnit.toUpperCase()"
        />
      </div>

      <button class="btn-save" :disabled="loading" @click="save">
        {{ loading ? "Saving…" : "Save Changes" }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ["auth"] });
const { user, getAccessToken, fetchMe } = useAuth();
const config = useRuntimeConfig();

const loading = ref(false);
const error = ref("");
const saved = ref(false);

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
  error.value = "";
  saved.value = false;
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
      error.value = "Failed to save.";
      return;
    }
    await fetchMe();
    saved.value = true;
  } catch {
    error.value = "Network error.";
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
.success-msg {
  background: #f0faf4;
  border: 1px solid #a0d4b0;
  border-radius: 8px;
  padding: 10px 14px;
  color: #1a6b3c;
  font-size: 13px;
  margin-bottom: 16px;
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
