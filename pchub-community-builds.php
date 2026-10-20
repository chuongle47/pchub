<?php
/**
 * Plugin Name: PCHub - Quản lý & Duyệt Build PC Cộng đồng
 * Plugin URI: https://sbuy.io.vn
 * Description: Plugin chuyên dụng tiếp nhận, quản lý và kiểm duyệt các cấu hình PC do cộng đồng thành viên gửi lên website. Tích hợp duyệt nhanh 1-click (AJAX), lọc phân loại Chờ duyệt / Đã duyệt / Từ chối, quản lý chi tiết 8 linh kiện, điểm tương thích AI, và hệ thống REST API đồng bộ 2 chiều với website Next.js.
 * Version: 1.0.0
 * Author: PCHub Team
 * Author URI: https://sbuy.io.vn
 * Text Domain: pchub-community
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PCHUB_COMMUNITY_VER', '1.0.0' );
define( 'PCHUB_BUILD_POST_TYPE', 'pchub_build' );
define( 'PCHUB_COMMUNITY_PLUGIN_ACTIVE', true );

/* =========================================================================
 * 1. ĐĂNG KÝ CUSTOM POST TYPE "CỘNG ĐỒNG PC"
 * ========================================================================= */
add_action( 'init', 'pchub_community_register_cpt' );
function pchub_community_register_cpt() {
	$labels = array(
		'name'               => 'Cộng đồng PC',
		'singular_name'      => 'Cấu hình Cộng đồng',
		'menu_name'          => 'Duyệt Build PC',
		'all_items'          => 'Tất cả cấu hình',
		'add_new'            => 'Thêm cấu hình',
		'add_new_item'       => 'Thêm cấu hình PC mới',
		'edit_item'          => 'Kiểm duyệt cấu hình PC',
		'view_item'          => 'Xem cấu hình',
		'search_items'       => 'Tìm kiếm cấu hình',
		'not_found'          => 'Chưa có cấu hình cộng đồng nào.',
		'not_found_in_trash' => 'Không có cấu hình nào trong thùng rác.',
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'menu_icon'          => 'dashicons-desktop',
		'menu_position'      => 27,
		'supports'           => array( 'title', 'editor', 'thumbnail', 'comments' ),
		'has_archive'        => false,
		'rewrite'            => array( 'slug' => 'community-build' ),
		'capability_type'    => 'post',
		'show_in_rest'       => false,
	);

	register_post_type( PCHUB_BUILD_POST_TYPE, $args );
}

/**
 * Tắt Gutenberg Block Editor cho CPT này để hiển thị trực tiếp các Metabox linh kiện
 */
add_filter( 'use_block_editor_for_post_type', 'pchub_community_disable_block_editor', 10, 2 );
function pchub_community_disable_block_editor( $use_block_editor, $post_type ) {
	if ( PCHUB_BUILD_POST_TYPE === $post_type ) {
		return false;
	}
	return $use_block_editor;
}

/* =========================================================================
 * 2. ĐẾM BÀI CHỜ DUYỆT & HIỂN THỊ MENU BADGE
 * ========================================================================= */
function pchub_community_get_pending_count() {
	$posts = get_posts( array(
		'post_type'      => PCHUB_BUILD_POST_TYPE,
		'post_status'    => array( 'publish', 'draft', 'pending' ),
		'posts_per_page' => -1,
		'fields'         => 'ids',
		'meta_query'     => array(
			array(
				'key'     => '_pchub_status',
				'value'   => 'pending',
				'compare' => '=',
			),
		),
	) );
	return count( $posts );
}

add_action( 'admin_menu', 'pchub_community_add_menu_bubble', 999 );
function pchub_community_add_menu_bubble() {
	global $menu;
	$pending_count = pchub_community_get_pending_count();

	if ( is_array( $menu ) ) {
		foreach ( $menu as $key => $item ) {
			if ( isset( $item[2] ) && 'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE === $item[2] ) {
				if ( $pending_count > 0 ) {
					$menu[ $key ][0] .= sprintf(
						' <span class="update-plugins count-%d" style="background:#d97706;"><span class="plugin-count">%d</span></span>',
						$pending_count,
						$pending_count
					);
				}
				break;
			}
		}
	}

	// Submenus chuyên dụng
	add_submenu_page(
		'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE,
		'Cấu hình chờ duyệt',
		'⏳ Chờ duyệt' . ( $pending_count > 0 ? " <span class='awaiting-mod count-{$pending_count}' style='background:#d97706;color:#fff;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700;'>{$pending_count}</span>" : '' ),
		'edit_posts',
		'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE . '&pchub_build_status=pending'
	);

	add_submenu_page(
		'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE,
		'Cấu hình đã duyệt',
		'✔ Đã duyệt',
		'edit_posts',
		'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE . '&pchub_build_status=approved'
	);
}

/* =========================================================================
 * 3. TÙY BIẾN CỘT TRONG DANH SÁCH BÀI VIẾT (COLUMNS)
 * ========================================================================= */
add_filter( 'manage_' . PCHUB_BUILD_POST_TYPE . '_posts_columns', 'pchub_community_columns' );
function pchub_community_columns( $cols ) {
	$new_cols = array(
		'cb'          => $cols['cb'] ?? '<input type="checkbox" />',
		'build_thumb' => 'Ảnh',
		'title'       => 'Tên cấu hình',
		'author_name' => 'Người chia sẻ',
		'category'    => 'Phân loại',
		'price'       => 'Tổng ngân sách',
		'ai_score'    => 'AI Tương thích',
		'moderation'  => 'Trạng thái',
		'engagement'  => 'Tương tác',
		'quick_mod'   => '⚡ Duyệt nhanh',
		'date'        => 'Thời gian',
	);
	return $new_cols;
}

add_action( 'manage_' . PCHUB_BUILD_POST_TYPE . '_posts_custom_column', 'pchub_community_column_content', 10, 2 );
function pchub_community_column_content( $column, $post_id ) {
	$status      = get_post_meta( $post_id, '_pchub_status', true ) ?: 'pending';
	$category    = get_post_meta( $post_id, '_pchub_category', true ) ?: 'Gaming';
	$price       = (int) get_post_meta( $post_id, '_pchub_price', true );
	$author_name = get_post_meta( $post_id, '_pchub_author_name', true ) ?: get_the_author_meta( 'display_name', get_post_field( 'post_author', $post_id ) );
	$ai_score    = get_post_meta( $post_id, '_pchub_ai_score', true );
	if ( '' === $ai_score ) $ai_score = 100;
	$likes       = (int) get_post_meta( $post_id, '_pchub_likes', true );
	$comments    = (int) get_post_meta( $post_id, '_pchub_comments_count', true );
	$img_url     = get_the_post_thumbnail_url( $post_id, 'thumbnail' ) ?: get_post_meta( $post_id, '_pchub_image', true );

	switch ( $column ) {
		case 'build_thumb':
			if ( $img_url ) {
				printf( '<img src="%s" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;" />', esc_url( $img_url ) );
			} else {
				echo '<div style="width:48px;height:48px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:20px;">🖥️</div>';
			}
			break;

		case 'author_name':
			echo '<strong>' . esc_html( $author_name ?: 'Khách PCHub' ) . '</strong>';
			$role = get_post_meta( $post_id, '_pchub_author_role', true );
			if ( $role ) {
				echo '<br><span style="font-size:11px;color:#64748b;">' . esc_html( $role ) . '</span>';
			}
			break;

		case 'category':
			$cat_colors = array(
				'Gaming'      => '#e11d48',
				'Workstation' => '#2563eb',
				'Streaming'   => '#7c3aed',
				'Budget'      => '#059669',
			);
			$color = $cat_colors[ $category ] ?? '#475569';
			printf(
				'<span style="display:inline-block;padding:3px 9px;border-radius:12px;font-size:12px;font-weight:700;color:#fff;background:%s;">%s</span>',
				esc_attr( $color ),
				esc_html( $category )
			);
			break;

		case 'price':
			if ( $price > 0 ) {
				printf( '<strong style="color:#0f172a;font-size:13px;">%s</strong>', number_format_i18n( $price ) . ' ₫' );
			} else {
				echo '<span style="color:#94a3b8;">Chưa nhập</span>';
			}
			break;

		case 'ai_score':
			$score_num = (int) $ai_score;
			$bg = $score_num >= 90 ? '#dcfce7' : ( $score_num >= 75 ? '#fef3c7' : '#fee2e2' );
			$fg = $score_num >= 90 ? '#15803d' : ( $score_num >= 75 ? '#b45309' : '#b91c1c' );
			printf(
				'<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:10px;font-weight:700;font-size:12px;background:%s;color:%s;">🤖 %d/100</span>',
				esc_attr( $bg ),
				esc_attr( $fg ),
				$score_num
			);
			break;

		case 'moderation':
			$status_labels = array(
				'pending'  => '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#fef3c7;color:#b45309;">⏳ Chờ duyệt</span>',
				'approved' => '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#dcfce7;color:#15803d;">✔ Đã duyệt</span>',
				'rejected' => '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#fee2e2;color:#b91c1c;">✖ Từ chối</span>',
			);
			echo $status_labels[ $status ] ?? esc_html( $status );
			break;

		case 'engagement':
			printf(
				'<div style="font-size:12px;color:#475569;display:flex;gap:8px;"><span>❤️ <strong>%d</strong></span><span>💬 <strong>%d</strong></span></div>',
				$likes,
				$comments
			);
			break;

		case 'quick_mod':
			$nonce = wp_create_nonce( 'pchub_mod_nonce_' . $post_id );
			$raw_parts = get_post_meta( $post_id, '_pchub_parts', true );
			if ( ! is_array( $raw_parts ) ) $raw_parts = array();
			$ai_summary  = get_post_meta( $post_id, '_pchub_ai_summary', true ) ?: 'Đạt chuẩn tương thích phần cứng.';
			$desc        = get_post_meta( $post_id, '_pchub_description', true ) ?: get_post_field( 'post_content', $post_id );
			$title       = get_the_title( $post_id );

			$data_payload = htmlspecialchars( wp_json_encode( array(
				'id'          => $post_id,
				'title'       => $title,
				'image'       => $img_url ?: '/images/hero-pc.jpg',
				'author'      => $author_name ?: 'Thành viên PCHub',
				'category'    => $category,
				'price'       => number_format_i18n( $price ) . ' ₫',
				'ai_score'    => (int) $ai_score,
				'ai_summary'  => $ai_summary,
				'description' => $desc,
				'status'      => $status,
				'parts'       => $raw_parts,
				'edit_url'    => get_edit_post_link( $post_id, 'raw' ),
			) ), ENT_QUOTES, 'UTF-8' );

			printf(
				'<div class="pchub-quick-mod-wrap" data-id="%d" data-nonce="%s" data-build="%s" style="display:flex;gap:4px;flex-wrap:wrap;">
					<button type="button" class="button button-small pchub-view-details-btn" style="background:#eff6ff;color:#2563eb;border-color:#bfdbfe;font-weight:700;">👁️ Chi tiết</button>
					<button type="button" class="button button-small pchub-mod-btn pchub-mod-approve" data-status="approved" title="Duyệt cho phép hiển thị" style="background:#16a34a;color:#fff;border-color:#15803d;font-weight:600;">✔ Duyệt</button>
					<button type="button" class="button button-small pchub-mod-btn pchub-mod-reject" data-status="rejected" title="Từ chối cấu hình này" style="color:#dc2626;border-color:#fca5a5;font-weight:600;">✖ Bỏ</button>
				</div>',
				$post_id,
				esc_attr( $nonce ),
				$data_payload
			);
			break;
	}
}

