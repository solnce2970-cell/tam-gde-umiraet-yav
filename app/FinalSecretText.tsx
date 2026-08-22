const FINAL_SECRET_TEXT = "";

export default function FinalSecretText() {
  return (
    <section className="finalSecret" data-final-secret-text="available" aria-label="Финальный тайный текст">
      <div className="finalSecretMark" aria-hidden="true">◇</div>
      {FINAL_SECRET_TEXT ? <p>{FINAL_SECRET_TEXT}</p> : null}
    </section>
  );
}
