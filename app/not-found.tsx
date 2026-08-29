import ReturnToWorld from "./ReturnToWorld";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <p>Дорога оборвалась</p>
        <h1>Этой тропы нет на карте.</h1>
        <span>Возможно, Межа успела стереть её — или здесь никогда не было пути.</span>
        <ReturnToWorld />
      </div>
    </main>
  );
}
