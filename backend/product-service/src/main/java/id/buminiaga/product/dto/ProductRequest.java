package id.buminiaga.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductRequest {

    @NotBlank(message = "Nama produk wajib diisi")
    private String name;

    private UUID categoryId;

    @Column
    private String description;

    @NotNull(message = "Harga wajib diisi")
    @DecimalMin(value = "0.01", message = "Harga harus lebih dari 0")
    private BigDecimal price;

    @NotNull(message = "Stok wajib diisi")
    @Min(value = 0, message = "Stok tidak boleh negatif")
    private Integer stock;

    private String unit;

    private boolean isActive = true;
}
