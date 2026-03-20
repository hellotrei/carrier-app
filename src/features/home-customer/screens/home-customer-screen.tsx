import React from 'react';

import { SectionCard } from '../../../ui/patterns/section-card';

export function HomeCustomerScreen(): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="Feature"
      title="Customer home scaffold"
      description="This slice is ready for discovery, booking draft, and empty-state work without leaking storage or relay concerns into the screen."
    />
  );
}
