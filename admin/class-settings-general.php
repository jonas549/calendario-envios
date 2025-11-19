<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * CE_Settings_General
 * Configuración general del plugin (activación de calendario, autocompletado, etc).
 */
class CE_Settings_General {

    public function __construct() {
        add_action( 'admin_init', [ $this, 'register_settings' ] );
        CE_Logger::info('CE_Settings_General inicializado.');
    }

    /**
     * Registrar las opciones generales
     */
    public function register_settings() {
        $options = [
            'ce_enable_cart',
            'ce_enable_checkout',
            'ce_autofill_city',
            'ce_mode_workdays',
            'ce_cutoff'
        ];

        foreach ( $options as $opt ) {
            register_setting( 'calendario-envios-settings', $opt );
        }

        CE_Logger::info('Opciones generales registradas.', [ 'count' => count( $options ) ]);
    }

    /**
     * Renderiza la pestaña General
     */
    public static function render() {
        ?>
        <div class="wrap">
            <h1>⚙️ Configuración General</h1>
            <p>Activa o desactiva las funciones principales del calendario de envíos.</p>

            <form method="post" action="options.php" style="max-width:700px;">
                <?php settings_fields( 'calendario-envios-settings' ); ?>

                <table class="form-table" role="presentation">
                    <tbody>

                        <tr>
                            <th scope="row">Mostrar calendario en:</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="ce_enable_cart" value="1" <?php checked( get_option( 'ce_enable_cart', 1 ), 1 ); ?>>
                                    Carrito
                                </label><br>
                                <label>
                                    <input type="checkbox" name="ce_enable_checkout" value="1" <?php checked( get_option( 'ce_enable_checkout', 0 ), 1 ); ?>>
                                    Checkout
                                </label>
                            </td>
                        </tr>

                        <tr>
                            <th scope="row">Autocompletar ciudad en checkout</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="ce_autofill_city" value="1" <?php checked( get_option( 'ce_autofill_city', 1 ), 1 ); ?>>
                                    Activar
                                </label>
                                <p class="description">Si está activo, la ciudad seleccionada en el calendario se autocompleta automáticamente en el checkout.</p>
                            </td>
                        </tr>

                        <tr>
                            <th scope="row">Días hábiles globales</th>
                            <td>
                                <select name="ce_mode_workdays">
                                    <?php
                                    $options = [
                                        'lun-vie' => 'Lunes a Viernes',
                                        'lun-sab' => 'Lunes a Sábado',
                                        'lun-dom' => 'Lunes a Domingo'
                                    ];
                                    $selected = get_option( 'ce_mode_workdays', 'lun-sab' );
                                    foreach ( $options as $key => $label ) {
                                        printf( '<option value="%s" %s>%s</option>', esc_attr( $key ), selected( $selected, $key, false ), esc_html( $label ) );
                                    }
                                    ?>
                                </select>
                                <p class="description">Define los días hábiles globales para despachos.</p>
                            </td>
                        </tr>

                        <tr>
                            <th scope="row">Hora de corte global</th>
                            <td>
                                <input type="time" name="ce_cutoff" value="<?php echo esc_attr( get_option( 'ce_cutoff', '20:00' ) ); ?>" />
                                <p class="description">Pedidos realizados después de esta hora se programarán para el siguiente día hábil.</p>
                            </td>
                        </tr>

                    </tbody>
                </table>

                <?php submit_button( 'Guardar cambios' ); ?>
            </form>
        </div>
        <?php

        CE_Logger::info('Página de configuración general renderizada correctamente.');
    }
}

if ( is_admin() ) {
    new CE_Settings_General();
}
