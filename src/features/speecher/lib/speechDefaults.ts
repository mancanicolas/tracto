export interface SpeechTexts {
  encabezado: string;
  cuerpo: string;
  pie: string;
  confidencialidad: string;
}

export const SPEECH_FIELDS = ["encabezado", "cuerpo", "pie", "confidencialidad"] as const;

export const DEFAULT_SPEECH: SpeechTexts = {
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