/* =========================================================================
 * 4. TABS LỌC TRẠNG THÁI: TẤT CẢ | CHỜ DUYỆT | ĐÃ DUYỆT | TỪ CHỐI
 * ========================================================================= */
add_filter( 'views_edit-' . PCHUB_BUILD_POST_TYPE, 'pchub_community_status_views' );
function pchub_community_status_views( $views ) {
	$current = isset( $_GET['pchub_build_status'] ) ? sanitize_text_field( $_GET['pchub_build_status'] ) : '';

	$counts = array(
		'all'      => wp_count_posts( PCHUB_BUILD_POST_TYPE )->publish + wp_count_posts( PCHUB_BUILD_POST_TYPE )->draft,
		'pending'  => 0,
		'approved' => 0,
		'rejected' => 0,
	);

	foreach ( array( 'pending', 'approved', 'rejected' ) as $st ) {
		$posts = get_posts( array(
			'post_type'      => PCHUB_BUILD_POST_TYPE,
			'post_status'    => array( 'publish', 'draft' ),
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_key'       => '_pchub_status',
			'meta_value'     => $st,
		) );
		$counts[ $st ] = count( $posts );
	}

	$base_url = admin_url( 'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE );

	$views['all'] = sprintf(
		'<a href="%s" class="%s">Tất cả <span class="count">(%d)</span></a>',
		esc_url( $base_url ),
		empty( $current ) ? 'current' : '',
		$counts['all']
	);

	$views['pending'] = sprintf(
		'<a href="%s" class="%s" style="color:#d97706;font-weight:700;">⏳ Chờ duyệt <span class="count">(%d)</span></a>',
		esc_url( add_query_arg( 'pchub_build_status', 'pending', $base_url ) ),
		'pending' === $current ? 'current' : '',
		$counts['pending']
	);

	$views['approved'] = sprintf(
		'<a href="%s" class="%s" style="color:#16a34a;font-weight:600;">✔ Đã duyệt <span class="count">(%d)</span></a>',
		esc_url( add_query_arg( 'pchub_build_status', 'approved', $base_url ) ),
		'approved' === $current ? 'current' : '',
		$counts['approved']
	);

	$views['rejected'] = sprintf(
		'<a href="%s" class="%s" style="color:#dc2626;">✖ Từ chối <span class="count">(%d)</span></a>',
		esc_url( add_query_arg( 'pchub_build_status', 'rejected', $base_url ) ),
		'rejected' === $current ? 'current' : '',
		$counts['rejected']
	);

	return $views;
}

add_action( 'restrict_manage_posts', 'pchub_community_filter_dropdowns' );
function pchub_community_filter_dropdowns( $post_type ) {
	if ( PCHUB_BUILD_POST_TYPE !== $post_type ) return;

	$selected_cat = isset( $_GET['pchub_cat_filter'] ) ? sanitize_text_field( $_GET['pchub_cat_filter'] ) : '';
	$categories = array( 'Gaming', 'Workstation', 'Streaming', 'Budget' );

	echo '<select name="pchub_cat_filter">';
	echo '<option value="">-- Tất cả phân loại --</option>';
	foreach ( $categories as $cat ) {
		printf( '<option value="%s" %s>%s</option>', esc_attr( $cat ), selected( $selected_cat, $cat, false ), esc_html( $cat ) );
	}
	echo '</select>';
}

add_filter( 'parse_query', 'pchub_community_filter_query' );
function pchub_community_filter_query( $query ) {
	global $pagenow;
	if ( is_admin() && 'edit.php' === $pagenow && isset( $query->query_vars['post_type'] ) && PCHUB_BUILD_POST_TYPE === $query->query_vars['post_type'] ) {
		$meta_query = $query->get( 'meta_query' ) ?: array();

		if ( ! empty( $_GET['pchub_build_status'] ) ) {
			$meta_query[] = array(
				'key'     => '_pchub_status',
				'value'   => sanitize_text_field( $_GET['pchub_build_status'] ),
				'compare' => '=',
			);
		}

		if ( ! empty( $_GET['pchub_cat_filter'] ) ) {
			$meta_query[] = array(
				'key'     => '_pchub_category',
				'value'   => sanitize_text_field( $_GET['pchub_cat_filter'] ),
				'compare' => '=',
			);
		}

		if ( ! empty( $meta_query ) ) {
			$query->set( 'meta_query', $meta_query );
		}
	}
}

/* =========================================================================
 * 5. AJAX XỬ LÝ DUYỆT NHANH 1-CLICK
 * ========================================================================= */
add_action( 'wp_ajax_pchub_quick_moderate_build', 'pchub_ajax_quick_moderate_build' );
function pchub_ajax_quick_moderate_build() {
	$post_id = isset( $_POST['post_id'] ) ? (int) $_POST['post_id'] : 0;
	$status  = isset( $_POST['status'] ) ? sanitize_text_field( $_POST['status'] ) : '';
	$nonce   = isset( $_POST['nonce'] ) ? sanitize_text_field( $_POST['nonce'] ) : '';

	if ( ! $post_id || ! wp_verify_nonce( $nonce, 'pchub_mod_nonce_' . $post_id ) ) {
		wp_send_json_error( array( 'message' => 'Lỗi xác thực bảo mật.' ) );
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		wp_send_json_error( array( 'message' => 'Bạn không có quyền chỉnh sửa cấu hình này.' ) );
	}

	if ( in_array( $status, array( 'approved', 'rejected', 'pending' ), true ) ) {
		update_post_meta( $post_id, '_pchub_status', $status );
		if ( 'approved' === $status ) {
			wp_update_post( array(
				'ID'          => $post_id,
				'post_status' => 'publish',
			) );
		} else {
			wp_update_post( array(
				'ID'          => $post_id,
				'post_status' => 'draft',
			) );
		}

		$status_html = array(
			'approved' => '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#dcfce7;color:#15803d;">✔ Đã duyệt</span>',
			'rejected' => '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#fee2e2;color:#b91c1c;">✖ Từ chối</span>',
			'pending'  => '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#fef3c7;color:#b45309;">⏳ Chờ duyệt</span>',
		);

		wp_send_json_success( array(
			'post_id'     => $post_id,
			'status'      => $status,
			'status_html' => $status_html[ $status ],
			'message'     => 'approved' === $status ? 'Đã duyệt cấu hình thành công!' : 'Đã từ chối cấu hình.',
		) );
	}

	wp_send_json_error( array( 'message' => 'Trạng thái không hợp lệ.' ) );
}

add_action( 'admin_footer', 'pchub_community_admin_scripts' );
function pchub_community_admin_scripts() {
	global $pagenow, $post_type;
	if ( 'edit.php' !== $pagenow || PCHUB_BUILD_POST_TYPE !== $post_type ) return;
	?>
	<script>
	jQuery(document).ready(function($) {
		$(document).on('click', '.pchub-mod-btn', function(e) {
			e.preventDefault();
			var $btn = $(this);
			var $wrap = $btn.closest('.pchub-quick-mod-wrap');
			var postId = $wrap.data('id');
			var nonce = $wrap.data('nonce');
			var targetStatus = $btn.data('status');

			$wrap.find('button').prop('disabled', true).css('opacity', '0.5');

			$.post(ajaxurl, {
				action: 'pchub_quick_moderate_build',
				post_id: postId,
				status: targetStatus,
				nonce: nonce
			}, function(res) {
				if (res && res.success) {
					var $row = $('#post-' + postId);
					$row.find('.column-moderation').html(res.data.status_html);
					$wrap.find('.pchub-mod-btn').remove();
					$wrap.append('<span style="color:#16a34a;font-size:11px;font-weight:700;margin-left:4px;">' + (targetStatus === 'approved' ? '✔ Đã duyệt' : '✖ Đã từ chối') + '</span>');
					$('#pchub-detail-modal').fadeOut(150);
				} else {
					alert((res && res.data && res.data.message) ? res.data.message : 'Có lỗi xảy ra.');
					$wrap.find('button').prop('disabled', false).css('opacity', '1');
				}
			}).fail(function() {
				alert('Lỗi kết nối máy chủ.');
				$wrap.find('button').prop('disabled', false).css('opacity', '1');
			});
		});

		// Modal Xem chi tiết cấu hình trực tiếp trong WordPress Admin
		$(document).on('click', '.pchub-view-details-btn', function(e) {
			e.preventDefault();
			var $wrap = $(this).closest('.pchub-quick-mod-wrap');
			var b = $wrap.data('build');
			if (!b) return;

			var partsHtml = '';
			var partLabels = {
				'cpu': '1. Vi xử lý (CPU)',
				'gpu': '2. Card đồ họa (VGA)',
				'ram': '3. Bộ nhớ RAM',
				'mainboard': '4. Bo mạch chủ',
				'ssd': '5. Ổ cứng (SSD)',
				'psu': '6. Nguồn máy tính (PSU)',
				'case': '7. Vỏ case',
				'cooler': '8. Tản nhiệt'
			};

			$.each(partLabels, function(key, label) {
				var p = (b.parts && b.parts[key]) ? b.parts[key] : {};
				var pName = p.name || 'Chưa chọn';
				var pPrice = p.price ? new Intl.NumberFormat('vi-VN').format(p.price) + ' ₫' : '—';
				partsHtml += '<div style="background:#f8fafc;padding:10px 12px;border-radius:8px;border:1px solid #e2e8f0;">' +
					'<div style="font-size:11.5px;color:#64748b;font-weight:700;">' + label + '</div>' +
					'<div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">' + pName + '</div>' +
					'<div style="font-size:12px;color:#2563eb;font-weight:600;margin-top:2px;">' + pPrice + '</div>' +
				'</div>';
			});

			var modalContent = 
				'<div style="display:flex;gap:18px;margin-bottom:16px;border-bottom:1px solid #e2e8f0;padding-bottom:16px;">' +
					'<img src="' + b.image + '" style="width:140px;height:100px;object-fit:cover;border-radius:8px;border:1px solid #cbd5e1;" />' +
					'<div style="flex:1;">' +
						'<div style="font-size:18px;font-weight:800;color:#0f172a;">' + b.title + '</div>' +
						'<div style="font-size:13px;color:#64748b;margin-top:4px;">Người chia sẻ: <strong style="color:#1e293b;">' + b.author + '</strong> | Phân loại: <span style="font-weight:700;color:#2563eb;">' + b.category + '</span></div>' +
						'<div style="font-size:16px;font-weight:900;color:#d97706;margin-top:6px;">💰 Tổng ngân sách: ' + b.price + '</div>' +
					'</div>' +
				'</div>' +
				'<h4 style="margin:0 0 10px;font-size:14px;color:#1e293b;">🛠️ Danh sách 8 linh kiện chi tiết:</h4>' +
				'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' + partsHtml + '</div>' +
				'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:14px;">' +
					'<div style="font-weight:700;color:#166534;font-size:13px;">🤖 Đánh giá tương thích AI: ' + b.ai_score + '/100</div>' +
					'<div style="font-size:12px;color:#15803d;margin-top:4px;">' + b.ai_summary + '</div>' +
				'</div>' +
				(b.description ? '<div style="margin-bottom:16px;"><strong style="font-size:13px;color:#334155;">💬 Chia sẻ từ người đăng:</strong><div style="font-size:13px;color:#475569;margin-top:4px;background:#f8fafc;padding:10px;border-radius:8px;">' + b.description + '</div></div>' : '') +
				'<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e2e8f0;padding-top:14px;margin-top:16px;">' +
					'<a href="' + b.edit_url + '" class="button button-secondary" style="font-weight:600;">📝 Mở màn hình sửa nâng cao</a>' +
					'<div style="display:flex;gap:8px;">' +
						'<button type="button" class="button button-primary pchub-mod-btn pchub-mod-approve" data-status="approved" style="background:#16a34a;border-color:#15803d;font-weight:700;">✔ Duyệt bài này</button>' +
						'<button type="button" class="button pchub-mod-btn pchub-mod-reject" data-status="rejected" style="color:#dc2626;border-color:#fca5a5;font-weight:600;">✖ Từ chối</button>' +
					'</div>' +
				'</div>';

			$('#pchub-detail-modal-body').html(modalContent);
			$('#pchub-detail-modal').data('id', b.id).data('nonce', $wrap.data('nonce')).fadeIn(150);
		});

		$(document).on('click', '#pchub-detail-modal-close, #pchub-detail-modal-backdrop', function() {
			$('#pchub-detail-modal').fadeOut(150);
		});
	});
	</script>

	<!-- Modal Backdrop & Box -->
	<div id="pchub-detail-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;">
		<div id="pchub-detail-modal-backdrop" style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);"></div>
		<div style="position:relative;background:#fff;max-width:760px;width:90%;margin:50px auto;border-radius:14px;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.25);max-height:85vh;overflow-y:auto;">
			<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid #e2e8f0;padding-bottom:10px;">
				<h3 style="margin:0;font-size:16px;font-weight:800;color:#0f172a;">👁️ Chi tiết Cấu hình PC Cộng đồng</h3>
				<button type="button" id="pchub-detail-modal-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:#64748b;font-weight:700;">✕</button>
			</div>
			<div id="pchub-detail-modal-body"></div>
		</div>
	</div>
	<?php
}

