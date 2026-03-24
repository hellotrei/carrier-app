import { asOrderId, asUserId } from '../../core/types/ids';
import type { Order } from '../../domain/order/order';
import type { SqlStatementExecutor } from '../db/sqlite/database-port';
import type { HistoryFilter, OrderRepositoryPort } from './order-repository-port';

type OrderRow = {
  booking_session_id: string;
  cancel_reason: string | null;
  completed_at: string | null;
  created_at: string;
  customer_id: string;
  destination_json: string;
  estimated_price: number;
  feedback_source: 'default_auto' | 'manual' | null;
  final_rating: number | null;
  order_id: string;
  partner_id: string;
  pickup_json: string;
  requested_at: string | null;
  review_text: string | null;
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

  if (row.completed_at) {
    order.completedAt = row.completed_at;
  }

  if (row.final_rating !== null) {
    order.finalRating = row.final_rating;
  }

  if (row.review_text) {
    order.reviewText = row.review_text;
  }

  if (row.feedback_source) {
    order.feedbackSource = row.feedback_source;
  }

  return order;
}

function buildHistoryWhereClause(filter: HistoryFilter): string {
  if (filter === 'completed') {
    return `WHERE status = 'Completed'`;
  }

  if (filter === 'canceled') {
    return `WHERE status = 'Canceled'`;
  }

  return `WHERE status IN ('Completed', 'Canceled')`;
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
          completed_at,
          customer_id,
          partner_id,
          rider_declared_name,
          pickup_json,
          destination_json,
          estimated_price,
          feedback_source,
          final_rating,
          requested_at,
          review_text,
          status,
          created_at,
          status_updated_at,
          updated_at
        FROM order_table
        WHERE status NOT IN ('Completed', 'Canceled', 'Rejected', 'Expired')
        ORDER BY updated_at DESC
        LIMIT 1`,
      );

      if (!row) {
        return null;
      }

      const order = mapRowToOrder(row);

      return order;
    },
    async getOrderById(orderId) {
      const row = await database.queryOne<OrderRow>(
        `SELECT
          order_id,
          booking_session_id,
          cancel_reason,
          completed_at,
          customer_id,
          partner_id,
          rider_declared_name,
          pickup_json,
          destination_json,
          estimated_price,
          feedback_source,
          final_rating,
          requested_at,
          review_text,
          status,
          created_at,
          status_updated_at,
          updated_at
        FROM order_table
        WHERE order_id = ?
        LIMIT 1`,
        [orderId],
      );

      return row ? mapRowToOrder(row) : null;
    },
    async listHistory(filter) {
      const rows = await database.queryAll<OrderRow>(
        `SELECT
          order_id,
          booking_session_id,
          cancel_reason,
          completed_at,
          customer_id,
          partner_id,
          rider_declared_name,
          pickup_json,
          destination_json,
          estimated_price,
          feedback_source,
          final_rating,
          requested_at,
          review_text,
          status,
          created_at,
          status_updated_at,
          updated_at
        FROM order_table
        ${buildHistoryWhereClause(filter)}
        ORDER BY updated_at DESC`,
      );

      return rows.map(mapRowToOrder);
    },
    async saveOrder(order) {
      await database.execute(
        `INSERT INTO order_table (
          order_id,
          booking_session_id,
          cancel_reason,
          completed_at,
          customer_id,
          partner_id,
          rider_declared_name,
          pickup_json,
          destination_json,
          estimated_price,
          feedback_source,
          final_rating,
          requested_at,
          review_text,
          status,
          created_at,
          status_updated_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(order_id) DO UPDATE SET
          cancel_reason = excluded.cancel_reason,
          completed_at = excluded.completed_at,
          rider_declared_name = excluded.rider_declared_name,
          pickup_json = excluded.pickup_json,
          destination_json = excluded.destination_json,
          estimated_price = excluded.estimated_price,
          feedback_source = excluded.feedback_source,
          final_rating = excluded.final_rating,
          requested_at = excluded.requested_at,
          review_text = excluded.review_text,
          status = excluded.status,
          status_updated_at = excluded.status_updated_at,
          updated_at = excluded.updated_at`,
        [
          order.orderId,
          order.bookingSessionId,
          order.cancelReason ?? null,
          order.completedAt ?? null,
          order.customerId,
          order.partnerId,
          order.riderDeclaredName,
          JSON.stringify(order.pickup),
          JSON.stringify(order.destination),
          order.estimatedPrice,
          order.feedbackSource ?? null,
          order.finalRating ?? null,
          order.requestedAt ?? null,
          order.reviewText ?? null,
          order.status,
          order.createdAt,
          order.statusUpdatedAt,
          order.updatedAt,
        ],
      );
    },
  };
}
