package id.buminiaga.product.service;

import id.buminiaga.product.dto.ProductRequest;
import id.buminiaga.product.dto.ProductResponse;
import id.buminiaga.product.model.Category;
import id.buminiaga.product.model.Product;
import id.buminiaga.product.model.ProductImage;
import id.buminiaga.product.repository.CategoryRepository;
import id.buminiaga.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.Normalizer;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final S3ImageService s3ImageService;

    public Page<ProductResponse> getPublicProducts(UUID categoryId, String search, Pageable pageable) {
        return productRepository.findAllPublic(categoryId, nullSafe(search), pageable).map(this::toResponse);
    }

    public ProductResponse getPublicProduct(String slug) {
        Product product = productRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new IllegalArgumentException("Produk tidak ditemukan"));
        return toResponse(product);
    }

    public Page<ProductResponse> getAdminProducts(String search, Pageable pageable) {
        return productRepository.findAllForAdmin(nullSafe(search), pageable).map(this::toResponse);
    }

    private String nullSafe(String s) {
        return s == null ? "" : s.trim();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String slug = generateUniqueSlug(request.getName());

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Kategori tidak ditemukan"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .unit(request.getUnit())
                .category(category)
                .isActive(request.isActive())
                .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produk tidak ditemukan"));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Kategori tidak ditemukan"));
            product.setCategory(category);
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setUnit(request.getUnit());
        product.setActive(request.isActive());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produk tidak ditemukan"));
        product.setDeleted(true);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse addImage(UUID productId, MultipartFile file, boolean isPrimary) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Produk tidak ditemukan"));

        String url = s3ImageService.upload(file, productId);

        if (isPrimary) {
            product.getImages().forEach(img -> img.setPrimary(false));
        }

        ProductImage image = ProductImage.builder()
                .product(product)
                .s3Url(url)
                .isPrimary(isPrimary || product.getImages().isEmpty())
                .sortOrder(product.getImages().size())
                .build();

        product.getImages().add(image);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteImage(UUID productId, UUID imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Produk tidak ditemukan"));

        product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .ifPresent(img -> {
                    s3ImageService.delete(img.getS3Url());
                    product.getImages().remove(img);
                });

        productRepository.save(product);
    }

    private String generateUniqueSlug(String name) {
        String base = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");

        String slug = base;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private ProductResponse toResponse(Product p) {
        String primaryUrl = p.getImages().stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getS3Url)
                .findFirst()
                .orElse(null);

        List<ProductResponse.ImageDto> imageDtos = p.getImages().stream()
                .map(img -> ProductResponse.ImageDto.builder()
                        .id(img.getId())
                        .url(img.getS3Url())
                        .isPrimary(img.isPrimary())
                        .build())
                .toList();

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .unit(p.getUnit())
                .isActive(p.isActive())
                .categoryId(p.getCategory() != null ? p.getCategory().getId().toString() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .primaryImageUrl(primaryUrl)
                .images(imageDtos)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
