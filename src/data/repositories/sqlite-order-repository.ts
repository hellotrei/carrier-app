import { asOrderId, asUserId } from '../../core/types/ids';
import type { Order } from '../../domain/order/order';
import { isTerminalOrderStatus } from '../../domain/order/order';
import type { SqlStatementExecutor } from '../db/sqlite/database-port';
import type { OrderRepositoryPort } from './order-repository-port';

type OrderRow = {
  booking_session_id: string;
  created_at: string;
  customer_id: string;
  destination_json: string;
  estimated_price: number;
  order_id: string;
  partner_id: string;
  pickup_json: string;
  rider_declared_name: string;
  status: Order['status'];
  updated_at: string;
};

function mapRowToOrder(row: OrderRow): Order {
  return {
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
    updatedAt: row.updated_at,
  };
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
          customer_id,
          partner_id,
          rider_declared_name,
          pickup_json,
          destination_json,
          estimated_price,
          status,
          created_at,
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
          customer_id,
          partner_id,
          rider_declared_name,
          pickup_json,
          destination_json,
          estimated_price,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(order_id) DO UPDATE SET
          rider_declared_name = excluded.rider_declared_name,
          pickup_json = excluded.pickup_json,
          destination_json = excluded.destination_json,
          estimated_price = excluded.estimated_price,
          status = excluded.status,
          updated_at = excluded.updated_at`,
        [
          order.orderId,
          order.bookingSessionId,
          order.customerId,
          order.partnerId,
          order.riderDeclaredName,
          JSON.stringify(order.pickup),
          JSON.stringify(order.destination),
          order.estimatedPrice,
          order.status,
          order.createdAt,
          order.updatedAt,
        ],
      );
    },
  };
}
