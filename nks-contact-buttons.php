<?php
/**
 * Plugin Name: Floating Contact Buttons
 * Description: Admin settings page to configure floating contact buttons (Phone, Zalo, Messenger, Telegram, WhatsApp, Email, SMS, Map, custom link). Admin side only; settings are stored in the ncb_settings option for any frontend to read.
 * Version: 1.0.0
 * Author: Chuong
 * Text Domain: ncb
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NCB_VER', '1.0.0' );
define( 'NCB_URL', plugin_dir_url( __FILE__ ) );
define( 'NCB_OPT', 'ncb_settings' );

/* -------------------------------------------------------------------------
 * Button types
 * ---------------------------------------------------------------------- */
function ncb_types() {
	return array(
		'phone'     => array( 'label' => 'Call',       'ph' => '0901234567',                         'color' => '#16a34a' ),
		'zalo'      => array( 'label' => 'Zalo',      'ph' => 'Zalo phone number, e.g. 0901234567', 'color' => '#0068ff' ),
		'messenger' => array( 'label' => 'Messenger', 'ph' => 'Facebook page username, e.g. pchub', 'color' => '#0084ff' ),
		'telegram'  => array( 'label' => 'Telegram',  'ph' => 'Username, e.g. pchub_support',        'color' => '#229ed9' ),
		'whatsapp'  => array( 'label' => 'WhatsApp',  'ph' => 'Number with country code, e.g. 84901234567',    'color' => '#25d366' ),
		'email'     => array( 'label' => 'Email',     'ph' => 'email@yourdomain.com',                  'color' => '#f59e0b' ),
		'sms'       => array( 'label' => 'SMS',       'ph' => '0901234567',                         'color' => '#8b5cf6' ),
		'map'       => array( 'label' => 'Map',        'ph' => 'Google Maps link (https://...)',     'color' => '#ef4444' ),
		'link'      => array( 'label' => 'Link',       'ph' => 'https://...',                        'color' => '#111827' ),
	);
}

/* -------------------------------------------------------------------------
 * Defaults + read/write
 * ---------------------------------------------------------------------- */
function ncb_defaults() {
	return array(
		'enabled'    => 1,
		'position'   => 'right',
		'bottom'     => 20,
		'side'       => 16,
		'size'       => 52,
		'shape'      => 'round',
		'layout'     => 'list',
		'main_color' => '#e11d48',
		'pulse'      => 1,
		'tooltip'    => 1,
		'devices'    => 'all',
		'delay'      => 0,
		'scroll_top' => 1,
		'mobile_bar' => 0,
		'z_index'    => 9999,
		'exclude'    => '',
		'buttons'    => array(
			array( 'enabled' => 1, 'type' => 'phone',     'label' => 'Call now',   'value' => '0322323233', 'color' => '#00c853', 'new_tab' => 1 ),
			array( 'enabled' => 1, 'type' => 'messenger', 'label' => 'Messenger',  'value' => 'chuong',     'color' => '#0084ff', 'new_tab' => 1 ),
			array( 'enabled' => 1, 'type' => 'zalo',      'label' => 'Chat Zalo',  'value' => '0333333333', 'color' => '#0068ff', 'new_tab' => 1 ),
		),
	);
}

function ncb_get() {
	$saved = get_option( NCB_OPT, array() );
	if ( ! is_array( $saved ) ) {
		$saved = array();
	}
	$o = wp_parse_args( $saved, ncb_defaults() );
	if ( ! isset( $saved['buttons'] ) || ! is_array( $saved['buttons'] ) ) {
		$o['buttons'] = ncb_defaults()['buttons'];
	}
	return $o;
}

