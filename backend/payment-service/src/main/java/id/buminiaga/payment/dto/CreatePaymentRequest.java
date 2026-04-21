package id.buminiaga.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreatePaymentRequest {
    @NotNull
    private UUID orderId;

    @NotNull
    private String orderNumber;

    @NotNull
    private BigDecimal amount;

    private String buyerName;
    private String buyerEmail;
    private String buyerPhone;
}