/* =========================================================================
 * 6. METABOXES: CHI TIẾT 8 LINH KIỆN & TRẠNG THÁI PHÊ DUYỆT
 * ========================================================================= */
add_action( 'add_meta_boxes', 'pchub_community_register_metaboxes' );
function pchub_community_register_metaboxes() {
	add_meta_box(
		'pchub_build_details_mb',
		'🛠️ Chi tiết 8 Linh kiện PC & Kiểm định AI',
		'pchub_build_details_render',
		PCHUB_BUILD_POST_TYPE,
		'normal',
		'high'
	);

	add_meta_box(
		'pchub_build_status_mb',
		'📋 Trạng thái Phê duyệt & Đăng tải',
		'pchub_build_status_render',
		PCHUB_BUILD_POST_TYPE,
		'side',
		'high'
	);
}

function pchub_build_status_render( $post ) {
	wp_nonce_field( 'pchub_build_meta_save', 'pchub_build_meta_nonce' );

	$status      = get_post_meta( $post->ID, '_pchub_status', true ) ?: 'pending';
	$category    = get_post_meta( $post->ID, '_pchub_category', true ) ?: 'Gaming';
	$author_name = get_post_meta( $post->ID, '_pchub_author_name', true ) ?: 'Khách PCHub';
	$author_role = get_post_meta( $post->ID, '_pchub_author_role', true ) ?: 'Community Builder';
	$likes       = (int) get_post_meta( $post->ID, '_pchub_likes', true );
	$slug        = $post->post_name ?: sanitize_title( $post->post_title );

	$categories = array( 'Gaming', 'Workstation', 'Streaming', 'Budget' );
	?>
	<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
		<p style="margin-bottom:6px;"><strong>Trạng thái kiểm duyệt:</strong></p>
		<select name="_pchub_status" style="width:100%;padding:6px;font-weight:700;border-radius:6px;">
			<option value="pending" <?php selected( $status, 'pending' ); ?>>⏳ Chờ duyệt (Pending)</option>
			<option value="approved" <?php selected( $status, 'approved' ); ?>>✔ Đã duyệt (Approved - Hiển thị công khai)</option>
			<option value="rejected" <?php selected( $status, 'rejected' ); ?>>✖ Từ chối (Rejected)</option>
		</select>

		<p style="margin-top:14px;margin-bottom:6px;"><strong>Phân loại cấu hình:</strong></p>
		<select name="_pchub_category" style="width:100%;padding:6px;border-radius:6px;">
			<?php foreach ( $categories as $cat ) : ?>
				<option value="<?php echo esc_attr( $cat ); ?>" <?php selected( $category, $cat ); ?>><?php echo esc_html( $cat ); ?></option>
			<?php endforeach; ?>
		</select>

		<p style="margin-top:14px;margin-bottom:6px;"><strong>Người chia sẻ:</strong></p>
		<input type="text" name="_pchub_author_name" value="<?php echo esc_attr( $author_name ); ?>" style="width:100%;padding:6px;border-radius:6px;" />
		<input type="text" name="_pchub_author_role" value="<?php echo esc_attr( $author_role ); ?>" placeholder="Vai trò / Chức danh" style="width:100%;padding:6px;margin-top:4px;border-radius:6px;font-size:12px;color:#64748b;" />

		<p style="margin-top:14px;margin-bottom:6px;"><strong>Lượt thích (Likes):</strong></p>
		<input type="number" name="_pchub_likes" value="<?php echo esc_attr( $likes ); ?>" min="0" style="width:100%;padding:6px;border-radius:6px;" />

		<div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;">
			<a href="<?php echo esc_url( 'https://pchub-iota.vercel.app/community/builds/' . ( $slug ?: $post->ID ) ); ?>" target="_blank" class="button" style="width:100%;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;background:#f8fafc;color:#0284c7;border-color:#bae6fd;font-weight:600;">
				🌐 Xem trên Website Next.js ↗
			</a>
		</div>
	</div>
	<?php
}

