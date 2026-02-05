export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  chat: (chatId: string) => `/chat/${chatId}`,
  profile: (username: string) => `/profile/${username}`,
} as const;

export type RouteKey = keyof typeof routes;