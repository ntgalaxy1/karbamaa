import React from 'react';
import { SepalGatewayModal } from './SepalGatewayModal';

interface ZarinPalGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountToman: number;
  description: string;
  onSuccess?: (refId: string) => void;
}

/**
 * Redirects any legacy gateway call directly to the official Sepal Gateway (payment.sepal.ir)
 */
export const ZarinPalGatewayModal: React.FC<ZarinPalGatewayModalProps> = (props) => {
  return <SepalGatewayModal {...props} />;
};