function pchub_build_details_render( $post ) {
	$parts = array(
		'cpu'       => array( 'label' => '1. Vi xử lý (CPU)', 'icon' => '🔲' ),
		'gpu'       => array( 'label' => '2. Card đồ họa (VGA/GPU)', 'icon' => '🎮' ),
		'ram'       => array( 'label' => '3. Bộ nhớ RAM', 'icon' => '⚡' ),
		'mainboard' => array( 'label' => '4. Bo mạch chủ (Mainboard)', 'icon' => '🖲️' ),
		'ssd'       => array( 'label' => '5. Ổ cứng (SSD/HDD)', 'icon' => '💾' ),
		'psu'       => array( 'label' => '6. Nguồn máy tính (PSU)', 'icon' => '🔌' ),
		'case'      => array( 'label' => '7. Vỏ case', 'icon' => '📦' ),
		'cooler'    => array( 'label' => '8. Tản nhiệt (Cooler)', 'icon' => '❄️' ),
	);

	$raw_parts = get_post_meta( $post->ID, '_pchub_parts', true );
	if ( ! is_array( $raw_parts ) ) {
		$raw_parts = array();
	}

	$total_price = (int) get_post_meta( $post->ID, '_pchub_price', true );
	$ai_score    = get_post_meta( $post->ID, '_pchub_ai_score', true );
	if ( '' === $ai_score ) $ai_score = 100;
	$ai_summary  = get_post_meta( $post->ID, '_pchub_ai_summary', true ) ?: 'Hệ thống AI đánh giá các linh kiện tương thích tối ưu, công suất nguồn và chuẩn socket ăn khớp hoàn toàn.';
	$desc        = get_post_meta( $post->ID, '_pchub_description', true ) ?: $post->post_content;
	$img_url     = get_the_post_thumbnail_url( $post->ID, 'large' ) ?: get_post_meta( $post->ID, '_pchub_image', true );
	?>
	<style>
		.pchub-parts-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px; }
		.pchub-part-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; }
		.pchub-part-header { font-weight:700; color:#1e293b; margin-bottom:8px; display:flex; align-items:center; gap:6px; font-size:13px; }
		.pchub-part-fields { display:flex; gap:8px; }
		.pchub-part-name { flex:2; }
		.pchub-part-price { flex:1; min-width:130px; }
	</style>

	<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

		<!-- Build Photo Preview & Link -->
		<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:18px;display:flex;align-items:center;gap:16px;">
			<?php if ( $img_url ) : ?>
				<img src="<?php echo esc_url( $img_url ); ?>" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:1px solid #cbd5e1;background:#fff;" />
			<?php else : ?>
				<div style="width:120px;height:90px;background:#e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:32px;">🖥️</div>
			<?php endif; ?>
			<div style="flex:1;">
				<label style="font-weight:700;font-size:13px;color:#0f172a;display:block;margin-bottom:4px;">🖼️ Hình ảnh thực tế cấu hình PC:</label>
				<input type="text" name="_pchub_image" value="<?php echo esc_attr( $img_url ); ?>" placeholder="URL ảnh hoặc chọn tải ảnh bên dưới..." style="width:100%;padding:6px 10px;border-radius:6px;font-size:13px;" />
				<p style="margin:4px 0 0;font-size:11.5px;color:#64748b;">Ảnh này hiển thị trên trang chủ cộng đồng và chi tiết cấu hình.</p>
			</div>
		</div>

		<div style="background:#f1f5f9;border-radius:10px;padding:14px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;">
			<div>
				<span style="font-size:14px;font-weight:700;color:#0f172a;">💰 Tổng chi phí linh kiện:</span>
				<span id="pchub-total-display" style="font-size:18px;font-weight:900;color:#2563eb;margin-left:8px;">
					<?php echo number_format_i18n( $total_price ); ?> ₫
				</span>
			</div>
			<input type="hidden" name="_pchub_price" id="pchub_price_field" value="<?php echo esc_attr( $total_price ); ?>" />
		</div>

		<h4 style="margin:16px 0 10px;font-size:14px;color:#334155;"> Danh sách 8 linh kiện chính:</h4>
		<div class="pchub-parts-grid">
			<?php foreach ( $parts as $key => $meta ) :
				$name_val  = $raw_parts[ $key ]['name'] ?? get_post_meta( $post->ID, '_pchub_part_' . $key, true );
				$price_val = (int) ( $raw_parts[ $key ]['price'] ?? get_post_meta( $post->ID, '_pchub_part_price_' . $key, true ) );
			?>
				<div class="pchub-part-box">
					<div class="pchub-part-header">
						<span><?php echo esc_html( $meta['icon'] ); ?></span>
						<span><?php echo esc_html( $meta['label'] ); ?></span>
					</div>
					<div class="pchub-part-fields">
						<input type="text" name="_pchub_parts[<?php echo esc_attr( $key ); ?>][name]" value="<?php echo esc_attr( $name_val ); ?>" placeholder="Tên linh kiện..." class="pchub-part-name" style="padding:6px;border-radius:6px;" />
						<input type="number" name="_pchub_parts[<?php echo esc_attr( $key ); ?>][price]" value="<?php echo esc_attr( $price_val ); ?>" placeholder="Giá (VND)" class="pchub-part-price pchub-calc-price" min="0" style="padding:6px;border-radius:6px;" />
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-top:20px;">
			<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
				<h4 style="margin:0;font-size:14px;font-weight:700;color:#166534;display:flex;align-items:center;gap:6px;">
					🤖 Đánh giá & Báo cáo Tương thích AI
				</h4>
				<div style="display:flex;align-items:center;gap:8px;">
					<label style="font-size:13px;font-weight:600;color:#166534;">Điểm AI:</label>
					<input type="number" name="_pchub_ai_score" value="<?php echo esc_attr( $ai_score ); ?>" min="0" max="100" style="width:70px;padding:4px 8px;border-radius:6px;font-weight:700;color:#15803d;" />
					<span style="font-weight:700;color:#166534;">/ 100</span>
				</div>
			</div>
			<p style="margin:0 0 6px;font-size:12px;color:#15803d;font-weight:600;">Tóm tắt phân tích AI:</p>
			<textarea name="_pchub_ai_summary" rows="3" style="width:100%;border-radius:8px;padding:8px;font-size:13px;color:#1e293b;"><?php echo esc_textarea( $ai_summary ); ?></textarea>
		</div>

		<div style="margin-top:20px;">
			<h4 style="margin:0 0 6px;font-size:14px;color:#334155;">💬 Mô tả & Lời chia sẻ từ Tác giả:</h4>
			<textarea name="_pchub_description" rows="4" style="width:100%;border-radius:8px;padding:8px;font-size:13px;color:#1e293b;"><?php echo esc_textarea( $desc ); ?></textarea>
		</div>
	</div>

	<script>
	jQuery(document).ready(function($) {
		function recalcTotal() {
			var total = 0;
			$('.pchub-calc-price').each(function() {
				var p = parseInt($(this).val()) || 0;
				total += p;
			});
			$('#pchub_price_field').val(total);
			$('#pchub-total-display').text(new Intl.NumberFormat('vi-VN').format(total) + ' ₫');
		}
		$(document).on('input change', '.pchub-calc-price', recalcTotal);
	});
	</script>
	<?php
}

add_action( 'save_post_' . PCHUB_BUILD_POST_TYPE, 'pchub_community_save_meta', 10, 2 );
function pchub_community_save_meta( $post_id, $post ) {
	if ( ! isset( $_POST['pchub_build_meta_nonce'] ) || ! wp_verify_nonce( $_POST['pchub_build_meta_nonce'], 'pchub_build_meta_save' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['_pchub_image'] ) ) {
		update_post_meta( $post_id, '_pchub_image', sanitize_text_field( $_POST['_pchub_image'] ) );
	}
	if ( isset( $_POST['_pchub_status'] ) ) {
		$new_status = sanitize_text_field( $_POST['_pchub_status'] );
		update_post_meta( $post_id, '_pchub_status', $new_status );
		$target_post_status = ( 'approved' === $new_status ) ? 'publish' : 'draft';
		if ( get_post_status( $post_id ) !== $target_post_status ) {
			remove_action( 'save_post_' . PCHUB_BUILD_POST_TYPE, 'pchub_community_save_meta', 10 );
			wp_update_post( array(
				'ID'          => $post_id,
				'post_status' => $target_post_status,
			) );
			add_action( 'save_post_' . PCHUB_BUILD_POST_TYPE, 'pchub_community_save_meta', 10, 2 );
		}
	}
	if ( isset( $_POST['_pchub_category'] ) ) {
		update_post_meta( $post_id, '_pchub_category', sanitize_text_field( $_POST['_pchub_category'] ) );
	}
	if ( isset( $_POST['_pchub_author_name'] ) ) {
		update_post_meta( $post_id, '_pchub_author_name', sanitize_text_field( $_POST['_pchub_author_name'] ) );
	}
	if ( isset( $_POST['_pchub_author_role'] ) ) {
		update_post_meta( $post_id, '_pchub_author_role', sanitize_text_field( $_POST['_pchub_author_role'] ) );
	}
	if ( isset( $_POST['_pchub_likes'] ) ) {
		update_post_meta( $post_id, '_pchub_likes', (int) $_POST['_pchub_likes'] );
	}
	if ( isset( $_POST['_pchub_price'] ) ) {
		update_post_meta( $post_id, '_pchub_price', (int) $_POST['_pchub_price'] );
	}
	if ( isset( $_POST['_pchub_ai_score'] ) ) {
		update_post_meta( $post_id, '_pchub_ai_score', (int) $_POST['_pchub_ai_score'] );
	}
	if ( isset( $_POST['_pchub_ai_summary'] ) ) {
		update_post_meta( $post_id, '_pchub_ai_summary', sanitize_textarea_field( $_POST['_pchub_ai_summary'] ) );
	}
	if ( isset( $_POST['_pchub_description'] ) ) {
		update_post_meta( $post_id, '_pchub_description', sanitize_textarea_field( $_POST['_pchub_description'] ) );
	}

	if ( isset( $_POST['_pchub_parts'] ) && is_array( $_POST['_pchub_parts'] ) ) {
		$clean_parts = array();
		foreach ( $_POST['_pchub_parts'] as $key => $vals ) {
			$clean_parts[ $key ] = array(
				'name'  => sanitize_text_field( $vals['name'] ?? '' ),
				'price' => (int) ( $vals['price'] ?? 0 ),
			);
		}
		update_post_meta( $post_id, '_pchub_parts', $clean_parts );
	}
}

