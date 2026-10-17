import { useEffect, useState } from 'react';

import type { OrangeBalance } from '../../features/rewards/domain/types';
import type { OrangeWalletError } from '../../features/rewards/application/OrangeWallet';
import { orangeWalletService } from './orangeWallet';

type WalletView =
  | { status: 'loading'; balance: null }
  | { status: 'ready'; balance: OrangeBalance }
  | { status: 'error'; balance: null; error: OrangeWalletError };

export function useOrangeWallet(): WalletView {
  const [view, setView] = useState<WalletView>({ status: 'loading', balance: null });
  useEffect(() => {
    let mounted = true;
    const unsubscribe = orangeWalletService.subscribe(wallet => {
      if (mounted) setView({ status: 'ready', balance: wallet.balance });
    });
    void orangeWalletService.loadWallet().then(result => {
      if (mounted && !result.ok) setView({ status: 'error', balance: null, error: result.error });
    });
    return () => { mounted = false; unsubscribe(); };
  }, []);
  return view;
}
