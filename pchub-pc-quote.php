<?php
/**
 * Plugin Name: PCHub - Báo giá cấu hình PC & CF7 Integration
 * Description: Tự động lưu yêu cầu báo giá từ Contact Form 7 (CF7) và website Next.js vào WordPress. Quản lý danh sách phiếu báo giá, chọn linh kiện từ kho WooCommerce theo danh mục, tính toán chính xác số lượng bộ máy và in xuất báo giá chuyên nghiệp.
 * Version: 1.2.0
 * Author: PCHub Team
 * Text Domain: pchub-quote
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PCHUB_QUOTE_VER', '1.2.0' );
define( 'PCHUB_QUOTE_POST_TYPE', 'pchub_quote' );

/* -------------------------------------------------------------------------
 * 1. ĐĂNG KÝ CUSTOM POST TYPE "BÁO GIÁ PC"
 * ---------------------------------------------------------------------- */
add_action( 'init', 'pchub_quote_register_cpt' );
function pchub_quote_register_cpt() {
	$new_count = pchub_quote_get_pending_count();
	$menu_name = 'Báo giá PC';
	if ( $new_count > 0 ) {
		$menu_name .= sprintf( ' <span class="awaiting-mod count-%d"><span class="pending-count">%d</span></span>', $new_count, $new_count );
	}

	$labels = array(
		'name'               => 'Báo giá PC',
		'singular_name'      => 'Phiếu báo giá',
		'menu_name'          => $menu_name,
		'all_items'          => 'Tất cả phiếu báo giá',
		'add_new'            => 'Tạo phiếu mới',
		'add_new_item'       => 'Tạo phiếu báo giá mới',
		'edit_item'          => 'Chi tiết phiếu báo giá',
		'view_item'          => 'Xem phiếu',
		'search_items'       => 'Tìm phiếu báo giá',
		'not_found'          => 'Chưa có yêu cầu báo giá nào.',
		'not_found_in_trash' => 'Không có phiếu nào trong thùng rác.',
	);

	$args = array(
		'labels'             => $labels,
		'public'             => false,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'menu_icon'          => 'dashicons-desktop',
		'menu_position'      => 26,
		'supports'           => array( 'title' ),
		'has_archive'        => false,
		'rewrite'            => false,
		'capability_type'    => 'post',
		'show_in_rest'       => false,
	);

	register_post_type( PCHUB_QUOTE_POST_TYPE, $args );
}

function pchub_quote_get_pending_count() {
	$posts = get_posts( array(
		'post_type'      => PCHUB_QUOTE_POST_TYPE,
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'fields'         => 'ids',
		'meta_query'     => array(
			array(
				'key'     => '_pchub_status',
				'value'   => 'new',
				'compare' => '=',
			),
		),
	) );
	return count( $posts );
}

/* -------------------------------------------------------------------------
 * HELPER: TRÍCH XUẤT TỰ ĐỘNG THÔNG TIN TỪ NỘI DUNG MESSAGE
 * ---------------------------------------------------------------------- */
function pchub_quote_parse_message_details( $content ) {
	$info = array(
		'company'  => '',
		'tax'      => '',
		'address'  => '',
		'purpose'  => '',
		'budget'   => '',
		'quantity' => 1,
	);

	if ( empty( $content ) ) {
		return $info;
	}

	if ( preg_match( '/Công ty \/ Đơn vị:\s*(.*)/iu', $content, $m ) ) {
		$info['company'] = trim( $m[1] );
		if ( 'Cá nhân' === $info['company'] ) $info['company'] = '';
	}
	if ( preg_match( '/Mã số thuế:\s*(.*)/iu', $content, $m ) ) {
		$info['tax'] = trim( $m[1] );
		if ( 'Không yêu cầu' === $info['tax'] ) $info['tax'] = '';
	}
	if ( preg_match( '/Địa chỉ nhận hàng:\s*(.*)/iu', $content, $m ) ) {
		$info['address'] = trim( $m[1] );
		if ( 'Nhận tại Showroom' === $info['address'] ) $info['address'] = '';
	}
	if ( preg_match( '/Mục đích sử dụng:\s*(.*)/iu', $content, $m ) ) {
		$info['purpose'] = trim( $m[1] );
	}
	if ( preg_match( '/Mức ngân sách dự kiến:\s*(.*)/iu', $content, $m ) ) {
		$info['budget'] = trim( $m[1] );
	}
	if ( preg_match( '/Số lượng máy:\s*(\d+)/iu', $content, $m ) ) {
		$info['quantity'] = max( 1, (int) $m[1] );
	}

	return $info;
}

/* -------------------------------------------------------------------------
 * 2. TỰ ĐỘNG BẮT YÊU CẦU TỪ CONTACT FORM 7 (CF7)
 * ---------------------------------------------------------------------- */
add_action( 'wpcf7_mail_sent', 'pchub_quote_capture_cf7_submission' );
add_action( 'wpcf7_before_send_mail', 'pchub_quote_capture_cf7_submission_pre' );

function pchub_quote_capture_cf7_submission_pre( $contact_form ) {
	pchub_quote_capture_cf7_submission( $contact_form );
}

function pchub_quote_capture_cf7_submission( $contact_form ) {
	static $already_run = array();
	$form_id = $contact_form->id();

	if ( isset( $already_run[ $form_id ] ) ) {
		return;
	}
	$already_run[ $form_id ] = true;

	$submission = class_exists( 'WPCF7_Submission' ) ? WPCF7_Submission::get_instance() : null;
	if ( ! $submission ) {
		return;
	}

	$data = $submission->get_posted_data();
	if ( empty( $data ) || ! is_array( $data ) ) {
		return;
	}

	$name    = $data['your-name'] ?? $data['name'] ?? $data['ho-ten'] ?? $data['hoten'] ?? 'Khách hàng CF7';
	$phone   = $data['your-tel'] ?? $data['your-phone'] ?? $data['phone'] ?? $data['so-dien-thoai'] ?? $data['sdt'] ?? '';
	$email   = $data['your-email'] ?? $data['email'] ?? '';
	$subject = $data['your-subject'] ?? $data['subject'] ?? $data['tieu-de'] ?? 'Yêu cầu báo giá CF7';
	$message = $data['your-message'] ?? $data['message'] ?? $data['noi-dung'] ?? $data['cau-hinh'] ?? '';
	
	// Parse chi tiết từ message nếu CF7 gửi chung 1 khối
	$parsed   = pchub_quote_parse_message_details( $message );
	$company  = $data['company'] ?? $data['cong-ty'] ?? $parsed['company'];
	$tax      = $data['tax'] ?? $data['mst'] ?? $data['ma-so-thue'] ?? $parsed['tax'];
	$address  = $data['address'] ?? $data['dia-chi'] ?? $parsed['address'];
	$purpose  = $data['purpose'] ?? $data['muc-dich'] ?? $parsed['purpose'];
	$budget   = $data['budget'] ?? $data['ngan-sach'] ?? $data['your-budget'] ?? $parsed['budget'];
	$quantity = max( 1, (int) ( $data['quantity'] ?? $data['so-luong'] ?? $parsed['quantity'] ) );

	$ticket_id  = 'BG-' . gmdate( 'Y' ) . '-' . wp_rand( 1000, 9999 );
	$post_title = sprintf( '[%s] %s - %s', $ticket_id, $name, $phone ? $phone : 'CF7 Form' );
	$post_id    = wp_insert_post( array(
		'post_type'    => PCHUB_QUOTE_POST_TYPE,
		'post_title'   => $post_title,
		'post_content' => $message,
		'post_status'  => 'publish',
	) );

	if ( $post_id && ! is_wp_error( $post_id ) ) {
		update_post_meta( $post_id, '_pchub_ticket_id', $ticket_id );
		update_post_meta( $post_id, '_pchub_name', sanitize_text_field( $name ) );
		update_post_meta( $post_id, '_pchub_phone', sanitize_text_field( $phone ) );
		update_post_meta( $post_id, '_pchub_email', sanitize_email( $email ) );
		update_post_meta( $post_id, '_pchub_subject', sanitize_text_field( $subject ) );
		update_post_meta( $post_id, '_pchub_company', sanitize_text_field( $company ) );
		update_post_meta( $post_id, '_pchub_tax', sanitize_text_field( $tax ) );
		update_post_meta( $post_id, '_pchub_address', sanitize_text_field( $address ) );
		update_post_meta( $post_id, '_pchub_purpose', sanitize_text_field( $purpose ) );
		update_post_meta( $post_id, '_pchub_budget', sanitize_text_field( $budget ) );
		update_post_meta( $post_id, '_pchub_quantity', $quantity );
		update_post_meta( $post_id, '_pchub_components', sanitize_textarea_field( $message ) );
		update_post_meta( $post_id, '_pchub_notes', 'Nguồn: Contact Form 7 (Form ID: ' . $form_id . ')' );
		update_post_meta( $post_id, '_pchub_status', 'new' );
		update_post_meta( $post_id, '_pchub_source', 'Contact Form 7' );
		update_post_meta( $post_id, '_pchub_created_at', current_time( 'mysql' ) );
	}
}

