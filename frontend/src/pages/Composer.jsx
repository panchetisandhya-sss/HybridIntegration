import Circuit from "./Circuit";
import Histogram from "./Histogram";
import "./composer.css";

export default function Composer() {
  return (
    <div className="composer-layout">
      <div className="composer-left">
        <Circuit />
      </div>
      <div className="composer-right">
        <Histogram />
      </div>
    </div>
  );
}

