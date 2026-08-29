"use client";

import { useLayoutEffect } from "react";

const STYLE_ID = "home-universe-layer-styles";
const ROOT_ID = "home-universe-intro";

const styles = `
#${ROOT_ID}{
  position:relative;
  isolation:isolate;
  overflow:hidden;
  width:min(1180px,90vw);
  margin:84px auto 34px;
  padding:clamp(34px,5vw,62px);
  border:1px solid rgba(214,196,161,.16);
  background:
    radial-gradient(circle at 18% 22%,rgba(185,147,90,.07),transparent 24%),
    radial-gradient(circle at 78% 72%,rgba(126,154,118,.05),transparent 28%),
    linear-gradient(145deg,rgba(18,24,20,.96),rgba(8,12,9,.985));
  color:#e7dfcf;
  box-shadow:0 24px 80px rgba(0,0,0,.2);
}
#${ROOT_ID} .universe-copy{position:relative;z-index:2;max-width:920px;margin:0 auto}
#${ROOT_ID} .universe-kicker{margin:0 0 12px;color:#b9935a;font:10px/1.3 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase}
#${ROOT_ID} h2{margin:0 0 30px;font:400 clamp(38px,5vw,66px)/1.02 Georgia,serif;color:#eee5d5;letter-spacing:-.025em}
#${ROOT_ID} .universe-text{display:grid;gap:18px;color:#aaa397;font:400 17px/1.82 Georgia,serif}
#${ROOT_ID} .universe-text p{margin:0}
#${ROOT_ID} .universe-text strong{color:#ddd2bd;font-weight:400}
#${ROOT_ID} .universe-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
#${ROOT_ID} .universe-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:12px 18px;border:1px solid rgba(213,192,154,.34);color:#d8c69f;text-decoration:none;font:10px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;background:rgba(8,12,9,.42);transition:border-color .25s ease,background .25s ease,transform .25s ease}
#${ROOT_ID} .universe-actions a:hover,#${ROOT_ID} .universe-actions a:focus-visible{border-color:rgba(222,195,137,.68);background:rgba(185,147,90,.07);transform:translateY(-1px)}
#${ROOT_ID} .fireflies{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
#${ROOT_ID} .fireflies i{position:absolute;width:4px;height:4px;border-radius:50%;background:#e9c875;box-shadow:0 0 8px rgba(233,200,117,.82),0 0 18px rgba(233,200,117,.34);opacity:.12;animation:universeFirefly var(--d,5.8s) ease-in-out infinite;animation-delay:var(--delay,0s);transform:translate3d(0,0,0)}
#${ROOT_ID} .fireflies i:nth-child(1){left:7%;top:19%;--d:6.2s;--delay:-1.1s}#${ROOT_ID} .fireflies i:nth-child(2){left:15%;top:72%;--d:5.1s;--delay:-3.6s}#${ROOT_ID} .fireflies i:nth-child(3){left:24%;top:37%;--d:7.4s;--delay:-2.2s}#${ROOT_ID} .fireflies i:nth-child(4){left:31%;top:83%;--d:5.7s;--delay:-4.1s}#${ROOT_ID} .fireflies i:nth-child(5){left:41%;top:15%;--d:6.8s;--delay:-.8s}#${ROOT_ID} .fireflies i:nth-child(6){left:47%;top:63%;--d:5.4s;--delay:-2.9s}#${ROOT_ID} .fireflies i:nth-child(7){left:56%;top:31%;--d:7.1s;--delay:-5.2s}#${ROOT_ID} .fireflies i:nth-child(8){left:63%;top:78%;--d:6s;--delay:-1.7s}#${ROOT_ID} .fireflies i:nth-child(9){left:72%;top:18%;--d:5.2s;--delay:-3.1s}#${ROOT_ID} .fireflies i:nth-child(10){left:79%;top:55%;--d:7.2s;--delay:-4.8s}#${ROOT_ID} .fireflies i:nth-child(11){left:88%;top:29%;--d:5.9s;--delay:-2.5s}#${ROOT_ID} .fireflies i:nth-child(12){left:92%;top:76%;--d:6.6s;--delay:-.3s}#${ROOT_ID} .fireflies i:nth-child(13){left:11%;top:48%;--d:7.6s;--delay:-5.6s}#${ROOT_ID} .fireflies i:nth-child(14){left:36%;top:51%;--d:5.6s;--delay:-2.1s}#${ROOT_ID} .fireflies i:nth-child(15){left:52%;top:90%;--d:6.9s;--delay:-4.5s}#${ROOT_ID} .fireflies i:nth-child(16){left:68%;top:44%;--d:5.3s;--delay:-1.4s}#${ROOT_ID} .fireflies i:nth-child(17){left:84%;top:89%;--d:7.3s;--delay:-3.9s}#${ROOT_ID} .fireflies i:nth-child(18){left:96%;top:42%;--d:6.1s;--delay:-2.7s}
@keyframes universeFirefly{0%,100%{opacity:.08;transform:translate3d(-3px,4px,0) scale(.65)}38%{opacity:.72;transform:translate3d(5px,-7px,0) scale(1)}62%{opacity:.24;transform:translate3d(10px,-1px,0) scale(.8)}}
[data-extra-roads] > div{align-items:stretch}
[data-extra-roads] a[data-road-card]{display:flex!important;flex-direction:column;gap:0!important;padding:0!important;overflow:hidden;background:rgba(7,11,8,.58)}
[data-extra-roads] .road-image{position:relative;aspect-ratio:16/9;overflow:hidden;background:#090c0a;border-bottom:1px solid rgba(214,196,161,.13)}
[data-extra-roads] .road-image:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 52%,rgba(5,8,6,.42))}
[data-extra-roads] .road-image img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .55s ease,filter .55s ease;filter:saturate(.8) contrast(1.02) brightness(.82)}
[data-extra-roads] a[data-road-card]:hover .road-image img,[data-extra-roads] a[data-road-card]:focus-visible .road-image img{transform:scale(1.025);filter:saturate(.92) contrast(1.04) brightness(.9)}
[data-extra-roads] .road-copy{display:grid;gap:9px;padding:22px}
[data-extra-roads] .road-copy span{color:#8f887d;font:9px/1.3 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}
[data-extra-roads] .road-copy b{font:400 24px/1.2 Georgia,serif;color:#e3dacb}
@media(max-width:620px){#${ROOT_ID}{width:calc(100% - 28px);margin:54px 14px 28px;padding:30px 20px}#${ROOT_ID} h2{font-size:clamp(36px,11vw,52px)}#${ROOT_ID} .universe-text{font-size:16px;line-height:1.72}#${ROOT_ID} .fireflies i:nth-child(n+13){display:none}[data-extra-roads] .road-copy b{font-size:22px}}
@media(prefers-reduced-motion:reduce){#${ROOT_ID} .fireflies i{animation:none;opacity:.18}[data-extra-roads] .road-image img{transition:none}}
`;

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = styles;
  document.head.appendChild(style);
}

