<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * CE_Settings_Feriados
 * Configura los días feriados globales del sistema.
 */
class CE_Settings_Feriados {

    public function __construct() {
        add_action( 'admin_init', [ $this, 'register_settings' ] );
    }

    /**
     * Registrar la opción de feriados
     */
    public function register_settings() {
        register_setting( 'calendario-envios-settings', 'ce_global_holidays' );
        CE_Logger::info('Opciones de feriados registradas.');
    }

    /**
     * Renderiza la página de configuración de feriados
     */
    public static function render() {
        $feriados = get_option( 'ce_global_holidays', [] );
        if ( ! is_array( $feriados ) ) $feriados = [];
        ?>

        <div class="wrap">
            <h1>📅 Feriados Globales</h1>
            <p>Agrega las fechas en las que no se realizan despachos. Estas fechas aplican a todas las ciudades.</p>

            <form method="post" action="options.php">
                <?php settings_fields( 'calendario-envios-settings' ); ?>

                <table class="form-table" id="ce-holidays-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Motivo (opcional)</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ( ! empty( $feriados ) ) : ?>
                            <?php foreach ( $feriados as $i => $feriado ) : ?>
                                <tr>
                                    <td><input type="date" name="ce_global_holidays[<?php echo $i; ?>][date]" value="<?php echo esc_attr( $feriado['date'] ?? '' ); ?>" /></td>
                                    <td><input type="text" name="ce_global_holidays[<?php echo $i; ?>][reason]" value="<?php echo esc_attr( $feriado['reason'] ?? '' ); ?>" placeholder="Ej: Navidad, Año Nuevo..." /></td>
                                    <td><button type="button" class="button remove-holiday">Eliminar</button></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else : ?>
                            <tr><td colspan="3">No hay feriados configurados.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>

                <p><button type="button" class="button" id="add-holiday">Añadir Feriado</button></p>
                <?php submit_button( 'Guardar cambios' ); ?>
            </form>
        </div>

        <script>
        jQuery(document).ready(function($){
            $('#add-holiday').on('click', function(){
                const index = $('#ce-holidays-table tbody tr').length;
                $('#ce-holidays-table tbody').append(`
                    <tr>
                        <td><input type="date" name="ce_global_holidays[${index}][date]" value="" /></td>
                        <td><input type="text" name="ce_global_holidays[${index}][reason]" value="" placeholder="Ej: Feriado nacional..." /></td>
                        <td><button type="button" class="button remove-holiday">Eliminar</button></td>
                    </tr>
                `);
            });

            $(document).on('click', '.remove-holiday', function(){
                $(this).closest('tr').remove();
            });
        });
        </script>
        <?php

        CE_Logger::info('Página de feriados renderizada correctamente.', [
            'count' => count( $feriados )
        ]);
    }
}

if ( is_admin() ) {
    new CE_Settings_Feriados();
}
