<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * CE_Settings_Calendario
 * Configura los días hábiles globales y la hora de corte general del sistema.
 */
class CE_Settings_Calendario {

    public function __construct() {
        add_action( 'admin_init', [ $this, 'register_calendar_settings' ] );
    }

    /**
     * Registrar las opciones del calendario global
     */
    public function register_calendar_settings() {
        register_setting( 'calendario-envios-settings', 'ce_mode_workdays' );
        register_setting( 'calendario-envios-settings', 'ce_cutoff' );
        CE_Logger::info('Opciones del calendario global registradas.');
    }

    /**
     * Renderiza la página de configuración de calendario
     */
    public static function render() {
        $workdays = get_option( 'ce_mode_workdays', 'lun-sab' );
        $cutoff   = get_option( 'ce_cutoff', '20:00' );
        ?>

        <div class="wrap">
            <h1>Configuración del Calendario</h1>
            <p>Define los días hábiles generales y la hora de corte para los pedidos del calendario de envíos.</p>

            <form method="post" action="options.php">
                <?php settings_fields( 'calendario-envios-settings' ); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">Días hábiles globales</th>
                        <td>
                            <select name="ce_mode_workdays">
                                <option value="lun-vie" <?php selected( $workdays, 'lun-vie' ); ?>>Lunes a Viernes</option>
                                <option value="lun-sab" <?php selected( $workdays, 'lun-sab' ); ?>>Lunes a Sábado</option>
                                <option value="lun-dom" <?php selected( $workdays, 'lun-dom' ); ?>>Lunes a Domingo</option>
                            </select>
                            <p class="description">Estos días aplicarán a todas las ciudades que no tengan configuración específica.</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">Hora de corte global</th>
                        <td>
                            <input type="time" name="ce_cutoff" value="<?php echo esc_attr( $cutoff ); ?>" />
                            <p class="description">Ejemplo: <code>20:00</code>. Los pedidos después de esta hora se agendan al siguiente día hábil.</p>
                        </td>
                    </tr>
                </table>

                <?php submit_button( 'Guardar cambios' ); ?>
            </form>
        </div>
        <?php

        CE_Logger::info('Página de configuración de calendario renderizada correctamente.', [
            'workdays' => $workdays,
            'cutoff'   => $cutoff
        ]);
    }
}

if ( is_admin() ) {
    new CE_Settings_Calendario();
}
