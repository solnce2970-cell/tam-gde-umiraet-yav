# Архитектура знаков Межи

- `lib/anomalies/registry.ts` — единственный упорядоченный registry 13 знаков.
- Активны 9 знаков; `lada-third`, `semargl-svarog`, `silent-path`, `return-to-beginning` зарезервированы и не могут попасть в `found`.
- `lib/anomalies/store.ts` — versioned store `yav-anomalies-v3`, transient store в `sessionStorage` и idempotent `unlockSign(id)`.
- Все игровые триггеры только вызывают `unlockSign(id)`; массив `found` дополняется только в `unlockSignInState` и сохраняет фактический порядок открытия.
- `/za-mezhoy` читает прогресс, `/larets-predaniy` читает награды; обе страницы не пишут state.
- Аук, Макошь и Шишига хранят незавершённые попытки в transient state. Просмотр route сам по себе ничего не открывает.
- `?anomaly-debug=1` включает тестовую панель. Её явный сброс очищает v3 state и transient state.

Версия v3 намеренно начинает тестовый прогресс заново и не читает старые `yav-anomalies-v1` / `yav-larets-predaniy-v1`.
