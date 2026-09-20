// Audio-Visual and Push Notification Utility for Kaal Kuaan Proximity Alert

class SafetyNotificationService {
  private static instance: SafetyNotificationService;
  private audioCtx: AudioContext | null = null;
  private lastAlertTimestamp: number = 0;
  private lastAlertHazardId: string = '';

  private constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock);
      window.addEventListener('keydown', unlock);
      window.addEventListener('touchstart', unlock);
    }
  }

  public static getInstance(): SafetyNotificationService {
    if (!SafetyNotificationService.instance) {
      SafetyNotificationService.instance = new SafetyNotificationService();
    }
    return SafetyNotificationService.instance;
  }

  // Request browser desktop/mobile push notification permission
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      try {
        return await Notification.requestPermission();
      } catch (e) {
        return 'denied';
      }
    }

    return Notification.permission;
  }

  private currentAudio: HTMLAudioElement | null = null;

  // Play authentic public safety small warning siren (spins up, holds, and winds down)
  public playSiren(isCritical: boolean = false): void {
    try {
      // 1. Primary: Play pre-rendered, authentic small warning siren (not an ambulance)
      const soundFile = '/sounds/siren-small.wav';

      if (typeof Audio !== 'undefined') {
        if (this.currentAudio) {
          try {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
          } catch (e) {}
        }

        const audio = new Audio(soundFile);
        audio.volume = 0.9;
        this.currentAudio = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('HTML Audio playback error, falling back to Web Audio synthesis:', err);
            this.synthesizeSmallWarningSiren(isCritical);
          });
        }
      } else {
        this.synthesizeSmallWarningSiren(isCritical);
      }

      // Haptic feedback pattern on mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (isCritical) {
          navigator.vibrate([250, 100, 250, 100, 400]);
        } else {
          navigator.vibrate([150, 100, 150]);
        }
      }
    } catch (err) {
      console.warn('Siren audio error, falling back to synthesis:', err);
      this.synthesizeSmallWarningSiren(isCritical);
    }
  }

  // Serious public-safety emergency danger alarm (simultaneous 853Hz + 960Hz dual-frequency alert pulses)
  public synthesizeSmallWarningSiren(isCritical: boolean = false): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Dual-frequency official emergency alert: 853Hz + 960Hz played together
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(853, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(960, now);

      // 3 sharp, urgent emergency hazard pulses
      gain.gain.setValueAtTime(0, now);

      // Pulse 1: 0 to 0.32s
      gain.gain.setValueAtTime(0.25, now + 0.01);
      gain.gain.setValueAtTime(0.25, now + 0.31);
      gain.gain.setValueAtTime(0, now + 0.32);

      // Pulse 2: 0.42s to 0.74s
      gain.gain.setValueAtTime(0.25, now + 0.43);
      gain.gain.setValueAtTime(0.25, now + 0.73);
      gain.gain.setValueAtTime(0, now + 0.74);

      // Pulse 3: 0.84s to 1.32s
      gain.gain.setValueAtTime(0.25, now + 0.85);
      gain.gain.setValueAtTime(0.25, now + 1.30);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.36);
      osc2.stop(now + 1.36);
    } catch (e) {
      console.warn('Web Audio emergency alert synthesis error:', e);
    }
  }

  // Immediately stop any active alert sound
  public stopSiren(): void {
    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }
      if (this.audioCtx && this.audioCtx.state === 'running') {
        this.audioCtx.suspend().catch(() => {});
      }
    } catch (e) {
      console.warn('Error stopping siren audio:', e);
    }
  }

  // Backwards-compatible alias
  public playAudioWarning(isCritical: boolean = false): void {
    this.playSiren(isCritical);
  }

  // Trigger browser native notification + audio strictly if hazard is within 1km
  public triggerHazardAlert({
    hazardId,
    hazardType,
    area,
    distanceMeters,
    isCritical
  }: {
    hazardId: string;
    hazardType: string;
    area: string;
    distanceMeters: number;
    isCritical: boolean;
  }): void {
    // Strictly do not alert if distance is greater than 1000 meters
    if (distanceMeters > 1000) {
      this.stopSiren();
      return;
    }

    const now = Date.now();
    // Debounce alerts to avoid spamming the user: wait at least 30s for the same hazard
    if (this.lastAlertHazardId === hazardId && now - this.lastAlertTimestamp < 30000) {
      return;
    }

    this.lastAlertHazardId = hazardId;
    this.lastAlertTimestamp = now;

    // 1. Play audio warning tone
    this.playAudioWarning(isCritical);

    // 2. Browser native desktop/mobile push notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const title = isCritical
          ? `🚨 CRITICAL SAFETY ALERT: Open Borewell ${distanceMeters}m Away!`
          : `⚠️ BOREWELL HAZARD DETECTED: Within ${distanceMeters}m (${area})`;

        const options: any = {
          body: `An active ${hazardType} has been detected ${distanceMeters} meters from your current coordinates in ${area}. Please exercise caution.`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `borewell-alert-${hazardId}`,
          renotify: true
        };

        new Notification(title, options);
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }
  }
}

export const safetyNotifier = SafetyNotificationService.getInstance();
