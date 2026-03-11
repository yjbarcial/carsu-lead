<template>
  <div class="page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb o1"></div>
        <div class="hero-orb o2"></div>
        <div class="hero-orb o3"></div>
        <div class="hero-dots"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-eyebrow">
          <span class="dot"></span>
          <span>Official HRMS Portal — Caraga State University</span>
          <span class="dot"></span>
        </div>
        <h1 class="hero-title">
          <span class="hero-title-lead">LeaD</span>
          <span class="hero-title-sub">Forms Portal</span>
        </h1>
        <p class="hero-desc">
          Submit and manage official Learning &amp; Development forms —
          Individual Development Plans and Workforce Needs Assessments — for
          Caraga State University personnel.
        </p>
        <div class="hero-pills">
          <span class="pill">IDP</span>
          <span class="pill">LNA / USWAG</span>
          <span class="pill pill-orange">HR Dashboard</span>
        </div>
      </div>
    </section>

    <!-- Main -->
    <main class="main">
      <!-- Forms section -->
      <div class="section-head">
        <div class="sh-line"></div>
        <span class="sh-label">Available Forms</span>
        <div class="sh-line"></div>
      </div>

      <div class="grid">
        <!-- IDP -->
        <NuxtLink to="/idp-form" class="card">
          <div class="card-bar bar-gold"></div>
          <div class="card-icon icon-gold">
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="6" y="4" width="28" height="34" rx="3" stroke="currentColor" stroke-width="2.2"/>
              <path d="M13 13h14M13 19h14M13 25h9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              <circle cx="30" cy="30" r="7" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="2"/>
              <path d="M27.5 30h5M30 27.5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="card-tag tag-gold">For Employees</div>
          <h2 class="card-title">Individual Development Plan</h2>
          <p class="card-desc">
            Document your professional development goals, competency targets,
            and training interventions. Includes supervisor review stage.
          </p>
          <div class="card-foot">
            <span class="card-meta">2-stage submission</span>
            <span class="card-cta cta-gold">Open Form <span class="arr">→</span></span>
          </div>
        </NuxtLink>

        <!-- LNA -->
        <NuxtLink to="/lna-form" class="card">
          <div class="card-bar bar-orange"></div>
          <div class="card-icon icon-orange">
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="4" y="10" width="32" height="22" rx="3" stroke="currentColor" stroke-width="2.2"/>
              <path d="M4 16h32" stroke="currentColor" stroke-width="2"/>
              <path d="M13 16v16M22 16v16" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2"/>
              <circle cx="30" cy="7" r="4" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.8"/>
              <path d="M28.5 7h3M30 5.5v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="card-tag tag-orange">For Office Heads</div>
          <h2 class="card-title">USWAG Plan — LNA Tool</h2>
          <p class="card-desc">
            Office-wide Workforce Learning Needs Assessment for identifying
            competency gaps, workforce profiles, and training interventions.
          </p>
          <div class="card-foot">
            <span class="card-meta">Single submission</span>
            <span class="card-cta cta-orange">Open Form <span class="arr">→</span></span>
          </div>
        </NuxtLink>
      </div>

      <!-- HR section -->
      <div class="section-head" style="margin-top: 56px">
        <div class="sh-line"></div>
        <span class="sh-label">HR Staff Access</span>
        <div class="sh-line"></div>
      </div>

      <div class="grid">
        <!-- Dashboard -->
        <NuxtLink to="/dashboard" class="card card-dark">
          <div class="card-bar bar-green"></div>
          <div class="card-icon icon-green">
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="4" y="20" width="10" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
              <rect x="15" y="13" width="10" height="21" rx="2" stroke="currentColor" stroke-width="2"/>
              <rect x="26" y="6" width="10" height="28" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M6 17l8-7 9 5 9-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="card-tag tag-green">HR Staff Only</div>
          <h2 class="card-title title-light">LeaD Dashboard</h2>
          <p class="card-desc desc-light">
            View and manage all IDP and LNA submissions, analyze trends with
            charts, access detailed records, and control HR user registry.
          </p>
          <div class="card-foot foot-dark">
            <span class="card-meta meta-light">Requires HR email</span>
            <span class="card-cta cta-green">Open Dashboard <span class="arr">→</span></span>
          </div>
        </NuxtLink>

        <!-- Help -->
        <div class="help-card">
          <div class="help-icon">?</div>
          <h3 class="help-title">Need Help?</h3>
          <p class="help-desc">
            For technical issues or questions about the LeaD system, contact the
            HRMS office directly.
          </p>
          <a href="mailto:hrms@carsu.edu.ph" class="help-link">hrms@carsu.edu.ph</a>
          <div class="help-divider"></div>
          <p class="help-note">
            All submissions require a valid <strong>@carsu.edu.ph</strong> email address.
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-text">
          <span class="footer-name">Caraga State University — Office of Human Resource Management Services</span>
          <span class="footer-sub">Ampayon, Butuan City 8600, Philippines</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ── TOKENS ──────────────────────────────────────────── */
