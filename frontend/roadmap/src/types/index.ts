export interface SimulationInput {
  currentRole: string;
  targetRole: string;
  skills: string[];
  dailyStudyHours: number;
  targetSalary: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'CERTIFICATION' | 'LEARNING' | 'APPLICATION' | 'PROJECT';
}

export interface Pathway {
  id: string;
  company: string;
  role: string;
  difficulty: 'MEDIUM' | 'HIGH';
  confidence: number;
  dataSource: string;
  salary: string;
  timeline: string;
  growth: string;
  description: string;
  roadmap: RoadmapStep[];
  activeListings: number;
  demandLevel: string;
  jobUrl?: string;
  category?: 'Top Tier (FAANG)' | 'Product Companies' | 'High Growth Startups';
}

export interface SimulationResult {
  input: SimulationInput;
  pathsAnalyzed: number;
  marketDemand: string;
  topSkillGap: string;
  dataSources: string[];
  pathways: Pathway[];
  alerts: string[];
}

export interface FilterOptions {
  type: string;
  sort: string;
}
