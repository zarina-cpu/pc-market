export function formatUzs(amount, locale) {
  const formatted = new Intl.NumberFormat(
    locale === "uz" ? "uz-UZ" : "ru-RU",
  ).format(amount);
  return locale === "uz" ? `${formatted} so'm` : `${formatted} сум`;
}
