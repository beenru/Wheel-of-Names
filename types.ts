
export interface WheelConfig {
  duration: number; // Duration is approximate based on physics
  spinSpeed: number; // Initial velocity
}

export interface AppState {
  names: string[];
  winner: string | null;
  isSpinning: boolean;
  removeWinner: boolean;
}

export interface Winner {
  id: string;
  name: string;
  category: string;
  office?: string;
  timestamp: number;
}

// Global declaration for the CDN-loaded canvas-confetti
declare global {
  interface Window {
    confetti: any;
  }
}
