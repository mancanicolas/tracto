export type PdfPresetId = "normal" | "suave";

export const PDF_PRESET_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "suave", label: "Suave" },
];

export interface SpeechTexts {
  preset: PdfPresetId;
  encabezado: string;
  cuerpo: string;
  pie: string;
  confidencialidad: string;
}

export const SPEECH_FIELDS = ["encabezado", "cuerpo", "pie", "confidencialidad"] as const;

export const DEFAULT_SPEECH: SpeechTexts = {
  preset: "normal",

  encabezado: `{TRATO} {NOMBRE}  -  DNI {DNI}
CIERRE DE ETAPA CONCILIATORIA - {MES} {ANIO}`,

  cuerpo: `Tomando el tiempo transcurrido como negativa de pago de su parte respecto a la mora originada con {CARTERA}, cumplimos en informarle que se dará por concluida esta etapa conciliatoria el **{FECHA}**.

No obstante, nuestra intención no es perjudicarlo ni que siga excluido del sistema financiero. Pensamos que usted quizás quiera llegar a un acuerdo sin necesidad de judicializar el cobro, ya que le sumaría más gastos a su cargo como honorarios y tasa de justicia. Es por ello que lo invitamos a encontrar una solución a su problema, pudiendo:

-Ingresar al plan de cuotas sin interés
-Consultar quita de intereses y punitorios
-Elevar su propuesta de pago para que sea evaluada

En caso de no tener respuesta, deberemos recomendar a nuestro cliente que avance con la tramitación —ante Juzgado Civil y Comercial— del pedido de embargo sobre:

-{LABORAL}
-Cuentas bancarias y/o billeteras virtuales vinculadas a su CUIL/CUIT

Con fines de solucionar el conflicto quedamos atentos a su respuesta:

-ESCRIBIENDO AL: {OPERADOR}
-LLAMANDO AL TELÉFONO FIJO: (011) 6091 8325 interno {INTERNO} de 8 a 20:00 horas

Sin más, saludamos atte.`,

  pie: `5 Online SRL
Gestión integral digital
info@5ol.com.ar
5ol.com.ar`,

  confidencialidad: `> **Confidencialidad:** si recibió este mensaje por error le pedimos disculpas, infórmelo para quitar su número telefónico.`,
};

export const SOFT_SPEECH: SpeechTexts = {
  preset: "suave",

  encabezado: `{NOMBRE}  -  DNI {DNI}
Notificación por incumplimiento reiterado`,

  cuerpo: `Nos comunicamos con el objetivo de informarte que actualmente te encontrás en la última instancia, hasta el **{FECHA}**, con posibilidades de regularizar tu saldo en deuda originado inicialmente con {CARTERA}.

Mediante:

-✅ Pago único con quita de intereses de hasta un 100%
-✅ Alternativas para regularizar o cancelar tu tarjeta
-✅ Posibilidad de quita extraordinaria, según tu caso

💬 Respondé a este mensaje escribiendo directamente a tu gestor a cargo al {OPERADOR} o llamando al teléfono fijo (011) 6091 8325 interno {INTERNO}

A su vez, te informamos que en caso de no tener respuesta de tu parte deberemos emitir el informe del caso como negativa de pago, procediendo a las acciones consecuentes.

Podés corroborar tu agencia de cobro asignada en el canal oficial de UALA: 15 xxxx xxxxx

Sin más, saludamos atte.`,

  pie: DEFAULT_SPEECH.pie,

  confidencialidad: `> **Confidencialidad:** si recibió este mensaje por error le pedimos disculpas, infórmelo para quitar su número telefónico.`,
};
