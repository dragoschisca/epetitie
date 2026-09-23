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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
        return generateDraftResolution(petition, null);
    }

    public AiResolutionDraftDto generateDraftResolution(Petition petition, String officerOpinion) {
        if (isApiKeyMissing()) {
            log.info("Gemini API key missing or default. Returning fallback resolution draft.");
            return fallbackResolutionDraft(petition, officerOpinion);
        }

        try {
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("""
                Ești un inspector și jurist de elită al Guvernului Republicii Moldova și al administrației publice.
                Elaborează un proiect oficial complet de decizie administrativă / rezoluție în limba română pentru următoarea petiție:
                
                NUMĂR ÎNREGISTRARE: %s
                SOLICITANT: %s (IDNP: %s)
                DESTINATAR: %s
                CATEGORIE: %s
                TITLU: %s
                DESCRIERE SOLICITARE: %s
                """.formatted(
                    petition.getTrackingNumber(),
                    petition.getAuthor().getFullName(),
                    petition.getAuthor().getIdnp() != null ? petition.getAuthor().getIdnp() : "N/A",
                    petition.getTargetAuthority() != null ? petition.getTargetAuthority() : "Autoritate administrație publică",
                    petition.getCategory().getDisplayName(),
                    petition.getTitle(),
                    petition.getDescription()
            ));

            if (officerOpinion != null && !officerOpinion.trim().isBlank()) {
                promptBuilder.append("""
                    
                    PĂREREA, CONSTATĂRILE ȘI POZIȚIA INSPECTORULUI DE CAZ:
                    "%s"
                    
                    DIRECTIVĂ MANDATORIE PRIVIND SOLUȚIONAREA:
                    Emite decizia administrativă finală pe baza opiniei inspectorului formulate mai sus. Dacă inspectorul susține aprobarea/admiterea petiției, redactează o decizie de admitere cu dispoziții concrete de remediere și termene. Dacă inspectorul susține respingerea sau măsuri parțiale/redirecționare, motivează juridic decizia în conformitate cu poziția și constatările inspectorului.
                    """.formatted(officerOpinion.trim()));
            } else {
                promptBuilder.append("""
                    
                    Analizează temeinicia solicitării și formulează o decizie administrativă motivată și echilibrată (admitere sau respingere motivată conform legii).
                    """);
            }

            promptBuilder.append("""
                
                STRUCTURA OBLIGATORIE A RĂSPUNSULUI:
                Antet oficial (Republica Moldova, denumirea autorității destinatară, număr și dată).
                1. Preambul și temei legal (Codul Administrativ al Republicii Moldova nr. 116/2018 sau Legea cu privire la petiționare).
                2. Constatări de fapt și analiza situației (raportată la petiție și la opinia inspectorului).
                3. Dispozitivul deciziei / Măsurile concrete dispuse și căile legale de atac.
                
                REGULI STRICTE DE REDACTARE ȘI ORTOGRAFIE:
                - FIECARE PARAGRAF, FIECARE ALINEAT ȘI FIECARE PROPOZIȚIE TREBUIE OBLIGATORIU SĂ ÎNCEAPĂ CU LITERĂ MAJUSCULĂ (ex: "Examinând...", "Demersul...", "În urma...", "Deși...", "Având în vedere...", "Se dispune..."). ESTE STRICT INTERZISĂ începerea vreunui paragraf sau a vreunei propoziții cu literă mică!
                - Textul trebuie să fie text simplu (plain text) curat, FĂRĂ simboluri Markdown (NU folosi caractere precum #, *, **, ---, ` sau alte marcaje speciale).
                """);

            String draftText = sanitizeAiText(callGeminiApi(promptBuilder.toString()));

            return new AiResolutionDraftDto(
                    petition.getId(),
                    petition.getTrackingNumber(),
                    draftText,
                    "Codul Administrativ al Republicii Moldova nr. 116/2018, art. 75-82"
            );

        } catch (Exception e) {
            log.error("Eroare la generarea draft-ului de rezoluție cu Gemini AI: {}", e.getMessage());
            return fallbackResolutionDraft(petition, officerOpinion);
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
        cleaned = cleaned.trim();
        return capitalizeSentencesAndParagraphs(cleaned);
    }

    public String capitalizeSentencesAndParagraphs(String text) {
        if (text == null || text.isBlank()) return text;

        // 1. Capitalize first letter of every line/paragraph (including after bullets or numbering like "1. ", "• ")
        Pattern lineStartPattern = Pattern.compile("(?m)(^[ \\t]*(?:[•\\-*]|\\d+[\\.\\)])?[ \\t]*)([\\p{Ll}])");
        Matcher m1 = lineStartPattern.matcher(text);
        StringBuilder sb1 = new StringBuilder();
        while (m1.find()) {
            m1.appendReplacement(sb1, Matcher.quoteReplacement(m1.group(1) + m1.group(2).toUpperCase()));
        }
        m1.appendTail(sb1);

        // 2. Capitalize letter after sentence terminator (. ? !) followed by whitespace
        Pattern sentencePattern = Pattern.compile("([\\.\\?!][ \\t]+)([\\p{Ll}])");
        Matcher m2 = sentencePattern.matcher(sb1.toString());
        StringBuilder sb2 = new StringBuilder();
        while (m2.find()) {
            m2.appendReplacement(sb2, Matcher.quoteReplacement(m2.group(1) + m2.group(2).toUpperCase()));
        }
        m2.appendTail(sb2);

        return sb2.toString();
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
        return fallbackResolutionDraft(petition, null);
    }

    private AiResolutionDraftDto fallbackResolutionDraft(Petition petition, String officerOpinion) {
        String authority = petition.getTargetAuthority() != null ? petition.getTargetAuthority() : "Guvernul Republicii Moldova";
        String dateStr = petition.getCreatedAt() != null ? petition.getCreatedAt().toLocalDate().toString() : java.time.LocalDate.now().toString();

        String officerNote = (officerOpinion != null && !officerOpinion.trim().isBlank())
                ? "\nAvând în vedere constatările și opinia inspectorului de caz: \"%s\",\n".formatted(officerOpinion.trim())
                : "";

        boolean isRejection = officerOpinion != null && (
                officerOpinion.toLowerCase().contains("resping") ||
                officerOpinion.toLowerCase().contains("nefondat") ||
                officerOpinion.toLowerCase().contains("inadmisibil")
        );

        String dispozitiv = isRejection ? """
            1. Se respinge motivat petiția formulată, conform argumentelor și temeiurilor constatate în nota de examinare.
            2. Se aduce la cunoștința petiționarului dreptul de a contesta prezenta decizie în termen de 30 de zile la instanța de contencios administrativ.
            3. Dosarul se clasează în Registrul Național de Petiții cu statut respins.
            """ : """
            1. Se admite demersul formulat de petiționar privind "%s".
            2. Se dispune efectuarea măsurilor concrete de remediere și verificare în termen de 15 zile lucrătoare.
            3. Răspunsul oficial final și procesul-verbal vor fi transmise solicitantului la adresa indicată.
            """.formatted(petition.getTitle());

        String draft = """
            Republica Moldova
            %s
            
            Proiect de decizie administrativă
            Referitor la petiția nr. %s din %s
            
            Urmare a examinării petiției depuse de cetățeanul %s privind "%s", în temeiul Codului Administrativ al Republicii Moldova nr. 116/2018:
            %s
            Dispozitiv:
            %s
            """.formatted(
                authority,
                petition.getTrackingNumber(),
                dateStr,
                petition.getAuthor().getFullName(),
                petition.getTitle(),
                officerNote,
                dispozitiv
        );

        return new AiResolutionDraftDto(
                petition.getId(),
                petition.getTrackingNumber(),
                capitalizeSentencesAndParagraphs(draft.trim()),
                "Codul Administrativ al Republicii Moldova nr. 116/2018, art. 75-82"
        );
    }
}