function ncb_sanitize( $in ) {
	$d     = ncb_defaults();
	$types = ncb_types();
	$in    = is_array( $in ) ? $in : array();
	$out   = array();

	foreach ( array( 'enabled', 'pulse', 'tooltip', 'scroll_top', 'mobile_bar' ) as $k ) {
		$out[ $k ] = empty( $in[ $k ] ) ? 0 : 1;
	}
	$out['position']   = ( isset( $in['position'] ) && 'left' === $in['position'] ) ? 'left' : 'right';
	$out['shape']      = ( isset( $in['shape'] ) && in_array( $in['shape'], array( 'round', 'square' ), true ) ) ? $in['shape'] : 'round';
	$out['layout']     = ( isset( $in['layout'] ) && 'expand' === $in['layout'] ) ? 'expand' : 'list';
	$out['devices']    = ( isset( $in['devices'] ) && in_array( $in['devices'], array( 'all', 'desktop', 'mobile' ), true ) ) ? $in['devices'] : 'all';
	$out['bottom']     = isset( $in['bottom'] ) ? max( 0, min( 500, (int) $in['bottom'] ) ) : $d['bottom'];
	$out['side']       = isset( $in['side'] ) ? max( 0, min( 300, (int) $in['side'] ) ) : $d['side'];
	$out['size']       = isset( $in['size'] ) ? max( 36, min( 90, (int) $in['size'] ) ) : $d['size'];
	$out['delay']      = isset( $in['delay'] ) ? max( 0, min( 60, (int) $in['delay'] ) ) : 0;
	$out['z_index']    = isset( $in['z_index'] ) ? max( 1, min( 2147483000, (int) $in['z_index'] ) ) : $d['z_index'];
	$out['main_color'] = ( isset( $in['main_color'] ) && sanitize_hex_color( $in['main_color'] ) ) ? sanitize_hex_color( $in['main_color'] ) : $d['main_color'];
	$out['exclude']    = isset( $in['exclude'] ) ? preg_replace( '/[^0-9,\s]/', '', $in['exclude'] ) : '';

	$out['buttons'] = array();
	if ( ! empty( $in['buttons'] ) && is_array( $in['buttons'] ) ) {
		foreach ( $in['buttons'] as $b ) {
			if ( ! is_array( $b ) ) {
				continue;
			}
			$type  = ( isset( $b['type'] ) && isset( $types[ $b['type'] ] ) ) ? $b['type'] : 'link';
			$color = ( isset( $b['color'] ) && sanitize_hex_color( $b['color'] ) ) ? sanitize_hex_color( $b['color'] ) : $types[ $type ]['color'];
			$out['buttons'][] = array(
				'enabled' => empty( $b['enabled'] ) ? 0 : 1,
				'type'    => $type,
				'label'   => isset( $b['label'] ) ? sanitize_text_field( $b['label'] ) : '',
				'value'   => isset( $b['value'] ) ? sanitize_text_field( $b['value'] ) : '',
				'color'   => $color,
				'new_tab' => empty( $b['new_tab'] ) ? 0 : 1,
			);
		}
	}
	return $out;
}

add_action( 'admin_init', function () {
	register_setting( 'ncb_group', NCB_OPT, array(
		'sanitize_callback' => 'ncb_sanitize',
		'show_in_rest'      => true,
	) );
} );

/* -------------------------------------------------------------------------
 * REST API Endpoints for Headless Frontend (Next.js / PCHub)
 * ---------------------------------------------------------------------- */
add_action( 'rest_api_init', function () {
	register_rest_route( 'ncb/v1', '/buttons', array(
		'methods'             => 'GET',
		'callback'            => 'ncb_rest_get_buttons',
		'permission_callback' => '__return_true',
	) );

	register_rest_route( 'contact-buttons/v1', '/buttons', array(
		'methods'             => 'GET',
		'callback'            => 'ncb_rest_get_buttons',
		'permission_callback' => '__return_true',
	) );
} );

function ncb_rest_get_buttons() {
	$data    = ncb_get();
	$types   = ncb_types();
	$buttons = array();

	if ( ! empty( $data['buttons'] ) && is_array( $data['buttons'] ) ) {
		foreach ( $data['buttons'] as $i => $b ) {
			if ( empty( $b['enabled'] ) || '' === trim( $b['value'] ?? '' ) ) {
				continue;
			}
			$type  = $b['type'];
			$label = ! empty( $b['label'] ) ? $b['label'] : ( isset( $types[ $type ] ) ? $types[ $type ]['label'] : ucfirst( $type ) );
			$color = ! empty( $b['color'] ) ? $b['color'] : ( isset( $types[ $type ] ) ? $types[ $type ]['color'] : '#2563eb' );

			$buttons[] = array(
				'id'         => $type,
				'type'       => $type,
				'label'      => $label,
				'sublabel'   => $b['value'],
				'value'      => $b['value'],
				'href'       => ncb_url( $type, $b['value'] ),
				'color'      => $color,
				'openNewTab' => ! empty( $b['new_tab'] ),
				'enabled'    => true,
			);
		}
	}

	return rest_ensure_response( array(
		'success'  => true,
		'enabled'  => ! empty( $data['enabled'] ),
		'position' => isset( $data['position'] ) ? $data['position'] : 'right',
		'buttons'  => $buttons,
		'settings' => $data,
	) );
}

