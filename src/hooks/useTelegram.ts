import { useContext } from 'react';
import { TelegramContext } from '../components/TelegramProvider';

export const useTelegram = () => {
  const { tg } = useContext(TelegramContext);

  const onClose = () => {
    if (tg) {
      tg.close();
    }
  };

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    onClose,
    isSupported: Boolean(tg),
  };
}; 