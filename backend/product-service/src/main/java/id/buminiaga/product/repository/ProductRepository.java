package id.buminiaga.product.repository;

import id.buminiaga.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySlugAndIsDeletedFalse(String slug);

    @Query("""
        SELECT p FROM Product p
        WHERE p.isDeleted = false
          AND p.isActive = true
          AND (:categoryId IS NULL OR p.category.id = :categoryId)
          AND LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
        """)
    Page<Product> findAllPublic(
            @Param("categoryId") UUID categoryId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Product p
        WHERE p.isDeleted = false
          AND LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
        """)
    Page<Product> findAllForAdmin(
            @Param("search") String search,
            Pageable pageable
    );

    boolean existsBySlug(String slug);
}
