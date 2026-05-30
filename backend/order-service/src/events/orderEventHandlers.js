import { eventBus } from './eventBus.js';
import { orderService } from '../services/order.service.js';

let registered = false;

export function registerOrderEventHandlers() {
  if (registered) return;

  eventBus.subscribe('order.created', async ({ orderId, paymentMethod }) => {
    if (paymentMethod !== 'cod') return;
    await orderService.updateStatus(orderId, 'confirmed');
  });

  registered = true;
}
