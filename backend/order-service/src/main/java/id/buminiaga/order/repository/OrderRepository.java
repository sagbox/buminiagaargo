package id.buminiaga.order.repository;

import id.buminiaga.order.model.Order;
import id.buminiaga.order.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId, Pageable pageable);

    @Query("""
        SELECT COUNT(o) FROM Order o WHERE o.status = :status
        """)
    long countByStatus(@Param("status") OrderStatus status);

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o
        WHERE o.status IN ('PAYMENT_CONFIRMED','PROCESSING','SHIPPED','DELIVERED')
          AND o.createdAt >= :from
        """)
    BigDecimal sumRevenueFrom(@Param("from") OffsetDateTime from);

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o
        WHERE o.status IN ('PAYMENT_CONFIRMED','PROCESSING','SHIPPED','DELIVERED')
        """)
    BigDecimal sumRevenueTotal();

    @Query("""
        SELECT MAX(o.orderNumber) FROM Order o
        WHERE o.orderNumber LIKE :prefix%
        """)
    String findLatestOrderNumberByPrefix(@Param("prefix") String prefix);
}
