import styles from "./return-to-world.module.css";

type ReturnToWorldProps = {
  className?: string;
};

export default function ReturnToWorld({ className = "" }: ReturnToWorldProps) {
  const classes = [styles.link, className].filter(Boolean).join(" ");

  return (
    <a className={classes} href="/#world">
      Вернуться в мир
    </a>
  );
}
