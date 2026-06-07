export default defineNuxtRouteMiddleware(() => {
  const { isSupervisor, isLoggedIn } = useAuth();
  if (!isLoggedIn.value) return navigateTo("/login");
  if (!isSupervisor.value) return navigateTo("/");
});
