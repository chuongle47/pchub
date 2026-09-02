'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4"><div className="bg-white border rounded-2xl p-7 w-full max-w-md"><h1 className="text-2xl font-bold">Quên mật khẩu?</h1>{sent ? <div className="mt-5"><p className="text-green-600">Email hướng dẫn đặt lại mật khẩu đã được gửi.</p><Link href="/login" className="inline-block mt-5 text-blue-600">Quay lại đăng nhập</Link></div> : <form onSubmit={submit} className="space-y-4 mt-5"><p className="text-sm text-gray-500">Nhập email để nhận liên kết khôi phục mật khẩu.</p><input required type="email" placeholder="Email của bạn" className="w-full border rounded-lg px-4 py-3" /><button className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold">Gửi yêu cầu</button><Link href="/login" className="block text-center text-sm text-gray-500">Quay lại đăng nhập</Link></form>}</div></div>;
}
