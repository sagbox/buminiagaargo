package id.buminiaga.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateOrderRequest {

    @NotEmpty(message = "Minimal satu produk harus dipilih")
    private List<OrderItemRequest> items;

    @NotBlank(message = "Nama penerima wajib diisi")
    private String shippingName;

    @NotBlank(message = "Nomor telepon wajib diisi")
    private String shippingPhone;

    @NotBlank(message = "Alamat pengiriman wajib diisi")
    private String shippingAddress;

    private String notes;

    @Data
    public static class OrderItemRequest {
        @NotNull
        private UUID productId;

        @NotBlank
        private String productSlug;

        @Min(1)
        private int quantity;
    }
}
