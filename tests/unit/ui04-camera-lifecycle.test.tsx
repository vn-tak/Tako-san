// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { CameraViewfinder } from '../../src/web/components/scan/CameraViewfinder';

let root: Root;
let host: HTMLDivElement;
const mediaStream = () => {
  const track = { stop: vi.fn(), getCapabilities: () => ({}) };
  return {
    track,
    stream: { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream,
  };
};
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const mount = () =>
  act(async () =>
    root.render(
      <CameraViewfinder scanType="fridge" onCapture={vi.fn()} onSelectFromGallery={vi.fn()} />,
    ),
  );

it('stops the actual opened stream on switch and unmount', async () => {
  const first = mediaStream();
  const second = mediaStream();
  const getUserMedia = vi
    .fn()
    .mockResolvedValueOnce(first.stream)
    .mockResolvedValueOnce(second.stream);
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
  await mount();
  expect(first.track.stop).not.toHaveBeenCalled();
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Đổi camera"]')!.click(),
  );
  expect(first.track.stop).toHaveBeenCalledOnce();
  expect(second.track.stop).not.toHaveBeenCalled();
  await act(async () => root.unmount());
  expect(second.track.stop).toHaveBeenCalledOnce();
});

it('stops a late stream opened after the component has unmounted', async () => {
  const late = mediaStream();
  let finish!: (stream: MediaStream) => void;
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      ),
    },
  });
  await mount();
  await act(async () => root.unmount());
  await act(async () => finish(late.stream));
  expect(late.track.stop).toHaveBeenCalledOnce();
});
