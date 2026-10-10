import { AccountPage } from '../../components/common/AccountPage';
import React, { useState } from 'react';
import { Bell, Calendar, Clock, ShoppingBag, Sparkles } from 'lucide-react';
import { getCurrentScope } from '../../services/http';
import { Switch, UnavailableState } from '../../design-system/primitives';

type ToggleState = {
  remindWeekPlan: boolean;
  remindExpiring: boolean;
  remindShopping: boolean;
  remindTodayMeal: boolean;
  promoUpdates: boolean;
};

const DEFAULT_TOGGLES: ToggleState = {
  remindWeekPlan: true,
  remindExpiring: true,
  remindShopping: true,
  remindTodayMeal: true,
  promoUpdates: false,
};

// Device-local preference, scoped per user so account switches don't leak.
function prefsKey(): string | null {
  const { userId } = getCurrentScope();
  return userId ? `frigo_notify_prefs_${encodeURIComponent(userId)}` : null;
}

function readToggles(): ToggleState {
  try {
    const key = prefsKey();
    const raw = key ? localStorage.getItem(key) : null;
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const result = { ...DEFAULT_TOGGLES };
        for (const key of Object.keys(result) as Array<keyof ToggleState>) {
          const value = (parsed as Record<string, unknown>)[key];
          if (typeof value === 'boolean') result[key] = value;
        }
        return result;
      }
    }
  } catch {
    // corrupted prefs fall back to defaults
  }
  return DEFAULT_TOGGLES;
}

const PERMISSION_LABELS: Record<string, string> = {
  granted: 'đã cho phép',
  denied: 'đã chặn',
  default: 'chưa được yêu cầu',
  unsupported: 'trình duyệt không hỗ trợ',
};

/**
 * T17 screen 24 — notification preferences, separated from the inbox
 * (screen 23). Only real capability is offered: device-local reminder
 * intent switches; no scheduled/filter delivery is implemented.
 */
export const NotificationPreferencesPage: React.FC = () => {
  const [toggles, setToggles] = useState<ToggleState>(readToggles);

  const [storageMessage, setStorageMessage] = useState<string | null>(null);

  const toggle = (key: keyof ToggleState) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    try {
      const storageKey = prefsKey();
      if (!storageKey) throw new Error('No preference owner');
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageMessage('Đã ghi nhớ lựa chọn trên thiết bị này.');
    } catch {
      setStorageMessage('Chưa lưu được trên thiết bị. Lựa chọn chỉ giữ khi trang này đang mở.');
    }
  };

  const browserPermission =
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

  return (
    <AccountPage title="Tùy chỉnh thông báo" description="Nhắc nhở từ tủ lạnh của bạn">

      <section aria-label="Lựa chọn nhắc nhở" className="mb-6">
        <h2 className="text-type-label text-semantic-text-primary mb-2">Lựa chọn nhắc nhở</h2>
        <div className="bg-semantic-surface rounded-card border border-semantic-border divide-y divide-semantic-border">
          {(
            [
              { key: 'remindWeekPlan', label: 'Nhắc lập thực đơn tuần', desc: 'Chuẩn bị bữa ăn cho tuần kế tiếp', icon: Calendar },
              { key: 'remindExpiring', label: 'Nhắc nguyên liệu sắp hết', desc: 'Ưu tiên đồ ăn cần dùng sớm', icon: Clock },
              { key: 'remindShopping', label: 'Nhắc đi chợ', desc: 'Theo dõi nguyên liệu cần mua', icon: ShoppingBag },
              { key: 'remindTodayMeal', label: 'Nhắc bữa ăn hôm nay', desc: 'Theo dõi bữa ăn trong ngày', icon: Bell },
              { key: 'promoUpdates', label: 'Khuyến mãi & cập nhật', desc: 'Tính năng mới và ưu đãi Takosan Plus', icon: Sparkles },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="account-switch-row">
                <span className="w-9 h-9 rounded-card bg-semantic-background-subtle text-semantic-action-primary flex items-center justify-center shrink-0" aria-hidden="true">
                  <Icon className="w-5 h-5" />
                </span>
                <Switch
                  checked={toggles[item.key]}
                  onChange={() => toggle(item.key)}
                  label={item.label}
                  description={item.desc}
                />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-semantic-text-muted mt-2 px-1">
          Các lựa chọn này chỉ ghi nhớ mong muốn trên thiết bị. Hiện chúng chưa lọc hộp
          thông báo hoặc tự gửi nhắc nhở theo lịch.
        </p>
      </section>

      {storageMessage && <p role="status">{storageMessage}</p>}

      <section aria-label="Kênh gửi thông báo" className="space-y-3">
        <h2 className="text-type-label text-semantic-text-primary">Kênh gửi</h2>
        <UnavailableState title="Email — chưa cấu hình">
          Chưa có email nhắc nhở bữa ăn hay đi chợ. Email xác thực tài khoản là luồng riêng.
        </UnavailableState>
        <UnavailableState title="Thông báo đẩy — chưa cấu hình">
          Takosan hiện chưa gửi thông báo đẩy. Quyền thông báo trên trình duyệt:{' '}
          <strong>{PERMISSION_LABELS[browserPermission] ?? 'không xác định'}</strong>. Quyền này
          không có nghĩa là nhắc nhở đang được gửi.
        </UnavailableState>
      </section>
    </AccountPage>
  );
};
