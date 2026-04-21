package id.buminiaga.payment.controller;

import id.buminiaga.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/webhook")
@RequiredArgsConstructor
@Slf4j
public class MidtransWebhookController {

    private final PaymentService paymentService;

    /**
     * Midtrans calls this endpoint after every payment status change.
     * No JWT auth here — verified via SHA-512 signature inside PaymentService.
     */
    @PostMapping
    public ResponseEntity<Void> handleNotification(@RequestBody Map<String, Object> notification) {
        log.info("Midtrans webhook received for order: {}", notification.get("order_id"));
        paymentService.handleWebhook(notification);
        return ResponseEntity.ok().build();
    }
}