/* =========================================================================
 * 7. HELPER FORMAT DỮ LIỆU SANG NEXT.JS COMMUNITYBUILD
 * ========================================================================= */
function pchub_build_to_api_format( $post ) {
	if ( is_numeric( $post ) ) {
		$post = get_post( $post );
	}
	if ( ! $post ) return null;

	$post_id     = $post->ID;
	$raw_parts   = get_post_meta( $post_id, '_pchub_parts', true );
	if ( ! is_array( $raw_parts ) ) $raw_parts = array();

	$category    = get_post_meta( $post_id, '_pchub_category', true ) ?: 'Gaming';
	$price       = (int) get_post_meta( $post_id, '_pchub_price', true );
	$author_name = get_post_meta( $post_id, '_pchub_author_name', true ) ?: get_the_author_meta( 'display_name', $post->post_author );
	$author_role = get_post_meta( $post_id, '_pchub_author_role', true ) ?: 'Community Builder';
	$ai_score    = (int) ( get_post_meta( $post_id, '_pchub_ai_score', true ) ?: 100 );
	$ai_summary  = get_post_meta( $post_id, '_pchub_ai_summary', true ) ?: 'Cấu hình đã qua kiểm định đạt chuẩn tương thích.';
	$likes       = (int) get_post_meta( $post_id, '_pchub_likes', true );
	$comments    = (int) get_post_meta( $post_id, '_pchub_comments_count', true );
	$status      = get_post_meta( $post_id, '_pchub_status', true ) ?: 'pending';
	$desc        = get_post_meta( $post_id, '_pchub_description', true ) ?: $post->post_content;
	$image       = get_the_post_thumbnail_url( $post_id, 'large' ) ?: ( get_post_meta( $post_id, '_pchub_image', true ) ?: '/images/hero-pc.jpg' );

	$default_parts = array(
		'cpu'       => array( 'name' => 'Intel Core i5-14400F', 'price' => 5200000, 'specs' => '10 Nhân 16 Luồng' ),
		'gpu'       => array( 'name' => 'NVIDIA GeForce RTX 4060 8GB', 'price' => 8400000, 'specs' => 'GDDR6 DLSS 3' ),
		'ram'       => array( 'name' => '16GB DDR5 5600MHz (2x8GB)', 'price' => 1600000, 'specs' => 'Dual Channel' ),
		'mainboard' => array( 'name' => 'B760M DDR5', 'price' => 2900000 ),
		'ssd'       => array( 'name' => 'SSD NVMe M.2 1TB', 'price' => 1700000 ),
		'psu'       => array( 'name' => 'Nguồn 650W 80 Plus Bronze', 'price' => 1250000 ),
		'case'      => array( 'name' => 'Vỏ Case Gaming Kính Cường Lực', 'price' => 950000 ),
		'cooler'    => array( 'name' => 'Tản nhiệt tháp 4 ống đồng', 'price' => 450000 ),
	);

	$final_parts = array();
	foreach ( $default_parts as $k => $def ) {
		$final_parts[ $k ] = array(
			'name'  => ! empty( $raw_parts[ $k ]['name'] ) ? $raw_parts[ $k ]['name'] : $def['name'],
			'price' => ! empty( $raw_parts[ $k ]['price'] ) ? (int) $raw_parts[ $k ]['price'] : $def['price'],
			'specs' => $def['specs'] ?? '',
		);
	}

	return array(
		'id'              => (string) $post_id,
		'slug'            => $post->post_name ?: sanitize_title( $post->post_title ),
		'title'           => $post->post_title,
		'category'        => $category,
		'image'           => $image,
		'author'          => array(
			'name'   => $author_name ?: 'Thành viên PCHub',
			'avatar' => strtoupper( mb_substr( $author_name ?: 'P', 0, 1, 'UTF-8' ) ),
			'role'   => $author_role,
		),
		'parts'           => $final_parts,
		'price'           => $price > 0 ? $price : array_sum( array_column( $final_parts, 'price' ) ),
		'performanceNote' => '💡 Cấu hình ' . $category . ' do ' . $author_name . ' chia sẻ, được cộng đồng PCHub đánh giá cao.',
		'fpsBenchmarks'   => array(
			array( 'game' => 'Valorant / CS2', 'res1080p' => 280, 'res1440p' => 190, 'res4k' => 110, 'settings' => 'High' ),
			array( 'game' => 'Cyberpunk 2077', 'res1080p' => 105, 'res1440p' => 70, 'res4k' => 42, 'settings' => 'Ultra DLSS' ),
			array( 'game' => 'Black Myth: Wukong', 'res1080p' => 90, 'res1440p' => 60, 'res4k' => 38, 'settings' => 'High DLSS' ),
		),
		'powerConsumption' => array(
			'idleWatt'           => 50,
			'loadWatt'           => 380,
			'recommendedPsuWatt' => 650,
		),
		'aiCompatibility' => array(
			'status'        => $ai_score >= 80 ? 'compatible' : 'warning',
			'score'         => $ai_score,
			'socketMatch'   => true,
			'socketInfo'    => 'Chuẩn socket CPU và Bo mạch chủ ăn khớp hoàn hảo.',
			'psuAdequate'   => true,
			'psuInfo'       => 'Công suất nguồn đáp ứng tối ưu tổng tải tiêu thụ.',
			'clearanceOk'   => true,
			'clearanceInfo' => 'Kích thước case rộng rãi, chứa vừa card đồ họa và tản nhiệt.',
			'coolerOk'      => true,
			'coolerInfo'    => 'Tản nhiệt đảm bảo kiểm soát tốt nhiệt độ CPU khi vận hành nặng.',
			'summary'       => $ai_summary,
		),
		'aiVerified'     => $ai_score >= 90,
		'likes'          => $likes,
		'commentsCount'  => $comments,
		'createdAt'      => get_the_date( 'Y-m-d', $post_id ),
		'status'         => $status,
		'description'    => $desc,
		'tags'           => array( $category, 'Community Build', 'PCHub 2026' ),
	);
}

/* =========================================================================
 * 8. REST API ENDPOINTS ĐỒNG BỘ VỚI NEXT.JS
 * ========================================================================= */
add_action( 'rest_api_init', 'pchub_community_register_rest_routes' );
function pchub_community_register_rest_routes() {
	// GET /wp-json/pchub/v1/community/builds - Lấy danh sách cấu hình
	register_rest_route( 'pchub/v1', '/community/builds', array(
		'methods'             => 'GET',
		'callback'            => 'pchub_rest_get_community_builds',
		'permission_callback' => '__return_true',
	) );

	// POST /wp-json/pchub/v1/community/builds - Gửi cấu hình mới từ website
	register_rest_route( 'pchub/v1', '/community/builds', array(
		'methods'             => 'POST',
		'callback'            => 'pchub_rest_create_community_build',
		'permission_callback' => '__return_true',
	) );

	// GET /wp-json/pchub/v1/community/builds/(?P<id>[\w-]+) - Chi tiết 1 cấu hình
	register_rest_route( 'pchub/v1', '/community/builds/(?P<id>[\w-]+)', array(
		'methods'             => 'GET',
		'callback'            => 'pchub_rest_get_single_build',
		'permission_callback' => '__return_true',
	) );

	// POST /wp-json/pchub/v1/community/builds/(?P<id>[\w-]+)/like - Thích / Bỏ thích
	register_rest_route( 'pchub/v1', '/community/builds/(?P<id>[\w-]+)/like', array(
		'methods'             => 'POST',
		'callback'            => 'pchub_rest_toggle_like_build',
		'permission_callback' => '__return_true',
	) );

	// GET & POST /wp-json/pchub/v1/community/builds/(?P<id>[\w-]+)/comments - Bình luận
	register_rest_route( 'pchub/v1', '/community/builds/(?P<id>[\w-]+)/comments', array(
		array(
			'methods'             => 'GET',
			'callback'            => 'pchub_rest_get_build_comments',
			'permission_callback' => '__return_true',
		),
		array(
			'methods'             => 'POST',
			'callback'            => 'pchub_rest_add_build_comment',
			'permission_callback' => '__return_true',
		),
	) );

	// POST /wp-json/pchub/v1/community/builds/(?P<id>\d+)/moderate - Quản trị viên duyệt qua API
	register_rest_route( 'pchub/v1', '/community/builds/(?P<id>\d+)/moderate', array(
		'methods'             => 'POST',
		'callback'            => 'pchub_rest_moderate_build',
		'permission_callback' => function () {
			return current_user_can( 'edit_posts' );
		},
	) );
}

