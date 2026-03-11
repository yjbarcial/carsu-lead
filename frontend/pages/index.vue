<template>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <img src="/img/header-logo.png" class="logo" />
    </header>

    <!-- Hero -->
    <section class="hero">
      <span class="hero-tag">HRMS • Learning & Development</span>

      <h1>LeaD Forms Portal</h1>

      <p>
        Access official HRMS Learning and Development forms for Individual
        Development Plans and Workforce Assessment.
      </p>
    </section>

    <!-- Forms -->
    <main class="container">
      <h3 class="section-title">Available Forms</h3>

      <div class="card-grid">
        <!-- IDP -->
        <NuxtLink to="/idp-form" class="card">
          <div class="card-top">
            <span class="badge">Employee</span>
            <h3>Individual Development Plan</h3>
          </div>

          <p>
            Plan and document your professional development goals, competency
            targets, and training interventions.
          </p>

          <span class="card-link">Open IDP →</span>
        </NuxtLink>

        <!-- LNA -->
        <NuxtLink to="/lna-form" class="card">
          <div class="card-top">
            <span class="badge">Head of Office</span>
            <h3>USWAG Plan — LNA Tool</h3>
          </div>

          <p>
            Workforce Learning Needs Assessment for identifying competency gaps
            and training interventions.
          </p>

          <span class="card-link">Open LNA →</span>
        </NuxtLink>
      </div>

      <!-- HR Section -->
      <h3 class="section-title">HR Staff Access</h3>

      <div class="card-grid">
        <NuxtLink to="/dashboard" class="card card-hr">
          <div class="card-top">
            <span class="badge badge-hr">HR Staff</span>
            <h3>LeaD Dashboard</h3>
          </div>

          <p>
            Manage all IDP and LNA submissions, review records, and control HR
            user access.
          </p>

          <span class="card-link">Open Dashboard →</span>
        </NuxtLink>
      </div>

      <!-- Help -->
      <div class="help">
        <strong>Need help?</strong>
        Contact
        <a href="mailto:hrms@carsu.edu.ph">hrms@carsu.edu.ph</a>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">Caraga State University — HRMS</footer>
  </div>
</template>

<style scoped>
/* ================================
COLOR VARIABLES
================================ */

:root {
  --primary: #ffcc00;
  --primary-accent: #ff9900;
  --primary-dark: #137300;
  --white: #ffffff;
  --secondary: #333333;
  --secondary-dark: #003300;
  --border: #e6e6e6;
}

/* ================================
GLOBAL
================================ */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page {
  background: linear-gradient(180deg, #ffffff 0%, #ffcc0010 100%);
  min-height: 100vh;
  font-family: Inter, sans-serif;
  color: var(--secondary);
}

/* ================================
HEADER
================================ */

.header {
  background: var(--white);
  padding: 16px 0;
  border-bottom: 4px solid var(--primary);
  text-align: center;
}

.logo {
  height: 50px;
}

/* ================================
HERO
================================ */

.hero {
  text-align: center;
  padding: 60px 20px 40px;
}

.hero-tag {
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--primary-dark);
  font-weight: 600;
}

.hero h1 {
  font-size: 38px;
  margin: 12px 0;
  color: var(--secondary-dark);
}

.hero p {
  max-width: 600px;
  margin: auto;
  color: var(--secondary);
  line-height: 1.6;
}

/* ================================
CONTAINER
================================ */

.container {
  max-width: 1100px;
  margin: auto;
  padding: 20px;
}

/* ================================
SECTION TITLES
================================ */

.section-title {
  margin: 40px 0 16px;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: var(--secondary);
  text-transform: uppercase;
}

/* ================================
GRID
================================ */

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* ================================
CARD
================================ */

.card {
  background: var(--white);
  border: 2px solid var(--primary);
  border-radius: 14px;
  padding: 28px;
  text-decoration: none;
  color: var(--secondary);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

/* gold highlight line */

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #ffcc00, #ff9900);
  opacity: 0.85;
}

.card:hover {
  transform: translateY(-6px);
  border-color: var(--primary-accent);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06);
}

.card-top {
  margin-bottom: 12px;
}

.card h3 {
  font-size: 18px;
  margin: 6px 0;
  color: var(--secondary-dark);
}

.card p {
  font-size: 14px;
  color: var(--secondary);
  line-height: 1.6;
}

/* ================================
BADGES
================================ */

.badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--primary);
  color: var(--secondary-dark);
  font-weight: 600;
  display: inline-block;
}

.badge-hr {
  background: var(--primary-accent);
  color: var(--white);
}

/* ================================
HR CARD
================================ */

.card-hr {
  border-left: 5px solid var(--primary-dark);
}

/* ================================
CARD LINK
================================ */

.card-link {
  margin-top: 20px;
  font-weight: 600;
  color: var(--primary-dark);
  font-size: 14px;
  transition: all 0.25s ease;
}

.card:hover .card-link {
  color: var(--primary-accent);
  transform: translateX(3px);
}

/* ================================
HELP BOX
================================ */

.help {
  margin-top: 40px;
  padding: 20px;
  background: var(--white);
  border-radius: 10px;
  border: 2px solid var(--primary);
  font-size: 14px;
}

.help a {
  color: var(--primary-dark);
  font-weight: 600;
  text-decoration: none;
}

.help a:hover {
  color: var(--primary-accent);
}

/* ================================
FOOTER
================================ */

.footer {
  margin-top: 60px;
  background: var(--secondary-dark);
  color: var(--white);
  text-align: center;
  padding: 16px;
  font-size: 13px;
}

/* ================================
MOBILE
================================ */

@media (max-width: 640px) {
  .hero h1 {
    font-size: 28px;
  }

  .container {
    padding: 16px;
  }

  .card {
    padding: 22px;
  }
}
</style>

<script setup>
// No logic needed for this page — it's a static portal landing page.
// Links use NuxtLink which handles client-side routing automatically.
</script>
