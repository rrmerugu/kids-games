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
  {
    name: 'theme',
    type: 'select',
    label: 'Theme 🌗',
    options: [
      { label: 'System', value: 'system' },
      { label: 'Light', value: 'light' },
      { label: 'Dark', value: 'dark' },
    ],
  },
  {
    name: 'buddyPosition',
    type: 'select',
    label: 'Buddy 🐻',
    options: [
      { label: 'Right side', value: 'right' },
      { label: 'Left side', value: 'left' },
      { label: 'Hidden', value: 'off' },
    ],
  },
];
