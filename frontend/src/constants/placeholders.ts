export const PROPERTY_PLACEHOLDERS: Record<string, string> = {
  Apartment:  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  House:      '/house-placeholder.jpg',
  Villa:      '/house-placeholder.jpg',
  Land:       '/land-placeholder.jpg',
  Shop:       'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
  Commercial: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
}

export function getPropertyPlaceholder(propertyType?: string | null): string {
  if (!propertyType) return PROPERTY_PLACEHOLDERS.Apartment
  return PROPERTY_PLACEHOLDERS[propertyType] || PROPERTY_PLACEHOLDERS.Apartment
}
