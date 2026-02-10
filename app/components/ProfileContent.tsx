'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from './Input';

type AlertType = 'success' | 'error' | null;

export default function ProfileContent() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    bio: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: AlertType;
    message: string;
  } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (loading) return;

    setAlert(null);

    if (!form.username.trim()) {
      setAlert({ type: 'error', message: 'Username and email are required' });
      return;
    }

    if (!form.email.trim()) {
      setAlert({ type: 'error', message: 'Username and email are required' });
      return;
    }

    setLoading(true);

    try {
      // simulate API call
      await new Promise((res) => setTimeout(res, 1000));

      setAlert({
        type: 'success',
        message: 'Profile updated successfully',
      });
    } catch {
      setAlert({
        type: 'error',
        message: 'Failed to save changes',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F6F1E3] px-8 py-10">
      <div className="max-w-xl mx-auto">

        {/* AVATAR */}
        <div className="relative flex justify-center z-10">
          <div className="w-28 h-28 rounded-full bg-white border border-[#74512D]/25 flex items-center justify-center shadow-sm">
            <span className="text-4xl font-semibold text-[#543310]">G</span>
          </div>
        </div>

        {/* CARD */}
        <div className="relative mt-[-40px] pt-16 px-8 pb-8 rounded-3xl bg-[#EFE6D8] shadow-[0_14px_32px_rgba(0,0,0,0.1)]">

          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-12 bg-[#F6F1E3] rounded-b-full" />

          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-[#543310]">
              Gerald Manurung
            </h2>
            <p className="text-sm text-[#74512D]/70">
              ID · 567890
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Username"
              name="username"
              placeholder="Whisp_user"
              value={form.username}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              placeholder="whisp@example.com"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Bio"
              name="bio"
              placeholder="Short bio about yourself"
              value={form.bio}
              onChange={handleChange}
            />
            <Input
              label="Description"
              name="description"
              placeholder="Tell something more..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* ALERT */}
          <AnimatePresence>
            {alert && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 text-sm text-center ${
                  alert.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {alert.message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* ACTION */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 rounded-full
                         bg-[#74512D] text-white
                         text-sm font-medium
                         hover:bg-[#5f3f22]
                         transition shadow-sm
                         disabled:opacity-60
                         disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
