import { ref, computed } from "vue";

const accessToken = ref<string | null>(null);
const user = ref<any | null>(null);

export function useAuth() {
  const isLoggedIn = computed(() => !!accessToken.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const isHrStaff = computed(() => user.value?.role === "hr-staff" || user.value?.role === "admin");
  const profileComplete = computed(() => user.value?.profileComplete === true);

  function setTokens(tokens: { accessToken: string; refreshToken: string }) {
    accessToken.value = tokens.accessToken;
    if (import.meta.client) {
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }
  }

  function getAccessToken() {
    return accessToken.value;
  }

  async function fetchMe() {
    if (!accessToken.value) return;
    const config = useRuntimeConfig();
    try {
      const res = await fetch(`${config.public.apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      });
      if (res.ok) {
        user.value = await res.json();
      } else {
        await tryRefresh();
      }
    } catch {
      user.value = null;
    }
  }

  async function tryRefresh() {
    if (!import.meta.client) return;
    const storedRefresh = localStorage.getItem("refreshToken");
    if (!storedRefresh) {
      logout();
      return;
    }
    const config = useRuntimeConfig();
    try {
      const res = await fetch(`${config.public.apiBase}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data);
        await fetchMe();
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }

  async function logout() {
    if (import.meta.client) {
      const storedRefresh = localStorage.getItem("refreshToken");
      const config = useRuntimeConfig();
      if (storedRefresh) {
        await fetch(`${config.public.apiBase}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        }).catch(() => {});
      }
      localStorage.removeItem("refreshToken");
    }
    accessToken.value = null;
    user.value = null;
    navigateTo("/login");
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    isHrStaff,
    profileComplete,
    setTokens,
    getAccessToken,
    fetchMe,
    tryRefresh,
    logout,
  };
}
