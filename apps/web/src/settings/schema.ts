import type { FieldConfig } from '@invana/forms';

/** JSON schema driving the settings form via `@invana/forms` `ObjectField`. */
export const SETTINGS_FIELDS: FieldConfig[] = [
  { name: 'sound', type: 'boolean', label: 'Sound 🔊' },
  { name: 'reducedMotion', type: 'boolean', label: 'Less motion 🐢' },
  {
    name: 'palette',
    type: 'select',
    label: 'Colours 🎨',
    options: [
      { label: 'Classic', value: 'classic' },
      { label: 'High contrast', value: 'colorblind' },
    ],
  },
];
