import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AccountPage } from '../components/common/AccountPage';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Globe, Smartphone, Trash2, Wifi } from 'lucide-react';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const SettingsPage: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPrompt | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    setActionError(null);
    if (!deferredPrompt) { setShowInstallHelp(true); return; }
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } catch {
      setActionError('Chưa mở được cửa sổ cài đặt. Hãy thử hướng dẫn cài thủ công.');
      setDeferredPrompt(null);
    }
  };

  const handleClearCache = async () => {
    setActionError(null);
    setCacheCleared(false);
    setClearing(true);
    try {
      if (!('caches' in window)) throw new Error('Cache storage unavailable');
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      setCacheCleared(true);
    } catch {
      setActionError('Chưa xóa được bộ nhớ đệm. Hãy kiểm tra quyền lưu trữ của trình duyệt rồi thử lại.');
    } finally { setClearing(false); }
  };

  return (
    <AccountPage title="Cài đặt ứng dụng" description="Mở bếp nhanh hơn, quản lý tài nguyên trên thiết bị.">
      <Card className="p-5 space-y-3">
        <h2 className="flex items-center gap-2"><Smartphone size={20} aria-hidden="true" /> Takosan trên điện thoại</h2>
        <p>{isStandalone
          ? 'Bạn đang mở Takosan từ ứng dụng đã cài trên màn hình chính.'
          : 'Thêm Takosan vào màn hình chính để mở nhanh. Một số dữ liệu đã lưu có thể xem khi mất mạng; tính năng cần máy chủ vẫn cần kết nối.'}</p>
        {!isStandalone && <Button variant="outline" fullWidth onClick={handleInstallPwa}>Cài đặt lên màn hình chính</Button>}
      </Card>
      <Card className="p-5 space-y-3">
        <h2 className="flex items-center gap-2"><Wifi size={20} aria-hidden="true" /> Bộ nhớ đệm ứng dụng</h2>
        <p>Xóa tài nguyên ứng dụng đã lưu trên trình duyệt. Thao tác này không xóa dữ liệu ngoại tuyến hoặc thay đổi chưa đồng bộ của bạn.</p>
        <Button variant="outline" fullWidth onClick={handleClearCache} isLoading={clearing}>
          <Trash2 size={18} aria-hidden="true" /> Xóa bộ nhớ đệm ứng dụng
        </Button>
        {cacheCleared && <p role="status">Đã xóa bộ nhớ đệm ứng dụng.</p>}
      </Card>
      {actionError && <p role="alert" className="text-semantic-danger-strong">{actionError}</p>}
      <Card className="p-5 space-y-3">
        <h2 className="flex items-center gap-2"><Globe size={20} aria-hidden="true" /> Ngôn ngữ hiển thị</h2>
        <p>Tiếng Việt. Tiếng Anh sẽ được bổ sung khi bản dịch đầy đủ sẵn sàng.</p>
      </Card>
      <Link to="/settings/privacy" className="account-text-link">Xem quyền riêng tư & dữ liệu</Link>
      <details className="account-build-info">
        <summary>Thông tin phiên bản</summary>
        <p>Takosan v{import.meta.env.VITE_APP_VERSION} · Build {import.meta.env.VITE_GIT_COMMIT || 'local'} · {import.meta.env.VITE_BUILD_TIMESTAMP || 'local build'}</p>
      </details>
      <ConfirmDialog open={showInstallHelp} title="Cài đặt Takosan lên màn hình chính"
        description={'Trên iPhone (Safari): nhấn nút Chia sẻ rồi chọn "Thêm vào MH chính". Trên Android (Chrome): nhấn menu ba chấm rồi chọn "Cài đặt ứng dụng".'}
        confirmText="Đã hiểu" cancelText="Đóng" onConfirm={() => setShowInstallHelp(false)} onCancel={() => setShowInstallHelp(false)} />
    </AccountPage>
  );
};
