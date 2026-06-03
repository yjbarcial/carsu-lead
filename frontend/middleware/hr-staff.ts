export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) return;
  const { user } = useAuth();
  const isHrStaff =
    user.value?.role === "hr-staff" || user.value?.role === "admin";
  if (!isHrStaff) {
    return navigateTo("/");
  }
});
