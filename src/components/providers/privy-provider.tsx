'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

export default function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
  return (
    <PrivyProvider
      appId="cmc71t0f000hml20m5223w04l"
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'dark',
          accentColor: '#6366F1',
          logo: 'https://www.stream.quest/assets/logo-D1a0BalI.png',
          walletList: ['detected_solana_wallets'],
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
