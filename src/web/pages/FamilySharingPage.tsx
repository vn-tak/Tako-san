import { AccountPage } from '../components/common/AccountPage';
import React from 'react';
import { Users } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { Section, Surface, UnavailableState, StatusBadge } from '../design-system/primitives';

/**
 * T17 screen 21 — Household & Sharing over real capability only. The server
 * has no invite/join/member-list contract today, so every unavailable action
 * says so honestly; no fabricated members, invite codes, or fake joins
 * (states/empty.md, non-negotiable rule 10).
 */
export const FamilySharingPage: React.FC = () => {
  const { displayName, householdId } = useAuthStore();

  return (
    <AccountPage title="Hộ gia đình & chia sẻ" description="Tủ lạnh này thuộc về hộ của bạn.">

      <div className="space-y-4 pb-8">
        <Section title="Hộ gia đình hiện tại">
          <Surface className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-10 h-10 rounded-card bg-semantic-success-soft text-semantic-action-primary flex items-center justify-center shrink-0" aria-hidden="true">
                  <Users className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-semantic-text-primary break-words">Tủ lạnh nhà tôi</h3>
                  <p className="text-xs text-semantic-text-muted break-words">Mã hộ: {householdId}</p>
                </div>
              </div>
              {/* Only the session-derived fact is asserted: this account
                  belongs to the household. No server status is invented. */}
              <StatusBadge tone="info">Hộ của bạn</StatusBadge>
            </div>
            <p className="text-sm text-semantic-text-secondary leading-relaxed">
              Dữ liệu tủ lạnh, lịch sử quét và thực đơn được phân tách theo hộ. Tài khoản của bạn
              ({displayName || 'bạn'}) là thành viên của hộ này.
            </p>
          </Surface>
        </Section>

        <Section title="Chia sẻ với người thân">
          <div className="space-y-3">
            <UnavailableState title="Mời thành viên — chưa hỗ trợ">
              Takosan chưa hỗ trợ gửi lời mời hay mã tham gia hộ. Bạn hiện dùng tủ lạnh
              thuộc hộ của tài khoản này.
            </UnavailableState>
            <UnavailableState title="Tham gia hộ khác — chưa hỗ trợ">
              Bạn hiện chưa thể chuyển sang hộ khác bằng mã tham gia.
            </UnavailableState>
            <UnavailableState title="Danh sách thành viên — chưa hỗ trợ">
              Hiện chưa có danh sách thành viên và vai trò để xem tại đây.
            </UnavailableState>
          </div>
        </Section>

        <p className="text-xs text-semantic-text-muted leading-relaxed">
          Khi chia sẻ hộ được mở, người thân sẽ cùng theo dõi đồ ăn trong tủ, danh sách đi chợ và
          cảnh báo đồ sắp hết hạn — với đúng quyền máy chủ cho phép.
        </p>
      </div>
    </AccountPage>
  );
};
