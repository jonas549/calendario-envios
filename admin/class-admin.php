<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * CE_Admin
 * Clase principal del panel administrativo del plugin.
 */
class CE_Admin {

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
        CE_Logger::info('CE_Admin inicializado.');
    }

    /**
     * Añade el menú principal y subpáginas del plugin.
     */
    public function add_admin_menu() {
        add_menu_page(
            __( 'Calendario de Envíos', 'calendario-envios' ),
            __( 'Calendario de Envíos', 'calendario-envios' ),
            'manage_options',
            'calendario-envios',
            [ $this, 'render_settings_page' ],
            'dashicons-calendar-alt',
            56
        );

        // Subpáginas
        add_submenu_page( 'calendario-envios', 'General', 'General', 'manage_options', 'ce-settings-general', [ $this, 'render_general_page' ] );
        add_submenu_page( 'calendario-envios', 'Ciudades', 'Ciudades', 'manage_options', 'ce-settings-ciudades', [ $this, 'render_ciudades_page' ] );
        add_submenu_page( 'calendario-envios', 'Calendario', 'Calendario', 'manage_options', 'ce-settings-calendario', [ $this, 'render_calendario_page' ] );
        add_submenu_page( 'calendario-envios', 'Feriados', 'Feriados', 'manage_options', 'ce-settings-feriados', [ $this, 'render_feriados_page' ] );

        CE_Logger::info('Menú administrativo creado.');
    }

    /**
     * Registra todas las opciones en WordPress.
     */
    public function register_settings() {
        $options = [
            'ce_enable_cart',
            'ce_mode_workdays',
            'ce_cutoff',
            'ce_global_holidays',
            'ce_cities_config'
        ];

        foreach ( $options as $opt ) {
            register_setting( 'calendario-envios-settings', $opt );
        }

        CE_Logger::info('Opciones administrativas registradas.', [ 'count' => count( $options ) ]);
    }

    /**
     * Página principal (resumen)
     */
    public function render_settings_page() {
        echo '<div class="wrap"><h1>Calendario de Envíos</h1>';
        echo '<p>Bienvenido al panel de configuración del Calendario de Envíos.</p>';
        echo '<ul style="list-style:disc;margin-left:20px;">';
        echo '<li>✔️ Define tus días hábiles y hora de corte.</li>';
        echo '<li>📅 Configura los feriados globales.</li>';
        echo '<li>🏙️ Establece ciudades y reglas personalizadas.</li>';
        echo '<li>🧩 Inserta el calendario con el shortcode <code>[calendario_envios]</code>.</li>';
        echo '</ul></div>';
    }

    public function render_general_page() {
        $file = CE_PATH . 'admin/class-settings-general.php';
        if ( file_exists( $file ) ) include $file;
        else CE_Logger::error('Archivo class-settings-general.php no encontrado.');
    }

    public function render_ciudades_page() {
        $file = CE_PATH . 'admin/class-settings-ciudades.php';
        if ( file_exists( $file ) ) include $file;
        else CE_Logger::error('Archivo class-settings-ciudades.php no encontrado.');
    }

    public function render_calendario_page() {
        $file = CE_PATH . 'admin/class-settings-calendario.php';
        if ( file_exists( $file ) ) include $file;
        else CE_Logger::error('Archivo class-settings-calendario.php no encontrado.');
    }

    public function render_feriados_page() {
        $file = CE_PATH . 'admin/class-settings-feriados.php';
        if ( file_exists( $file ) ) include $file;
        else CE_Logger::error('Archivo class-settings-feriados.php no encontrado.');
    }
}