function pchub_rest_get_community_builds( WP_REST_Request $request ) {
	$status   = sanitize_text_field( $request->get_param( 'status' ) ?: 'approved' );
	$category = sanitize_text_field( $request->get_param( 'category' ) ?: '' );
	$limit    = (int) ( $request->get_param( 'limit' ) ?: 50 );

	$meta_query = array();
	if ( 'all' !== $status ) {
		$meta_query[] = array(
			'key'     => '_pchub_status',
			'value'   => $status,
			'compare' => '=',
		);
	}
	if ( ! empty( $category ) && 'ALL' !== strtoupper( $category ) ) {
		$meta_query[] = array(
			'key'     => '_pchub_category',
			'value'   => $category,
			'compare' => '=',
		);
	}

	$posts = get_posts( array(
		'post_type'      => PCHUB_BUILD_POST_TYPE,
		'post_status'    => array( 'publish', 'draft' ),
		'posts_per_page' => $limit,
		'orderby'        => 'date',
		'order'          => 'DESC',
		'meta_query'     => $meta_query,
	) );

	$builds = array();
	foreach ( $posts as $p ) {
		$formatted = pchub_build_to_api_format( $p );
		if ( $formatted ) {
			$builds[] = $formatted;
		}
	}

	return new WP_REST_Response( array(
		'success' => true,
		'total'   => count( $builds ),
		'data'    => $builds,
	), 200 );
}

function pchub_rest_create_community_build( WP_REST_Request $request ) {
	$params = $request->get_json_params() ?: $request->get_params();

	$title       = sanitize_text_field( $params['title'] ?? '' );
	$category    = sanitize_text_field( $params['category'] ?? 'Gaming' );
	$description = sanitize_textarea_field( $params['description'] ?? '' );
	$price       = (int) ( $params['price'] ?? 0 );
	$author_name = sanitize_text_field( $params['author']['name'] ?? ( $params['authorName'] ?? 'Thành viên PCHub' ) );
	$author_role = sanitize_text_field( $params['author']['role'] ?? 'Community Builder' );
	$raw_parts   = $params['parts'] ?? array();
	$ai_report   = $params['aiCompatibility'] ?? array();

	if ( empty( $title ) ) {
		return new WP_REST_Response( array(
			'success' => false,
			'message' => 'Vui lòng nhập tên cấu hình PC.',
		), 400 );
	}

	$post_id = wp_insert_post( array(
		'post_type'    => PCHUB_BUILD_POST_TYPE,
		'post_title'   => $title,
		'post_content' => $description,
		'post_status'  => 'draft', // Lưu dạng draft / pending để Admin kiểm duyệt
	) );

	if ( is_wp_error( $post_id ) ) {
		return new WP_REST_Response( array(
			'success' => false,
			'message' => $post_id->get_error_message(),
		), 500 );
	}

	// Mặc định cấu hình do người dùng gửi có trạng thái 'pending'
	update_post_meta( $post_id, '_pchub_status', 'pending' );
	update_post_meta( $post_id, '_pchub_category', $category );
	update_post_meta( $post_id, '_pchub_author_name', $author_name );
	update_post_meta( $post_id, '_pchub_author_role', $author_role );
	update_post_meta( $post_id, '_pchub_price', $price );
	update_post_meta( $post_id, '_pchub_description', $description );
	update_post_meta( $post_id, '_pchub_likes', 1 );
	update_post_meta( $post_id, '_pchub_comments_count', 0 );

	if ( ! empty( $params['image'] ) ) {
		update_post_meta( $post_id, '_pchub_image', sanitize_text_field( $params['image'] ) );
	}

	if ( ! empty( $ai_report['score'] ) ) {
		update_post_meta( $post_id, '_pchub_ai_score', (int) $ai_report['score'] );
	}
	if ( ! empty( $ai_report['summary'] ) ) {
		update_post_meta( $post_id, '_pchub_ai_summary', sanitize_textarea_field( $ai_report['summary'] ) );
	}

	if ( is_array( $raw_parts ) ) {
		$clean_parts = array();
		foreach ( array( 'cpu', 'gpu', 'ram', 'mainboard', 'ssd', 'psu', 'case', 'cooler' ) as $part_key ) {
			if ( isset( $raw_parts[ $part_key ] ) ) {
				$p = $raw_parts[ $part_key ];
				$clean_parts[ $part_key ] = array(
					'name'  => sanitize_text_field( is_array( $p ) ? ( $p['name'] ?? '' ) : $p ),
					'price' => (int) ( is_array( $p ) ? ( $p['price'] ?? 0 ) : 0 ),
				);
			}
		}
		update_post_meta( $post_id, '_pchub_parts', $clean_parts );
	}

	$slug = get_post_field( 'post_name', $post_id );

	return new WP_REST_Response( array(
		'success' => true,
		'id'      => (string) $post_id,
		'slug'    => $slug,
		'status'  => 'pending',
		'message' => 'Cấu hình của bạn đã được gửi thành công và đang chờ Quản trị viên duyệt!',
	), 201 );
}

function pchub_rest_get_single_build( WP_REST_Request $request ) {
	$id = $request->get_param( 'id' );

	$post = null;
	if ( is_numeric( $id ) ) {
		$post = get_post( (int) $id );
	}
	if ( ! $post ) {
		$found = get_posts( array(
			'post_type'      => PCHUB_BUILD_POST_TYPE,
			'name'           => sanitize_title( $id ),
			'posts_per_page' => 1,
			'post_status'    => array( 'publish', 'draft' ),
		) );
		if ( ! empty( $found ) ) {
			$post = $found[0];
		}
	}

	if ( ! $post || PCHUB_BUILD_POST_TYPE !== $post->post_type ) {
		return new WP_REST_Response( array(
			'success' => false,
			'message' => 'Không tìm thấy cấu hình này.',
		), 404 );
	}

	return new WP_REST_Response( array(
		'success' => true,
		'data'    => pchub_build_to_api_format( $post ),
	), 200 );
}

function pchub_rest_toggle_like_build( WP_REST_Request $request ) {
	$id = $request->get_param( 'id' );
	$post = is_numeric( $id ) ? get_post( (int) $id ) : null;
	if ( ! $post ) {
		$found = get_posts( array(
			'post_type'      => PCHUB_BUILD_POST_TYPE,
			'name'           => sanitize_title( $id ),
			'posts_per_page' => 1,
		) );
		if ( ! empty( $found ) ) {
			$post = $found[0];
		}
	}

	if ( ! $post ) {
		return new WP_REST_Response( array( 'success' => false, 'message' => 'Không tìm thấy cấu hình.' ), 404 );
	}

	$likes = (int) get_post_meta( $post->ID, '_pchub_likes', true );
	$body = $request->get_json_params() ?: array();
	$action = $body['action'] ?? 'toggle';

	if ( 'unlike' === $action ) {
		$likes = max( 0, $likes - 1 );
	} else {
		$likes += 1;
	}

	update_post_meta( $post->ID, '_pchub_likes', $likes );

	return new WP_REST_Response( array(
		'success' => true,
		'likes'   => $likes,
	), 200 );
}

function pchub_rest_get_build_comments( WP_REST_Request $request ) {
	$id = $request->get_param( 'id' );
	$comments_meta = get_post_meta( (int) $id, '_pchub_custom_comments', true );
	if ( ! is_array( $comments_meta ) ) $comments_meta = array();

	return new WP_REST_Response( array(
		'success' => true,
		'data'    => $comments_meta,
	), 200 );
}

function pchub_rest_add_build_comment( WP_REST_Request $request ) {
	$id     = (int) $request->get_param( 'id' );
	$params = $request->get_json_params() ?: $request->get_params();

	$content = sanitize_textarea_field( $params['content'] ?? '' );
	$name    = sanitize_text_field( $params['user']['name'] ?? ( $params['name'] ?? 'Thành viên PCHub' ) );

	if ( empty( $content ) ) {
		return new WP_REST_Response( array( 'success' => false, 'message' => 'Nội dung bình luận không được để trống.' ), 400 );
	}

	$comments = get_post_meta( $id, '_pchub_custom_comments', true );
	if ( ! is_array( $comments ) ) $comments = array();

	$new_comment = array(
		'id'        => 'cmt-' . time() . '-' . wp_rand( 100, 999 ),
		'buildId'   => (string) $id,
		'user'      => array(
			'name'   => $name,
			'avatar' => strtoupper( mb_substr( $name, 0, 1, 'UTF-8' ) ),
		),
		'content'   => $content,
		'createdAt' => current_time( 'Y-m-d H:i' ),
		'likes'     => 0,
	);

	array_unshift( $comments, $new_comment );
	update_post_meta( $id, '_pchub_custom_comments', $comments );
	update_post_meta( $id, '_pchub_comments_count', count( $comments ) );

	return new WP_REST_Response( array(
		'success' => true,
		'data'    => $new_comment,
		'total'   => count( $comments ),
	), 201 );
}

