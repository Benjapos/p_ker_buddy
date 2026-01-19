export const downloadCSV = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatDecisionToCSV = (decision: any) => {
  return `${new Date().toISOString()},${decision.handId || ''},${decision.phase},${decision.playerId},${decision.action},${decision.amount || 0},${decision.isCorrect},${decision.recommendedAction || ''}\n`;
};

