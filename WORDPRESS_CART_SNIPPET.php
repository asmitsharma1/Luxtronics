<?php
/**
 * ============================================================
 * LUXTRONICS — WordPress Cart Handler Snippet
 * ============================================================
 * Add this to WordPress via:
 *   Plugins → Code Snippets → Add New → paste → Save & Activate
 *
 * OR add to your theme's functions.php
 *
 * What this does:
 *  1. Reads ?lux_cart=[...] param → clears WC cart → adds all items → redirects to /checkout/
 *  2. Reads ?add-to-cart=ID&redirect_to=URL → WooCommerce handles natively,
 *     but we also force redirect to checkout after add
 *  3. After order complete → sends WhatsApp notifications to customer/admin
 *  4. After order complete → redirects back to React app /account/orders
 * ============================================================
 */

// ── WhatsApp notification config ─────────────────────────────────────────────
// Set these in wp-config.php or your code snippets environment.
// The customer/admin phone numbers must include country code and no + or spaces.
if ( ! defined( 'LUXTRONICS_WHATSAPP_PHONE_NUMBER_ID' ) ) define( 'LUXTRONICS_WHATSAPP_PHONE_NUMBER_ID', '' );
if ( ! defined( 'LUXTRONICS_WHATSAPP_ACCESS_TOKEN' ) ) define( 'LUXTRONICS_WHATSAPP_ACCESS_TOKEN', '' );
if ( ! defined( 'LUXTRONICS_ADMIN_WHATSAPP_NUMBER' ) ) define( 'LUXTRONICS_ADMIN_WHATSAPP_NUMBER', '' );
if ( ! defined( 'LUXTRONICS_WHATSAPP_TEMPLATE_NAME' ) ) define( 'LUXTRONICS_WHATSAPP_TEMPLATE_NAME', '' );
if ( ! defined( 'LUXTRONICS_WHATSAPP_TEMPLATE_LANG' ) ) define( 'LUXTRONICS_WHATSAPP_TEMPLATE_LANG', 'en_US' );

function luxtronics_whatsapp_enabled() {
    return defined( 'LUXTRONICS_WHATSAPP_PHONE_NUMBER_ID' ) && LUXTRONICS_WHATSAPP_PHONE_NUMBER_ID
        && defined( 'LUXTRONICS_WHATSAPP_ACCESS_TOKEN' ) && LUXTRONICS_WHATSAPP_ACCESS_TOKEN;
}

function luxtronics_normalize_phone( $phone ) {
    return preg_replace( '/\D+/', '', (string) $phone );
}

function luxtronics_format_order_invoice( $order ) {
    if ( ! $order ) return '';

    $lines = array();
    $lines[] = 'Luxtronics Invoice';
    $lines[] = 'Order #' . $order->get_order_number();
    $lines[] = 'Date: ' . wc_format_datetime( $order->get_date_created() );
    $lines[] = 'Customer: ' . trim( $order->get_formatted_billing_full_name() );
    $lines[] = 'Phone: ' . luxtronics_normalize_phone( $order->get_billing_phone() );
    $lines[] = '';
    $lines[] = 'Items:';

    foreach ( $order->get_items() as $item ) {
        $qty = max( 1, (int) $item->get_quantity() );
        $name = $item->get_name();
        $total = html_entity_decode( wp_strip_all_tags( wc_price( $item->get_total() + $item->get_total_tax() ) ) );
        $lines[] = '- ' . $name . ' x' . $qty . ' = ' . $total;
    }

    $lines[] = '';
    $lines[] = 'Subtotal: ' . html_entity_decode( wp_strip_all_tags( wc_price( $order->get_subtotal() ) ) );
    $lines[] = 'Shipping: ' . html_entity_decode( wp_strip_all_tags( wc_price( $order->get_shipping_total() ) ) );
    $lines[] = 'Tax: ' . html_entity_decode( wp_strip_all_tags( wc_price( $order->get_total_tax() ) ) );
    $lines[] = 'Total: ' . html_entity_decode( wp_strip_all_tags( wc_price( $order->get_total() ) ) );
    $lines[] = 'Payment: ' . $order->get_payment_method_title();

    $billing_address = trim( preg_replace( '/\s+/', ' ', $order->get_formatted_billing_address() ) );
    if ( $billing_address ) {
        $lines[] = 'Billing: ' . wp_strip_all_tags( $billing_address );
    }

    return implode( "\n", $lines );
}

