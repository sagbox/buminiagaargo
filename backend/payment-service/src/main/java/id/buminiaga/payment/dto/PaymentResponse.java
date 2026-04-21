package id.buminiaga.payment.dto;

import id.buminiaga.payment.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private BigDecimal amount;
    private PaymentStatus status;
    private String snapToken;
    private String paymentType;
    private OffsetDateTime paidAt;
    private OffsetDateTime expiresAt;
}
