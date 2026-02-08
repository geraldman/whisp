export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  chats: '/chats',
  profile: (username: string) => `/profile/${username}`,
} as const;

export type RouteKey = keyof typeof routes;