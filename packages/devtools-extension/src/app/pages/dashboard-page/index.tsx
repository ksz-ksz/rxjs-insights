import React from 'react';
import { createUrl, RouterLink } from '@lib/store-router';
import { router } from '@app/store/router';

export function DashboardPage() {
  return (
    <div>
      <span>Dashboard Page!</span>

      <RouterLink router={router} to={createUrl(['status'])}>
        Status page
      </RouterLink>

      <RouterLink router={router} to={createUrl(['observable', '14'])}>
        Observable 14
      </RouterLink>
    </div>
  );
}
