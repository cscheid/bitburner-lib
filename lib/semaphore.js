export class Semaphore
{
  constructor(value) {
    this.value = value;
    this.tasks = [];
  }

  beingAwaited() {
    return this.tasks.length > 0;
  }
  
  release() {
    this.value += 1;
    if (this.tasks.length) {
      const { resolve } = this.tasks.pop();
      resolve();
    }
  }

  async acquire() {
    while (this.value < 0) {
      await new Promise((resolve, reject) => {
        this.tasks.push({ resolve, reject });
      });
    }
    this.value -= 1;
  }
  
  async runExclusive(fun) {
    await this.acquire();
    try {
      fun();
    } finally {
      this.release();
    }
  }
}
