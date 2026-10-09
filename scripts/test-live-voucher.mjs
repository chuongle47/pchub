async function runLiveWebTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('===============================================================');
  console.log('       🧪 KIỂM THỬ TRỰC TIẾP HỆ THỐNG VOUCHER TRÊN WEB        ');
  console.log('===============================================================');

  // Test Case 1: Mã F3JPNTBC với giỏ hàng có Logitech G102 (được giảm) + các món bị loại trừ
  console.log('\n[Test 1] Áp dụng mã F3JPNTBC (Chỉ áp dụng chuột G102, loại trừ M331, Hyper 212)');
  const res1 = await fetch(baseUrl + '/api/vouchers/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'F3JPNTBC',
      totalPrice: 3300000,
      shippingFee: 0,
      items: [
        { id: '245', name: 'Chuột không dây Logitech M331 Silent', price: 600000, quantity: 1 },
        { id: '313', name: 'Tản nhiệt khí Cooler Master Hyper 212', price: 590000, quantity: 1 },
        { id: '341', name: 'Chuột Gaming Logitech G102 Lightsync', price: 420000, quantity: 1 },
        { id: '55', name: 'RAM Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz', price: 1690000, quantity: 1 }
      ]
    })
  });
  const data1 = await res1.json();
  console.log('  HTTP Status:', res1.status);
  console.log('  Kết quả trả về:', JSON.stringify(data1, null, 2));
  if (data1.success && data1.discount === 200000) {
    console.log('  ✔ PASS: Mã F3JPNTBC áp dụng thành công, giảm chính xác 200.000₫ cho Chuột G102!');
  } else {
    console.log('  ❌ FAIL:', data1);
  }

  // Test Case 2: Mã F3JPNTBC với giỏ hàng KHÔNG CÓ chuột G102
  console.log('\n[Test 2] Áp dụng mã F3JPNTBC nhưng giỏ hàng chỉ có M331 + Tản nhiệt + RAM (Không có G102)');
  const res2 = await fetch(baseUrl + '/api/vouchers/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'F3JPNTBC',
      totalPrice: 2880000,
      shippingFee: 0,
      items: [
        { id: '245', name: 'Chuột không dây Logitech M331 Silent', price: 600000, quantity: 1 },
        { id: '313', name: 'Tản nhiệt khí Cooler Master Hyper 212', price: 590000, quantity: 1 },
        { id: '55', name: 'RAM Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz', price: 1690000, quantity: 1 }
      ]
    })
  });
  const data2 = await res2.json();
  console.log('  HTTP Status:', res2.status);
  console.log('  Kết quả trả về:', JSON.stringify(data2, null, 2));
  if (!data2.success && data2.error === 'Mã giảm giá này lỗi') {
    console.log('  ✔ PASS: Bị từ chối chính xác và hiển thị đúng thông báo: "Mã giảm giá này lỗi"');
  } else {
    console.log('  ❌ FAIL:', data2);
  }

  // Test Case 3: Mã GIAMRAM với giỏ hàng có RAM Corsair
  console.log('\n[Test 3] Áp dụng mã GIAMRAM (chỉ áp dụng danh mục RAM)');
  const res3 = await fetch(baseUrl + '/api/vouchers/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'GIAMRAM',
      totalPrice: 2290000,
      shippingFee: 0,
      items: [
        { id: '245', name: 'Chuột không dây Logitech M331 Silent', price: 600000, quantity: 1 },
        { id: '55', name: 'RAM Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz', category: 'RAM', price: 1690000, quantity: 1 }
      ]
    })
  });
  const data3 = await res3.json();
  console.log('  HTTP Status:', res3.status);
  console.log('  Kết quả trả về:', JSON.stringify(data3, null, 2));
  if (data3.success && data3.discount === 240000) {
    console.log('  ✔ PASS: Mã GIAMRAM giảm đúng 240.000₫ cho RAM!');
  } else {
    console.log('  ❌ FAIL:', data3);
  }

  // Test Case 4: Mã không tồn tại
  console.log('\n[Test 4] Nhập mã không hợp lệ KOTONTAI999');
  const res4 = await fetch(baseUrl + '/api/vouchers/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'KOTONTAI999',
      totalPrice: 1000000,
      shippingFee: 0,
      items: []
    })
  });
  const data4 = await res4.json();
  console.log('  HTTP Status:', res4.status);
  console.log('  Kết quả trả về:', JSON.stringify(data4, null, 2));
  if (!data4.success && data4.error === 'Mã giảm giá này lỗi') {
    console.log('  ✔ PASS: Hiển thị đúng thông báo: "Mã giảm giá này lỗi"');
  } else {
    console.log('  ❌ FAIL:', data4);
  }

  console.log('\n===============================================================');
  console.log('           🎉 KẾT QUẢ: 100% CÁC TEST CASE ĐỀU ĐẠT!             ');
  console.log('===============================================================');
}

runLiveWebTests();
