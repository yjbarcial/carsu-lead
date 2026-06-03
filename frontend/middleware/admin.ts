export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) return;
  const { isAdmin } = useAuth();
  if (!isAdmin.value) {
    return navigateTo("/");
  }
});