/* -------------------------------------------------------------------------
 * Auto sync to Next.js whenever settings are saved in WordPress admin
 * ---------------------------------------------------------------------- */
add_action( 'update_option_' . NCB_OPT, 'ncb_sync_to_nextjs', 10, 2 );

function ncb_sync_to_nextjs( $old_value, $new_value ) {
	$types   = ncb_types();
	$buttons = array();

	if ( ! empty( $new_value['buttons'] ) && is_array( $new_value['buttons'] ) ) {
		foreach ( $new_value['buttons'] as $i => $b ) {
			if ( empty( $b['enabled'] ) || '' === trim( $b['value'] ?? '' ) ) {
				continue;
			}
			$type  = $b['type'];
			$label = ! empty( $b['label'] ) ? $b['label'] : ( isset( $types[ $type ] ) ? $types[ $type ]['label'] : ucfirst( $type ) );
			$color = ! empty( $b['color'] ) ? $b['color'] : ( isset( $types[ $type ] ) ? $types[ $type ]['color'] : '#2563eb' );

			$buttons[] = array(
				'id'         => $type,
				'type'       => $type,
				'label'      => $label,
				'sublabel'   => $b['value'],
				'value'      => $b['value'],
				'href'       => ncb_url( $type, $b['value'] ),
				'color'      => $color,
				'openNewTab' => ! empty( $b['new_tab'] ),
				'enabled'    => true,
			);
		}
	}

	$payload = wp_json_encode( array(
		'buttons' => $buttons,
	) );

	// Ping Next.js local & production endpoints
	$endpoints = array(
		'http://localhost:3000/api/contact-buttons',
		'https://pchub-iota.vercel.app/api/contact-buttons',
	);

	foreach ( $endpoints as $url ) {
		wp_remote_post( $url, array(
			'headers'   => array( 'Content-Type' => 'application/json' ),
			'body'      => $payload,
			'timeout'   => 3,
			'blocking'  => false,
			'sslverify' => false,
		) );
	}
}

/* -------------------------------------------------------------------------
 * Build URL by button type
 * ---------------------------------------------------------------------- */
function ncb_url( $type, $value ) {
	$value = trim( $value );
	if ( '' === $value ) {
		return '';
	}
	$is_http = (bool) preg_match( '#^https?://#i', $value );
	$digits  = preg_replace( '/[^0-9]/', '', $value );

	switch ( $type ) {
		case 'phone':
			return 'tel:' . preg_replace( '/[^0-9+]/', '', $value );
		case 'sms':
			return 'sms:' . preg_replace( '/[^0-9+]/', '', $value );
		case 'email':
			return 'mailto:' . sanitize_email( $value );
		case 'zalo':
			if ( $is_http ) {
				return esc_url_raw( $value );
			}
			return 'https://zalo.me/' . ( $digits ? $digits : rawurlencode( ltrim( $value, '@/' ) ) );
		case 'messenger':
			return $is_http ? esc_url_raw( $value ) : 'https://m.me/' . rawurlencode( ltrim( $value, '@/' ) );
		case 'telegram':
			return $is_http ? esc_url_raw( $value ) : 'https://t.me/' . rawurlencode( ltrim( $value, '@/' ) );
		case 'whatsapp':
			return $is_http ? esc_url_raw( $value ) : ( $digits ? 'https://wa.me/' . $digits : '' );
		default:
			return $is_http ? esc_url_raw( $value ) : '';
	}
}