/* -------------------------------------------------------------------------
 * 3. REST API CHO WEBSITE NEXT.JS GỬI BÁO GIÁ SANG WORDPRESS
 * ---------------------------------------------------------------------- */
add_action( 'rest_api_init', function () {
	// POST /wp-json/pchub/v1/quote
	register_rest_route( 'pchub/v1', '/quote', array(
		'methods'             => 'POST',
		'callback'            => 'pchub_rest_create_quote',
		'permission_callback' => '__return_true',
	) );

	// GET /wp-json/pchub/v1/quotes
	register_rest_route( 'pchub/v1', '/quotes', array(
		'methods'             => 'GET',
		'callback'            => 'pchub_rest_get_quotes',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
	) );
} );

function pchub_rest_create_quote( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( empty( $params ) ) {
		$params = $request->get_params();
	}

	$name       = sanitize_text_field( $params['name'] ?? '' );
	$phone      = sanitize_text_field( $params['phone'] ?? '' );
	$email      = sanitize_email( $params['email'] ?? '' );
	$subject    = sanitize_text_field( $params['subject'] ?? 'Yêu cầu báo giá PC' );
	$message    = sanitize_textarea_field( $params['message'] ?? '' );
	$components = sanitize_textarea_field( $params['components'] ?? '' );
	$ticket_id  = sanitize_text_field( $params['ticketId'] ?? ( 'BG-' . gmdate( 'Y' ) . '-' . wp_rand( 1000, 9999 ) ) );

	if ( empty( $name ) || empty( $phone ) ) {
		return new WP_REST_Response( array(
			'success' => false,
			'message' => 'Họ tên và số điện thoại là bắt buộc.',
		), 400 );
	}

	// Trích xuất tự động nếu chưa truyền thẳng
	$parsed   = pchub_quote_parse_message_details( $message );
	$company  = sanitize_text_field( $params['company'] ?? $parsed['company'] );
	$tax      = sanitize_text_field( $params['tax'] ?? $parsed['tax'] );
	$address  = sanitize_text_field( $params['address'] ?? $parsed['address'] );
	$purpose  = sanitize_text_field( $params['purpose'] ?? $parsed['purpose'] );
	$budget   = sanitize_text_field( $params['budget'] ?? $parsed['budget'] );
	$quantity = max( 1, (int) ( $params['quantity'] ?? $parsed['quantity'] ) );

	$post_title = sprintf( '[%s] %s - %s', $ticket_id, $name, $phone );
	$post_id    = wp_insert_post( array(
		'post_type'    => PCHUB_QUOTE_POST_TYPE,
		'post_title'   => $post_title,
		'post_content' => $message ? $message : $components,
		'post_status'  => 'publish',
	) );

	if ( is_wp_error( $post_id ) ) {
		return new WP_REST_Response( array(
			'success' => false,
			'message' => 'Không thể lưu phiếu báo giá vào WordPress.',
		), 500 );
	}

	update_post_meta( $post_id, '_pchub_ticket_id', $ticket_id );
	update_post_meta( $post_id, '_pchub_name', $name );
	update_post_meta( $post_id, '_pchub_phone', $phone );
	update_post_meta( $post_id, '_pchub_email', $email );
	update_post_meta( $post_id, '_pchub_subject', $subject );
	update_post_meta( $post_id, '_pchub_company', $company );
	update_post_meta( $post_id, '_pchub_tax', $tax );
	update_post_meta( $post_id, '_pchub_address', $address );
	update_post_meta( $post_id, '_pchub_purpose', $purpose );
	update_post_meta( $post_id, '_pchub_budget', $budget );
	update_post_meta( $post_id, '_pchub_quantity', $quantity );
	update_post_meta( $post_id, '_pchub_components', $components ? $components : $message );
	update_post_meta( $post_id, '_pchub_status', 'new' );
	update_post_meta( $post_id, '_pchub_source', 'Website Next.js' );
	update_post_meta( $post_id, '_pchub_created_at', current_time( 'mysql' ) );

	return new WP_REST_Response( array(
		'success'   => true,
		'message'   => 'Đã lưu yêu cầu báo giá thành công vào WordPress!',
		'ticket_id' => $ticket_id,
		'post_id'   => $post_id,
	), 200 );
}

function pchub_rest_get_quotes( WP_REST_Request $request ) {
	$posts = get_posts( array(
		'post_type'      => PCHUB_QUOTE_POST_TYPE,
		'post_status'    => 'publish',
		'posts_per_page' => 50,
		'orderby'        => 'date',
		'order'          => 'DESC',
	) );

	$results = array();
	foreach ( $posts as $p ) {
		$results[] = array(
			'id'         => $p->ID,
			'ticket_id'  => get_post_meta( $p->ID, '_pchub_ticket_id', true ),
			'name'       => get_post_meta( $p->ID, '_pchub_name', true ),
			'phone'      => get_post_meta( $p->ID, '_pchub_phone', true ),
			'email'      => get_post_meta( $p->ID, '_pchub_email', true ),
			'quantity'   => get_post_meta( $p->ID, '_pchub_quantity', true ) ?: 1,
			'budget'     => get_post_meta( $p->ID, '_pchub_budget', true ),
			'status'     => get_post_meta( $p->ID, '_pchub_status', true ) ?: 'new',
			'source'     => get_post_meta( $p->ID, '_pchub_source', true ),
			'created_at' => get_the_date( 'Y-m-d H:i:s', $p->ID ),
		);
	}

	return new WP_REST_Response( array(
		'success' => true,
		'quotes'  => $results,
	), 200 );
}

/* -------------------------------------------------------------------------
 * 4. AJAX: TÌM KIẾM VÀ LỌC SẢN PHẨM WOOCOMMERCE THEO DANH MỤC
 * ---------------------------------------------------------------------- */