:root {
  --gold: #ffcc00;
  --orange: #ff9900;
  --green: #137300;
  --dk: #003300;
  --white: #ffffff;
  --grey: #333333;
  --bg: #f9f7f2;
  --border: #e8e3d5;
}

/* ── RESET ───────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
a { text-decoration: none; }

/* ── PAGE ────────────────────────────────────────────── */
.page {
  min-height: 100vh;
  background: #f9f7f2;
  font-family: "Source Sans 3", "Segoe UI", sans-serif;
  color: #333;
}

/* ── HEADER ──────────────────────────────────────────── */
.header {
  background: #003300;
  border-bottom: 4px solid #ffcc00;
  padding: 14px 32px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-inner {
  /* No max-width cap — lets content sit closer to the left edge */
  display: flex;
  align-items: center;
  gap: 20px;
}
.logo { height: 46px; width: auto; }
.header-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-left: 2px solid rgba(255, 204, 0, 0.35);
  padding-left: 18px;
}
.header-label-top {
  font-size: 11px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}
.header-label-bot {
  font-size: 15px;
  font-weight: 700;
  color: #ffcc00;
  letter-spacing: 0.02em;
}

/* ── HERO ────────────────────────────────────────────── */
.hero {
  position: relative;
  background: #003300;
  padding: 80px 32px 88px;
  text-align: center;
  overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; pointer-events: none; }
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.12;
}
.o1 { width: 500px; height: 500px; background: #ffcc00; top: -180px; right: -80px; }
.o2 { width: 350px; height: 350px; background: #ff9900; bottom: -120px; left: -60px; }
.o3 { width: 200px; height: 200px; background: #ffcc00; top: 30px; left: 35%; }
.hero-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255, 204, 0, 0.13) 1px, transparent 1px);
  background-size: 28px 28px;
}

.hero-inner { position: relative; max-width: 680px; margin: auto; }

.hero-eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 204, 0, 0.65);
  font-weight: 600;
  margin-bottom: 22px;
}
.dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #ffcc00;
  opacity: 0.55;
  display: inline-block;
}

.hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}
.hero-title-lead {
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(72px, 14vw, 108px);
  font-weight: 700;
  color: #ffcc00;
  line-height: 1;
  letter-spacing: -0.02em;
}
.hero-title-sub {
  font-size: clamp(16px, 3vw, 24px);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  margin-top: 6px;
}

.hero-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.75;
  max-width: 540px;
  margin: 0 auto 28px;
}

.hero-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.pill {
  padding: 6px 18px;
  border-radius: 30px;
  border: 1.5px solid rgba(255, 204, 0, 0.4);
  color: rgba(255, 204, 0, 0.8);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  background: rgba(255, 204, 0, 0.06);
}
.pill-orange {
  border-color: rgba(255, 153, 0, 0.45);
  color: rgba(255, 153, 0, 0.85);
  background: rgba(255, 153, 0, 0.07);
}

/* ── MAIN ────────────────────────────────────────────── */
.main {
  max-width: 1140px;
  margin: 0 auto;
  padding: 64px 24px 88px;
}

/* ── SECTION HEAD ────────────────────────────────────── */
.section-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.sh-line {
  flex: 1;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, #ddd5c0, transparent);
}
.sh-label {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 700;
  color: #999;
  white-space: nowrap;
}

