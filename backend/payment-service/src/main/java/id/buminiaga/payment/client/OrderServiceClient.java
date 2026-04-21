package id.buminiaga.payment.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@FeignClient(name = "order-service", url = "${services.order-service.url:http://localhost:8083}")
public interface OrderServiceClient {

    @PutMapping("/internal/orders/{orderId}/payment-status")
    void updatePaymentStatus(@PathVariable UUID orderId, @RequestBody Map<String, String> body);

    @Data
    class OrderDto {
        private UUID id;
        private String orderNumber;
        private BigDecimal totalAmount;
        private String shippingName;
        private String shippingPhone;
        private String shippingAddress;
    }
}
