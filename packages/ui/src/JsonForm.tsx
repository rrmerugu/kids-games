import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, ObjectField, type FieldConfig } from '@invana/forms';

export interface JsonFormProps {
  /** Field schema — pure JSON, drives the rendered inputs. */
  fields: FieldConfig[];
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  columns?: number;
}

/**
 * A JSON-schema-driven form: hands `fields` to `@invana/forms`' `ObjectField`
 * and reports every change back through `onChange`. The form value lives under a
 * single `form` key so `ObjectField` can edit it as one object.
 *
 * `@invana/forms`' `FormItem`/`FormLabel`/`FormControl` read the react-hook-form
 * context via `useFormContext`, so the whole thing must be wrapped in `<Form>`
 * (the `FormProvider`), not just handed a `control` prop.
 */
export function JsonForm({ fields, value, onChange, columns = 1 }: JsonFormProps): React.JSX.Element {
  const methods = useForm<{ form: Record<string, unknown> }>({ defaultValues: { form: value } });
  const { control, watch } = methods;

  useEffect(() => {
    const sub = watch((v) => {
      if (v.form) onChange(v.form as Record<string, unknown>);
    });
    return () => sub.unsubscribe();
  }, [watch, onChange]);

  return (
    <Form {...methods}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ObjectField control={control as any} name="form" fields={fields} columns={columns} size="md" />
    </Form>
  );
}
