import QRCode from "qrcode";

export async function makeQrData(value, size = 220) {
  if (!value) return "";
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    width: size,
    margin: 1,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
}
