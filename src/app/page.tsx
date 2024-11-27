import CanvasComponentGraph from "@/components/logic-third/canvas-component-graph";
import styles from "./page.module.css";
import CanvasComponentGrid from "@/components/logic-astar/canvas-component-grid";



export default function Home() {
  return (
    <div className={styles.page}>
      <CanvasComponentGrid />
      <CanvasComponentGraph />
    </div>
  );
}