add_action( 'wp_ajax_pchub_get_wc_products', 'pchub_ajax_get_wc_products' );
function pchub_ajax_get_wc_products() {
	check_ajax_referer( 'pchub_quote_ajax_nonce', 'nonce' );

	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_send_json_error( 'Permission denied' );
	}

	$cat_slug = sanitize_text_field( $_POST['cat'] ?? '' );
	$keyword  = sanitize_text_field( $_POST['search'] ?? '' );

	// Ánh xạ tên danh mục tiếng Việt sang slug WooCommerce nếu cần
	$cat_mapping = array(
		'CPU - Bộ Vi Xử Lý'        => array( 'cpu', 'linh-kien-may-tinh' ),
		'Mainboard - Bo Mạch Chủ'   => array( 'mainboard', 'linh-kien-may-tinh' ),
		'RAM - Bộ Nhớ Trong'        => array( 'ram', 'linh-kien-may-tinh' ),
		'VGA - Card Màn Hình'       => array( 'vga', 'card-man-hinh', 'linh-kien-may-tinh' ),
		'SSD - Ổ Cứng Lưu Trữ'     => array( 'o-cung', 'ssd', 'hdd', 'linh-kien-may-tinh' ),
		'Nguồn Máy Tính (PSU)'     => array( 'nguon', 'psu', 'linh-kien-may-tinh' ),
		'Vỏ Case Máy Tính'          => array( 'case', 'vo-case', 'linh-kien-may-tinh' ),
		'Tản Nhiệt (Cooling)'       => array( 'tan-nhiet', 'cooling', 'linh-kien-may-tinh' ),
		'Màn Hình Máy Tính'        => array( 'man-hinh', 'man-hinh-may-tinh' ),
		'Bàn Phím & Chuột'          => array( 'ban-phim', 'chuot', 'gaming-gear' ),
	);

	$args = array(
		'post_type'      => 'product',
		'post_status'    => 'publish',
		'posts_per_page' => 40,
		'orderby'        => 'title',
		'order'          => 'ASC',
	);

	if ( ! empty( $keyword ) ) {
		$args['s'] = $keyword;
	}

	// Lọc theo taxonomy product_cat nếu có
	if ( ! empty( $cat_slug ) && 'all' !== $cat_slug ) {
		$target_slugs = $cat_mapping[ $cat_slug ] ?? array( $cat_slug );
		$args['tax_query'] = array(
			array(
				'taxonomy' => 'product_cat',
				'field'    => 'slug',
				'terms'    => $target_slugs,
				'operator' => 'IN',
			),
		);
	}

	$query = new WP_Query( $args );
	$products = array();

	if ( $query->have_posts() ) {
		while ( $query->have_posts() ) {
			$query->the_post();
			$pid = get_the_ID();
			$product = function_exists( 'wc_get_product' ) ? wc_get_product( $pid ) : null;
			$price = $product ? (float) $product->get_price() : (float) get_post_meta( $pid, '_price', true );
			$thumb = get_the_post_thumbnail_url( $pid, 'thumbnail' ) ?: '';

			$products[] = array(
				'id'              => $pid,
				'name'            => html_entity_decode( get_the_title() ),
				'price'           => $price,
				'formatted_price' => number_format( $price, 0, ',', '.' ) . ' ₫',
				'sku'             => $product ? $product->get_sku() : '',
				'image'           => $thumb,
			);
		}
		wp_reset_postdata();
	}

	wp_send_json_success( array(
		'products' => $products,
		'count'    => count( $products ),
	) );
}

/* -------------------------------------------------------------------------
 * 5. TÙY BIẾN CỘT TRONG TRANG QUẢN TRỊ ADMIN (POST LIST TABLE)
 * ---------------------------------------------------------------------- */
add_filter( 'manage_' . PCHUB_QUOTE_POST_TYPE . '_posts_columns', 'pchub_quote_custom_columns' );
function pchub_quote_custom_columns( $cols ) {
	return array(
		'cb'           => '<input type="checkbox" />',
		'ticket'       => 'Mã phiếu',
		'customer'     => 'Khách hàng',
		'contact'      => 'Liên hệ nhanh',
		'quantity'     => 'SL Máy',
		'demand'       => 'Nhu cầu & Ngân sách',
		'quote_status' => 'Trạng thái',
		'source'       => 'Nguồn',
		'date'         => 'Thời gian',
	);
}

add_action( 'manage_' . PCHUB_QUOTE_POST_TYPE . '_posts_custom_column', 'pchub_quote_render_column_data', 10, 2 );
function pchub_quote_render_column_data( $col, $post_id ) {
	$ticket   = get_post_meta( $post_id, '_pchub_ticket_id', true ) ?: ( 'BG-' . $post_id );
	$name     = get_post_meta( $post_id, '_pchub_name', true ) ?: 'Khách hàng';
	$phone    = get_post_meta( $post_id, '_pchub_phone', true );
	$email    = get_post_meta( $post_id, '_pchub_email', true );
	$quantity = get_post_meta( $post_id, '_pchub_quantity', true ) ?: 1;
	$purpose  = get_post_meta( $post_id, '_pchub_purpose', true );
	$budget   = get_post_meta( $post_id, '_pchub_budget', true );
	$status   = get_post_meta( $post_id, '_pchub_status', true ) ?: 'new';
	$source   = get_post_meta( $post_id, '_pchub_source', true ) ?: 'Contact Form 7';

	switch ( $col ) {
		case 'ticket':
			printf( '<strong><a href="%s" style="font-size:14px;color:#2563eb;">%s</a></strong>', esc_url( get_edit_post_link( $post_id ) ), esc_html( $ticket ) );
			break;

		case 'customer':
			printf( '<strong>%s</strong>', esc_html( $name ) );
			if ( $email ) {
				printf( '<br><small style="color:#64748b;">%s</small>', esc_html( $email ) );
			}
			break;

		case 'contact':
			if ( $phone ) {
				$clean_phone = preg_replace( '/[^0-9]/', '', $phone );
				printf( '<div style="display:flex;gap:6px;align-items:center;margin-top:2px;">' );
				printf( '<a href="tel:%s" class="button button-small" style="background:#16a34a;color:#fff;border-color:#16a34a;">📞 %s</a>', esc_attr( $clean_phone ), esc_html( $phone ) );
				printf( '<a href="https://zalo.me/%s" target="_blank" class="button button-small" style="background:#0068ff;color:#fff;border-color:#0068ff;">💬 Zalo</a>', esc_attr( $clean_phone ) );
				printf( '</div>' );
			} else {
				echo '<span style="color:#94a3b8;">Không có SĐT</span>';
			}
			break;

		case 'quantity':
			printf( '<strong style="font-size:14px;color:#0f172a;background:#f1f5f9;padding:3px 8px;border-radius:4px;">%d bộ</strong>', (int) $quantity );
			break;

		case 'demand':
			if ( $purpose ) {
				printf( '<div><strong>Mục đích:</strong> %s</div>', esc_html( $purpose ) );
			}
			if ( $budget ) {
				printf( '<div style="color:#059669;font-weight:600;">💰 %s</div>', esc_html( $budget ) );
			}
			break;

		case 'quote_status':
			$status_map = array(
				'new'        => array( 'Mới tiếp nhận', '#ea580c', '#ffedd5' ),
				'processing' => array( 'Đang báo giá',   '#2563eb', '#dbeafe' ),
				'sent'       => array( 'Đã gửi báo giá', '#7c3aed', '#ede9fe' ),
				'completed'  => array( 'Đã chốt đơn',   '#16a34a', '#dcfce7' ),
				'cancelled'  => array( 'Đã hủy',        '#dc2626', '#fee2e2' ),
			);
			$st = $status_map[ $status ] ?? array( $status, '#475569', '#f1f5f9' );
			printf(
				'<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;color:%s;background:%s;">%s</span>',
				esc_attr( $st[1] ),
				esc_attr( $st[2] ),
				esc_html( $st[0] )
			);
			break;

		case 'source':
			printf( '<span class="badge" style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">%s</span>', esc_html( $source ) );
			break;
	}
}

