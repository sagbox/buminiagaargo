package id.buminiaga.product.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder
public class ProductResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String unit;
    private boolean isActive;
    private String categoryId;
    private String categoryName;
    private String primaryImageUrl;
    private List<ImageDto> images;
    private OffsetDateTime createdAt;

    @Data @Builder
    public static class ImageDto {
        private UUID id;
        private String url;
        private boolean isPrimary;
    }
}
