package md.gov.epetitie.util;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import md.gov.epetitie.model.Petition;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

public class PdfReceiptGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    public static byte[] generatePetitionReceiptPdf(Petition petition, String verificationUrl) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            Color primaryBlue = new Color(0, 51, 102);
            Color darkSlate = new Color(15, 23, 42);
            Color lightGray = new Color(241, 245, 249);

            // Fonts with full Unicode / Romanian diacritics support (ĂÎâțș)
            BaseFont baseRegular = loadBaseFont("LiberationSans-Regular.ttf");
            BaseFont baseBold = loadBaseFont("LiberationSans-Bold.ttf");
            BaseFont baseItalic = loadBaseFont("LiberationSans-Italic.ttf");

            Font headerFont = new Font(baseBold, 16, Font.NORMAL, primaryBlue);
            Font subHeaderFont = new Font(baseBold, 12, Font.NORMAL, darkSlate);
            Font labelFont = new Font(baseBold, 10, Font.NORMAL, darkSlate);
            Font valueFont = new Font(baseRegular, 10, Font.NORMAL, darkSlate);
            Font footerFont = new Font(baseItalic, 8, Font.NORMAL, Color.GRAY);

            // Header Banner Table
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);

            PdfPCell headerCell = new PdfPCell();
            headerCell.setBackgroundColor(lightGray);
            headerCell.setPadding(12);
            headerCell.setBorderColor(primaryBlue);
            headerCell.setBorderWidth(2);

            Paragraph pHeader = new Paragraph("Republica Moldova\nPortalul oficial de petiții e-Petiție", headerFont);
            pHeader.setAlignment(Element.ALIGN_CENTER);
            headerCell.addElement(pHeader);

            Paragraph pSubHeader = new Paragraph("Recipisă confirmativă de înregistrare a petiției", subHeaderFont);
            pSubHeader.setAlignment(Element.ALIGN_CENTER);
            pSubHeader.setSpacingBefore(5);
            headerCell.addElement(pSubHeader);

            headerTable.addCell(headerCell);
            document.add(headerTable);

            document.add(new Paragraph(" ")); // Spacer

            // Metadata Table
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setWidths(new float[]{35, 65});

            addTableRow(metaTable, "Număr de înregistrare (tracking):", petition.getTrackingNumber(), labelFont, valueFont);
            addTableRow(metaTable, "Data depunerii:", petition.getSubmissionDate() != null ? petition.getSubmissionDate().format(DATE_FORMATTER) : "N/A", labelFont, valueFont);
            addTableRow(metaTable, "Termen limită legal (30 zile):", petition.getDeadlineDate() != null ? petition.getDeadlineDate().format(DATE_FORMATTER) : "N/A", labelFont, valueFont);
            addTableRow(metaTable, "Solicitant / autor:", petition.getAuthor().getFullName() + " (IDNP: " + (petition.getAuthor().getIdnp() != null ? petition.getAuthor().getIdnp() : "N/A") + ")", labelFont, valueFont);
            addTableRow(metaTable, "Categorie legală:", petition.getCategory().getDisplayName(), labelFont, valueFont);
            addTableRow(metaTable, "Tip petiție:", petition.getIsPublicInitiative() ? "Inițiativă colectivă publică" : "Petiție individuală", labelFont, valueFont);
            addTableRow(metaTable, "Status curent:", petition.getStatus().getLabel(), labelFont, valueFont);
            addTableRow(metaTable, "Prioritate alocată:", petition.getPriority().getLabel(), labelFont, valueFont);

            document.add(metaTable);
            document.add(new Paragraph(" "));

            // Title & Content Summary
            Paragraph pTitleLabel = new Paragraph("Titlul solicitării:", labelFont);
            document.add(pTitleLabel);
            Paragraph pTitleVal = new Paragraph(petition.getTitle(), valueFont);
            pTitleVal.setSpacingAfter(8);
            document.add(pTitleVal);

            Paragraph pDescLabel = new Paragraph("Descrierea petiției:", labelFont);
            document.add(pDescLabel);
            Paragraph pDescVal = new Paragraph(petition.getDescription(), valueFont);
            pDescVal.setSpacingAfter(15);
            document.add(pDescVal);

            if (petition.getResolutionText() != null && !petition.getResolutionText().isBlank()) {
                Paragraph pResLabel = new Paragraph("Rezoluție administrativă oficială:", labelFont);
                document.add(pResLabel);
                Paragraph pResVal = new Paragraph(petition.getResolutionText(), valueFont);
                pResVal.setSpacingAfter(15);
                document.add(pResVal);
            }

            // QR Code & Verification Block
            byte[] qrBytes = QrCodeGenerator.generateQrCodeImage(verificationUrl, 120, 120);
            Image qrImage = Image.getInstance(qrBytes);
            qrImage.setAlignment(Element.ALIGN_CENTER);

            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);
            footerTable.setWidths(new float[]{70, 30});

            PdfPCell textCell = new PdfPCell();
            textCell.setBorder(Rectangle.NO_BORDER);
            textCell.addElement(new Paragraph("Verificare digitală:", labelFont));
            textCell.addElement(new Paragraph("Scanați codul QR alăturat pentru a verifica autenticitatea și stadiul procesării acestei recipise în Sistemul Informațional Automatizat e-Petiție al Republicii Moldova.", footerFont));

            PdfPCell qrCell = new PdfPCell();
            qrCell.setBorder(Rectangle.NO_BORDER);
            qrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            qrCell.addElement(qrImage);

            footerTable.addCell(textCell);
            footerTable.addCell(qrCell);

            document.add(footerTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Eroare la generarea documentului PDF pentru recipisă: " + e.getMessage(), e);
        }
    }

    private static void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setPadding(6);
        cellLabel.setBackgroundColor(new Color(248, 250, 252));

        PdfPCell cellValue = new PdfPCell(new Phrase(value, valueFont));
        cellValue.setPadding(6);

        table.addCell(cellLabel);
        table.addCell(cellValue);
    }

    private static com.lowagie.text.pdf.BaseFont loadBaseFont(String fontName) {
        try {
            var is = PdfReceiptGenerator.class.getResourceAsStream("/fonts/" + fontName);
            if (is != null) {
                byte[] bytes = is.readAllBytes();
                return com.lowagie.text.pdf.BaseFont.createFont(fontName, com.lowagie.text.pdf.BaseFont.IDENTITY_H, com.lowagie.text.pdf.BaseFont.EMBEDDED, true, bytes, null);
            }
            return com.lowagie.text.pdf.BaseFont.createFont("/usr/share/fonts/truetype/liberation/" + fontName, com.lowagie.text.pdf.BaseFont.IDENTITY_H, com.lowagie.text.pdf.BaseFont.EMBEDDED);
        } catch (Exception e) {
            try {
                return com.lowagie.text.pdf.BaseFont.createFont(com.lowagie.text.pdf.BaseFont.HELVETICA, com.lowagie.text.pdf.BaseFont.CP1250, com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED);
            } catch (Exception ex) {
                throw new RuntimeException("Eroare la încărcarea fontului PDF", ex);
            }
        }
    }
}
