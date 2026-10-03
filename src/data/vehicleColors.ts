export type VehicleColor = {
  id: string;
  label: string;
  hex: string;
};

/** Named vehicle colors/shades for Color Catch (24 unique cells + free center). */
export const vehicleColors: VehicleColor[] = [
  { id: 'white', label: 'White', hex: '#F4F1EA' },
  { id: 'black', label: 'Black', hex: '#1C1C1C' },
  { id: 'silver', label: 'Silver', hex: '#C5CCD3' },
  { id: 'gray', label: 'Gray', hex: '#7A7F86' },
  { id: 'charcoal', label: 'Charcoal', hex: '#3E444C' },
  { id: 'red', label: 'Red', hex: '#C62828' },
  { id: 'maroon', label: 'Maroon', hex: '#7B1E3A' },
  { id: 'orange', label: 'Orange', hex: '#EF6C00' },
  { id: 'gold', label: 'Gold', hex: '#C9A227' },
  { id: 'yellow', label: 'Yellow', hex: '#F5C518' },
  { id: 'lime', label: 'Lime', hex: '#7CB342' },
  { id: 'green', label: 'Green', hex: '#2E7D32' },
  { id: 'forest', label: 'Forest', hex: '#1B4332' },
  { id: 'teal', label: 'Teal', hex: '#00897B' },
  { id: 'turquoise', label: 'Turquoise', hex: '#26A69A' },
  { id: 'sky', label: 'Sky', hex: '#4FC3F7' },
  { id: 'blue', label: 'Blue', hex: '#1565C0' },
  { id: 'navy', label: 'Navy', hex: '#1A237E' },
  { id: 'purple', label: 'Purple', hex: '#6A1B9A' },
  { id: 'pink', label: 'Pink', hex: '#EC407A' },
  { id: 'brown', label: 'Brown', hex: '#6D4C41' },
  { id: 'tan', label: 'Tan', hex: '#D2B48C' },
  { id: 'beige', label: 'Beige', hex: '#E6D5B8' },
  { id: 'cream', label: 'Cream', hex: '#FFF3C4' },
];

export const vehicleColorById = Object.fromEntries(
  vehicleColors.map((color) => [color.id, color]),
) as Record<string, VehicleColor>;
