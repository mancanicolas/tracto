export interface PaymentMethods {
  transferencia: { titular: string; cbu: string; alias: string; banco: string };
  efectivo: { rapipago: string; pagoFacil: string };
}

const DEFAULT_PAYMENT_METHODS: PaymentMethods = {
  transferencia: {
    titular: "5OL Servicios S.A.",
    cbu: "0000003100012345678901",
    alias: "5OL.COBRANZA.PRUEBA",
    banco: "Banco de Prueba",
  },
  efectivo: { rapipago: "Convenio 00001", pagoFacil: "Código 00001" },
};

export const PAYMENT_METHODS_MOCK: Record<string, PaymentMethods> = {
  "Banco Nación": {
    transferencia: {
      titular: "5OL Servicios S.A.",
      cbu: "0110000000000011122233",
      alias: "5OL.NACION.PRUEBA",
      banco: "Banco de la Nación Argentina",
    },
    efectivo: { rapipago: "Convenio 10110", pagoFacil: "Código 10110" },
  },
  "Banco Galicia": {
    transferencia: {
      titular: "5OL Servicios S.A.",
      cbu: "0070000000000044455566",
      alias: "5OL.GALICIA.PRUEBA",
      banco: "Banco Galicia",
    },
    efectivo: { rapipago: "Convenio 20070", pagoFacil: "Código 20070" },
  },
  "Banco Provincia": {
    transferencia: {
      titular: "5OL Servicios S.A.",
      cbu: "0140000000000077788899",
      alias: "5OL.PROVINCIA.PRUEBA",
      banco: "Banco de la Provincia de Buenos Aires",
    },
    efectivo: { rapipago: "Convenio 30140", pagoFacil: "Código 30140" },
  },
  "Naranja X": {
    transferencia: {
      titular: "5OL Servicios S.A.",
      cbu: "0300000000000099900011",
      alias: "5OL.NARANJA.PRUEBA",
      banco: "Naranja X",
    },
    efectivo: { rapipago: "Convenio 40300", pagoFacil: "Código 40300" },
  },
};

export function getPaymentMethods(entidad: string): PaymentMethods {
  return PAYMENT_METHODS_MOCK[entidad] ?? DEFAULT_PAYMENT_METHODS;
}
