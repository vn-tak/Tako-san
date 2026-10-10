// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { voiceChef } from '../../src/web/lib/voice-chef';

class Recognition {
  static instances: Recognition[] = [];
  start = vi.fn();
  stop = vi.fn();
  onresult!: (event: { results: Array<Array<{ transcript: string }>> }) => void;
  onend!: () => void;
  onerror!: (event: { error: string }) => void;
  constructor() {
    Recognition.instances.push(this);
  }
}
beforeEach(() => {
  Recognition.instances = [];
  vi.stubGlobal('SpeechRecognition', Recognition);
});
afterEach(() => {
  voiceChef.stopListening();
  voiceChef.stopSpeaking();
  vi.unstubAllGlobals();
});
it('ignores late results and restart from a replaced recognition session', () => {
  const firstNext = vi.fn(),
    secondNext = vi.fn();
  const disposeFirst = voiceChef.startListening({ onNext: firstNext });
  const first = Recognition.instances[0];
  voiceChef.startListening({ onNext: secondNext });
  const second = Recognition.instances[1];
  disposeFirst();
  expect(second.stop).not.toHaveBeenCalled();
  first.onresult({ results: [[{ transcript: 'tiếp' }]] });
  first.onend();
  expect(firstNext).not.toHaveBeenCalled();
  expect(first.start).toHaveBeenCalledOnce();
  second.onresult({ results: [[{ transcript: 'tiếp' }]] });
  expect(secondNext).toHaveBeenCalledOnce();
  second.onend();
  expect(second.start).toHaveBeenCalledTimes(2);
});
it('stopping voice suppresses late commands, errors and automatic restarts', () => {
  const next = vi.fn(),
    error = vi.fn();
  voiceChef.startListening({ onNext: next, onError: error });
  const recognition = Recognition.instances[0];
  voiceChef.stopListening();
  recognition.onresult({ results: [[{ transcript: 'tiếp' }]] });
  recognition.onerror({ error: 'not-allowed' });
  recognition.onend();
  expect(next).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  expect(recognition.start).toHaveBeenCalledOnce();
  expect(recognition.stop).toHaveBeenCalledOnce();
});
it('unsupported recognition reports an error rather than claiming to listen', () => {
  vi.stubGlobal('SpeechRecognition', undefined);
  vi.stubGlobal('webkitSpeechRecognition', undefined);
  const error = vi.fn();
  voiceChef.startListening({ onError: error });
  expect(error).toHaveBeenCalledOnce();
  expect(Recognition.instances).toHaveLength(0);
});
it('non-permission no-speech events preserve listening and real errors stop auto-restart', () => {
  const error = vi.fn();
  voiceChef.startListening({ onError: error });
  const recognition = Recognition.instances[0];
  recognition.onerror({ error: 'no-speech' });
  expect(error).not.toHaveBeenCalled();
  recognition.onerror({ error: 'not-allowed' });
  expect(error).toHaveBeenCalledOnce();
  recognition.onend();
  expect(recognition.start).toHaveBeenCalledOnce();
});
it('speech synthesis error releases the UI speaking state via its completion callback', () => {
  let utterance!: { onerror: () => void };
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      onerror = () => {};
    },
  );
  vi.stubGlobal('speechSynthesis', {
    cancel: vi.fn(),
    getVoices: () => [],
    speak: (value: typeof utterance) => {
      utterance = value;
    },
  });
  const end = vi.fn();
  expect(voiceChef.speakInstruction('Read step', end)).toBe(true);
  utterance.onerror();
  expect(end).toHaveBeenCalledOnce();
});