function luxtronics_format_order_email_html( $order, $title ) {
    if ( ! $order ) return '';

    $items_html = '';
    foreach ( $order->get_items() as $item ) {
        $qty = max( 1, (int) $item->get_quantity() );
        $line_total = html_entity_decode( wp_strip_all_tags( wc_price( $item->get_total() + $item->get_total_tax() ) ) );
        $items_html .= '<tr>'
            . '<td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">' . esc_html( $item->get_name() ) . '</td>'
            . '<td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;">' . esc_html( $qty ) . '</td>'
            . '<td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;">' . esc_html( $line_total ) . '</td>'
            . '</tr>';
    }

    $subtotal = html_entity_decode( wp_strip_all_tags( wc_price( $order->get_subtotal() ) ) );
    $shipping  = html_entity_decode( wp_strip_all_tags( wc_price( $order->get_shipping_total() ) ) );
    $tax       = html_entity_decode( wp_strip_all_tags( wc_price( $order->get_total_tax() ) ) );
    $total     = html_entity_decode( wp_strip_all_tags( wc_price( $order->get_total() ) ) );

    ob_start();
    ?>
    <div style="font-family:Arial,sans-serif;color:#111827;background:#f9fafb;padding:24px;border-radius:16px;max-width:720px;margin:0 auto;">
        <h2 style="margin:0 0 12px;font-size:24px;line-height:1.2;"><?php echo esc_html( $title ); ?></h2>
        <p style="margin:0 0 18px;color:#6b7280;">Order #<?php echo esc_html( $order->get_order_number() ); ?> • <?php echo esc_html( wc_format_datetime( $order->get_date_created() ) ); ?></p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;overflow:hidden;">
            <thead>
                <tr>
                    <th align="left" style="padding:10px 0;border-bottom:1px solid #e5e7eb;">Product</th>
                    <th align="center" style="padding:10px 0;border-bottom:1px solid #e5e7eb;">Qty</th>
                    <th align="right" style="padding:10px 0;border-bottom:1px solid #e5e7eb;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <?php echo $items_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
            </tbody>
        </table>
        <div style="margin-top:18px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">
            <p style="margin:0 0 8px;"><strong>Subtotal:</strong> <?php echo esc_html( $subtotal ); ?></p>
            <p style="margin:0 0 8px;"><strong>Shipping:</strong> <?php echo esc_html( $shipping ); ?></p>
            <p style="margin:0 0 8px;"><strong>Tax:</strong> <?php echo esc_html( $tax ); ?></p>
            <p style="margin:0;font-size:18px;"><strong>Total:</strong> <?php echo esc_html( $total ); ?></p>
        </div>
    </div>
    <?php
    return (string) ob_get_clean();
}

function luxtronics_send_order_email( $to, $subject, $order, $title ) {
    $to = sanitize_email( $to );
    if ( ! $to || ! is_email( $to ) || ! $order ) {
        return false;
    }

    $headers = array( 'Content-Type: text/html; charset=UTF-8' );
    $body = luxtronics_format_order_email_html( $order, $title );

    return wp_mail( $to, $subject, $body, $headers );
}

