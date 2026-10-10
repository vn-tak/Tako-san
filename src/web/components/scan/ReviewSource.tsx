import { useScanStore } from '../../stores/useScanStore';

export function ReviewSource({ scanId, verified }: { scanId: string; verified: boolean }) {
  const image = useScanStore((state) => state.imagePreviewUrl);
  const ownerScanId = useScanStore((state) => state.imageScanId);
  if (!verified || !scanId || ownerScanId !== scanId || !image) return null;
  return (
    <details className="review-source">
      <summary>Xem ảnh vừa quét</summary>
      <img src={image} alt="Ảnh nguồn của bản quét đang mở" />
    </details>
  );
}
