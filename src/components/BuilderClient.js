"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BUILDER_SLOTS, productName } from "@/lib/categories";
import { checkCompatibility } from "@/lib/compatibility";
import { estimateAllGames, PRESETS, RESOLUTIONS } from "@/lib/fps";
import { formatUzs } from "@/lib/money";
import { useCart } from "./CartStore";
import BuildViewer from "./BuildViewer";

const BUILD_KEY = "pc-market-build-v1";

function emptyBuild() {
  return Object.fromEntries(BUILDER_SLOTS.map((slot) => [slot.key, null]));
}

function loadBuild(products) {
  try {
    const raw = localStorage.getItem(BUILD_KEY);
    if (!raw) return emptyBuild();
    const ids = JSON.parse(raw);
    const build = emptyBuild();
    for (const slot of BUILDER_SLOTS) {
      const id = ids[slot.key];
      build[slot.key] = products.find((p) => p.id === id) ?? null;
    }
    return build;
  } catch {
    return emptyBuild();
  }
}

export default function BuilderClient({ products, games }) {
  const locale = useLocale();
  const t = useTranslations("builder");
  const tSlots = useTranslations("slots");
  const tCompat = useTranslations("compat");
  const cart = useCart();
  const [build, setBuild] = useState(() => emptyBuild());
  const [resolution, setResolution] = useState("1080p");
  const [added, setAdded] = useState(false);
  const catalogKey = useMemo(
    () =>
      `${products.map((item) => item.id).join(",")}|${games.map((item) => item.id).join(",")}`,
    [products, games],
  );
  const productsRef = useRef(products);
  productsRef.current = products;

  useEffect(() => {
    setBuild(loadBuild(productsRef.current));
  }, [catalogKey]);

  function persist(next) {
    setBuild(next);
    const ids = Object.fromEntries(
      BUILDER_SLOTS.map((slot) => [slot.key, next[slot.key]?.id ?? null]),
    );
    localStorage.setItem(BUILD_KEY, JSON.stringify(ids));
  }

  function setSlot(key, id) {
    const product = products.find((item) => item.id === id) ?? null;
    persist({ ...build, [key]: product });
    setAdded(false);
  }

  const report = useMemo(() => checkCompatibility(build), [build]);
  const fpsRows = useMemo(() => {
    if (!build.cpu || !build.gpu) return [];
    return estimateAllGames(build.cpu, build.gpu, games, resolution);
  }, [build.cpu, build.gpu, games, resolution]);

  const total = BUILDER_SLOTS.reduce((sum, slot) => {
    return sum + (build[slot.key]?.priceUzs ?? 0);
  }, 0);

  const filled = BUILDER_SLOTS.filter((slot) => build[slot.key]).length;

  return (
    <div className="builder-page">
      <div className="builder-workbench">
        <section className="builder-slots">
          <h2>{t("slotsTitle")}</h2>
          <p className="lead">
            {t("slotsHelp", { filled, total: BUILDER_SLOTS.length })}
          </p>
          <div className="slot-list">
            {BUILDER_SLOTS.map((slot) => {
              const options = products.filter((p) => p.category === slot.category);
              const current = build[slot.key];
              return (
                <div className="slot" key={slot.key}>
                  <header>
                    <strong>
                      {tSlots(slot.key)}
                      {slot.required ? " *" : ""}
                    </strong>
                    {current ? (
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => setSlot(slot.key, "")}
                      >
                        {t("clear")}
                      </button>
                    ) : null}
                  </header>
                  <select
                    className="part-select"
                    value={current?.id ?? ""}
                    onChange={(event) => setSlot(slot.key, event.target.value)}
                  >
                    <option value="">{t("emptySlot")}</option>
                    {options.map((product) => (
                      <option key={product.id} value={product.id}>
                        {productName(product, locale)} — {formatUzs(product.priceUzs, locale)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </section>
        <BuildViewer build={build} />
      </div>
      <div className="builder-layout">
      <aside>
        {report.errors.map((item) => (
          <div className="banner bad" key={item.code}>
            <strong>{tCompat("errors")}: </strong>
            {tCompat(item.code)}
          </div>
        ))}
        {report.warnings.map((item) => (
          <div className="banner warn" key={item.code}>
            <strong>{tCompat("warnings")}: </strong>
            {tCompat(item.code)}
          </div>
        ))}
        {report.ready ? <div className="banner ok">{t("ready")}</div> : null}

        <div className="hero-panel">
          <h2>{t("power")}</h2>
          <p>
            {t("draw")}: {report.draw} W
          </p>
          <p>
            {t("recommended")}: {report.recommendedPsu} W
          </p>
          <p className="price">{t("total")}: {formatUzs(total, locale)}</p>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!report.ready}
            onClick={() => {
              const parts = BUILDER_SLOTS.map((s) => build[s.key]).filter(Boolean);
              cart.addMany(parts);
              setAdded(true);
            }}
          >
            {added ? t("addedBuild") : t("addBuild")}
          </button>
          {!report.ready ? <p>{t("notReady")}</p> : null}
        </div>

      </aside>
      <aside>
        <div className="hero-panel">
          <h2>{t("fpsTitle")}</h2>
          <p>{t("fpsNote")}</p>
          <label>
            {t("resolution")}
            <select
              className="part-select"
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
            >
              {RESOLUTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          {!build.cpu || !build.gpu ? (
            <p>{t("needCpuGpu")}</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table className="fps-table">
                <thead>
                  <tr>
                    <th>{t("game")}</th>
                    {PRESETS.map((preset) => (
                      <th key={preset}>
                        {t(
                          `preset${preset[0].toUpperCase()}${preset.slice(1)}`,
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fpsRows.map(({ game, estimate }) => (
                    <tr key={game.slug}>
                      <td>{locale === "uz" ? game.nameUz : game.nameRu}</td>
                      {PRESETS.map((preset) => (
                        <td className="num" key={preset}>
                          {estimate[preset].fps}
                          {estimate[preset].notes.includes("vram") ? (
                            <div className="note-chip">{t("vram")}</div>
                          ) : null}
                          {estimate[preset].notes.includes("cpu_bound") ? (
                            <div className="note-chip">{t("cpuBound")}</div>
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </aside>
      </div>
    </div>
  );
}
