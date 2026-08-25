import ReturnToWorld from "../ReturnToWorld";

export default function AboutNovelPage() {
  return (
    <main>
      <section className="section">
        <p className="sectionMark">О романе</p>
        <div className="sectionBody">
          <p className="eyebrow">Там, где умирает Явь</p>
          <h1 style={{ fontSize: "clamp(52px,8vw,104px)", fontWeight: 400, lineHeight: .95, letterSpacing: "-.045em", margin: "0 0 22px" }}>Там, где умирает Явь</h1>
          <p style={{ maxWidth: 780, fontSize: "clamp(20px,2.4vw,30px)", lineHeight: 1.45, color: "#c8bdab", margin: "0 0 54px" }}>
            Тёмное славянское фэнтези о мире, в котором древние правила перестали работать.
          </p>

          <div style={{ maxWidth: 880, fontSize: 18, lineHeight: 1.8, color: "#aaa397" }}>
            <p>Между Явью, Навью и Правью существует Межа — древняя граница, удерживающая людей, мёртвых и богов на своих местах.</p>
            <p style={{ color: "#ddd2bd", fontSize: 24, fontStyle: "italic", margin: "26px 0" }}>Так было всегда.</p>
            <p>Пока однажды мёртвые не начали помнить то, что должны были забыть, лесные твари — нарушать собственные правила, а на Алатыре не появилась первая трещина.</p>
            <p>Владимир, молодой охотник из Яви, отправляется в дорогу, которая должна была привести его всего лишь в Город. Вместо этого она приводит его к существам Нави, немой девушке из Прави, ведьме, способной менять лицо, и тайне собственного происхождения.</p>
            <p>Чем тоньше становится Межа, тем труднее понять, кто в этой истории действительно несёт тьму. И почему сила Владимира защищает живое так, как не должна защищать сила обычного человека.</p>
            <p style={{ color: "#d7cebd", fontSize: 22, lineHeight: 1.65, marginTop: 34 }}><strong>Пока боги пытаются сохранить старый порядок, человеку предстоит решить, стоит ли этот порядок спасать.</strong></p>
          </div>

          <div style={{ marginTop: 70, paddingTop: 42, borderTop: "1px solid rgba(214,196,161,.16)", maxWidth: 980 }}>
            <p className="eyebrow">Что вас ждёт</p>
            <h2 style={{ fontSize: "clamp(38px,5vw,64px)", fontWeight: 400, lineHeight: 1, margin: "0 0 30px" }}>По ту сторону Межи</h2>
            <div style={{ display: "grid", gap: 12, color: "#aaa397", fontSize: 17, lineHeight: 1.65 }}>
              <p style={{ margin: 0 }}>◇ Славянская мифология без простого деления на свет и тьму.</p>
              <p style={{ margin: 0 }}>◇ Три мира со своими законами.</p>
              <p style={{ margin: 0 }}>◇ Существа, которые знают правила лучше людей — пока сами не начинают их нарушать.</p>
              <p style={{ margin: 0 }}>◇ Семейные тайны богов.</p>
              <p style={{ margin: 0 }}>◇ Любовь, в которой почти никто не оказывается тем, кем казался.</p>
              <p style={{ margin: 0 }}>◇ Тайна крови Владимира и причина, по которой рушится Межа.</p>
            </div>
          </div>

          <div id="read-start" style={{ marginTop: 70, padding: "38px 0", borderTop: "1px solid rgba(214,196,161,.16)", borderBottom: "1px solid rgba(214,196,161,.16)", maxWidth: 980 }}>
            <p className="eyebrow">Начало пути</p>
            <h2 style={{ fontSize: "clamp(38px,5vw,64px)", fontWeight: 400, lineHeight: 1, margin: "0 0 18px" }}>Читать роман</h2>
            <p style={{ maxWidth: 760, color: "#8f887d", lineHeight: 1.7, marginBottom: 28 }}>Начало романа появится здесь следующим шагом. Сам текст и объём бесплатного фрагмента добавим отдельно, не меняя эту страницу заново.</p>
            <a className="primary" href="#read-start">Читать начало романа →</a>
          </div>

          <div style={{ marginTop: 42 }}>
            <ReturnToWorld className="secondary" />
          </div>
        </div>
      </section>
    </main>
  );
}
