# Hướng Dẫn Kết Nối Và Lấy Dữ Liệu Từ Hệ Thống Sbuy (Sbuy API Integration Guide)

Tài liệu này cung cấp hướng dẫn chi tiết dành cho các dự án bên ngoài (Web app, Mobile app, Hệ thống ERP, CRM, POS hoặc các dịch vụ microservice khác) để **kết nối bằng API Key** nhằm xác thực và lấy dữ liệu sản phẩm, danh mục, tồn kho từ hệ thống **Sbuy**.

---

## 🔑 1. BỘ KEY KẾT NỐI (API CREDENTIALS)

Mọi yêu cầu truy vấn dữ liệu từ Sbuy đều cần có bộ cặp Key xác thực bao gồm **Consumer Key** và **Consumer Secret**:

- **URL Hệ Thống Sbuy (Base URL)**: `https://sbuy.io.vn` *(Hoặc tên miền chính thức của Sbuy)*
- **Consumer Key (Mã Key)**: `ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e`
- **Consumer Secret (Mã Bảo Mật)**: `cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873`

> ⚠️ **Lưu ý quan trọng về bảo mật Key**:
> - Cặp Key có quyền đọc dữ liệu sản phẩm và đơn hàng từ Sbuy.
> - **Không để lộ Consumer Secret** trên các mã nguồn công khai (Public GitHub) hoặc ứng dụng Client-side công khai.
> - Trên các ứng dụng Server/Backend, hãy lưu bộ Key này vào biến môi trường `.env` (ví dụ: `SBUY_CONSUMER_KEY` và `SBUY_CONSUMER_SECRET`).

---

## 🚀 2. GHI RÕ 3 CÁCH KẾT NỐI BẰNG KEY

Hệ thống Sbuy hỗ trợ **3 cách truyền Key** để xác thực truy vấn:

```
+-----------------------------------------------------------------------------------+
|                            3 CÁCH KẾT NỐI BẰNG KEY                                 |
+-----------------------------------------------------------------------------------+
| Cách 1: Truyền Key trực tiếp trên URL Query Parameters (Đơn giản nhất)           |
| Cách 2: Truyền Key qua Header HTTP Basic Authentication (Khuyên dùng cho Server)  |
| Cách 3: Truyền Key qua API Proxy Bridge (Dành cho Frontend / React / Mobile App)  |
+-----------------------------------------------------------------------------------+
```

---

### 🔹 CÁCH 1: Truyền Key Trực Tiếp Trên URL Query Parameters (Đơn Giản Nhất)

Đây là cách kết nối nhanh nhất, có thể dùng trực tiếp trên trình duyệt, cURL hoặc Postman bằng cách đính kèm `consumer_key` và `consumer_secret` vào tham số URL.

#### Cấu trúc URL:
```http
GET https://sbuy.io.vn/wp-json/wc/v3/products?consumer_key=YOUR_CONSUMER_KEY&consumer_secret=YOUR_CONSUMER_SECRET
```

#### Ví dụ URL thực tế với Key của Sbuy:
```http
https://sbuy.io.vn/wp-json/wc/v3/products?consumer_key=ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e&consumer_secret=cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873&per_page=10&page=1
```

#### Ví dụ cURL:
```bash
curl -X GET "https://sbuy.io.vn/wp-json/wc/v3/products?consumer_key=ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e&consumer_secret=cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873&per_page=10"
```

---

### 🔹 CÁCH 2: Truyền Key Qua Header HTTP Basic Authentication (Chuẩn Bảo Mật Backend)

Khi gọi API từ Server-to-Server qua kết nối HTTPS, dự án của bạn nên truyền Key thông qua HTTP Header `Authorization`.

#### Quy trình tạo chuỗi Authorization Header:
1. Nối Consumer Key và Consumer Secret bằng dấu hai chấm `:`.
   `ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e:cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873`
2. Mã hóa Base64 chuỗi vừa tạo.
3. Đính kèm vào Header `Authorization: Basic <chuỗi_base64>`.

#### Ví dụ cURL dùng `-u` (cURL tự động mã hóa Basic Auth Key):
```bash
curl -X GET "https://sbuy.io.vn/wp-json/wc/v3/products?per_page=10" \
  -u "ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e:cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873"
```

