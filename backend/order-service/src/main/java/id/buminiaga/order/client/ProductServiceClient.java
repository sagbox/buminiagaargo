package id.buminiaga.order.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@FeignClient(name = "product-service", url = "${services.product-service.url:http://localhost:8082}")
public interface ProductServiceClient {

    @GetMapping("/api/products/{slug}")
    ProductDto getProductBySlug(@PathVariable String slug);

    @Data
    class ProductDto {
        private UUID id;
        private String name;
        private String slug;
        private BigDecimal price;
        private Integer stock;
        private String unit;
        private boolean isActive;
        private String primaryImageUrl;
        private List<ImageDto> images;
    }

    @Data
    class ImageDto {
        private UUID id;
        private String url;
        private boolean isPrimary;
    }
}
