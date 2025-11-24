import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Modal,
  TextField,
  Checkbox,
  Text,
  BlockStack,
  ButtonGroup,
} from "@shopify/polaris";

import { useState } from "react";
import { useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const cities = await prisma.city.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  return { cities };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "create") {
    await prisma.city.create({
      data: {
        shop,
        name: formData.get("name"),
        cutoffTime: formData.get("cutoffTime"),
        days: formData.get("days"),
        active: formData.get("active") === "true",
      },
    });
  }

  if (action === "update") {
    await prisma.city.update({
      where: { 
        id: formData.get("id"),
      },
      data: {
        name: formData.get("name"),
        cutoffTime: formData.get("cutoffTime"),
        days: formData.get("days"),
        active: formData.get("active") === "true",
      },
    });
  }

  if (action === "delete") {
    await prisma.city.delete({
      where: { 
        id: formData.get("id"),
      },
    });
  }

  return { success: true };
};

export default function Ciudades() {
  const { cities } = useLoaderData();
  const submit = useSubmit();
  
  const [modalActive, setModalActive] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [name, setName] = useState("");
  const [cutoffTime, setCutoffTime] = useState("14:00");
  const [days, setDays] = useState({
    lun: true, mar: true, mie: true, jue: true, vie: true, sab: false, dom: false
  });
  const [active, setActive] = useState(true);

  const openCreateModal = () => {
    setEditingCity(null);
    setName("");
    setCutoffTime("14:00");
    setDays({ lun: true, mar: true, mie: true, jue: true, vie: true, sab: false, dom: false });
    setActive(true);
    setModalActive(true);
  };

  const openEditModal = (city) => {
    setEditingCity(city);
    setName(city.name);
    setCutoffTime(city.cutoffTime);
    setDays(JSON.parse(city.days));
    setActive(city.active);
    setModalActive(true);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("_action", editingCity ? "update" : "create");
    if (editingCity) {
      formData.append("id", editingCity.id);
    }
    formData.append("name", name);
    formData.append("cutoffTime", cutoffTime);
    formData.append("days", JSON.stringify(days));
    formData.append("active", active.toString());
    submit(formData, { method: "post" });
    setModalActive(false);
  };

  const handleDelete = (id) => {
    if (confirm("¿Seguro que deseas eliminar esta ciudad?")) {
      const formData = new FormData();
      formData.append("_action", "delete");
      formData.append("id", id);
      submit(formData, { method: "post" });
    }
  };

  const rows = cities.map((city) => {
    const cityDays = JSON.parse(city.days);
    const daysStr = Object.entries(cityDays)
      .filter(([_, v]) => v)
      .map(([k]) => k.toUpperCase())
      .join(", ");

    return [
      city.name,
      city.cutoffTime,
      daysStr,
      city.active ? "✅ Activo" : "❌ Inactivo",
      <ButtonGroup>
        <Button onClick={() => openEditModal(city)} size="slim">
          Editar
        </Button>
        <Button onClick={() => handleDelete(city.id)} tone="critical" size="slim">
          Eliminar
        </Button>
      </ButtonGroup>
    ];
  });

  return (
    <Page
      title="Gestionar Ciudades"
      backAction={{ url: "/app" }}
      primaryAction={{
        content: "Agregar Ciudad",
        onAction: openCreateModal,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            {cities.length === 0 ? (
              <Text as="p">No hay ciudades configuradas. Agrega la primera.</Text>
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "text"]}
                headings={["Ciudad", "Hora de corte", "Días activos", "Estado", "Acciones"]}
                rows={rows}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title={editingCity ? "Editar ciudad" : "Agregar nueva ciudad"}
        primaryAction={{
          content: "Guardar",
          onAction: handleSave,
        }}
        secondaryActions={[{
          content: "Cancelar",
          onAction: () => setModalActive(false),
        }]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="Nombre de la ciudad"
              value={name}
              onChange={setName}
              autoComplete="off"
            />

            <TextField
              label="Hora de corte"
              type="time"
              value={cutoffTime}
              onChange={setCutoffTime}
              helpText="Hora límite para pedidos del mismo día (formato 24h)"
            />

            <BlockStack gap="200">
              <Text as="p" fontWeight="semibold">Días de entrega</Text>
              {Object.entries(days).map(([day, checked]) => (
                <Checkbox
                  key={day}
                  label={day.toUpperCase()}
                  checked={checked}
                  onChange={(value) => setDays({ ...days, [day]: value })}
                />
              ))}
            </BlockStack>

            <Checkbox
              label="Ciudad activa"
              checked={active}
              onChange={setActive}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}