/* ── GRID ────────────────────────────────────────────── */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

/* ── CARD ────────────────────────────────────────────── */
.card {
  background: #fff;
  border: 1.5px solid #e8e3d5;
  border-radius: 16px;
  padding: 32px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  color: #333;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.09);
}

.card-dark { background: #003300; border-color: #1a5200; }
.card-dark:hover { border-color: #137300; }

.card-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  border-radius: 16px 16px 0 0;
}
.bar-gold   { background: linear-gradient(90deg, #ffcc00, #ffdd44); }
.bar-orange { background: linear-gradient(90deg, #ff9900, #ffbb44); }
.bar-green  { background: linear-gradient(90deg, #137300, #1ea300); }

.card-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-icon svg { width: 26px; height: 26px; }
.icon-gold   { background: #fffbea; border: 1.5px solid #ffe566; color: #b89400; }
.icon-orange { background: #fff5e6; border: 1.5px solid #ffd088; color: #cc7700; }
.icon-green  { background: rgba(19, 115, 0, 0.18); border: 1.5px solid rgba(19, 115, 0, 0.35); color: #5adc3a; }

.card-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.tag-gold   { color: #b89400; }
.tag-orange { color: #cc7700; }
.tag-green  { color: #5adc3a; }

.card-title {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 20px;
  font-weight: 700;
  color: #003300;
  line-height: 1.3;
}
.title-light { color: #ffcc00; }

.card-desc { font-size: 14px; color: #777; line-height: 1.65; flex: 1; }
.desc-light { color: rgba(255, 255, 255, 0.55); }

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid #f0ece0;
  margin-top: 4px;
}
.foot-dark { border-top-color: rgba(255, 255, 255, 0.1); }

.card-meta { font-size: 12px; color: #bbb; font-weight: 500; }
.meta-light { color: rgba(255, 255, 255, 0.3); }

.card-cta {
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: gap 0.2s ease;
}
.cta-gold   { color: #b89400; }
.cta-orange { color: #cc7700; }
.cta-green  { color: #5adc3a; }
.card:hover .card-cta { gap: 8px; }

.arr { transition: transform 0.2s ease; }
.card:hover .arr { transform: translateX(3px); }

/* ── HELP CARD ───────────────────────────────────────── */
.help-card {
  background: #fff;
  border: 1.5px solid #e8e3d5;
  border-radius: 16px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.help-icon {
  width: 42px; height: 42px;
  background: #fffbea;
  border: 1.5px solid #ffe566;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #b89400;
}
.help-title {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 20px;
  font-weight: 700;
  color: #003300;
}
.help-desc { font-size: 14px; color: #777; line-height: 1.6; }
.help-link {
  display: inline-block;
  font-size: 14px;
  font-weight: 700;
  color: #137300;
  border-bottom: 1.5px solid rgba(19, 115, 0, 0.3);
  padding-bottom: 2px;
  transition: border-color 0.2s, color 0.2s;
}
.help-link:hover { color: #0a5200; border-color: #137300; }
.help-divider { height: 1px; background: #f0ece0; margin: 2px 0; }
.help-note { font-size: 13px; color: #aaa; line-height: 1.5; }
.help-note strong { color: #888; }

/* ── FOOTER ──────────────────────────────────────────── */
.footer {
  background: #003300;
  border-top: 3px solid #ffcc00;
  padding: 20px 32px;
}
.footer-inner {
  max-width: 1140px;
  margin: auto;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center; 
}
.footer-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center; 
}
.footer-name { font-size: 13px; font-weight: 700; color: #ffcc00; }
.footer-sub  { font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.03em; }

/* ── RESPONSIVE ──────────────────────────────────────── */
@media (max-width: 640px) {
  .header { padding: 12px 16px; }
  .header-label-bot { font-size: 13px; }
  .hero { padding: 56px 20px 64px; }
  .main { padding: 40px 16px 60px; }
  .card, .help-card { padding: 24px 18px 18px; }
  .grid { grid-template-columns: 1fr; }
  .footer { padding: 16px; }
  .footer-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>

<script setup>
// Static portal landing page — no logic needed.
// NuxtLink handles client-side routing automatically.
</script>