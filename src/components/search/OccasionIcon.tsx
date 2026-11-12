import { Briefcase, Cake, Gem, GraduationCap, Guitar, HeartHandshake, PartyPopper } from 'lucide-react';
import type { OccasionId } from '../../types';

export const OCCASION_ICONS: Record<OccasionId, typeof Cake> = {
  cumpleanos: Cake,
  boda: Gem,
  aniversario: HeartHandshake,
  corporativo: Briefcase,
  serenata: Guitar,
  fiesta: PartyPopper,
  graduacion: GraduationCap,
};
