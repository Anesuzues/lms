import jsPDF from 'jspdf';
import { StudentOverview, StudentDetail } from '@/services/adminService';
import { CERTIFICATES, getCertForCourse } from './programmeConfig';

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── Individual Student PDF Report ───────────────────────────────────────────
export async function generateStudentReport(
  student: StudentOverview,
  detail: StudentDetail
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  let y = 0;

  // ── Header bar ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 38, 'F');

  const logo = await loadImageAsBase64('/nobztech  logo.jpeg');
  if (logo) doc.addImage(logo, 'JPEG', 10, 5, 28, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 212, 255);
  doc.text('NOBZTECH', 45, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(160, 196, 216);
  doc.text('Learner Progress Report', 45, 25);
  doc.text(`Generated: ${fmtDate(new Date().toISOString())}`, 45, 31);

  y = 50;

  // ── Student info box ──
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(10, y, W - 20, 32, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(student.name, 17, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 90, 120);
  doc.text(`Email: ${student.email}`, 17, y + 18);
  doc.text(`Enrolled: ${fmtDate(student.enrolled_at)}`, 17, y + 24);

  const statusColors: Record<string, [number, number, number]> = {
    completed:   [16, 185, 129],
    in_progress: [245, 158, 11],
    not_started: [156, 163, 175],
  };
  const [sr, sg, sb] = statusColors[student.status] ?? [156, 163, 175];
  doc.setFillColor(sr, sg, sb);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const statusLabel = student.status === 'in_progress' ? 'In Progress' : student.status === 'completed' ? 'Completed' : 'Not Started';
  const statusW = doc.getTextWidth(statusLabel) + 8;
  doc.roundedRect(W - 20 - statusW, y + 6, statusW, 10, 2, 2, 'F');
  doc.text(statusLabel, W - 16 - statusW / 2, y + 12.5, { align: 'center' });

  y += 42;

  // ── Stats row ──
  const stats = [
    { label: 'Courses Enrolled', value: String(detail.enrollments.length) },
    { label: 'Completed', value: String(detail.enrollments.filter(e => e.completed_at).length) },
    { label: 'Overall Progress', value: `${student.progress}%` },
    { label: 'Time Spent', value: fmtTime(detail.totalTimeSeconds) },
  ];
  const boxW = (W - 20) / 4;
  stats.forEach((stat, i) => {
    const bx = 10 + i * boxW;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 226, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, boxW - 2, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(stat.value, bx + (boxW - 2) / 2, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 140, 170);
    doc.text(stat.label, bx + (boxW - 2) / 2, y + 16, { align: 'center' });
  });

  y += 28;

  // ── Certificate Progress ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Certificate Progress', 10, y);
  y += 6;

  CERTIFICATES.forEach(cert => {
    const certEnrollments = detail.enrollments.filter(
      e => getCertForCourse(e.course_title)?.number === cert.number
    );
    if (certEnrollments.length === 0) return;

    const total = cert.courseTitles.length;
    const done = certEnrollments.filter(e => e.completed_at).length;
    const pct = Math.round((done / total) * 100);

    doc.setFillColor(248, 250, 255);
    doc.setDrawColor(220, 226, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(10, y, W - 20, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Cert ${cert.number}: ${cert.shortName}`, 15, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 120, 150);
    doc.text(`${done}/${total} courses`, 15, y + 11);

    // Progress bar
    const barX = 120, barW = 60, barH = 3;
    doc.setFillColor(220, 226, 240);
    doc.roundedRect(barX, y + 5.5, barW, barH, 1, 1, 'F');
    if (pct > 0) {
      doc.setFillColor(0, 212, 255);
      doc.roundedRect(barX, y + 5.5, barW * (pct / 100), barH, 1, 1, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 140, 180);
    doc.text(`${pct}%`, barX + barW + 3, y + 8.5);

    y += 16;
  });

  y += 4;

  // ── Quiz Results ──
  if (detail.quizAttempts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Recent Quiz Results', 10, y);
    y += 6;

    // Table header
    doc.setFillColor(15, 23, 42);
    doc.rect(10, y, W - 20, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Course', 14, y + 5.5);
    doc.text('Score', 120, y + 5.5);
    doc.text('Result', 140, y + 5.5);
    doc.text('Date', 165, y + 5.5);
    y += 8;

    const maxAttempts = Math.min(detail.quizAttempts.length, 12);
    for (let i = 0; i < maxAttempts; i++) {
      const qa = detail.quizAttempts[i];
      const rowBg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 255];
      doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
      doc.rect(10, y, W - 20, 7, 'F');

      const title = qa.course_title.length > 45 ? qa.course_title.slice(0, 42) + '…' : qa.course_title;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 40, 60);
      doc.text(title, 14, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(qa.passed ? 16 : 220, qa.passed ? 185 : 60, qa.passed ? 129 : 60);
      doc.text(`${qa.score}%`, 120, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.text(qa.passed ? 'Passed' : 'Failed', 140, y + 4.8);

      doc.setTextColor(100, 120, 150);
      doc.text(fmtDate(qa.attempted_at), 165, y + 4.8);

      y += 7;
    }
  }

  // ── Footer ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 287, W, 10, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 140, 180);
  doc.text('NobzTech Learning Platform — Confidential Admin Report', W / 2, 293, { align: 'center' });

  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safe(student.name)}_Progress_Report.pdf`);
}

// ─── CSV Bulk Export ──────────────────────────────────────────────────────────
export function exportStudentsCSV(students: StudentOverview[]): void {
  const headers = ['Name', 'Email', 'Enrolled Date', 'Progress (%)', 'Status', 'Completed Date'];
  const rows = students.map(s => [
    `"${s.name}"`,
    `"${s.email}"`,
    `"${fmtDate(s.enrolled_at)}"`,
    s.progress,
    s.status === 'in_progress' ? 'In Progress' : s.status === 'completed' ? 'Completed' : 'Not Started',
    `"${fmtDate(s.completed_at)}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NobzTech_Students_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