function luxtronics_send_whatsapp_message( $to, $message ) {
    if ( ! luxtronics_whatsapp_enabled() ) {
        return false;
    }

    $to = luxtronics_normalize_phone( $to );
    $message = trim( (string) $message );

    if ( ! $to || ! $message ) {
        return false;
    }

    $url = 'https://graph.facebook.com/v19.0/' . rawurlencode( LUXTRONICS_WHATSAPP_PHONE_NUMBER_ID ) . '/messages';

    $payload = array(
        'messaging_product' => 'whatsapp',
        'to'   => $to,
        'type' => 'text',
        'text' => array(
            'preview_url' => false,
            'body' => $message,
        ),
    );

    // If you have an approved order-completion template, use it instead of free text.
    // Keep the message body as fallback because a template may not be configured yet.
    if ( defined( 'LUXTRONICS_WHATSAPP_TEMPLATE_NAME' ) && LUXTRONICS_WHATSAPP_TEMPLATE_NAME ) {
        $payload = array(
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'template',
            'template' => array(
                'name' => LUXTRONICS_WHATSAPP_TEMPLATE_NAME,
                'language' => array(
                    'code' => LUXTRONICS_WHATSAPP_TEMPLATE_LANG,
                ),
                'components' => array(
                    array(
                        'type' => 'body',
                        'parameters' => array(
                            array( 'type' => 'text', 'text' => $message ),
                        ),
                    ),
                ),
            ),
        );
    }

    $response = wp_remote_post( $url, array(
        'headers' => array(
            'Authorization' => 'Bearer ' . LUXTRONICS_WHATSAPP_ACCESS_TOKEN,
            'Content-Type'  => 'application/json',
        ),
        'body' => wp_json_encode( $payload ),
        'timeout' => 20,
    ) );

    if ( is_wp_error( $response ) ) {
        error_log( 'Luxtronics WhatsApp error: ' . $response->get_error_message() );
        return false;
    }

    $code = wp_remote_retrieve_response_code( $response );
    if ( $code < 200 || $code >= 300 ) {
        error_log( 'Luxtronics WhatsApp error: HTTP ' . $code . ' ' . wp_remote_retrieve_body( $response ) );
        return false;
    }

    return true;
}

function luxtronics_notify_order_completed( $order_id ) {
    if ( ! $order_id ) return;

    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    if ( $order->get_meta( '_luxtronics_whatsapp_notified' ) ) {
        return;
    }

    $invoice_text = luxtronics_format_order_invoice( $order );
    if ( ! $invoice_text ) return;

    $customer_phone = $order->get_billing_phone();
    $admin_phone    = defined( 'LUXTRONICS_ADMIN_WHATSAPP_NUMBER' ) ? LUXTRONICS_ADMIN_WHATSAPP_NUMBER : '';
    $customer_email = $order->get_billing_email();
    $admin_email    = get_option( 'admin_email' );

    $customer_message = "Hi " . trim( $order->get_billing_first_name() ) . ", your Luxtronics order has been completed.\n\n" . $invoice_text . "\n\nThanks for shopping with Luxtronics.";
    $admin_message = "New completed order at Luxtronics.\n\n" . $invoice_text . "\n\nSold items above are the confirmed products in this order.";

    $customer_sent = luxtronics_send_whatsapp_message( $customer_phone, $customer_message );
    $admin_sent = $admin_phone ? luxtronics_send_whatsapp_message( $admin_phone, $admin_message ) : false;

    $customer_email_sent = luxtronics_send_order_email(
        $customer_email,
        'Your Luxtronics invoice for order #' . $order->get_order_number(),
        $order,
        'Your Luxtronics Invoice'
    );
    $admin_email_sent = luxtronics_send_order_email(
        $admin_email,
        'New Luxtronics order #' . $order->get_order_number(),
        $order,
        'New Completed Order'
    );

    if ( $customer_sent || $admin_sent || $customer_email_sent || $admin_email_sent ) {
        $order->update_meta_data( '_luxtronics_whatsapp_notified', current_time( 'mysql' ) );
        $order->save();
        $order->add_order_note( 'Order notifications sent to customer/admin via WhatsApp and email where available.' );
    }
}

add_action( 'woocommerce_payment_complete', 'luxtronics_notify_order_completed', 20, 1 );
add_action( 'woocommerce_order_status_completed', 'luxtronics_notify_order_completed', 20, 1 );

// ── 1. Handle multi-item cart from React ─────────────────────────────────────
add_action( 'template_redirect', 'luxtronics_handle_react_cart', 1 );

