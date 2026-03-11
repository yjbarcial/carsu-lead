<template>
  <div>
    <header class="header">
      <div class="header-inner">
        <img src="/img/csu-logo-square1.png" class="logo" alt="CarSU" />
        <div class="header-label">
          <span class="header-label-bot">Caraga State University - Main Campus</span>
          <span class="header-label-top">Human Resource Management Services</span>
        </div>
      </div>
    </header>

    <NuxtPage />
  </div>
</template>

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
</style>