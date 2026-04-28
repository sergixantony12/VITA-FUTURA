export enum CareerPath {
  UNEMPLOYED = 'Disoccupato',
  CRAFTSMAN = 'Artigiano',
  ARTIST = 'Artista',
  TECH = 'Tecnologia',
  HEALTHCARE = 'Sanità',
  EDUCATION = 'Istruzione',
  ENTREPRENEUR = 'Imprenditore',
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  cost: number;
  unlocked: boolean;
  category: 'HOME' | 'TRAVEL' | 'LIFE';
}

export interface Friend {
  id: string;
  name: string;
  closeness: number; // 0-100
}

export interface Partner {
  name: string;
  traits: string[];
  bond: number; // 0-100
}

export interface Child {
  name: string;
  age: number;
  bond: number;
  development: number; // 0-100
  mood: 'Felice' | 'Triste' | 'Curioso' | 'Ribelle';
}

export interface ChildEvent extends LifeEvent {
  childName?: string;
  developmentImpact: number;
}

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  wealthImpact: number;
  happinessImpact: number;
  bondImpact: number;
  type: 'CAREER' | 'FINANCIAL' | 'PERSONAL';
}

export interface GameTask {
  id: string;
  title: string;
  description: string;
  type: 'WORK' | 'FAMILY' | 'PERSONAL';
  completed: boolean;
  deadline: number; // game day countdown
}

export interface GameState {
  gameDay: number;
  totalDays: number;
  playerName: string;
  partner: Partner | null;
  pets: Pet[];
  children: Child[];
  friends: Friend[];
  milestones: Milestone[];
  career: CareerPath;
  wealth: number;
  happiness: number;
  isPaused: boolean;
  tasks: GameTask[];
  history: string[];
}
