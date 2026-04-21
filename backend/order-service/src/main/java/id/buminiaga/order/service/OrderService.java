package id.buminiaga.order.service;

import id.buminiaga.order.client.ProductServiceClient;
import id.buminiaga.order.dto.CreateOrderRequest;
import id.buminiaga.order.dto.DashboardSummaryResponse;
import id.buminiaga.order.dto.OrderResponse;
import id.buminiaga.order.model.Order;
import id.buminiaga.order.model.OrderItem;
import id.buminiaga.order.model.OrderStatus;
import id.buminiaga.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal SHIPPING_COST = new BigDecimal("15000");

    private final OrderRepository orderRepository;
    private final ProductServiceClient productClient;

    @Transactional
    public OrderResponse createOrder(UUID buyerId, CreateOrderRequest request) {
        List<OrderItem> items = request.getItems().stream().map(itemReq -> {
            ProductServiceClient.ProductDto product = productClient.getProductBySlug(itemReq.getProductSlug());

            if (!product.isActive()) throw new IllegalArgumentException("Produk " + product.getName() + " tidak tersedia");
            if (product.getStock() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Stok " + product.getName() + " tidak mencukupi");
            }

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            return OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImageUrl(product.getPrimaryImageUrl())
                    .productPrice(product.getPrice())
                    .quantity(itemReq.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        BigDecimal subtotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = subtotal.add(SHIPPING_COST);
        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .buyerId(buyerId)
                .status(OrderStatus.PENDING_PAYMENT)
                .subtotal(subtotal)
                .shippingCost(SHIPPING_COST)
                .totalAmount(total)
                .shippingName(request.getShippingName())
                .shippingPhone(request.getShippingPhone())
                .shippingAddress(request.getShippingAddress())
                .notes(request.getNotes())
                .build();

        items.forEach(item -> item.setOrder(order));
        order.getItems().addAll(items);

        return toResponse(orderRepository.save(order));
    }

    public Page<OrderResponse> getBuyerOrders(UUID buyerId, Pageable pageable) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId, pageable).map(this::toResponse);
    }

    public OrderResponse getOrderDetail(UUID orderId, UUID buyerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order tidak ditemukan"));

        if (buyerId != null && !order.getBuyerId().equals(buyerId)) {
            throw new IllegalArgumentException("Akses ditolak");
        }
        return toResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(UUID orderId, UUID buyerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order tidak ditemukan"));

        if (!order.getBuyerId().equals(buyerId)) throw new IllegalArgumentException("Akses ditolak");
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("Order tidak dapat dibatalkan");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updatePaymentStatus(UUID orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order tidak ditemukan"));

        if ("SUCCESS".equals(paymentStatus)) {
            order.setStatus(OrderStatus.PAYMENT_CONFIRMED);
        } else if ("FAILED".equals(paymentStatus) || "EXPIRED".equals(paymentStatus)) {
            order.setStatus(OrderStatus.CANCELLED);
        }

        return toResponse(orderRepository.save(order));
    }

    public Page<OrderResponse> getAdminOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order tidak ditemukan"));
        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    public DashboardSummaryResponse getDashboardSummary() {
        OffsetDateTime startOfMonth = LocalDate.now().withDayOfMonth(1)
                .atStartOfDay().atOffset(ZoneOffset.UTC);

        return DashboardSummaryResponse.builder()
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT))
                .processingOrders(orderRepository.countByStatus(OrderStatus.PROCESSING))
                .completedOrders(orderRepository.countByStatus(OrderStatus.DELIVERED))
                .revenueThisMonth(orderRepository.sumRevenueFrom(startOfMonth))
                .revenueTotal(orderRepository.sumRevenueTotal())
                .build();
    }

    private String generateOrderNumber() {
        String date = LocalDate.now().toString().replace("-", "");
        String prefix = "BNA-" + date + "-";
        String latest = orderRepository.findLatestOrderNumberByPrefix(prefix);

        int seq = 1;
        if (latest != null) {
            seq = Integer.parseInt(latest.substring(latest.lastIndexOf('-') + 1)) + 1;
        }
        return String.format("%s%04d", prefix, seq);
    }

    private OrderResponse toResponse(Order o) {
        List<OrderResponse.ItemDto> itemDtos = o.getItems().stream()
                .map(item -> OrderResponse.ItemDto.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productImageUrl(item.getProductImageUrl())
                        .productPrice(item.getProductPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus())
                .subtotal(o.getSubtotal())
                .shippingCost(o.getShippingCost())
                .totalAmount(o.getTotalAmount())
                .shippingName(o.getShippingName())
                .shippingPhone(o.getShippingPhone())
                .shippingAddress(o.getShippingAddress())
                .notes(o.getNotes())
                .items(itemDtos)
                .createdAt(o.getCreatedAt())
                .build();
    }
}
