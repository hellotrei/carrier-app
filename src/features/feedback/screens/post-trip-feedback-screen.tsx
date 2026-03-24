import React from 'react';

import type { Order } from '../../../domain/order/order';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppInput } from '../../../ui/primitives/app-input';
import { AppText } from '../../../ui/primitives/app-text';

type PostTripFeedbackScreenProps = {
  onSkip: () => void;
  onSubmit: (params: { manualRating?: number; reviewText?: string }) => Promise<void>;
  order: Order;
};

export function PostTripFeedbackScreen({
  onSkip,
  onSubmit,
  order,
}: PostTripFeedbackScreenProps): React.JSX.Element {
  const [manualRating, setManualRating] = React.useState(
    order.feedbackSource === 'manual' && order.finalRating
      ? String(order.finalRating)
      : '',
  );
  const [reviewText, setReviewText] = React.useState(order.reviewText ?? '');

  return (
    <SectionCard
      eyebrow="Post-Trip Feedback"
      title="How did the trip feel?"
      description="Default rating stays at 5 if you skip this step."
    >
      <AppText tone="muted">Completed trip: {order.destination.label ?? order.orderId}</AppText>
      <AppText tone="muted">
        Current saved rating: {order.finalRating ?? 5} ({order.feedbackSource ?? 'default_auto'})
      </AppText>
      <AppInput
        keyboardType="numeric"
        label="Rating (1-5)"
        onChangeText={setManualRating}
        placeholder="5"
        value={manualRating}
      />
      <AppInput
        label="Review (optional)"
        onChangeText={setReviewText}
        placeholder="Short trip note"
        value={reviewText}
      />
      <AppButton
        label="Save feedback"
        onPress={() =>
          void onSubmit({
            manualRating: manualRating.trim() ? Number(manualRating) : undefined,
            reviewText,
          })
        }
      />
      <AppButton label="Keep saved feedback" kind="secondary" onPress={onSkip} />
    </SectionCard>
  );
}
