import ReturnToWorld from "../ReturnToWorld";

export default function AboutNovelPage() {
  return (
    <main>
      <section className="section">
        <p className="sectionMark">О романе</p>
        <div className="sectionBody">
          <p className="eyebrow">Там, где умирает Явь</p>
          <h1 style={{ fontSize: "clamp(52px,8vw,104px)", fontWeight: 400, lineHeight: .95, letterSpacing: "-.045em", margin: "0 0 34px" }}>О романе</h1>
          <div className="sectionIntro" style={{ marginBottom: 34 }}>
            <p><strong>Явь начала забывать собственные законы.</strong></p>
            <p>Мёртвое возвращается не так, как должно. Дороги ведут не туда. На Алатыре появляется трещина, а Межа между Явью, Навью и Правью становится всё тоньше.</p>
            <p>Владимир всю жизнь знал лес и своё место в мире. Но одна дорога приводит его к безмолвной девушке, ведьме из Нави и тайне собственной крови — крови, способной делать то, чего не должен уметь ни один человек.</p>
            <p>Пока древние боги пытаются удержать рушащуюся Межу, Владимир понимает: опаснее всего может быть не то, что вышло из Нави.</p>
            <p>А то, <strong>кем он сам оказался</strong>.</p>
          </div>
          <p style={{ maxWidth: 820, color: "#7f786d", lineHeight: 1.7, marginBottom: 32 }}>Здесь появятся расширенная аннотация и начало романа.</p>
          <ReturnToWorld className="secondary" />
        </div>
      </section>
    </main>
  );
}
