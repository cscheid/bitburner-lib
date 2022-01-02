import { Semaphore } from "/lib/semaphore.js";

export class ConditionVariable
{
  constructor() {
    this.semaphore = new Semaphore(0);
  }

  async wait(check) {
    while (!check()) {
      await this.semaphore.acquire();
    }
  }

  notify() {
    if (this.semaphore.beingAwaited()) {
      this.semaphore.release();
    }
  }

  // NB for future readers, this only works in
  // concurrent-but-not-parallel languages!
  notifyAll() {
    while (this.semaphore.beingAwaited()) {
      this.semaphore.release();
    }
  }
};
  
