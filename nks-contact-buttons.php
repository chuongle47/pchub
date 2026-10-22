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
		'success'  => true,
		'enabled'  => ! empty( $new_value['enabled'] ),
		'position' => isset( $new_value['position'] ) ? $new_value['position'] : 'right',
		'buttons'  => $buttons,
		'settings' => $new_value,
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

/* -------------------------------------------------------------------------
 * Frontend Rendering for WordPress Theme (outside website)
 * ---------------------------------------------------------------------- */
add_action( 'wp_footer', 'ncb_render_frontend' );

function ncb_render_frontend() {
	if ( is_admin() ) {
		return;
	}
	$o = ncb_get();
	if ( empty( $o['enabled'] ) ) {
		return;
	}

	// Exclude pages check
	if ( ! empty( $o['exclude'] ) ) {
		$exclude_ids = array_filter( array_map( 'absint', explode( ',', $o['exclude'] ) ) );
		$current_id  = get_queried_object_id();
		if ( $current_id && in_array( $current_id, $exclude_ids, true ) ) {
			return;
		}
	}

	$buttons = array();
	$types   = ncb_types();
	if ( ! empty( $o['buttons'] ) && is_array( $o['buttons'] ) ) {
		foreach ( $o['buttons'] as $b ) {
			if ( empty( $b['enabled'] ) || '' === trim( $b['value'] ?? '' ) ) {
				continue;
			}
			$type      = $b['type'];
			$label     = ! empty( $b['label'] ) ? $b['label'] : ( isset( $types[ $type ] ) ? $types[ $type ]['label'] : ucfirst( $type ) );
			$color     = ! empty( $b['color'] ) ? $b['color'] : ( isset( $types[ $type ] ) ? $types[ $type ]['color'] : '#2563eb' );
			$buttons[] = array(
				'type'       => $type,
				'label'      => $label,
				'value'      => $b['value'],
				'href'       => ncb_url( $type, $b['value'] ),
				'color'      => $color,
				'openNewTab' => ! empty( $b['new_tab'] ),
			);
		}
	}

	if ( empty( $buttons ) ) {
		return;
	}

	$is_left    = ( 'left' === ( $o['position'] ?? 'right' ) );
	$is_square  = ( 'square' === ( $o['shape'] ?? 'round' ) );
	$size       = max( 36, min( 90, (int) ( $o['size'] ?? 52 ) ) );
	$bottom     = (int) ( $o['bottom'] ?? 20 );
	$side       = (int) ( $o['side'] ?? 16 );
	$radius     = $is_square ? max( 8, round( $size * 0.22 ) ) . 'px' : '50%';
	$main_color = ! empty( $o['main_color'] ) ? $o['main_color'] : '#e11d48';
	$pulse      = ! empty( $o['pulse'] );
	$tooltip    = ! empty( $o['tooltip'] );
	$scroll_top = ! empty( $o['scroll_top'] );
	$devices    = $o['devices'] ?? 'all';
	$delay      = (int) ( $o['delay'] ?? 0 );
	$z_index    = (int) ( $o['z_index'] ?? 9999 );
	?>
	<style>
		.ncb-frontend-container {
			position: fixed;
			<?php echo $is_left ? 'left: ' . $side . 'px; right: auto;' : 'right: ' . $side . 'px; left: auto;'; ?>
			bottom: <?php echo $is_left ? $bottom : ( $bottom + 68 ); ?>px;
			z-index: <?php echo $z_index; ?>;
			display: flex;
			flex-direction: column;
			align-items: <?php echo $is_left ? 'flex-start' : 'flex-end'; ?>;
			gap: 10px;
			font-family: inherit;
			pointer-events: auto;
		}
		<?php if ( 'desktop' === $devices ) : ?>
			@media (max-width: 768px) { .ncb-frontend-container { display: none !important; } }
		<?php elseif ( 'mobile' === $devices ) : ?>
			@media (min-width: 769px) { .ncb-frontend-container { display: none !important; } }
		<?php endif; ?>
		.ncb-btn {
			position: relative;
			width: <?php echo $size; ?>px;
			height: <?php echo $size; ?>px;
			border-radius: <?php echo $radius; ?>;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff !important;
			text-decoration: none !important;
			box-shadow: 0 4px 14px rgba(0,0,0,0.25);
			border: 2.5px solid #fff;
			transition: transform 0.2s ease;
		}
		.ncb-btn:hover { transform: scale(1.08); color: #fff !important; }
		.ncb-btn-tooltip {
			position: absolute;
			<?php echo $is_left ? 'left: calc(100% + 12px); right: auto;' : 'right: calc(100% + 12px); left: auto;'; ?>
			top: 50%;
			transform: translateY(-50%);
			background: rgba(15,23,42,0.92);
			color: #fff;
			padding: 5px 12px;
			border-radius: 9999px;
			font-size: 12px;
			font-weight: 600;
			white-space: nowrap;
			opacity: 0;
			pointer-events: none;
			transition: opacity 0.2s;
			box-shadow: 0 4px 12px rgba(0,0,0,0.25);
		}
		.ncb-btn:hover .ncb-btn-tooltip { opacity: 1; }
		.ncb-scroll-top {
			background: <?php echo esc_attr( $main_color ); ?>;
			width: <?php echo max( 36, round( $size * 0.85 ) ); ?>px;
			height: <?php echo max( 36, round( $size * 0.85 ) ); ?>px;
			border-radius: <?php echo $radius; ?>;
			display: none;
			align-items: center;
			justify-content: center;
			color: #fff;
			cursor: pointer;
			border: 2px solid #fff;
			box-shadow: 0 4px 12px rgba(0,0,0,0.25);
			font-size: 14px;
			font-weight: bold;
		}
	</style>
	<div class="ncb-frontend-container" id="ncb-widget" style="<?php echo ( $delay > 0 ) ? 'display:none;' : ''; ?>">
		<?php foreach ( $buttons as $b ) : ?>
			<a href="<?php echo esc_url( $b['href'] ); ?>" class="ncb-btn" style="background: <?php echo esc_attr( $b['color'] ); ?>;" <?php echo $b['openNewTab'] ? 'target="_blank" rel="noopener"' : ''; ?> title="<?php echo esc_attr( $b['label'] . ': ' . $b['value'] ); ?>">
				<?php if ( $tooltip ) : ?>
					<span class="ncb-btn-tooltip"><?php echo esc_html( $b['label'] . ': ' . $b['value'] ); ?></span>
				<?php endif; ?>
				<span style="font-size: <?php echo max( 16, round( $size * 0.44 ) ); ?>px; font-weight: bold; line-height: 1;">
					<?php
					switch ( $b['type'] ) {
						case 'phone': echo '📞'; break;
						case 'zalo': echo '💬'; break;
						case 'messenger': echo '⚡'; break;
						case 'email': echo '✉️'; break;
						case 'sms': echo '📱'; break;
						case 'map': echo '📍'; break;
						case 'telegram': echo '✈️'; break;
						case 'whatsapp': echo '🟢'; break;
						default: echo '🔗'; break;
					}
					?>
				</span>
			</a>
		<?php endforeach; ?>
		<?php if ( $scroll_top ) : ?>
			<div class="ncb-scroll-top" id="ncb-scroll-top" title="Lên đầu trang" onclick="window.scrollTo({top:0,behavior:'smooth'});">▲</div>
		<?php endif; ?>
	</div>
	<script>
		(function(){
			<?php if ( $delay > 0 ) : ?>
			setTimeout(function(){
				var w = document.getElementById('ncb-widget');
				if (w) w.style.display = 'flex';
			}, <?php echo $delay * 1000; ?>);
			<?php endif; ?>
			<?php if ( $scroll_top ) : ?>
			window.addEventListener('scroll', function(){
				var st = document.getElementById('ncb-scroll-top');
				if (st) {
					st.style.display = (window.pageYOffset > 220) ? 'flex' : 'none';
				}
			});
			<?php endif; ?>
		})();
	</script>
	<?php
}

/* -------------------------------------------------------------------------
 * INTEGRATION: BÁO GIÁ CẤU HÌNH PC & CONTACT FORM 7 (CF7)
 * ---------------------------------------------------------------------- */
if ( file_exists( __DIR__ . '/pchub-pc-quote.php' ) ) {
	require_once __DIR__ . '/pchub-pc-quote.php';
} else {
	// Fallback inline definition if pchub-pc-quote.php is not present
	if ( ! defined( 'PCHUB_QUOTE_POST_TYPE' ) ) {
		define( 'PCHUB_QUOTE_POST_TYPE', 'pchub_quote' );
	}

	add_action( 'init', function () {
		if ( post_type_exists( PCHUB_QUOTE_POST_TYPE ) ) return;
		$labels = array(
			'name'               => 'Báo giá PC',
			'singular_name'      => 'Phiếu báo giá',
			'menu_name'          => 'Báo giá PC',
			'all_items'          => 'Tất cả phiếu báo giá',
			'add_new'            => 'Tạo phiếu mới',
			'edit_item'          => 'Chi tiết phiếu báo giá',
			'not_found'          => 'Chưa có yêu cầu báo giá nào.',
		);
		register_post_type( PCHUB_QUOTE_POST_TYPE, array(
			'labels'          => $labels,
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'menu_icon'       => 'dashicons-desktop',
			'menu_position'   => 26,
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
		) );
	} );

	// Tự động bắt từ CF7
	add_action( 'wpcf7_mail_sent', 'ncb_capture_cf7_quote' );
	add_action( 'wpcf7_before_send_mail', 'ncb_capture_cf7_quote' );
	function ncb_capture_cf7_quote( $contact_form ) {
		static $run = false;
		if ( $run ) return;
		$run = true;
		$submission = class_exists( 'WPCF7_Submission' ) ? WPCF7_Submission::get_instance() : null;
		if ( ! $submission ) return;
		$data = $submission->get_posted_data();
		if ( empty( $data ) ) return;
		$name    = $data['your-name'] ?? $data['name'] ?? 'Khách CF7';
		$phone   = $data['your-tel'] ?? $data['phone'] ?? '';
		$email   = $data['your-email'] ?? $data['email'] ?? '';
		$message = $data['your-message'] ?? $data['message'] ?? '';
		$ticket  = 'BG-' . gmdate('Y') . '-' . wp_rand(1000, 9999);
		$pid     = wp_insert_post( array(
			'post_type'    => PCHUB_QUOTE_POST_TYPE,
			'post_title'   => "[$ticket] $name - $phone",
			'post_content' => $message,
			'post_status'  => 'publish',
		) );
		if ( $pid && ! is_wp_error( $pid ) ) {
			update_post_meta( $pid, '_pchub_ticket_id', $ticket );
			update_post_meta( $pid, '_pchub_name', sanitize_text_field( $name ) );
			update_post_meta( $pid, '_pchub_phone', sanitize_text_field( $phone ) );
			update_post_meta( $pid, '_pchub_email', sanitize_email( $email ) );
			update_post_meta( $pid, '_pchub_status', 'new' );
			update_post_meta( $pid, '_pchub_source', 'Contact Form 7' );
		}
	}

	// REST API endpoint cho Next.js
	add_action( 'rest_api_init', function () {
		register_rest_route( 'pchub/v1', '/quote', array(
			'methods'             => 'POST',
			'callback'            => function ( $request ) {
				$p       = $request->get_json_params() ?: $request->get_params();
				$name    = sanitize_text_field( $p['name'] ?? '' );
				$phone   = sanitize_text_field( $p['phone'] ?? '' );
				$ticket  = sanitize_text_field( $p['ticketId'] ?? ( 'BG-' . gmdate('Y') . '-' . wp_rand(1000, 9999) ) );
				if ( ! $name || ! $phone ) {
					return new WP_REST_Response( array( 'success' => false, 'message' => 'Thiếu họ tên hoặc SĐT' ), 400 );
				}
				$pid = wp_insert_post( array(
					'post_type'    => PCHUB_QUOTE_POST_TYPE,
					'post_title'   => "[$ticket] $name - $phone",
					'post_content' => sanitize_textarea_field( $p['components'] ?? $p['message'] ?? '' ),
					'post_status'  => 'publish',
				) );
				if ( is_wp_error( $pid ) ) {
					return new WP_REST_Response( array( 'success' => false ), 500 );
				}
				update_post_meta( $pid, '_pchub_ticket_id', $ticket );
				update_post_meta( $pid, '_pchub_name', $name );
				update_post_meta( $pid, '_pchub_phone', $phone );
				update_post_meta( $pid, '_pchub_email', sanitize_email( $p['email'] ?? '' ) );
				update_post_meta( $pid, '_pchub_budget', sanitize_text_field( $p['budget'] ?? '' ) );
				update_post_meta( $pid, '_pchub_status', 'new' );
				update_post_meta( $pid, '_pchub_source', 'Website Next.js' );
				return new WP_REST_Response( array( 'success' => true, 'ticket_id' => $ticket, 'post_id' => $pid ), 200 );
			},
			'permission_callback' => '__return_true',
		) );
	} );
}