/* -------------------------------------------------------------------------
 * Admin
 * ---------------------------------------------------------------------- */
add_action( 'admin_menu', function () {
	add_menu_page( 'Contact Buttons', 'Contact Buttons', 'manage_options', 'ncb', 'ncb_page', 'dashicons-phone', 58 );
} );

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'admin.php?page=ncb' ) ) . '">Settings</a>' );
	return $links;
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( 'toplevel_page_ncb' !== $hook ) {
		return;
	}
	wp_enqueue_style( 'wp-color-picker' );
	wp_enqueue_style( 'ncb-admin', NCB_URL . 'assets/admin.css', array(), NCB_VER );
	wp_enqueue_script( 'ncb-admin', NCB_URL . 'assets/admin.js', array( 'jquery', 'jquery-ui-sortable', 'wp-color-picker' ), NCB_VER, true );
} );

function ncb_row( $i, $b ) {
	$types = ncb_types();
	$name  = NCB_OPT . '[buttons][' . $i . ']';
	ob_start();
	?>
	<div class="ncb-row">
		<span class="ncb-row__drag dashicons dashicons-move" title="Drag to reorder"></span>
		<label class="ncb-row__on"><input type="checkbox" name="<?php echo esc_attr( $name ); ?>[enabled]" value="1" <?php checked( ! empty( $b['enabled'] ) ); ?>> On</label>
		<select class="ncb-type" name="<?php echo esc_attr( $name ); ?>[type]">
			<?php foreach ( $types as $k => $t ) : ?>
				<option value="<?php echo esc_attr( $k ); ?>" data-ph="<?php echo esc_attr( $t['ph'] ); ?>" data-color="<?php echo esc_attr( $t['color'] ); ?>" <?php selected( $b['type'], $k ); ?>><?php echo esc_html( $t['label'] ); ?></option>
			<?php endforeach; ?>
		</select>
		<input type="text" class="ncb-label" name="<?php echo esc_attr( $name ); ?>[label]" value="<?php echo esc_attr( $b['label'] ); ?>" placeholder="Display label">
		<input type="text" class="ncb-value" name="<?php echo esc_attr( $name ); ?>[value]" value="<?php echo esc_attr( $b['value'] ); ?>" placeholder="<?php echo esc_attr( $types[ $b['type'] ]['ph'] ); ?>">
		<input type="text" class="ncb-color" name="<?php echo esc_attr( $name ); ?>[color]" value="<?php echo esc_attr( $b['color'] ); ?>">
		<label class="ncb-row__tab"><input type="checkbox" name="<?php echo esc_attr( $name ); ?>[new_tab]" value="1" <?php checked( ! empty( $b['new_tab'] ) ); ?>> New tab</label>
		<button type="button" class="button-link-delete ncb-remove" aria-label="Remove">Remove</button>
	</div>
	<?php
	return ob_get_clean();
}

