/**
 * Utilitários para tratamento de datas, horários e saudações dinâmicas no RAXXER.
 * Todos os cálculos utilizam o horário local do navegador do usuário (new Date()).
 */

/**
 * Retorna a saudação dinâmica baseada na hora atual local do usuário.
 * 
 * Regras:
 * - Das 05:00 até 11:59: "Bom dia"
 * - Das 12:00 até 17:59: "Boa tarde"
 * - Das 18:00 até 04:59: "Boa noite"
 * 
 * Exemplos:
 * - 05:30 -> "Bom dia"
 * - 08:00 -> "Bom dia"
 * - 11:59 -> "Bom dia"
 * - 12:00 -> "Boa tarde"
 * - 14:00 -> "Boa tarde"
 * - 17:59 -> "Boa tarde"
 * - 18:00 -> "Boa noite"
 * - 23:00 -> "Boa noite"
 * - 03:00 -> "Boa noite"
 */
export function getGreetingByTime(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  }
  if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  }
  return 'Boa noite';
}

/**
 * Retorna a saudação completa com o nome do usuário.
 * Exemplo: "Boa tarde, Wesley!"
 */
export function getFullGreeting(userName: string = 'Wesley', date: Date = new Date()): string {
  const greeting = getGreetingByTime(date);
  const name = userName?.trim() || 'Wesley';
  return `${greeting}, ${name}!`;
}

/**
 * Formata a data atual no padrão visual do RAXXER.
 * Exemplo: "Sábado, 12 de setembro de 2026"
 */
export function formatRaxxerDate(date: Date = new Date()): {
  fullDate: string;
  weekday: string;
  dateDetail: string;
} {
  const rawWeekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  const weekday = rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1);

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('pt-BR', { month: 'long' });
  const year = date.getFullYear();

  const dateDetail = `${day} de ${month} de ${year}`;
  const fullDate = `${weekday}, ${dateDetail}`;

  return {
    fullDate,
    weekday,
    dateDetail,
  };
}

/**
 * Formata o relógio digital no formato 24h "HH:mm".
 * Exemplo: "18:24"
 */
export function formatRaxxerTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
