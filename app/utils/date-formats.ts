// Fonctions d'utilitaires pour le formatage des dates

/**
 * Formate une date en format lisible
 */
export const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) return 'N/A';
    
    // Formatter en format local: jour mois, année
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  /**
   * Formate l'heure au format hh:mm
   */
  export const formatTime = (dateString?: string | Date): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) return 'N/A';
    
    // Formatter en format hh:mm
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Formate une plage de dates (pour les annonces)
   */
  export function formatDateRange(isoDate: string | undefined): string {
    if (!isoDate) return 'Date non spécifiée';
    
    try {
      const date = new Date(isoDate);
      
      // Si la date n'est pas valide
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      // Formater la date de début
      const startDay = date.getDate();
      const startMonth = date.toLocaleString('fr-FR', { month: 'long' });
      
      // Calculer la date de fin (par défaut, 14 jours après)
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 14);
      
      const endDay = endDate.getDate();
      const endMonth = endDate.toLocaleString('fr-FR', { month: 'long' });
      
      // Si les mois sont différents
      if (startMonth !== endMonth) {
        return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
      }
      
      // Si les mois sont identiques
      return `${startDay} - ${endDay} ${startMonth}`;
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return 'Date invalide';
    }
  }
  
  const getMonthName = (date: Date): string => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[date.getMonth()];
  };