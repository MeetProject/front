import { PropsWithChildren } from 'react';

import DeviceProvider from './DeviceProvider';

export default function Provider({ children }: PropsWithChildren) {
  return <DeviceProvider>{children}</DeviceProvider>;
}
