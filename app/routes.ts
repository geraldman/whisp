import { searchUserByNumericId } from "./actions/searchUser";
import chats from "./chat/page";

export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  logout: 'logout',
  chats: '/chat',
 search: '/chat/search',
  chat: (chatId: string) => `/chat/${chatId}`,
  profile: (username: string) => `/profile/${username}`,
} as const;

export type RouteKey = keyof typeof routes;