function pchub_rest_moderate_build( WP_REST_Request $request ) {
	$id     = (int) $request->get_param( 'id' );
	$params = $request->get_json_params() ?: $request->get_params();
	$status = sanitize_text_field( $params['status'] ?? 'approved' );

	if ( ! in_array( $status, array( 'approved', 'rejected', 'pending' ), true ) ) {
		return new WP_REST_Response( array( 'success' => false, 'message' => 'Trạng thái không hợp lệ.' ), 400 );
	}

	update_post_meta( $id, '_pchub_status', $status );
	if ( 'approved' === $status ) {
		wp_update_post( array( 'ID' => $id, 'post_status' => 'publish' ) );
	}

	return new WP_REST_Response( array(
		'success' => true,
		'id'      => $id,
		'status'  => $status,
		'message' => 'approved' === $status ? 'Đã duyệt cấu hình thành công!' : 'Đã cập nhật trạng thái.',
	), 200 );
}

/* =========================================================================
 * 9. AUTO SEEDER: NẠP CẤU HÌNH PC MẪU VÀO WORDPRESS
 * ========================================================================= */
function pchub_community_seed_default_builds( $force = false ) {
	$existing = get_posts( array(
		'post_type'      => PCHUB_BUILD_POST_TYPE,
		'post_status'    => array( 'publish', 'draft', 'pending' ),
		'posts_per_page' => -1,
		'fields'         => 'ids',
	) );

	if ( ! $force && ! empty( $existing ) ) {
		return count( $existing );
	}

	$sample_builds = array(
		array(
			'title'       => 'Project Neon: 4K Gaming Monster',
			'slug'        => 'project-neon-4k-gaming-monster',
			'category'    => 'Gaming',
			'author_name' => 'Alex Hải',
			'author_role' => 'Enthusiast Builder',
			'price'       => 86250000,
			'image'       => '/images/build-neon.jpg',
			'ai_score'    => 100,
			'ai_summary'  => 'Hệ thống đạt chuẩn tương thích 100%. CPU i9-14900K và RTX 4090 không bị nghẽn cổ chai, nguồn 1000W đáp ứng tối ưu.',
			'description' => 'Dàn máy mơ ước dành cho game thủ hardcore và streamer chuyên nghiệp. Thiết kế theo tông màu đen RGB đồng bộ, hỗ trợ 4K Max Settings 120+ FPS.',
			'likes'       => 154,
			'parts'       => array(
				'cpu'       => array( 'name' => 'Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)', 'price' => 15490000 ),
				'gpu'       => array( 'name' => 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X OC', 'price' => 52990000 ),
				'ram'       => array( 'name' => 'Corsair Dominator Titanium RGB 64GB (2x32GB) DDR5 6000MHz', 'price' => 6490000 ),
				'mainboard' => array( 'name' => 'ASUS ROG MAXIMUS Z790 HERO', 'price' => 15890000 ),
				'ssd'       => array( 'name' => 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2', 'price' => 4590000 ),
				'psu'       => array( 'name' => 'Corsair RM1000x Shift 1000W 80 Plus Gold ATX 3.0', 'price' => 4990000 ),
				'case'      => array( 'name' => 'Lian Li O11 Dynamic EVO RGB Black', 'price' => 3890000 ),
				'cooler'    => array( 'name' => 'Tản nhiệt nước NZXT Kraken Elite 360 RGB LCD', 'price' => 6890000 ),
			),
		),
		array(
			'title'       => 'Silent Render Node - 3D/Video Edit',
			'slug'        => 'silent-render-node-3d-video-edit',
			'category'    => 'Workstation',
			'author_name' => 'StudioPro VN',
			'author_role' => 'VFX Lead',
			'price'       => 72850000,
			'image'       => '/images/hero-pc.jpg',
			'ai_score'    => 100,
			'ai_summary'  => 'Tối ưu tuyệt đối cho render Blender, Maya, Premiere Pro và DaVinci Resolve. 128GB RAM Dual/Quad Channel siêu ổn định.',
			'description' => 'Máy trạm Workstation render 3D chuyên dụng, linh kiện cao cấp vận hành êm ái 24/7 dưới 32dB.',
			'likes'       => 89,
			'parts'       => array(
				'cpu'       => array( 'name' => 'AMD Ryzen 9 7950X (Up to 5.7GHz, 16 Nhân 32 Luồng)', 'price' => 14290000 ),
				'gpu'       => array( 'name' => 'MSI GeForce RTX 4080 Super 16GB GAMING X SLIM', 'price' => 29990000 ),
				'ram'       => array( 'name' => 'Kingston FURY Beast Black 128GB (4x32GB) DDR5 5600MHz', 'price' => 11990000 ),
				'mainboard' => array( 'name' => 'MSI MAG X670E TOMAHAWK WIFI', 'price' => 8490000 ),
				'ssd'       => array( 'name' => 'WD Black SN850X 2TB PCIe Gen4 NVMe M.2', 'price' => 4190000 ),
				'psu'       => array( 'name' => 'Super Flower Leadex VII Platinum Pro 1000W', 'price' => 4290000 ),
				'case'      => array( 'name' => 'Fractal Design Define 7 Solid Black Silent Case', 'price' => 4190000 ),
				'cooler'    => array( 'name' => 'Noctua NH-D15 chromax.black Dual Tower Cooler', 'price' => 2890000 ),
			),
		),
		array(
			'title'       => 'White Aesthetic Gaming PC - RTX 4070 Ti Super',
			'slug'        => 'white-aesthetic-gaming-pc-rtx-4070-ti-super',
			'category'    => 'Gaming',
			'author_name' => 'Linh Nguyễn',
			'author_role' => 'Streamer',
			'price'       => 48900000,
			'image'       => '/images/build-white.jpg',
			'ai_score'    => 98,
			'ai_summary'  => 'Tone trắng đồng bộ 100%. Tương thích hoàn hảo giữa linh kiện và phần mềm điều khiển LED.',
			'description' => 'Cấu hình góc máy tone trắng Pure White, hiệu năng đỉnh cao cân mượt mọi tựa game 2K/4K và livestream.',
			'likes'       => 230,
			'parts'       => array(
				'cpu'       => array( 'name' => 'Intel Core i7-14700K (Up to 5.6GHz, 20 Nhân 28 Luồng)', 'price' => 10990000 ),
				'gpu'       => array( 'name' => 'Gigabyte GeForce RTX 4070 Ti Super AERO OC 16GB', 'price' => 24490000 ),
				'ram'       => array( 'name' => 'Corsair Vengeance RGB White 32GB (2x16GB) DDR5 6000MHz', 'price' => 3290000 ),
				'mainboard' => array( 'name' => 'ASUS ROG STRIX B760-A GAMING WIFI White', 'price' => 5690000 ),
				'ssd'       => array( 'name' => 'Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2 White HS', 'price' => 2690000 ),
				'psu'       => array( 'name' => 'Seasonic Focus GX-850 White 850W 80 Plus Gold', 'price' => 3890000 ),
				'case'      => array( 'name' => 'NZXT H6 Flow RGB White Mid-Tower Case', 'price' => 3490000 ),
				'cooler'    => array( 'name' => 'DeepCool LT720 WH 360mm Liquid Cooler White', 'price' => 3290000 ),
			),
		),
		array(
			'title'       => 'Esports Dominator - 240Hz High FPS CS2 & Valorant',
			'slug'        => 'esports-dominator-240hz-high-fps',
			'category'    => 'Gaming',
			'author_name' => 'Duy Minh',
			'author_role' => 'Semi-Pro Gamer',
			'price'       => 26850000,
			'image'       => '/images/hero-pc.jpg',
			'ai_score'    => 100,
			'ai_summary'  => 'Ryzen 7 7800X3D là chip gaming số 1 hiện tại với 3D V-Cache, đẩy FPS các game Esports lên tới 500+ FPS mượt mà.',
			'description' => 'Vũ khí tối thượng cho game thủ FPS thi đấu chuyên nghiệp. Độ trễ 1% low cực thấp, không bao giờ drop hình.',
			'likes'       => 112,
			'parts'       => array(
				'cpu'       => array( 'name' => 'AMD Ryzen 7 7800X3D (Up to 5.0GHz, 8 Nhân 16 Luồng, 96MB 3D V-Cache)', 'price' => 10290000 ),
				'gpu'       => array( 'name' => 'ZOTAC GAMING GeForce RTX 4060 Ti 8GB Twin Edge', 'price' => 9990000 ),
				'ram'       => array( 'name' => 'G.Skill Flare X5 32GB (2x16GB) DDR5 6000MHz AMD EXPO', 'price' => 2890000 ),
				'mainboard' => array( 'name' => 'MSI B650M GAMING PLUS WIFI', 'price' => 3690000 ),
				'ssd'       => array( 'name' => 'Kingston KC3000 1TB PCIe 4.0 NVMe M.2 (7000MB/s)', 'price' => 2390000 ),
				'psu'       => array( 'name' => 'MSI MAG A750GL PCIE5 750W 80 Plus Gold', 'price' => 2390000 ),
				'case'      => array( 'name' => 'Montech AIR 100 ARGB Black Micro-ATX', 'price' => 1190000 ),
				'cooler'    => array( 'name' => 'Thermalright Peerless Assassin 120 SE ARGB', 'price' => 890000 ),
			),
		),
		array(
			'title'       => 'Streamer Pro Studio - Dual Monitor Ready',
			'slug'        => 'streamer-pro-studio-dual-monitor',
			'category'    => 'Streaming',
			'author_name' => 'Gia Huy',
			'author_role' => 'Content Creator',
			'price'       => 38600000,
			'image'       => '/images/hero-pc.jpg',
			'ai_score'    => 96,
			'ai_summary'  => 'Card RTX 4070 Super tích hợp dual AV1 encoder giúp livestream và ghi hình song song với độ nét cao không ảnh hưởng FPS.',
			'description' => 'Cấu hình thiết kế tối ưu cho Streamer vừa livestream 1080p60 vừa chơi game đồ họa cao và chạy OBS đa luồng.',
			'likes'       => 95,
			'parts'       => array(
				'cpu'       => array( 'name' => 'Intel Core i5-14600K (Up to 5.3GHz, 14 Nhân 20 Luồng)', 'price' => 7890000 ),
				'gpu'       => array( 'name' => 'Colorful iGame GeForce RTX 4070 Super Ultra W OC 12GB', 'price' => 17490000 ),
				'ram'       => array( 'name' => 'TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR5 6000MHz', 'price' => 2990000 ),
				'mainboard' => array( 'name' => 'Gigabyte Z790 GAMING X AX DDR5', 'price' => 5890000 ),
				'ssd'       => array( 'name' => 'Kingston NV2 1TB PCIe 4.0 NVMe M.2', 'price' => 1650000 ),
				'psu'       => array( 'name' => 'Corsair RM750e 750W 80 Plus Gold ATX 3.0', 'price' => 2890000 ),
				'case'      => array( 'name' => 'Corsair 4000D Airflow Black Mid-Tower', 'price' => 1990000 ),
				'cooler'    => array( 'name' => 'DeepCool AK620 Digital Black Dual Tower', 'price' => 1690000 ),
			),
		),
		array(
			'title'       => 'Budget King Gaming PC - Quốc Dân 15 Triệu',
			'slug'        => 'budget-king-gaming-pc-15m',
			'category'    => 'Budget',
			'author_name' => 'Hoàng Long',
			'author_role' => 'Student Builder',
			'price'       => 15490000,
			'image'       => '/images/hero-pc.jpg',
			'ai_score'    => 100,
			'ai_summary'  => 'Cấu hình quốc dân tối ưu tỉ lệ P/P (Hiệu năng / Giá tiền) cao nhất. Chiến mượt FIFA, LOL, Valorant, GTA V, Genshin Impact.',
			'description' => 'Dàn PC quốc dân ngon bổ rẻ dành cho học sinh, sinh viên với mức đầu tư hợp lý nhất.',
			'likes'       => 340,
			'parts'       => array(
				'cpu'       => array( 'name' => 'Intel Core i5-12400F (Up to 4.4GHz, 6 Nhân 12 Luồng)', 'price' => 2890000 ),
				'gpu'       => array( 'name' => 'Colorful GeForce RTX 3060 NB DUO 12G V2 L-V', 'price' => 7190000 ),
				'ram'       => array( 'name' => 'Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz', 'price' => 990000 ),
				'mainboard' => array( 'name' => 'ASUS PRIME B760M-K D4', 'price' => 2490000 ),
				'ssd'       => array( 'name' => 'Kingston NV2 500GB PCIe 4.0 NVMe M.2', 'price' => 990000 ),
				'psu'       => array( 'name' => 'Antec CSK650 650W 80 Plus Bronze', 'price' => 1190000 ),
				'case'      => array( 'name' => 'Xigmatek NYX Air 3F (Kèm 3 Fan RGB)', 'price' => 690000 ),
				'cooler'    => array( 'name' => 'Jonsbo CR-1000 EVO RGB Black', 'price' => 350000 ),
			),
		),
	);

	$seeded_count = 0;
	foreach ( $sample_builds as $item ) {
		$existing_post = get_page_by_path( $item['slug'], OBJECT, PCHUB_BUILD_POST_TYPE );
		if ( $existing_post ) continue;

		$post_id = wp_insert_post( array(
			'post_type'    => PCHUB_BUILD_POST_TYPE,
			'post_title'   => $item['title'],
			'post_name'    => $item['slug'],
			'post_content' => $item['description'],
			'post_status'  => 'publish',
		) );

		if ( $post_id && ! is_wp_error( $post_id ) ) {
			update_post_meta( $post_id, '_pchub_status', 'approved' );
			update_post_meta( $post_id, '_pchub_category', $item['category'] );
			update_post_meta( $post_id, '_pchub_author_name', $item['author_name'] );
			update_post_meta( $post_id, '_pchub_author_role', $item['author_role'] );
			update_post_meta( $post_id, '_pchub_price', $item['price'] );
			update_post_meta( $post_id, '_pchub_ai_score', $item['ai_score'] );
			update_post_meta( $post_id, '_pchub_ai_summary', $item['ai_summary'] );
			update_post_meta( $post_id, '_pchub_description', $item['description'] );
			update_post_meta( $post_id, '_pchub_likes', $item['likes'] );
			update_post_meta( $post_id, '_pchub_comments_count', 0 );
			update_post_meta( $post_id, '_pchub_image', $item['image'] );
			update_post_meta( $post_id, '_pchub_parts', $item['parts'] );
			$seeded_count++;
		}
	}

	return $seeded_count;
}

add_action( 'admin_init', 'pchub_community_check_auto_seed' );
function pchub_community_check_auto_seed() {
	if ( ! current_user_can( 'edit_posts' ) ) return;

	if ( isset( $_GET['pchub_action'] ) && 'seed_builds' === $_GET['pchub_action'] ) {
		check_admin_referer( 'pchub_seed_builds_nonce' );
		$count = pchub_community_seed_default_builds( true );
		wp_safe_redirect( admin_url( 'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE . '&pchub_seeded=' . $count ) );
		exit;
	}

	// Khi bấm nút Xóa sạch tất cả cấu hình mẫu
	if ( isset( $_GET['pchub_action'] ) && 'delete_sample_builds' === $_GET['pchub_action'] ) {
		check_admin_referer( 'pchub_delete_sample_nonce' );
		$sample_slugs = array(
			'project-neon-4k-gaming-monster',
			'silent-render-node-3d-video-edit',
			'white-aesthetic-gaming-pc-rtx-4070-ti-super',
			'esports-dominator-240hz-high-fps',
			'streamer-pro-studio-dual-monitor',
			'budget-king-gaming-pc-15m',
		);
		$deleted_count = 0;
		foreach ( $sample_slugs as $slug ) {
			$found = get_posts( array(
				'post_type'      => PCHUB_BUILD_POST_TYPE,
				'name'           => $slug,
				'post_status'    => array( 'publish', 'draft', 'pending', 'trash' ),
				'posts_per_page' => 1,
			) );
			if ( ! empty( $found ) ) {
				wp_delete_post( $found[0]->ID, true );
				$deleted_count++;
			}
		}

		$more_samples = get_posts( array(
			'post_type'      => PCHUB_BUILD_POST_TYPE,
			'post_status'    => array( 'publish', 'draft', 'pending', 'trash' ),
			'posts_per_page' => -1,
			'meta_key'       => '_pchub_is_sample',
			'meta_value'     => '1',
		) );
		foreach ( $more_samples as $ms ) {
			wp_delete_post( $ms->ID, true );
			$deleted_count++;
		}

		wp_safe_redirect( admin_url( 'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE . '&pchub_deleted_samples=' . $deleted_count ) );
		exit;
	}
}

add_action( 'admin_notices', 'pchub_community_admin_notices' );
function pchub_community_admin_notices() {
	global $pagenow, $post_type;
	if ( 'edit.php' !== $pagenow || PCHUB_BUILD_POST_TYPE !== $post_type ) return;

	if ( isset( $_GET['pchub_seeded'] ) ) {
		$count = (int) $_GET['pchub_seeded'];
		printf(
			'<div class="notice notice-success is-dismissible"><p><strong>🎉 Thành công!</strong> Đã nạp %d cấu hình PC mẫu vào hệ thống Cộng đồng WordPress.</p></div>',
			$count
		);
	}

	if ( isset( $_GET['pchub_deleted_samples'] ) ) {
		$count = (int) $_GET['pchub_deleted_samples'];
		printf(
			'<div class="notice notice-success is-dismissible"><p><strong>✔ Đã xóa thành công!</strong> Đã dọn dẹp và xóa vĩnh viễn %d cấu hình mẫu khỏi cơ sở dữ liệu WordPress.</p></div>',
			$count
		);
	}

	$seed_url   = wp_nonce_url( admin_url( 'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE . '&pchub_action=seed_builds' ), 'pchub_seed_builds_nonce' );
	$delete_url = wp_nonce_url( admin_url( 'edit.php?post_type=' . PCHUB_BUILD_POST_TYPE . '&pchub_action=delete_sample_builds' ), 'pchub_delete_sample_nonce' );
	?>
	<div class="notice notice-info" style="border-left-color:#2563eb;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;flex-wrap:wrap;gap:10px;">
		<div>
			<strong style="color:#1d4ed8;">⚡ Quản lý cấu hình Cộng đồng PC:</strong>
			<span>Chỉ các cấu hình có trạng thái <strong>✔ Đã duyệt</strong> mới được hiển thị công khai trên website. Các cấu hình <strong>✖ Từ chối</strong> hoặc <strong>⏳ Chờ duyệt</strong> sẽ ở dạng Bản nháp (Draft) và bị ẩn hoàn toàn khỏi người dùng.</span>
		</div>
		<div style="display:flex;gap:8px;">
			<a href="<?php echo esc_url( $delete_url ); ?>" onclick="return confirm('Bạn có chắc chắn muốn xóa vĩnh viễn toàn bộ các cấu hình mẫu này không?');" class="button" style="color:#b91c1c;border-color:#fca5a5;background:#fef2f2;font-weight:700;">
				🗑️ Xóa toàn bộ dữ liệu mẫu
			</a>
			<a href="<?php echo esc_url( $seed_url ); ?>" class="button button-secondary" style="font-weight:600;">
				⚡ Nạp cấu hình mẫu
			</a>
		</div>
	</div>
	<?php
}
