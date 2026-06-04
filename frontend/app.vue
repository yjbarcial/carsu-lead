<template>
  <div>
    <ClientOnly>
      <header class="header">
        <div class="header-inner">
          <img src="/img/csu-logo-square1.png" class="logo" alt="CarSU" />
          <div class="header-label">
            <span class="header-label-bot"
              >Caraga State University - Main Campus</span
            >
            <span class="header-label-top"
              >Human Resource Management Services</span
            >
          </div>

          <nav v-if="isLoggedIn" class="app-nav">
            <NuxtLink to="/" class="nav-link">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </NuxtLink>
            <NuxtLink to="/profile" class="nav-link">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {{ user?.firstName || user?.email?.split("@")[0] || "Profile" }}
            </NuxtLink>
            <button class="nav-logout" @click="logout">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out
            </button>
          </nav>
        </div>
      </header>
    </ClientOnly>
    <NuxtPage />
  </div>
</template>

<script setup>
const { isLoggedIn, user, logout, tryRefresh } = useAuth();

onMounted(() => {
  tryRefresh();
});
</script>

<style>
.header {
  background: #003300;
  border-bottom: 4px solid #ffcc00;
  padding: 14px 32px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-inner {
  display: flex;
  align-items: center;
  gap: 20px;
}
.logo {
  height: 46px;
  width: auto;
}
.header-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-left: 2px solid rgba(255, 204, 0, 0.35);
  padding-left: 18px;
  flex: 1;
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
.app-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}
.nav-link svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.nav-link.router-link-active {
  background: rgba(255, 204, 0, 0.15);
  color: #ffcc00;
}
.nav-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}
.nav-logout svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
.nav-logout:hover {
  background: rgba(192, 57, 43, 0.2);
  border-color: rgba(192, 57, 43, 0.5);
  color: #fff;
}
</style>
