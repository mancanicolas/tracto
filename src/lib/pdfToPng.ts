import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const RENDER_SCALE = 2.5;
const BACKGROUND_COLOR = "#FFFFFF";

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar la imagen."));
        return;
      }
      void blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)), reject);
    }, "image/png");
  });
}

export async function renderPdfToPng(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const document = await pdfjs.getDocument({ data: pdfBytes.slice() }).promise;
  const pageCanvases: HTMLCanvasElement[] = [];

  for (let number = 1; number <= document.numPages; number += 1) {
    const page = await document.getPage(number);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la imagen.");
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    pageCanvases.push(canvas);
  }

  const [firstPage] = pageCanvases;
  if (!firstPage) throw new Error("El convenio no tiene páginas.");
  if (pageCanvases.length === 1) return canvasToPngBytes(firstPage);

  const combined = window.document.createElement("canvas");
  combined.width = Math.max(...pageCanvases.map((canvas) => canvas.width));
  combined.height = pageCanvases.reduce((sum, canvas) => sum + canvas.height, 0);
  const context = combined.getContext("2d");
  if (!context) throw new Error("No se pudo preparar la imagen.");
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, combined.width, combined.height);
  let offset = 0;
  for (const canvas of pageCanvases) {
    context.drawImage(canvas, 0, offset);
    offset += canvas.height;
  }
  return canvasToPngBytes(combined);
}
