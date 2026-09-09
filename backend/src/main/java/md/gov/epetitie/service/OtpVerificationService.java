package md.gov.epetitie.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpVerificationService {

    private final SecureRandom random = new SecureRandom();
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private record OtpData(String code, Instant expiresAt) {}

    public String generateAndStoreOtp(String rawTarget) {
        String key = normalizeTarget(rawTarget);
        String code = String.format("%05d", random.nextInt(100000));
        Instant expiresAt = Instant.now().plusSeconds(600); // 10 minutes
        otpStorage.put(key, new OtpData(code, expiresAt));
        return code;
    }

    public boolean validateOtp(String rawTarget, String code) {
        if (rawTarget == null || code == null) return false;
        String key = normalizeTarget(rawTarget);
        OtpData data = otpStorage.get(key);
        if (data == null) return false;

        if (Instant.now().isAfter(data.expiresAt())) {
            otpStorage.remove(key);
            return false;
        }

        boolean isValid = data.code().trim().equals(code.trim());
        if (isValid) {
            otpStorage.remove(key);
        }
        return isValid;
    }

    private String normalizeTarget(String target) {
        return target.trim().toLowerCase();
    }
}
