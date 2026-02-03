export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  chats: '/chats',
  profile: (username: string) => `/profile/${username}`,
} as const;

export type RouteKey = keyof typeof routes;