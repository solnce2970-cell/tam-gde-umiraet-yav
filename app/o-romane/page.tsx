import type { Metadata } from "next";
import ReturnToWorld from "../ReturnToWorld";

export const metadata: Metadata = {
  title: "О романе",
  description: "Тёмное славянское фэнтези о мире, где древние правила начали лгать.",
};

const divider = {
  width: "100%",
  maxWidth: 980,
  height: 1,
  margin: "42px 0",
  background: "rgba(214,196,161,.16)",
};

export default function AboutNovelPage() {
  return (
    <main>
      <section className="section">
        <p className="sectionMark">О романе</p>
        <div className="sectionBody">
          <p className="eyebrow">Там, где умирает Явь</p>
          <h1 style={{ fontSize: "clamp(52px,8vw,104px)", fontWeight: 400, lineHeight: .95, letterSpacing: "-.045em", margin: "0 0 22px" }}>
            Там, где умирает Явь
          </h1>
          <p style={{ maxWidth: 820, fontSize: "clamp(20px,2.4vw,30px)", lineHeight: 1.45, color: "#c8bdab", margin: "0" }}>
            <strong>Тёмное славянское фэнтези о мире, где древние правила начали лгать.</strong>
          </p>

          <div style={divider} />

          <div style={{ maxWidth: 900, fontSize: 18, lineHeight: 1.82, color: "#aaa397" }}>
            <p style={{ color: "#ddd2bd", fontSize: 25, marginTop: 0 }}>Межа держала всё.</p>
            <p>Тонкая, незримая, старше памяти — она разделяла Явь и Навь, живых и мёртвых, тепло очага и то, что скребётся за порогом. Над ними стояла Правь: мир богов, закона и порядка, который никто не смел оспорить.</p>
            <p style={{ color: "#ddd2bd", fontSize: 24, fontStyle: "italic", margin: "26px 0 8px" }}>Так было всегда.</p>
            <p style={{ color: "#ddd2bd", fontSize: 24, fontStyle: "italic", margin: "8px 0 28px" }}>Так было — до этой зимы.</p>
            <p>Мёртвые начали <strong style={{ color: "#ddd2bd" }}>помнить</strong>. Имена. Лица. Обиды. То, что забывается на переправе — и не возвращается никогда.<br />Лесная нечисть перестала соблюдать собственные уговоры: не берёт положенную плату, не отпускает, когда назовёшь верное слово, приходит туда, куда ей ходу нет.<br />А на Алатыре — камне, на котором стоит мироздание, — проступила первая трещина.</p>
            <p style={{ color: "#ddd2bd", fontSize: 22, marginBottom: 8 }}>Тонкая, как волос.</p>
            <p style={{ color: "#ddd2bd", fontSize: 22, marginTop: 0 }}>Пока ещё тонкая.</p>
          </div>

          <div style={divider} />

          <div style={{ maxWidth: 900, fontSize: 18, lineHeight: 1.82, color: "#aaa397" }}>
            <p><strong style={{ color: "#ddd2bd" }}>Владимир</strong> — молодой охотник из глухой деревни. Он умеет читать след, ставить силки и уходить от беды до темноты. Он собирался всего лишь дойти до Города.</p>
            <p style={{ color: "#ddd2bd", fontSize: 24, fontStyle: "italic", margin: "26px 0" }}>Дорога решила иначе.</p>
            <p>Она приведёт его к тварям, которые знают его имя раньше, чем он представится. К немой девушке, чей взгляд слишком спокоен для смертной, — и слишком печален для богини. К ведьме, что меняет лица так же легко, как другие меняют рубахи, и ни одно из них не настоящее.</p>
            <p style={{ color: "#ddd2bd", fontSize: 22 }}>И — к правде о собственной крови.</p>
            <p>Потому что сила Владимира защищает живое так, как не должна защищать сила обычного человека. Навь чует это. Правь — тоже.</p>
            <p style={{ color: "#ddd2bd", fontSize: 22 }}>И кто-то из них уже идёт за ним.</p>
          </div>

          <div style={divider} />

          <div style={{ maxWidth: 900, fontSize: 18, lineHeight: 1.82, color: "#aaa397" }}>
            <p>Чем тоньше Межа, тем сложнее вопрос: <strong style={{ color: "#ddd2bd" }}>кто в этой истории на самом деле несёт тьму?</strong></p>
            <p>Мёртвые, которые всего лишь хотят, чтобы их помнили?<br />Твари, впервые в жизни поступившие по-своему?<br />Или боги, готовые сжечь мир дотла — лишь бы он остался прежним?</p>
            <p style={{ color: "#ddd2bd", fontSize: 22, marginBottom: 8 }}>Боги спасают порядок.</p>
            <p style={{ color: "#ddd2bd", fontSize: 22, marginTop: 0 }}>Человеку предстоит решить, <strong>стоит ли этот порядок спасения</strong>.</p>
          </div>

          <div style={divider} />

          <div style={{ maxWidth: 980 }}>
            <h2 style={{ fontSize: "clamp(38px,5vw,64px)", fontWeight: 400, lineHeight: 1, margin: "0 0 30px" }}>По ту сторону Межи вас ждёт</h2>
            <div style={{ display: "grid", gap: 18, maxWidth: 900, color: "#aaa397", fontSize: 17, lineHeight: 1.72 }}>
              <p style={{ margin: 0 }}>◇ <strong style={{ color: "#ddd2bd" }}>Славянская мифология без белого и чёрного</strong> — здесь у чудовищ есть причины, а у богов совесть в дефиците.</p>
              <p style={{ margin: 0 }}>◇ <strong style={{ color: "#ddd2bd" }}>Три мира, три закона</strong> — и ни один из них больше не работает так, как обещал.</p>
              <p style={{ margin: 0 }}>◇ <strong style={{ color: "#ddd2bd" }}>Существа, которые знают правила лучше людей</strong> — пока не начинают их нарушать. И это страшнее любого клыка.</p>
              <p style={{ margin: 0 }}>◇ <strong style={{ color: "#ddd2bd" }}>Семейные тайны богов</strong> — те, за которые расплачиваются смертные.</p>
              <p style={{ margin: 0 }}>◇ <strong style={{ color: "#ddd2bd" }}>Любовь, в которой почти никто не тот, кем казался</strong> — и от этого только больнее.</p>
              <p style={{ margin: 0 }}>◇ <strong style={{ color: "#ddd2bd" }}>Тайна крови Владимира</strong> — сила, которой у человека быть не должно. И вопрос, человек ли он вообще.</p>
            </div>
          </div>

          <div style={divider} />

          <blockquote style={{ maxWidth: 900, margin: "0", padding: "4px 0 4px 28px", borderLeft: "1px solid rgba(214,196,161,.34)", color: "#c8bdab", fontSize: "clamp(20px,2.4vw,28px)", lineHeight: 1.65 }}>
            Межа истончается.<br />
            Мёртвые вспоминают.<br />
            Алатырь трещит.<br /><br />
            <strong style={{ color: "#eee5d5" }}>А ты всё ещё думаешь, что боги на твоей стороне?</strong>
          </blockquote>

          <div style={{ marginTop: 48 }}>
            <ReturnToWorld className="secondary" />
          </div>
        </div>
      </section>
    </main>
  );
}
