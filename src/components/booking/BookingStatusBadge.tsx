import type { BookingStatus } from '../../types';
import { STATUS_LABEL, STATUS_TONE } from '../../services/bookingService';
import { Badge } from '../ui/Primitives';

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
