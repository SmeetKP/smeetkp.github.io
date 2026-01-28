import { HighlightItem } from "@/types/highlights";
import jsPDF from "jspdf";

// Helper function to strip emojis and special Unicode characters
function stripEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
}

export function exportHighlightsToPDF(highlights: HighlightItem[], profileName: string = "Smeet Kumar Patel") {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Interview Highlights", margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(profileName, margin, yPosition);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  // Reset color
  doc.setTextColor(0);

  // Group by company
  const groupedHighlights = highlights.reduce((acc, item) => {
    if (!acc[item.company]) {
      acc[item.company] = [];
    }
    acc[item.company].push(item);
    return acc;
  }, {} as Record<string, HighlightItem[]>);

  Object.entries(groupedHighlights).forEach(([company, items]) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Company header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(company, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80);
    doc.text(items[0].role, margin, yPosition);
    yPosition += 10;

    doc.setTextColor(0);

    // Sections
    items.forEach((item) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      // Section title
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(stripEmojis(item.sectionTitle), margin, yPosition);
      yPosition += 8;

      // Bullets
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      item.content.bullets.forEach((bullet) => {
        const lines = doc.splitTextToSize(bullet, pageWidth - margin * 2 - 5);
        
        // Check if we need a new page for this bullet
        if (yPosition + lines.length * 5 > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.text("•", margin + 2, yPosition);
        doc.text(lines, margin + 8, yPosition);
        yPosition += lines.length * 5 + 2;
      });

      // Metrics (if any)
      if (item.content.metrics && item.content.metrics.length > 0) {
        yPosition += 3;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Key Metrics:", margin, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        item.content.metrics.forEach((metric) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`${stripEmojis(metric.label)}: ${stripEmojis(metric.value)}`, margin + 5, yPosition);
          yPosition += 5;
        });
      }

      yPosition += 8;
    });

    yPosition += 5;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Generated from https://smeetkp.github.io/`,
    margin,
    pageHeight - 10
  );

  // Save
  doc.save("interview-highlights.pdf");
}

export function copyHighlightsToClipboard(highlights: HighlightItem[]): string {
  const groupedHighlights = highlights.reduce((acc, item) => {
    if (!acc[item.company]) {
      acc[item.company] = [];
    }
    acc[item.company].push(item);
    return acc;
  }, {} as Record<string, HighlightItem[]>);

  let markdown = "# Interview Highlights\n\n";
  markdown += `Generated on ${new Date().toLocaleDateString()}\n\n---\n\n`;

  Object.entries(groupedHighlights).forEach(([company, items]) => {
    markdown += `## ${company}\n`;
    markdown += `*${items[0].role}*\n\n`;

    items.forEach((item) => {
      markdown += `### ${item.sectionIcon} ${item.sectionTitle}\n\n`;

      item.content.bullets.forEach((bullet) => {
        markdown += `- ${bullet}\n`;
      });

      if (item.content.metrics && item.content.metrics.length > 0) {
        markdown += `\n**Key Metrics:**\n`;
        item.content.metrics.forEach((metric) => {
          markdown += `- ${metric.icon} ${metric.label}: **${metric.value}**\n`;
        });
      }

      markdown += `\n`;
    });

    markdown += `---\n\n`;
  });

  navigator.clipboard.writeText(markdown);
  return markdown;
}

export function generateShareLink(highlights: HighlightItem[]): string {
  const ids = highlights.map((h) => `${h.company.toLowerCase().replace(/\s+/g, "-")}-${h.sectionId}`).join(",");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://smeetkp.github.io";
  return `${baseUrl}?highlights=${encodeURIComponent(ids)}`;
}
