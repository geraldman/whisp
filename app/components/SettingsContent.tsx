'use client';

import type { SettingsView } from '@/app/chat/layout';
import ProfileContent from './ProfileContent';
import RequestsContent from './RequestContent';
import AboutContent from './AboutContent';

export default function SettingsContent({ 
  view, 
  onBack 
}: { 
  view: SettingsView;
  onBack: () => void;
}) {
  if (view === 'profile') return <ProfileContent onBack={onBack} />;
  if (view === 'requests') return <RequestsContent onBack={onBack} />;
  return <AboutContent onBack={onBack} />;
}
