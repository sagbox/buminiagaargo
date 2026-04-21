package id.buminiaga.payment.controller;

import com.midtrans.httpclient.error.MidtransError;
import id.buminiaga.payment.dto.CreatePaymentRequest;
import id.buminiaga.payment.dto.PaymentResponse;
import id.buminiaga.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreatePaymentRequest request) throws MidtransError {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(userId, request));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<PaymentResponse> getByOrderId(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }
}
