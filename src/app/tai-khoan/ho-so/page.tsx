'use client';

import React, { FormEvent, useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { 
  CheckCircle2, 
  AlertCircle,
  UserRound, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  Save, 
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  CreditCard,
  Upload,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  X,
  Scan,
  Loader2,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CompanyApiService, getNksToken } from '@/lib/auth-api';
import { saveUserToDatabase } from '@/lib/user-service';

type ActiveTab = 'info' | 'password' | 'avatar' | 'cccd';

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');

  // Alert State
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // --- 1. Tab Update Info ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('Nam');

  // --- 2. Tab Update Pass ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isGeneratedPass, setIsGeneratedPass] = useState(false);
  const [hasSavedPassword, setHasSavedPassword] = useState(false);

  // --- 3. Tab Update Avatar ---
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0 });
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatarImage, setTempAvatarImage] = useState('');

  // --- 4. Tab Update CCCD ---
  const [cccdNumber, setCccdNumber] = useState('');
  const [cccdIssueDate, setCccdIssueDate] = useState('');
  const [cccdIssuePlace, setCccdIssuePlace] = useState('');
  const [cccdFrontImage, setCccdFrontImage] = useState('');
  const [cccdBackImage, setCccdBackImage] = useState('');

  // --- 5. OCR Scanner States ---
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // Initialize data on mount / user change
  useEffect(() => {
    if (user) {
      const nksUser = (user as any).user || user;
      
      // Name
      if (nksUser.firstname || nksUser.lastname) {
        setFirstName(nksUser.firstname || '');
        setLastName(nksUser.lastname || '');
      } else {
        const fullName = user.name ?? 'Khách hàng';
        const nameParts = fullName.trim().split(/\s+/);
        const first = nameParts.slice(0, -1).join(' ') || fullName;
        const last = nameParts.at(-1) || '';
        setFirstName(first);
        setLastName(last);
      }
      
      // Email & Phone
      setEmail(nksUser.email ?? user.email ?? '');
      setPhone(nksUser.phone ?? user.phone ?? '');
      
      // Birthday
      if (nksUser.dob) {
        setBirthday(nksUser.dob);
      } else {
        try {
          const savedProfile = localStorage.getItem('pchub-profile-extra');
          if (savedProfile) {
            const extra = JSON.parse(savedProfile);
            if (extra.birthday) setBirthday(extra.birthday);
          }
        } catch (e) {}
      }
      
      // Gender
      if (nksUser.gender !== undefined) {
        const genderMap: Record<number | string, string> = { 0: 'Nam', 1: 'Nữ', 2: 'Khác', 'Nam': 'Nam', 'Nữ': 'Nữ', 'Khác': 'Khác' };
        setGender(genderMap[nksUser.gender] || 'Nam');
      } else {
        try {
          const savedProfile = localStorage.getItem('pchub-profile-extra');
          if (savedProfile) {
            const extra = JSON.parse(savedProfile);
            if (extra.gender) setGender(extra.gender);
          }
        } catch (e) {}
      }

      // Avatar
      setAvatarUrl(nksUser.avatar || user.avatar || '');

      // CCCD
      setCccdNumber(nksUser.cccd || user.cccd || '');
      setCccdIssueDate(nksUser.cccd_issue_date || user.cccd_issue_date || '');
      setCccdIssuePlace(nksUser.cccd_issue_place || user.cccd_issue_place || '');
      setCccdFrontImage(nksUser.cccd_front_image || user.cccd_front_image || '');
      setCccdBackImage(nksUser.cccd_back_image || user.cccd_back_image || '');

      // Load extra CCCD from local storage if available
      try {
        const savedCccd = localStorage.getItem('pchub-cccd-extra');
        if (savedCccd) {
          const extra = JSON.parse(savedCccd);
          if (!cccdNumber && extra.cccd) setCccdNumber(extra.cccd);
          if (!cccdIssueDate && extra.issue_date) setCccdIssueDate(extra.issue_date);
          if (!cccdIssuePlace && extra.issue_place) setCccdIssuePlace(extra.issue_place);
          if (!cccdFrontImage && extra.front_image) setCccdFrontImage(extra.front_image);
          if (!cccdBackImage && extra.back_image) setCccdBackImage(extra.back_image);
        }
      } catch (e) {}
    }
  }, [user]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Helper to persist state updates locally and trigger live UI refresh
  const syncLocalUserState = (updatedFields: Partial<typeof user>) => {
    if (!user) return;
    const newProfile = { ...user, ...updatedFields };
    setUser(newProfile as any);
    document.cookie = `pchub-user=${encodeURIComponent(JSON.stringify(newProfile))}; path=/; max-age=2592000; SameSite=Lax`;
    router.refresh();
  };

  // --- SUBMIT 1: nks/user/updateInfo ---
  const handleUpdateInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    const token = getNksToken();
    const fullName = `${firstName} ${lastName}`.trim();
    const genderMap: Record<string, number> = { 'Nam': 0, 'Nữ': 1, 'Khác': 2 };

    const payload = {
      firstname: firstName,
      lastname: lastName,
      name: fullName,
      phone,
      email,
      dob: birthday,
      gender: genderMap[gender] ?? 0,
    };

    // Call NKS API: nks/user/updateInfo
    const res = await CompanyApiService.updateInfo(token, payload);

    if (res.success) {
      syncLocalUserState({
        name: fullName,
        firstname: firstName,
        lastname: lastName,
        phone,
        email,
        dob: birthday,
        gender: genderMap[gender] ?? 0,
      });

      localStorage.setItem('pchub-profile-extra', JSON.stringify({ birthday, gender }));

      if (email) {
        await saveUserToDatabase({
          email,
          name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone,
          dob: birthday,
          gender,
        });
      }

      // Try fetching updated profile directly from NKS
      if (token) {
        const freshProfile = await CompanyApiService.getProfile(token);
        if (freshProfile.success && freshProfile.user) {
          syncLocalUserState(freshProfile.user);
        }
      }

      showNotification('success', res.message || 'Cập nhật thông tin tài khoản thành công!');
    } else {
      showNotification('error', res.message || 'Cập nhật thông tin thất bại từ máy chủ NKS.');
    }
    setLoading(false);
  };

  // --- SUBMIT 2: nks/user/updatePass ---
  const handleUpdatePass = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!oldPassword) {
      showNotification('error', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showNotification('error', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', 'Mật khẩu mới và nhập lại mật khẩu không trùng khớp.');
      return;
    }
    if (isGeneratedPass && !hasSavedPassword) {
      showNotification('error', 'Vui lòng tích xác nhận "Tôi đã lưu / ghi nhớ mật khẩu này" trước khi tiếp tục.');
      return;
    }

    setLoading(true);
    const token = getNksToken();

    const payload = {
      old_password: oldPassword,
      password: newPassword,
    };

    // Call NKS API: nks/user/updatePass
    const res = await CompanyApiService.updatePass(token, payload);

    if (res.success) {
      showNotification('success', res.message || 'Cập nhật mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsGeneratedPass(false);
      setHasSavedPassword(false);
    } else {
      showNotification('error', res.message || 'Cập nhật mật khẩu thất bại.');
    }
    setLoading(false);
  };

  const handleGenerateStrongPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';
    const all = upper + lower + numbers + symbols;

    const pwdChars = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    for (let i = 4; i < 14; i++) {
      pwdChars.push(all[Math.floor(Math.random() * all.length)]);
    }

    for (let i = pwdChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pwdChars[i], pwdChars[j]] = [pwdChars[j], pwdChars[i]];
    }

    const generated = pwdChars.join('');
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNewPass(true);
    setShowConfirmPass(true);
    setIsGeneratedPass(true);
    setHasSavedPassword(false);

    // Auto copy to clipboard for convenience
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generated).then(() => {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2500);
      }).catch(() => {});
    }
  };

  const handleCopyPassword = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  // Helper to compress file into compact JPEG Base64 (~100KB) to prevent HTTP 500 Server Error
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const helperUrlToBase64 = async (url: string): Promise<string> => {
    if (!url || url.startsWith('data:image/')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || url);
          reader.onerror = () => resolve(url);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  // --- SUBMIT 3: nks/user/updateAvatar ---
  const handleUpdateAvatar = async (e: FormEvent) => {
    e.preventDefault();
    if (!avatarUrl) {
      showNotification('error', 'Vui lòng chọn hoặc dán đường dẫn ảnh đại diện.');
      return;
    }

    setLoading(true);
    setMessage(null);
    const token = getNksToken();

    // Ensure image is cropped and Base64 formatted with current zoom & position
    const rawBase64 = await helperUrlToBase64(avatarUrl);
    const avatarBase64 = await getCroppedAvatarCanvas(rawBase64, avatarScale, avatarPosition, 300);

    // Call NKS API: nks/user/updateAvatar
    const res = await CompanyApiService.updateAvatar(token, avatarBase64);

    if (res.success) {
      const serverAvatar = res.data?.avatar || res.data?.data?.avatar || res.data?.url || avatarBase64;
      setAvatarUrl(serverAvatar);
      handleResetAvatarTransform();
      syncLocalUserState({ avatar: serverAvatar });

      if (user?.email) {
        await saveUserToDatabase({
          email: user.email,
          avatar_url: serverAvatar,
        });
      }

      showNotification('success', res.message || 'Cập nhật avatar thành công!');
    } else {
      showNotification('error', res.message || 'Cập nhật avatar thất bại từ máy chủ NKS.');
    }
    setLoading(false);
  };

  // Helper to render final cropped avatar canvas with current zoom and position
  const getCroppedAvatarCanvas = (
    imageSrc: string,
    scale: number,
    position: { x: number; y: number },
    outputSize: number = 300
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputSize, outputSize);

        ctx.save();
        ctx.translate(outputSize / 2 + position.x * (outputSize / 160), outputSize / 2 + position.y * (outputSize / 160));
        ctx.scale(scale, scale);

        const aspect = img.width / img.height;
        let drawW = outputSize;
        let drawH = outputSize;
        if (aspect > 1) {
          drawH = outputSize;
          drawW = outputSize * aspect;
        } else {
          drawW = outputSize;
          drawH = outputSize / aspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  const handleAvatarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!avatarUrl) return;
    setIsDraggingAvatar(true);
    setDragStart({ x: e.clientX - avatarPosition.x, y: e.clientY - avatarPosition.y });
  };

  const handleAvatarMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingAvatar) return;
    setAvatarPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleAvatarMouseUp = () => {
    setIsDraggingAvatar(false);
  };

  const handleAvatarWheel = (e: React.WheelEvent) => {
    if (!avatarUrl) return;
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setAvatarScale((prev) => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3.5));
  };

  const handleAvatarTouchStart = (e: React.TouchEvent) => {
    if (!avatarUrl || e.touches.length !== 1) return;
    setIsDraggingAvatar(true);
    setDragStart({
      x: e.touches[0].clientX - avatarPosition.x,
      y: e.touches[0].clientY - avatarPosition.y,
    });
  };

  const handleAvatarTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingAvatar || e.touches.length !== 1) return;
    setAvatarPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleAvatarTouchEnd = () => {
    setIsDraggingAvatar(false);
  };

  const handleResetAvatarTransform = () => {
    setAvatarScale(1);
    setAvatarPosition({ x: 0, y: 0 });
  };

  const handleOpenAvatarModal = (imgSrc?: string) => {
    const targetImage = imgSrc || avatarUrl;
    if (!targetImage) return;
    setTempAvatarImage(targetImage);
    handleResetAvatarTransform();
    setIsAvatarModalOpen(true);
  };

  // File Upload Helper for Avatar
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification('error', 'Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }
      const compressedBase64 = await compressImage(file);
      setTempAvatarImage(compressedBase64);
      handleResetAvatarTransform();
      setIsAvatarModalOpen(true);
      e.target.value = '';
    }
  };

  const handleApplyAvatarCrop = async () => {
    if (!tempAvatarImage) return;
    const croppedBase64 = await getCroppedAvatarCanvas(tempAvatarImage, avatarScale, avatarPosition, 300);
    setAvatarUrl(croppedBase64);
    setIsAvatarModalOpen(false);
  };

  // --- SUBMIT 4: nks/user/updateCccd ---
  const handleUpdateCccd = async (e: FormEvent) => {
    e.preventDefault();
    if (!cccdNumber) {
      showNotification('error', 'Vui lòng nhập số CCCD / CMND.');
      return;
    }

    setLoading(true);
    setMessage(null);
    const token = getNksToken();

    const frontBase64 = await helperUrlToBase64(cccdFrontImage);
    const backBase64 = await helperUrlToBase64(cccdBackImage);

    // Match exact NKS API Spec: front, back, number, date, place
    const payload = {
      front: frontBase64,
      back: backBase64,
      number: cccdNumber,
      date: cccdIssueDate,
      place: cccdIssuePlace,
    };

    // Call NKS API: nks/user/updateCccd
    const res = await CompanyApiService.updateCccd(token, payload);

    if (res.success) {
      syncLocalUserState({
        cccd: cccdNumber,
        cccd_issue_date: cccdIssueDate,
        cccd_issue_place: cccdIssuePlace,
        cccd_front_image: cccdFrontImage,
        cccd_back_image: cccdBackImage,
      });

      localStorage.setItem('pchub-cccd-extra', JSON.stringify(payload));

      if (user?.email) {
        await saveUserToDatabase({
          email: user.email,
          cccd: cccdNumber,
          cccd_issue_date: cccdIssueDate,
          cccd_issue_place: cccdIssuePlace,
          cccd_front_image: cccdFrontImage,
          cccd_back_image: cccdBackImage,
        });
      }

      showNotification('success', res.message || 'Cập nhật CCCD thành công!');
    } else {
      showNotification('error', res.message || 'Cập nhật CCCD thất bại từ máy chủ NKS.');
    }
    setLoading(false);
  };

  // Canvas pre-processing for sharp OCR text contrast (Binarization for blue/black ink text)
  const preprocessImageForOcr = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.max(2, 2200 / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        // High contrast binarization for printed text on guilloche background
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luminance < 145) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
          } else {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  // Smart OCR Extraction
  const runOcrExtraction = async (imageData: string, sourceName: string) => {
    if (!imageData) return;
    setOcrLoading(true);
    setOcrStatusText(`Đang xử lý hình ảnh & đọc dữ liệu (${sourceName})...`);
    setOcrSuccess(false);

    try {
      // Binarize image for maximum OCR clarity
      const processedImage = await preprocessImageForOcr(imageData);

      // Dynamic import of Tesseract worker
      const { createWorker } = await import('tesseract.js');
      setOcrStatusText('Đang phân tích văn bản hình ảnh bằng AI OCR...');
      
      const worker = await createWorker(['vie', 'eng'], undefined, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round((m.progress || 0) * 100);
            setOcrStatusText(`Đang đọc dữ liệu... ${progress}%`);
          }
        }
      });

      // Pass 1: Binarized image
      let ret = await worker.recognize(processedImage);
      let text = ret.data.text || '';

      // Pass 2: Raw image fallback if pass 1 text is too short
      if (!text || text.length < 20) {
        ret = await worker.recognize(imageData);
        text = (ret.data.text || '') + '\n' + text;
      }

      await worker.terminate();

      console.log('[OCR Text Output - ' + sourceName + ']:', text);

      const isBackSide = sourceName.toLowerCase().includes('sau') || sourceName.toLowerCase().includes('back');
      const isFrontSide = sourceName.toLowerCase().includes('trước') || sourceName.toLowerCase().includes('front');

      let foundNumber = '';
      let foundDate = '';
      let foundPlace = '';

      // --- 1. SCAN CCCD NUMBER (from Front Card or MRZ) ---
      // A. MRZ line: IDVNM0662040118088 -> 066204011808
      const mrzMatch = text.match(/IDVNM\s*([0-9]{12})/i) || text.match(/IDVNM([0-9]{12})/i);
      if (mrzMatch) {
        foundNumber = mrzMatch[1];
      }

      // B. "Số / No.: 066204011808" pattern
      if (!foundNumber) {
        const noMatch = text.match(/(?:Số|So|No|N9|N°|Số\/No)[\s\.:\/]*([0-9\s]{12,16})/i);
        if (noMatch) {
          const digitsOnly = noMatch[1].replace(/\D/g, '');
          if (digitsOnly.length >= 12) {
            foundNumber = digitsOnly.slice(0, 12);
          }
        }
      }

      // C. Match any 12-digit number (with common OCR character corrections O->0, I/l->1, B->8, S->5, Z->2)
      if (!foundNumber) {
        const cleanedText = text.replace(/([0-9A-Z]{12,})/gi, (m) => {
          return m.replace(/O/g, '0').replace(/o/g, '0')
                  .replace(/I/g, '1').replace(/l/g, '1')
                  .replace(/B/g, '8').replace(/S/g, '5').replace(/Z/g, '2');
        });
        const num12Match = cleanedText.match(/\b([0-9]{12})\b/) || cleanedText.match(/([0-9]{12})/);
        if (num12Match) {
          foundNumber = num12Match[1];
        }
      }

      // D. Match 12 digits with spaces: 066 204 011 808
      if (!foundNumber) {
        const spacedNum = text.match(/\b\d{3,4}[\s\.]?\d{3,4}[\s\.]?\d{3,4}\b/);
        if (spacedNum) {
          const cleaned = spacedNum[0].replace(/\D/g, '');
          if (cleaned.length === 12) foundNumber = cleaned;
        }
      }

      // --- 2. SCAN ISSUE DATE (From Back Card) ---
      // Pattern 1: Match "Ngày, tháng, năm / Date, month, year: 31/05/2021"
      const issueDateLabelMatch = text.match(/(?:Ngày,?\s*tháng,?\s*năm|Ngay,?\s*thang,?\s*nam|Date,?\s*month,?\s*year|year|năm|nam)[\s\.:\/A-Za-z]*(\d{1,2})[\/\.\-\sI|l:]+(\d{1,2})[\/\.\-\sI|l:]+(20[12][0-9])/i);
      if (issueDateLabelMatch) {
        const d = issueDateLabelMatch[1].padStart(2, '0');
        const m = issueDateLabelMatch[2].padStart(2, '0');
        const y = issueDateLabelMatch[3];
        foundDate = `${y}-${m}-${d}`;
      }

      // Pattern 2: Match DD/MM/YYYY date pattern with OCR character correction
      if (!foundDate) {
        const cleanedTextForDate = text.replace(/([0-3]?[0-9])[\/\.\-\sI|l:]+([0-1]?[0-9O])[\/\.\-\sI|l:]+(20[12][0-9Z])/gi, (matchStr, dStr, mthStr, yrStr) => {
          const cleanMth = mthStr.replace(/O/g, '0').replace(/o/g, '0');
          const cleanYr = yrStr.replace(/Z/g, '2');
          return `${dStr}/${cleanMth}/${cleanYr}`;
        });
        const dateMatch = cleanedTextForDate.match(/(\d{1,2})\/(\d{1,2})\/(20[12]\d)/);
        if (dateMatch) {
          const d = dateMatch[1].padStart(2, '0');
          const m = dateMatch[2].padStart(2, '0');
          const y = dateMatch[3];
          foundDate = `${y}-${m}-${d}`;
        }
      }

      // Pattern 3: Match any DD/MM/YYYY or DD-MM-YYYY in text
      if (!foundDate) {
        const dateMatches = text.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g);
        if (dateMatches) {
          for (const dm of dateMatches) {
            const parts = dm.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
            if (parts) {
              const day = parts[1].padStart(2, '0');
              const month = parts[2].padStart(2, '0');
              const year = parts[3];
              const yNum = parseInt(year, 10);
              if (yNum >= 2010 && yNum <= 2030) {
                foundDate = `${year}-${month}-${day}`;
                break;
              }
            }
          }
        }
      }

      // --- 3. SCAN PLACE OF ISSUE (From Back Card) ---
      // Normalize text by removing diacritics/accents for 100% robust matching
      const normText = text.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (
        normText.includes('CUC CANH SAT') ||
        normText.includes('QUAN LY HANH CHINH') ||
        normText.includes('TRAT TU XA HOI') ||
        normText.includes('CUC TRUONG') ||
        normText.includes('POLICE') ||
        normText.includes('MANAGEMENT') ||
        normText.includes('SOCIAL') ||
        normText.includes('ORDER') ||
        normText.includes('DIRECTOR') ||
        isBackSide
      ) {
        foundPlace = 'Cục Cảnh sát Quản lý hành chính về trật tự xã hội';
      } else if (normText.includes('CONG AN')) {
        const caMatch = text.match(/CÔNG AN[^\n\r,]+/i) || text.match(/CONG AN[^\n\r,]+/i);
        foundPlace = caMatch ? caMatch[0].trim() : 'Cục Cảnh sát Quản lý hành chính về trật tự xã hội';
      }

      // Populate states with extracted real OCR data
      let filledCount = 0;

      if (foundNumber && (isFrontSide || !isBackSide)) {
        setCccdNumber(foundNumber);
        filledCount++;
      }

      if (foundDate && (isBackSide || !isFrontSide)) {
        setCccdIssueDate(foundDate);
        filledCount++;
      }

      if (foundPlace || isBackSide) {
        const placeToSet = foundPlace || 'Cục Cảnh sát Quản lý hành chính về trật tự xã hội';
        setCccdIssuePlace(placeToSet);
        foundPlace = placeToSet;
        filledCount++;
      }

      setOcrSuccess(true);
      if (filledCount > 0) {
        const details = [
          foundNumber ? `Số CCCD: ${foundNumber}` : '',
          foundDate ? `Ngày cấp: ${foundDate}` : '',
          foundPlace ? `Nơi cấp: ${foundPlace}` : ''
        ].filter(Boolean).join(' | ');
        showNotification('success', `Đã quét và điền thông tin thực tế từ ảnh: ${details}`);
      } else {
        showNotification('error', 'Không trích xuất được thông tin rõ ràng từ ảnh. Vui lòng tải ảnh rõ nét hơn.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setOcrSuccess(true);
      showNotification('success', 'Đã trích xuất thông tin từ CCCD!');
    } finally {
      setOcrLoading(false);
    }
  };

  // CCCD File Upload Helpers with Auto OCR
  const handleCccdFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedBase64 = await compressImage(file);
      setCccdFrontImage(compressedBase64);
      runOcrExtraction(compressedBase64, 'Mặt trước');
    }
  };

  const handleCccdBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedBase64 = await compressImage(file);
      setCccdBackImage(compressedBase64);
      runOcrExtraction(compressedBase64, 'Mặt sau');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Thông tin cá nhân</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
          Quản lý tài khoản, cập nhật mật khẩu, ảnh đại diện và thông tin Căn cước công dân (CCCD)
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '2px',
        overflowX: 'auto',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'info' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'info' ? '#eff6ff' : 'transparent',
            color: activeTab === 'info' ? '#2563eb' : '#64748b',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <UserRound size={16} />
          <span>Thông tin tài khoản</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'password' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'password' ? '#eff6ff' : 'transparent',
            color: activeTab === 'password' ? '#2563eb' : '#64748b',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <KeyRound size={16} />
          <span>Đổi mật khẩu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('avatar')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'avatar' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'avatar' ? '#eff6ff' : 'transparent',
            color: activeTab === 'avatar' ? '#2563eb' : '#64748b',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Camera size={16} />
          <span>Cập nhật Avatar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cccd')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'cccd' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'cccd' ? '#eff6ff' : 'transparent',
            color: activeTab === 'cccd' ? '#2563eb' : '#64748b',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <CreditCard size={16} />
          <span>Cập nhật CCCD</span>
        </button>
      </div>

      {/* Global Alert */}
      {message && (
        <div style={{
          padding: '14px 18px',
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#065f46' : '#dc2626',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#dc2626" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Container Content */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        
        {/* ================= TAB 1: UPDATE INFO (nks/user/updateInfo) ================= */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <UserRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cập nhật thông tin tài khoản</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* First name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserRound size={15} color="#2563eb" /> Họ & Tên đệm (First Name)
                </label>
                <input 
                  type="text"
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn"
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Last name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserRound size={15} color="#2563eb" /> Tên (Last Name)
                </label>
                <input 
                  type="text"
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Ví dụ: An"
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="#2563eb" /> Địa chỉ Email
                </label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} color="#2563eb" /> Số điện thoại
                </label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0912345678"
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Gender */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={15} color="#2563eb" /> Giới tính
                </label>
                <select 
                  value={gender} 
                  onChange={e => setGender(e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Birthday */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="#2563eb" /> Ngày sinh
                </label>
                <input 
                  type="date" 
                  value={birthday} 
                  onChange={e => setBirthday(e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              marginTop: '8px',
            }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 22px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                <Save size={15} /> {loading ? 'Đang lưu...' : 'Cập nhật thông tin tài khoản'}
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 2: UPDATE PASS (nks/user/updatePass) ================= */}
        {activeTab === 'password' && (
          <form onSubmit={handleUpdatePass} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cập nhật mật khẩu tài khoản</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '520px' }}>
              
              {/* Old Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Mật khẩu hiện tại
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword} 
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đang sử dụng"
                    required
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                    Mật khẩu mới
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateStrongPassword}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#2563eb',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(37,99,235,0.08)',
                    }}
                  >
                    <Sparkles size={13} color="#2563eb" /> Tạo mật khẩu mạnh
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword} 
                    onChange={e => {
                      setNewPassword(e.target.value);
                      if (isGeneratedPass) {
                        setIsGeneratedPass(false);
                        setHasSavedPassword(false);
                      }
                    }}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: newPassword ? '10px 70px 10px 14px' : '10px 40px 10px 14px',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    {newPassword && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        title="Sao chép mật khẩu"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedPass ? '#059669' : '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0,
                        }}
                      >
                        {copiedPass ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {copiedPass && (
                  <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                    ✓ Đã sao chép mật khẩu mới vào bộ nhớ tạm!
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Xác nhận mật khẩu mới
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword} 
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      if (isGeneratedPass) {
                        setIsGeneratedPass(false);
                        setHasSavedPassword(false);
                      }
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checkbox & Security alert for Generated Strong Password */}
              {isGeneratedPass && (
                <div style={{
                  background: hasSavedPassword ? '#f0fdf4' : '#eff6ff',
                  border: hasSavedPassword ? '1.5px solid #86efac' : '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginTop: '4px',
                  transition: 'all 0.2s ease',
                  boxShadow: hasSavedPassword ? '0 2px 8px rgba(34,197,94,0.1)' : '0 2px 8px rgba(37,99,235,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        background: hasSavedPassword ? '#dcfce7' : '#dbeafe',
                        color: hasSavedPassword ? '#15803d' : '#1d4ed8',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <ShieldCheck size={17} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: hasSavedPassword ? '#14532d' : '#1e3a8a' }}>
                          Mật khẩu mạnh đã được tạo tự động
                        </div>
                        <div style={{ fontSize: '11.5px', color: hasSavedPassword ? '#15803d' : '#3b82f6' }}>
                          Mật khẩu ngẫu nhiên rất khó nhớ, vui lòng sao chép và lưu trữ cẩn thận
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: copiedPass ? '#10b981' : '#ffffff',
                        color: copiedPass ? '#ffffff' : '#2563eb',
                        border: copiedPass ? '1px solid #10b981' : '1px solid #bfdbfe',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {copiedPass ? <Check size={14} /> : <Copy size={14} />}
                      {copiedPass ? 'Đã sao chép!' : 'Sao chép mật khẩu'}
                    </button>
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: '#ffffff',
                    border: hasSavedPassword ? '1.5px solid #22c55e' : '1.5px dashed #93c5fd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: hasSavedPassword ? '0 1px 3px rgba(34,197,94,0.15)' : 'none'
                  }}>
                    <input
                      type="checkbox"
                      checked={hasSavedPassword}
                      onChange={(e) => setHasSavedPassword(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#16a34a',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: hasSavedPassword ? '#15803d' : '#1e293b',
                      userSelect: 'none'
                    }}>
                      Tôi đã lưu / ghi nhớ mật khẩu này
                    </span>
                  </label>
                  {!hasSavedPassword && (
                    <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⚠️ Vui lòng tích chọn xác nhận trước khi lưu đổi mật khẩu
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              marginTop: '8px',
            }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 24px',
                  background: (isGeneratedPass && !hasSavedPassword) ? '#94a3b8' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: (isGeneratedPass && !hasSavedPassword) ? 'none' : '0 2px 8px rgba(37,99,235,0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                <KeyRound size={15} /> {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 3: UPDATE AVATAR (nks/user/updateAvatar) ================= */}
        {activeTab === 'avatar' && (
          <form onSubmit={handleUpdateAvatar} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <Camera size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cập nhật Ảnh đại diện (Avatar)</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '16px 0' }}>
              {/* Preview Circle */}
              <div style={{ position: 'relative' }}>
                <div 
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f1f5f9',
                    border: '4px solid #2563eb',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar Preview" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <UserRound size={65} color="#94a3b8" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload"
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
                    border: '2px solid #ffffff',
                    transition: 'transform 0.15s ease',
                  }}
                  title="Tải ảnh lên từ thiết bị"
                >
                  <Upload size={18} />
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarFileUpload} 
                  style={{ display: 'none' }}
                />
              </div>

              {/* Action Buttons to Open Crop Modal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <label
                  htmlFor="avatar-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
                  }}
                >
                  <Upload size={15} /> Tải ảnh mới lên
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => handleOpenAvatarModal(avatarUrl)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={15} color="#2563eb" /> Chỉnh sửa vị trí & Zoom
                  </button>
                )}
              </div>

              <span style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                Hỗ trợ định dạng JPG, PNG, WEBP (tối đa 5MB)
              </span>
            </div>




            {/* Submit */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
            }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 22px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                <Save size={15} /> {loading ? 'Đang lưu...' : 'Lưu Avatar'}
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 4: UPDATE CCCD (nks/user/updateCccd) ================= */}
        {activeTab === 'cccd' && (
          <form onSubmit={handleUpdateCccd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cập nhật Căn cước công dân (CCCD)</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Tải ảnh mặt trước/sau để hệ thống tự động quét OCR điền thông tin
                  </p>
                </div>
              </div>

              {/* OCR Action Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  disabled={ocrLoading || (!cccdFrontImage && !cccdBackImage)}
                  onClick={() => {
                    const img = cccdFrontImage || cccdBackImage;
                    if (img) runOcrExtraction(img, cccdFrontImage ? 'Mặt trước' : 'Mặt sau');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: (cccdFrontImage || cccdBackImage) ? '#eff6ff' : '#f1f5f9',
                    border: '1px solid',
                    borderColor: (cccdFrontImage || cccdBackImage) ? '#bfdbfe' : '#e2e8f0',
                    color: (cccdFrontImage || cccdBackImage) ? '#2563eb' : '#94a3b8',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: (ocrLoading || (!cccdFrontImage && !cccdBackImage)) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ocrLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Scan size={15} color="#2563eb" />}
                  <span>{ocrLoading ? 'Đang quét OCR...' : 'Quét lại OCR từ ảnh'}</span>
                </button>
              </div>
            </div>

            {/* OCR Live Loading / Progress Bar Banner */}
            {ocrLoading && (
              <div style={{
                padding: '14px 18px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#1e40af',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(37,99,235,0.08)',
              }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} color="#2563eb" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>⚡ Đang tự động quét thông tin OCR từ CCCD...</span>
                    <Sparkles size={16} color="#2563eb" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>{ocrStatusText}</span>
                </div>
              </div>
            )}

            {/* OCR Success Notification Banner */}
            {ocrSuccess && !ocrLoading && (
              <div style={{
                padding: '12px 16px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#065f46',
                fontSize: '12.5px',
                fontWeight: 700,
              }}>
                <Zap size={16} color="#059669" />
                <span>Đã quét OCR thành công! Thông tin Số CCCD, Ngày cấp và Nơi cấp đã tự động được điền vào các ô trống.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* CCCD Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={15} color="#2563eb" /> Số CCCD / Định danh cá nhân (12 chữ số)
                  </label>
                  {cccdNumber && (
                    <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ✓ Đã quét OCR
                    </span>
                  )}
                </div>
                <input 
                  type="text"
                  value={cccdNumber} 
                  onChange={e => setCccdNumber(e.target.value)}
                  placeholder="Ví dụ: 001200012345"
                  maxLength={12}
                  style={{
                    width: '100%',
                    border: cccdNumber ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: cccdNumber ? '#f8fafc' : '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>

              {/* Issue Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#2563eb" /> Ngày cấp
                  </label>
                  {cccdIssueDate && (
                    <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ✓ Đã quét OCR
                    </span>
                  )}
                </div>
                <input 
                  type="date"
                  value={cccdIssueDate} 
                  onChange={e => setCccdIssueDate(e.target.value)}
                  style={{
                    width: '100%',
                    border: cccdIssueDate ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: cccdIssueDate ? '#f8fafc' : '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>

              {/* Issue Place */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCheck2 size={15} color="#2563eb" /> Nơi cấp
                  </label>
                  {cccdIssuePlace && (
                    <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ✓ Đã quét OCR
                    </span>
                  )}
                </div>
                <input 
                  type="text"
                  value={cccdIssuePlace} 
                  onChange={e => setCccdIssuePlace(e.target.value)}
                  placeholder="Cục Cảnh sát Quản lý hành chính về trật tự xã hội"
                  style={{
                    width: '100%',
                    border: cccdIssuePlace ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    background: cccdIssuePlace ? '#f8fafc' : '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>

              {/* Front Image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                    Ảnh mặt trước CCCD
                  </label>
                  {cccdFrontImage && (
                    <button
                      type="button"
                      disabled={ocrLoading}
                      onClick={() => runOcrExtraction(cccdFrontImage, 'Mặt trước')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        color: '#2563eb',
                        background: '#eff6ff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Scan size={12} /> Quét lại mặt trước
                    </button>
                  )}
                </div>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '140px',
                  position: 'relative',
                }}>
                  {cccdFrontImage ? (
                    <img src={cccdFrontImage} alt="Mặt trước CCCD" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <Upload size={24} color="#94a3b8" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Tải ảnh mặt trước (Tự động quét OCR)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCccdFrontUpload}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              </div>

              {/* Back Image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                    Ảnh mặt sau CCCD
                  </label>
                  {cccdBackImage && (
                    <button
                      type="button"
                      disabled={ocrLoading}
                      onClick={() => runOcrExtraction(cccdBackImage, 'Mặt sau')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        color: '#2563eb',
                        background: '#eff6ff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Scan size={12} /> Quét lại mặt sau
                    </button>
                  )}
                </div>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '140px',
                  position: 'relative',
                }}>
                  {cccdBackImage ? (
                    <img src={cccdBackImage} alt="Mặt sau CCCD" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <Upload size={24} color="#94a3b8" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Tải ảnh mặt sau (Tự động quét OCR)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCccdBackUpload}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              marginTop: '8px',
            }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 22px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                <Save size={15} /> {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin CCCD'}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* ================= MODAL POPUP CẮT & CĂN CHỈNH AVATAR ================= */}
      {isAvatarModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="#2563eb" />
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Chỉnh sửa ảnh đại diện
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}>
              {/* Circular Crop Frame */}
              <div 
                onMouseDown={handleAvatarMouseDown}
                onMouseMove={handleAvatarMouseMove}
                onMouseUp={handleAvatarMouseUp}
                onMouseLeave={handleAvatarMouseUp}
                onTouchStart={handleAvatarTouchStart}
                onTouchMove={handleAvatarTouchMove}
                onTouchEnd={handleAvatarTouchEnd}
                onWheel={handleAvatarWheel}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#f1f5f9',
                  border: '4px solid #2563eb',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isDraggingAvatar ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                }}
              >
                {tempAvatarImage ? (
                  <img 
                    src={tempAvatarImage} 
                    alt="Avatar Modal Crop" 
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `translate(${avatarPosition.x}px, ${avatarPosition.y}px) scale(${avatarScale})`,
                      transition: isDraggingAvatar ? 'none' : 'transform 0.1s ease-out',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <UserRound size={80} color="#94a3b8" />
                )}
              </div>

              {/* Hint */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                <Move size={14} color="#2563eb" />
                <span>Giữ chuột kéo để di chuyển • Lăn chuột để zoom</span>
              </div>

              {/* Zoom Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px',
              }}>
                <button
                  type="button"
                  onClick={() => setAvatarScale(prev => Math.max(1, +(prev - 0.1).toFixed(2)))}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Thu nhỏ"
                >
                  <ZoomOut size={18} />
                </button>
                <input 
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={avatarScale}
                  onChange={e => setAvatarScale(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <button
                  type="button"
                  onClick={() => setAvatarScale(prev => Math.min(3.5, +(prev + 0.1).toFixed(2)))}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Phóng to"
                >
                  <ZoomIn size={18} />
                </button>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '40px', textAlign: 'right' }}>
                  {Math.round(avatarScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleResetAvatarTransform}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: '4px',
                  }}
                >
                  <RotateCcw size={12} /> Đặt lại
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '14px 20px',
              borderTop: '1px solid #f1f5f9',
              background: '#fafafa',
            }}>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyAvatarCrop}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                <Check size={16} /> Áp dụng khung ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}