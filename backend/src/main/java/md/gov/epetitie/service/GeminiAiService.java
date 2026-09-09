package md.gov.epetitie.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import md.gov.epetitie.dto.AiResolutionDraftDto;
import md.gov.epetitie.dto.AiTriageResultDto;
import md.gov.epetitie.model.Petition;
import md.gov.epetitie.model.PetitionCategory;
import md.gov.epetitie.model.PetitionPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    @Value("${app.gemini.api-key:your_gemini_api_key_here}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-3.5-flash-lite}")
    private String model;

    @Value("${app.gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient = RestClient.builder().build();

    public AiTriageResultDto performAutomatedTriage(String title, String description) {
        if (isApiKeyMissing()) {
            log.info("Gemini API key missing or default. Returning fallback automated triage.");
            return fallbackTriage(title, description);
        }

        try {
            String prompt = """
                Acționezi în calitate de analist principal în cadrul Cancelariei de Stat a Republicii Moldova.
                Misiunea ta este să analizezi și să triezi automatizat petiția unui cetățean, asigurând o clasificare corectă și un rezumat clar pentru factorii de decizie.
                
                DATELE PETIȚIEI:
                - TITLU: %s
                - DESCRIERE: %s
                
                SARCINI:
                1. Clasifică petiția într-una dintre următoarele categorii stricte (alege-o pe cea mai relevantă):
                   [INFRASTRUCTURA, MEDIU, SANATATE, ADMINISTRATIE_PUBLICA, SOCIAL, EDUCATIE]
                2. Determină prioritatea obiectivă a problemei (alege una):
                   - LOW (probleme minore, solicitări generale)
                   - NORMAL (probleme de zi cu zi)
                   - HIGH (afectează un grup mare de oameni, riscuri financiare)
                   - URGENT (pericol pentru viață/sănătate, dezastre naturale, urgențe majore)
                3. Redactează un "Executive Briefing" (rezumat executiv) într-un ton oficial, sobru și obiectiv. Acesta trebuie să aibă exact 1-2 propoziții în limba română și să surprindă esența solicitării și impactul ei. Folosește stil de scriere uman (cu majusculă doar la începutul propoziției, FĂRĂ titluri cu fiecare cuvânt capitalizat și FĂRĂ simboluri Markdown precum #, *, **, ---).
                
                FORMAT DE RĂSPUNS:
                Trebuie să răspunzi EXCLUSIV cu un obiect JSON valid, fără niciun alt text, formatare Markdown sau explicații suplimentare.
                
                Exemplu de format dorit:
                {
                  "category": "INFRASTRUCTURA",
                  "priority": "HIGH",
                  "executiveBriefing": "Grupul de cetățeni semnalează deteriorarea gravă a podului de acces, solicitând reabilitarea urgentă. Situația prezintă un risc iminent pentru siguranța traficului local."
                }
                """.formatted(title, description);

            String responseText = callGeminiApi(prompt);
            JsonNode root = objectMapper.readTree(extractJsonFromResponse(responseText));

            PetitionCategory category = parseCategory(root.path("category").asText());
            PetitionPriority priority = parsePriority(root.path("priority").asText());
            String briefing = sanitizeAiText(root.path("executiveBriefing").asText("Petiție primită în examinare conform procedurii legale."));

            return new AiTriageResultDto(category, priority, briefing);

        } catch (Exception e) {
            log.error("Eroare la apelul Gemini AI Triage: {}", e.getMessage());
            return fallbackTriage(title, description);
        }
    }

    public AiResolutionDraftDto generateDraftResolution(Petition petition) {
        if (isApiKeyMissing()) {
            log.info("Gemini API key missing or default. Returning fallback resolution draft.");
            return fallbackResolutionDraft(petition);
        }

        try {
            String prompt = """
                Ești un inspector și jurist al Guvernului Republicii Moldova.
                Elaborează un proiect de rezoluție/decizie administrativă oficială în limba română pentru următoarea petiție:
                
                NUMĂR ÎNREGISTRARE: %s
                SOLICITANT: %s (IDNP: %s)
                CATEGORIE: %s
                TITLU: %s
                DESCRIERE: %s
                
                Generați un răspuns oficial conform Codului Administrativ al Republicii Moldova, structurat clar:
                1. Preambul și temei legal (Legea nr. 190/1997 sau Codul Administrativ nr. 116/2018).
                2. Constatări de fapt.
                3. Decizia/Măsurile dispuse.
                
                REGULI STRICTE DE REDACTARE:
                - Scrie în stil uman natural (cu majusculă doar la începutul propozițiilor/frazelor, NU capitaliza fiecare cuvânt dintr-un titlu).
                - Textul trebuie să fie text simplu (plain text) curat, FĂRĂ simboluri Markdown (NU folosi caractere precum #, *, **, ---, ` sau alte marcaje speciale).
                """.formatted(
                    petition.getTrackingNumber(),
                    petition.getAuthor().getFullName(),
                    petition.getAuthor().getIdnp() != null ? petition.getAuthor().getIdnp() : "N/A",
                    petition.getCategory().getDisplayName(),
                    petition.getTitle(),
                    petition.getDescription()
            );

            String draftText = sanitizeAiText(callGeminiApi(prompt));

            return new AiResolutionDraftDto(
                    petition.getId(),
                    petition.getTrackingNumber(),
                    draftText,
                    "Codul Administrativ al Republicii Moldova nr. 116/2018, art. 75-82"
            );

        } catch (Exception e) {
            log.error("Eroare la generarea draft-ului de rezoluție cu Gemini AI: {}", e.getMessage());
            return fallbackResolutionDraft(petition);
        }
    }

    private String callGeminiApi(String promptText) {
        String fullUrl = apiUrl + "/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", promptText)
                        ))
                )
        );

        String responseJson = restClient.post()
                .uri(fullUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Eroare la parsarea răspunsului Gemini API", e);
        }
    }

    private boolean isApiKeyMissing() {
        return apiKey == null || apiKey.isBlank() || apiKey.contains("your_gemini_api_key");
    }

    private String extractJsonFromResponse(String text) {
        if (text.contains("```json")) {
            return text.substring(text.indexOf("```json") + 7, text.lastIndexOf("```")).trim();
        } else if (text.contains("```")) {
            return text.substring(text.indexOf("```") + 3, text.lastIndexOf("```")).trim();
        }
        return text.trim();
    }

    private String sanitizeAiText(String text) {
        if (text == null) return "";
        // Remove Markdown headers (#, ##, ###, etc.)
        String cleaned = text.replaceAll("(?m)^\\s*#+\\s*", "");
        // Remove Markdown bold/italic (*, **, _, __)
        cleaned = cleaned.replaceAll("\\*\\*|\\*|__|\\_", "");
        // Remove horizontal dividers (---, ***, ___)
        cleaned = cleaned.replaceAll("(?m)^\\s*[-*_]{3,}\\s*$", "");
        // Remove code blocks and backticks
        cleaned = cleaned.replaceAll("```[a-zA-Z]*", "").replaceAll("```", "").replaceAll("`", "");
        // Clean bullet list markers (* , - , + at start of line)
        cleaned = cleaned.replaceAll("(?m)^\\s*[*\\-+]\s+", "• ");
        // Normalize multiple blank lines into max 2 newlines
        cleaned = cleaned.replaceAll("\n{3,}", "\n\n");
        return cleaned.trim();
    }

    private PetitionCategory parseCategory(String text) {
        try {
            return PetitionCategory.valueOf(text.toUpperCase());
        } catch (Exception e) {
            return PetitionCategory.ADMINISTRATIE_PUBLICA;
        }
    }

    private PetitionPriority parsePriority(String text) {
        try {
            return PetitionPriority.valueOf(text.toUpperCase());
        } catch (Exception e) {
            return PetitionPriority.NORMAL;
        }
    }

    private AiTriageResultDto fallbackTriage(String title, String description) {
        PetitionCategory cat = title.toLowerCase().contains("drum") || description.toLowerCase().contains("drum") ?
                PetitionCategory.INFRASTRUCTURA : PetitionCategory.ADMINISTRATIE_PUBLICA;
        String brief = "Petiția intitulată '" + title + "' a fost supusă evaluării automate preliminare și direcționată către departamentul de resort.";
        return new AiTriageResultDto(cat, PetitionPriority.NORMAL, brief);
    }

    private AiResolutionDraftDto fallbackResolutionDraft(Petition petition) {
        String draft = """
            Republica Moldova
            Departamentul de resort
            
            Proiect de decizie administrativă
            Referitor la petiția nr. %s din %s
            
            Urmare a examinării petiției depuse de cetățeanul %s privind "%s", în temeiul Codului Administrativ al Republicii Moldova nr. 116/2018:
            
            1. Se ia act de solicitarea formulată de petiționar.
            2. Se dispune efectuarea verificărilor de teren și întocmirea notei informative în termen de 15 zile lucrătoare.
            3. Răspunsul oficial final va fi transmis solicitantului la adresa de corespondență înregistrată.
            """.formatted(
                petition.getTrackingNumber(),
                petition.getCreatedAt().toLocalDate().toString(),
                petition.getAuthor().getFullName(),
                petition.getTitle()
        );

        return new AiResolutionDraftDto(
                petition.getId(),
                petition.getTrackingNumber(),
                draft,
                "Codul Administrativ al Republicii Moldova nr. 116/2018"
        );
    }
}
