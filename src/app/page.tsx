import Image from "next/image";
import styles from "./page.module.css";
import CanvasComponent from "@/components/logic/canvas-component";
import CanvasComponentTest from "@/components/logic-two/test";
import CanvasComponentThird from "@/components/logic-third/logic-third";
import CanvasComponentAstar from "@/components/logic-astar/astarComponent";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* <CanvasComponent /> */}
      {/* <CanvasComponentTest /> */}
      <CanvasComponentThird />
      {/* <CanvasComponentAstar /> */}
    </div>
  );
}
