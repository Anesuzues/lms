import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { saveCertificate } from '@/services/certificateService';

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateCertificate({
  userId,
  userName,
  courseName,
  completedAt,
}: {
  userId: string;
  userName: string;
  courseName: string;
  completedAt: string | null;
}) {
  // Persist and get a real unique UUID for this certificate
  const uuid = await saveCertificate(userId, userName, courseName, completedAt);
  const verifyUrl = uuid
    ? `${window.location.origin}/verify/${uuid}`
    : `${window.location.origin}/verify`;

  // Full UUID displayed on the certificate
  const displayId = uuid ?? 'UNVERIFIED';

  // Generate QR code as PNG data URL
  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1, color: { dark: '#00d4ff', light: '#050514' } });
  } catch { /* non-fatal */ }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297;
  const H = 210;

  // ── Background ────────────────────────────────────────────────────────────
  doc.setFillColor(5, 5, 20);
  doc.rect(0, 0, W, H, 'F');

  doc.setFillColor(8, 12, 35);
  doc.rect(0, 0, W, H * 0.55, 'F');

  // ── Outer border ──────────────────────────────────────────────────────────
  doc.setDrawColor(0, 212, 255);
  doc.setLineWidth(1.2);
  doc.rect(7, 7, W - 14, H - 14);

  doc.setDrawColor(0, 140, 180);
  doc.setLineWidth(0.35);
  doc.rect(10, 10, W - 20, H - 20);

  // ── Corner accents ────────────────────────────────────────────────────────
  const cs = 18;
  const m = 10;
  doc.setDrawColor(0, 212, 255);
  doc.setLineWidth(1.8);
  doc.line(m, m + cs, m, m); doc.line(m, m, m + cs, m);
  doc.line(W - m - cs, m, W - m, m); doc.line(W - m, m, W - m, m + cs);
  doc.line(m, H - m - cs, m, H - m); doc.line(m, H - m, m + cs, H - m);
  doc.line(W - m - cs, H - m, W - m, H - m); doc.line(W - m, H - m, W - m, H - m - cs);

  doc.setFillColor(0, 212, 255);
  [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].forEach(([x, y]) => {
    doc.circle(x, y, 0.8, 'F');
  });

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoBase64 = await loadImageAsBase64('/nobztech  logo.jpeg');
  if (logoBase64) {
    doc.addImage(logoBase64, 'JPEG', W / 2 - 19, 15, 38, 38);
  }

  // ── Title ─────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 212, 255);
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 62, { align: 'center' });

  doc.setDrawColor(0, 212, 255);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 70, 67.5, W / 2 - 10, 67.5);
  doc.line(W / 2 + 10, 67.5, W / 2 + 70, 67.5);

  const dx = W / 2, dy = 67.5;
  doc.setFillColor(0, 212, 255);
  doc.triangle(dx, dy - 2.2, dx + 2.2, dy, dx, dy + 2.2, 'F');
  doc.triangle(dx, dy - 2.2, dx - 2.2, dy, dx, dy + 2.2, 'F');

  // ── Body ──────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(160, 196, 216);
  doc.text('This is to certify that', W / 2, 80, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text(userName, W / 2, 96, { align: 'center' });

  const nameW = doc.getTextWidth(userName);
  doc.setDrawColor(0, 212, 255);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - nameW / 2, 99, W / 2 + nameW / 2, 99);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(160, 196, 216);
  doc.text('has successfully completed', W / 2, 111, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 212, 255);
  const splitCourse = doc.splitTextToSize(courseName, 220);
  doc.text(splitCourse, W / 2, 123, { align: 'center' });

  const dateStr = new Date(completedAt ?? new Date().toISOString()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 165, 195);
  doc.text(`Completed on ${dateStr}`, W / 2, 143, { align: 'center' });

  // ── Verification section ───────────────────────────────────────────────────
  // Box: left side = text, right side = QR code
  const boxX = W / 2 - 90;
  const boxY = 147;
  const boxW = 180;
  const boxH = 22;

  doc.setDrawColor(0, 80, 120);
  doc.setLineWidth(0.2);
  doc.rect(boxX, boxY, boxW, boxH, 'S');

  // QR code (right side of box)
  if (qrDataUrl) {
    const qrSize = 18;
    doc.addImage(qrDataUrl, 'PNG', boxX + boxW - qrSize - 2, boxY + 2, qrSize, qrSize);
  }

  // Text (left side of box)
  const textX = boxX + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 180, 220);
  doc.text('CERTIFICATE ID', textX, boxY + 5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(200, 220, 230);
  // Split UUID across two lines so it fits
  const half = Math.ceil(displayId.length / 2);
  doc.text(displayId.slice(0, half), textX, boxY + 10);
  doc.text(displayId.slice(half), textX, boxY + 14.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(70, 120, 150);
  doc.text(`Verify: ${verifyUrl}`, textX, boxY + 19.5);

  // ── Bottom branding ───────────────────────────────────────────────────────
  doc.setDrawColor(0, 80, 120);
  doc.setLineWidth(0.3);
  doc.line(20, H - 22, W - 20, H - 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 212, 255);
  doc.text('NOBZTECH', W / 2, H - 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(70, 120, 155);
  doc.text('Empowering the next generation of professionals', W / 2, H - 9, { align: 'center' });

  // ── Save ──────────────────────────────────────────────────────────────────
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
  doc.save(`${safe(userName)}_${safe(courseName)}_Certificate.pdf`);
}