#### Ví dụ Node.js / JavaScript (Fetch API với Authorization Header):
```javascript
const consumerKey = 'ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e';
const consumerSecret = 'cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873';

// Mã hóa Key sang dạng Basic Auth Token Base64
const authToken = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

fetch('https://sbuy.io.vn/wp-json/wc/v3/products?per_page=10', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authToken}`
  }
})
.then(res => res.json())
.then(data => console.log('Danh sách sản phẩm Sbuy:', data))
.catch(err => console.error('Lỗi khi gọi API:', err));
```

---

### 🔹 CÁCH 3: Truyền Key Qua API Proxy Endpoint Của Sbuy Bridge (Khuyến Dùng Cho Frontend/Mobile)

Nếu ứng dụng ngoài của bạn là ứng dụng Single Page (React, Vue, Mobile App) cần gọi thông qua middleware proxy để tránh lỗi CORS hoặc TLS local:

#### Endpoint Proxy:
`GET /api/woocommerce/products`

#### Các tham số Query bắt buộc có Key:
- `baseUrl`: `https://sbuy.io.vn`
- `consumerKey`: `ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e`
- `consumerSecret`: `cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873`

#### Ví dụ gọi Proxy API với Key:
```http
GET http://localhost:3000/api/woocommerce/products?baseUrl=https://sbuy.io.vn&consumerKey=ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e&consumerSecret=cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873&page=1&perPage=10
```

---

## 📡 3. CÁC ENDPOINT LẤY DỮ LIỆU SBUY KHI DÙNG KEY

Khi đã có Key, bạn có thể gọi tất cả các endpoint lấy dữ liệu sau:

| Thao tác | Đường dẫn Endpoint khi kết nối bằng Key |
| :--- | :--- |
| **Lấy danh sách sản phẩm** | `GET /wp-json/wc/v3/products?consumer_key=ck_...&consumer_secret=cs_...` |
| **Lấy danh sách danh mục** | `GET /wp-json/wc/v3/products/categories?consumer_key=ck_...&consumer_secret=cs_...` |
| **Lấy chi tiết 1 sản phẩm** | `GET /wp-json/wc/v3/products/{id}?consumer_key=ck_...&consumer_secret=cs_...` |
| **Lọc sản phẩm theo từ khóa** | `GET /wp-json/wc/v3/products?search=laptop&consumer_key=ck_...&consumer_secret=cs_...` |
| **Lọc theo trạng thái kho** | `GET /wp-json/wc/v3/products?stock_status=instock&consumer_key=ck_...&consumer_secret=cs_...` |
| **Lọc theo ID danh mục** | `GET /wp-json/wc/v3/products?category=18&consumer_key=ck_...&consumer_secret=cs_...` |

---

## 💻 4. MÃ NGUỒN MẪU TÍCH HỢP BẰNG KEY

### 4.1. Node.js (Sử dụng SDK Chính Thức `@woocommerce/woocommerce-rest-api`)

```bash
npm install @woocommerce/woocommerce-rest-api
```

```javascript
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

// Khởi tạo Client bằng Key
const sbuyClient = new WooCommerceRestApi({
  url: 'https://sbuy.io.vn',
  consumerKey: 'ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e', // Consumer Key của bạn
  consumerSecret: 'cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873', // Consumer Secret của bạn
  version: 'wc/v3'
});

async function getProductsFromSbuy() {
  try {
    const response = await sbuyClient.get("products", {
      per_page: 20,
      page: 1,
      stock_status: "instock"
    });
    
    console.log("Tổng sản phẩm:", response.headers["x-wp-total"]);
    console.log("Danh sách sản phẩm Sbuy:", response.data);
  } catch (error) {
    console.error("Lỗi xác thực Key hoặc lỗi kết nối:", error.response ? error.response.data : error.message);
  }
}

getProductsFromSbuy();
```

---

### 4.2. Python (Sử dụng gói `woocommerce` API)

```bash
pip install woocommerce
```