/* -------------------------------------------------------------------------
 * 6. METABOX QUẢN LÝ BÁO GIÁ & CHỌN LINH KIỆN TỪ WOOCOMMERCE
 * ---------------------------------------------------------------------- */
add_action( 'add_meta_boxes', function () {
	add_meta_box(
		'pchub_quote_details_meta',
		'Thông tin khách hàng & Bảng dự toán cấu hình PC',
		'pchub_quote_render_metabox',
		PCHUB_QUOTE_POST_TYPE,
		'normal',
		'high'
	);
} );

function pchub_quote_render_metabox( $post ) {
	wp_nonce_field( 'pchub_quote_save_action', 'pchub_quote_nonce' );

	$ticket     = get_post_meta( $post->ID, '_pchub_ticket_id', true ) ?: ( 'BG-' . $post->ID );
	$name       = get_post_meta( $post->ID, '_pchub_name', true );
	$phone      = get_post_meta( $post->ID, '_pchub_phone', true );
	$email      = get_post_meta( $post->ID, '_pchub_email', true );
	$company    = get_post_meta( $post->ID, '_pchub_company', true );
	$tax        = get_post_meta( $post->ID, '_pchub_tax', true );
	$address    = get_post_meta( $post->ID, '_pchub_address', true );
	$purpose    = get_post_meta( $post->ID, '_pchub_purpose', true );
	$budget     = get_post_meta( $post->ID, '_pchub_budget', true );
	$quantity   = (int) ( get_post_meta( $post->ID, '_pchub_quantity', true ) ?: 1 );
	$components = get_post_meta( $post->ID, '_pchub_components', true );
	$notes      = get_post_meta( $post->ID, '_pchub_notes', true );
	$status     = get_post_meta( $post->ID, '_pchub_status', true ) ?: 'new';
	$source     = get_post_meta( $post->ID, '_pchub_source', true ) ?: 'Website';

	// Tự động trích xuất nếu các trường đang rỗng (để xử lý các phiếu cũ hoặc gửi gộp)
	$parsed = pchub_quote_parse_message_details( $components ?: $post->post_content );
	if ( empty( $company ) && ! empty( $parsed['company'] ) ) $company = $parsed['company'];
	if ( empty( $tax ) && ! empty( $parsed['tax'] ) ) $tax = $parsed['tax'];
	if ( empty( $address ) && ! empty( $parsed['address'] ) ) $address = $parsed['address'];
	if ( empty( $purpose ) && ! empty( $parsed['purpose'] ) ) $purpose = $parsed['purpose'];
	if ( empty( $budget ) && ! empty( $parsed['budget'] ) ) $budget = $parsed['budget'];
	if ( 1 === $quantity && $parsed['quantity'] > 1 ) $quantity = $parsed['quantity'];

	$items = get_post_meta( $post->ID, '_pchub_items', true );
	if ( ! is_array( $items ) || empty( $items ) ) {
		$items = array(
			array( 'cat' => 'CPU - Bộ Vi Xử Lý',      'name' => '', 'qty' => 1, 'price' => 0 ),
			array( 'cat' => 'Mainboard - Bo Mạch Chủ', 'name' => '', 'qty' => 1, 'price' => 0 ),
			array( 'cat' => 'RAM - Bộ Nhớ Trong',      'name' => '', 'qty' => 2, 'price' => 0 ),
			array( 'cat' => 'VGA - Card Màn Hình',     'name' => '', 'qty' => 1, 'price' => 0 ),
			array( 'cat' => 'SSD - Ổ Cứng Lưu Trữ',   'name' => '', 'qty' => 1, 'price' => 0 ),
			array( 'cat' => 'Nguồn Máy Tính (PSU)',   'name' => '', 'qty' => 1, 'price' => 0 ),
			array( 'cat' => 'Vỏ Case Máy Tính',        'name' => '', 'qty' => 1, 'price' => 0 ),
			array( 'cat' => 'Tản Nhiệt (Cooling)',     'name' => '', 'qty' => 1, 'price' => 0 ),
		);
	}

	$categories_list = array(
		'CPU - Bộ Vi Xử Lý',
		'Mainboard - Bo Mạch Chủ',
		'RAM - Bộ Nhớ Trong',
		'VGA - Card Màn Hình',
		'SSD - Ổ Cứng Lưu Trữ',
		'Nguồn Máy Tính (PSU)',
		'Vỏ Case Máy Tính',
		'Tản Nhiệt (Cooling)',
		'Màn Hình Máy Tính',
		'Bàn Phím & Chuột',
		'Phụ Kiện / Dịch Vụ',
	);

	$ajax_nonce = wp_create_nonce( 'pchub_quote_ajax_nonce' );
	$print_url  = admin_url( 'admin-post.php?action=pchub_print_quote&post_id=' . $post->ID );
	?>
	<style>
		.pchub-wrap { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
		.pchub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
		.pchub-form-group { margin-bottom: 10px; }
		.pchub-form-group label { display: block; font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; }
		.pchub-form-group input, .pchub-form-group select, .pchub-form-group textarea { width: 100%; font-size: 13.5px; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; }
		.pchub-client-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
		.pchub-table-items { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; }
		.pchub-table-items th { background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 12.5px; font-weight: 700; color: #334155; }
		.pchub-table-items td { padding: 8px 10px; border: 1px solid #cbd5e1; vertical-align: middle; }
		.pchub-btn-pick { background: #0284c7 !important; color: #fff !important; border: none !important; font-size: 11.5px !important; font-weight: 600 !important; cursor: pointer; border-radius: 4px !important; padding: 4px 8px !important; }
		.pchub-btn-pick:hover { background: #0369a1 !important; }
		.pchub-del-btn { color: #dc2626; font-size: 16px; font-weight: bold; cursor: pointer; text-decoration: none; border: none; background: transparent; }
		.pchub-del-btn:hover { color: #991b1b; }
		.pchub-modal { display: none; position: fixed; z-index: 100000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(2px); }
		.pchub-modal-content { background: #fff; margin: 5% auto; width: 750px; max-width: 92%; border-radius: 10px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); overflow: hidden; display: flex; flex-direction: column; max-height: 80vh; }
		.pchub-modal-header { padding: 14px 20px; background: #0f172a; color: #fff; display: flex; justify-content: space-between; align-items: center; }
		.pchub-modal-body { padding: 16px 20px; overflow-y: auto; flex: 1; }
		.pchub-prod-item { display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
		.pchub-prod-item:hover { background: #f8fafc; }
		@media print {
			#adminmenumain, #wpadminbar, #wpfooter, .pchub-no-print { display: none !important; }
		}
	</style>

	<div class="pchub-wrap">
		<!-- HỘP THÔNG TIN KHÁCH HÀNG (2 CỘT ĐẦY ĐỦ NHƯ ẢNH USER) -->
		<div class="pchub-client-box">
			<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px;">
				<h3 style="margin:0; font-size: 15px; color:#0f172a;">Thông tin khách hàng</h3>
				<div>
					<span style="font-weight:700; color:#2563eb; font-size:14px; margin-right: 12px;"><?php echo esc_html( $ticket ); ?></span>
					<a href="<?php echo esc_url( $print_url ); ?>" target="_blank" class="button button-primary" style="background:#2563eb; border-color:#2563eb;">🖨️ In / Xuất báo giá PDF</a>
				</div>
			</div>

			<!-- NỘI DUNG YÊU CẦU BAN ĐẦU -->
			<?php if ( $components || $post->post_content ) : ?>
				<div style="background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:12px; margin-bottom:16px;">
					<div style="font-weight:700; font-size:12px; color:#475569; margin-bottom:4px;">📝 Nội dung yêu cầu từ khách hàng:</div>
					<pre style="white-space:pre-wrap; font-family:inherit; font-size:12.5px; color:#334155; margin:0;"><?php echo esc_html( $components ?: $post->post_content ); ?></pre>
				</div>
			<?php endif; ?>

			<div class="pchub-grid">
				<div class="pchub-form-group">
					<label>Họ và tên</label>
					<input type="text" name="pchub_name" value="<?php echo esc_attr( $name ); ?>" placeholder="Họ và tên khách hàng">
				</div>

				<div class="pchub-form-group">
					<label>Số điện thoại</label>
					<div style="display:flex; gap:6px;">
						<input type="text" name="pchub_phone" id="pchub_phone_val" value="<?php echo esc_attr( $phone ); ?>" placeholder="0901234567" style="flex:1;">
						<?php if ( $phone ) : ?>
							<a href="tel:<?php echo esc_attr( preg_replace('/[^0-9]/', '', $phone) ); ?>" class="button" style="background:#16a34a; color:#fff; border:none;">📞 Gọi</a>
							<a href="https://zalo.me/<?php echo esc_attr( preg_replace('/[^0-9]/', '', $phone) ); ?>" target="_blank" class="button" style="background:#0068ff; color:#fff; border:none;">💬 Zalo</a>
						<?php endif; ?>
					</div>
				</div>

				<div class="pchub-form-group">
					<label>Email</label>
					<input type="email" name="pchub_email" value="<?php echo esc_attr( $email ); ?>" placeholder="email@example.com">
				</div>

				<div class="pchub-form-group">
					<label style="color:#dc2626;">Số lượng (Bộ máy)</label>
					<input type="number" min="1" id="pchub_main_quantity" name="pchub_quantity" value="<?php echo (int) $quantity; ?>" style="font-weight:900; font-size:15px; color:#dc2626;" onchange="pchubCalcTotal()">
				</div>

				<div class="pchub-form-group">
					<label>Mục đích sử dụng</label>
					<input type="text" name="pchub_purpose" value="<?php echo esc_attr( $purpose ); ?>" placeholder="Ví dụ: Gaming, Đồ họa 3D, Quán Net...">
				</div>

				<div class="pchub-form-group">
					<label>Ngân sách</label>
					<input type="text" name="pchub_budget" value="<?php echo esc_attr( $budget ); ?>" placeholder="Ví dụ: 25 - 40 triệu">
				</div>

				<div class="pchub-form-group">
					<label>Công ty / Đơn vị</label>
					<input type="text" name="pchub_company" value="<?php echo esc_attr( $company ); ?>" placeholder="Tên công ty hoặc phòng máy">
				</div>

				<div class="pchub-form-group">
					<label>Mã số thuế</label>
					<input type="text" name="pchub_tax" value="<?php echo esc_attr( $tax ); ?>" placeholder="Mã số thuế doanh nghiệp (nếu có)">
				</div>

				<div class="pchub-form-group" style="grid-column: span 2;">
					<label>Địa chỉ nhận hàng</label>
					<input type="text" name="pchub_address" value="<?php echo esc_attr( $address ); ?>" placeholder="Địa chỉ giao hàng và lắp đặt">
				</div>

				<div class="pchub-form-group" style="grid-column: span 2;">
					<label>Trạng thái phiếu</label>
					<select name="pchub_status" style="font-weight:700;">
						<option value="new" <?php selected( $status, 'new' ); ?>>🟠 Mới tiếp nhận</option>
						<option value="processing" <?php selected( $status, 'processing' ); ?>>🔵 Đang báo giá</option>
						<option value="sent" <?php selected( $status, 'sent' ); ?>>🟣 Đã gửi báo giá cho khách</option>
						<option value="completed" <?php selected( $status, 'completed' ); ?>>🟢 Đã chốt đơn / Hoàn tất</option>
						<option value="cancelled" <?php selected( $status, 'cancelled' ); ?>>🔴 Đã hủy</option>
					</select>
				</div>

				<div class="pchub-form-group" style="grid-column: span 2;">
					<label>Ghi chú nội bộ (Không in ra phiếu)</label>
					<textarea name="pchub_notes" rows="2" placeholder="Ghi chú về khách hàng, tiến độ tư vấn..."><?php echo esc_textarea( $notes ); ?></textarea>
				</div>
			</div>
		</div>

		<!-- BẢNG DỰ TOÁN CẤU HÌNH PC -->
		<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
			<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
				<h3 style="margin:0; font-size:15px; color:#0f172a;">Bảng dự toán cấu hình PC (Cho 01 bộ máy)</h3>
				<button type="button" class="button" onclick="pchubAddRow()">➕ Thêm dòng linh kiện</button>
			</div>

			<table class="pchub-table-items" id="pchub-items-table">
				<thead>
					<tr>
						<th style="width: 22%;">Danh mục</th>
						<th style="width: 42%;">Tên linh kiện & thông số</th>
						<th style="width: 8%; text-align:center;">SL</th>
						<th style="width: 14%; text-align:right;">Đơn giá (đ)</th>
						<th style="width: 14%; text-align:right;">Thành tiền</th>
						<th style="width: 4%; text-align:center;"></th>
					</tr>
				</thead>
				<tbody id="pchub-items-tbody">
					<?php
					$subtotal_pc = 0;
					foreach ( $items as $idx => $it ) :
						$qty = max( 1, (int) ( $it['qty'] ?? 1 ) );
						$price = max( 0, (float) ( $it['price'] ?? 0 ) );
						$line_total = $qty * $price;
						$subtotal_pc += $line_total;
						$cur_cat = $it['cat'] ?? 'CPU - Bộ Vi Xử Lý';
					?>
						<tr data-index="<?php echo $idx; ?>">
							<td>
								<select name="pchub_items[<?php echo $idx; ?>][cat]" class="pchub-row-cat" style="width:100%; font-weight:600;">
									<?php foreach ( $categories_list as $cat_opt ) : ?>
										<option value="<?php echo esc_attr( $cat_opt ); ?>" <?php selected( $cur_cat, $cat_opt ); ?>>
											<?php echo esc_html( $cat_opt ); ?>
										</option>
									<?php endforeach; ?>
								</select>
							</td>
							<td>
								<div style="display:flex; gap:6px; align-items:center;">
									<input type="text" name="pchub_items[<?php echo $idx; ?>][name]" value="<?php echo esc_attr( $it['name'] ?? '' ); ?>" class="pchub-row-name" style="flex:1;" placeholder="Gõ tên hoặc bấm chọn từ kho...">
									<button type="button" class="pchub-btn-pick" onclick="pchubOpenPicker(this)">🔍 Chọn kho</button>
								</div>
							</td>
							<td style="text-align:center;">
								<input type="number" min="1" class="pchub-row-qty" name="pchub_items[<?php echo $idx; ?>][qty]" value="<?php echo $qty; ?>" style="width:55px; text-align:center;" onchange="pchubCalcTotal()">
							</td>
							<td style="text-align:right;">
								<input type="number" min="0" step="1000" class="pchub-row-price" name="pchub_items[<?php echo $idx; ?>][price]" value="<?php echo $price; ?>" style="width:100%; text-align:right;" onchange="pchubCalcTotal()">
							</td>
							<td style="text-align:right; font-weight:700;" class="pchub-row-total">
								<?php echo number_format( $line_total, 0, ',', '.' ); ?> đ
							</td>
							<td style="text-align:center;">
								<button type="button" class="pchub-del-btn" onclick="pchubDeleteRow(this)" title="Xóa dòng">✕</button>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
				<tfoot>
					<!-- DÒNG 1: TỔNG TIỀN CHO 1 BỘ PC -->
					<tr style="background:#f8fafc; font-size:14px; font-weight:700;">
						<td colspan="4" style="text-align:right; color:#334155;">ĐƠN GIÁ CHO 01 BỘ PC:</td>
						<td style="text-align:right; color:#2563eb;" id="pchub-pc-unit-total">
							<?php echo number_format( $subtotal_pc, 0, ',', '.' ); ?> đ
						</td>
						<td></td>
					</tr>
					<!-- DÒNG 2: SỐ LƯỢNG MÁY -->
					<tr style="background:#f8fafc; font-size:14px; font-weight:700;">
						<td colspan="4" style="text-align:right; color:#334155;">SỐ LƯỢNG BỘ MÁY ĐẶT HÀNG:</td>
						<td style="text-align:right; color:#0f172a;" id="pchub-display-qty">
							<?php echo (int) $quantity; ?> bộ
						</td>
						<td></td>
					</tr>
					<!-- DÒNG 3: TỔNG GIÁ TRỊ TOÀN BỘ PC (HỢP ĐỒNG BÁO GIÁ) -->
					<tr style="background:#eff6ff; font-size:16px; font-weight:900;">
						<td colspan="4" style="text-align:right; color:#dc2626;">TỔNG CỘNG GIÁ TRỊ ĐƠN HÀNG (TẤT CẢ PC):</td>
						<td style="text-align:right; color:#dc2626; font-size:18px;" id="pchub-grand-total">
							<?php echo number_format( $subtotal_pc * $quantity, 0, ',', '.' ); ?> đ
						</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>
	</div>

	<!-- MODAL CHỌN SẢN PHẨM TỪ KHO WOOCOMMERCE -->
	<div id="pchub-product-modal" class="pchub-modal">
		<div class="pchub-modal-content">
			<div class="pchub-modal-header">
				<h3 style="margin:0; font-size:15px; color:#fff;" id="pchub-modal-title">Chọn linh kiện từ kho WooCommerce</h3>
				<button type="button" onclick="pchubClosePicker()" style="background:transparent; border:none; color:#fff; font-size:20px; cursor:pointer;">✕</button>
			</div>
			<div style="padding:12px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; gap:10px;">
				<input type="text" id="pchub-search-input" placeholder="Tìm theo tên linh kiện hoặc mã SKU..." style="flex:1; padding:8px 12px; border:1px solid #cbd5e1; border-radius:4px;" onkeyup="pchubDebounceSearch()">
				<select id="pchub-cat-select" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:4px;" onchange="pchubFetchProducts()">
					<option value="all">Tất cả sản phẩm</option>
					<?php foreach ( $categories_list as $c_item ) : ?>
						<option value="<?php echo esc_attr( $c_item ); ?>"><?php echo esc_html( $c_item ); ?></option>
					<?php endforeach; ?>
				</select>
			</div>
			<div class="pchub-modal-body" id="pchub-product-results">
				<div style="text-align:center; padding:30px; color:#64748b;">Đang tải danh sách linh kiện...</div>
			</div>
		</div>
	</div>

	<script>
		var activeRowElement = null;
		var searchTimeout = null;

		function pchubCalcTotal() {
			var tbody = document.getElementById('pchub-items-tbody');
			var rows = tbody.querySelectorAll('tr');
			var pcSubtotal = 0;

			rows.forEach(function(row) {
				var qty = parseFloat(row.querySelector('.pchub-row-qty').value) || 1;
				var price = parseFloat(row.querySelector('.pchub-row-price').value) || 0;
				var lineTotal = qty * price;
				pcSubtotal += lineTotal;
				row.querySelector('.pchub-row-total').innerText = lineTotal.toLocaleString('vi-VN') + ' đ';
			});

			var mainQty = parseInt(document.getElementById('pchub_main_quantity').value) || 1;
			if (mainQty < 1) mainQty = 1;

			var grandTotal = pcSubtotal * mainQty;

			document.getElementById('pchub-pc-unit-total').innerText = pcSubtotal.toLocaleString('vi-VN') + ' đ';
			document.getElementById('pchub-display-qty').innerText = mainQty + ' bộ';
			document.getElementById('pchub-grand-total').innerText = grandTotal.toLocaleString('vi-VN') + ' đ';
		}

		function pchubAddRow() {
			var tbody = document.getElementById('pchub-items-tbody');
			var newIndex = tbody.querySelectorAll('tr').length + '_' + Date.now();
			var tr = document.createElement('tr');
			tr.setAttribute('data-index', newIndex);

			var catOptions = <?php echo json_encode( $categories_list ); ?>;
			var catHtml = '';
			catOptions.forEach(function(c) {
				catHtml += '<option value="' + c + '">' + c + '</option>';
			});

			tr.innerHTML = '<td><select name="pchub_items[' + newIndex + '][cat]" class="pchub-row-cat" style="width:100%; font-weight:600;">' + catHtml + '</select></td>' +
				'<td><div style="display:flex; gap:6px; align-items:center;">' +
				'<input type="text" name="pchub_items[' + newIndex + '][name]" value="" class="pchub-row-name" style="flex:1;" placeholder="Gõ tên hoặc bấm chọn từ kho...">' +
				'<button type="button" class="pchub-btn-pick" onclick="pchubOpenPicker(this)">🔍 Chọn kho</button>' +
				'</div></td>' +
				'<td style="text-align:center;"><input type="number" min="1" class="pchub-row-qty" name="pchub_items[' + newIndex + '][qty]" value="1" style="width:55px; text-align:center;" onchange="pchubCalcTotal()"></td>' +
				'<td style="text-align:right;"><input type="number" min="0" step="1000" class="pchub-row-price" name="pchub_items[' + newIndex + '][price]" value="0" style="width:100%; text-align:right;" onchange="pchubCalcTotal()"></td>' +
				'<td style="text-align:right; font-weight:700;" class="pchub-row-total">0 đ</td>' +
				'<td style="text-align:center;"><button type="button" class="pchub-del-btn" onclick="pchubDeleteRow(this)" title="Xóa dòng">✕</button></td>';

			tbody.appendChild(tr);
			pchubCalcTotal();
		}

		function pchubDeleteRow(btn) {
			var row = btn.closest('tr');
			if (document.querySelectorAll('#pchub-items-tbody tr').length <= 1) {
				alert('Cần giữ lại ít nhất 1 dòng linh kiện.');
				return;
			}
			row.remove();
			pchubCalcTotal();
		}

		function pchubOpenPicker(btn) {
			activeRowElement = btn.closest('tr');
			var currentCat = activeRowElement.querySelector('.pchub-row-cat').value;
			document.getElementById('pchub-cat-select').value = currentCat;
			document.getElementById('pchub-search-input').value = '';
			document.getElementById('pchub-modal-title').innerText = 'Chọn sản phẩm cho mục: ' + currentCat;
			document.getElementById('pchub-product-modal').style.display = 'block';
			pchubFetchProducts();
		}

		function pchubClosePicker() {
			document.getElementById('pchub-product-modal').style.display = 'none';
			activeRowElement = null;
		}

		function pchubDebounceSearch() {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(pchubFetchProducts, 300);
		}

		function pchubFetchProducts() {
			var cat = document.getElementById('pchub-cat-select').value;
			var s = document.getElementById('pchub-search-input').value;
			var container = document.getElementById('pchub-product-results');
			container.innerHTML = '<div style="text-align:center; padding:30px; color:#64748b;">Đang tìm kiếm trong kho WooCommerce...</div>';

			jQuery.post(ajaxurl, {
				action: 'pchub_get_wc_products',
				nonce: '<?php echo esc_js( $ajax_nonce ); ?>',
				cat: cat,
				search: s
			}, function(response) {
				if (!response || !response.success || !response.data || !response.data.products) {
					container.innerHTML = '<div style="text-align:center; padding:30px; color:#ef4444;">Không thể tải sản phẩm từ WooCommerce.</div>';
					return;
				}

				var prods = response.data.products;
				if (prods.length === 0) {
					container.innerHTML = '<div style="text-align:center; padding:30px; color:#64748b;">Không tìm thấy sản phẩm nào phù hợp trong danh mục này.</div>';
					return;
				}

				var html = '';
				prods.forEach(function(p) {
					html += '<div class="pchub-prod-item">' +
						'<div style="display:flex; align-items:center; gap:12px;">' +
						(p.image ? '<img src="' + p.image + '" style="width:42px; height:42px; object-fit:cover; border-radius:4px; border:1px solid #e2e8f0;">' : '<div style="width:42px; height:42px; background:#f1f5f9; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#94a3b8;">No img</div>') +
						'<div>' +
						'<div style="font-weight:700; font-size:13px; color:#0f172a;">' + p.name + '</div>' +
						'<div style="font-size:11.5px; color:#64748b;">' + (p.sku ? 'SKU: ' + p.sku + ' | ' : '') + '<strong style="color:#059669;">' + p.formatted_price + '</strong></div>' +
						'</div>' +
						'</div>' +
						'<button type="button" class="button button-small" style="background:#16a34a; color:#fff; border-color:#16a34a; font-weight:700;" onclick="pchubSelectProduct(\'' + p.name.replace(/'/g, "\\'") + '\', ' + p.price + ')">Chọn</button>' +
						'</div>';
				});

				container.innerHTML = html;
			}).fail(function() {
				container.innerHTML = '<div style="text-align:center; padding:30px; color:#ef4444;">Lỗi kết nối máy chủ.</div>';
			});
		}

		function pchubSelectProduct(name, price) {
			if (!activeRowElement) return;
			activeRowElement.querySelector('.pchub-row-name').value = name;
			activeRowElement.querySelector('.pchub-row-price').value = price;
			pchubCalcTotal();
			pchubClosePicker();
		}

		// Close modal if clicked outside
		window.onclick = function(event) {
			var modal = document.getElementById('pchub-product-modal');
			if (event.target === modal) {
				pchubClosePicker();
			}
		};
	</script>
	<?php
}

/* -------------------------------------------------------------------------
 * 7. LƯU METADATA BÁO GIÁ
 * ---------------------------------------------------------------------- */
add_action( 'save_post_' . PCHUB_QUOTE_POST_TYPE, function ( $post_id ) {
	if ( ! isset( $_POST['pchub_quote_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pchub_quote_nonce'] ) ), 'pchub_quote_save_action' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$fields = array(
		'pchub_name'     => '_pchub_name',
		'pchub_phone'    => '_pchub_phone',
		'pchub_email'    => '_pchub_email',
		'pchub_company'  => '_pchub_company',
		'pchub_tax'      => '_pchub_tax',
		'pchub_address'  => '_pchub_address',
		'pchub_purpose'  => '_pchub_purpose',
		'pchub_budget'   => '_pchub_budget',
		'pchub_status'   => '_pchub_status',
		'pchub_notes'    => '_pchub_notes',
	);

	foreach ( $fields as $post_key => $meta_key ) {
		if ( isset( $_POST[ $post_key ] ) ) {
			update_post_meta( $post_id, $meta_key, sanitize_text_field( wp_unslash( $_POST[ $post_key ] ) ) );
		}
	}

	if ( isset( $_POST['pchub_quantity'] ) ) {
		$qty = max( 1, (int) $_POST['pchub_quantity'] );
		update_post_meta( $post_id, '_pchub_quantity', $qty );
	}

	if ( isset( $_POST['pchub_items'] ) && is_array( $_POST['pchub_items'] ) ) {
		$sanitized_items = array();
		foreach ( wp_unslash( $_POST['pchub_items'] ) as $it ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			if ( is_array( $it ) ) {
				$sanitized_items[] = array(
					'cat'   => sanitize_text_field( $it['cat'] ?? '' ),
					'name'  => sanitize_text_field( $it['name'] ?? '' ),
					'qty'   => max( 1, (int) ( $it['qty'] ?? 1 ) ),
					'price' => max( 0, (float) ( $it['price'] ?? 0 ) ),
				);
			}
		}
		update_post_meta( $post_id, '_pchub_items', $sanitized_items );
	}
} );

/* -------------------------------------------------------------------------
 * 8. MẪU IN / XUẤT BẢNG BÁO GIÁ CHUẨN DOANH NGHIỆP (PRINT / PDF TEMPLATE)
 * ---------------------------------------------------------------------- */
add_action( 'admin_post_pchub_print_quote', 'pchub_render_print_quote_page' );
function pchub_render_print_quote_page() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( 'Bạn không có quyền truy cập trang này.' );
	}

	$post_id = isset( $_GET['post_id'] ) ? (int) $_GET['post_id'] : 0;
	$post = get_post( $post_id );
	if ( ! $post || PCHUB_QUOTE_POST_TYPE !== $post->post_type ) {
		wp_die( 'Phiếu báo giá không tồn tại.' );
	}

	$ticket   = get_post_meta( $post_id, '_pchub_ticket_id', true ) ?: ( 'BG-' . $post_id );
	$name     = get_post_meta( $post_id, '_pchub_name', true ) ?: 'Quý Khách Hàng';
	$phone    = get_post_meta( $post_id, '_pchub_phone', true );
	$email    = get_post_meta( $post_id, '_pchub_email', true );
	$company  = get_post_meta( $post_id, '_pchub_company', true );
	$tax      = get_post_meta( $post_id, '_pchub_tax', true );
	$address  = get_post_meta( $post_id, '_pchub_address', true );
	$purpose  = get_post_meta( $post_id, '_pchub_purpose', true );
	$quantity = max( 1, (int) ( get_post_meta( $post_id, '_pchub_quantity', true ) ?: 1 ) );
	$items    = get_post_meta( $post_id, '_pchub_items', true ) ?: array();

	$subtotal_pc = 0;
	foreach ( $items as $it ) {
		$q = max( 1, (int) ( $it['qty'] ?? 1 ) );
		$p = max( 0, (float) ( $it['price'] ?? 0 ) );
		$subtotal_pc += $q * $p;
	}
	$grand_total = $subtotal_pc * $quantity;
	?>
	<!DOCTYPE html>
	<html lang="vi">
	<head>
		<meta charset="UTF-8">
		<title>Báo Giá PC - <?php echo esc_html( $ticket ); ?> - <?php echo esc_html( $name ); ?></title>
		<style>
			@page { size: A4; margin: 15mm 12mm 15mm 12mm; }
			body { font-family: 'Times New Roman', Times, serif, Arial; color: #111; line-height: 1.4; padding: 20px; max-width: 850px; margin: 0 auto; background: #fff; }
			.header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
			.header-left h2 { margin: 0 0 4px; font-size: 18px; text-transform: uppercase; color: #0f172a; }
			.header-left p { margin: 2px 0; font-size: 13px; color: #334155; }
			.header-right { text-align: right; font-size: 13px; }
			.title { text-align: center; margin: 20px 0 16px; }
			.title h1 { margin: 0; font-size: 22px; text-transform: uppercase; color: #1e3a8a; }
			.title p { margin: 4px 0 0; font-style: italic; font-size: 13px; }
			.client-info { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
			.client-info td { padding: 4px 6px; font-size: 13.5px; vertical-align: top; }
			.quote-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
			.quote-table th, .quote-table td { border: 1px solid #333; padding: 7px 8px; font-size: 13px; }
			.quote-table th { background: #f1f5f9; text-align: center; font-weight: bold; }
			.total-box { margin-bottom: 20px; font-size: 14px; }
			.total-row { display: flex; justify-content: space-between; padding: 4px 0; }
			.grand-total { font-size: 16px; font-weight: bold; color: #b91c1c; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; padding: 6px 0; }
			.terms { font-size: 12px; color: #333; margin-bottom: 30px; }
			.signatures { display: flex; justify-content: space-between; margin-top: 30px; text-align: center; }
			.sign-col { width: 45%; }
			.sign-space { height: 75px; }
			.print-bar { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; text-align: center; margin-bottom: 20px; border-radius: 6px; }
			@media print {
				.print-bar { display: none !important; }
				body { padding: 0; }
			}
		</style>
	</head>
	<body>
		<div class="print-bar">
			<button onclick="window.print()" style="background:#2563eb; color:#fff; font-size:15px; font-weight:bold; padding:8px 20px; border:none; border-radius:4px; cursor:pointer;">🖨️ In Bảng Báo Giá Này (Hoặc Lưu PDF)</button>
			<span style="margin-left: 12px; color:#64748b; font-size:13px;">(Căn chỉnh chuẩn khổ giấy A4, có thể lưu thành file PDF gửi khách qua Zalo/Email)</span>
		</div>

		<div class="header">
			<div class="header-left">
				<h2>CÔNG TY CỔ PHẦN CÔNG NGHỆ PCHUB</h2>
				<p><strong>Địa chỉ:</strong> Số 06, Trần Văn Ơn, Phường Phú Lợi, TP Hồ Chí Minh</p>
				<p><strong>Hotline:</strong> 0322 323 233 | <strong>Zalo tư vấn:</strong> 0333 333 333</p>
				<p><strong>Website:</strong> pchub.vn | <strong>Email:</strong> support@pchub.vn</p>
			</div>
			<div class="header-right">
				<p><strong>Mã phiếu:</strong> <span style="font-size:15px; font-weight:bold; color:#1e3a8a;"><?php echo esc_html( $ticket ); ?></span></p>
				<p><strong>Ngày lập:</strong> <?php echo get_the_date( 'd/m/Y', $post_id ); ?></p>
				<p><strong>Hiệu lực:</strong> 07 ngày kể từ ngày lập</p>
			</div>
		</div>

		<div class="title">
			<h1>BẢNG BÁO GIÁ CẤU HÌNH PC & THIẾT BỊ</h1>
			<p>(Kính gửi Quý Khách hàng bảng dự toán chi tiết cấu hình máy tính theo yêu cầu)</p>
		</div>

		<table class="client-info">
			<tr>
				<td style="width:16%;"><strong>Khách hàng:</strong></td>
				<td style="width:44%;"><strong><?php echo esc_html( $name ); ?></strong></td>
				<td style="width:16%;"><strong>Điện thoại:</strong></td>
				<td style="width:24%;"><strong><?php echo esc_html( $phone ?: '---' ); ?></strong></td>
			</tr>
			<tr>
				<td><strong>Đơn vị / Cty:</strong></td>
				<td><?php echo esc_html( $company ?: 'Khách hàng cá nhân' ); ?></td>
				<td><strong>Mã số thuế:</strong></td>
				<td><?php echo esc_html( $tax ?: '---' ); ?></td>
			</tr>
			<tr>
				<td><strong>Địa chỉ:</strong></td>
				<td><?php echo esc_html( $address ?: 'Nhận tại cửa hàng PCHub' ); ?></td>
				<td><strong>Email:</strong></td>
				<td><?php echo esc_html( $email ?: '---' ); ?></td>
			</tr>
			<?php if ( $purpose ) : ?>
				<tr>
					<td><strong>Mục đích sử dụng:</strong></td>
					<td colspan="3"><?php echo esc_html( $purpose ); ?></td>
				</tr>
			<?php endif; ?>
		</table>

		<table class="quote-table">
			<thead>
				<tr>
					<th style="width: 5%;">STT</th>
					<th style="width: 22%;">Danh mục linh kiện</th>
					<th>Tên thiết bị / linh kiện & thông số kỹ thuật</th>
					<th style="width: 8%;">SL / Bộ</th>
					<th style="width: 15%;">Đơn giá (VNĐ)</th>
					<th style="width: 16%;">Thành tiền (VNĐ)</th>
				</tr>
			</thead>
			<tbody>
				<?php
				$stt = 1;
				foreach ( $items as $it ) :
					$q = max( 1, (int) ( $it['qty'] ?? 1 ) );
					$p = max( 0, (float) ( $it['price'] ?? 0 ) );
					$line = $q * $p;
					if ( empty( $it['name'] ) && 0 === $p ) continue;
				?>
					<tr>
						<td style="text-align: center;"><?php echo $stt++; ?></td>
						<td><strong><?php echo esc_html( $it['cat'] ?? '' ); ?></strong></td>
						<td><?php echo esc_html( $it['name'] ?? '' ); ?></td>
						<td style="text-align: center; font-weight: bold;"><?php echo $q; ?></td>
						<td style="text-align: right;"><?php echo number_format( $p, 0, ',', '.' ); ?> đ</td>
						<td style="text-align: right; font-weight: bold;"><?php echo number_format( $line, 0, ',', '.' ); ?> đ</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>

		<div class="total-box">
			<div class="total-row">
				<span>Đơn giá dự toán cho 01 bộ PC:</span>
				<strong><?php echo number_format( $subtotal_pc, 0, ',', '.' ); ?> VNĐ</strong>
			</div>
			<div class="total-row">
				<span>Số lượng bộ máy:</span>
				<strong style="font-size:15px; color:#1e3a8a;"><?php echo $quantity; ?> bộ</strong>
			</div>
			<div class="total-row grand-total">
				<span>TỔNG CỘNG GIÁ TRỊ ĐƠN HÀNG (<?php echo $quantity; ?> BỘ PC):</span>
				<span><?php echo number_format( $grand_total, 0, ',', '.' ); ?> VNĐ</span>
			</div>
		</div>

		<div class="terms">
			<p><strong>* Ghi chú & Cam kết từ PCHub:</strong></p>
			<ul style="margin: 4px 0 0 18px; padding: 0;">
				<li>100% linh kiện mới chính hãng fullbox, có đầy đủ hóa đơn chứng từ.</li>
				<li>Bảo hành chính hãng theo từng linh kiện từ 12 đến 36 tháng. 1 đổi 1 trong 30 ngày đầu nếu lỗi nhà sản xuất.</li>
				<li>Miễn phí lắp ráp chuyên nghiệp, đi dây giấu nguồn thẩm mỹ, cài đặt phần mềm & test stress nhiệt độ 24h.</li>
				<li>Hỗ trợ kỹ thuật trọn đời, vệ sinh tra keo tản nhiệt miễn phí định kỳ tại PCHub.</li>
			</ul>
		</div>

		<div class="signatures">
			<div class="sign-col">
				<strong>ĐẠI DIỆN KHÁCH HÀNG</strong><br>
				<em>(Ký, ghi rõ họ tên)</em>
				<div class="sign-space"></div>
				<strong><?php echo esc_html( $name ); ?></strong>
			</div>
			<div class="sign-col">
				<strong>ĐẠI DIỆN PCHUB TECHNOLOGY</strong><br>
				<em>(Ký, đóng dấu hoặc ghi rõ họ tên)</em>
				<div class="sign-space"></div>
				<strong>Chuyên Viên Tư Vấn Cấu Hình</strong>
			</div>
		</div>
	</body>
	</html>
	<?php
	exit;
}
