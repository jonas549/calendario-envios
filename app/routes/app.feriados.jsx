import { 
  Page, 
  Layout, 
  Card, 
  DataTable, 
  Button, 
  Modal, 
  FormLayout, 
  TextField, 
  Checkbox, 
  Text,
  BlockStack,
  ButtonGroup,
  Banner
} from "@shopify/polaris";
import { useState } from "react";
import { useLoaderData, useSubmit, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const holidays = await prisma.holiday.findMany({
    where: { shop },
    orderBy: { date: "asc" },
  });

  return { holidays };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "create") {
    const dateString = formData.get("date");
    await prisma.holiday.create({
      data: {
        shop,
        date: new Date(dateString + "T00:00:00.000Z"),
        name: formData.get("name"),
        active: formData.get("active") === "true",
      },
    });
  }

  if (action === "update") {
    const dateString = formData.get("date");
    await prisma.holiday.update({
      where: { id: formData.get("id") },
      data: {
        date: new Date(dateString + "T00:00:00.000Z"),
        name: formData.get("name"),
        active: formData.get("active") === "true",
      },
    });
  }

  if (action === "delete") {
    await prisma.holiday.delete({
      where: { id: formData.get("id") },
    });
  }

  return { success: true };
};

export default function Feriados() {
  const { holidays } = useLoaderData();
  const submit = useSubmit();
  const actionData = useActionData();
  
  const [modalActive, setModalActive] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [active, setActive] = useState(true);

  const openCreateModal = () => {
    setEditingHoliday(null);
    setName("");
    setDate("");
    setActive(true);
    setModalActive(true);
  };

  const openEditModal = (holiday) => {
    setEditingHoliday(holiday);
    setName(holiday.name);
    setDate(new Date(holiday.date).toISOString().split('T')[0]);
    setActive(holiday.active);
    setModalActive(true);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("_action", editingHoliday ? "update" : "create");
    if (editingHoliday) {
      formData.append("id", editingHoliday.id);
    }
    formData.append("date", date);
    formData.append("name", name);
    formData.append("active", active.toString());
    submit(formData, { method: "post" });
    setModalActive(false);
  };

  const handleDelete = (id) => {
    if (confirm("¿Seguro que deseas eliminar este feriado?")) {
      const formData = new FormData();
      formData.append("_action", "delete");
      formData.append("id", id);
      submit(formData, { method: "post" });
    }
  };

  const rows = holidays.map((holiday) => [
    new Date(holiday.date).toLocaleDateString("es-ES"),
    holiday.name,
    holiday.active ? "✅ Activo" : "❌ Inactivo",
    <ButtonGroup>
      <Button onClick={() => openEditModal(holiday)} size="slim">
        Editar
      </Button>
      <Button onClick={() => handleDelete(holiday.id)} tone="critical" size="slim">
        Eliminar
      </Button>
    </ButtonGroup>
  ]);

  return (
    <Page
      title="Gestionar Feriados"
      backAction={{ url: "/app" }}
      primaryAction={{
        content: "Agregar Feriado",
        onAction: openCreateModal,
      }}
    >
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner status="success" onDismiss={() => window.location.reload()}>
              ✅ Feriado guardado correctamente
            </Banner>
          )}

          <Card>
            {holidays.length === 0 ? (
              <Text as="p">No hay feriados configurados. Agrega el primero.</Text>
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "text", "text"]}
                headings={["Fecha", "Nombre", "Estado", "Acciones"]}
                rows={rows}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title={editingHoliday ? "Editar feriado" : "Agregar nuevo feriado"}
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
              label="Fecha"
              type="date"
              value={date}
              onChange={setDate}
              autoComplete="off"
            />

            <TextField
              label="Nombre del feriado"
              value={name}
              onChange={setName}
              autoComplete="off"
              placeholder="Ej: Navidad, Año Nuevo"
            />

            <Checkbox
              label="Feriado activo"
              checked={active}
              onChange={setActive}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}