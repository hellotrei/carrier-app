import React from 'react';

import { AppButton } from '../../../ui/primitives/app-button';
import { SectionCard } from '../../../ui/patterns/section-card';

type HomeCustomerScreenProps = {
  onCreateDraft: () => void;
};

export function HomeCustomerScreen({
  onCreateDraft,
}: HomeCustomerScreenProps): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="Feature"
      title="Customer home scaffold"
      description="This slice is ready for discovery, booking draft, and empty-state work without leaking storage or relay concerns into the screen."
    >
      <AppButton label="Create sample draft" onPress={onCreateDraft} />
    </SectionCard>
  );
}
