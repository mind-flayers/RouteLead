// Countdown calculation utility
export const calculateCountdown = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Ended';
  }
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};

// Status formatting utility
export const formatRouteStatus = (status: string): { label: string; color: string; bgColor: string } => {
  switch (status.toUpperCase()) {
    case 'OPEN':
    case 'INITIATED':
      return { label: 'Active', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    case 'BOOKED':
      return { label: 'Booked', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    case 'COMPLETED':
      return { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' };
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100' };
    default:
      return { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
};

// Check if bidding is still active
export const isBiddingActive = (biddingEndTime: string): boolean => {
  const now = new Date();
  const end = new Date(biddingEndTime);
  return end.getTime() > now.getTime();
};
