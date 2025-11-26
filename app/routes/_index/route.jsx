import { redirect } from "react-router";
import { Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import { logger } from "../../utils/logger.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // Si tiene parámetro shop, redirigir a BILLING (no a /app)
  if (url.searchParams.get("shop")) {
    const shop = url.searchParams.get("shop");
    logger.info("root", "Redirigiendo a billing desde root", { shop }, shop);
    throw redirect(`/app/billing?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Calendario de Envíos</h1>
        <p className={styles.text}>
          Permite a tus clientes seleccionar fechas de entrega personalizadas.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Fechas personalizadas</strong>. Tus clientes pueden elegir su fecha de entrega preferida basada en tu disponibilidad.
          </li>
          <li>
            <strong>Horarios de corte</strong>. Define horarios límite por ciudad para garantizar entregas a tiempo.
          </li>
          <li>
            <strong>Gestión de feriados</strong>. Bloquea fechas no laborables automáticamente en el calendario
          </li>
        </ul>
      </div>
    </div>
  );
}