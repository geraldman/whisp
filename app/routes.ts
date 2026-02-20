import { searchUserByNumericId } from "./actions/searchUser";
import chats from "./chat/page";

export const routes = {
  home: '/',
  auth: '/auth',
  login: '/auth',
  register: '/auth',
  logout: 'logout',
  forgotPassword: '/forgot-password',
  chats: '/chat',
 search: '/chat/search',
  chat: (chatId: string) => `/chat/${chatId}`,
  profile: (username: string) => `/profile/${username}`,
} as const;

export type RouteKey = keyof typeof routes;