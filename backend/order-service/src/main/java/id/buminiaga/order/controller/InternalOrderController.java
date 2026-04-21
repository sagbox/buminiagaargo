package id.buminiaga.order.controller;

import id.buminiaga.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/internal/orders")
@RequiredArgsConstructor
public class InternalOrderController {

    private final OrderService orderService;

    @PutMapping("/{id}/payment-status")
    public ResponseEntity<Void> updatePaymentStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        orderService.updatePaymentStatus(id, body.get("paymentStatus"));
        return ResponseEntity.ok().build();
    }
}
