import Util from './Util';

const BALL_GRAVITY = 9.8;
export default class BouncingBall {
  constructor() {
    this.position = Util.generatePosition();
    this.H0 = this.position[1];
    this.V0 = 0;
    this.VF = Math.sqrt(2 * BALL_GRAVITY * this.H0);
    this.HF = 0;
    this.bouncing_time = 0;
    this.BOUNCINESS = (Math.random() + 0.5);
    this.color = [Math.random(), Math.random(), Math.random(), 1.0];
  }

  update(time) {
    const t = time - this.bouncing_time;
    // update position
    let h = this.position[1];
    h = this.H0 + (this.V0 * t) - (0.5 * BALL_GRAVITY * t * t);
    if (h <= 0) {
      this.bouncing_time = time;
      this.V0 = this.VF * this.BOUNCINESS;
      this.HF = (this.V0 * this.V0) / (2 * BALL_GRAVITY);
      this.VF = Math.sqrt(2 * BALL_GRAVITY * this.HF);
      this.H0 = 0;
    } else {
      this.position[1] = h;
    }
  }
}
