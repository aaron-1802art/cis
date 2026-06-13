"use client";

/**
 * DotMatrixBackground — Global animated dot-matrix halftone background
 * Renders behind all content. Fixed position, non-interactive.
 */
export function DotMatrixBackground() {
  return (
    <div className="dot-matrix-bg" aria-hidden="true">
      <div className="dot-blob dot-blob-1" />
      <div className="dot-blob dot-blob-2" />
      <div className="dot-blob dot-blob-3" />
      <div className="dot-blob dot-blob-4" />
    </div>
  );
}
