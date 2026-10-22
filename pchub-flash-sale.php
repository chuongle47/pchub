<?php
/**
 * Plugin Name: PCHub - Flash Sale Manager
 * Description: Quản lý chương trình Flash Sale cho sản phẩm WooCommerce. Hỗ trợ tìm kiếm & chọn nhiều sản phẩm, đặt giảm giá theo % hoặc giá cố định, hẹn giờ tự động bật/tắt, và cung cấp REST API cho website Next.js.
 * Version: 2.0.0
 * Author: PCHub Team
 * Text Domain: pchub-flash
 * Requires Plugins: woocommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class PCHub_Flash_Sale_Manager {

	const NONCE_ACTION = 'pchub_fs_admin_nonce';
	const MENU_SLUG    = 'pchub-flash-sale';

	public function __construct() {
		add_action( 'plugins_loaded', array( $this, 'check_dependencies' ) );
		add_action( 'admin_menu', array( $this, 'register_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );

		// Form actions
		add_action( 'admin_post_pchub_fs_save', array( $this, 'handle_save' ) );
		add_action( 'wp_ajax_pchub_fs_search_products', array( $this, 'ajax_search_products' ) );
		add_action( 'wp_ajax_pchub_fs_remove_sale', array( $this, 'ajax_remove_sale' ) );
		add_action( 'wp_ajax_pchub_fs_end_sale', array( $this, 'ajax_end_sale' ) );

		// Scheduled sales hook verification
		add_action( 'init', array( $this, 'ensure_scheduled_sales_hook' ) );

		// REST API for Next.js Frontend
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	public function check_dependencies() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			add_action( 'admin_notices', function () {
				echo '<div class="notice notice-error"><p><strong>PCHub Flash Sale:</strong> Cần kích hoạt plugin WooCommerce để sử dụng chức năng này.</p></div>';
			} );
		}
	}

	public function ensure_scheduled_sales_hook() {
		if ( function_exists( 'WC' ) && ! wp_next_scheduled( 'wc_scheduled_sales' ) ) {
			wp_schedule_event( time(), 'hourly', 'wc_scheduled_sales' );
		}
	}

	public function register_admin_menu() {
		// Top level menu
		add_menu_page(
			'Flash Sale',
			'Flash Sale',
			'manage_woocommerce',
			self::MENU_SLUG,
			array( $this, 'render_admin_page' ),
			'dashicons-clock',
			57
		);

		// Also register submenu under WooCommerce for easy discovery
		add_submenu_page(
			'woocommerce',
			'Flash Sale',
			'Flash Sale',
			'manage_woocommerce',
			self::MENU_SLUG,
			array( $this, 'render_admin_page' )
		);
	}

	public function enqueue_admin_assets( $hook ) {
		if ( false === strpos( $hook, self::MENU_SLUG ) ) {
			return;
		}
		wp_enqueue_script( 'jquery' );
	}

	/* =========================================================================
	 * AJAX: TÌM KIẾM SẢN PHẨM (TÊN, SKU, ID, HOẶC MẶC ĐỊNH SẢN PHẨM MỚI NHẤT)
	 * ====================================================================== */
	public function ajax_search_products() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'Không đủ quyền truy cập.' ), 403 );
		}

		$term = isset( $_GET['term'] ) ? trim( sanitize_text_field( wp_unslash( $_GET['term'] ) ) ) : '';
		$ids  = array();

		// 1. Kiểm tra nếu term là số (Product ID)
		if ( is_numeric( $term ) && (int) $term > 0 ) {
			$p = wc_get_product( (int) $term );
			if ( $p && 'publish' === $p->get_status() ) {
				$ids[] = (int) $term;
			}
		}

		// 2. Tìm theo SKU
		if ( '' !== $term && function_exists( 'wc_get_product_id_by_sku' ) ) {
			$by_sku = (int) wc_get_product_id_by_sku( $term );
			if ( $by_sku ) {
				$ids[] = $by_sku;
			}
		}

		// 3. Tìm qua WP_Query
		$query_args = array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => '' !== $term ? 25 : 15,
			'no_found_rows'  => true,
			'fields'         => 'ids',
		);

		if ( '' !== $term ) {
			$query_args['s'] = $term;
		} else {
			$query_args['orderby'] = 'date';
			$query_args['order']   = 'DESC';
		}

		$q = new WP_Query( $query_args );
		$ids = array_values( array_unique( array_merge( $ids, $q->posts ) ) );

		$results = array();
		foreach ( $ids as $pid ) {
			$product = wc_get_product( $pid );
			if ( ! $product || 'publish' !== $product->get_status() ) {
				continue;
			}

			$regular = (float) $product->get_regular_price();
			$sale    = (float) $product->get_sale_price();
			$img_id  = $product->get_image_id();
			$thumb   = $img_id ? wp_get_attachment_image_url( $img_id, 'thumbnail' ) : wc_placeholder_img_src();

			// Lấy danh mục sản phẩm
			$cats = wc_get_product_category_list( $pid );
			$cat_text = wp_strip_all_tags( $cats );

			$results[] = array(
				'id'            => $product->get_id(),
				'name'          => $product->get_name(),
				'sku'           => $product->get_sku() ? $product->get_sku() : '—',
				'regular_price' => $regular,
				'sale_price'    => $sale,
				'price_html'    => wc_price( $regular ),
				'thumb'         => $thumb,
				'in_stock'      => $product->is_in_stock(),
				'stock_status'  => $product->is_in_stock() ? 'Còn hàng' : 'Hết hàng',
				'category'      => $cat_text,
			);
		}

		wp_send_json_success( $results );
	}

	/* =========================================================================
	 * AJAX: HỦY / KẾT THÚC FLASH SALE CHO SẢN PHẨM
	 * ====================================================================== */
	public function ajax_remove_sale() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'Không đủ quyền.' ), 403 );
		}

		$pid = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$p   = wc_get_product( $pid );
		if ( ! $p ) {
			wp_send_json_error( array( 'message' => 'Không tìm thấy sản phẩm.' ) );
		}

		$p->set_sale_price( '' );
		$p->set_date_on_sale_from( '' );
		$p->set_date_on_sale_to( '' );
		$p->delete_meta_data( '_pchub_is_flash_sale' );
		$p->delete_meta_data( '_pchub_fs_discount_type' );
		$p->delete_meta_data( '_pchub_fs_discount_value' );
		$p->save();

		if ( function_exists( 'wc_scheduled_sales' ) ) {
			wc_scheduled_sales();
		}

		wp_send_json_success( array( 'message' => 'Đã hủy Flash Sale cho sản phẩm thành công.' ) );
	}

	public function ajax_end_sale() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'Không đủ quyền.' ), 403 );
		}

		$pid = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$p   = wc_get_product( $pid );
		if ( ! $p ) {
			wp_send_json_error( array( 'message' => 'Không tìm thấy sản phẩm.' ) );
		}

		// Đặt giờ kết thúc là thời điểm hiện tại - 1 giây để hết hạn ngay lập tức
		$past_ts = time() - 1;
		$p->set_date_on_sale_to( gmdate( 'Y-m-d H:i:s', $past_ts ) );
		$p->save();

		if ( function_exists( 'wc_scheduled_sales' ) ) {
			wc_scheduled_sales();
		}

		wp_send_json_success( array( 'message' => 'Đã kết thúc Flash Sale cho sản phẩm này.' ) );
	}

	/* =========================================================================
	 * LƯU CẤU HÌNH FLASH SALE MỚI CHO CÁC SẢN PHẨM ĐÃ CHỌN
	 * ====================================================================== */
	public function handle_save() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'Không đủ quyền thực hiện thao tác.' );
		}
		check_admin_referer( self::NONCE_ACTION );

		$redirect_url = admin_url( 'admin.php?page=' . self::MENU_SLUG );

		$raw_ids = isset( $_POST['product_ids'] ) ? sanitize_text_field( wp_unslash( $_POST['product_ids'] ) ) : '';
		$pids    = array_filter( array_map( 'absint', explode( ',', $raw_ids ) ) );

		$discount_type  = isset( $_POST['discount_type'] ) ? sanitize_text_field( wp_unslash( $_POST['discount_type'] ) ) : 'percent';
		$discount_value = isset( $_POST['discount_value'] ) ? floatval( $_POST['discount_value'] ) : 0;
		$date_from_raw  = isset( $_POST['date_from'] ) ? sanitize_text_field( wp_unslash( $_POST['date_from'] ) ) : '';
		$date_to_raw    = isset( $_POST['date_to'] ) ? sanitize_text_field( wp_unslash( $_POST['date_to'] ) ) : '';

		if ( empty( $pids ) || empty( $date_from_raw ) || empty( $date_to_raw ) || $discount_value <= 0 ) {
			wp_safe_redirect( add_query_arg( 'pchub_fs_error', 'missing_fields', $redirect_url ) );
			exit;
		}

		// Convert local datetime to UTC timestamps using site timezone
		try {
			$tz   = wp_timezone();
			$df   = new DateTime( str_replace( 'T', ' ', $date_from_raw ), $tz );
			$dt   = new DateTime( str_replace( 'T', ' ', $date_to_raw ), $tz );
			$from = $df->getTimestamp();
			$to   = $dt->getTimestamp();
		} catch ( Exception $e ) {
			$from = strtotime( $date_from_raw );
			$to   = strtotime( $date_to_raw );
		}

		if ( ! $from || ! $to || $to <= $from ) {
			wp_safe_redirect( add_query_arg( 'pchub_fs_error', 'invalid_dates', $redirect_url ) );
			exit;
		}

		$updated = 0;
		foreach ( $pids as $pid ) {
			$product = wc_get_product( $pid );
			if ( ! $product ) {
				continue;
			}

			$regular = floatval( $product->get_regular_price() );
			if ( $regular <= 0 ) {
				continue;
			}

			$sale_price = 0;
			if ( 'percent' === $discount_type ) {
				$pct        = min( 99, max( 1, $discount_value ) );
				$sale_price = $regular * ( 1 - ( $pct / 100 ) );
			} elseif ( 'amount' === $discount_type ) {
				$sale_price = max( 1000, $regular - $discount_value );
			} else { // fixed
				$sale_price = $discount_value;
			}

			// Làm tròn số tiền đến hàng nghìn đồng
			$sale_price = round( $sale_price / 1000 ) * 1000;
			if ( $sale_price >= $regular || $sale_price <= 0 ) {
				continue;
			}

			$product->set_sale_price( (string) $sale_price );
			$product->set_date_on_sale_from( gmdate( 'Y-m-d H:i:s', $from ) );
			$product->set_date_on_sale_to( gmdate( 'Y-m-d H:i:s', $to ) );
			$product->update_meta_data( '_pchub_is_flash_sale', '1' );
			$product->update_meta_data( '_pchub_fs_discount_type', $discount_type );
			$product->update_meta_data( '_pchub_fs_discount_value', $discount_value );
			$product->save();
			$updated++;
		}

		// Kích hoạt ngay lập tức bộ kiểm tra giá sale của WooCommerce
		if ( function_exists( 'wc_scheduled_sales' ) ) {
			wc_scheduled_sales();
		}

		wp_safe_redirect( add_query_arg( 'pchub_fs_success', $updated, $redirect_url ) );
		exit;
	}

	/* =========================================================================
	 * REST API ENDPOINT CHO NEXT.JS FRONTEND
	 * ====================================================================== */
	public function register_rest_routes() {
		register_rest_route( 'pchub/v1', '/flash-sale', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'rest_get_flash_sale' ),
			'permission_callback' => '__return_true',
		) );
	}

	public function rest_get_flash_sale() {
		$now   = time();
		$items = $this->get_flash_sale_products_data();

		$active_products = array();
		$upcoming_products = array();

		foreach ( $items as $it ) {
			if ( 'active' === $it['status'] ) {
				$active_products[] = $it;
			} elseif ( 'upcoming' === $it['status'] ) {
				$upcoming_products[] = $it;
			}
		}

		// Xác định thời gian kết thúc của phiên gần nhất
		$current_end = 0;
		if ( ! empty( $active_products ) ) {
			$ends = array_column( $active_products, 'end_ts' );
			$current_end = min( $ends );
		}

		return rest_ensure_response( array(
			'success'           => true,
			'server_time'       => $now,
			'server_time_iso'   => wp_date( 'c', $now ),
			'timezone'          => wp_timezone_string(),
			'has_active'        => ! empty( $active_products ),
			'seconds_left'      => $current_end > $now ? ( $current_end - $now ) : 0,
			'active_end_time'   => $current_end ? wp_date( 'c', $current_end ) : null,
			'products'          => ! empty( $active_products ) ? $active_products : $upcoming_products,
			'active_products'   => $active_products,
			'upcoming_products' => $upcoming_products,
		) );
	}

	private function get_flash_sale_products_data() {
		$query = new WP_Query( array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
			'meta_query'     => array(
				array(
					'key'     => '_sale_price_dates_from',
					'value'   => '',
					'compare' => '!=',
				),
				array(
					'key'     => '_sale_price',
					'value'   => '',
					'compare' => '!=',
				),
			),
		) );

		$now   = time();
		$items = array();

		foreach ( $query->posts as $post ) {
			$product = wc_get_product( $post->ID );
			if ( ! $product ) {
				continue;
			}

			$from = $product->get_date_on_sale_from();
			$to   = $product->get_date_on_sale_to();
			if ( ! $from || ! $to ) {
				continue;
			}

			$from_ts = $from->getTimestamp();
			$to_ts   = $to->getTimestamp();

			if ( $now < $from_ts ) {
				$status       = 'upcoming';
				$status_label = 'Sắp diễn ra';
				$status_color = '#2563eb';
				$status_bg    = '#dbeafe';
			} elseif ( $now >= $from_ts && $now < $to_ts ) {
				$status       = 'active';
				$status_label = 'Đang diễn ra';
				$status_color = '#16a34a';
				$status_bg    = '#dcfce7';
			} else {
				$status       = 'ended';
				$status_label = 'Đã kết thúc';
				$status_color = '#64748b';
				$status_bg    = '#f1f5f9';
			}

			$regular = floatval( $product->get_regular_price() );
			$sale    = floatval( $product->get_sale_price() );
			$pct     = $regular > 0 && $sale < $regular ? round( ( $regular - $sale ) / $regular * 100 ) : 0;

			$img_id = $product->get_image_id();
			$thumb  = $img_id ? wp_get_attachment_image_url( $img_id, 'medium' ) : wc_placeholder_img_src();

			$cats = function_exists( 'wc_get_product_category_list' ) ? wc_get_product_category_list( $product->get_id() ) : '';
			$cat_text = $cats ? wp_strip_all_tags( $cats ) : '';

			$items[] = array(
				'id'                      => $product->get_id(),
				'name'                    => $product->get_name(),
				'slug'                    => $product->get_slug(),
				'sku'                     => $product->get_sku() ? $product->get_sku() : '—',
				'image'                   => $thumb,
				'category'                => $cat_text,
				'regular_price'           => $regular,
				'sale_price'              => $sale,
				'formatted_regular_price' => wc_price( $regular ),
				'formatted_sale_price'    => wc_price( $sale ),
				'discount_percent'        => $pct,
				'start_ts'                => $from_ts,
				'end_ts'                  => $to_ts,
				'start_formatted'         => wp_date( 'd/m/Y H:i', $from_ts ),
				'end_formatted'           => wp_date( 'd/m/Y H:i', $to_ts ),
				'status'                  => $status,
				'status_label'            => $status_label,
				'status_color'            => $status_color,
				'status_bg'               => $status_bg,
				'in_stock'                => $product->is_in_stock(),
				'stock_quantity'          => $product->get_stock_quantity(),
			);
		}

		return $items;
	}

	/* =========================================================================
	 * GIAO DIỆN QUẢN TRỊ HIỆN ĐẠI (ADMIN PAGE)
	 * ====================================================================== */
	public function render_admin_page() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		$products  = $this->get_flash_sale_products_data();
		$nonce     = wp_create_nonce( self::NONCE_ACTION );
		$ajax_url  = admin_url( 'admin-ajax.php' );
		$now_local = wp_date( 'Y-m-d\TH:i' );
		$default_end = wp_date( 'Y-m-d\TH:i', time() + 2 * HOUR_IN_SECONDS );
		?>
		<div class="wrap pchub-fs-app">
			<style>
				.pchub-fs-app { max-width: 1240px; margin: 20px auto 40px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; }
				.pchub-fs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
				.pchub-fs-header h1 { font-size: 26px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
				.pchub-fs-badge { background: #fee2e2; color: #dc2626; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; }

				.pchub-fs-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04); padding: 26px; margin-bottom: 30px; }
				.pchub-fs-card h2 { margin: 0 0 18px 0; font-size: 18px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
				
				.pchub-fs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 20px; }
				.pchub-fs-col-full { grid-column: 1 / -1; }

				.pchub-fs-field label { display: block; font-weight: 600; font-size: 13.5px; color: #334155; margin-bottom: 8px; }
				.pchub-fs-field .desc { font-size: 12px; color: #64748b; margin-top: 5px; }

				.pchub-fs-field input[type="text"],
				.pchub-fs-field input[type="number"],
				.pchub-fs-field input[type="datetime-local"],
				.pchub-fs-field select {
					width: 100% !important;
					max-width: 100% !important;
					height: 42px !important;
					line-height: 42px !important;
					border: 1.5px solid #cbd5e1 !important;
					border-radius: 8px !important;
					padding: 0 14px !important;
					font-size: 14px !important;
					background: #ffffff !important;
					color: #0f172a !important;
					box-sizing: border-box !important;
					transition: all 0.2s ease !important;
				}
				.pchub-fs-field input:focus, .pchub-fs-field select:focus {
					border-color: #2563eb !important;
					box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
					outline: none !important;
				}

				/* Search Bar & Dropdown */
				.pchub-fs-search-wrap { position: relative; width: 100%; }
				.pchub-fs-search-box { position: relative; display: flex; align-items: center; }
				.pchub-fs-search-icon { position: absolute; left: 14px; color: #94a3b8; pointer-events: none; }
				.pchub-fs-search-box input { padding-left: 40px !important; }
				
				#pchub-fs-dropdown {
					position: absolute;
					top: calc(100% + 6px);
					left: 0;
					right: 0;
					background: #ffffff;
					border: 1.5px solid #cbd5e1;
					border-radius: 10px;
					box-shadow: 0 12px 32px rgba(15, 23, 42, 0.15);
					max-height: 340px;
					overflow-y: auto;
					z-index: 10000;
					display: none;
				}
				.pchub-fs-drop-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12px;
					padding: 10px 14px;
					cursor: pointer;
					border-bottom: 1px solid #f1f5f9;
					transition: background 0.15s ease;
				}
				.pchub-fs-drop-item:hover { background: #eff6ff; }
				.pchub-fs-drop-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
				.pchub-fs-drop-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0; flex-shrink: 0; }
				.pchub-fs-drop-info { min-width: 0; }
				.pchub-fs-drop-name { font-weight: 600; font-size: 13.5px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				.pchub-fs-drop-meta { font-size: 12px; color: #64748b; display: flex; gap: 8px; align-items: center; margin-top: 2px; }
				.pchub-fs-drop-price { font-weight: 700; color: #dc2626; font-size: 14px; white-space: nowrap; }

				/* Selected Products List Container */
				#pchub-fs-selected-wrap { margin-top: 14px; }
				.pchub-fs-selected-title { font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
				.pchub-fs-selected-list { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; padding-right: 4px; }
				.pchub-fs-selected-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					background: #f8fafc;
					border: 1px solid #e2e8f0;
					border-radius: 8px;
					padding: 8px 14px;
					transition: border-color 0.2s ease;
				}
				.pchub-fs-selected-item:hover { border-color: #cbd5e1; background: #f1f5f9; }
				.pchub-fs-remove-chip {
					color: #ef4444;
					background: #fee2e2;
					border: none;
					border-radius: 6px;
					padding: 4px 10px;
					font-size: 12px;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.2s ease;
				}
				.pchub-fs-remove-chip:hover { background: #dc2626; color: #ffffff; }

				/* Quick Pills */
				.pchub-fs-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
				.pchub-fs-pill {
					background: #f1f5f9;
					border: 1px solid #cbd5e1;
					color: #334155;
					border-radius: 6px;
					padding: 5px 12px;
					font-size: 12.5px;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.15s ease;
				}
				.pchub-fs-pill:hover { background: #2563eb; color: #ffffff; border-color: #2563eb; }

				/* Action Button */
				.pchub-fs-submit-btn {
					background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
					color: #ffffff !important;
					border: none !important;
					border-radius: 8px !important;
					padding: 12px 28px !important;
					font-size: 15px !important;
					font-weight: 700 !important;
					cursor: pointer !important;
					box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35) !important;
					transition: all 0.2s ease !important;
					display: inline-flex !important;
					align-items: center !important;
					gap: 8px !important;
				}
				.pchub-fs-submit-btn:hover {
					background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
					transform: translateY(-1px) !important;
					box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45) !important;
				}

				/* Table Styling */
				.pchub-fs-table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
				.pchub-fs-table th { background: #f8fafc; color: #475569; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 16px; border-bottom: 1.5px solid #e2e8f0; text-align: left; }
				.pchub-fs-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #1e293b; font-size: 13.5px; }
				.pchub-fs-table tr:last-child td { border-bottom: none; }
				.pchub-fs-table tr:hover td { background: #f8fafc; }

				.pchub-fs-status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
				.pchub-fs-dot { width: 7px; height: 7px; border-radius: 50%; }
				.pchub-fs-dot.active { background: #16a34a; animation: pulseDot 1.5s infinite; }
				@keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } }

				.pchub-fs-action-link {
					color: #dc2626;
					font-weight: 600;
					text-decoration: none;
					padding: 4px 8px;
					border-radius: 4px;
					transition: background 0.15s ease;
					display: inline-block;
				}
				.pchub-fs-action-link:hover { background: #fee2e2; color: #b91c1c; }
				.pchub-fs-end-link { color: #2563eb; }
				.pchub-fs-end-link:hover { background: #dbeafe; color: #1d4ed8; }
			</style>

			<!-- Header -->
			<div class="pchub-fs-header">
				<div>
					<h1>⚡ Quản lý Flash Sale WooCommerce</h1>
					<p style="color:#64748b;margin:4px 0 0">Thiết lập giá sale theo khung giờ, tự động kích hoạt và kết thúc đúng giờ theo thời gian thực.</p>
				</div>
				<div>
					<span class="pchub-fs-badge">PCHub Live Sync</span>
				</div>
			</div>

			<!-- Notices -->
			<?php if ( isset( $_GET['pchub_fs_success'] ) ) : ?>
				<div class="notice notice-success is-dismissible" style="border-left-color:#16a34a;border-radius:6px;">
					<p style="font-size:14px;"><strong>Thành công!</strong> Đã thiết lập Flash Sale thành công cho <strong><?php echo esc_html( absint( $_GET['pchub_fs_success'] ) ); ?></strong> sản phẩm.</p>
				</div>
			<?php elseif ( isset( $_GET['pchub_fs_error'] ) ) : ?>
				<div class="notice notice-error is-dismissible" style="border-radius:6px;">
					<p style="font-size:14px;">
						<?php
						$err = sanitize_text_field( wp_unslash( $_GET['pchub_fs_error'] ) );
						if ( 'missing_fields' === $err ) {
							echo '<strong>Lỗi:</strong> Vui lòng chọn ít nhất một sản phẩm và nhập đầy đủ mức giảm giá, thời gian bắt đầu / kết thúc.';
						} else {
							echo '<strong>Lỗi:</strong> Thời gian kết thúc phải lớn hơn thời gian bắt đầu.';
						}
						?>
					</p>
				</div>
			<?php endif; ?>

			<!-- Form Card -->
			<div class="pchub-fs-card">
				<h2>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
					Tạo Flash Sale mới
				</h2>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" id="pchub-fs-form">
					<input type="hidden" name="action" value="pchub_fs_save">
					<?php wp_nonce_field( self::NONCE_ACTION ); ?>
					<input type="hidden" name="product_ids" id="pchub-fs-product-ids" value="">

					<!-- Product Search & Selector -->
					<div class="pchub-fs-col-full" style="margin-bottom: 20px;">
						<div class="pchub-fs-field">
							<label for="pchub-fs-search-input">Tìm và chọn sản phẩm chạy Flash Sale</label>
							<div class="pchub-fs-search-wrap">
								<div class="pchub-fs-search-box">
									<span class="pchub-fs-search-icon">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
									</span>
									<input type="text" id="pchub-fs-search-input" placeholder="Nhập tên sản phẩm, mã SKU hoặc ID sản phẩm (click để xem danh sách)..." autocomplete="off">
								</div>
								<div id="pchub-fs-dropdown"></div>
							</div>
							<p class="desc">Bạn có thể chọn nhiều sản phẩm cùng lúc để áp dụng chung một khung giờ và mức giảm giá.</p>
						</div>

						<!-- Selected items list -->
						<div id="pchub-fs-selected-wrap" style="display:none;">
							<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
								<span class="pchub-fs-selected-title">Danh sách sản phẩm đã chọn (<span id="pchub-fs-selected-count">0</span>)</span>
								<button type="button" class="button button-link-delete" id="pchub-fs-clear-all" style="font-size:12px;">Xóa tất cả</button>
							</div>
							<div class="pchub-fs-selected-list" id="pchub-fs-selected-list"></div>
						</div>
					</div>

					<!-- Discount Settings -->
					<div class="pchub-fs-grid">
						<div class="pchub-fs-field">
							<label for="pchub-fs-discount-type">Kiểu giảm giá</label>
							<select name="discount_type" id="pchub-fs-discount-type">
								<option value="percent">Giảm theo % trên giá gốc</option>
								<option value="amount">Giảm số tiền cố định (₫)</option>
								<option value="fixed">Đồng giá Flash Sale (₫)</option>
							</select>
						</div>

						<div class="pchub-fs-field">
							<label id="pchub-fs-discount-label" for="pchub-fs-discount-value">Phần trăm giảm (%)</label>
							<input type="number" step="any" min="0" name="discount_value" id="pchub-fs-discount-value" placeholder="VD: 20" required>
							<div class="pchub-fs-pills" id="pchub-fs-pct-pills">
								<button type="button" class="pchub-fs-pill" data-pct="10">-10%</button>
								<button type="button" class="pchub-fs-pill" data-pct="15">-15%</button>
								<button type="button" class="pchub-fs-pill" data-pct="20">-20%</button>
								<button type="button" class="pchub-fs-pill" data-pct="30">-30%</button>
								<button type="button" class="pchub-fs-pill" data-pct="50">-50%</button>
							</div>
						</div>
					</div>

					<!-- Schedule Settings -->
					<div class="pchub-fs-grid">
						<div class="pchub-fs-field">
							<label for="pchub-fs-date-from">Thời gian bắt đầu</label>
							<input type="datetime-local" name="date_from" id="pchub-fs-date-from" value="<?php echo esc_attr( $now_local ); ?>" required>
						</div>

						<div class="pchub-fs-field">
							<label for="pchub-fs-date-to">Thời gian kết thúc</label>
							<input type="datetime-local" name="date_to" id="pchub-fs-date-to" value="<?php echo esc_attr( $default_end ); ?>" required>
							<div class="pchub-fs-pills" id="pchub-fs-time-pills">
								<button type="button" class="pchub-fs-pill" data-hours="2">+2 giờ</button>
								<button type="button" class="pchub-fs-pill" data-hours="4">+4 giờ</button>
								<button type="button" class="pchub-fs-pill" data-hours="8">+8 giờ</button>
								<button type="button" class="pchub-fs-pill" data-hours="24">+24 giờ</button>
								<button type="button" class="pchub-fs-pill" data-hours="72">3 ngày</button>
								<button type="button" class="pchub-fs-pill" data-hours="168">7 ngày</button>
							</div>
						</div>
					</div>

					<p style="margin:20px 0;font-size:13px;color:#64748b;line-height:1.5;">
						ℹ️ Giá sale sẽ tự động bật khi đến giờ bắt đầu và tự động trở về giá gốc khi hết giờ (WooCommerce kiểm tra định kỳ mỗi giờ, hoặc cập nhật ngay khi khách hàng mở trang sản phẩm).
					</p>

					<div>
						<button type="submit" class="pchub-fs-submit-btn">
							<span>⚡</span> Áp dụng Flash Sale
						</button>
					</div>
				</form>
			</div>

			<!-- Active / Scheduled Flash Sale Table -->
			<div class="pchub-fs-card">
				<h2>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
					Sản phẩm đang trong chương trình Flash Sale (<?php echo count( $products ); ?>)
				</h2>

				<?php if ( empty( $products ) ) : ?>
					<div style="text-align:center;padding:36px;color:#64748b;background:#f8fafc;border-radius:8px;">
						<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
						<p style="margin:0;font-size:14.5px;font-weight:600;">Chưa có sản phẩm nào được đặt lịch Flash Sale.</p>
						<p style="margin:4px 0 0;font-size:13px;">Hãy chọn sản phẩm ở khung phía trên và bấm "Áp dụng Flash Sale" để bắt đầu.</p>
					</div>
				<?php else : ?>
					<div style="overflow-x:auto;">
						<table class="pchub-fs-table">
							<thead>
								<tr>
									<th style="width:40px;">Ảnh</th>
									<th>Sản phẩm</th>
									<th style="width:120px;">Mã SKU</th>
									<th style="width:120px;">Giá gốc</th>
									<th style="width:150px;">Giá Flash Sale</th>
									<th style="width:160px;">Khung giờ</th>
									<th style="width:130px;">Trạng thái</th>
									<th style="width:160px;text-align:right;">Hành động</th>
								</tr>
							</thead>
							<tbody>
								<?php foreach ( $products as $p ) : ?>
									<tr id="pchub-fs-row-<?php echo esc_attr( $p['id'] ); ?>">
										<td>
											<img src="<?php echo esc_url( $p['image'] ); ?>" alt="" style="width:40px;height:40px;border-radius:6px;object-fit:cover;border:1px solid #e2e8f0;display:block;">
										</td>
										<td>
											<a href="<?php echo esc_url( get_edit_post_link( $p['id'] ) ); ?>" style="font-weight:600;color:#0f172a;text-decoration:none;" target="_blank">
												<?php echo esc_html( $p['name'] ); ?> ↗
											</a>
										</td>
										<td style="color:#64748b;font-family:monospace;"><?php echo esc_html( $p['sku'] ); ?></td>
										<td style="text-decoration:line-through;color:#64748b;"><?php echo esc_html( number_format( $p['regular_price'], 0, ',', '.' ) . ' ₫' ); ?></td>
										<td>
											<strong style="color:#dc2626;font-size:15px;"><?php echo esc_html( number_format( $p['sale_price'], 0, ',', '.' ) . ' ₫' ); ?></strong>
											<?php if ( $p['discount_percent'] > 0 ) : ?>
												<span style="background:#fee2e2;color:#dc2626;font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:4px;">-<?php echo esc_html( $p['discount_percent'] ); ?>%</span>
											<?php endif; ?>
										</td>
										<td style="font-size:12.5px;color:#334155;line-height:1.4;">
											<div>Bắt đầu: <strong><?php echo esc_html( $p['start_formatted'] ); ?></strong></div>
											<div>Kết thúc: <strong><?php echo esc_html( $p['end_formatted'] ); ?></strong></div>
										</td>
										<td>
											<span class="pchub-fs-status-pill" style="color:<?php echo esc_attr( $p['status_color'] ); ?>;background:<?php echo esc_attr( $p['status_bg'] ); ?>;">
												<span class="pchub-fs-dot <?php echo esc_attr( $p['status'] ); ?>"></span>
												<?php echo esc_html( $p['status_label'] ); ?>
											</span>
										</td>
										<td style="text-align:right;white-space:nowrap;">
											<?php if ( 'active' === $p['status'] || 'upcoming' === $p['status'] ) : ?>
												<a href="#" class="pchub-fs-action-link pchub-fs-end-link" data-id="<?php echo esc_attr( $p['id'] ); ?>" title="Kết thúc ngay lập tức">Kết thúc ngay</a>
												<span style="color:#cbd5e1;">|</span>
											<?php endif; ?>
											<a href="#" class="pchub-fs-action-link pchub-fs-del-link" data-id="<?php echo esc_attr( $p['id'] ); ?>" title="Xóa khỏi chương trình Flash Sale">Hủy Sale</a>
										</td>
									</tr>
								<?php endforeach; ?>
							</tbody>
						</table>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<!-- Client Script -->
		<script>
		jQuery(document).ready(function ($) {
			var ajaxUrl = <?php echo wp_json_encode( $ajax_url ); ?>;
			var nonce   = <?php echo wp_json_encode( $nonce ); ?>;
			var selectedProducts = {};
			var searchTimer = null;

			var $searchInput = $('#pchub-fs-search-input');
			var $dropdown    = $('#pchub-fs-dropdown');
			var $selectedWrap = $('#pchub-fs-selected-wrap');
			var $selectedList = $('#pchub-fs-selected-list');
			var $countLabel   = $('#pchub-fs-selected-count');
			var $productIdsInp= $('#pchub-fs-product-ids');

			var fmtMoney = function(n) {
				return Math.round(n).toLocaleString('vi-VN') + ' ₫';
			};

			function updateSelectedDisplay() {
				var ids = Object.keys(selectedProducts);
				$countLabel.text(ids.length);
				$productIdsInp.val(ids.join(','));

				if (ids.length === 0) {
					$selectedWrap.hide();
					$selectedList.empty();
					return;
				}

				$selectedList.empty();
				$selectedWrap.show();

				var discountType = $('#pchub-fs-discount-type').val();
				var discountVal  = parseFloat($('#pchub-fs-discount-value').val()) || 0;

				$.each(selectedProducts, function (id, p) {
					var reg = parseFloat(p.regular_price) || 0;
					var previewSale = 0;
					if (discountVal > 0 && reg > 0) {
						if (discountType === 'percent') {
							previewSale = Math.round(reg * (1 - (discountVal / 100)) / 1000) * 1000;
						} else if (discountType === 'amount') {
							previewSale = Math.round(Math.max(1000, reg - discountVal) / 1000) * 1000;
						} else {
							previewSale = discountVal;
						}
					}

					var previewHtml = '';
					if (previewSale > 0 && previewSale < reg) {
						var pct = Math.round((reg - previewSale) / reg * 100);
						previewHtml = ' <span style="color:#16a34a;font-weight:700;margin-left:8px;">➜ Giá sale dự kiến: ' + fmtMoney(previewSale) + ' (-' + pct + '%)</span>';
					}

					var $item = $('<div class="pchub-fs-selected-item"></div>');
					var $left = $('<div style="display:flex;align-items:center;gap:10px;min-width:0;"></div>');
					$left.append('<img src="' + p.thumb + '" style="width:36px;height:36px;border-radius:6px;object-fit:cover;border:1px solid #e2e8f0;flex-shrink:0;">');
					$left.append('<div><div style="font-weight:600;font-size:13.5px;color:#0f172a;">' + p.name + '</div><div style="font-size:12px;color:#64748b;">SKU: ' + p.sku + ' · Giá gốc: <strong>' + fmtMoney(reg) + '</strong>' + previewHtml + '</div></div>');

					var $btn = $('<button type="button" class="pchub-fs-remove-chip">✕ Xóa</button>').on('click', function () {
						delete selectedProducts[id];
						updateSelectedDisplay();
					});

					$item.append($left).append($btn);
					$selectedList.append($item);
				});
			}

			// Search trigger
			function doSearch(term) {
				$dropdown.html('<div style="padding:14px;color:#64748b;text-align:center;">Đang tải danh sách sản phẩm...</div>').show();
				$.ajax({
					url: ajaxUrl,
					method: 'GET',
					data: {
						action: 'pchub_fs_search_products',
						term: term,
						nonce: nonce
					},
					success: function (res) {
						if (res && res.success && res.data && res.data.length > 0) {
							$dropdown.empty();
							$.each(res.data, function (i, p) {
								var isSelected = !!selectedProducts[p.id];
								var $row = $('<div class="pchub-fs-drop-item"></div>');
								var $left = $('<div class="pchub-fs-drop-left"></div>');
								$left.append('<img src="' + p.thumb + '" class="pchub-fs-drop-thumb" alt="">');
								$left.append(
									'<div class="pchub-fs-drop-info">' +
										'<div class="pchub-fs-drop-name">' + p.name + '</div>' +
										'<div class="pchub-fs-drop-meta">' +
											'<span>SKU: ' + p.sku + '</span>' +
											'<span>·</span>' +
											'<span style="color:' + (p.in_stock ? '#16a34a' : '#ef4444') + ';">' + p.stock_status + '</span>' +
											(p.category ? '<span>· ' + p.category + '</span>' : '') +
										'</div>' +
									'</div>'
								);

								var $right = $('<div style="display:flex;align-items:center;gap:12px;"></div>');
								$right.append('<span class="pchub-fs-drop-price">' + fmtMoney(p.regular_price) + '</span>');
								$right.append('<button type="button" class="button button-small" style="font-weight:600;">' + (isSelected ? '✓ Đã chọn' : '+ Chọn') + '</button>');

								$row.append($left).append($right);

								$row.on('click', function (e) {
									e.preventDefault();
									if (!selectedProducts[p.id]) {
										selectedProducts[p.id] = p;
									} else {
										delete selectedProducts[p.id];
									}
									updateSelectedDisplay();
									$dropdown.hide();
								});

								$dropdown.append($row);
							});
						} else {
							$dropdown.html('<div style="padding:14px;color:#64748b;text-align:center;">Không tìm thấy sản phẩm nào phù hợp.</div>');
						}
					},
					error: function () {
						$dropdown.html('<div style="padding:14px;color:#ef4444;text-align:center;">Lỗi kết nối khi tìm sản phẩm.</div>');
					}
				});
			}

			// Open search on focus or click
			$searchInput.on('focus click', function () {
				doSearch($(this).val().trim());
			});

			$searchInput.on('input', function () {
				var term = $(this).val().trim();
				clearTimeout(searchTimer);
				searchTimer = setTimeout(function () {
					doSearch(term);
				}, 250);
			});

			// Hide dropdown on click outside
			$(document).on('click', function (e) {
				if (!$(e.target).closest('.pchub-fs-search-wrap').length) {
					$dropdown.hide();
				}
			});

			// Clear all selected
			$('#pchub-fs-clear-all').on('click', function () {
				selectedProducts = {};
				updateSelectedDisplay();
			});

			// Quick percent pills
			$('#pchub-fs-pct-pills .pchub-fs-pill').on('click', function () {
				$('#pchub-fs-discount-type').val('percent').trigger('change');
				$('#pchub-fs-discount-value').val($(this).data('pct')).trigger('input');
			});

			// Quick time pills
			$('#pchub-fs-time-pills .pchub-fs-pill').on('click', function () {
				var hours = parseInt($(this).data('hours'), 10);
				var fromVal = $('#pchub-fs-date-from').val();
				var baseDate = fromVal ? new Date(fromVal) : new Date();
				if (isNaN(baseDate.getTime())) baseDate = new Date();

				var endDate = new Date(baseDate.getTime() + hours * 3600000);
				var pad = function(n) { return (n < 10 ? '0' : '') + n; };
				var formatDt = function(d) {
					return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
				};
				$('#pchub-fs-date-to').val(formatDt(endDate));
			});

			// Discount type change
			$('#pchub-fs-discount-type').on('change', function () {
				var type = $(this).val();
				var $label = $('#pchub-fs-discount-label');
				var $pills = $('#pchub-fs-pct-pills');
				var $valInput = $('#pchub-fs-discount-value');

				if (type === 'percent') {
					$label.text('Phần trăm giảm (%)');
					$valInput.attr('placeholder', 'VD: 20');
					$pills.show();
				} else if (type === 'amount') {
					$label.text('Số tiền giảm cố định (₫)');
					$valInput.attr('placeholder', 'VD: 100000');
					$pills.hide();
				} else {
					$label.text('Đồng giá Flash Sale (₫)');
					$valInput.attr('placeholder', 'VD: 99000');
					$pills.hide();
				}
				updateSelectedDisplay();
			});

			$('#pchub-fs-discount-value').on('input', function () {
				updateSelectedDisplay();
			});

			// Form submission check
			$('#pchub-fs-form').on('submit', function (e) {
				var ids = Object.keys(selectedProducts);
				if (ids.length === 0) {
					e.preventDefault();
					alert('Vui lòng tìm và chọn ít nhất một sản phẩm để tạo Flash Sale!');
					$searchInput.focus();
					return false;
				}
			});

			// AJAX Delete / End Actions
			$('.pchub-fs-del-link').on('click', function (e) {
				e.preventDefault();
				if (!confirm('Bạn có chắc chắn muốn hủy Flash Sale cho sản phẩm này? Sản phẩm sẽ quay về giá gốc.')) {
					return;
				}
				var pid = $(this).data('id');
				var $row = $('#pchub-fs-row-' + pid);
				$.post(ajaxUrl, { action: 'pchub_fs_remove_sale', product_id: pid, nonce: nonce }, function (res) {
					if (res && res.success) {
						$row.fadeOut(250, function () { $row.remove(); });
					} else {
						alert(res && res.data && res.data.message ? res.data.message : 'Có lỗi xảy ra.');
					}
				});
			});

			$('.pchub-fs-end-link').on('click', function (e) {
				e.preventDefault();
				if (!confirm('Kết thúc ngay chương trình Flash Sale cho sản phẩm này?')) {
					return;
				}
				var pid = $(this).data('id');
				var $row = $('#pchub-fs-row-' + pid);
				$.post(ajaxUrl, { action: 'pchub_fs_end_sale', product_id: pid, nonce: nonce }, function (res) {
					if (res && res.success) {
						location.reload();
					} else {
						alert(res && res.data && res.data.message ? res.data.message : 'Có lỗi xảy ra.');
					}
				});
			});
		});
		</script>
		<?php
	}
}

new PCHub_Flash_Sale_Manager();
