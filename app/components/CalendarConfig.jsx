import { useState } from 'react';
import {
  Card,
  FormLayout,
  Select,
  TextField,
  Button,
  BlockStack,
  Text,
  Banner
} from '@shopify/polaris';

export function CalendarConfig({ config, onSave }) {
  const [formData, setFormData] = useState({
    cutoff_mode: config?.cutoff_mode || 'same_day',
    cutoff_time: config?.cutoff_time || '20:00',
    lead_min: config?.lead_min || 0,
    lead_max: config?.lead_max || 30
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.cutoff_time.match(/^\d{2}:\d{2}$/)) {
      newErrors.cutoff_time = 'Formato de hora inválido (HH:MM)';
    }

    const leadMin = parseInt(formData.lead_min);
    const leadMax = parseInt(formData.lead_max);

    if (leadMin < 0) {
      newErrors.lead_min = 'Debe ser mayor o igual a 0';
    }

    if (leadMax < leadMin) {
      newErrors.lead_max = 'Debe ser mayor que el mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSaving(true);
      await onSave(formData);
      setIsSaving(false);
    }
  };

  const cutoffModeOptions = [
    { label: 'Corte mismo día', value: 'same_day' },
    { label: 'Corte día futuro', value: 'next_day' }
  ];

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Configuración del Calendario
        </Text>

        <Banner>
          <Text as="p">
            <strong>Modo "Corte mismo día":</strong> El cliente puede comprar para HOY si no ha pasado la hora de corte.
          </Text>
          <Text as="p">
            <strong>Modo "Corte día futuro":</strong> El día actual siempre está excluido. Primera fecha disponible es el siguiente día hábil.
          </Text>
        </Banner>

        <FormLayout>
          <Select
            label="Modo de hora de corte"
            options={cutoffModeOptions}
            value={formData.cutoff_mode}
            onChange={handleChange('cutoff_mode')}
          />

          <TextField
            label="Hora de corte global"
            value={formData.cutoff_time}
            onChange={handleChange('cutoff_time')}
            error={errors.cutoff_time}
            type="time"
            autoComplete="off"
            helpText="Formato 24h. Las ciudades pueden tener su propia hora de corte."
          />

          <TextField
            label="Días mínimos de anticipación"
            value={formData.lead_min.toString()}
            onChange={handleChange('lead_min')}
            error={errors.lead_min}
            type="number"
            autoComplete="off"
            helpText="0 = pueden comprar para hoy (según modo de corte)"
          />

          <TextField
            label="Días máximos disponibles"
            value={formData.lead_max.toString()}
            onChange={handleChange('lead_max')}
            error={errors.lead_max}
            type="number"
            autoComplete="off"
            helpText="Máximo de días hacia adelante que se mostrarán en el calendario"
          />
        </FormLayout>

        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isSaving}
        >
          Guardar configuración
        </Button>
      </BlockStack>
    </Card>
  );
}