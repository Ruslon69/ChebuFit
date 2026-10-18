import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { View } from 'react-native';
import type { OrangeRewardNotice } from '../../features/rewards';
import { OrangeRewardFeedback } from '../../features/rewards/ui/OrangeRewardFeedback';

const FeedbackContext = createContext<{ show: (notice: OrangeRewardNotice | null) => void } | null>(null);
/** A single non-blocking presentation surface survives navigation. This is not a reward queue. */
export function RewardFeedbackProvider({ children }: PropsWithChildren) {
  const [notice, setNotice] = useState<OrangeRewardNotice | null>(null);
  const show = useCallback((next: OrangeRewardNotice | null) => { if (next) setNotice(next); }, []);
  const dismiss = useCallback((id: string) => setNotice(current => current?.id === id ? null : current), []);
  const value = useMemo(() => ({ show }), [show]);
  return (
    <FeedbackContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <OrangeRewardFeedback notice={notice} onDismiss={dismiss} />
      </View>
    </FeedbackContext.Provider>
  );
}
export function useRewardFeedback() {
  const feedback = useContext(FeedbackContext);
  if (!feedback) throw Error('Reward feedback requires application provider');
  return feedback;
}
