export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  chats: '/chat',
  profile: (username: string) => `/profile/${username}`,
} as const;

export type RouteKey = keyof typeof routes;