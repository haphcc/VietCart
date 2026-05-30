class EventBus {
  constructor() {
    this.handlers = new Map();
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
  }

  subscribe(eventName, handler) {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }

  publish(eventName, payload) {
    this.queue.push({
      eventName,
      payload,
      attempts: 0
    });

    setImmediate(() => this.processQueue());
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      const handlers = this.handlers.get(event.eventName) || [];

      for (const handler of handlers) {
        try {
          await handler(event.payload);
        } catch (error) {
          event.attempts += 1;
          console.error(`[eventBus] ${event.eventName} failed on attempt ${event.attempts}: ${error.message}`);

          if (event.attempts < this.maxRetries) {
            this.queue.push(event);
          } else {
            console.error(`[eventBus] ${event.eventName} moved to dead letter queue`, event.payload);
          }
        }
      }
    }

    this.processing = false;
  }
}

export const eventBus = new EventBus();
