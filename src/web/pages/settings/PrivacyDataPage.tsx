import { AccountPage } from '../../components/common/AccountPage';
import React, { useState } from 'react';
import { Bell, Bot } from 'lucide-react';
import { Section, Surface, UnavailableState } from '../../design-system/primitives';

const PERMISSION_LABELS: Record<string, string> = {
  granted: 'đã cho phép',
  denied: 'đã chặn',
  default: 'chưa được yêu cầu',
  unsupported: 'trình duyệt không hỗ trợ',
};

/**
 * T17 screen 26 — privacy & data. Every action maps to a real capability or
 * an honest unavailable state; no fake export file or deletion success.
 */
export const PrivacyDataPage: React.FC = () => {
  const [browserPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  return (
    <AccountPage title="Quyền riêng tư & dữ liệu" description="Dữ liệu của bạn ở trong tủ lạnh của bạn">

      <div className="space-y-4 pb-8">
        <Section title="Dữ liệu Takosan lưu">
          <Surface className="p-4 space-y-2">
            <p className="text-sm text-semantic-text-secondary leading-relaxed">
              Takosan lưu hồ sơ tài khoản, sở thích ăn uống, nguyên liệu trong tủ, lịch sử quét
              và thực đơn thuộc hộ gia đình của bạn. Dữ liệu được phân tách theo hộ; các hộ khác
              không nhìn thấy tủ hoặc thực đơn của bạn.
            </p>
          </Surface>
        </Section>

        <Section title="Cách AI được dùng">
          <Surface className="p-4 space-y-2">
            <p className="text-sm text-semantic-text-secondary leading-relaxed flex gap-2">
              <Bot className="w-4 h-4 text-semantic-action-primary shrink-0 mt-0.5" aria-hidden="true" />
              Khi bạn gửi ảnh để quét, ảnh và nội dung trên ảnh được xử lý để nhận diện nguyên
              liệu. Ảnh có thể chứa thông tin cá nhân; hãy che thông tin không cần thiết trước
              khi gửi. Kết quả nhận diện cần được bạn kiểm tra trước khi thêm vào tủ.
            </p>
          </Surface>
        </Section>

        <Section title="Quyền trên trình duyệt">
          <Surface className="p-4 space-y-2">
            <p className="text-sm text-semantic-text-secondary flex gap-2">
              <Bell className="w-4 h-4 text-semantic-action-primary shrink-0 mt-0.5" aria-hidden="true" />
              <span className="min-w-0 leading-relaxed">
                Quyền thông báo hiện tại:{' '}
                <strong>{PERMISSION_LABELS[browserPermission] ?? 'không xác định'}</strong>. Bạn đổi
                quyền này trong cài đặt trình duyệt; Takosan không thể tự bật.
              </span>
            </p>
          </Surface>
        </Section>

        <Section title="Dữ liệu cá nhân">
          <div className="space-y-3">
            <UnavailableState title="Xuất dữ liệu — chưa hỗ trợ">
              Bạn hiện chưa thể tải bản xuất dữ liệu cá nhân từ ứng dụng.
            </UnavailableState>
            <UnavailableState title="Xóa tài khoản — chưa hỗ trợ">
              Bạn hiện chưa thể xóa tài khoản và dữ liệu vĩnh viễn từ ứng dụng.
              Đăng xuất chỉ kết thúc phiên trên thiết bị, không xóa tài khoản.
            </UnavailableState>
          </div>
          <p className="text-xs text-semantic-text-muted mt-2">
            Đăng xuất khỏi thiết bị vẫn hoạt động từ trang Hồ sơ của bạn.
          </p>
        </Section>
      </div>
    </AccountPage>
  );
};
