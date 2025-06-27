export interface Athlete {
  id: number;
  name: string;
  position: string;
  team: string;
  level: 'Junior' | 'Senior';
  age: number;
  height: number;
  weight: number;
  email: string;
  attendance: number;
  photoUrl: string;
  matchesPlayed: number;
  points: number;
  blocks: number;
  serves: number;
  medicalDocumentUrl?: string;  
  contractDocumentUrl?: string;
  weeklyAttendance?: { label: string; attended: number; total: number }[]; 
}
