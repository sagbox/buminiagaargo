package id.buminiaga.order.controller;

import id.buminiaga.order.dto.DashboardSummaryResponse;
import id.buminiaga.order.dto.OrderResponse;
import id.buminiaga.order.model.OrderStatus;
import id.buminiaga.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAdminOrders(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> orderDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderDetail(id, null));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> dashboardSummary() {
        return ResponseEntity.ok(orderService.getDashboardSummary());
    }
}
