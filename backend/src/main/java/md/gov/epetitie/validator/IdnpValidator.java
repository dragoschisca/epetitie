package md.gov.epetitie.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import md.gov.epetitie.annotation.ValidIdnp;

public class IdnpValidator implements ConstraintValidator<ValidIdnp, String> {

    private static final int[] WEIGHTS = {7, 3, 1, 7, 3, 1, 7, 3, 1, 7, 3, 1};

    @Override
    public boolean isValid(String idnp, ConstraintValidatorContext context) {
        if (idnp == null || idnp.trim().isEmpty()) {
            // Nullable check is handled by @NotNull if required
            return true;
        }

        idnp = idnp.trim();
        if (!idnp.matches("^\\d{13}$")) {
            return false;
        }

        int sum = 0;
        for (int i = 0; i < 12; i++) {
            int digit = Character.getNumericValue(idnp.charAt(i));
            sum += digit * WEIGHTS[i];
        }

        int checksum = sum % 10;
        int lastDigit = Character.getNumericValue(idnp.charAt(12));

        return checksum == lastDigit;
    }
}
