export default function PrivacyPolicy() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '40px auto', 
      padding: '20px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: '1.6',
      color: '#333'
    }}>
      <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        Política de Privacidad - Calendify Delivery
      </h1>
      
      <p><strong>Última actualización:</strong> 3 de diciembre de 2024</p>
      
      <h2>1. Información que recopilamos</h2>
      <p>Calendify Delivery recopila únicamente la información necesaria para proporcionar el servicio de programación de entregas:</p>
      <ul>
        <li>Nombre de la tienda Shopify</li>
        <li>Ciudades y fechas de entrega configuradas</li>
        <li>Días festivos configurados</li>
        <li>Preferencias de configuración de la aplicación</li>
      </ul>
      <p>No recopilamos información personal de los clientes finales de las tiendas.</p>
      
      <h2>2. Cómo usamos la información</h2>
      <p>La información recopilada se utiliza exclusivamente para:</p>
      <ul>
        <li>Mostrar el calendario de entregas en el carrito de compras</li>
        <li>Calcular fechas de entrega disponibles según horarios de corte</li>
        <li>Gestionar días festivos y horarios especiales</li>
        <li>Proporcionar soporte técnico cuando sea necesario</li>
      </ul>
      
      <h2>3. Almacenamiento y seguridad de datos</h2>
      <p>Los datos se almacenan de forma segura en servidores de Neon (PostgreSQL) con las siguientes medidas de seguridad:</p>
      <ul>
        <li>Encriptación en tránsito (TLS/SSL)</li>
        <li>Encriptación en reposo</li>
        <li>Acceso restringido mediante autenticación</li>
        <li>Backups automáticos regulares</li>
      </ul>
      
      <h2>4. Compartir información con terceros</h2>
      <p>No compartimos, vendemos ni alquilamos información de nuestros usuarios a terceros. Los únicos terceros que tienen acceso limitado son:</p>
      <ul>
        <li>Shopify (plataforma host)</li>
        <li>Neon (proveedor de base de datos)</li>
        <li>Vercel (hosting de la aplicación)</li>
      </ul>
      <p>Todos estos servicios cumplen con estándares internacionales de seguridad y privacidad.</p>
      
      <h2>5. Retención de datos</h2>
      <p>Los datos se retienen mientras la aplicación esté instalada en la tienda Shopify. Al desinstalar la aplicación, todos los datos asociados a la tienda se eliminan de nuestros servidores dentro de los 30 días siguientes.</p>
      
      <h2>6. Derechos del usuario</h2>
      <p>Los usuarios tienen derecho a:</p>
      <ul>
        <li>Acceder a sus datos almacenados</li>
        <li>Solicitar la corrección de datos inexactos</li>
        <li>Solicitar la eliminación de sus datos</li>
        <li>Exportar sus datos en formato legible</li>
        <li>Revocar el consentimiento en cualquier momento</li>
      </ul>
      <p>Para ejercer estos derechos, contacte con nuestro equipo de soporte.</p>
      
      <h2>7. Cumplimiento normativo</h2>
      <p>Calendify Delivery cumple con:</p>
      <ul>
        <li>GDPR (Reglamento General de Protección de Datos de la UE)</li>
        <li>CCPA (Ley de Privacidad del Consumidor de California)</li>
        <li>Políticas de privacidad de Shopify</li>
        <li>Ley de Protección de Datos Personales de Chile (Ley 19.628)</li>
      </ul>
      
      <h2>8. Cookies y tecnologías de seguimiento</h2>
      <p>La aplicación utiliza cookies de sesión necesarias para la autenticación con Shopify. No utilizamos cookies de seguimiento ni analíticas de terceros.</p>
      
      <h2>9. Menores de edad</h2>
      <p>Nuestro servicio está dirigido a comerciantes (mayores de 18 años). No recopilamos intencionalmente información de menores de edad.</p>
      
      <h2>10. Cambios a esta política</h2>
      <p>Podemos actualizar esta política de privacidad ocasionalmente. Los cambios importantes se notificarán a través del panel de administración de la aplicación y el correo electrónico asociado a la cuenta de Shopify.</p>
      <p>El uso continuado de la aplicación tras los cambios constituye aceptación de la nueva política.</p>
      
      <h2>11. Transferencias internacionales de datos</h2>
      <p>Los datos pueden ser transferidos y procesados en servidores ubicados en Estados Unidos. Implementamos salvaguardas adecuadas para proteger los datos según estándares internacionales.</p>
      
      <h2>12. Soporte y contacto</h2>
      <p>Para consultas sobre privacidad, ejercicio de derechos o cualquier pregunta relacionada con el tratamiento de datos:</p>
      <ul>
        <li><strong>Email:</strong> support@calendifydelivery.com</li>
        <li><strong>Sitio web:</strong> https://calendario-envios.vercel.app</li>
        <li><strong>Tiempo de respuesta:</strong> 48 horas hábiles</li>
      </ul>
      
      <h2>13. Autoridad de control</h2>
      <p>Si considera que sus derechos de privacidad han sido violados, puede presentar una queja ante la autoridad de protección de datos de su jurisdicción.</p>
      
      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />
      
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
        Al instalar y utilizar Calendify Delivery, usted acepta los términos de esta Política de Privacidad.
      </p>
      
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
        © 2024 Calendify Delivery. Todos los derechos reservados.
      </p>
    </div>
  );
}