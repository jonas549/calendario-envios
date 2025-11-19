import { useState } from 'react';
import {
  Card,
  FormLayout,
  TextField,
  Button,
  InlineStack,
  BlockStack
} from '@shopify/polaris';

export function HolidayForm({ holiday, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    date: holiday?.date || '',
    reason: holiday?.reason || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    // Validar formato YYYY-MM-DD
    if (formData.date && !formData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      newErrors.date = 'Formato de fecha inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Card>
      <BlockStack gap="400">
        <FormLayout>
          <TextField
            label="Fecha"
            value={formData.date}
            onChange={handleChange('date')}
            error={errors.date}
            type="date"
            autoComplete="off"
            helpText="Selecciona el día feriado"
          />

          <TextField
            label="Motivo (opcional)"
            value={formData.reason}
            onChange={handleChange('reason')}
            autoComplete="off"
            helpText="Ej: Navidad, Año Nuevo, Día de la Independencia"
            placeholder="Descripción del feriado"
          />
        </FormLayout>

        <InlineStack gap="300">
          <Button variant="primary" onClick={handleSubmit}>
            Guardar
          </Button>
          <Button onClick={onCancel}>
            Cancelar
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}