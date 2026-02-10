'use client';

import type { SettingsView } from '@/app/chat/layout';
import ProfileContent from './ProfileContent';
import RequestsContent from './RequestContent';
import AboutContent from './AboutContent';

export default function SettingsContent({ view }: { view: SettingsView }) {
  if (view === 'profile') return <ProfileContent />;
  if (view === 'requests') return <RequestsContent />;
  return <AboutContent />;
}
