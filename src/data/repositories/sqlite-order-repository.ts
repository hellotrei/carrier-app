import { asOrderId, asUserId } from '../../core/types/ids';
import type { Order } from '../../domain/order/order';
import { isTerminalOrderStatus } from '../../domain/order/order';
import type { SqlStatementExecutor } from '../db/sqlite/database-port';
import type { OrderRepositoryPort } from './order-repository-port';

type OrderRow = {
  booking_session_id: string;
  cancel_reason: string | null;
  created_at: string;
  customer_id: string;
  destination_json: string;
  estimated_price: number;
  order_id: string;
  partner_id: string;
  pickup_json: string;
  requested_at: string | null;
  rider_declared_name: string;
  status: Order['status'];
  status_updated_at: string | null;
  updated_at: string;
};

function mapRowToOrder(row: OrderRow): Order {
  const order: Order = {
    orderId: asOrderId(row.order_id),
    bookingSessionId: row.booking_session_id,
    customerId: asUserId(row.customer_id),
    partnerId: asUserId(row.partner_id),
    riderDeclaredName: row.rider_declared_name,
    pickup: JSON.parse(row.pickup_json) as Order['pickup'],
    destination: JSON.parse(row.destination_json) as Order['destination'],
    estimatedPrice: row.estimated_price,
    status: row.status,
    createdAt: row.created_at,
    statusUpdatedAt: row.status_updated_at ?? row.updated_at,
    updatedAt: row.updated_at,
  };

  if (row.requested_at) {
    order.requestedAt = row.requested_at;
  }

  if (row.cancel_reason) {
    order.cancelReason =
      row.cancel_reason as NonNullable<Order['cancelReason']>;
  }

  return order;
}

export function createSqliteOrderRepository(
  database: SqlStatementExecutor,
): OrderRepositoryPort {
  return {
    async getActiveOrder() {
      const row = await database.queryOne<OrderRow>(
        `SELECT
          order_id,
          booking_session_id,
          cancel_reason,
          customer_id,
          partner_id,
          rider_declared_name,
          pickup_json,
          destination_json,
          estimated_price,
          requested_at,
          status,
          created_at,
          status_updated_at,
          updated_at
        FROM order_table
        ORDER BY updated_at DESC
        LIMIT 1`,
      );

      if (!row) {
        return null;
      }

      const order = mapRowToOrder(row);

      return isTerminalOrderStatus(order.status) ? null : order;
    },
    async saveOrder(order) {
      await database.execute(
        `INSERT INTO order_table (
          order_id,
          booking_session_id,
          cancel_reason,
          customer_id,
          partner_id,
          rider_declared_name,
          pickup_json,
          destination_json,
          estimated_price,
          requested_at,
          status,
          created_at,
          status_updated_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(order_id) DO UPDATE SET
          cancel_reason = excluded.cancel_reason,
          rider_declared_name = excluded.rider_declared_name,
          pickup_json = excluded.pickup_json,
          destination_json = excluded.destination_json,
          estimated_price = excluded.estimated_price,
          requested_at = excluded.requested_at,
          status = excluded.status,
          status_updated_at = excluded.status_updated_at,
          updated_at = excluded.updated_at`,
        [
          order.orderId,
          order.bookingSessionId,
          order.cancelReason ?? null,
          order.customerId,
          order.partnerId,
          order.riderDeclaredName,
          JSON.stringify(order.pickup),
          JSON.stringify(order.destination),
          order.estimatedPrice,
          order.requestedAt ?? null,
          order.status,
          order.createdAt,
          order.statusUpdatedAt,
          order.updatedAt,
        ],
      );
    },
  };
}