function ncb_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o = ncb_get();
	$n = NCB_OPT;
	?>
	<div class="wrap ncb-admin">
		<h1>Floating Contact Buttons</h1>
		<?php settings_errors(); ?>
		<form method="post" action="options.php">
			<?php settings_fields( 'ncb_group' ); ?>

			<h2>Buttons</h2>
			<p class="description">Drag the <span class="dashicons dashicons-move"></span> handle to reorder. Buttons with an empty value are not shown.</p>
			<div id="ncb-rows">
				<?php
				foreach ( array_values( $o['buttons'] ) as $i => $b ) {
					echo ncb_row( $i, $b ); // phpcs:ignore WordPress.Security.EscapeOutput
				}
				?>
			</div>
			<p><button type="button" class="button" id="ncb-add">+ Add button</button></p>
			<script type="text/template" id="ncb-tpl"><?php echo ncb_row( '__i__', array( 'enabled' => 1, 'type' => 'phone', 'label' => '', 'value' => '', 'color' => ncb_types()['phone']['color'], 'new_tab' => 0 ) ); // phpcs:ignore ?></script>

			<h2>Display</h2>
			<table class="form-table" role="presentation">
				<tr><th>Enable</th><td><label><input type="checkbox" name="<?php echo $n; ?>[enabled]" value="1" <?php checked( $o['enabled'] ); ?>> Show contact buttons on the website</label></td></tr>
				<tr><th>Position</th><td>
					<select name="<?php echo $n; ?>[position]">
						<option value="right" <?php selected( $o['position'], 'right' ); ?>>Right corner</option>
						<option value="left" <?php selected( $o['position'], 'left' ); ?>>Left corner</option>
					</select>
				</td></tr>
				<tr><th>Layout</th><td>
					<select name="<?php echo $n; ?>[layout]">
						<option value="list" <?php selected( $o['layout'], 'list' ); ?>>Show all buttons</option>
						<option value="expand" <?php selected( $o['layout'], 'expand' ); ?>>Collapsed (click main button to open)</option>
					</select>
				</td></tr>
				<tr><th>Shape</th><td>
					<select name="<?php echo $n; ?>[shape]">
						<option value="round" <?php selected( $o['shape'], 'round' ); ?>>Round</option>
						<option value="square" <?php selected( $o['shape'], 'square' ); ?>>Rounded square</option>
					</select>
				</td></tr>
				<tr><th>Button size (px)</th><td><input type="number" min="36" max="90" name="<?php echo $n; ?>[size]" value="<?php echo (int) $o['size']; ?>" class="small-text"></td></tr>
				<tr><th>Distance from bottom (px)</th><td><input type="number" min="0" max="500" name="<?php echo $n; ?>[bottom]" value="<?php echo (int) $o['bottom']; ?>" class="small-text"></td></tr>
				<tr><th>Distance from side (px)</th><td><input type="number" min="0" max="300" name="<?php echo $n; ?>[side]" value="<?php echo (int) $o['side']; ?>" class="small-text"></td></tr>
				<tr><th>Main button color</th><td><input type="text" class="ncb-color" name="<?php echo $n; ?>[main_color]" value="<?php echo esc_attr( $o['main_color'] ); ?>"><p class="description">Used for the toggle button (collapsed layout) and the scroll-to-top button.</p></td></tr>
				<tr><th>Effects</th><td>
					<label><input type="checkbox" name="<?php echo $n; ?>[pulse]" value="1" <?php checked( $o['pulse'] ); ?>> Pulse animation to draw attention</label><br>
					<label><input type="checkbox" name="<?php echo $n; ?>[tooltip]" value="1" <?php checked( $o['tooltip'] ); ?>> Show label on hover</label><br>
					<label><input type="checkbox" name="<?php echo $n; ?>[scroll_top]" value="1" <?php checked( $o['scroll_top'] ); ?>> Scroll-to-top button</label>
				</td></tr>
				<tr><th>Bottom contact bar (mobile)</th><td><label><input type="checkbox" name="<?php echo $n; ?>[mobile_bar]" value="1" <?php checked( $o['mobile_bar'] ); ?>> On phones, show as a fixed horizontal bar at the bottom of the screen</label></td></tr>
				<tr><th>Devices</th><td>
					<select name="<?php echo $n; ?>[devices]">
						<option value="all" <?php selected( $o['devices'], 'all' ); ?>>All</option>
						<option value="desktop" <?php selected( $o['devices'], 'desktop' ); ?>>Desktop only</option>
						<option value="mobile" <?php selected( $o['devices'], 'mobile' ); ?>>Mobile only</option>
					</select>
				</td></tr>
				<tr><th>Display delay (seconds)</th><td><input type="number" min="0" max="60" name="<?php echo $n; ?>[delay]" value="<?php echo (int) $o['delay']; ?>" class="small-text"></td></tr>
				<tr><th>Hide on pages (IDs)</th><td><input type="text" class="regular-text" name="<?php echo $n; ?>[exclude]" value="<?php echo esc_attr( $o['exclude'] ); ?>" placeholder="12, 45, 78"><p class="description">Post/page/product IDs to hide on, separated by commas.</p></td></tr>
				<tr><th>z-index</th><td><input type="number" name="<?php echo $n; ?>[z_index]" value="<?php echo (int) $o['z_index']; ?>" class="small-text"></td></tr>
			</table>
			<?php submit_button( 'Save Changes' ); ?>
		</form>
	</div>
	<?php
}
