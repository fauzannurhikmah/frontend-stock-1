import { narasiData } from "@/data/reportDetail";

export function NarasiSection({ ticker }: { ticker: string }) {
  const narasi = narasiData[ticker];

  if (!narasi) {
    return (
      <section className="rounded-grove-3 border border-grove-border bg-grove-bg2 p-10 text-center">
        <div className="text-[32px] opacity-30">&#9997;</div>
        <h3 className="mt-3 font-serif text-[20px]">Narasi dalam proses</h3>
        <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-[1.7] text-grove-muted">
          Tim riset Grove sedang menyusun narasi investasi dan proyeksi full
          year untuk {ticker}. Biasanya tersedia 2-4 minggu setelah emiten masuk
          coverage.
        </p>
      </section>
    );
  }

  return (
    <section className="narasi-wrap">
      <div className="narasi-main">
        <div className="narasi-eyebrow">Narasi Investasi · Thesis Utama</div>
        <div className="narasi-headline">{narasi.headline}</div>
        <div className="narasi-date">{narasi.datePublished}</div>
        <div className="narasi-body">
          {narasi.body.map((paragraph) => (
            <p
              key={paragraph}
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}
        </div>

        <div className="narasi-proj">
          <div className="narasi-proj-ttl">Proyeksi Net Income (Full Year)</div>
          <div className="narasi-proj-grid">
            {narasi.projections.map((projection) => (
              <div key={projection.yr} className="npg-item">
                <div className="npg-yr">{projection.yr}</div>
                <div className="npg-val">{projection.val}</div>
                <div className={`npg-grw ${projection.cls}`}>
                  {projection.grw}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="narasi-trigger">
          <div className="narasi-trig-ttl">Trigger Konfirmasi & Peringatan</div>
          <div className="narasi-trig-grid">
            {narasi.triggerConfirm.map((item) => (
              <div key={item} className="ntrig">
                <div
                  className="ntrig-dot"
                  style={{ background: "var(--green)" }}
                />
                <div>{item}</div>
              </div>
            ))}
            {narasi.triggerAlert.map((item) => (
              <div key={item} className="ntrig">
                <div
                  className="ntrig-dot"
                  style={{ background: "var(--red)" }}
                />
                <div>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="followup-hdr">
          <div>
            <div className="followup-ttl">Follow-up Log</div>
            <div className="mt-0.5 text-[11px] text-grove-muted">
              {narasi.followups.length} update setelah narasi awal
              dipublikasikan
            </div>
          </div>
        </div>
        <div className="followup-log">
          {narasi.followups.length === 0 ? (
            <div className="rounded-grove-2 border border-grove-border bg-grove-bg2 p-5 text-center">
              <p className="text-[12px] text-grove-muted">
                Follow-up pertama akan muncul setelah ada rilis laporan keuangan
                atau perubahan fundamental yang signifikan.
              </p>
            </div>
          ) : (
            narasi.followups.map((followup) => (
              <div key={followup.title} className="fu-entry">
                <div className="fu-entry-top">
                  <div>
                    <div className="fu-date">{followup.date}</div>
                    <div className="fu-title">{followup.title}</div>
                  </div>
                  <span className={`fu-badge ${followup.type}`}>
                    {followup.type === "confirm"
                      ? "✓ THESIS CONFIRMED"
                      : followup.type === "revise"
                        ? "↻ THESIS REVISED"
                        : followup.type === "watch"
                          ? "◎ MONITORING"
                          : "⚠ ALERT"}
                  </span>
                </div>
                <div className="fu-entry-body">
                  {followup.body.map((item) => (
                    <div
                      key={item}
                      className="fu-body-txt"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                  {followup.metrics && followup.metrics.length > 0 && (
                    <div className="fu-metrics">
                      {followup.metrics.map((metric) => (
                        <div key={metric.lbl} className="fu-metric">
                          <strong>{metric.lbl}:</strong> {metric.val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rpt-disclaimer">
        <div className="rpt-disclaimer-title">Disclaimer</div>
        <div className="rpt-disclaimer-body">
          Proyeksi di atas adalah estimasi internal tim riset Grove berdasarkan
          model keuangan dan asumsi makro yang dapat berubah. Bukan merupakan
          ajakan beli atau jual. Semua angka FY 2026E dan seterusnya adalah
          proyeksi, bukan data historis. Follow-up akan diperbarui setelah
          setiap rilis laporan keuangan signifikan.
        </div>
      </div>
    </section>
  );
}
