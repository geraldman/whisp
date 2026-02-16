"use client";

import { useState } from "react";

export function AuthLoading() {
  const [loading, setLoading] = useState(false);

  const start = () => setLoading(true);
  const stop = () => setLoading(false);

  return { loading, start, stop };
}
