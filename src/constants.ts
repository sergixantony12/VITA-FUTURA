import { CareerPath, Milestone, LifeEvent, ChildEvent } from './types';

export const CAREERS = [
  { path: CareerPath.TECH, title: 'Ingegnere Software', salary: 150, description: 'Costruisci il futuro digitale.', icon: 'Cpu' },
  { path: CareerPath.ARTIST, title: 'Designer d\'Interni', salary: 100, description: 'Rendi ogni spazio un\'opera d\'arte.', icon: 'Palette' },
  { path: CareerPath.HEALTHCARE, title: 'Medico', salary: 180, description: 'Prenditi cura di chi ne ha bisogno.', icon: 'Stethoscope' },
  { path: CareerPath.EDUCATION, title: 'Insegnante', salary: 90, description: 'Modella le menti del domani.', icon: 'GraduationCap' },
  { path: CareerPath.ENTREPRENEUR, title: 'Fondatore Startup', salary: 200, description: 'Crea il tuo impero.', icon: 'Rocket' },
];

export const MILESTONES: Omit<Milestone, 'unlocked'>[] = [
  { id: 'first_home', title: 'La Nostra Prima Casa', description: 'Un nido tutto nostro dove costruire ricordi.', cost: 50000, category: 'HOME' },
  { id: 'trip_japan', title: 'Viaggio in Giappone', description: 'Scoprire insieme l\'Oriente.', cost: 8000, category: 'TRAVEL' },
  { id: 'dream_wedding', title: 'Il Matrimonio dei Sogni', description: 'Una festa indimenticabile con tutti i cari.', cost: 25000, category: 'LIFE' },
  { id: 'villa_sea', title: 'Villa al Mare', description: 'Il meritato riposo vista oceano.', cost: 200000, category: 'HOME' },
  { id: 'safari_africa', title: 'Safari in Africa', description: 'A contatto con la natura selvaggia.', cost: 12000, category: 'TRAVEL' },
];

export const CHILD_EVENTS: Omit<ChildEvent, 'childName'>[] = [
  { id: 'first_steps', title: 'Primi Passi', description: 'Hai assistito ai primi passi! Un momento indimenticabile.', wealthImpact: 0, happinessImpact: 30, bondImpact: 20, developmentImpact: 15, type: 'PERSONAL' },
  { id: 'school_play', title: 'Recita Scolastica', description: 'La recita è stata un successo. Sei così orgoglioso!', wealthImpact: -50, happinessImpact: 15, bondImpact: 10, developmentImpact: 10, type: 'PERSONAL' },
  { id: 'math_award', title: 'Premio in Matematica', description: 'Un talento naturale per i numeri sta emergendo.', wealthImpact: 0, happinessImpact: 10, bondImpact: 5, developmentImpact: 20, type: 'PERSONAL' },
  { id: 'rebellion', title: 'Fase di Ribellione', description: 'Le prime discussioni... fa parte della crescita.', wealthImpact: 0, happinessImpact: -10, bondImpact: -15, developmentImpact: 5, type: 'PERSONAL' },
  { id: 'vacation_fun', title: 'Divertimento al Parco', description: 'Una giornata intera passata a giocare insieme.', wealthImpact: -30, happinessImpact: 10, bondImpact: 15, developmentImpact: 5, type: 'PERSONAL' },
];

export const DOG_BREEDS = [
  'Golden Retriever',
  'Pastore Tedesco',
  'Bulldog Francese',
  'Labrador',
  'Cocker Spaniel',
  'Border Collie'
];

export const RANDOM_EVENTS: LifeEvent[] = [
  { id: 'bonus', title: 'Bonus Inaspettato', description: 'Il tuo duro lavoro è stato notato! Hai ricevuto un bonus.', wealthImpact: 2000, happinessImpact: 10, bondImpact: 0, type: 'FINANCIAL' },
  { id: 'repair', title: 'Riparazione Caldaia', description: 'La caldaia si è rotta... un costo imprevisto.', wealthImpact: -800, happinessImpact: -5, bondImpact: 0, type: 'FINANCIAL' },
  { id: 'date_fail', title: 'Appuntamento Disastroso', description: 'La cena non è andata come previsto.', wealthImpact: -100, happinessImpact: -10, bondImpact: -15, type: 'PERSONAL' },
  { id: 'promotion', title: 'Promozione!', description: 'Hai scalato un gradino della carriera.', wealthImpact: 500, happinessImpact: 20, bondImpact: 0, type: 'CAREER' },
  { id: 'gift', title: 'Un Regalo Speciale', description: 'Hai fatto un regalo perfetto al tuo partner.', wealthImpact: -300, happinessImpact: 10, bondImpact: 20, type: 'PERSONAL' },
];

export const DAILY_TASKS = [
  { title: 'Passeggiata con i cani', type: 'PERSONAL', description: 'Un po\' d\'aria fresca al parco.' },
  { title: 'Cena romantica', type: 'FAMILY', description: 'Tempo di qualità con la tua dolce metà.' },
  { title: 'Riunione importante', type: 'WORK', description: 'Concentrazione massima.' },
  { title: 'Shopping per la casa', type: 'PERSONAL', description: 'Nuovi mobili o spesa settimanale?' },
  { title: 'Gioco con i figli', type: 'FAMILY', description: 'Risate e divertimento in salotto.' },
];
