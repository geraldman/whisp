export async function performLogout(router: any) {
  try {
    await fetch('/api/logout', { method: 'POST' });
  } finally {
    router.replace('/logout');
  }
}