import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { DEFAULT_PRODUCT, getEntityCatalog, getPaymentMethods } from "@/constants/entidades";
import { buildConvenioDefinition, type ConvenioCase } from "./convenio";
import type { Agreement, Installment } from "./types";

const TEST_FILE_NAME = "test_convenios_todos.pdf";
const TEST_TODAY = "2026-10-04";
const TEST_DEBTOR = { nombre: "Juan Pérez", dni: "30.123.456", cartera: "Cartera Test" };
const PARTIAL_AMOUNT_CENTS = 15000000;
const INSTALLMENT_AMOUNT_CENTS = 10000000;
const INSTALLMENT_DATES = ["2026-10-15", "2026-11-15", "2026-12-15"];
const FORBIDDEN_TOKENS = ["undefined", "null", "NaN", "[object"];

interface TestScenario {
  entidad: string;
  producto: string;
  label: string;
  agreement: Agreement;
}

function installment(id: string, fields: Partial<Installment> & Pick<Installment, "tipo" | "monto" | "fecha">): Installment {
  return { id, pagada: false, countedInStats: true, ...fields };
}

function partialAgreement(producto: string): Agreement {
  return {
    id: "test-parcial",
    creado: TEST_TODAY,
    tipo: "parcial",
    producto,
    cuotas: [installment("p1", { tipo: "parcial", monto: PARTIAL_AMOUNT_CENTS, fecha: "2026-10-30" })],
  };
}

function installmentsAgreement(producto: string): Agreement {
  return {
    id: "test-cuotas",
    creado: TEST_TODAY,
    tipo: "cuotas",
    producto,
    cuotas: INSTALLMENT_DATES.map((fecha, index) =>
      installment(`c${index + 1}`, { tipo: "cuota", numero: index + 1, monto: INSTALLMENT_AMOUNT_CENTS, fecha }),
    ),
  };
}

function buildScenarios(): TestScenario[] {
  return Object.entries(getEntityCatalog()).flatMap(([entidad, config]) =>
    (config.productos.length > 0 ? config.productos : [DEFAULT_PRODUCT]).flatMap((producto) => {
      const name = producto === DEFAULT_PRODUCT ? entidad : `${entidad} ${producto}`;
      return [
        { entidad, producto, label: `${name} - pago parcial`, agreement: partialAgreement(producto) },
        { entidad, producto, label: `${name} - cuotas`, agreement: installmentsAgreement(producto) },
      ];
    }),
  );
}

function buildTestCase(entidad: string): ConvenioCase {
  return { id: "test-case", etiquetas: [], notas: [], ...TEST_DEBTOR, entidad };
}

function assertScenarioIsComplete(scenario: TestScenario, definition: TDocumentDefinitions): void {
  const serialized = JSON.stringify(definition.content);
  const forbidden = FORBIDDEN_TOKENS.find((token) => serialized.includes(token));
  if (forbidden) throw new Error(`${scenario.label}: el convenio contiene "${forbidden}".`);
  if (getPaymentMethods(scenario.entidad, scenario.agreement.producto).length === 0) {
    throw new Error(`${scenario.label}: no tiene medios de pago configurados.`);
  }
}

export function buildAllConveniosDefinition(): TDocumentDefinitions {
  const scenarios = buildScenarios();
  const definitions = scenarios.map((scenario) => {
    const definition = buildConvenioDefinition(buildTestCase(scenario.entidad), scenario.agreement, TEST_TODAY);
    assertScenarioIsComplete(scenario, definition);
    return definition;
  });
  const [first] = definitions;
  if (!first) throw new Error("No hay entidades configuradas.");
  const pages = definitions.map((definition, index): Content => {
    const content = Array.isArray(definition.content) ? definition.content : [definition.content];
    return index === 0 ? { stack: content } : { stack: content, pageBreak: "before" };
  });
  return { ...first, content: pages };
}

function triggerBrowserDownload(bytes: Uint8Array, fileName: string): void {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function generateTestConvenios(): Promise<number> {
  const [{ default: pdfMake }, { default: vfs }] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  pdfMake.addVirtualFileSystem(vfs);
  const buffer = await pdfMake.createPdf(buildAllConveniosDefinition()).getBuffer();
  triggerBrowserDownload(new Uint8Array(buffer), TEST_FILE_NAME);
  return buildScenarios().length;
}
