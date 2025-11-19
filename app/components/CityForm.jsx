import { useState } from 'react';
import {
  Card,
  FormLayout,
  TextField,
  Button,
  InlineStack,
  BlockStack
} from '@shopify/polaris';

export function CityForm({ city, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: city?.name || '',
    workdays: city?.workdays || 'lun,mar,mie,jue,vie',
    cutoff: city?.cutoff || '20:00'
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

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la ciudad es obligatorio';
    }

    if (!formData.workdays.trim()) {
      newErrors.workdays = 'Los días hábiles son obligatorios';
    }

    if (!formData.cutoff.match(/^\d{2}:\d{2}$/)) {
      newErrors.cutoff = 'Formato de hora inválido (HH:MM)';
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
            label="Nombre de la ciudad"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            autoComplete="off"
            helpText="Ej: Caracas, Chacao, etc."
          />

          <TextField
            label="Días hábiles"
            value={formData.workdays}
            onChange={handleChange('workdays')}
            error={errors.workdays}
            autoComplete="off"
            helpText="Formato: lun,mar,mie,jue,vie,sab,dom"
          />

          <TextField
            label="Hora de corte"
            value={formData.cutoff}
            onChange={handleChange('cutoff')}
            error={errors.cutoff}
            autoComplete="off"
            helpText="Formato 24h: 20:00"
            type="time"
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