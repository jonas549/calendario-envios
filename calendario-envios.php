<?php
/**
 * Plugin Name: Calendario de Envíos
 * Description: Permite seleccionar una fecha de entrega en el carrito mediante shortcode, con lógica de hora de corte, días hábiles, feriados configurables y reglas por ciudad. Incluye sistema de logs activos y panel administrativo completo.
 * Version: 1.4
 * Author: Jonas Gonzalez
 * Author URI: https://www.jonasweb.site/
 * Text Domain: calendario-envios
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ============================
// Definir constantes globales
// ============================
define( 'CE_PATH', plugin_dir_path( __FILE__ ) );
define( 'CE_URL', plugin_dir_url( __FILE__ ) );
define( 'CE_VERSION', '1.4' );

// ============================
// Incluir clases base
// ============================
require_once CE_PATH . 'includes/class-logger.php';
require_once CE_PATH . 'includes/class-assets.php';
require_once CE_PATH . 'includes/class-data.php';
require_once CE_PATH . 'includes/class-rules.php';
require_once CE_PATH . 'includes/class-rest.php';
require_once CE_PATH . 'includes/class-render-cart.php'; // soporte interno
require_once CE_PATH . 'includes/class-email.php';
require_once CE_PATH . 'includes/class-shortcodes.php'; // nuevo shortcode principal
require_once CE_PATH . 'includes/helpers.php';

// ============================
// Cargar panel administrativo
// ============================
if ( is_admin() ) {
    require_once CE_PATH . 'admin/class-admin.php';
    require_once CE_PATH . 'admin/class-settings-general.php';
    require_once CE_PATH . 'admin/class-settings-ciudades.php';
    require_once CE_PATH . 'admin/class-settings-calendario.php';
    require_once CE_PATH . 'admin/class-settings-feriados.php';
}

// ============================
// Inicializar Logger
// ============================
CE_Logger::init();
CE_Logger::info('🔧 Calendario de Envíos v1.4 iniciado.');

// ============================
// Inicializar componentes
// ============================
add_action( 'plugins_loaded', function() {
    new CE_Assets();
    new CE_Data();
    new CE_Rules();
    new CE_REST();
    new CE_Render_Cart();
    new CE_Email();
    new CE_Shortcodes(); // inicializar shortcode

    if ( is_admin() && class_exists( 'CE_Admin' ) ) {
        new CE_Admin();
    }

    CE_Logger::info('✅ Componentes principales inicializados correctamente.');
});

// ============================
// Activación del plugin
// ============================
register_activation_hook( __FILE__, function() {
    if ( ! get_option( 'ce_mode_workdays' ) ) update_option( 'ce_mode_workdays', 'lun-sab' );
    if ( ! get_option( 'ce_cutoff' ) ) update_option( 'ce_cutoff', '20:00' );
    if ( ! get_option( 'ce_global_holidays' ) ) update_option( 'ce_global_holidays', [] );
    if ( ! get_option( 'ce_enable_cart' ) ) update_option( 'ce_enable_cart', 1 );

    CE_Logger::init();
    CE_Logger::info('🟢 Plugin Calendario de Envíos v1.4 activado correctamente.');
});

// ============================
// Desactivación
// ============================
register_deactivation_hook( __FILE__, function() {
    CE_Logger::warning('🔴 Plugin Calendario de Envíos v1.4 desactivado.');
});
