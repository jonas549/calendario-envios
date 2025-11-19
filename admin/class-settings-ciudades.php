<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * CE_Settings_Ciudades
 * Configuración de ciudades y reglas de entrega.
 */
class CE_Settings_Ciudades {

    public function __construct() {
        add_action( 'admin_init', [ $this, 'register_city_settings' ] );
    }

    /**
     * Registrar opción de configuración
     */
    public function register_city_settings() {
        register_setting( 'calendario-envios-settings', 'ce_cities_config' );
    }

    /**
     * Renderiza la página de configuración
     */
    public static function render() {
        $cities = get_option( 'ce_cities_config', [] );

        // Si no es array, inicializar vacío
        if ( ! is_array( $cities ) ) $cities = [];

        ?>
        <div class="wrap">
            <h1>Configuración de Ciudades</h1>
            <p>Define las ciudades y sus reglas de entrega específicas. Cada ciudad puede tener una hora de corte y días hábiles propios.</p>

            <form method="post" action="options.php">
                <?php settings_fields( 'calendario-envios-settings' ); ?>

                <table class="form-table" id="ce-cities-table">
                    <thead>
                        <tr>
                            <th>Ciudad</th>
                            <th>Días hábiles (ej: lun-vie)</th>
                            <th>Hora de corte</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ( ! empty( $cities ) ) : ?>
                            <?php foreach ( $cities as $index => $city ) : ?>
                                <tr>
                                    <td><input type="text" name="ce_cities_config[<?php echo $index; ?>][name]" value="<?php echo esc_attr( $city['name'] ?? '' ); ?>" /></td>
                                    <td><input type="text" name="ce_cities_config[<?php echo $index; ?>][workdays]" value="<?php echo esc_attr( $city['workdays'] ?? 'lun-vie' ); ?>" /></td>
                                    <td><input type="text" name="ce_cities_config[<?php echo $index; ?>][cutoff]" value="<?php echo esc_attr( $city['cutoff'] ?? '20:00' ); ?>" /></td>
                                    <td><button type="button" class="button remove-city">Eliminar</button></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else : ?>
                            <tr><td colspan="4">No hay ciudades configuradas.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>

                <p><button type="button" class="button" id="add-city">Añadir Ciudad</button></p>
                <?php submit_button( 'Guardar cambios' ); ?>
            </form>
        </div>

        <script>
        jQuery(document).ready(function($){
            $('#add-city').on('click', function(){
                const index = $('#ce-cities-table tbody tr').length;
                $('#ce-cities-table tbody').append(`
                    <tr>
                        <td><input type="text" name="ce_cities_config[${index}][name]" value="" /></td>
                        <td><input type="text" name="ce_cities_config[${index}][workdays]" value="lun-vie" /></td>
                        <td><input type="text" name="ce_cities_config[${index}][cutoff]" value="20:00" /></td>
                        <td><button type="button" class="button remove-city">Eliminar</button></td>
                    </tr>
                `);
            });

            $(document).on('click', '.remove-city', function(){
                $(this).closest('tr').remove();
            });
        });
        </script>
        <?php

        CE_Logger::info('Página de configuración de ciudades renderizada correctamente.', [
            'count' => count( $cities )
        ]);
    }
}

if ( is_admin() ) {
    new CE_Settings_Ciudades();
}
