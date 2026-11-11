"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";

const PcStage = dynamic(() => import("./PcStage"), {
  ssr: false,
  loading: () => <div className="viewer-fallback">3D</div>,
});

export default function BuildViewer({ build }) {
  const t = useTranslations("builder");
  const [mode, setMode] = useState("3d");

  return (
    <div className="viewer-stage">
      <div className="view-toggle">
        <button
          className="tool-btn"
          type="button"
          data-active={mode === "3d" ? "true" : "false"}
          onClick={() => setMode("3d")}
        >
          {t("view3d")}
        </button>
        <button
          className="tool-btn"
          type="button"
          data-active={mode === "2d" ? "true" : "false"}
          onClick={() => setMode("2d")}
        >
          {t("view2d")}
        </button>
      </div>
      <p className="viewer-hint">{t("viewHint")}</p>
      <PcStage build={build} mode={mode} />
    </div>
  );
}
