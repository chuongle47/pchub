<?php
/**
 * Plugin Name: PCHub - Báo giá cấu hình PC & CF7 Integration
 * Description: Tự động lưu yêu cầu báo giá từ Contact Form 7 (CF7) và website Next.js vào WordPress. Quản lý danh sách phiếu báo giá, xem chi tiết, tạo bảng dự toán và in báo giá chuẩn chuyên nghiệp.
 * Version: 1.0.0
 * Author: PCHub Team
 * Text Domain: pchub-quote
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PCHUB_QUOTE_VER', '1.0.0' );
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
 * 2. TỰ ĐỘNG BẮT YÊU CẦU TỪ CONTACT FORM 7 (CF7)
 * ---------------------------------------------------------------------- */
add_action( 'wpcf7_mail_sent', 'pchub_quote_capture_cf7_submission' );
add_action( 'wpcf7_before_send_mail', 'pchub_quote_capture_cf7_submission_pre' );

function pchub_quote_capture_cf7_submission_pre( $contact_form ) {
	// Fallback hook nếu mail server lỗi
	pchub_quote_capture_cf7_submission( $contact_form );
}

function pchub_quote_capture_cf7_submission( $contact_form ) {
	static $already_run = array();
	$form_id = $contact_form->id();

	// Đảm bảo chỉ tạo 1 phiếu cho mỗi lần submit
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

	// Lấy họ tên
	$name = $data['your-name'] ?? $data['name'] ?? $data['ho-ten'] ?? $data['hoten'] ?? 'Khách hàng CF7';
	// Lấy SĐT
	$phone = $data['your-tel'] ?? $data['your-phone'] ?? $data['phone'] ?? $data['so-dien-thoai'] ?? $data['sdt'] ?? '';
	// Lấy Email
	$email = $data['your-email'] ?? $data['email'] ?? '';
	// Lấy Chủ đề / Tiêu đề
	$subject = $data['your-subject'] ?? $data['subject'] ?? $data['tieu-de'] ?? 'Yêu cầu báo giá CF7';
	// Lấy Nội dung / Cấu hình
	$message = $data['your-message'] ?? $data['message'] ?? $data['noi-dung'] ?? $data['cau-hinh'] ?? '';
	// Lấy Ngân sách (nếu có)
	$budget = $data['budget'] ?? $data['ngan-sach'] ?? $data['your-budget'] ?? 'Liên hệ tư vấn';
	// Lấy Số lượng (nếu có)
	$quantity = $data['quantity'] ?? $data['so-luong'] ?? 1;

	// Tạo mã phiếu
	$ticket_id = 'BG-' . gmdate( 'Y' ) . '-' . wp_rand( 1000, 9999 );

	// Tạo post mới
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
		update_post_meta( $post_id, '_pchub_budget', sanitize_text_field( $budget ) );
		update_post_meta( $post_id, '_pchub_quantity', (int) $quantity );
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
		'permission_callback' => '__return_true', // Cho phép website gửi báo giá
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
	$company    = sanitize_text_field( $params['company'] ?? '' );
	$tax        = sanitize_text_field( $params['tax'] ?? '' );
	$address    = sanitize_text_field( $params['address'] ?? '' );
	$purpose    = sanitize_text_field( $params['purpose'] ?? '' );
	$budget     = sanitize_text_field( $params['budget'] ?? '' );
	$quantity   = max( 1, (int) ( $params['quantity'] ?? 1 ) );
	$components = sanitize_textarea_field( $params['components'] ?? '' );
	$ticket_id  = sanitize_text_field( $params['ticketId'] ?? ( 'BG-' . gmdate( 'Y' ) . '-' . wp_rand( 1000, 9999 ) ) );

	if ( empty( $name ) || empty( $phone ) ) {
		return new WP_REST_Response( array(
			'success' => false,
			'message' => 'Họ tên và số điện thoại là bắt buộc.',
		), 400 );
	}

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
 * 4. TÙY BIẾN CỘT TRONG TRANG QUẢN TRỊ ADMIN (POST LIST TABLE)
 * ---------------------------------------------------------------------- */
add_filter( 'manage_' . PCHUB_QUOTE_POST_TYPE . '_posts_columns', 'pchub_quote_custom_columns' );
function pchub_quote_custom_columns( $cols ) {
	return array(
		'cb'         => '<input type="checkbox" />',
		'ticket'     => 'Mã phiếu',
		'customer'   => 'Khách hàng',
		'contact'    => 'Liên hệ nhanh',
		'demand'     => 'Nhu cầu & Ngân sách',
		'quote_status' => 'Trạng thái',
		'source'     => 'Nguồn',
		'date'       => 'Thời gian',
	);
}

add_action( 'manage_' . PCHUB_QUOTE_POST_TYPE . '_posts_custom_column', 'pchub_quote_render_column_data', 10, 2 );
function pchub_quote_render_column_data( $col, $post_id ) {
	$ticket   = get_post_meta( $post_id, '_pchub_ticket_id', true ) ?: ( 'BG-' . $post_id );
	$name     = get_post_meta( $post_id, '_pchub_name', true ) ?: 'Khách hàng';
	$phone    = get_post_meta( $post_id, '_pchub_phone', true );
	$email    = get_post_meta( $post_id, '_pchub_email', true );
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
 * 5. METABOX CHI TIẾT & BẢNG LẬP BÁO GIÁ CHO ADMIN
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
	$quantity   = get_post_meta( $post->ID, '_pchub_quantity', true ) ?: 1;
	$components = get_post_meta( $post->ID, '_pchub_components', true );
	$notes      = get_post_meta( $post->ID, '_pchub_notes', true );
	$status     = get_post_meta( $post->ID, '_pchub_status', true ) ?: 'new';
	$source     = get_post_meta( $post->ID, '_pchub_source', true ) ?: 'Website';
	$items      = get_post_meta( $post->ID, '_pchub_items', true );
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
	?>
	<style>
		.pchub-box { display:grid; grid-template-columns: 320px 1fr; gap: 24px; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
		.pchub-sidebar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; }
		.pchub-main-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; }
		.pchub-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 3px; }
		.pchub-val { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
		.pchub-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
		.pchub-table th, .pchub-table td { padding: 10px; border: 1px solid #e2e8f0; text-align: left; }
		.pchub-table th { background: #f1f5f9; font-weight: 700; font-size: 13px; color: #334155; }
		.pchub-btn-call { background: #16a34a !important; color: #fff !important; border: none !important; font-weight: 700 !important; }
		.pchub-btn-zalo { background: #0068ff !important; color: #fff !important; border: none !important; font-weight: 700 !important; }
		@media print {
			#adminmenumain, #wpadminbar, #wpfooter, .pchub-sidebar, .pchub-no-print { display: none !important; }
			.pchub-box { grid-template-columns: 1fr; }
			#wpbody-content { padding: 0 !important; }
		}
	</style>

	<div class="pchub-box">
		<!-- CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & TRẠNG THÁI -->
		<div class="pchub-sidebar">
			<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
				<span style="font-size:16px;font-weight:900;color:#2563eb;"><?php echo esc_html( $ticket ); ?></span>
				<span style="background:#e2e8f0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;"><?php echo esc_html( $source ); ?></span>
			</div>

			<div class="pchub-label">Trạng thái xử lý</div>
			<select name="pchub_status" style="width:100%;font-weight:700;padding:6px;margin-bottom:16px;">
				<option value="new" <?php selected( $status, 'new' ); ?>>🟠 Mới tiếp nhận</option>
				<option value="processing" <?php selected( $status, 'processing' ); ?>>🔵 Đang báo giá</option>
				<option value="sent" <?php selected( $status, 'sent' ); ?>>🟣 Đã gửi báo giá</option>
				<option value="completed" <?php selected( $status, 'completed' ); ?>>🟢 Đã chốt đơn</option>
				<option value="cancelled" <?php selected( $status, 'cancelled' ); ?>>🔴 Đã hủy</option>
			</select>

			<div class="pchub-label">Họ và tên khách hàng</div>
			<div class="pchub-val"><?php echo esc_html( $name ?: 'Chưa cập nhật' ); ?></div>

			<div class="pchub-label">Số điện thoại liên hệ</div>
			<div class="pchub-val">
				<?php echo esc_html( $phone ?: 'Không có' ); ?>
				<?php if ( $phone ) : ?>
					<div style="margin-top:6px;display:flex;gap:6px;">
						<a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9]/', '', $phone ) ); ?>" class="button button-small pchub-btn-call">📞 Gọi ngay</a>
						<a href="https://zalo.me/<?php echo esc_attr( preg_replace( '/[^0-9]/', '', $phone ) ); ?>" target="_blank" class="button button-small pchub-btn-zalo">💬 Chat Zalo</a>
					</div>
				<?php endif; ?>
			</div>

			<div class="pchub-label">Email</div>
			<div class="pchub-val">
				<?php if ( $email ) : ?>
					<a href="mailto:<?php echo esc_attr( $email ); ?>" style="color:#2563eb;"><?php echo esc_html( $email ); ?></a>
				<?php else : ?>
					<span style="color:#94a3b8;">Không có</span>
				<?php endif; ?>
			</div>

			<div class="pchub-label">Nhu cầu / Ngân sách</div>
			<div class="pchub-val">
				<strong>Mục đích:</strong> <?php echo esc_html( $purpose ?: 'Tư vấn cấu hình' ); ?><br>
				<strong>Ngân sách:</strong> <span style="color:#059669;"><?php echo esc_html( $budget ?: 'Chưa chọn' ); ?></span><br>
				<strong>Số lượng:</strong> <?php echo (int) $quantity; ?> bộ
			</div>

			<?php if ( $company || $tax || $address ) : ?>
				<div class="pchub-label">Doanh nghiệp / Địa chỉ</div>
				<div class="pchub-val" style="font-size:12.5px;">
					<?php if ( $company ) echo '<strong>Cty:</strong> ' . esc_html( $company ) . '<br>'; ?>
					<?php if ( $tax ) echo '<strong>MST:</strong> ' . esc_html( $tax ) . '<br>'; ?>
					<?php if ( $address ) echo '<strong>Địa chỉ:</strong> ' . esc_html( $address ); ?>
				</div>
			<?php endif; ?>

			<div class="pchub-label">Ghi chú nội bộ</div>
			<textarea name="pchub_notes" rows="3" style="width:100%;font-size:12px;" placeholder="Ghi chú về khách hàng, tiến độ tư vấn..."><?php echo esc_textarea( $notes ); ?></textarea>
		</div>

		<!-- CỘT PHẢI: CHI TIẾT YÊU CẦU & BẢNG BÁO GIÁ DỰ TOÁN -->
		<div class="pchub-main-panel">
			<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;" class="pchub-no-print">
				<h3 style="margin:0;font-size:16px;">Bảng dự toán cấu hình PC gửi khách</h3>
				<div>
					<button type="button" onclick="window.print()" class="button button-primary">🖨️ In bảng báo giá (PDF)</button>
				</div>
			</div>

			<!-- YÊU CẦU KHÁCH GỬI BAN ĐẦU -->
			<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin-bottom:18px;">
				<div style="font-weight:700;font-size:13px;color:#1e293b;margin-bottom:6px;">📝 Nội dung yêu cầu từ khách hàng:</div>
				<pre style="white-space:pre-wrap;font-family:inherit;font-size:12.5px;color:#334155;margin:0;"><?php echo esc_html( $components ?: $post->post_content ?: 'Không có mô tả chi tiết.' ); ?></pre>
			</div>

			<!-- BẢNG DỰ TOÁN LINH KIỆN -->
			<table class="pchub-table" id="pchub-quote-items-table">
				<thead>
					<tr>
						<th style="width:25%;">Danh mục linh kiện</th>
						<th>Tên linh kiện & Thông số</th>
						<th style="width:10%;text-align:center;">SL</th>
						<th style="width:20%;text-align:right;">Đơn giá (VNĐ)</th>
						<th style="width:20%;text-align:right;">Thành tiền (VNĐ)</th>
					</tr>
				</thead>
				<tbody>
					<?php
					$grand_total = 0;
					foreach ( $items as $idx => $it ) :
						$qty = max( 1, (int) ( $it['qty'] ?? 1 ) );
						$price = max( 0, (float) ( $it['price'] ?? 0 ) );
						$line_total = $qty * $price;
						$grand_total += $line_total;
					?>
						<tr>
							<td>
								<strong><?php echo esc_html( $it['cat'] ?? '' ); ?></strong>
								<input type="hidden" name="pchub_items[<?php echo $idx; ?>][cat]" value="<?php echo esc_attr( $it['cat'] ?? '' ); ?>">
							</td>
							<td>
								<input type="text" name="pchub_items[<?php echo $idx; ?>][name]" value="<?php echo esc_attr( $it['name'] ?? '' ); ?>" style="width:100%;" placeholder="Nhập tên sản phẩm...">
							</td>
							<td style="text-align:center;">
								<input type="number" min="1" class="pchub-qty" name="pchub_items[<?php echo $idx; ?>][qty]" value="<?php echo $qty; ?>" style="width:60px;text-align:center;" onchange="pchubCalcTotal()">
							</td>
							<td style="text-align:right;">
								<input type="number" min="0" step="1000" class="pchub-price" name="pchub_items[<?php echo $idx; ?>][price]" value="<?php echo $price; ?>" style="width:100%;text-align:right;" onchange="pchubCalcTotal()">
							</td>
							<td style="text-align:right;font-weight:700;" class="pchub-line-total">
								<?php echo number_format( $line_total, 0, ',', '.' ); ?> ₫
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
				<tfoot>
					<tr style="background:#f8fafc;font-size:15px;font-weight:900;">
						<td colspan="4" style="text-align:right;color:#0f172a;">TỔNG CỘNG DỰ TOÁN (TẠM TÍNH):</td>
						<td style="text-align:right;color:#dc2626;font-size:17px;" id="pchub-grand-total">
							<?php echo number_format( $grand_total, 0, ',', '.' ); ?> ₫
						</td>
					</tr>
				</tfoot>
			</table>

			<script>
				function pchubCalcTotal() {
					var table = document.getElementById('pchub-quote-items-table');
					if (!table) return;
					var rows = table.querySelectorAll('tbody tr');
					var grand = 0;
					rows.forEach(function(row) {
						var qty = parseFloat(row.querySelector('.pchub-qty').value) || 1;
						var price = parseFloat(row.querySelector('.pchub-price').value) || 0;
						var total = qty * price;
						grand += total;
						row.querySelector('.pchub-line-total').innerText = total.toLocaleString('vi-VN') + ' ₫';
					});
					document.getElementById('pchub-grand-total').innerText = grand.toLocaleString('vi-VN') + ' ₫';
				}
			</script>
		</div>
	</div>
	<?php
}

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

	if ( isset( $_POST['pchub_status'] ) ) {
		update_post_meta( $post_id, '_pchub_status', sanitize_text_field( wp_unslash( $_POST['pchub_status'] ) ) );
	}
	if ( isset( $_POST['pchub_notes'] ) ) {
		update_post_meta( $post_id, '_pchub_notes', sanitize_textarea_field( wp_unslash( $_POST['pchub_notes'] ) ) );
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
