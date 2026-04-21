package id.buminiaga.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data @Builder
public class DashboardSummaryResponse {
    private long totalOrders;
    private long pendingOrders;
    private long processingOrders;
    private long completedOrders;
    private BigDecimal revenueThisMonth;
    private BigDecimal revenueTotal;
}