```python
from woocommerce import API

# Khởi tạo kết nối bằng Key
sbuy_api = API(
    url="https://sbuy.io.vn",
    consumer_key="ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e",
    consumer_secret="cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873",
    version="wc/v3",
    timeout=15
)

# Gọi lấy danh sách sản phẩm
response = sbuy_api.get("products", params={"per_page": 10, "page": 1})

if response.status_code == 200:
    products = response.json()
    print(f"Đã xác thực thành công! Số sản phẩm lấy được: {len(products)}")
    for p in products:
        print(f"ID: {p['id']} | Tên: {p['name']} | Giá: {p['price']} VNĐ | Tồn kho: {p['stock_quantity']}")
else:
    print(f"Xác thực thất bại! Mã lỗi HTTP: {response.status_code}")
    print(response.text)
```

---

### 4.3. PHP (Sử dụng `GuzzleHTTP` với Basic Key Auth)

```php
<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$consumerKey = 'ck_2a5246eeaf5b0b759796aed76d5d891f03bbdd4e';
$consumerSecret = 'cs_6d3b0d39129dd0849c06a977fbb75cbb9186f873';

$client = new Client([
    'base_uri' => 'https://sbuy.io.vn/wp-json/wc/v3/',
    'timeout'  => 10.0,
    'auth' => [$consumerKey, $consumerSecret] // Guzzle tự động xử lý Basic Auth với Key
]);

try {
    $response = $client->request('GET', 'products', [
        'query' => [
            'per_page' => 10,
            'page' => 1
        ]
    ]);

    $products = json_decode($response->getBody(), true);
    echo "Lấy thành công " . count($products) . " sản phẩm từ Sbuy.\n";
} catch (Exception $e) {
    echo "Lỗi kết nối bằng Key: " . $e->getMessage();
}
```

---

## 🛠️ 5. CẤU TRÚC DỮ LIỆU SẢN PHẨM TRẢ VỀ KHI DÙNG KEY

Khi truy vấn thành công với Key, hệ thống Sbuy trả về danh sách sản phẩm dạng mảng JSON:

```json
[
  {
    "id": 1024,
    "name": "Laptop Gaming Sbuy Pro 15",
    "slug": "laptop-gaming-sbuy-pro-15",
    "permalink": "https://sbuy.io.vn/product/laptop-gaming-sbuy-pro-15",
    "date_created": "2026-01-15T08:30:00",
    "type": "simple",
    "status": "publish",
    "featured": true,
    "sku": "SBUY-LAP-001",
    "price": "25000000",
    "regular_price": "27000000",
    "sale_price": "25000000",
    "on_sale": true,
    "manage_stock": true,
    "stock_quantity": 15,
    "stock_status": "instock",
    "categories": [
      {
        "id": 18,
        "name": "Laptop Gaming",
        "slug": "laptop-gaming"
      }
    ],
    "images": [
      {
        "id": 501,
        "src": "https://sbuy.io.vn/wp-content/uploads/2026/01/laptop.jpg",
        "name": "laptop-main",
        "alt": "Laptop Gaming Sbuy"
      }
    ]
  }
]
```

---

## 🛑 6. NẾU KEY SAI HẶC HẾT HẠN (ERROR HANDLING)

Nếu Key của bạn bị sai, thiếu hoặc bị thu hồi quyền truy cập, Sbuy sẽ trả về các mã lỗi sau:

| Mã Lỗi HTTP | Tên Lỗi | Giải Thích & Khắc Phục |
| :---: | :--- | :--- |
| **`401 Unauthorized`** | Key Không Phù Hợp | Sai `consumer_key` hoặc `consumer_secret`. Vui lòng kiểm tra lại chính xác từng ký tự Key. |
| **`403 Forbidden`** | Key Không Đủ Quyền | API Key bị giới hạn quyền truy cập trên hệ thống WordPress. Hãy đảm bảo Key có quyền **Read** (Đọc). |
| **`400 Bad Request`** | Thiếu Key | Request gửi đi thiếu tham số `consumer_key` hoặc `consumer_secret`. |

---

*Tài liệu hướng dẫn kết nối bằng Key được cập nhật tự động cho hệ thống Sbuy.*
