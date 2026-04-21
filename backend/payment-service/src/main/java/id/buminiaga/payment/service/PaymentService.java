package id.buminiaga.payment.service;

import com.midtrans.Config;
import com.midtrans.ConfigFactory;
import com.midtrans.httpclient.SnapApi;
import com.midtrans.httpclient.error.MidtransError;
import id.buminiaga.payment.client.OrderServiceClient;
import id.buminiaga.payment.dto.CreatePaymentRequest;
import id.buminiaga.payment.dto.PaymentResponse;
import id.buminiaga.payment.model.Payment;
import id.buminiaga.payment.model.PaymentStatus;
import id.buminiaga.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderServiceClient orderServiceClient;

    @Value("${midtrans.server-key}")
    private String serverKey;

    @Value("${midtrans.client-key}")
    private String clientKey;

    @Value("${midtrans.production:false}")
    private boolean isProduction;

    @Transactional
    public PaymentResponse createPayment(UUID buyerId, CreatePaymentRequest request) throws MidtransError {
        paymentRepository.findByOrderId(request.getOrderId()).ifPresent(existing -> {
            if (existing.getStatus() == PaymentStatus.PENDING) {
                throw new IllegalArgumentException("Pembayaran untuk order ini sudah dibuat");
            }
        });

        Config config = new ConfigFactory(new Config(serverKey, clientKey, isProduction)).getConfig();

        Map<String, Object> params = new HashMap<>();
        Map<String, Object> transactionDetails = new HashMap<>();
        transactionDetails.put("order_id", request.getOrderNumber());
        transactionDetails.put("gross_amount", request.getAmount().intValue());

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("first_name", request.getBuyerName());
        customerDetails.put("email", request.getBuyerEmail() != null ? request.getBuyerEmail() : "");
        customerDetails.put("phone", request.getBuyerPhone() != null ? request.getBuyerPhone() : "");

        params.put("transaction_details", transactionDetails);
        params.put("customer_details", customerDetails);

        JSONObject result = SnapApi.createTransaction(params, config);
        String snapToken = result.getString("token");

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .orderNumber(request.getOrderNumber())
                .buyerId(buyerId)
                .amount(request.getAmount())
                .status(PaymentStatus.PENDING)
                .midtransSnapToken(snapToken)
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .build();

        return toResponse(paymentRepository.save(payment));
    }

    public PaymentResponse getPaymentByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment tidak ditemukan"));
        return toResponse(payment);
    }

    @Transactional
    public void handleWebhook(Map<String, Object> notification) {
        String orderId = (String) notification.get("order_id");
        String transactionStatus = (String) notification.get("transaction_status");
        String fraudStatus = (String) notification.get("fraud_status");
        String signatureKey = (String) notification.get("signature_key");
        String statusCode = (String) notification.get("status_code");
        String grossAmount = (String) notification.get("gross_amount");

        if (!verifySignature(orderId, statusCode, grossAmount, signatureKey)) {
            log.warn("Invalid Midtrans signature for order: {}", orderId);
            return;
        }

        paymentRepository.findAll().stream()
                .filter(p -> p.getOrderNumber().equals(orderId))
                .findFirst()
                .ifPresent(payment -> {
                    payment.setMidtransTransactionId((String) notification.get("transaction_id"));
                    payment.setMidtransPaymentType((String) notification.get("payment_type"));
                    payment.setMidtransRawResponse(notification);

                    PaymentStatus newStatus;
                    String orderPaymentStatus;

                    if ("capture".equals(transactionStatus) && "accept".equals(fraudStatus)) {
                        newStatus = PaymentStatus.SUCCESS;
                        orderPaymentStatus = "SUCCESS";
                        payment.setPaidAt(OffsetDateTime.now());
                    } else if ("settlement".equals(transactionStatus)) {
                        newStatus = PaymentStatus.SUCCESS;
                        orderPaymentStatus = "SUCCESS";
                        payment.setPaidAt(OffsetDateTime.now());
                    } else if ("cancel".equals(transactionStatus) || "deny".equals(transactionStatus)) {
                        newStatus = PaymentStatus.FAILED;
                        orderPaymentStatus = "FAILED";
                    } else if ("expire".equals(transactionStatus)) {
                        newStatus = PaymentStatus.EXPIRED;
                        orderPaymentStatus = "EXPIRED";
                    } else {
                        return;
                    }

                    payment.setStatus(newStatus);
                    paymentRepository.save(payment);

                    orderServiceClient.updatePaymentStatus(
                            payment.getOrderId(),
                            Map.of("paymentStatus", orderPaymentStatus)
                    );
                });
    }

    private boolean verifySignature(String orderId, String statusCode, String grossAmount, String incoming) {
        try {
            String raw = orderId + statusCode + grossAmount + serverKey;
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString().equals(incoming);
        } catch (NoSuchAlgorithmException e) {
            return false;
        }
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrderId())
                .orderNumber(p.getOrderNumber())
                .amount(p.getAmount())
                .status(p.getStatus())
                .snapToken(p.getMidtransSnapToken())
                .paymentType(p.getMidtransPaymentType())
                .paidAt(p.getPaidAt())
                .expiresAt(p.getExpiresAt())
                .build();
    }
}