function luxtronics_handle_react_cart() {
    if ( ! isset( $_GET['lux_cart'] ) ) return;

    // Decode cart items
    $raw        = stripslashes( $_GET['lux_cart'] );
    $cart_items = json_decode( $raw, true );

    if ( ! is_array( $cart_items ) || empty( $cart_items ) ) return;

    // Make sure WooCommerce is ready
    if ( ! function_exists( 'WC' ) || ! WC()->cart ) return;

    // Clear existing cart
    WC()->cart->empty_cart();

    $added = 0;
    foreach ( $cart_items as $item ) {
        $product_id   = isset( $item['product_id'] )   ? absint( $item['product_id'] )   : 0;
        $quantity     = isset( $item['quantity'] )      ? absint( $item['quantity'] )      : 1;
        $variation_id = isset( $item['variation_id'] )  ? absint( $item['variation_id'] )  : 0;

        if ( $product_id <= 0 ) continue;

        $result = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id );
        if ( $result ) $added++;
    }

    // Redirect to checkout (or cart if nothing was added)
    $redirect = $added > 0
        ? wc_get_checkout_url()
        : wc_get_cart_url();

    wp_safe_redirect( $redirect );
    exit;
}


// ── 2. After Buy Now (?add-to-cart=ID on /shop/) → force redirect to checkout ─
add_filter( 'woocommerce_add_to_cart_redirect', 'luxtronics_buynow_redirect', 99, 2 );

function luxtronics_buynow_redirect( $url, $product ) {
    // If the request came from our React app (has add-to-cart in GET)
    // always redirect straight to checkout — skip the cart page
    if ( isset( $_GET['add-to-cart'] ) ) {
        return wc_get_checkout_url();
    }
    return $url;
}


// ── 3. After order complete → redirect back to React app ─────────────────────
add_action( 'woocommerce_thankyou', 'luxtronics_redirect_after_order', 10, 1 );

function luxtronics_redirect_after_order( $order_id ) {
    if ( ! $order_id ) return;

    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    // Determine which React domain to redirect to
    $host = isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : '';

    if ( strpos( $host, 'storeau' ) !== false || strpos( $host, '.com.au' ) !== false ) {
        $react_base = 'https://luxtronics.com.au';
    } elseif ( strpos( $host, 'storenz' ) !== false || strpos( $host, '.co.nz' ) !== false ) {
        $react_base = 'https://luxtronics.co.nz';
    } else {
        $react_base = 'https://luxtronics.in';
    }

    $redirect_url = add_query_arg( array(
        'order_complete' => '1',
        'order_id'       => $order_id,
        'order_key'      => $order->get_order_key(),
    ), $react_base . '/account/orders' );

    // Show a brief thank-you message, then auto-redirect after 3 seconds
    ?>
    <div style="
        text-align:center;
        padding:24px;
        margin:20px 0;
        background:#f0fdf4;
        border:2px solid #22c55e;
        border-radius:12px;
        font-family:sans-serif;
    ">
        <p style="font-size:18px;color:#15803d;font-weight:700;margin:0 0 8px;">
            ✅ Order Placed Successfully!
        </p>
        <p style="font-size:14px;color:#6b7280;margin:0;">
            Redirecting you to your order history in 3 seconds…
        </p>
    </div>
    <script>
        setTimeout( function() {
            window.location.href = '<?php echo esc_js( $redirect_url ); ?>';
        }, 3000 );
    </script>
    <?php
}


// ── 4. Allow CORS for React app API calls ────────────────────────────────────
add_action( 'init', 'luxtronics_cors_headers' );

function luxtronics_cors_headers() {
    $allowed = array(
        'https://luxtronics.in',
        'https://www.luxtronics.in',
        'https://luxtronics.com.au',
        'https://www.luxtronics.com.au',
        'https://luxtronics.co.nz',
        'https://www.luxtronics.co.nz',
    );

    $origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';

    if ( in_array( $origin, $allowed, true ) ) {
        header( 'Access-Control-Allow-Origin: '  . $origin );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
    }

    // Handle preflight
    if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
        status_header( 200 );
        exit;
    }
}
