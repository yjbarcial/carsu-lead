export default defineNuxtRouteMiddleware(async () => {
  if (!import.meta.client) return;
  const { isLoggedIn, tryRefresh } = useAuth();
  if (!isLoggedIn.value) {
    await tryRefresh();
  }
  if (!isLoggedIn.value) {
    return navigateTo("/login");
  }
});
