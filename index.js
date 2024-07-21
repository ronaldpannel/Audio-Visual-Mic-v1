window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let angleModifier;
  const modifier = document.getElementById("modifier");
  const modifierLabel = document.getElementById("valueLabel");

  modifier.addEventListener("change", () => {
    angleModifier = modifier.value;
     updateLabel();
    console.log(angleModifier);
  });

  class Bar {
    constructor(x, y, width, height, color, index) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.index = index;
    }
    update(micInput) {
      this.height += micInput * 100;
      const sound = micInput * 100;
      if (sound > this.height / 2) {
        this.height = sound;
      } else {
        this.height -= this.height/2 * 0.00001;
      }
    }
    draw(ctx, volume) {
      ctx.fillStyle = this.color;
      ctx.strokeStyle = this.color;
      // ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.lineWidth = this.width;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(this.index * angleModifier);
      ctx.beginPath();
      ctx.lineWidth = this.index * 0.05;
      ctx.moveTo(0, this.y);
      ctx.bezierCurveTo(
        this.x - this.height * 0.5,
        this.y + this.height * 0.2,
        -this.height * -0.1,
        this.height * 0.5,
        -this.height * 2,
        this.y
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.lineWidth = this.index * 0.05;
      //  ctx.scale(volume * 20, volume * 20);
      ctx.rect(-this.height * 2 - 20, this.y - 10, this.height / 4, this.height/ 4);
      ctx.fill();
      // ctx.arc(-this.height * 2, this.y, this.height * 0.1, 0, Math.PI * 2);

      ctx.restore();
    }
  }

  class Microphone {
    constructor(fftSize) {
      this.initialized = false;
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(
          function (stream) {
            this.audioContext = new AudioContext();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = fftSize;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.microphone.connect(this.analyser);
            this.initialized = true;
          }.bind(this)
        )
        .catch(function (err) {
          alert(err);
        });
    }
    getSamples() {
      this.analyser.getByteTimeDomainData(this.dataArray);
      let normSamples = [...this.dataArray].map((e) => e / 128 - 1);
      return normSamples;
    }
    getVolume() {
      this.analyser.getByteTimeDomainData(this.dataArray);
      let normSamples = [...this.dataArray].map((e) => e / 128 - 1);
      let sum = 0;
      for (let i = 0; i < normSamples.length; i++) {
        sum += normSamples[i] * normSamples[i];
      }
      let volume = Math.sqrt(sum / normSamples.length);
      return volume;
    }
  }
  let fftSize = 256;
  const microphone = new Microphone(fftSize);
  let bars = [];
  let barWidth = canvas.width / (fftSize / 2);

  function createBars() {
    for (let i = 0; i < fftSize / 2; i++) {
      let hue = i * 10
      let color = `hsl(${hue}, 100%, 50%)`;
      bars.push(new Bar(i, 10, 0.5, 50, color, i));
    }
  }
  createBars();
  function updateLabel(){
    modifierLabel.innerHTML = `Value: ${angleModifier}`
  }

  function animate() {
    if (microphone.initialized) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const samples = microphone.getSamples();
      const volume = microphone.getVolume();
      console.log(volume);

      bars.forEach((bar, i) => {
        bar.draw(ctx, volume);
        bar.update(samples[i]);
      });
    }

    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", (e) => {
    canvas.width = e.currentTarget.innerWidth;
    canvas.height = e.currentTarget.innerHeight;
  });
}); //load