function addIntro() {
  if (document.getElementById(ROOT_ID)) return;
  const hero = document.querySelector<HTMLElement>("main > .hero");
  const world = document.querySelector<HTMLElement>("#world");
  if (!hero || !world) return;

  const section = document.createElement("section");
  section.id = ROOT_ID;
  section.setAttribute("aria-labelledby", "universe-intro-title");
  section.innerHTML = `
    <div class="fireflies" aria-hidden="true">${Array.from({ length: 18 }, () => "<i></i>").join("")}</div>
    <div class="universe-copy">
      <p class="universe-kicker">Вселенная романа</p>
      <h2 id="universe-intro-title">Там, где умирает Явь</h2>
      <div class="universe-text">
        <p>Между Явью и Навью стояла Межа. По одну сторону — живые; по другую — мёртвые и то, что остаётся от памяти. Правь держалась отдельно: мир богов и древнего закона. Так было всегда.</p>
        <p>Но что-то изменилось. Существа из старых преданий ведут себя не так, как должны. Дороги уводят не туда. Обереги, которым доверяли поколениями, перестают работать. Явь начала забывать собственные законы. <strong>Значит, Межа истончается.</strong></p>
        <p>Этот сайт — пространство, в котором живёт вселенная «Там, где умирает Явь». Здесь есть Навник с существами из легенд, родословная богов, страницы персонажей, музыка, написанная для этого мира, — и скрытые предания, фрагменты памяти, которые хранит только этот мир.</p>
        <p>В разных местах сайта спрятаны тринадцать Знаков Межи — следы тех мгновений, когда привычный порядок дал трещину. Некоторые заметны сразу, другие — только если смотреть внимательнее. Тем, кто найдёт все, откроются тайные сказания. Вселенная выросла из романа — о нём рассказывает страница «О романе».</p>
      </div>
      <div class="universe-actions"><a href="/o-romane">О романе →</a></div>
    </div>`;
  hero.insertAdjacentElement("afterend", section);
}

function removeDuplicateGenealogyBlock() {
  document.querySelector<HTMLElement>("#world .genealogyBlock")?.remove();
}

function enhanceRoads() {
  const aside = Array.from(document.querySelectorAll<HTMLElement>("aside")).find((node) =>
    node.querySelector("h2")?.textContent?.trim() === "За пределами основной летописи",
  );
  if (!aside) return;
  aside.dataset.extraRoads = "true";

  const cards = Array.from(aside.querySelectorAll<HTMLAnchorElement>(":scope > div > a"));
  const config = [
    { href: "/genealogy", label: "Родословная", title: "Лики богов ↗", src: "/images/genealogy-yav.webp", alt: "Родословная богов мира «Там, где умирает Явь»" },
    { href: "/larets-predaniy", label: "Архив наград", title: "Ларец преданий ↗", src: "/images/larets/ogneyara i semargl dom.webp", alt: "Иллюстрация из Ларца преданий" },
  ];

  cards.forEach((card, index) => {
    const item = config[index];
    if (!item) return;
    card.dataset.roadCard = "true";
    card.href = item.href;
    card.innerHTML = `
      <div class="road-image"><img src="${item.src}" alt="${item.alt}" /></div>
      <div class="road-copy"><span>${item.label}</span><b>${item.title}</b></div>`;
  });
}

export default function HomeUniverseLayer() {
  useLayoutEffect(() => {
    if (window.location.pathname !== "/") return;
    ensureStyles();
    addIntro();
    removeDuplicateGenealogyBlock();
    enhanceRoads();
  }, []);

  return null;
}
