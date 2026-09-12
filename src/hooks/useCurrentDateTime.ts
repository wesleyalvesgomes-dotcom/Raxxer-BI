import { useState, useEffect } from 'react';
import {
  getGreetingByTime,
  getFullGreeting,
  formatRaxxerDate,
  formatRaxxerTime,
} from '../utils/dateUtils';

/**
 * Hook reutilizável que mantém a data, o relógio e a saudação atualizados em tempo real.
 * Utiliza o relógio local do navegador (`new Date()`) e limpa o timer ao desmontar.
 * 
 * Atualiza automaticamente a cada segundo para garantir que:
 * - O relógio digital continue preciso;
 * - A virada de período (ex: 11:59 -> 12:00, 17:59 -> 18:00, 04:59 -> 05:00)
 *   recalcule a saudação imediatamente sem precisar recarregar a página.
 */
export function useCurrentDateTime(userName: string = 'Wesley') {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    // Atualiza o estado a cada segundo com o horário do navegador
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const greeting = getGreetingByTime(currentDate);
  const fullGreeting = getFullGreeting(userName, currentDate);
  const { fullDate, weekday, dateDetail } = formatRaxxerDate(currentDate);
  const timeStr = formatRaxxerTime(currentDate);

  return {
    currentDate,
    greeting,
    fullGreeting,
    timeStr,
    fullDate,
    weekday,
    dateDetail,
  };
}
