export const categoryColors = {
  spiritual: '#10B981', // Emerald
  family: '#3B82F6',   // Blue
  personal: '#F59E0B',  // Amber
  health: '#06B6D4',   // Cyan
  education: '#8B5CF6', // Violet
  financial: '#F97316', // Orange
  relationship: '#EC4899', // Pink
} as const;

export const categoryLabels = {
  spiritual: 'Spiritual',
  family: 'Family',
  personal: 'Personal',
  health: 'Health',
  education: 'Education',
  financial: 'Financial',
  relationship: 'Relationship',
} as const;

export const statusColors = {
  active: '#10B981',   // Emerald
  completed: '#059669', // Dark Emerald
  paused: '#F59E0B',   // Amber
  cancelled: '#EF4444', // Red
} as const;

export const statusLabels = {
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
  cancelled: 'Cancelled',
} as const;
