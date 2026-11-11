(function (Scratch) {
  'use strict';

  const { BlockType } = Scratch;

  class LagBendingExtension {
    constructor() {
      this.stream = null;
      this.video = null;
      this.canvas = null;
      this.context = null;
      this.overlay = null;
      this.startingCamera = false;
    }

    getInfo() {
      return {
        id: 'lagbending',
        name: 'LAG BENDING',
        color1: '#7B45D6',
        color2: '#6634BD',
        color3: '#51279C',
        blocks: [
          {
            opcode: 'enableCamera',
            blockType: BlockType.COMMAND,
            text: 'enable camera'
          },
          {
            opcode: 'advanceFrame',
            blockType: BlockType.COMMAND,
            text: 'advance frame'
          }
        ]
      };
    }

    createStageCanvas() {
      const stage = Scratch.gandi?.stage;
      if (!stage || typeof stage.addOverlay !== 'function') {
        throw new Error('LAG BENDING needs Gandi 3 stage overlays.');
      }

      if (this.canvas && this.overlay) return;

      this.overlay = stage.addOverlay({
        scale: true,
        interactive: false,
        name: 'lag-bending-camera'
      });

      if (!this.overlay) {
        throw new Error('The Gandi stage is not available yet.');
      }

      const stageCanvas =
        typeof stage.getCanvas === 'function' ? stage.getCanvas() : null;
      const width = stageCanvas?.width || 480;
      const height = stageCanvas?.height || 360;

      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.position = 'absolute';
      this.canvas.style.inset = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.objectFit = 'fill';
      this.canvas.style.pointerEvents = 'none';
      this.overlay.appendChild(this.canvas);

      this.context = this.canvas.getContext('2d', { alpha: false });
      if (!this.context) {
        throw new Error('Could not create the camera drawing canvas.');
      }
    }

    async enableCamera() {
      if (this.startingCamera) return;
      if (this.stream && this.video && this.video.readyState >= 2) {
        this.captureCurrentFrame();
        return;
      }

      this.startingCamera = true;
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is unavailable. Use Gandi over HTTPS.');
        }

        this.createStageCanvas();

        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        this.video = document.createElement('video');
        this.video.autoplay = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.srcObject = this.stream;

        await new Promise((resolve, reject) => {
          if (this.video.readyState >= 2) {
            resolve();
            return;
          }

          const onReady = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error('The camera stream could not be started.'));
          };
          const cleanup = () => {
            this.video.removeEventListener('loadeddata', onReady);
            this.video.removeEventListener('error', onError);
          };

          this.video.addEventListener('loadeddata', onReady, { once: true });
          this.video.addEventListener('error', onError, { once: true });
          this.video.play().catch(reject);
        });

        await this.video.play();
        this.captureCurrentFrame();
      } catch (error) {
        this.stopStream();
        console.error('[LAG BENDING] Camera error:', error);
        alert('LAG BENDING: ' + (error?.message || 'Could not access the camera.'));
      } finally {
        this.startingCamera = false;
      }
    }

    advanceFrame() {
      if (!this.video || !this.stream) return;
      if (this.video.readyState < 2) return;
      this.captureCurrentFrame();
    }

    captureCurrentFrame() {
      if (!this.video || !this.context || !this.canvas) return;
      if (this.video.videoWidth === 0 || this.video.videoHeight === 0) return;

      this.context.drawImage(
        this.video,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }

    stopStream() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }
      this.stream = null;
      this.video = null;
    }
  }

  Scratch.extensions.register(new LagBendingExtension());
})(window.Scratch);
