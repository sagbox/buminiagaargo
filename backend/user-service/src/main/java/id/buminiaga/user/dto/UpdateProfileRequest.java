package id.buminiaga.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Nama lengkap wajib diisi")
    private String fullName;

    private String phone;
    private String address;
}
