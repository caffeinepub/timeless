import { useRef, useState, useCallback, useEffect } from 'react';

type TrackName = 'diehard' | 'bond';

interface UseBackgroundMusicOptions {
  gameActive?: boolean;
  hasEnemies?: boolean;
}

interface UseBackgroundMusicReturn {
  isMuted: boolean;
  toggleMute: () => void;
  currentTrack: TrackName;
  initAudio: () => void;
}

export function useBackgroundMusic(options: UseBackgroundMusicOptions = {}): UseBackgroundMusicReturn {
  const { gameActive = false, hasEnemies = false } = options;

  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackName>('diehard');
  const [audioInitialized, setAudioInitialized] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const schedulerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentTrackRef = useRef<TrackName>('diehard');
  const isMutedRef = useRef(false);
  const mountedRef = useRef(true);
  const noteIndexRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Die Hard theme: "Ode to Joy" / epic action motif
  const getDieHardNotes = useCallback((): Array<{ freq: number; duration: number; type: OscillatorType }> => {
    // "Ode to Joy" inspired epic action theme
    const E4 = 329.63, F4 = 349.23, G4 = 392.0, A4 = 440.0, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25;
    const notes = [
      { freq: E4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: E4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: F4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: G4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: G4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: F4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: E4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: D5, duration: 0.25, type: 'square' as OscillatorType },
      { freq: C5, duration: 0.25, type: 'square' as OscillatorType },
      { freq: C5, duration: 0.25, type: 'square' as OscillatorType },
      { freq: D5, duration: 0.25, type: 'square' as OscillatorType },
      { freq: E4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: E4, duration: 0.375, type: 'square' as OscillatorType },
      { freq: D5, duration: 0.125, type: 'square' as OscillatorType },
      { freq: D5, duration: 0.5, type: 'square' as OscillatorType },
      // Second phrase
      { freq: E4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: E4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: F4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: G4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: G4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: F4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: E4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: D5, duration: 0.25, type: 'square' as OscillatorType },
      { freq: C5, duration: 0.25, type: 'square' as OscillatorType },
      { freq: C5, duration: 0.25, type: 'square' as OscillatorType },
      { freq: D5, duration: 0.25, type: 'square' as OscillatorType },
      { freq: E4, duration: 0.25, type: 'square' as OscillatorType },
      { freq: D5, duration: 0.375, type: 'square' as OscillatorType },
      { freq: C5, duration: 0.125, type: 'square' as OscillatorType },
      { freq: C5, duration: 0.5, type: 'square' as OscillatorType },
      // Bridge - epic build
      { freq: A4, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: A4, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: B4, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: C5, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: C5, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: B4, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: A4, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: G4, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: E5, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: E5, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: D5, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: C5, duration: 0.25, type: 'sawtooth' as OscillatorType },
      { freq: D5, duration: 0.5, type: 'sawtooth' as OscillatorType },
      { freq: E4, duration: 0.5, type: 'sawtooth' as OscillatorType },
    ];
    return notes;
  }, []);

  // Bond theme: iconic spy motif
  const getBondNotes = useCallback((): Array<{ freq: number; duration: number; type: OscillatorType }> => {
    const E3 = 164.81, G3 = 196.0, Bb3 = 233.08, B3 = 246.94;
    const C4 = 261.63, D4 = 293.66, Eb4 = 311.13, E4 = 329.63;
    const G4 = 392.0, A4 = 440.0, Bb4 = 466.16;
    const notes = [
      { freq: E3, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.1, type: 'sine' as OscillatorType },
      { freq: E3, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.1, type: 'sine' as OscillatorType },
      { freq: E3, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.1, type: 'sine' as OscillatorType },
      { freq: G3, duration: 0.5, type: 'sawtooth' as OscillatorType },
      { freq: Bb3, duration: 0.5, type: 'sawtooth' as OscillatorType },
      { freq: B3, duration: 0.75, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.25, type: 'sine' as OscillatorType },
      { freq: G3, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.1, type: 'sine' as OscillatorType },
      { freq: G3, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.1, type: 'sine' as OscillatorType },
      { freq: G3, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.1, type: 'sine' as OscillatorType },
      { freq: A4, duration: 0.5, type: 'sawtooth' as OscillatorType },
      { freq: G4, duration: 0.5, type: 'sawtooth' as OscillatorType },
      { freq: Eb4, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: D4, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: C4, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: Bb4, duration: 0.75, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.25, type: 'sine' as OscillatorType },
      { freq: E4, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: Eb4, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: D4, duration: 0.33, type: 'sawtooth' as OscillatorType },
      { freq: Bb3, duration: 0.75, type: 'sawtooth' as OscillatorType },
      { freq: 0, duration: 0.5, type: 'sine' as OscillatorType },
    ];
    return notes;
  }, []);

  const scheduleNote = useCallback((
    ctx: AudioContext,
    gainNode: GainNode,
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType
  ) => {
    if (freq === 0) return; // rest

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
    noteGain.gain.linearRampToValueAtTime(0.1, startTime + duration * 0.7);
    noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(gainNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }, []);

  const runScheduler = useCallback(() => {
    if (!mountedRef.current) return;
    const ctx = audioCtxRef.current;
    const gainNode = gainNodeRef.current;
    if (!ctx || !gainNode) return;

    const scheduleAhead = 0.2;
    const currentTime = ctx.currentTime;
    const track = currentTrackRef.current;
    const notes = track === 'diehard' ? getDieHardNotes() : getBondNotes();

    while (nextNoteTimeRef.current < currentTime + scheduleAhead) {
      const noteIdx = noteIndexRef.current % notes.length;
      const note = notes[noteIdx];
      scheduleNote(ctx, gainNode, note.freq, nextNoteTimeRef.current, note.duration, note.type);
      nextNoteTimeRef.current += note.duration;
      noteIndexRef.current++;
    }

    schedulerTimerRef.current = setTimeout(runScheduler, 50);
  }, [getDieHardNotes, getBondNotes, scheduleNote]);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;

    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(isMutedRef.current ? 0 : 0.5, ctx.currentTime);
      gainNode.connect(ctx.destination);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gainNode;

      nextNoteTimeRef.current = ctx.currentTime + 0.1;
      noteIndexRef.current = 0;

      setAudioInitialized(true);
      runScheduler();
    } catch (err) {
      console.warn('Audio initialization failed:', err);
    }
  }, [runScheduler]);

  // Switch tracks based on game state
  useEffect(() => {
    if (!audioInitialized) return;
    const newTrack: TrackName = hasEnemies ? 'diehard' : 'diehard'; // Die Hard is always default
    // Bond plays during calm moments
    const targetTrack: TrackName = gameActive && hasEnemies ? 'diehard' : gameActive ? 'bond' : 'diehard';

    if (targetTrack !== currentTrackRef.current) {
      currentTrackRef.current = targetTrack;
      noteIndexRef.current = 0;
      setCurrentTrack(targetTrack);
    }
  }, [gameActive, hasEnemies, audioInitialized]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMutedRef.current;
    isMutedRef.current = newMuted;
    setIsMuted(newMuted);

    if (gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      gainNodeRef.current.gain.linearRampToValueAtTime(
        newMuted ? 0 : 0.5,
        ctx.currentTime + 0.1
      );
    }
  }, []);

  return {
    isMuted,
    toggleMute,
    currentTrack,
    initAudio,
  };
}
